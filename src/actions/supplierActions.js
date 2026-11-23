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

    await query('UPDATE users SET status = $1 WHERE id = $2', [
        decision,
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