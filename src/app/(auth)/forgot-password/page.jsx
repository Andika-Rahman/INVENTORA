'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { resetPasswordAction } from '@/actions/authActions';
import ThemeToggle from '@/components/theme/ThemeToggle';

const initialState = { error: '', success: '' };

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(
        resetPasswordAction,
        initialState
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 py-10 transition-colors">
        <div className="fixed bottom-5 right-5 z-50">
            <ThemeToggle />
        </div>

        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-2xl dark:shadow-black/40 p-8">
            <div className="flex items-center justify-between mb-6">
            <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Login</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                Reset Kata Sandi
            </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <KeyRound className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Ubah Kata Sandi Supplier
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Khusus akun mitra Supplier yang lupa kata sandi
                </p>
            </div>
            </div>

            {state?.error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3.5 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{state.error}</span>
            </div>
            )}

            {state?.success && (
            <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-sm text-emerald-700 dark:text-emerald-300 space-y-3">
                <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <span>{state.success}</span>
                </div>
                <Link
                href="/login"
                className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                >
                Masuk Sekarang
                </Link>
            </div>
            )}

            <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Email Supplier Terdaftar
                </label>
                <input
                type="email"
                name="email"
                required
                placeholder="Contoh: supplier.silikon@inventora.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Nomor Telepon Terdaftar
                </label>
                <input
                type="text"
                name="phone"
                required
                placeholder="Contoh: 0215550192"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Kata Sandi Baru
                </label>
                <input
                type="password"
                name="new_password"
                required
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Konfirmasi Kata Sandi Baru
                </label>
                <input
                type="password"
                name="confirm_password"
                required
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition cursor-pointer"
            >
                {isPending ? 'Memperbarui Kata Sandi...' : 'Simpan Kata Sandi Baru'}
            </button>
            </form>
        </div>
        </div>
    );
}