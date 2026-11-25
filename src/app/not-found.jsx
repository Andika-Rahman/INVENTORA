import Link from 'next/link';
import { Package, FileQuestion, LayoutDashboard, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="inline-flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-600/25 shrink-0">
                <Package className="w-5 h-5" />
                </div>
                <div>
                <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                    INVENTORA
                </p>
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                    PC &amp; Laptop Warehouse
                </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold tracking-wide">
                <FileQuestion className="w-3.5 h-3.5" />
                <span>ERROR 404 • NOT FOUND</span>
                </div>

                <div className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white font-mono">
                404
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Halaman atau Berkas Tidak Ditemukan
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                Alamat URL yang Anda tuju tidak tersedia, telah dipindahkan, atau berkas gambar dokumentasi belum terunggah ke direktori gudang.
                </p>
            </div>

            <div className="pt-2">
                <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm shadow-red-600/20 transition"
                >
                <LayoutDashboard className="w-4 h-4" />
                <span>Kembali ke Dashboard</span>
                </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400 transition"
                >
                <Home className="w-3.5 h-3.5" />
                <span>Ke Halaman Utama INVENTORA</span>
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
}