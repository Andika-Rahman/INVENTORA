import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'supplier' && session.status !== 'Approved') {
    redirect('/supplier-status');
  }

  redirect('/dashboard');
}