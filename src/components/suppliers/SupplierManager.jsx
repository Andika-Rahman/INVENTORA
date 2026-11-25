'use client';

import { useState } from 'react';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    X,
    Trash2,
    Truck,
    Ban,
} from 'lucide-react';
import ExportCsvButton from '@/components/ui/ExportCsvButton';
import { formatDate } from '@/lib/formatters';
import {
    updateSupplierStatusAction,
    deleteSupplierAction,
} from '@/actions/supplierActions';

export default function SupplierManager({ suppliers }) {
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [busyId, setBusyId] = useState(null);
    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [terminationReason, setTerminationReason] = useState('');

    const filteredSuppliers = suppliers.filter((sup) => {
        if (activeTab === 'ACTIVE') return sup.status !== 'Terminated';
        return sup.status === activeTab;
    });

    async function handleApprove(supplierId) {
        setBusyId(supplierId);
        setFeedback({ error: '', success: '' });
        const res = await updateSupplierStatusAction(supplierId, 'Approved', '');
        setBusyId(null);

        if (res?.error) {
        setFeedback({ error: res.error, success: '' });
        } else {
        setFeedback({ error: '', success: res.success });
        }
    }

    async function handleRejectSubmit(event) {
        event.preventDefault();
        if (!rejectTarget) return;

        setBusyId(rejectTarget.id);
        setFeedback({ error: '', success: '' });
        const res = await updateSupplierStatusAction(
        rejectTarget.id,
        'Rejected',
        rejectReason
        );
        setBusyId(null);

        if (res?.error) {
        setFeedback({ error: res.error, success: '' });
        } else {
        setFeedback({ error: '', success: res.success });
        setRejectTarget(null);
        setRejectReason('');
        }
    }

    async function handleDeleteSubmit(event) {
        event.preventDefault();
        if (!deleteTarget) return;

        setBusyId(deleteTarget.id);
        setFeedback({ error: '', success: '' });
        const res = await deleteSupplierAction(deleteTarget.id, terminationReason);
        setBusyId(null);

        if (res?.error) {
        setFeedback({ error: res.error, success: '' });
        } else {
        setFeedback({ error: '', success: res.success });
        setDeleteTarget(null);
        setTerminationReason('');
        }
    }

    const tabs = [
        { key: 'ACTIVE', label: 'Semua Mitra Aktif' },
        { key: 'Pending', label: 'Menunggu Approval' },
        { key: 'Approved', label: 'Approved' },
        { key: 'Rejected', label: 'Rejected' },
        { key: 'Terminated', label: 'Diberhentikan' },
    ];

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Verifikasi & Manajemen Supplier
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Kelola pendaftaran mitra supplier dan pemberhentian kerjasama gudang
            </p>
            </div>

            <ExportCsvButton moduleName="suppliers" label="Export Supplier (CSV)" />
        </div>

        <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
            <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                activeTab === tab.key
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
            >
                {tab.label}
            </button>
            ))}
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

        {filteredSuppliers.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-sm text-slate-500 dark:text-zinc-400">
            Tidak ada data supplier pada kategori status ini.
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSuppliers.map((sup) => {
                const hasActiveShipment = Number(sup.active_deliveries || 0) > 0;

                return (
                <div
                    key={sup.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs"
                >
                    <div className="h-1 w-full bg-linear-to-r from-red-600 via-slate-200 to-emerald-600 dark:via-zinc-700" />

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-base">
                                {sup.company_name || sup.name}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                PIC: {sup.name}
                            </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                            {sup.status === 'Approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approved</span>
                            </span>
                            )}

                            {sup.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/25">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pending</span>
                            </span>
                            )}

                            {sup.status === 'Rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/25">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejected</span>
                            </span>
                            )}

                            {sup.status === 'Terminated' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700">
                                <Ban className="w-3.5 h-3.5" />
                                <span>Diberhentikan</span>
                            </span>
                            )}

                            {hasActiveShipment && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white">
                                <Truck className="w-3 h-3" />
                                <span>{sup.active_deliveries} Pengiriman Aktif</span>
                            </span>
                            )}
                        </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{sup.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{sup.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                            <span>{sup.address || '-'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                            Terdaftar pada {formatDate(sup.created_at)}
                        </p>
                        </div>

                        {sup.termination_reason && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-xs text-red-800 dark:text-red-300">
                            <span className="font-semibold">Catatan / Alasan: </span>
                            <span>{sup.termination_reason}</span>
                        </div>
                        )}
                    </div>

                    {sup.status === 'Pending' && (
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                            type="button"
                            disabled={busyId === sup.id}
                            onClick={() => handleApprove(sup.id)}
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve</span>
                        </button>

                        <button
                            type="button"
                            disabled={busyId === sup.id}
                            onClick={() => {
                            setRejectReason('');
                            setRejectTarget(sup);
                            }}
                            className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                        </button>
                        </div>
                    )}

                    {sup.status !== 'Pending' && sup.status !== 'Terminated' && (
                        <div className="pt-1">
                        {hasActiveShipment ? (
                            <div className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 shrink-0" />
                            <span>Tidak dapat dihapus saat pengiriman berlangsung</span>
                            </div>
                        ) : (
                            <button
                            type="button"
                            disabled={busyId === sup.id}
                            onClick={() => {
                                setTerminationReason('');
                                setDeleteTarget(sup);
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus & Berhentikan Kerjasama</span>
                            </button>
                        )}
                        </div>
                    )}
                    </div>
                </div>
                );
            })}
            </div>
        )}

        {rejectTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
                onSubmit={handleRejectSubmit}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                    Tolak Pendaftaran Supplier
                </h3>
                <button
                    type="button"
                    onClick={() => setRejectTarget(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                Mitra Supplier:{' '}
                <strong className="text-slate-900 dark:text-white">
                    {rejectTarget.company_name || rejectTarget.name}
                </strong>
                . Alasan penolakan wajib diisi.
                </p>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Alasan Penolakan (Wajib)
                </label>
                <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Dokumen legalitas perusahaan belum lengkap"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRejectTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyId === rejectTarget.id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                    Konfirmasi Tolak
                </button>
                </div>
            </form>
            </div>
        )}

        {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
                onSubmit={handleDeleteSubmit}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                    Pemberhentian Kerjasama Supplier
                </h3>
                <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Anda akan menghapus{' '}
                <strong className="text-slate-900 dark:text-white">
                    {deleteTarget.company_name || deleteTarget.name}
                </strong>{' '}
                dari daftar mitra gudang. Tuliskan alasan pemberhentian kerjasama secara jelas.
                </p>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Alasan Pemberhentian Kerjasama dengan Gudang (Wajib)
                </label>
                <textarea
                    rows={3}
                    required
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    placeholder="Contoh: Kontrak pengadaan komponen telah berakhir / evaluasi kualitas barang"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyId === deleteTarget.id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                    {busyId === deleteTarget.id ? 'Memproses...' : 'Hapus Supplier'}
                </button>
                </div>
            </form>
            </div>
        )}
        </div>
    );
    }