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
        SELECT id, name, email, status, company_name, phone, address, created_at
        FROM users
        WHERE role = 'supplier'
        ORDER BY
        CASE status
            WHEN 'Pending' THEN 1
            WHEN 'Approved' THEN 2
            ELSE 3
        END,
        created_at DESC
    `);

    return <SupplierManager suppliers={suppliersRes.rows} />;
}