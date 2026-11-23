'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import pool, { query } from '@/lib/db';
import { generateDocumentNumber } from '@/lib/formatters';

function parseTransactionItems(productIdsRaw, quantitiesRaw) {
    const productIds = productIdsRaw.map((v) => Number(v));
    const quantities = quantitiesRaw.map((v) => Number(v));
    const items = [];
    const seen = new Set();

    for (let i = 0; i < productIds.length; i += 1) {
        const pid = productIds[i];
        const qty = quantities[i];

        if (!pid || Number.isNaN(qty) || qty <= 0) {
        return { error: 'Setiap baris produk wajib dipilih dengan quantity lebih dari 0.' };
        }

        if (seen.has(pid)) {
        return { error: 'Produk yang sama tidak boleh dipilih dua kali dalam satu transaksi.' };
        }

        seen.add(pid);
        items.push({ productId: pid, quantity: qty });
    }

    if (items.length === 0) {
        return { error: 'Minimal harus terdapat 1 produk dalam transaksi.' };
    }

    return { items };
}

export async function createIncomingTransactionAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['staff_gudang', 'admin'].includes(session.role)) {
        return { error: 'Hanya Staff Gudang atau Admin yang dapat mencatat barang masuk.' };
    }

    const transactionDate = String(formData.get('transaction_date') || '').trim();
    const restockOrderIdRaw = String(formData.get('restock_order_id') || '').trim();
    const restockOrderId = restockOrderIdRaw ? Number(restockOrderIdRaw) : null;
    let supplierId = Number(formData.get('supplier_id'));
    const notes = String(formData.get('notes') || '').trim();

    if (!transactionDate) {
        return { error: 'Tanggal penerimaan wajib diisi.' };
    }

    const parsedItems = parseTransactionItems(
        formData.getAll('product_id'),
        formData.getAll('quantity')
    );
    if (parsedItems.error) {
        return { error: parsedItems.error };
    }

    if (restockOrderId) {
        const poRes = await query(
        'SELECT id, supplier_id, status FROM restock_orders WHERE id = $1 LIMIT 1',
        [restockOrderId]
        );

        if (
        poRes.rows.length === 0 ||
        !['Received', 'Pesanan Diperiksa'].includes(poRes.rows[0].status)
        ) {
        return {
            error: 'Nomor PO tidak valid atau belum berstatus Received / Pesanan Diperiksa.',
        };
        }

        const usedCheck = await query(
        "SELECT id FROM transactions WHERE restock_order_id = $1 AND status <> 'Rejected' LIMIT 1",
        [restockOrderId]
        );

        if (usedCheck.rows.length > 0) {
        return {
            error: 'Nomor PO ini sudah digunakan oleh transaksi barang masuk yang aktif.',
        };
        }

        supplierId = poRes.rows[0].supplier_id;
    } else {
        if (!supplierId) {
        return { error: 'Supplier wajib dipilih apabila tidak menggunakan Nomor PO.' };
        }

        const supCheck = await query(
        "SELECT id FROM users WHERE id = $1 AND role = 'supplier' AND status = 'Approved' LIMIT 1",
        [supplierId]
        );

        if (supCheck.rows.length === 0) {
        return { error: 'Supplier tidak ditemukan atau belum berstatus Approved.' };
        }
    }

    const trxNumber = generateDocumentNumber('TRX-IN');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const trxRes = await client.query(
        `INSERT INTO transactions (
            transaction_number, type, transaction_date, restock_order_id,
            supplier_id, notes, status, created_by
        ) VALUES ($1, 'IN', $2, $3, $4, $5, 'Pending', $6)
        RETURNING id`,
        [
            trxNumber,
            transactionDate,
            restockOrderId,
            supplierId,
            notes || null,
            session.id,
        ]
        );

        const transactionId = trxRes.rows[0].id;

        for (const item of parsedItems.items) {
        await client.query(
            'INSERT INTO transaction_items (transaction_id, product_id, quantity) VALUES ($1, $2, $3)',
            [transactionId, item.productId, item.quantity]
        );
        }

        await client.query('COMMIT');
    } catch {
        await client.query('ROLLBACK');
        return { error: 'Gagal menyimpan laporan barang masuk. Pastikan Nomor PO belum terpakai.' };
    } finally {
        client.release();
    }

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');

    return {
        success: `Laporan barang masuk ${trxNumber} berhasil dikirim (status Pending) dan menunggu konfirmasi Manager sebelum stok bertambah.`,
    };
}

