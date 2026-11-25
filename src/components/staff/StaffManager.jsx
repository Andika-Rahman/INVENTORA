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
    RotateCcw,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import {
    createStaffAction,
    deleteStaffAction,
    reactivateStaffAction,
} from '@/actions/staffActions';

export default function StaffManager({ staffList }) {
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [busy, setBusy] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [modalError, setModalError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const managerCount = staffList.filter((u) => u.role === 'warehouse_manager').length;
    const staffCount = staffList.filter((u) => u.role === 'staff_gudang').length;

    const filteredList =
        roleFilter === 'ALL'
        ? staffList
        : staffList.filter((member) => member.role === roleFilter);

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
        return;
        }

        setFeedback({ error: '', success: res.success });
        setShowModal(false);
        setShowPassword(false);
        event.currentTarget.reset();
    }

    async function handleDeleteOrDisable(member) {
        const hasActivity = (member.transaction_count || 0) + (member.po_count || 0) > 0;
        const roleLabel =
        member.role === 'warehouse_manager' ? 'Warehouse Manager' : 'Staff Gudang';

        const confirmMessage = hasActivity
        ? `Akun ${roleLabel} "${member.name}" sudah memiliki riwayat transaksi/PO sehingga akan dinonaktifkan (Terminated) agar jejak audit tetap aman. Lanjutkan?`
        : `Hapus akun ${roleLabel} "${member.name}" secara permanen?`;

        if (!window.confirm(confirmMessage)) return;

        setProcessingId(member.id);
        setFeedback({ error: '', success: '' });
        const res = await deleteStaffAction(member.id);
        setProcessingId(null);

        if (res?.error) {
        setFeedback({ error: res.error, success: '' });
        } else {
        setFeedback({ error: '', success: res.success });
        }
    }

    async function handleReactivate(member) {
        if (!window.confirm(`Aktifkan kembali akses login untuk "${member.name}"?`)) return;

        setProcessingId(member.id);
        setFeedback({ error: '', success: '' });
        const res = await reactivateStaffAction(member.id);
        setProcessingId(null);

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
                Manajemen Manager &amp; Staff Gudang
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Kelola akun internal Warehouse Manager dan Staff Gudang yang memiliki akses operasional INVENTORA
            </p>
            </div>

            <button
            type="button"
            onClick={() => {
                setModalError('');
                setShowPassword(false);
                setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm shadow-red-600/20 transition cursor-pointer self-start"
            >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Manager / Staff</span>
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => setRoleFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                roleFilter === 'ALL'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
            >
                Semua ({staffList.length})
            </button>

            <button
                type="button"
                onClick={() => setRoleFilter('warehouse_manager')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                roleFilter === 'warehouse_manager'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
            >
                Warehouse Manager ({managerCount})
            </button>

            <button
                type="button"
                onClick={() => setRoleFilter('staff_gudang')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                roleFilter === 'staff_gudang'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
            >
                Staff Gudang ({staffCount})
            </button>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
                {managerCount} Manager • {staffCount} Staff Gudang
            </span>
            </div>
        </div>

        {filteredList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-sm text-slate-500 dark:text-zinc-400">
            Belum ada akun pada kategori peran ini.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((member) => {
                const isManager = member.role === 'warehouse_manager';
                const isTerminated = member.status === 'Terminated';
                const totalHistory =
                (member.transaction_count || 0) + (member.po_count || 0);

                return (
                <div
                    key={member.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs"
                >
                    <div
                    className={`h-1 w-full ${
                        isManager
                        ? 'bg-linear-to-r from-red-600 via-white to-emerald-600'
                        : 'bg-linear-to-r from-emerald-600 via-slate-200 to-red-600 dark:via-zinc-700'
                    }`}
                    />

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                isManager
                                ? 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30'
                                : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            }`}
                            >
                            {member.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                            <h2 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {member.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                    isManager
                                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30'
                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                                }`}
                                >
                                <ShieldCheck className="w-3 h-3" />
                                <span>
                                    {isManager ? 'Warehouse Manager' : 'Staff Gudang'}
                                </span>
                                </span>

                                <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                    isTerminated
                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                                }`}
                                >
                                {member.status}
                                </span>
                            </div>
                            </div>
                        </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400 pt-1">
                        <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span className="truncate">{member.email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{member.phone || 'Belum ada nomor telepon'}</span>
                        </div>

                        <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                            {member.address || 'INVENTORA Warehouse HQ'}
                            </span>
                        </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        <p>Bergabung: {formatDate(member.created_at)}</p>
                        <p className="font-medium text-slate-700 dark:text-zinc-300">
                            Aktivitas: {totalHistory} dokumen
                        </p>
                        </div>

                        {isTerminated ? (
                        <button
                            type="button"
                            disabled={processingId === member.id}
                            onClick={() => handleReactivate(member)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Aktifkan</span>
                        </button>
                        ) : (
                        <button
                            type="button"
                            disabled={processingId === member.id}
                            onClick={() => handleDeleteOrDisable(member)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>
                            {processingId === member.id
                                ? 'Memproses...'
                                : totalHistory > 0
                                ? 'Nonaktifkan'
                                : 'Hapus'}
                            </span>
                        </button>
                        )}
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        )}

        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-8">
                <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

                <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Tambah Akun Tim Gudang
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Akun baru langsung aktif (Approved) untuk masuk ke sistem
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
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{modalError}</span>
                    </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Peran / Jabatan Sistem
                    </label>
                    <select
                        name="role"
                        required
                        defaultValue="staff_gudang"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm font-medium focus:outline-none focus:border-red-500"
                    >
                        <option value="staff_gudang">Staff Gudang (Operasional &amp; Cek Fisik)</option>
                        <option value="warehouse_manager">Warehouse Manager (Kepala Gudang &amp; Approval)</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type="text"
                        name="name"
                        required
                        placeholder="Contoh: Raka Pratama"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Email Login
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type="email"
                        name="email"
                        required
                        placeholder="nama@inventora.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Password Awal
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        minLength={6}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                        type="text"
                        name="phone"
                        placeholder="Contoh: 081234567890"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Alamat / Penempatan Gudang
                    </label>
                    <textarea
                        name="address"
                        rows={2}
                        placeholder="Contoh: Gudang Utama Blok A, Makassar"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
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
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                    >
                        {busy ? 'Menyimpan...' : 'Simpan Akun'}
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}