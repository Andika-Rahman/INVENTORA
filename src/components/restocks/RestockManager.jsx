'use client';

import { useState, useActionState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    X,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    PackageCheck,
    Star,
    AlertCircle,
    Building2,
    Calendar,
} from 'lucide-react';
import ExportCsvButton from '@/components/ui/ExportCsvButton';
import { formatDate } from '@/lib/formatters';
import {
    createRestockOrderAction,
    supplierRespondRestockAction,
    advanceRestockStatusAction,
    rateSupplierRestockAction,
} from '@/actions/restockActions';

const initialFormState = { error: '', success: '' };
const timelineSteps = ['Pending', 'Confirmed', 'In Transit', 'Received'];

export default function RestockManager({
    orders,
    suppliers,
    products,
    role,
    preselectedProductId,
    }) {
    const canCreateAndManage = ['admin', 'warehouse_manager'].includes(role);
    const isSupplier = role === 'supplier';

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [createModalOpen, setCreateModalOpen] = useState(
        Boolean(canCreateAndManage && preselectedProductId)
    );
    const [orderItems, setOrderItems] = useState([
        { productId: preselectedProductId || '', quantity: 5 },
    ]);

    const [rejectModalOrder, setRejectModalOrder] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [ratingModalOrder, setRatingModalOrder] = useState(null);
    const [selectedRating, setSelectedRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');

    const [actionMessage, setActionMessage] = useState({ error: '', success: '' });
    const [busyOrderId, setBusyOrderId] = useState(null);

    const [createState, createFormAction, isCreating] = useActionState(
        createRestockOrderAction,
        initialFormState
    );

    useEffect(() => {
        if (createState?.success) {
        const timer = setTimeout(() => {
            setCreateModalOpen(false);
            setOrderItems([{ productId: '', quantity: 5 }]);
        }, 650);
        return () => clearTimeout(timer);
        }
    }, [createState?.success]);

    const filteredOrders =
        statusFilter === 'ALL'
        ? orders
        : orders.filter((order) => order.status === statusFilter);

    const todayStr = new Date().toISOString().split('T')[0];

    function addItemRow() {
        setOrderItems((prev) => [...prev, { productId: '', quantity: 1 }]);
    }

    function removeItemRow(index) {
        setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
    }

    function updateItemRow(index, field, value) {
        setOrderItems((prev) =>
        prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
        );
    }

    async function handleSupplierConfirm(orderId) {
        setBusyOrderId(orderId);
        setActionMessage({ error: '', success: '' });
        const res = await supplierRespondRestockAction(orderId, 'Confirmed', '');
        setBusyOrderId(null);
        if (res?.error) setActionMessage({ error: res.error, success: '' });
        else setActionMessage({ error: '', success: res.success });
    }

    async function handleSupplierRejectSubmit(event) {
        event.preventDefault();
        if (!rejectModalOrder) return;

        setBusyOrderId(rejectModalOrder.id);
        setActionMessage({ error: '', success: '' });
        const res = await supplierRespondRestockAction(
        rejectModalOrder.id,
        'Rejected',
        rejectReason
        );
        setBusyOrderId(null);

        if (res?.error) {
        setActionMessage({ error: res.error, success: '' });
        } else {
        setActionMessage({ error: '', success: res.success });
        setRejectModalOrder(null);
        setRejectReason('');
        }
    }

    async function handleAdvanceStatus(orderId, nextStatus) {
        setBusyOrderId(orderId);
        setActionMessage({ error: '', success: '' });
        const res = await advanceRestockStatusAction(orderId, nextStatus);
        setBusyOrderId(null);
        if (res?.error) setActionMessage({ error: res.error, success: '' });
        else setActionMessage({ error: '', success: res.success });
    }

    async function handleRatingSubmit(event) {
        event.preventDefault();
        if (!ratingModalOrder) return;

        setBusyOrderId(ratingModalOrder.id);
        setActionMessage({ error: '', success: '' });
        const res = await rateSupplierRestockAction(
        ratingModalOrder.id,
        selectedRating,
        feedbackText
        );
        setBusyOrderId(null);

        if (res?.error) {
        setActionMessage({ error: res.error, success: '' });
        } else {
        setActionMessage({ error: '', success: res.success });
        setRatingModalOrder(null);
        setFeedbackText('');
        }
    }

    const filterTabs = ['ALL', 'Pending', 'Confirmed', 'In Transit', 'Received', 'Rejected'];

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-white">Restock Management (Purchase Order)</h1>
            <p className="text-sm text-slate-400 mt-1">
                {isSupplier
                ? 'Konfirmasi ketersediaan stok dan pantau progres pengiriman pesanan restock'
                : 'Pengajuan restock komponen ke supplier dan pemantauan status pengiriman PO'}
            </p>
            </div>

            {canCreateAndManage && (
            <div className="flex flex-wrap items-center gap-2.5 self-start">
                <ExportCsvButton moduleName="restocks" label="Export Restock PO (CSV)" />
                <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                <Plus className="w-4 h-4" />
                <span>Buat Restock Order (PO)</span>
                </button>
            </div>
            )}
        </div>

        {actionMessage.error && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{actionMessage.error}</span>
            </div>
            <button
                type="button"
                onClick={() => setActionMessage({ error: '', success: '' })}
                className="text-red-400 hover:text-white cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        {actionMessage.success && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionMessage.success}</span>
            </div>
            <button
                type="button"
                onClick={() => setActionMessage({ error: '', success: '' })}
                className="text-emerald-400 hover:text-white cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
            {filterTabs.map((tab) => (
            <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                statusFilter === tab
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
            >
                {tab === 'ALL' ? 'Semua PO' : tab}
            </button>
            ))}
        </div>

        {filteredOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-sm text-slate-400">
            Tidak ada data Restock Order untuk status ini.
            </div>
        ) : (
            <div className="space-y-4">
            {filteredOrders.map((order) => {
                const currentStepIndex = timelineSteps.indexOf(order.status);
                const isRejected = order.status === 'Rejected';

                return (
                <div
                    key={order.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-base text-white">
                            {order.po_number}
                        </span>
                        <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            order.status === 'Received'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : order.status === 'Rejected'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : order.status === 'In Transit'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : order.status === 'Confirmed'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                        >
                            {order.status}
                        </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            Supplier:{' '}
                            <strong className="text-slate-200">
                            {order.supplier_company || order.supplier_name}
                            </strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Order: {formatDate(order.order_date)} • Est. Tiba:{' '}
                            <strong className="text-slate-200">
                            {formatDate(order.expected_delivery_date)}
                            </strong>
                        </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isSupplier && order.status === 'Pending' && (
                        <>
                            <button
                            type="button"
                            disabled={busyOrderId === order.id}
                            onClick={() => handleSupplierConfirm(order.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Pesanan</span>
                            </button>
                            <button
                            type="button"
                            disabled={busyOrderId === order.id}
                            onClick={() => {
                                setRejectReason('');
                                setRejectModalOrder(order);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                            </button>
                        </>
                        )}

                        {canCreateAndManage && order.status === 'Confirmed' && (
                        <button
                            type="button"
                            disabled={busyOrderId === order.id}
                            onClick={() => handleAdvanceStatus(order.id, 'In Transit')}
                            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Truck className="w-4 h-4" />
                            <span>Tandai In Transit</span>
                        </button>
                        )}

                        {canCreateAndManage && order.status === 'In Transit' && (
                        <button
                            type="button"
                            disabled={busyOrderId === order.id}
                            onClick={() => handleAdvanceStatus(order.id, 'Received')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <PackageCheck className="w-4 h-4" />
                            <span>Tandai Received</span>
                        </button>
                        )}

                        {canCreateAndManage &&
                        order.status === 'Received' &&
                        !order.supplier_rating && (
                            <button
                            type="button"
                            onClick={() => {
                                setSelectedRating(5);
                                setFeedbackText('');
                                setRatingModalOrder(order);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                            <Star className="w-4 h-4" />
                            <span>Beri Rating Supplier</span>
                            </button>
                        )}
                    </div>
                    </div>

                    {isRejected ? (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                        <p className="font-bold">Pesanan Ditolak oleh Supplier</p>
                        <p className="mt-0.5">
                            Alasan: {order.status_notes || 'Tidak ada catatan alasan.'}
                        </p>
                        </div>
                    </div>
                    ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {timelineSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        return (
                            <div
                            key={step}
                            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${
                                isCompleted
                                ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 font-semibold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500'
                            }`}
                            >
                            {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                            ) : (
                                <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                            )}
                            <span>
                                {index + 1}. {step}
                            </span>
                            </div>
                        );
                        })}
                    </div>
                    )}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Daftar Komponen Dipesan ({order.items.length} Item)
                    </p>
                    <div className="divide-y divide-slate-800/80 text-xs">
                        {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="py-2 flex items-center justify-between gap-3"
                        >
                            <div>
                            <span className="font-mono text-blue-400 mr-2">{item.sku}</span>
                            <span className="text-slate-200 font-medium">{item.product_name}</span>
                            </div>
                            <span className="font-bold text-white shrink-0">
                            {item.quantity} {item.unit}
                            </span>
                        </div>
                        ))}
                    </div>
                    </div>

                    {order.notes && (
                    <p className="text-xs text-slate-400">
                        <strong className="text-slate-300">Catatan PO:</strong> {order.notes}
                    </p>
                    )}

                    {order.status === 'Received' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                        <span className="text-emerald-400">
                        Barang telah tiba (Received). Staff Gudang dapat mencatat Incoming
                        Transaction menggunakan nomor PO ini agar stok bertambah setelah di-approve.
                        </span>

                        {order.supplier_rating && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold">{order.supplier_rating}/5</span>
                            {order.supplier_feedback && (
                            <span className="text-slate-300">• "{order.supplier_feedback}"</span>
                            )}
                        </div>
                        )}
                    </div>
                    )}
                </div>
                );
            })}
            </div>
        )}

        {createModalOpen && canCreateAndManage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-8">
                <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-white">Buat Restock Order (PO)</h2>
                    <p className="text-xs text-slate-400">
                    Nomor PO akan dibuat otomatis saat pesanan dikirim ke Supplier
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                {createState?.error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{createState.error}</span>
                </div>
                )}

                {createState?.success && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{createState.success}</span>
                </div>
                )}

                <form action={createFormAction} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Pilih Supplier (Approved)
                    </label>
                    <select
                    name="supplier_id"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    >
                    <option value="">-- Pilih Mitra Supplier --</option>
                    {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                        {sup.company_name || sup.name} ({sup.name})
                        </option>
                    ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Tanggal Order
                    </label>
                    <input
                        type="date"
                        name="order_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                    </div>

                    <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Estimasi Tanggal Pengiriman
                    </label>
                    <input
                        type="date"
                        name="expected_delivery_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">
                        Daftar Komponen yang Direstock
                    </label>
                    <button
                        type="button"
                        onClick={addItemRow}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Baris Produk</span>
                    </button>
                    </div>

                    {orderItems.map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <select
                        name="product_id"
                        required
                        value={row.productId}
                        onChange={(e) => updateItemRow(index, 'productId', e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        >
                        <option value="">-- Pilih Produk Komponen --</option>
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
                        onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-24 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />

                        {orderItems.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeItemRow(index)}
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
                    Catatan Pesanan
                    </label>
                    <textarea
                    name="notes"
                    rows={2}
                    placeholder="Instruksi pengiriman atau prioritas restock"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isCreating ? 'Mengirim PO...' : 'Kirim Restock Order'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {rejectModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <form
                onSubmit={handleSupplierRejectSubmit}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Tolak Restock Order</h3>
                <button
                    type="button"
                    onClick={() => setRejectModalOrder(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-400">
                Nomor PO: <strong className="text-white">{rejectModalOrder.po_number}</strong>.
                Anda wajib mencantumkan alasan penolakan.
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
                    placeholder="Contoh: Stok komponen sedang kosong di pabrik hingga akhir bulan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-red-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRejectModalOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyOrderId === rejectModalOrder.id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                >
                    Konfirmasi Tolak PO
                </button>
                </div>
            </form>
            </div>
        )}

        {ratingModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <form
                onSubmit={handleRatingSubmit}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Rating & Feedback Supplier</h3>
                <button
                    type="button"
                    onClick={() => setRatingModalOrder(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-400">
                Penilaian untuk{' '}
                <strong className="text-white">
                    {ratingModalOrder.supplier_company || ratingModalOrder.supplier_name}
                </strong>{' '}
                ({ratingModalOrder.po_number})
                </p>

                <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                    Skor Pengiriman & Kualitas Komponen (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedRating(num)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer ${
                        num <= selectedRating
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}
                    >
                        <Star
                        className={`w-5 h-5 ${num <= selectedRating ? 'fill-amber-400' : ''}`}
                        />
                    </button>
                    ))}
                </div>
                </div>

                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Catatan Ulasan (Opsional)
                </label>
                <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Contoh: Pengiriman tepat waktu dan kemasan part aman"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRatingModalOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyOrderId === ratingModalOrder.id}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                    Simpan Rating
                </button>
                </div>
            </form>
            </div>
        )}
        </div>
    );
}