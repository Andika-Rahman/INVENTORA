'use server';

import { revalidatePath } from 'next/cache';
import { getSession, hashPassword } from '@/lib/auth';
import { query } from '@/lib/db';

export async function createStaffAction(formData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Hanya Admin yang dapat menambahkan akun Staff Gudang.' };
    }

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirm_password') || '');

    if (!name || !email || !phone || !address || !password) {
        return { error: 'Semua kolom data Staff Gudang wajib diisi.' };
    }

    if (password.length < 6) {
        return { error: 'Kata sandi minimal harus 6 karakter.' };
    }

    if (password !== confirmPassword) {
        return { error: 'Konfirmasi kata sandi tidak cocok.' };
    }

    const existingRes = await query(
        'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
        [email]
    );

    if (existingRes.rows.length > 0) {
        return { error: 'Email tersebut sudah terdaftar di sistem.' };
    }

    const hashedPassword = await hashPassword(password);

    await query(
        `INSERT INTO users (name, email, password, role, status, company_name, phone, address)
        VALUES ($1, $2, $3, 'staff_gudang', 'Approved', 'INVENTORA Warehouse HQ', $4, $5)`,
        [name, email, hashedPassword, phone, address]
    );

    revalidatePath('/dashboard/staff');
    revalidatePath('/dashboard');

    return {
        success: `Akun Staff Gudang atas nama ${name} berhasil ditambahkan dan siap digunakan.`,
    };
}

export async function deleteStaffAction(staffId) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Hanya Admin yang dapat menghapus akun Staff Gudang.' };
    }

    const id = Number(staffId);
    const staffRes = await query(
        "SELECT id, name FROM users WHERE id = $1 AND role = 'staff_gudang' LIMIT 1",
        [id]
    );

    if (staffRes.rows.length === 0) {
        return { error: 'Data akun Staff Gudang tidak ditemukan.' };
    }

    const trxRes = await query(
        'SELECT COUNT(*)::int AS total FROM transactions WHERE created_by = $1',
        [id]
    );

    if (trxRes.rows[0].total > 0) {
        return {
        error:
            'Akun Staff ini tidak dapat dihapus karena sudah tercatat pada riwayat transaksi gudang.',
        };
    }

    await query("DELETE FROM users WHERE id = $1 AND role = 'staff_gudang'", [id]);

    revalidatePath('/dashboard/staff');
    revalidatePath('/dashboard');

    return {
        success: `Akun Staff ${staffRes.rows[0].name} berhasil dihapus.`,
    };
}