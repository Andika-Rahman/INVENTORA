import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import RestockManager from '@/components/restocks/RestockManager';

export default async function RestocksPage({ searchParams }) {
    const session = await getSession();
    if (!session || session.role === 'staff_gudang') {
        redirect('/dashboard');
    }

    const resolvedParams = await searchParams;
    const preselectedProductId = String(resolvedParams?.product_id || '').trim();

    let orderSql = `
        SELECT
        ro.id,
        ro.po_number,
        ro.supplier_id,
        ro.order_date,
        ro.expected_delivery_date,
        ro.notes,
        ro.status,
        ro.status_notes,
        ro.supplier_rating,
        ro.supplier_feedback,
        u_sup.name AS supplier_name,
        u_sup.company_name AS supplier_company,
        u_mgr.name AS created_by_name
        FROM restock_orders ro
        JOIN users u_sup ON ro.supplier_id = u_sup.id
        JOIN users u_mgr ON ro.created_by = u_mgr.id
    `;
    const orderParams = [];

    if (session.role === 'supplier') {
        orderSql += ' WHERE ro.supplier_id = $1';
        orderParams.push(session.id);
    }

    orderSql += ' ORDER BY ro.created_at DESC';

    const [ordersRes, itemsRes, suppliersRes, productsRes] = await Promise.all([
        query(orderSql, orderParams),
        query(`
        SELECT
            roi.id,
            roi.restock_order_id,
            roi.product_id,
            roi.quantity,
            p.sku,
            p.name AS product_name,
            p.unit
        FROM restock_order_items roi
        JOIN products p ON roi.product_id = p.id
        ORDER BY roi.id ASC
        `),
        query(`
        SELECT id, name, company_name
        FROM users
        WHERE role = 'supplier' AND status = 'Approved'
        ORDER BY company_name ASC, name ASC
        `),
        query('SELECT id, sku, name, stock, unit FROM products ORDER BY name ASC'),
    ]);

    const itemsByOrder = {};
    for (const item of itemsRes.rows) {
        if (!itemsByOrder[item.restock_order_id]) {
        itemsByOrder[item.restock_order_id] = [];
        }
        itemsByOrder[item.restock_order_id].push(item);
    }

    const ordersWithItems = ordersRes.rows.map((order) => ({
        ...order,
        items: itemsByOrder[order.id] || [],
    }));

    return (
        <RestockManager
        orders={ordersWithItems}
        suppliers={suppliersRes.rows}
        products={productsRes.rows}
        role={session.role}
        preselectedProductId={preselectedProductId}
        />
    );
}