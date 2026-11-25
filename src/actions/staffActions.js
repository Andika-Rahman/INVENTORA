'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import * as dbModule from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';

const db = dbModule.default || dbModule.pool || dbModule;

async function ensureAdmin() {
    const cookieStore = await cookies();
    const token =
        cookieStore.get('inventora_session')?.value ||
        cookieStore.get('session')?.value ||
        cookieStore.get('token')?.value ||
        cookieStore.get('auth_token')?.value;

    if (!token) {
        throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');
    }

    const payload = await verifySessionToken(token);
    if (!payload || payload.role !== 'admin') {
        throw new Error('Akses ditolak. Hanya Administrator yang memiliki wewenang ini.');
    }

    return payload;
}

export async function createStaffAction(formData) {
    try {
        await ensureAdmin();

        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim().toLowerCase();
        const password = String(formData.get('password') || '');
        const role = String(formData.get('role') || 'staff_gudang').trim();
        const phone = String(formData.get('phone') || '').trim();
        const address = String(formData.get('address') || '').trim();

        if (!name || !email || !password) {
        return { error: 'Nama lengkap, email, dan password wajib diisi.' };
        }

        if (!['staff_gudang', 'warehouse_manager'].includes(role)) {
        return { error: 'Role tidak valid. Pilih Staff Gudang atau Warehouse Manager.' };
        }

        if (password.length < 6) {
        return { error: 'Password minimal terdiri dari 6 karakter.' };
        }

        const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
        if (existing.rows.length > 0) {
        return { error: 'Email tersebut sudah terdaftar pada akun lain.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
        `INSERT INTO users (name, email, password, role, status, company_name, phone, address)
        VALUES ($1, $2, $3, $4, 'Approved', 'INVENTORA Warehouse HQ', $5, $6)`,
        [name, email, hashedPassword, role, phone || null, address || null]
        );

        revalidatePath('/dashboard/staff');
        revalidatePath('/dashboard');

        const roleLabel = role === 'warehouse_manager' ? 'Warehouse Manager' : 'Staff Gudang';
        return { success: `Akun ${roleLabel} "${name}" berhasil ditambahkan.` };
    } catch (error) {
        return { error: error.message || 'Gagal menambahkan akun tim gudang.' };
    }
}

export async function deleteStaffAction(userId) {
    try {
        const session = await ensureAdmin();
        const targetId = Number(userId);

        if (!targetId) {
        return { error: 'ID pengguna tidak valid.' };
        }

        if (session?.id && Number(session.id) === targetId) {
        return { error: 'Anda tidak dapat menghapus akun Anda sendiri.' };
        }

        const userRes = await db.query(
        'SELECT id, name, role, status FROM users WHERE id = $1',
        [targetId]
        );

        if (userRes.rows.length === 0) {
        return { error: 'Akun pengguna tidak ditemukan.' };
        }

        const targetUser = userRes.rows[0];

        if (!['staff_gudang', 'warehouse_manager'].includes(targetUser.role)) {
        return { error: 'Hanya akun Staff Gudang dan Warehouse Manager yang dapat dikelola di halaman ini.' };
        }

        const trxRef = await db.query(
        'SELECT COUNT(*)::int AS total FROM transactions WHERE created_by = $1 OR approved_by = $1',
        [targetId]
        );
        const poRef = await db.query(
        'SELECT COUNT(*)::int AS total FROM restock_orders WHERE created_by = $1',
        [targetId]
        );

        const hasHistory = trxRef.rows[0].total > 0 || poRef.rows[0].total > 0;

        if (hasHistory) {
        await db.query(
            `UPDATE users
            SET status = 'Terminated',
                termination_reason = 'Dinonaktifkan oleh Administrator'
            WHERE id = $1`,
            [targetId]
        );

        revalidatePath('/dashboard/staff');
        revalidatePath('/dashboard');

        return {
            success: `Akun "${targetUser.name}" memiliki riwayat transaksi/PO sehingga statusnya dinonaktifkan (Terminated) agar jejak audit tetap aman.`,
        };
        }

        await db.query('DELETE FROM users WHERE id = $1', [targetId]);

        revalidatePath('/dashboard/staff');
        revalidatePath('/dashboard');

        return { success: `Akun "${targetUser.name}" berhasil dihapus permanen.` };
    } catch (error) {
        return { error: error.message || 'Gagal menghapus atau menonaktifkan akun.' };
    }
}

export async function reactivateStaffAction(userId) {
    try {
        await ensureAdmin();
        const targetId = Number(userId);

        if (!targetId) {
        return { error: 'ID pengguna tidak valid.' };
        }

        const userRes = await db.query(
        'SELECT id, name, role FROM users WHERE id = $1',
        [targetId]
        );

        if (userRes.rows.length === 0) {
        return { error: 'Akun pengguna tidak ditemukan.' };
        }

        const targetUser = userRes.rows[0];
        if (!['staff_gudang', 'warehouse_manager'].includes(targetUser.role)) {
        return { error: 'Role pengguna tidak valid untuk aktivasi di halaman ini.' };
        }

        await db.query(
        `UPDATE users
        SET status = 'Approved',
            termination_reason = NULL
        WHERE id = $1`,
        [targetId]
        );

        revalidatePath('/dashboard/staff');
        revalidatePath('/dashboard');

        return { success: `Akses akun "${targetUser.name}" berhasil diaktifkan kembali.` };
    } catch (error) {
        return { error: error.message || 'Gagal mengaktifkan kembali akun.' };
    }
}