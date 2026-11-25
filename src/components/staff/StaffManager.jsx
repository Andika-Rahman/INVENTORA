'use client';

import { useState } from 'react';
import {
    Users,
    UserPlus,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Trash2,
    X,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Lock,
    User,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { createStaffAction, deleteStaffAction } from '@/actions/staffActions';

export default function StaffManager({ staffList }) {
    const [showModal, setShowModal] = useState(false);
    const [busy, setBusy] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [modalError, setModalError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    async function handleCreateSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setModalError('');
        setFeedback({ error: '', success: '' });

        const formData = new FormData(event.currentTarget);
        const res = await createStaffAction(formData);
        setBusy(false);

        if (res?.error) {
        setModalError(res.error);
        } else {
        setShowModal(false);
        setShowPassword(false);
        setFeedback({ error: '', success: res.success });
        }
    }

    async function handleDelete(staff) {
        const confirmed = window.confirm(
        `Hapus akun Staff Gudang "${staff.name}" (${staff.email})?`
        );
        if (!confirmed) return;

        setDeletingId(staff.id);
        setFeedback({ error: '', success: '' });
        const res = await deleteStaffAction(staff.id);
        setDeletingId(null);

        if (res?.error) {
        setFeedback({ error: res.error, success: '' });
        } else {
        setFeedback({ error: '', success: res.success });
        }
    }

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Manajemen Akun Staff Gudang
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Tambahkan dan kelola akun operasional Staff Gudang INVENTORA
            </p>
            </div>

            <button
            type="button"
            onClick={() => {
                setModalError('');
                setShowPassword(false);
                setShowModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm shadow-red-600/20 transition cursor-pointer self-start sm:self-auto"
            >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Staff Baru</span>
            </button>
        </div>

        {feedback.error && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{feedback.error}</span>
            </div>
            <button
                type="button"
                onClick={() => setFeedback({ error: '', success: '' })}
                className="font-semibold text-red-700 dark:text-red-300 hover:underline cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        {feedback.success && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{feedback.success}</span>
            </div>
            <button
                type="button"
                onClick={() => setFeedback({ error: '', success: '' })}
                className="font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        {staffList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-sm text-slate-500 dark:text-zinc-400">
            Belum ada akun Staff Gudang terdaftar.
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {staffList.map((staff) => {
                const hasTransactions = Number(staff.transaction_count || 0) > 0;

                return (
                <div
                    key={staff.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs"
                >
                    <div className="h-1 w-full bg-linear-to-r from-emerald-600 via-slate-200 to-red-600 dark:via-zinc-700" />

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {staff.avatar_url ? (
                            <img
                                src={staff.avatar_url}
                                alt={staff.name}
                                className="w-11 h-11 rounded-xl object-cover border border-emerald-400 shrink-0"
                            />
                            ) : (
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            )}
                            <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                {staff.name}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                {staff.company_name || 'INVENTORA Warehouse HQ'}
                            </p>
                            </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Staff Aktif</span>
                        </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{staff.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{staff.address || '-'}</span>
                        </div>
                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                            <span>Terdaftar {formatDate(staff.created_at)}</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {staff.transaction_count} Transaksi Dicatat
                            </span>
                        </div>
                        </div>
                    </div>

                    {hasTransactions ? (
                        <div className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-600 dark:text-zinc-400 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Akun terikat riwayat transaksi gudang</span>
                        </div>
                    ) : (
                        <button
                        type="button"
                        disabled={deletingId === staff.id}
                        onClick={() => handleDelete(staff)}
                        className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                        <Trash2 className="w-4 h-4" />
                        <span>
                            {deletingId === staff.id ? 'Menghapus...' : 'Hapus Akun Staff'}
                        </span>
                        </button>
                    )}
                    </div>
                </div>
                );
            })}
            </div>
        )}

        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        Tambah Akun Staff Gudang
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Akun baru langsung aktif untuk mengakses operasional gudang
                    </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>

                {modalError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{modalError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Nama Lengkap Staff
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type="text"
                        name="name"
                        required
                        placeholder="Contoh: Deni Pratama (Staff)"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Email Login Staff
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type="email"
                        name="email"
                        required
                        placeholder="staff2@inventora.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Nomor Telepon
                    </label>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type="text"
                        name="phone"
                        required
                        placeholder="081234567804"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Alamat / Penempatan
                    </label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type="text"
                        name="address"
                        required
                        placeholder="INVENTORA Warehouse HQ"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Kata Sandi Awal
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
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

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirm_password"
                        required
                        placeholder="Ulangi kata sandi"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={busy}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                    >
                    {busy ? 'Menyimpan...' : 'Simpan Akun Staff'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
}