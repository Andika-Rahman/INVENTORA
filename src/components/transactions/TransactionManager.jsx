'use client';

import { useState, useActionState, useEffect } from 'react';
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
    initialModalType,
    }) {
    const canRecord = ['staff_gudang', 'admin'].includes(role);
    const canApprove = ['warehouse_manager', 'admin'].includes(role);
    const isSupplier = role === 'supplier';

    const [incomingModalOpen, setIncomingModalOpen] = useState(
        Boolean(canRecord && initialModalType === 'IN')
    );
    const [outgoingModalOpen, setOutgoingModalOpen] = useState(
        Boolean(canRecord && initialModalType === 'OUT')
    );

    const [selectedPoId, setSelectedPoId] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [incomingItems, setIncomingItems] = useState([
        { productId: preselectedProductId || '', quantity: 1 },
    ]);

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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        }
        if (status === 'Rejected') {
        return 'bg-red-500/10 text-red-400 border-red-500/30';
        }
        if (status === 'Shipped') {
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        }
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }

    return (
        <div className="space-y-4">
        {canRecord && (
            <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
                type="button"
                onClick={() => setIncomingModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
            >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Catat Barang Masuk (IN)</span>
            </button>

            <button
                type="button"
                onClick={() => setOutgoingModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
            >
                <ArrowUpRight className="w-4 h-4" />
                <span>Catat Barang Keluar (OUT)</span>
            </button>
            </div>
        )}

        {feedback.error && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{feedback.error}</span>
            </div>
            <button
                type="button"
                onClick={() => setFeedback({ error: '', success: '' })}
                className="text-red-400 hover:text-white cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        {feedback.success && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedback.success}</span>
            </div>
            <button
                type="button"
                onClick={() => setFeedback({ error: '', success: '' })}
                className="text-emerald-400 hover:text-white cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                    <th className="py-3.5 px-4">No. Transaksi</th>
                    <th className="py-3.5 px-4">Tipe</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Supplier / Tujuan</th>
                    <th className="py-3.5 px-4">Total Item</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                {transactions.length === 0 ? (
                    <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
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
                        <tr key={trx.id} className="hover:bg-slate-800/35 transition-colors">
                        <td className="py-3.5 px-4">
                            <p className="font-mono font-bold text-white">
                            {trx.transaction_number}
                            </p>
                            {trx.po_number && (
                            <p className="text-[11px] font-mono text-blue-400 mt-0.5">
                                Ref: {trx.po_number}
                            </p>
                            )}
                        </td>

                        <td className="py-3.5 px-4">
                            {trx.type === 'IN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                <span>Barang Masuk</span>
                            </span>
                            ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>Barang Keluar</span>
                            </span>
                            )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                            {formatDate(trx.transaction_date)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-200 font-medium">
                            {trx.type === 'IN'
                            ? trx.supplier_company || trx.supplier_name || '-'
                            : trx.customer_name || '-'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                            {trx.items.length} jenis ({trx.total_qty} unit)
                        </td>

                        <td className="py-3.5 px-4">
                            <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                                trx.status
                            )}`}
                            >
                            {trx.status}
                            </span>
                        </td>

                        <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                            <button
                                type="button"
                                onClick={() => setDetailTrx(trx)}
                                title="Detail Transaksi"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition cursor-pointer"
                            >
                                <Eye className="w-4 h-4" />
                            </button>

                            {canApprove && trx.status === 'Pending' && (
                                <>
                                <button
                                    type="button"
                                    disabled={busyId === trx.id}
                                    onClick={() => handleApprove(trx.id)}
                                    title="Approve Transaksi"
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={busyId === trx.id}
                                    onClick={() => {
                                    setRejectReason('');
                                    setRejectTrx(trx);
                                    }}
                                    title="Reject Transaksi"
                                    className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                </button>
                                </>
                            )}

                            {canRecord && trx.type === 'OUT' && trx.status === 'Approved' && (
                                <button
                                type="button"
                                disabled={busyId === trx.id}
                                onClick={() => handleShipped(trx.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Tandai Shipped</span>
                                </button>
                            )}

                            {canEditOrDelete && (
                                <>
                                <button
                                    type="button"
                                    onClick={() => openEditModal(trx)}
                                    title="Edit Transaksi Pending"
                                    className="p-2 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    disabled={busyId === trx.id}
                                    onClick={() => handleDelete(trx)}
                                    title="Hapus Transaksi Pending"
                                    className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition cursor-pointer"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white font-mono">
                    {detailTrx.transaction_number}
                    </h3>
                    <p className="text-xs text-slate-400">
                    {detailTrx.type === 'IN' ? 'Transaksi Barang Masuk' : 'Transaksi Barang Keluar'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setDetailTrx(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                    <span className="text-slate-400">Tanggal</span>
                    <span className="text-white font-medium">
                    {formatDate(detailTrx.transaction_date)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-white">{detailTrx.status}</span>
                </div>
                {detailTrx.po_number && (
                    <div className="flex justify-between">
                    <span className="text-slate-400">Nomor PO</span>
                    <span className="font-mono text-blue-400">{detailTrx.po_number}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-slate-400">
                    {detailTrx.type === 'IN' ? 'Supplier' : 'Customer / Tujuan'}
                    </span>
                    <span className="text-white font-medium">
                    {detailTrx.type === 'IN'
                        ? detailTrx.supplier_company || detailTrx.supplier_name || '-'
                        : detailTrx.customer_name || '-'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Dicatat Oleh</span>
                    <span className="text-slate-200">{detailTrx.created_by_name}</span>
                </div>
                {detailTrx.approved_by_name && (
                    <div className="flex justify-between">
                    <span className="text-slate-400">Diproses Oleh</span>
                    <span className="text-slate-200">{detailTrx.approved_by_name}</span>
                    </div>
                )}
                </div>

                {detailTrx.rejection_reason && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    <strong>Alasan Penolakan:</strong> {detailTrx.rejection_reason}
                </div>
                )}

                <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Rincian Item Komponen</p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800 text-xs">
                    {detailTrx.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                        <div>
                        <p className="font-mono text-blue-400">{item.sku}</p>
                        <p className="text-white font-medium">{item.product_name}</p>
                        </div>
                        <span className="font-bold text-white">
                        {item.quantity} {item.unit}
                        </span>
                    </div>
                    ))}
                </div>
                </div>

                {detailTrx.notes && (
                <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Catatan:</strong> {detailTrx.notes}
                </p>
                )}
            </div>
            </div>
        )}

        {incomingModalOpen && canRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-8">
                <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-white">Catat Barang Masuk (Incoming)</h2>
                    <p className="text-xs text-slate-400">
                    Pilih Nomor PO berstatus Received untuk pengisian otomatis, atau isi manual
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIncomingModalOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                {inState?.error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{inState.error}</span>
                </div>
                )}

                {inState?.success && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{inState.success}</span>
                </div>
                )}

                <form action={inFormAction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Tanggal Penerimaan
                    </label>
                    <input
                        type="date"
                        name="transaction_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                    </div>

                    <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Nomor PO (Opsional - Status Received)
                    </label>
                    <select
                        name="restock_order_id"
                        value={selectedPoId}
                        onChange={(e) => handlePoSelect(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="">-- Tanpa PO (Penerimaan Langsung) --</option>
                        {availablePos.map((po) => (
                        <option key={po.id} value={po.id}>
                            {po.po_number} - {po.supplier_company || po.supplier_name}
                        </option>
                        ))}
                    </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Supplier Pengirim
                    </label>
                    <select
                    name="supplier_id"
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
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
                    <label className="text-xs font-medium text-slate-400">
                        Daftar Produk Diterima
                    </label>
                    <button
                        type="button"
                        onClick={() =>
                        setIncomingItems((prev) => [...prev, { productId: '', quantity: 1 }])
                        }
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
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
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
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
                        className="w-24 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />

                        {incomingItems.length > 1 && (
                        <button
                            type="button"
                            onClick={() =>
                            setIncomingItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                    </div>
                    ))}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Catatan Penerimaan
                    </label>
                    <textarea
                    name="notes"
                    rows={2}
                    placeholder="Nomor surat jalan atau kondisi fisik kemasan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                    type="button"
                    onClick={() => setIncomingModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isCreatingIn}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isCreatingIn ? 'Menyimpan...' : 'Simpan Barang Masuk'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {outgoingModalOpen && canRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-8">
                <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-white">Catat Barang Keluar (Outgoing)</h2>
                    <p className="text-xs text-slate-400">
                    Quantity tidak boleh melebihi stok komponen yang tersedia
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setOutgoingModalOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                {outState?.error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{outState.error}</span>
                </div>
                )}

                {outState?.success && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{outState.success}</span>
                </div>
                )}

                <form action={outFormAction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Tanggal Pengiriman
                    </label>
                    <input
                        type="date"
                        name="transaction_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                    </div>

                    <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Nama Customer / Divisi Tujuan
                    </label>
                    <input
                        type="text"
                        name="customer_name"
                        required
                        placeholder="Contoh: Toko Komputer Bintang / Teknisi Servis"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">
                        Daftar Produk Keluar
                    </label>
                    <button
                        type="button"
                        onClick={() =>
                        setOutgoingItems((prev) => [...prev, { productId: '', quantity: 1 }])
                        }
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
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
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
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
                        className="w-24 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />

                        {outgoingItems.length > 1 && (
                        <button
                            type="button"
                            onClick={() =>
                            setOutgoingItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                    </div>
                    ))}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Catatan Pengiriman
                    </label>
                    <textarea
                    name="notes"
                    rows={2}
                    placeholder="Keterangan ekspedisi atau nomor invoice tujuan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                    type="button"
                    onClick={() => setOutgoingModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isCreatingOut}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isCreatingOut ? 'Menyimpan...' : 'Simpan Barang Keluar'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {editTrx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-8">
                <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-white">
                    Edit Transaksi Pending ({editTrx.transaction_number})
                    </h2>
                    <p className="text-xs text-slate-400">
                    Hanya produk, quantity, dan catatan yang dapat diubah sebelum di-approve
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setEditTrx(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                {editState?.error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{editState.error}</span>
                </div>
                )}

                {editState?.success && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{editState.success}</span>
                </div>
                )}

                <form action={editFormAction} className="space-y-4">
                <input type="hidden" name="transaction_id" value={editTrx.id} />

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Daftar Produk</label>
                    <button
                        type="button"
                        onClick={() =>
                        setEditItems((prev) => [...prev, { productId: '', quantity: 1 }])
                        }
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
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
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
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
                        className="w-24 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />

                        {editItems.length > 1 && (
                        <button
                            type="button"
                            onClick={() =>
                            setEditItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                    </div>
                    ))}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Catatan
                    </label>
                    <textarea
                    name="notes"
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                    type="button"
                    onClick={() => setEditTrx(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isEditing}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isEditing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {rejectTrx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <form
                onSubmit={handleRejectSubmit}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Tolak Transaksi</h3>
                <button
                    type="button"
                    onClick={() => setRejectTrx(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-400">
                Nomor Transaksi:{' '}
                <strong className="text-white font-mono">
                    {rejectTrx.transaction_number}
                </strong>
                . Alasan penolakan wajib diisi.
                </p>

                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Alasan Penolakan (Wajib)
                </label>
                <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Selisih jumlah fisik barang dengan dokumen pengiriman"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-red-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRejectTrx(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyId === rejectTrx.id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
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