'use server';

import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function getWarehouseNotificationsAction() {
    const session = await getSession();
    if (!session) {
        return { notifications: [], unreadCount: 0 };
    }

    const poSql =
        session.role === 'supplier'
        ? `SELECT ro.id, ro.po_number, ro.status, ro.updated_at, ro.created_at,
                    u.company_name AS supplier_company, u.name AS supplier_name
            FROM restock_orders ro
            JOIN users u ON u.id = ro.supplier_id
            WHERE ro.supplier_id = $1
            AND ro.status IN ('In Transit', 'Pesanan Diperiksa', 'Received')
            ORDER BY COALESCE(ro.updated_at, ro.created_at) DESC
            LIMIT 15`
        : `SELECT ro.id, ro.po_number, ro.status, ro.updated_at, ro.created_at,
                    u.company_name AS supplier_company, u.name AS supplier_name
            FROM restock_orders ro
            JOIN users u ON u.id = ro.supplier_id
            WHERE ro.status IN ('In Transit', 'Pesanan Diperiksa', 'Received')
            ORDER BY COALESCE(ro.updated_at, ro.created_at) DESC
            LIMIT 15`;

    const poRes =
        session.role === 'supplier'
        ? await query(poSql, [session.id])
        : await query(poSql);

    for (const row of poRes.rows) {
        const keyTag = `${row.po_number}:${row.status}`;
        const existsRes = await query(
        'SELECT id FROM notifications WHERE po_number = $1 LIMIT 1',
        [keyTag]
        );

        if (existsRes.rows.length === 0) {
        const supplierLabel = row.supplier_company || row.supplier_name || 'Mitra Supplier';
        let title = '';
        let message = '';

        if (row.status === 'In Transit') {
            title = `Barang Dalam Perjalanan (${row.po_number})`;
            message = `Pengiriman komponen dari ${supplierLabel} sedang dalam perjalanan menuju gudang.`;
        } else if (row.status === 'Pesanan Diperiksa') {
            title = `Barang Sudah Sampai di Gudang (${row.po_number})`;
            message = `Pesanan dari ${supplierLabel} telah tiba di lokasi gudang dan sedang diperiksa fisik oleh Staff Gudang.`;
        } else if (row.status === 'Received') {
            title = `Barang Sampai & Diterima (${row.po_number})`;
            message = `Pengiriman ${row.po_number} dari ${supplierLabel} telah selesai diverifikasi dan stok gudang berhasil ditambahkan.`;
        }

        if (title) {
            await query(
            `INSERT INTO notifications (title, message, category, po_number, is_read)
            VALUES ($1, $2, $3, $4, FALSE)`,
            [title, message, row.status, keyTag]
            );
        }
        }
    }

    const notifSql =
        session.role === 'supplier'
        ? `SELECT n.id, n.title, n.message, n.category, n.po_number, n.is_read, n.created_at
            FROM notifications n
            JOIN restock_orders ro ON SPLIT_PART(n.po_number, ':', 1) = ro.po_number
            WHERE ro.supplier_id = $1
            ORDER BY n.created_at DESC
            LIMIT 15`
        : `SELECT id, title, message, category, po_number, is_read, created_at
            FROM notifications
            ORDER BY created_at DESC
            LIMIT 15`;

    const notifRes =
        session.role === 'supplier'
        ? await query(notifSql, [session.id])
        : await query(notifSql);

    const notifications = notifRes.rows.map((item) => ({
        ...item,
        created_at: item.created_at ? new Date(item.created_at).toISOString() : null,
    }));

    const unreadCount = notifications.filter((item) => !item.is_read).length;

    return {
        notifications,
        unreadCount,
    };
}

export async function markAllNotificationsReadAction() {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    if (session.role === 'supplier') {
        await query(
        `UPDATE notifications n
        SET is_read = TRUE
        FROM restock_orders ro
        WHERE SPLIT_PART(n.po_number, ':', 1) = ro.po_number
            AND ro.supplier_id = $1
            AND n.is_read = FALSE`,
        [session.id]
        );
    } else {
        await query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
    }

    return { success: true };
}