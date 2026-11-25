'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Plus,
    Trash2,
    Eye,
    Pencil,
    CheckCircle2,
    XCircle,
    Truck,
    X,
    AlertCircle,
    RotateCcw,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import {
    createIncomingTransactionAction,
    createOutgoingTransactionAction,
    editPendingTransactionAction,
    deletePendingTransactionAction,
    approveTransactionAction,
    rejectTransactionAction,
    markTransactionShippedAction,
    } from '@/actions/transactionActions';
import { managerRequestRefundAction } from '@/actions/restockActions';

const initialFormState = { error: '', success: '' };

export default function TransactionManager({
    transactions,
    availablePos,
    suppliers,
    products,
    userId,
    role,
    activeTab,
    preselectedProductId,
    preselectedPoId,
    initialModalType,
    }) {
    const router = useRouter();
    const canRecord = ['staff_gudang', 'admin'].includes(role);
    const canApprove = ['warehouse_manager', 'admin'].includes(role);

    const initialPo = preselectedPoId
        ? availablePos.find((po) => String(po.id) === String(preselectedPoId))
        : null;

    const [incomingModalOpen, setIncomingModalOpen] = useState(
        Boolean(canRecord && (initialModalType === 'IN' || initialPo))
    );
    const [outgoingModalOpen, setOutgoingModalOpen] = useState(
        Boolean(canRecord && initialModalType === 'OUT')
    );

    const [selectedPoId, setSelectedPoId] = useState(
        initialPo ? String(initialPo.id) : ''
    );
    const [selectedSupplierId, setSelectedSupplierId] = useState(
        initialPo ? String(initialPo.supplier_id) : ''
    );
    const [incomingItems, setIncomingItems] = useState(
        initialPo && initialPo.items.length > 0
        ? initialPo.items.map((item) => ({
            productId: String(item.product_id),
            quantity: item.quantity,
            }))
        : [{ productId: preselectedProductId || '', quantity: 1 }]
    );

    const [outgoingItems, setOutgoingItems] = useState([
        { productId: preselectedProductId || '', quantity: 1 },
    ]);

    const [detailTrx, setDetailTrx] = useState(null);
    const [editTrx, setEditTrx] = useState(null);
    const [editItems, setEditItems] = useState([]);
    const [editNotes, setEditNotes] = useState('');

    const [rejectTrx, setRejectTrx] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [busyId, setBusyId] = useState(null);

    const [inState, inFormAction, isCreatingIn] = useActionState(
        createIncomingTransactionAction,
        initialFormState
    );
    const [outState, outFormAction, isCreatingOut] = useActionState(
        createOutgoingTransactionAction,
        initialFormState
    );
    const [editState, editFormAction, isEditing] = useActionState(
        editPendingTransactionAction,
        initialFormState
    );

    useEffect(() => {
        if (inState?.success) {
        const timer = setTimeout(() => {
            setIncomingModalOpen(false);
            setSelectedPoId('');
            setSelectedSupplierId('');
            setIncomingItems([{ productId: '', quantity: 1 }]);
        }, 650);
        return () => clearTimeout(timer);
        }
    }, [inState?.success]);

    useEffect(() => {
        if (outState?.success) {
        const timer = setTimeout(() => {
            setOutgoingModalOpen(false);
            setOutgoingItems([{ productId: '', quantity: 1 }]);
        }, 650);
        return () => clearTimeout(timer);
        }
    }, [outState?.success]);

    useEffect(() => {
        if (editState?.success) {
        const timer = setTimeout(() => {
            setEditTrx(null);
        }, 650);
        return () => clearTimeout(timer);
        }
    }, [editState?.success]);

    const todayStr = new Date().toISOString().split('T')[0];

    function handlePoSelect(poIdValue) {
        setSelectedPoId(poIdValue);
        if (!poIdValue) {
        setSelectedSupplierId('');
        setIncomingItems([{ productId: '', quantity: 1 }]);
        return;
        }

        const foundPo = availablePos.find((po) => String(po.id) === String(poIdValue));
        if (foundPo) {
        setSelectedSupplierId(String(foundPo.supplier_id));
        setIncomingItems(
            foundPo.items.map((item) => ({
            productId: String(item.product_id),
            quantity: item.quantity,
            }))
        );
        }
    }

    function openEditModal(trx) {
        setEditTrx(trx);
        setEditNotes(trx.notes || '');
        setEditItems(
        trx.items.map((item) => ({
            productId: String(item.product_id),
            quantity: item.quantity,
        }))
        );
    }

    async function handleApprove(trxId) {
        setBusyId(trxId);
        setFeedback({ error: '', success: '' });
        const res = await approveTransactionAction(trxId);
        setBusyId(null);
        if (res?.error) setFeedback({ error: res.error, success: '' });
        else setFeedback({ error: '', success: res.success });
    }

    async function handleRejectSubmit(event) {
        event.preventDefault();
        if (!rejectTrx) return;

        setBusyId(rejectTrx.id);
        setFeedback({ error: '', success: '' });
        const res = await rejectTransactionAction(rejectTrx.id, rejectReason);
        setBusyId(null);

        if (res?.error) {
        setFeedback({ error: res.error, success: '' });
        } else {
        setFeedback({ error: '', success: res.success });
        setRejectTrx(null);
        setRejectReason('');
        }
    }

    async function handleRefundAndReorder(trx) {
        if (!trx.restock_order_id) {
        router.push('/dashboard/restocks');
        return;
        }

        setBusyId(trx.id);
        setFeedback({ error: '', success: '' });
        await managerRequestRefundAction(
        trx.restock_order_id,
        trx.rejection_reason || 'Pesanan tidak sesuai dengan permintaan'
        );
        setBusyId(null);
        router.push(`/dashboard/restocks?refund_po_id=${trx.restock_order_id}`);
    }

    async function handleShipped(trxId) {
        setBusyId(trxId);
        setFeedback({ error: '', success: '' });
        const res = await markTransactionShippedAction(trxId);
        setBusyId(null);
        if (res?.error) setFeedback({ error: res.error, success: '' });
        else setFeedback({ error: '', success: res.success });
    }

    async function handleDelete(trx) {
        const confirmed = window.confirm(
        `Hapus transaksi Pending "${trx.transaction_number}"?`
        );
        if (!confirmed) return;

        setBusyId(trx.id);
        setFeedback({ error: '', success: '' });
        const res = await deletePendingTransactionAction(trx.id);
        setBusyId(null);
        if (res?.error) setFeedback({ error: res.error, success: '' });
        else setFeedback({ error: '', success: res.success });
    }

    function getStatusBadge(status) {
        if (status === 'Approved') {
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
        }
        if (status === 'Rejected') {
        return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30';
        }
        if (status === 'Shipped') {
        return 'bg-emerald-600 text-white border-emerald-600';
        }
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30';
    }

    function getStatusLabel(trx) {
        if (trx.type === 'OUT' && trx.status === 'Approved') {
        return 'Approved (Siap Packing)';
        }
        if (trx.type === 'OUT' && trx.status === 'Shipped') {
        return 'Selesai Dikirim';
        }
        return trx.status;
    }

    return (
        <div className="space-y-4">
        {canRecord && (
            <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
                type="button"
                onClick={() => setIncomingModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
            >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Buat Laporan Barang Masuk (IN)</span>
            </button>

            <button
                type="button"
                onClick={() => setOutgoingModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm shadow-red-600/20 transition cursor-pointer"
            >
                <ArrowUpRight className="w-4 h-4" />
                <span>Ajukan Barang Keluar (OUT)</span>
            </button>
            </div>
        )}

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

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="h-1 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950/60">
                    <th className="py-3.5 px-4">No. Transaksi</th>
                    <th className="py-3.5 px-4">Tipe</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Supplier / Tujuan</th>
                    <th className="py-3.5 px-4">Total Item</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
                {transactions.length === 0 ? (
                    <tr>
                    <td
                        colSpan={7}
                        className="py-10 text-center text-slate-500 dark:text-zinc-400 text-sm"
                    >
                        Tidak ada data transaksi pada kategori ini.
                    </td>
                    </tr>
                ) : (
                    transactions.map((trx) => {
                    const canEditOrDelete =
                        trx.status === 'Pending' &&
                        (role === 'admin' ||
                        (role === 'staff_gudang' && trx.created_by === userId));

                    return (
                        <tr
                        key={trx.id}
                        className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                        <td className="py-3.5 px-4">
                            <p className="font-mono font-bold text-slate-900 dark:text-white">
                            {trx.transaction_number}
                            </p>
                            {trx.po_number && (
                            <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                                Ref: {trx.po_number}
                            </p>
                            )}
                        </td>

                        <td className="py-3.5 px-4">
                            {trx.type === 'IN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25 font-semibold">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                <span>Barang Masuk</span>
                            </span>
                            ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/25 font-semibold">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>Barang Keluar</span>
                            </span>
                            )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                            {formatDate(trx.transaction_date)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-800 dark:text-zinc-200 font-medium">
                            {trx.type === 'IN'
                            ? trx.supplier_company || trx.supplier_name || '-'
                            : trx.customer_name || '-'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                            {trx.items.length} jenis ({trx.total_qty} unit)
                        </td>

                        <td className="py-3.5 px-4">
                            <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                                trx.status
                            )}`}
                            >
                            {getStatusLabel(trx)}
                            </span>
                        </td>

                        <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                            <button
                                type="button"
                                onClick={() => setDetailTrx(trx)}
                                title="Detail Transaksi"
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
                            >
                                <Eye className="w-4 h-4" />
                            </button>

                            {canApprove && trx.status === 'Pending' && (
                                <>
                                <button
                                    type="button"
                                    disabled={busyId === trx.id}
                                    onClick={() => handleApprove(trx.id)}
                                    title="Konfirmasi / Approve Transaksi"
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Konfirmasi</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={busyId === trx.id}
                                    onClick={() => {
                                    setRejectReason('');
                                    setRejectTrx(trx);
                                    }}
                                    title="Tolak Transaksi"
                                    className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Tolak</span>
                                </button>
                                </>
                            )}

                            {canApprove &&
                                trx.type === 'IN' &&
                                trx.status === 'Rejected' &&
                                trx.restock_order_id &&
                                trx.po_status !== 'Refund Diajukan' && (
                                <button
                                    type="button"
                                    disabled={busyId === trx.id}
                                    onClick={() => handleRefundAndReorder(trx)}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Ajukan Refund & Pesan Baru</span>
                                </button>
                                )}

                            {canRecord && trx.type === 'OUT' && trx.status === 'Approved' && (
                                <button
                                type="button"
                                disabled={busyId === trx.id}
                                onClick={() => handleShipped(trx.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Kirim Barang (Selesai)</span>
                                </button>
                            )}

                            {canEditOrDelete && (
                                <>
                                <button
                                    type="button"
                                    onClick={() => openEditModal(trx)}
                                    title="Edit Transaksi Pending"
                                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    disabled={busyId === trx.id}
                                    onClick={() => handleDelete(trx)}
                                    title="Hapus Transaksi Pending"
                                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 transition cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </>
                            )}
                            </div>
                        </td>
                        </tr>
                    );
                    })
                )}
                </tbody>
            </table>
            </div>
        </div>

        {detailTrx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                    {detailTrx.transaction_number}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {detailTrx.type === 'IN'
                        ? 'Laporan Pemeriksaan Barang Masuk'
                        : 'Pengajuan & Pengiriman Barang Keluar'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setDetailTrx(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Tanggal</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                    {formatDate(detailTrx.transaction_date)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Status</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                    {getStatusLabel(detailTrx)}
                    </span>
                </div>
                {detailTrx.po_number && (
                    <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Nomor PO</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {detailTrx.po_number}
                    </span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">
                    {detailTrx.type === 'IN' ? 'Supplier' : 'Customer / Tujuan'}
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                    {detailTrx.type === 'IN'
                        ? detailTrx.supplier_company || detailTrx.supplier_name || '-'
                        : detailTrx.customer_name || '-'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Dicatat Oleh</span>
                    <span className="text-slate-800 dark:text-zinc-200">
                    {detailTrx.created_by_name}
                    </span>
                </div>
                {detailTrx.approved_by_name && (
                    <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Diproses Oleh</span>
                    <span className="text-slate-800 dark:text-zinc-200">
                        {detailTrx.approved_by_name}
                    </span>
                    </div>
                )}
                </div>

                {detailTrx.rejection_reason && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 space-y-2">
                    <p>
                    <strong>Alasan Penolakan (Tidak Sesuai):</strong> {detailTrx.rejection_reason}
                    </p>
                    {canApprove &&
                    detailTrx.type === 'IN' &&
                    detailTrx.restock_order_id &&
                    detailTrx.po_status !== 'Refund Diajukan' && (
                        <button
                        type="button"
                        disabled={busyId === detailTrx.id}
                        onClick={() => handleRefundAndReorder(detailTrx)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Ajukan Refund & Buat Pesanan Baru</span>
                        </button>
                    )}
                </div>
                )}

                <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Rincian Item Komponen
                </p>
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
                    {detailTrx.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                        <div>
                        <p className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                            {item.sku}
                        </p>
                        <p className="text-slate-900 dark:text-white font-medium">
                            {item.product_name}
                        </p>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                        {item.quantity} {item.unit}
                        </span>
                    </div>
                    ))}
                </div>
                </div>

                {detailTrx.notes && (
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                    <strong className="text-slate-800 dark:text-zinc-300">Catatan / Laporan:</strong>{' '}
                    {detailTrx.notes}
                </p>
                )}
            </div>
            </div>
        )}

        {incomingModalOpen && canRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-8">
                <div className="h-1.5 w-full bg-linear-to-r from-emerald-600 via-white to-red-600" />

                <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Buat Laporan Barang Masuk (Incoming)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Pilih Nomor PO berstatus Pesanan Diperiksa / Received untuk melaporkan hasil cek fisik ke Manager
                    </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => setIncomingModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>

                {inState?.error && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{inState.error}</span>
                    </div>
                )}

                {inState?.success && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{inState.success}</span>
                    </div>
                )}

                <form action={inFormAction} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Tanggal Pemeriksaan & Penerimaan
                        </label>
                        <input
                        type="date"
                        name="transaction_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Nomor PO (Pesanan Diperiksa / Received)
                        </label>
                        <select
                        name="restock_order_id"
                        value={selectedPoId}
                        onChange={(e) => handlePoSelect(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                        >
                        <option value="">-- Tanpa PO (Penerimaan Langsung) --</option>
                        {availablePos.map((po) => (
                            <option key={po.id} value={po.id}>
                            {po.po_number} ({po.status}) - {po.supplier_company || po.supplier_name}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Supplier Pengirim
                    </label>
                    <select
                        name="supplier_id"
                        required
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">-- Pilih Supplier --</option>
                        {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                            {sup.company_name || sup.name}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Hasil Cek Fisik Produk Diterima
                        </label>
                        <button
                        type="button"
                        onClick={() =>
                            setIncomingItems((prev) => [...prev, { productId: '', quantity: 1 }])
                        }
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Baris</span>
                        </button>
                    </div>

                    {incomingItems.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                        <select
                            name="product_id"
                            required
                            value={row.productId}
                            onChange={(e) =>
                            setIncomingItems((prev) =>
                                prev.map((item, i) =>
                                i === idx ? { ...item, productId: e.target.value } : item
                                )
                            )
                            }
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                        >
                            <option value="">-- Pilih Komponen --</option>
                            {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                                [{prod.sku}] {prod.name} (Stok: {prod.stock} {prod.unit})
                            </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            required
                            value={row.quantity}
                            onChange={(e) =>
                            setIncomingItems((prev) =>
                                prev.map((item, i) =>
                                i === idx ? { ...item, quantity: e.target.value } : item
                                )
                            )
                            }
                            className="w-24 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                        />

                        {incomingItems.length > 1 && (
                            <button
                            type="button"
                            onClick={() =>
                                setIncomingItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 cursor-pointer"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        </div>
                    ))}
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Laporan Hasil Pemeriksaan Barang
                    </label>
                    <textarea
                        name="notes"
                        rows={2}
                        placeholder="Tuliskan hasil pengecekan fisik, nomor surat jalan, dan kesesuaian jumlah"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setIncomingModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isCreatingIn}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                        {isCreatingIn ? 'Mengirim Laporan...' : 'Kirim Laporan ke Manager'}
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}

        {outgoingModalOpen && canRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-8">
                <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

                <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Ajukan Barang Keluar (Outgoing)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Stok akan berkurang saat barang selesai di-packing dan dikirim setelah konfirmasi Manager
                    </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => setOutgoingModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>

                {outState?.error && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{outState.error}</span>
                    </div>
                )}

                {outState?.success && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{outState.success}</span>
                    </div>
                )}

                <form action={outFormAction} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Tanggal Pengajuan
                        </label>
                        <input
                        type="date"
                        name="transaction_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Nama Customer / Divisi Tujuan
                        </label>
                        <input
                        type="text"
                        name="customer_name"
                        required
                        placeholder="Contoh: Toko Komputer Bintang / Teknisi Servis"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Daftar Produk Keluar
                        </label>
                        <button
                        type="button"
                        onClick={() =>
                            setOutgoingItems((prev) => [...prev, { productId: '', quantity: 1 }])
                        }
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Baris</span>
                        </button>
                    </div>

                    {outgoingItems.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                        <select
                            name="product_id"
                            required
                            value={row.productId}
                            onChange={(e) =>
                            setOutgoingItems((prev) =>
                                prev.map((item, i) =>
                                i === idx ? { ...item, productId: e.target.value } : item
                                )
                            )
                            }
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-red-500"
                        >
                            <option value="">-- Pilih Komponen --</option>
                            {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                                [{prod.sku}] {prod.name} (Tersedia: {prod.stock} {prod.unit})
                            </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            required
                            value={row.quantity}
                            onChange={(e) =>
                            setOutgoingItems((prev) =>
                                prev.map((item, i) =>
                                i === idx ? { ...item, quantity: e.target.value } : item
                                )
                            )
                            }
                            className="w-24 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-red-500"
                        />

                        {outgoingItems.length > 1 && (
                            <button
                            type="button"
                            onClick={() =>
                                setOutgoingItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 cursor-pointer"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        </div>
                    ))}
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Catatan Pengeluaran
                    </label>
                    <textarea
                        name="notes"
                        rows={2}
                        placeholder="Keterangan permintaan atau nomor invoice tujuan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setOutgoingModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isCreatingOut}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                    >
                        {isCreatingOut ? 'Mengajukan...' : 'Ajukan ke Manager'}
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}

        {editTrx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl my-8">
                <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Edit Transaksi Pending ({editTrx.transaction_number})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Hanya produk, quantity, dan catatan yang dapat diubah sebelum dikonfirmasi Manager
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setEditTrx(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                {editState?.error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{editState.error}</span>
                </div>
                )}

                {editState?.success && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{editState.success}</span>
                </div>
                )}

                <form action={editFormAction} className="space-y-4">
                <input type="hidden" name="transaction_id" value={editTrx.id} />

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Daftar Produk
                    </label>
                    <button
                        type="button"
                        onClick={() =>
                        setEditItems((prev) => [...prev, { productId: '', quantity: 1 }])
                        }
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Baris</span>
                    </button>
                    </div>

                    {editItems.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <select
                        name="product_id"
                        required
                        value={row.productId}
                        onChange={(e) =>
                            setEditItems((prev) =>
                            prev.map((item, i) =>
                                i === idx ? { ...item, productId: e.target.value } : item
                            )
                            )
                        }
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                        >
                        <option value="">-- Pilih Komponen --</option>
                        {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                            [{prod.sku}] {prod.name} (Stok: {prod.stock} {prod.unit})
                            </option>
                        ))}
                        </select>

                        <input
                        type="number"
                        name="quantity"
                        min="1"
                        required
                        value={row.quantity}
                        onChange={(e) =>
                            setEditItems((prev) =>
                            prev.map((item, i) =>
                                i === idx ? { ...item, quantity: e.target.value } : item
                            )
                            )
                        }
                        className="w-24 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                        />

                        {editItems.length > 1 && (
                        <button
                            type="button"
                            onClick={() =>
                            setEditItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                    </div>
                    ))}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Catatan
                    </label>
                    <textarea
                    name="notes"
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <button
                    type="button"
                    onClick={() => setEditTrx(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isEditing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isEditing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {rejectTrx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
                onSubmit={handleRejectSubmit}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Tolak Transaksi</h3>
                <button
                    type="button"
                    onClick={() => setRejectTrx(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                Nomor Transaksi:{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                    {rejectTrx.transaction_number}
                </strong>
                . Jika pesanan tidak sesuai permintaan, Anda dapat mengajukan refund dan membuat
                pesanan baru setelah menolak.
                </p>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Alasan Ketidaksesuaian / Penolakan (Wajib)
                </label>
                <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Jumlah atau tipe komponen tidak sesuai dengan PO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRejectTrx(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyId === rejectTrx.id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                    Konfirmasi Tolak
                </button>
                </div>
            </form>
            </div>
        )}
        </div>
    );
}