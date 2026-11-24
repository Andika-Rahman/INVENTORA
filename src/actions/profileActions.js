'use server';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import {
    getSession,
    createSessionToken,
    setSessionCookie,
    hashPassword,
    verifyPassword,
} from '@/lib/auth';
import { query } from '@/lib/db';

export async function updateProfileAction(prevState, formData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Sesi telah berakhir. Silakan login kembali.' };
    }

    const name = String(formData.get('name') || '').trim();
    const companyName = String(formData.get('company_name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const currentPassword = String(formData.get('current_password') || '');
    const newPassword = String(formData.get('new_password') || '');
    const avatarFile = formData.get('avatar');

    if (!name) {
        return { error: 'Nama lengkap wajib diisi.' };
    }

    const userRes = await query(
        'SELECT id, name, email, password, role, status, company_name, phone, address, avatar_url FROM users WHERE id = $1 LIMIT 1',
        [session.id]
    );

    if (userRes.rows.length === 0) {
        return { error: 'Data pengguna tidak ditemukan.' };
    }

    const existingUser = userRes.rows[0];
    let nextAvatarUrl = existingUser.avatar_url || '';
    let nextPasswordHash = existingUser.password;

    if (avatarFile && typeof avatarFile === 'object' && avatarFile.size > 0) {
        if (!avatarFile.type || !avatarFile.type.startsWith('image/')) {
        return { error: 'File foto profil harus berupa gambar (JPG, PNG, atau WEBP).' };
        }

        if (avatarFile.size > 2 * 1024 * 1024) {
        return { error: 'Ukuran foto profil maksimal 2 MB.' };
        }

        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(avatarFile.name || '.png') || '.png';
        const fileName = `avatar-${session.id}-${Date.now()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        nextAvatarUrl = `/uploads/profiles/${fileName}`;
    }

    if (newPassword) {
        if (newPassword.length < 6) {
        return { error: 'Kata sandi baru minimal harus 6 karakter.' };
        }

        if (!currentPassword) {
        return { error: 'Masukkan kata sandi saat ini untuk mengganti kata sandi.' };
        }

        const isValid = await verifyPassword(currentPassword, existingUser.password);
        if (!isValid) {
        return { error: 'Kata sandi saat ini tidak sesuai.' };
        }

        nextPasswordHash = await hashPassword(newPassword);
    }

    const finalCompanyName =
        existingUser.role === 'supplier'
        ? companyName || existingUser.company_name
        : existingUser.company_name;

    await query(
        `UPDATE users
        SET name = $1,
            company_name = $2,
            phone = $3,
            address = $4,
            avatar_url = $5,
            password = $6
        WHERE id = $7`,
        [
        name,
        finalCompanyName,
        phone,
        address,
        nextAvatarUrl || null,
        nextPasswordHash,
        session.id,
        ]
    );

    const updatedToken = await createSessionToken({
        id: existingUser.id,
        name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        company_name: finalCompanyName || '',
        avatar_url: nextAvatarUrl || '',
    });

    await setSessionCookie(updatedToken);

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard/suppliers');

    return {
        success: 'Profil dan foto akun berhasil diperbarui.',
    };
}