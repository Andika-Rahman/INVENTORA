import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default async function DashboardLayout({ children }) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const userRes = await query(
        'SELECT id, name, email, role, status, company_name, avatar_url FROM users WHERE id = $1 LIMIT 1',
        [session.id]
    );

    if (userRes.rows.length === 0 || userRes.rows[0].status === 'Terminated') {
        redirect('/login');
    }

    const currentUser = userRes.rows[0];

    if (currentUser.role === 'supplier' && currentUser.status !== 'Approved') {
        redirect('/supplier-status');
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex transition-colors">
        <Sidebar session={currentUser} />

        <div className="flex-1 flex flex-col min-w-0">
            <Navbar session={currentUser} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
        </div>
    );
}