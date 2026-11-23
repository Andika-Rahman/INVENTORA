'use server';

import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import {
    clearSessionCookie,
    createSessionToken,
    hashPassword,
    setSessionCookie,
    verifyPassword,
} from '@/lib/auth';

export async function loginAction(prevState, formData) {
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
        return { error: 'Email dan password wajib diisi.' };
    }

    const result = await query(
        'SELECT id, name, email, password, role, status, company_name FROM users WHERE LOWER(email) = $1 LIMIT 1',
        [email]
    );

    if (result.rows.length === 0) {
        return { error: 'Email atau password tidak valid.' };
    }

    const user = result.rows[0];
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
        return { error: 'Email atau password tidak valid.' };
    }

    const token = await createSessionToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        company_name: user.company_name || '',
    });

    await setSessionCookie(token);

    if (user.role === 'supplier' && user.status !== 'Approved') {
        redirect('/supplier-status');
    }

    redirect('/dashboard');
}

export async function registerSupplierAction(prevState, formData) {
    const name = String(formData.get('name') || '').trim();
    const companyName = String(formData.get('company_name') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirm_password') || '');

    if (!name || !companyName || !email || !phone || !address || !password) {
        return { error: 'Semua field pendaftaran supplier wajib diisi.' };
    }

    if (password.length < 6) {
        return { error: 'Password minimal harus 6 karakter.' };
    }

    if (password !== confirmPassword) {
        return { error: 'Konfirmasi password tidak cocok.' };
    }

    const existingUser = await query(
        'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        return { error: 'Email sudah terdaftar. Gunakan email lain.' };
    }

    const hashedPassword = await hashPassword(password);

    await query(
        `INSERT INTO users (name, email, password, role, status, company_name, phone, address)
        VALUES ($1, $2, $3, 'supplier', 'Pending', $4, $5, $6)`,
        [name, email, hashedPassword, companyName, phone, address]
    );

    return {
        success:
        'Registrasi Supplier berhasil! Akun Anda berstatus Pending dan menunggu persetujuan Admin sebelum dapat mengakses dashboard.',
    };
}

export async function resetPasswordAction(prevState, formData) {
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim();
    const newPassword = String(formData.get('new_password') || '');
    const confirmPassword = String(formData.get('confirm_password') || '');

    if (!email || !phone || !newPassword || !confirmPassword) {
        return { error: 'Semua kolom verifikasi dan kata sandi baru wajib diisi.' };
    }

    if (newPassword.length < 6) {
        return { error: 'Kata sandi baru minimal harus 6 karakter.' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'Konfirmasi kata sandi baru tidak cocok.' };
    }

    const userRes = await query(
        'SELECT id, role, phone FROM users WHERE LOWER(email) = $1 LIMIT 1',
        [email]
    );

    if (userRes.rows.length === 0) {
        return { error: 'Akun supplier dengan email tersebut tidak ditemukan.' };
    }

    const user = userRes.rows[0];

    if (user.role !== 'supplier') {
        return {
        error: 'Fitur ubah kata sandi mandiri hanya tersedia untuk akun mitra Supplier.',
        };
    }

    const normalizedDbPhone = String(user.phone || '').replace(/[\s-]/g, '');
    const normalizedInputPhone = phone.replace(/[\s-]/g, '');

    if (!normalizedDbPhone || normalizedDbPhone !== normalizedInputPhone) {
        return { error: 'Nomor telepon tidak cocok dengan data yang terdaftar pada akun supplier ini.' };
    }

    const hashedPassword = await hashPassword(newPassword);

    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);

    return {
        success:
        'Kata sandi akun Supplier berhasil diperbarui! Silakan masuk kembali menggunakan kata sandi baru Anda.',
    };
}

export async function logoutAction() {
    await clearSessionCookie();
    redirect('/login');
}