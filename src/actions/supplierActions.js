'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function updateSupplierStatusAction(supplierId, decision, rejectionReason = '') {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Hanya Admin yang dapat memverifikasi akun Supplier.' };
    }

    if (!['Approved', 'Rejected'].includes(decision)) {
        return { error: 'Status verifikasi tidak valid.' };
    }

    const trimmedReason = String(rejectionReason || '').trim();
    if (decision === 'Rejected' && !trimmedReason) {
        return { error: 'Alasan penolakan wajib diisi.' };
    }

    const checkRes = await query(
        "SELECT id, status FROM users WHERE id = $1 AND role = 'supplier' LIMIT 1",
        [Number(supplierId)]
    );

    if (checkRes.rows.length === 0) {
        return { error: 'Data supplier tidak ditemukan.' };
    }

    if (checkRes.rows[0].status !== 'Pending') {
        return {
        error: 'Hanya pendaftaran supplier berstatus Pending yang dapat disetujui atau ditolak.',
        };
    }

    await query('UPDATE users SET status = $1, termination_reason = $2 WHERE id = $3', [
        decision,
        decision === 'Rejected' ? trimmedReason : null,
        Number(supplierId),
    ]);

    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/restocks');
    revalidatePath('/dashboard');

    return {
        success:
        decision === 'Approved'
            ? 'Akun Supplier berhasil disetujui (Approved).'
            : 'Pendaftaran Supplier telah ditolak (Rejected).',
    };
}

export async function deleteSupplierAction(supplierId, terminationReason) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Hanya Admin yang dapat menghapus atau memberhentikan mitra Supplier.' };
    }

    const trimmedReason = String(terminationReason || '').trim();
    if (!trimmedReason) {
        return { error: 'Alasan pemberhentian kerjasama dengan gudang wajib diisi.' };
    }

    const id = Number(supplierId);
    const supplierRes = await query(
        "SELECT id, company_name, name, status FROM users WHERE id = $1 AND role = 'supplier' LIMIT 1",
        [id]
    );

    if (supplierRes.rows.length === 0) {
        return { error: 'Data supplier tidak ditemukan.' };
    }

    const activeDeliveryRes = await query(
        `SELECT COUNT(*)::int AS active_count
        FROM restock_orders
        WHERE supplier_id = $1
        AND status IN ('Pending', 'Confirmed', 'In Transit', 'Pesanan Diperiksa')`,
        [id]
    );

    if (activeDeliveryRes.rows[0].active_count > 0) {
        return {
        error:
            'Supplier tidak dapat dihapus karena sedang melakukan pengiriman barang atau masih memiliki pesanan aktif.',
        };
    }

    const historyPoRes = await query(
        'SELECT COUNT(*)::int AS total_count FROM restock_orders WHERE supplier_id = $1',
        [id]
    );

    const companyLabel = supplierRes.rows[0].company_name || supplierRes.rows[0].name;

    if (historyPoRes.rows[0].total_count === 0) {
        await query("DELETE FROM users WHERE id = $1 AND role = 'supplier'", [id]);
    } else {
        await query(
        "UPDATE users SET status = 'Terminated', termination_reason = $1 WHERE id = $2 AND role = 'supplier'",
        [trimmedReason, id]
        );
    }

    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/restocks');
    revalidatePath('/dashboard');

    return {
        success: `Kerjasama dengan ${companyLabel} telah diberhentikan dan data supplier berhasil dihapus dari daftar mitra aktif.`,
    };
}