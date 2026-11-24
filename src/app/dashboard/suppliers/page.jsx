import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import SupplierManager from '@/components/suppliers/SupplierManager';

export default async function SuppliersPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    if (session.role !== 'admin') {
        redirect('/dashboard');
    }

    const suppliersRes = await query(`
        SELECT
        u.id,
        u.name,
        u.email,
        u.status,
        u.company_name,
        u.phone,
        u.address,
        u.termination_reason,
        u.created_at,
        COUNT(ro.id) FILTER (
            WHERE ro.status IN ('Pending', 'Confirmed', 'In Transit', 'Pesanan Diperiksa')
        )::int AS active_deliveries
        FROM users u
        LEFT JOIN restock_orders ro ON ro.supplier_id = u.id
        WHERE u.role = 'supplier'
        GROUP BY u.id
        ORDER BY
        CASE u.status
            WHEN 'Pending' THEN 1
            WHEN 'Approved' THEN 2
            WHEN 'Rejected' THEN 3
            ELSE 4
        END,
        u.created_at DESC
    `);

    return <SupplierManager suppliers={suppliersRes.rows} />;
}