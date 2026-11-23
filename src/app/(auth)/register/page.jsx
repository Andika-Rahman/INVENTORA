'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Building2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { registerSupplierAction } from '@/actions/authActions';

const initialState = { error: '', success: '' };

export default function RegisterSupplierPage() {
    const [state, formAction, isPending] = useActionState(
        registerSupplierAction,
        initialState
    );

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
            <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Login</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Registrasi Supplier
            </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Building2 className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white">Pendaftaran Mitra Supplier</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                Akun baru berstatus Pending hingga diverifikasi oleh Admin gudang
                </p>
            </div>
            </div>

            {state?.error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{state.error}</span>
            </div>
            )}

            {state?.success && (
            <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-300 space-y-3">
                <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <span>{state.success}</span>
                </div>
                <Link
                href="/login"
                className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                >
                Ke Halaman Login
                </Link>
            </div>
            )}

            <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Nama PIC / Kontak
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Hendra Wijaya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
                </div>

                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Nama Perusahaan
                </label>
                <input
                    type="text"
                    name="company_name"
                    required
                    placeholder="PT Komponen Nusantara"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Email Perusahaan
                </label>
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="sales@supplier.co.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
                </div>

                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Nomor Telepon
                </label>
                <input
                    type="text"
                    name="phone"
                    required
                    placeholder="021-5550123"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Alamat Gudang / Kantor Supplier
                </label>
                <textarea
                name="address"
                rows={2}
                required
                placeholder="Alamat lengkap pengiriman & kantor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
                </div>

                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Konfirmasi Password
                </label>
                <input
                    type="password"
                    name="confirm_password"
                    required
                    placeholder="Ulangi password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition cursor-pointer"
            >
                {isPending ? 'Mendaftarkan Akun...' : 'Ajukan Pendaftaran Supplier'}
            </button>
            </form>
        </div>
        </div>
    );
}