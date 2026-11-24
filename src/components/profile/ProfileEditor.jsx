'use client';

import { useState, useActionState } from 'react';
import {
    Camera,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    ShieldCheck,
    Lock,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { updateProfileAction } from '@/actions/profileActions';

const initialState = { error: '', success: '' };

const roleLabels = {
    admin: 'Administrator',
    warehouse_manager: 'Warehouse Manager',
    staff_gudang: 'Staff Gudang',
    supplier: 'Mitra Supplier',
};

export default function ProfileEditor({ user }) {
    const [state, formAction, isPending] = useActionState(
        updateProfileAction,
        initialState
    );
    const [previewUrl, setPreviewUrl] = useState(user.avatar_url || '');

    function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Pengaturan Profil Akun
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Perbarui foto profil, informasi kontak, dan keamanan kata sandi akun Anda
            </p>
        </div>

        {state?.error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{state.error}</span>
            </div>
        )}

        {state?.success && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{state.success}</span>
            </div>
        )}

        <form action={formAction} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs h-fit">
            <div className="h-16 bg-linear-to-r from-red-600 via-white to-emerald-600" />
            <div className="p-6 -mt-10 flex flex-col items-center text-center">
                <div className="relative group">
                {previewUrl ? (
                    <img
                    src={previewUrl}
                    alt={user.name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-zinc-900 shadow-md bg-white"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-md flex items-center justify-center text-red-600 dark:text-red-400">
                    <User className="w-10 h-10" />
                    </div>
                )}

                <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center cursor-pointer transition"
                >
                    <Camera className="w-4 h-4" />
                    <input
                    id="avatar-upload"
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    />
                </label>
                </div>

                <h2 className="mt-4 font-bold text-slate-900 dark:text-white text-base">
                {user.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {user.email}
                </p>

                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{roleLabels[user.role] || user.role}</span>
                </span>

                <p className="mt-4 text-[11px] text-slate-400 dark:text-zinc-500">
                Klik ikon kamera hijau untuk mengganti foto profil (JPG, PNG, WEBP maks. 2MB)
                </p>
            </div>
            </div>

            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Informasi Identitas & Kontak
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nama Lengkap / PIC
                </label>
                <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                    type="text"
                    name="name"
                    required
                    defaultValue={user.name}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                </div>
                </div>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Email Akun (Tidak dapat diubah)
                </label>
                <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 text-sm cursor-not-allowed"
                    />
                </div>
                </div>

                {user.role === 'supplier' && (
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nama Perusahaan Supplier
                    </label>
                    <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        name="company_name"
                        defaultValue={user.company_name || ''}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>
                </div>
                )}

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Nomor Telepon
                </label>
                <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                    type="text"
                    name="phone"
                    defaultValue={user.phone || ''}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                </div>
                </div>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Alamat / Lokasi Kerja
                </label>
                <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                    type="text"
                    name="address"
                    defaultValue={user.address || ''}
                    placeholder="Alamat gudang / perusahaan"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-zinc-800 pt-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
                Ubah Kata Sandi (Opsional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Kata Sandi Saat Ini
                    </label>
                    <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        name="current_password"
                        placeholder="Kosongkan jika tidak diubah"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Kata Sandi Baru
                    </label>
                    <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        name="new_password"
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>
                </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
                >
                {isPending ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}
                </button>
            </div>
            </div>
        </form>
        </div>
    );
}