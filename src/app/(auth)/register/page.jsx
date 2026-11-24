'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
} from 'lucide-react';
import { registerSupplierAction } from '@/actions/authActions';
import ThemeToggle from '@/components/theme/ThemeToggle';

const initialState = { error: '', success: '' };

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(
        registerSupplierAction,
        initialState
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 py-10 transition-colors">
        <div className="fixed bottom-5 right-5 z-50">
            <ThemeToggle />
        </div>

        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-2xl dark:shadow-black/40 overflow-hidden">
            <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white transition"
                >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Login</span>
                </Link>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                Registrasi Mitra Supplier
                </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
                </div>
                <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Pendaftaran Mitra Supplier
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Akun supplier baru memerlukan persetujuan Admin sebelum aktif
                </p>
                </div>
            </div>

            {state?.error && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{state.error}</span>
                </div>
            )}

            {state?.success && (
                <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-xs text-emerald-700 dark:text-emerald-300 space-y-3 leading-relaxed">
                <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <span>{state.success}</span>
                </div>
                <Link
                    href="/login"
                    className="inline-block font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                    Kembali ke Halaman Login
                </Link>
                </div>
            )}

            <form action={formAction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nama PIC / Penanggung Jawab
                    </label>
                    <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Nama lengkap PIC"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nama Perusahaan
                    </label>
                    <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        name="company_name"
                        required
                        placeholder="PT / CV Mitra Komponen"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Email Perusahaan
                    </label>
                    <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="supplier@perusahaan.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nomor Telepon Aktif
                    </label>
                    <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        name="phone"
                        required
                        placeholder="081234567890"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    </div>
                </div>
                </div>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Alamat Lengkap Perusahaan / Gudang
                </label>
                <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                    name="address"
                    rows={2}
                    required
                    placeholder="Jalan, kawasan industri, kota"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Kata Sandi
                    </label>
                    <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        name="password"
                        required
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        name="confirm_password"
                        required
                        placeholder="Ulangi kata sandi"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    </div>
                </div>
                </div>

                <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm shadow-red-600/20 transition cursor-pointer"
                >
                {isPending ? 'Mendaftarkan Akun...' : 'Ajukan Pendaftaran Supplier'}
                </button>
            </form>
            </div>
        </div>
        </div>
    );
}