export async function createOutgoingTransactionAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['staff_gudang', 'admin'].includes(session.role)) {
        return { error: 'Hanya Staff Gudang atau Admin yang dapat mengajukan barang keluar.' };
    }

    const transactionDate = String(formData.get('transaction_date') || '').trim();
    const customerName = String(formData.get('customer_name') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    if (!transactionDate || !customerName) {
        return { error: 'Tanggal pengiriman dan nama customer/tujuan wajib diisi.' };
    }

    const parsedItems = parseTransactionItems(
        formData.getAll('product_id'),
        formData.getAll('quantity')
    );
    if (parsedItems.error) {
        return { error: parsedItems.error };
    }

    const trxNumber = generateDocumentNumber('TRX-OUT');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const item of parsedItems.items) {
        const prodRes = await client.query(
            'SELECT id, name, stock, unit FROM products WHERE id = $1 FOR UPDATE',
            [item.productId]
        );

        if (prodRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return { error: 'Salah satu produk yang dipilih tidak ditemukan.' };
        }

        const product = prodRes.rows[0];
        if (item.quantity > product.stock) {
            await client.query('ROLLBACK');
            return {
            error: `Quantity ${product.name} (${item.quantity}) melebihi stok tersedia (${product.stock} ${product.unit}).`,
            };
        }
        }

        const trxRes = await client.query(
        `INSERT INTO transactions (
            transaction_number, type, transaction_date, customer_name,
            notes, status, created_by
        ) VALUES ($1, 'OUT', $2, $3, $4, 'Pending', $5)
        RETURNING id`,
        [
            trxNumber,
            transactionDate,
            customerName,
            notes || null,
            session.id,
        ]
        );

        const transactionId = trxRes.rows[0].id;

        for (const item of parsedItems.items) {
        await client.query(
            'INSERT INTO transaction_items (transaction_id, product_id, quantity) VALUES ($1, $2, $3)',
            [transactionId, item.productId, item.quantity]
        );
        }

        await client.query('COMMIT');
    } catch {
        await client.query('ROLLBACK');
        return { error: 'Gagal menyimpan pengajuan barang keluar.' };
    } finally {
        client.release();
    }

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');

    return {
        success: `Pengajuan barang keluar ${trxNumber} berhasil dibuat (status Pending) dan menunggu persetujuan Manager sebelum proses packing.`,
    };
}

