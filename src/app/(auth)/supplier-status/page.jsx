import { redirect } from 'next/navigation';
import { Clock, XCircle, LogOut } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logoutAction } from '@/actions/authActions';

export default async function SupplierStatusPage() {
    const session = await getSession();

    if (!session || session.role !== 'supplier') {
        redirect('/login');
    }

    const result = await query(
        'SELECT name, email, company_name, status FROM users WHERE id = $1 LIMIT 1',
        [session.id]
    );

    const supplier = result.rows[0];

    if (!supplier) {
        redirect('/login');
    }

    const isRejected = supplier.status === 'Rejected';

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center">
            <div
            className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center border ${
                isRejected
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            >
            {isRejected ? <XCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
            </div>

            <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 border ${
                isRejected
                ? 'bg-red-500/10 text-red-300 border-red-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
            >
            Status Akun: {supplier.status}
            </span>

            <h1 className="text-xl font-bold text-white">
            {isRejected
                ? 'Pendaftaran Akun Supplier Ditolak'
                : 'Akun Anda Sedang Ditinjau'}
            </h1>

            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            {isRejected
                ? `Mohon maaf, pengajuan akun supplier atas nama ${supplier.company_name || supplier.name} telah ditolak oleh Admin sehingga tidak dapat mengakses dashboard gudang INVENTORA.`
                : `Halo ${supplier.name} (${supplier.company_name || supplier.email}), pendaftaran akun supplier Anda sedang menunggu persetujuan Admin. Anda dapat mengakses dashboard setelah akun disetujui.`}
            </p>

            <form action={logoutAction} className="mt-7">
            <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer"
            >
                <LogOut className="w-4 h-4" />
                <span>Keluar & Kembali ke Login</span>
            </button>
            </form>
        </div>
        </div>
    );
}