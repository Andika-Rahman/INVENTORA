'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function createCategoryAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin mengelola kategori.' };
    }

    const name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const imageUrl = String(formData.get('image_url') || '').trim();

    if (!name || !description) {
        return { error: 'Nama kategori dan deskripsi wajib diisi.' };
    }

    const existing = await query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [name]
    );

    if (existing.rows.length > 0) {
        return { error: 'Nama kategori sudah digunakan. Gunakan nama yang unik.' };
    }

    await query(
        'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3)',
        [name, description, imageUrl || null]
    );

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');
    return { success: 'Kategori baru berhasil ditambahkan.' };
}

export async function updateCategoryAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin mengubah kategori.' };
    }

    const id = Number(formData.get('id'));
    const name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const imageUrl = String(formData.get('image_url') || '').trim();

    if (!id || !name || !description) {
        return { error: 'Nama kategori dan deskripsi wajib diisi.' };
    }

    const existing = await query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2 LIMIT 1',
        [name, id]
    );

    if (existing.rows.length > 0) {
        return { error: 'Nama kategori sudah digunakan oleh kategori lain.' };
    }

    await query(
        'UPDATE categories SET name = $1, description = $2, image_url = $3 WHERE id = $4',
        [name, description, imageUrl || null, id]
    );

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');
    return { success: 'Kategori berhasil diperbarui.' };
}

export async function deleteCategoryAction(formData) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin menghapus kategori.' };
    }

    const id = Number(formData.get('id'));
    if (!id) {
        return { error: 'ID kategori tidak valid.' };
    }

    const productCheck = await query(
        'SELECT COUNT(*)::int AS total FROM products WHERE category_id = $1',
        [id]
    );

    if (productCheck.rows[0].total > 0) {
        return {
        error: `Kategori tidak dapat dihapus karena masih memiliki ${productCheck.rows[0].total} produk aktif.`,
        };
    }

    await query('DELETE FROM categories WHERE id = $1', [id]);

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');
    return { success: 'Kategori berhasil dihapus.' };
}