export async function editPendingTransactionAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['staff_gudang', 'admin'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin mengubah transaksi ini.' };
    }

    const transactionId = Number(formData.get('transaction_id'));
    const notes = String(formData.get('notes') || '').trim();

    if (!transactionId) {
        return { error: 'ID transaksi tidak valid.' };
    }

    const trxRes = await query(
        'SELECT id, type, status, created_by FROM transactions WHERE id = $1 LIMIT 1',
        [transactionId]
    );

    if (trxRes.rows.length === 0) {
        return { error: 'Transaksi tidak ditemukan.' };
    }

    const trx = trxRes.rows[0];

    if (trx.status !== 'Pending') {
        return { error: 'Hanya transaksi berstatus Pending yang dapat diedit.' };
    }

    if (session.role === 'staff_gudang' && trx.created_by !== session.id) {
        return { error: 'Staff hanya dapat mengedit transaksi yang dibuat sendiri.' };
    }

    const parsedItems = parseTransactionItems(
        formData.getAll('product_id'),
        formData.getAll('quantity')
    );
    if (parsedItems.error) {
        return { error: parsedItems.error };
    }

    if (trx.type === 'OUT') {
        for (const item of parsedItems.items) {
        const prodRes = await query(
            'SELECT name, stock, unit FROM products WHERE id = $1 LIMIT 1',
            [item.productId]
        );
        const product = prodRes.rows[0];
        if (!product || item.quantity > product.stock) {
            return {
            error: `Quantity ${product?.name || 'produk'} melebihi stok tersedia (${product?.stock ?? 0} ${product?.unit || ''}).`,
            };
        }
        }
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
        'UPDATE transactions SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [notes || null, transactionId]
        );

        await client.query('DELETE FROM transaction_items WHERE transaction_id = $1', [
        transactionId,
        ]);

        for (const item of parsedItems.items) {
        await client.query(
            'INSERT INTO transaction_items (transaction_id, product_id, quantity) VALUES ($1, $2, $3)',
            [transactionId, item.productId, item.quantity]
        );
        }

        await client.query('COMMIT');
    } catch {
        await client.query('ROLLBACK');
        return { error: 'Gagal memperbarui transaksi.' };
    } finally {
        client.release();
    }

    revalidatePath('/dashboard/transactions');
    return { success: 'Perubahan transaksi Pending berhasil disimpan.' };
}

