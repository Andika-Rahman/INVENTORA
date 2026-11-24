import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import ProfileEditor from '@/components/profile/ProfileEditor';

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const userRes = await query(
        'SELECT id, name, email, role, status, company_name, phone, address, avatar_url FROM users WHERE id = $1 LIMIT 1',
        [session.id]
    );

    if (userRes.rows.length === 0) {
        redirect('/login');
    }

    return <ProfileEditor user={userRes.rows[0]} />;
}