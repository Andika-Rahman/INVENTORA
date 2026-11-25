'use client';

import Link from 'next/link';
import { Package, AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function GlobalError({ error, reset }) {
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SYSTEM ERROR • TERJADI KESALAHAN</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Gagal Memuat Halaman Sistem
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                Terjadi gangguan saat memproses permintaan pada server INVENTORA. Silakan muat ulang halaman atau kembali ke panel utama.
                </p>

                {error?.message && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-left">
                    <p className="text-[11px] font-mono text-red-700 dark:text-red-400 break-words">
                    {error.message}
                    </p>
                </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                type="button"
                onClick={() => reset()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
                >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Muat Ulang</span>
                </button>

                <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm shadow-red-600/20 transition"
                >
                <LayoutDashboard className="w-4 h-4" />
                <span>Kembali ke Dashboard</span>
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
}