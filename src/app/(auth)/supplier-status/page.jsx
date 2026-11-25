import { redirect } from 'next/navigation';
import { Clock, XCircle, LogOut, Building2, ShieldAlert } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logoutAction } from '@/actions/authActions';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default async function SupplierStatusPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const userRes = await query(
        'SELECT id, name, email, role, status, company_name, termination_reason FROM users WHERE id = $1 LIMIT 1',
        [session.id]
    );

    if (userRes.rows.length === 0) {
        redirect('/login');
    }

    const user = userRes.rows[0];
    if (user.role !== 'supplier' || user.status === 'Approved') {
        redirect('/dashboard');
    }

    const isPending = user.status === 'Pending';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
        <div className="fixed bottom-5 right-5 z-50">
            <ThemeToggle />
        </div>

        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isPending
                        ? 'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                        : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30'
                    }`}
                >
                    {isPending ? <Clock className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isPending ? 'Menunggu Verifikasi Admin' : 'Pendaftaran Supplier Ditolak'}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Portal Mitra Supplier INVENTORA
                    </p>
                </div>
                </div>

                <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isPending
                    ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30'
                }`}
                >
                {user.status}
                </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{user.company_name || user.name}</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400">
                PIC: <strong className="text-slate-800 dark:text-zinc-200">{user.name}</strong> ({user.email})
                </p>
            </div>

            {isPending ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Akun perusahaan Anda telah terdaftar dan sedang ditinjau oleh Administrator gudang. Anda dapat mengakses katalog serta pesanan Restock PO segera setelah status akun disetujui.
                </div>
            ) : (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-xs text-red-800 dark:text-red-300 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Catatan Penolakan Admin:</span>
                </div>
                <p>{user.termination_reason || 'Persyaratan kemitraan belum terpenuhi.'}</p>
                </div>
            )}

            <form action={logoutAction}>
                <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer"
                >
                <LogOut className="w-4 h-4" />
                <span>Keluar ke Halaman Utama</span>
                </button>
            </form>
            </div>
        </div>
        </div>
    );
}