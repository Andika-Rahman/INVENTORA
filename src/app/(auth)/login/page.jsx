'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import {
    Cpu,
    Mail,
    Lock,
    AlertCircle,
    ArrowLeft,
    Eye,
    EyeOff,
    Building2,
    KeyRound,
} from 'lucide-react';
import { loginAction } from '@/actions/authActions';
import ThemeToggle from '@/components/theme/ThemeToggle';

const initialState = { error: '' };

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 py-10 transition-colors">
        <div className="fixed bottom-5 right-5 z-50">
            <ThemeToggle />
        </div>

        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-2xl dark:shadow-black/40 overflow-hidden">
            <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white transition"
                >
                <ArrowLeft className="w-4 h-4" />
                <span>Beranda</span>
                </Link>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                Portal Gudang
                </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-red-600 text-white shadow-sm shadow-red-600/25 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6" />
                </div>
                <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Masuk ke INVENTORA
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Sistem Manajemen Gudang Komponen PC & Laptop
                </p>
                </div>
            </div>

            {state?.error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3.5 text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <span>{state.error}</span>
                </div>
            )}

            <form action={formAction} className="space-y-4">
                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Alamat Email
                </label>
                <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama@inventora.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500"
                    />
                </div>
                </div>

                <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Kata Sandi
                    </label>
                    <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                    <KeyRound className="w-3 h-3" />
                    <span>Lupa kata sandi supplier?</span>
                    </Link>
                </div>
                <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:border-red-500"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                </div>

                <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm shadow-red-600/20 transition cursor-pointer"
                >
                {isPending ? 'Memverifikasi Akun...' : 'Masuk ke Sistem'}
                </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                Mitra penyedia komponen PC & laptop baru?
                </p>
                <Link
                href="/register"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-400 dark:hover:text-white border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
                >
                <Building2 className="w-4 h-4" />
                <span>Daftar sebagai Mitra Supplier</span>
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
}