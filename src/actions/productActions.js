'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

function validateProductFields(formData, requireSku = true) {
    const sku = String(formData.get('sku') || '').trim().toUpperCase();
    const name = String(formData.get('name') || '').trim();
    const categoryId = Number(formData.get('category_id'));
    const description = String(formData.get('description') || '').trim();
    const purchasePrice = Number(formData.get('purchase_price'));
    const sellingPrice = Number(formData.get('selling_price'));
    const minStock = Number(formData.get('min_stock'));
    const lowStock = Number(formData.get('low_stock'));
    const stock = Number(formData.get('stock'));
    const unit = String(formData.get('unit') || '').trim();
    const rackLocation = String(formData.get('rack_location') || '').trim().toUpperCase();
    const imageUrl = String(formData.get('image_url') || '').trim();

    if (
        (requireSku && !sku) ||
        !name ||
        !categoryId ||
        !description ||
        !unit ||
        !rackLocation
    ) {
        return { error: 'Semua field wajib diisi dengan lengkap.' };
    }

    if (
        Number.isNaN(purchasePrice) ||
        purchasePrice < 0 ||
        Number.isNaN(sellingPrice) ||
        sellingPrice < 0
    ) {
        return { error: 'Harga beli dan harga jual tidak boleh negatif.' };
    }

    if (Number.isNaN(minStock) || minStock < 0 || Number.isNaN(lowStock) || lowStock < 0) {
        return { error: 'Stok minimum dan stok Low harus bernilai valid (>= 0).' };
    }

    if (lowStock <= minStock) {
        return { error: 'Batas Stok Low harus lebih besar dari Stok Minimum (Severe).' };
    }

    if (Number.isNaN(stock) || stock < 0) {
        return { error: 'Jumlah stok tidak boleh negatif.' };
    }

    return {
        data: {
        sku,
        name,
        categoryId,
        description,
        purchasePrice,
        sellingPrice,
        minStock,
        lowStock,
        stock,
        unit,
        rackLocation,
        imageUrl: imageUrl || null,
        },
    };
}

export async function createProductAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin menambahkan produk.' };
    }

    const parsed = validateProductFields(formData, true);
    if (parsed.error) return { error: parsed.error };

    const { data } = parsed;

    const existingSku = await query(
        'SELECT id FROM products WHERE UPPER(sku) = $1 LIMIT 1',
        [data.sku]
    );

    if (existingSku.rows.length > 0) {
        return { error: `SKU "${data.sku}" sudah terdaftar. Gunakan kode SKU yang unik.` };
    }

    await query(
        `INSERT INTO products (
        sku, name, category_id, description, purchase_price, selling_price,
        min_stock, low_stock, stock, unit, rack_location, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
        data.sku,
        data.name,
        data.categoryId,
        data.description,
        data.purchasePrice,
        data.sellingPrice,
        data.minStock,
        data.lowStock,
        data.stock,
        data.unit,
        data.rackLocation,
        data.imageUrl,
        ]
    );

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard');
    return { success: 'Produk komponen berhasil ditambahkan.' };
}

export async function updateProductAction(prevState, formData) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin mengubah produk.' };
    }

    const id = Number(formData.get('id'));
    if (!id) return { error: 'ID produk tidak valid.' };

    const parsed = validateProductFields(formData, false);
    if (parsed.error) return { error: parsed.error };

    const { data } = parsed;

    await query(
        `UPDATE products SET
        name = $1,
        category_id = $2,
        description = $3,
        purchase_price = $4,
        selling_price = $5,
        min_stock = $6,
        low_stock = $7,
        stock = $8,
        unit = $9,
        rack_location = $10,
        image_url = $11,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $12`,
        [
        data.name,
        data.categoryId,
        data.description,
        data.purchasePrice,
        data.sellingPrice,
        data.minStock,
        data.lowStock,
        data.stock,
        data.unit,
        data.rackLocation,
        data.imageUrl,
        id,
        ]
    );

    revalidatePath('/dashboard/products');
    revalidatePath(`/dashboard/products/${id}`);
    revalidatePath('/dashboard');
    return { success: 'Data produk berhasil diperbarui.' };
}

export async function deleteProductAction(productId) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return { error: 'Anda tidak memiliki izin menghapus produk.' };
    }

    try {
        await query('DELETE FROM products WHERE id = $1', [Number(productId)]);
        revalidatePath('/dashboard/products');
        revalidatePath('/dashboard');
        return { success: 'Produk berhasil dihapus.' };
    } catch {
        return {
        error:
            'Produk tidak dapat dihapus karena sudah tercatat dalam riwayat transaksi atau restock order.',
        };
    }
}