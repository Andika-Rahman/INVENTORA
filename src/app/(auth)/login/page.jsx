'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Cpu, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { loginAction } from '@/actions/authActions';

const initialState = { error: '' };

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                <Cpu className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">INVENTORA</h1>
            <p className="text-sm text-slate-400 mt-1">
                Warehouse Management System — PC & Laptop Components
            </p>
            </div>

            {state?.error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{state.error}</span>
            </div>
            )}

            <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Email Akun
                </label>
                <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama@inventora.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Password
                </label>
                <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition"
                />
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
                <span>{isPending ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-4 h-4" />
            </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
                Ingin bermitra sebagai pemasok komponen?{' '}
                <Link
                href="/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition"
                >
                Daftar Akun Supplier
                </Link>
            </p>
            </div>

            <div className="flex justify-end">
                <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition"
                >
                    Lupa kata sandi?
                </Link>
            </div>
        </div>
        </div>
    );
}