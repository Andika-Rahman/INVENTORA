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

export async function logoutAction() {
    await clearSessionCookie();
    redirect('/login');
}