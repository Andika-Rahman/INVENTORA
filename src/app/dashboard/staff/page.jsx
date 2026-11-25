import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import * as dbModule from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import StaffManager from '@/components/staff/StaffManager';

const db = dbModule.default || dbModule.pool || dbModule;

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token =
        cookieStore.get('inventora_session')?.value ||
        cookieStore.get('session')?.value ||
        cookieStore.get('token')?.value ||
        cookieStore.get('auth_token')?.value;

    if (!token) return null;
    return await verifySessionToken(token);
}

export default async function StaffManagementPage() {
    const user = await getCurrentUser();

    if (user && user.role !== 'admin') {
        redirect('/dashboard');
    }

    const result = await db.query(`
        SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.phone,
        u.address,
        u.created_at,
        (
            SELECT COUNT(*)::int
            FROM transactions t
            WHERE t.created_by = u.id OR t.approved_by = u.id
        ) AS transaction_count,
        (
            SELECT COUNT(*)::int
            FROM restock_orders ro
            WHERE ro.created_by = u.id
        ) AS po_count
        FROM users u
        WHERE u.role IN ('warehouse_manager', 'staff_gudang')
        ORDER BY
        CASE WHEN u.role = 'warehouse_manager' THEN 1 ELSE 2 END,
        u.created_at DESC
    `);

    return <StaffManager staffList={result.rows} />;
    }