export async function deletePendingTransactionAction(transactionId) {
    const session = await getSession();
    if (!session || !['staff_gudang', 'admin'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin menghapus transaksi.' };
    }

    const trxRes = await query(
        'SELECT id, status, created_by FROM transactions WHERE id = $1 LIMIT 1',
        [Number(transactionId)]
    );

    if (trxRes.rows.length === 0) {
        return { error: 'Transaksi tidak ditemukan.' };
    }

    const trx = trxRes.rows[0];

    if (trx.status !== 'Pending') {
        return { error: 'Hanya transaksi berstatus Pending yang dapat dihapus.' };
    }

    if (session.role === 'staff_gudang' && trx.created_by !== session.id) {
        return { error: 'Staff hanya dapat menghapus transaksi yang mereka buat sendiri.' };
    }

    await query('DELETE FROM transactions WHERE id = $1', [Number(transactionId)]);

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard');
    return { success: 'Transaksi Pending berhasil dihapus.' };
}

export async function approveTransactionAction(transactionId) {
    const session = await getSession();
    if (!session || !['warehouse_manager', 'admin'].includes(session.role)) {
        return { error: 'Hanya Warehouse Manager atau Admin yang dapat menyetujui transaksi.' };
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const trxRes = await client.query(
        'SELECT id, type, status FROM transactions WHERE id = $1 FOR UPDATE',
        [Number(transactionId)]
        );

        if (trxRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return { error: 'Transaksi tidak ditemukan.' };
        }

        const trx = trxRes.rows[0];
        if (trx.status !== 'Pending') {
        await client.query('ROLLBACK');
        return { error: 'Transaksi ini sudah diproses sebelumnya.' };
        }

        const itemsRes = await client.query(
        'SELECT product_id, quantity FROM transaction_items WHERE transaction_id = $1',
        [trx.id]
        );

        for (const item of itemsRes.rows) {
        const prodRes = await client.query(
            'SELECT id, name, stock, unit FROM products WHERE id = $1 FOR UPDATE',
            [item.product_id]
        );

        if (prodRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return { error: 'Produk pada item transaksi tidak ditemukan.' };
        }

        const product = prodRes.rows[0];

        if (trx.type === 'IN') {
            await client.query(
            'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [item.quantity, product.id]
            );
        } else if (product.stock < item.quantity) {
            await client.query('ROLLBACK');
            return {
            error: `Approval gagal: stok ${product.name} tersisa ${product.stock} ${product.unit}, tidak cukup untuk pengeluaran ${item.quantity} ${product.unit}.`,
            };
        }
        }

        await client.query(
        `UPDATE transactions
        SET status = 'Approved', approved_by = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [session.id, trx.id]
        );

        await client.query('COMMIT');
    } catch {
        await client.query('ROLLBACK');
        return { error: 'Terjadi kesalahan saat memproses approval transaksi.' };
    } finally {
        client.release();
    }

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');

    return {
        success:
        'Transaksi disetujui. Untuk Barang Masuk stok telah bertambah, sedangkan untuk Barang Keluar siap di-packing dan dikirim oleh Staff.',
    };
}

export async function rejectTransactionAction(transactionId, rejectionReason) {
    const session = await getSession();
    if (!session || !['warehouse_manager', 'admin'].includes(session.role)) {
        return { error: 'Hanya Warehouse Manager atau Admin yang dapat menolak transaksi.' };
    }

    const trimmedReason = String(rejectionReason || '').trim();
    if (!trimmedReason) {
        return { error: 'Alasan penolakan / ketidaksesuaian wajib diisi.' };
    }

    const trxRes = await query(
        'SELECT id, status FROM transactions WHERE id = $1 LIMIT 1',
        [Number(transactionId)]
    );

    if (trxRes.rows.length === 0 || trxRes.rows[0].status !== 'Pending') {
        return { error: 'Hanya transaksi berstatus Pending yang dapat ditolak.' };
    }

    await query(
        `UPDATE transactions
        SET status = 'Rejected', rejection_reason = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3`,
        [trimmedReason, session.id, Number(transactionId)]
    );

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard');
    return { success: 'Transaksi ditolak (tidak sesuai permintaan) dan stok tidak berubah.' };
}

export async function markTransactionShippedAction(transactionId) {
    const session = await getSession();
    if (!session || !['staff_gudang', 'admin'].includes(session.role)) {
        return { error: 'Hanya Staff Gudang atau Admin yang dapat mengirim barang keluar.' };
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const trxRes = await client.query(
        'SELECT id, type, status FROM transactions WHERE id = $1 FOR UPDATE',
        [Number(transactionId)]
        );

        if (trxRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return { error: 'Transaksi tidak ditemukan.' };
        }

        const trx = trxRes.rows[0];
        if (trx.type !== 'OUT' || trx.status !== 'Approved') {
        await client.query('ROLLBACK');
        return {
            error: 'Hanya transaksi Barang Keluar berstatus Approved yang dapat dikirim.',
        };
        }

        const itemsRes = await client.query(
        'SELECT product_id, quantity FROM transaction_items WHERE transaction_id = $1',
        [trx.id]
        );

        for (const item of itemsRes.rows) {
        const prodRes = await client.query(
            'SELECT id, name, stock, unit FROM products WHERE id = $1 FOR UPDATE',
            [item.product_id]
        );

        if (prodRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return { error: 'Produk pada item transaksi tidak ditemukan.' };
        }

        const product = prodRes.rows[0];
        if (product.stock < item.quantity) {
            await client.query('ROLLBACK');
            return {
            error: `Pengiriman gagal: stok ${product.name} tersisa ${product.stock} ${product.unit}, tidak mencukupi untuk dikirim (${item.quantity} ${product.unit}).`,
            };
        }

        await client.query(
            'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [item.quantity, product.id]
        );
        }

        await client.query(
        "UPDATE transactions SET status = 'Shipped', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [trx.id]
        );

        await client.query('COMMIT');
    } catch {
        await client.query('ROLLBACK');
        return { error: 'Terjadi kesalahan saat memproses pengiriman barang keluar.' };
    } finally {
        client.release();
    }

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return {
        success: 'Barang keluar telah dikirim (Shipped), stok gudang berkurang, dan proses selesai.',
    };
}