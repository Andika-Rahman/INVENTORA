import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import StaffManager from '@/components/staff/StaffManager';

export default async function StaffManagementPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    if (session.role !== 'admin') {
        redirect('/dashboard');
    }

    const staffRes = await query(`
        SELECT
        u.id,
        u.name,
        u.email,
        u.company_name,
        u.phone,
        u.address,
        u.avatar_url,
        u.created_at,
        COUNT(t.id)::int AS transaction_count
        FROM users u
        LEFT JOIN transactions t ON t.created_by = u.id
        WHERE u.role = 'staff_gudang'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `);

    return <StaffManager staffList={staffRes.rows} />;
}