'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import pool, { query } from '@/lib/db';
import { generateDocumentNumber } from '@/lib/formatters';

export async function createRestockOrderAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Hanya Warehouse Manager atau Admin yang dapat membuat Restock Order.' };
    }

    const supplierId = Number(formData.get('supplier_id'));
    const orderDate = String(formData.get('order_date') || '').trim();
    const expectedDeliveryDate = String(formData.get('expected_delivery_date') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

    const productIds = formData.getAll('product_id').map((v) => Number(v));
    const quantities = formData.getAll('quantity').map((v) => Number(v));

    if (!supplierId || !orderDate || !expectedDeliveryDate) {
        return { error: 'Supplier, tanggal order, dan estimasi tanggal kirim wajib diisi.' };
    }

    if (expectedDeliveryDate < orderDate) {
        return { error: 'Estimasi tanggal pengiriman tidak boleh lebih awal dari tanggal order.' };
    }

    const items = [];
    const seenProducts = new Set();

    for (let i = 0; i < productIds.length; i += 1) {
        const pid = productIds[i];
        const qty = quantities[i];

        if (!pid || Number.isNaN(qty) || qty <= 0) {
        return { error: 'Setiap baris produk wajib dipilih dengan jumlah (quantity) lebih dari 0.' };
        }

        if (seenProducts.has(pid)) {
        return { error: 'Produk yang sama tidak boleh dipilih dua kali dalam satu PO.' };
        }

        seenProducts.add(pid);
        items.push({ productId: pid, quantity: qty });
    }

    if (items.length === 0) {
        return { error: 'Minimal harus ada 1 produk komponen dalam Restock Order.' };
    }

    const supplierCheck = await query(
        "SELECT id FROM users WHERE id = $1 AND role = 'supplier' AND status = 'Approved' LIMIT 1",
        [supplierId]
    );

    if (supplierCheck.rows.length === 0) {
        return { error: 'Supplier tidak ditemukan atau belum berstatus Approved.' };
    }

    const poNumber = generateDocumentNumber('PO');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderRes = await client.query(
        `INSERT INTO restock_orders (
            po_number, supplier_id, created_by, order_date, expected_delivery_date, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
        RETURNING id`,
        [poNumber, supplierId, session.id, orderDate, expectedDeliveryDate, notes || null]
        );

        const restockOrderId = orderRes.rows[0].id;

        for (const item of items) {
        await client.query(
            'INSERT INTO restock_order_items (restock_order_id, product_id, quantity) VALUES ($1, $2, $3)',
            [restockOrderId, item.productId, item.quantity]
        );
        }

        await client.query('COMMIT');
    } catch {
        await client.query('ROLLBACK');
        return { error: 'Gagal membuat Restock Order. Silakan coba kembali.' };
    } finally {
        client.release();
    }

    revalidatePath('/dashboard/restocks');
    revalidatePath('/dashboard');
    return { success: `Restock Order ${poNumber} berhasil dibuat dan dikirim ke Supplier.` };
}

export async function supplierRespondRestockAction(orderId, decision, statusNotes) {
    const session = await getSession();
    if (!session || session.role !== 'supplier') {
        return { error: 'Hanya Supplier yang dapat mengkonfirmasi pesanan ini.' };
    }

    if (!['Confirmed', 'Rejected'].includes(decision)) {
        return { error: 'Keputusan status tidak valid.' };
    }

    const trimmedNotes = String(statusNotes || '').trim();
    if (decision === 'Rejected' && !trimmedNotes) {
        return { error: 'Catatan alasan wajib diisi apabila menolak pesanan restock.' };
    }

    const checkRes = await query(
        'SELECT id, status FROM restock_orders WHERE id = $1 AND supplier_id = $2 LIMIT 1',
        [Number(orderId), session.id]
    );

    if (checkRes.rows.length === 0) {
        return { error: 'Restock Order tidak ditemukan.' };
    }

    if (checkRes.rows[0].status !== 'Pending') {
        return { error: 'Hanya pesanan berstatus Pending yang dapat dikonfirmasi atau ditolak.' };
    }

    await query(
        `UPDATE restock_orders
        SET status = $1, status_notes = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3`,
        [decision, trimmedNotes || null, Number(orderId)]
    );

    revalidatePath('/dashboard/restocks');
    revalidatePath('/dashboard');
    return {
        success:
        decision === 'Confirmed'
            ? 'Restock Order berhasil dikonfirmasi.'
            : 'Restock Order telah ditolak.',
    };
}

export async function advanceRestockStatusAction(orderId, nextStatus) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin memperbarui status pengiriman PO.' };
    }

    const currentRes = await query(
        'SELECT id, status FROM restock_orders WHERE id = $1 LIMIT 1',
        [Number(orderId)]
    );

    if (currentRes.rows.length === 0) {
        return { error: 'Restock Order tidak ditemukan.' };
    }

    const currentStatus = currentRes.rows[0].status;
    const isValidTransition =
        (currentStatus === 'Confirmed' && nextStatus === 'In Transit') ||
        (currentStatus === 'In Transit' && nextStatus === 'Received');

    if (!isValidTransition) {
        return { error: `Perubahan status dari ${currentStatus} ke ${nextStatus} tidak diizinkan.` };
    }

    await query(
        'UPDATE restock_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [nextStatus, Number(orderId)]
    );

    revalidatePath('/dashboard/restocks');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard');
    return { success: `Status Restock Order diperbarui menjadi ${nextStatus}.` };
}

export async function rateSupplierRestockAction(orderId, rating, feedback) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Hanya Warehouse Manager atau Admin yang dapat memberi rating supplier.' };
    }

    const numericRating = Number(rating);
    const trimmedFeedback = String(feedback || '').trim();

    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return { error: 'Rating supplier harus bernilai antara 1 hingga 5 bintang.' };
    }

    const orderRes = await query(
        'SELECT id, status FROM restock_orders WHERE id = $1 LIMIT 1',
        [Number(orderId)]
    );

    if (orderRes.rows.length === 0 || orderRes.rows[0].status !== 'Received') {
        return { error: 'Rating hanya dapat diberikan setelah Restock Order berstatus Received.' };
    }

    await query(
        `UPDATE restock_orders
        SET supplier_rating = $1, supplier_feedback = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3`,
        [numericRating, trimmedFeedback || null, Number(orderId)]
    );

    revalidatePath('/dashboard/restocks');
    return { success: 'Rating dan ulasan supplier berhasil disimpan.' };
}