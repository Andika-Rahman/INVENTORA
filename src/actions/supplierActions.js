'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function updateSupplierStatusAction(formData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Hanya Admin yang dapat memverifikasi Supplier.' };
    }

    const supplierId = Number(formData.get('supplier_id'));
    const status = String(formData.get('status') || '');

    if (!supplierId || !['Approved', 'Rejected'].includes(status)) {
        return { error: 'Data verifikasi supplier tidak valid.' };
    }

    await query(
        "UPDATE users SET status = $1 WHERE id = $2 AND role = 'supplier'",
        [status, supplierId]
    );

    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard');
}