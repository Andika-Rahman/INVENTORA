'use client';

import { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Trash2,
    X,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    Star,
    AlertCircle,
    Building2,
    Calendar,
    Camera,
    ClipboardCheck,
    RotateCcw,
    FilePlus2,
    ExternalLink,
} from 'lucide-react';
import ExportCsvButton from '@/components/ui/ExportCsvButton';
import { formatDate } from '@/lib/formatters';
import {
    createRestockOrderAction,
    supplierRespondRestockAction,
    supplierShipRestockAction,
    confirmArrivalWithPhotoAction,
    managerRequestInspectionAction,
    managerRequestRefundAction,
    rateSupplierRestockAction,
} from '@/actions/restockActions';

const initialFormState = { error: '', success: '' };
const timelineSteps = [
    'Pending',
    'Confirmed',
    'In Transit',
    'Received',
    'Pesanan Diperiksa',
];

export default function RestockManager({
    orders,
    suppliers,
    products,
    role,
    preselectedProductId,
    refundFromPoId,
    }) {
    const canCreateAndManage = ['admin', 'warehouse_manager'].includes(role);
    const canConfirmArrival = ['admin', 'warehouse_manager', 'staff_gudang'].includes(role);
    const isSupplier = role === 'supplier';
    const isStaffGudang = role === 'staff_gudang';

    const refundSourceOrder = refundFromPoId
        ? orders.find((o) => String(o.id) === String(refundFromPoId))
        : null;

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [createModalOpen, setCreateModalOpen] = useState(
        Boolean(canCreateAndManage && (preselectedProductId || refundSourceOrder))
    );
    const [selectedSupplierId, setSelectedSupplierId] = useState(
        refundSourceOrder ? String(refundSourceOrder.supplier_id) : ''
    );
    const [orderNotes, setOrderNotes] = useState(
        refundSourceOrder
        ? `Pesanan pengganti atas refund ${refundSourceOrder.po_number}`
        : ''
    );
    const [orderItems, setOrderItems] = useState(
        refundSourceOrder && refundSourceOrder.items.length > 0
        ? refundSourceOrder.items.map((item) => ({
            productId: String(item.product_id),
            quantity: item.quantity,
            }))
        : [{ productId: preselectedProductId || '', quantity: 5 }]
    );

    const [rejectModalOrder, setRejectModalOrder] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [arrivalModalOrder, setArrivalModalOrder] = useState(null);

    const [inspectModalOrder, setInspectModalOrder] = useState(null);
    const [inspectNotes, setInspectNotes] = useState('');

    const [refundModalOrder, setRefundModalOrder] = useState(null);
    const [refundReason, setRefundReason] = useState('');

    const [ratingModalOrder, setRatingModalOrder] = useState(null);
    const [selectedRating, setSelectedRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');

    const [actionMessage, setActionMessage] = useState({ error: '', success: '' });
    const [busyOrderId, setBusyOrderId] = useState(null);

    const [createState, createFormAction, isCreating] = useActionState(
        createRestockOrderAction,
        initialFormState
    );

    const [arrivalState, arrivalFormAction, isSubmittingArrival] = useActionState(
        confirmArrivalWithPhotoAction,
        initialFormState
    );

    useEffect(() => {
        if (createState?.success) {
        const timer = setTimeout(() => {
            setCreateModalOpen(false);
            setSelectedSupplierId('');
            setOrderNotes('');
            setOrderItems([{ productId: '', quantity: 5 }]);
        }, 650);
        return () => clearTimeout(timer);
        }
    }, [createState?.success]);

    useEffect(() => {
        if (arrivalState?.success) {
        const timer = setTimeout(() => {
            setArrivalModalOrder(null);
        }, 650);
        return () => clearTimeout(timer);
        }
    }, [arrivalState?.success]);

    const filteredOrders =
        statusFilter === 'ALL'
        ? orders
        : orders.filter((order) => order.status === statusFilter);

    const todayStr = new Date().toISOString().split('T')[0];

    function openNewPoFromOrder(sourceOrder = null) {
        if (sourceOrder) {
        setSelectedSupplierId(String(sourceOrder.supplier_id));
        setOrderNotes(`Pesanan baru pengganti ${sourceOrder.po_number}`);
        setOrderItems(
            sourceOrder.items.length > 0
            ? sourceOrder.items.map((item) => ({
                productId: String(item.product_id),
                quantity: item.quantity,
                }))
            : [{ productId: '', quantity: 5 }]
        );
        } else {
        setSelectedSupplierId('');
        setOrderNotes('');
        setOrderItems([{ productId: '', quantity: 5 }]);
        }
        setCreateModalOpen(true);
    }

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

    async function handleSupplierShip(orderId) {
        setBusyOrderId(orderId);
        setActionMessage({ error: '', success: '' });
        const res = await supplierShipRestockAction(orderId);
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

    async function handleRequestInspectionSubmit(event) {
        event.preventDefault();
        if (!inspectModalOrder) return;

        setBusyOrderId(inspectModalOrder.id);
        setActionMessage({ error: '', success: '' });
        const res = await managerRequestInspectionAction(inspectModalOrder.id, inspectNotes);
        setBusyOrderId(null);

        if (res?.error) {
        setActionMessage({ error: res.error, success: '' });
        } else {
        setActionMessage({ error: '', success: res.success });
        setInspectModalOrder(null);
        setInspectNotes('');
        }
    }

    async function handleRefundSubmit(event) {
        event.preventDefault();
        if (!refundModalOrder) return;

        const targetOrder = refundModalOrder;
        setBusyOrderId(targetOrder.id);
        setActionMessage({ error: '', success: '' });
        const res = await managerRequestRefundAction(targetOrder.id, refundReason);
        setBusyOrderId(null);

        if (res?.error) {
        setActionMessage({ error: res.error, success: '' });
        } else {
        setActionMessage({ error: '', success: res.success });
        setRefundModalOrder(null);
        setRefundReason('');
        openNewPoFromOrder(targetOrder);
        }
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

    const filterTabs = [
        'ALL',
        'Pending',
        'Confirmed',
        'In Transit',
        'Received',
        'Pesanan Diperiksa',
        'Refund Diajukan',
        'Rejected',
    ];

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Restock Management (Purchase Order)
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                {isSupplier
                ? 'Konfirmasi ketersediaan stok, kirim barang (In Transit), dan pantau progres pesanan restock'
                : isStaffGudang
                ? 'Dokumentasi kedatangan barang, pemeriksaan fisik pesanan, dan pembuatan laporan barang masuk'
                : 'Pengajuan restock ke supplier, verifikasi foto kedatangan, instruksi pemeriksaan, dan pengajuan refund'}
            </p>
            </div>

            {canCreateAndManage && (
            <div className="flex flex-wrap items-center gap-2.5 self-start">
                <ExportCsvButton moduleName="restocks" label="Export Restock PO (CSV)" />
                <button
                type="button"
                onClick={() => openNewPoFromOrder(null)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm shadow-red-600/20 transition cursor-pointer"
                >
                <Plus className="w-4 h-4" />
                <span>Buat Restock Order (PO)</span>
                </button>
            </div>
            )}
        </div>

        {actionMessage.error && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{actionMessage.error}</span>
            </div>
            <button
                type="button"
                onClick={() => setActionMessage({ error: '', success: '' })}
                className="font-semibold text-red-700 dark:text-red-300 hover:underline cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        {actionMessage.success && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{actionMessage.success}</span>
            </div>
            <button
                type="button"
                onClick={() => setActionMessage({ error: '', success: '' })}
                className="font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-zinc-800 pb-4">
            {filterTabs.map((tab) => (
            <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                statusFilter === tab
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
            >
                {tab === 'ALL' ? 'Semua PO' : tab}
            </button>
            ))}
        </div>

        {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-sm text-slate-500 dark:text-zinc-400">
            Tidak ada data Restock Order untuk status ini.
            </div>
        ) : (
            <div className="space-y-4">
            {filteredOrders.map((order) => {
                const currentStepIndex = timelineSteps.indexOf(order.status);
                const isRejected = order.status === 'Rejected';
                const isRefundRequested = order.status === 'Refund Diajukan';

                return (
                <div
                    key={order.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs"
                >
                    <div className="h-1 w-full bg-linear-to-r from-red-600 via-slate-200 to-emerald-600 dark:via-zinc-700" />

                    <div className="p-5 sm:p-6 space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                            {order.po_number}
                            </span>
                            <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                order.status === 'Pesanan Diperiksa'
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                                : order.status === 'Received'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                                : order.status === 'Refund Diajukan'
                                ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                                : order.status === 'Rejected'
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30'
                                : order.status === 'In Transit'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                                : order.status === 'Confirmed'
                                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700'
                                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                            }`}
                            >
                            {order.status}
                            </span>
                            {order.latest_trx_status === 'Approved' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                                Laporan Masuk Disetujui & Stok Bertambah
                            </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                            <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                            Supplier:{' '}
                            <strong className="text-slate-800 dark:text-zinc-200">
                                {order.supplier_company || order.supplier_name}
                            </strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                            Order: {formatDate(order.order_date)} • Est. Tiba:{' '}
                            <strong className="text-slate-800 dark:text-zinc-200">
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
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
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
                                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                            </button>
                            </>
                        )}

                        {isSupplier && order.status === 'Confirmed' && (
                            <button
                            type="button"
                            disabled={busyOrderId === order.id}
                            onClick={() => handleSupplierShip(order.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                            <Truck className="w-4 h-4" />
                            <span>Kirim Barang (In Transit)</span>
                            </button>
                        )}

                        {canConfirmArrival && order.status === 'In Transit' && (
                            <button
                            type="button"
                            onClick={() => setArrivalModalOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                            <Camera className="w-4 h-4" />
                            <span>Tandai Tiba & Kirim Foto Dokumentasi</span>
                            </button>
                        )}

                        {canCreateAndManage && order.status === 'Received' && (
                            <>
                            <button
                                type="button"
                                onClick={() => {
                                setInspectNotes('');
                                setInspectModalOrder(order);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <ClipboardCheck className="w-4 h-4" />
                                <span>Konfirmasi Cek ke Staff (Pesanan Diperiksa)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                setRefundReason(order.latest_trx_rejection || '');
                                setRefundModalOrder(order);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Tolak & Ajukan Refund</span>
                            </button>
                            </>
                        )}

                        {isStaffGudang &&
                            order.status === 'Pesanan Diperiksa' &&
                            order.latest_trx_status !== 'Approved' &&
                            order.latest_trx_status !== 'Pending' && (
                            <Link
                                href={`/dashboard/transactions?open=IN&po_id=${order.id}`}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                            >
                                <FilePlus2 className="w-4 h-4" />
                                <span>Buat Laporan Barang Masuk</span>
                            </Link>
                            )}

                        {canCreateAndManage &&
                            order.status === 'Pesanan Diperiksa' &&
                            order.latest_trx_status !== 'Approved' && (
                            <button
                                type="button"
                                onClick={() => {
                                setRefundReason(order.latest_trx_rejection || '');
                                setRefundModalOrder(order);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Ajukan Refund & Pesan Ulang</span>
                            </button>
                            )}

                        {canCreateAndManage && isRefundRequested && (
                            <button
                            type="button"
                            onClick={() => openNewPoFromOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                            <Plus className="w-4 h-4" />
                            <span>Buat Pesanan Baru (PO)</span>
                            </button>
                        )}

                        {canCreateAndManage &&
                            ['Received', 'Pesanan Diperiksa'].includes(order.status) &&
                            !order.supplier_rating && (
                            <button
                                type="button"
                                onClick={() => {
                                setSelectedRating(5);
                                setFeedbackText('');
                                setRatingModalOrder(order);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Star className="w-4 h-4" />
                                <span>Beri Rating Supplier</span>
                            </button>
                            )}
                        </div>
                    </div>

                    {isRejected ? (
                        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Pesanan Ditolak oleh Supplier</p>
                            <p className="mt-0.5">
                            Alasan: {order.status_notes || 'Tidak ada catatan alasan.'}
                            </p>
                        </div>
                        </div>
                    ) : isRefundRequested ? (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                            <RotateCcw className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                            <p className="font-bold text-amber-900 dark:text-amber-300">
                                Pesanan Tidak Sesuai — Refund Diajukan oleh Manager
                            </p>
                            <p className="mt-0.5">
                                Alasan Refund: {order.refund_reason || 'Barang tidak sesuai permintaan.'}
                            </p>
                            </div>
                        </div>
                        {canCreateAndManage && (
                            <button
                            type="button"
                            onClick={() => openNewPoFromOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shrink-0 cursor-pointer"
                            >
                            Buat Pesanan Baru
                            </button>
                        )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {timelineSteps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                            <div
                                key={step}
                                className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${
                                isCurrent
                                    ? 'bg-emerald-100/80 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200 font-bold'
                                    : isCompleted
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                                    : 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'
                                }`}
                            >
                                {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                <Clock className="w-4 h-4 text-slate-400 dark:text-zinc-600 shrink-0" />
                                )}
                                <span>
                                {index + 1}. {step}
                                </span>
                            </div>
                            );
                        })}
                        </div>
                    )}

                    {order.arrival_photo_url && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                            <p className="font-semibold text-slate-900 dark:text-zinc-200">
                                Foto Dokumentasi Kedatangan Barang Terlampir
                            </p>
                            <p className="text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                                {order.arrival_photo_url}
                            </p>
                            </div>
                        </div>
                        <a
                            href={order.arrival_photo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-zinc-700 font-semibold shrink-0 transition"
                        >
                            <span>Lihat Foto Dokumentasi</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        </div>
                    )}

                    {order.inspection_notes && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-slate-700 dark:text-zinc-200 flex items-start gap-2.5">
                        <ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-emerald-800 dark:text-emerald-300">
                            Instruksi Pemeriksaan dari Manager:
                            </p>
                            <p className="mt-0.5 text-slate-700 dark:text-zinc-200">
                            {order.inspection_notes}
                            </p>
                        </div>
                        </div>
                    )}

                    {order.latest_trx_rejection && !isRefundRequested && (
                        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-800 dark:text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p className="font-bold text-red-700 dark:text-red-300">
                            Laporan Barang Masuk Ditolak Manager (Tidak Sesuai Permintaan)
                            </p>
                            <p className="mt-0.5">Alasan: {order.latest_trx_rejection}</p>
                        </div>
                        {canCreateAndManage && (
                            <button
                            type="button"
                            onClick={() => {
                                setRefundReason(order.latest_trx_rejection || '');
                                setRefundModalOrder(order);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shrink-0 cursor-pointer"
                            >
                            Ajukan Refund & Buat Pesanan Baru
                            </button>
                        )}
                        </div>
                    )}

                    <div className="bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Daftar Komponen Dipesan ({order.items.length} Item)
                        </p>
                        <div className="divide-y divide-slate-200/80 dark:divide-zinc-800/80 text-xs">
                        {order.items.map((item) => (
                            <div
                            key={item.id}
                            className="py-2 flex items-center justify-between gap-3"
                            >
                            <div>
                                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 mr-2">
                                {item.sku}
                                </span>
                                <span className="text-slate-800 dark:text-zinc-200 font-medium">
                                {item.product_name}
                                </span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0">
                                {item.quantity} {item.unit}
                            </span>
                            </div>
                        ))}
                        </div>
                    </div>

                    {order.notes && (
                        <p className="text-xs text-slate-600 dark:text-zinc-400">
                        <strong className="text-slate-800 dark:text-zinc-300">Catatan PO:</strong>{' '}
                        {order.notes}
                        </p>
                    )}

                    {['Received', 'Pesanan Diperiksa'].includes(order.status) && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                            {order.status === 'Received'
                            ? 'Foto dokumentasi kedatangan diterima. Manager dapat mengonfirmasi ke Staff untuk pemeriksaan fisik (Pesanan Diperiksa).'
                            : 'Status Pesanan Diperiksa: Staff Gudang mengecek fisik barang dan membuat Laporan Barang Masuk untuk konfirmasi akhir Manager.'}
                        </span>

                        {order.supplier_rating && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 shrink-0">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                            <span className="font-bold">{order.supplier_rating}/5</span>
                            {order.supplier_feedback && (
                                <span className="text-slate-700 dark:text-zinc-300">
                                • &quot;{order.supplier_feedback}&quot;
                                </span>
                            )}
                            </div>
                        )}
                        </div>
                    )}
                    </div>
                </div>
                );
            })}
            </div>
        )}

        {createModalOpen && canCreateAndManage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-8">
                <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

                <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Buat Restock Order (PO)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Nomor PO akan dibuat otomatis saat pesanan dikirim ke Supplier
                    </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>

                {createState?.error && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{createState.error}</span>
                    </div>
                )}

                {createState?.success && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{createState.success}</span>
                    </div>
                )}

                <form action={createFormAction} className="space-y-4">
                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Pilih Supplier (Approved)
                    </label>
                    <select
                        name="supplier_id"
                        required
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
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
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Tanggal Order
                        </label>
                        <input
                        type="date"
                        name="order_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Estimasi Tanggal Pengiriman
                        </label>
                        <input
                        type="date"
                        name="expected_delivery_date"
                        required
                        defaultValue={todayStr}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Daftar Komponen yang Direstock
                        </label>
                        <button
                        type="button"
                        onClick={addItemRow}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
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
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-red-500"
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
                            className="w-24 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-red-500"
                        />

                        {orderItems.length > 1 && (
                            <button
                            type="button"
                            onClick={() => removeItemRow(index)}
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
                        Catatan Pesanan
                    </label>
                    <textarea
                        name="notes"
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Instruksi pengiriman atau prioritas restock"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                    >
                        {isCreating ? 'Mengirim PO...' : 'Kirim Restock Order'}
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}

        {arrivalModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                    Konfirmasi Kedatangan & Foto Dokumentasi
                </h3>
                <button
                    type="button"
                    onClick={() => setArrivalModalOrder(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                Nomor PO:{' '}
                <strong className="text-slate-900 dark:text-white">
                    {arrivalModalOrder.po_number}
                </strong>
                . Lampirkan foto bukti paket/barang tiba untuk dikonfirmasi ke Manager.
                </p>

                {arrivalState?.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{arrivalState.error}</span>
                </div>
                )}

                <form action={arrivalFormAction} className="space-y-4">
                <input type="hidden" name="order_id" value={arrivalModalOrder.id} />

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Upload Foto Dokumentasi (JPG/PNG/WEBP)
                    </label>
                    <input
                    type="file"
                    name="arrival_photo_file"
                    accept="image/jpeg,image/png,image/webp"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:text-xs file:font-semibold"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Atau Masukkan Link / Path Foto Dokumentasi
                    </label>
                    <input
                    type="text"
                    name="arrival_photo_url"
                    placeholder="https://... atau /uploads/restocks/foto-paket.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Catatan Kedatangan (Opsional)
                    </label>
                    <textarea
                    name="arrival_notes"
                    rows={2}
                    placeholder="Contoh: 2 kardus diterima di area bongkar muat gudang"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                    type="button"
                    onClick={() => setArrivalModalOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isSubmittingArrival}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isSubmittingArrival ? 'Mengirim...' : 'Kirim Dokumentasi & Tandai Received'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {inspectModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
                onSubmit={handleRequestInspectionSubmit}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                    Instruksi Pemeriksaan ke Staff
                </h3>
                <button
                    type="button"
                    onClick={() => setInspectModalOrder(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                Nomor PO:{' '}
                <strong className="text-slate-900 dark:text-white">
                    {inspectModalOrder.po_number}
                </strong>
                . Status akan berubah menjadi{' '}
                <strong className="text-emerald-700 dark:text-emerald-300">
                    Pesanan Diperiksa
                </strong>{' '}
                agar Staff Gudang mengecek fisik barang dan membuat laporan masuk.
                </p>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Catatan Pemeriksaan untuk Staff
                </label>
                <textarea
                    rows={3}
                    value={inspectNotes}
                    onChange={(e) => setInspectNotes(e.target.value)}
                    placeholder="Contoh: Pastikan nomor seri komponen sesuai PO dan cek kondisi segel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setInspectModalOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyOrderId === inspectModalOrder.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                    Konfirmasi ke Staff
                </button>
                </div>
            </form>
            </div>
        )}

        {refundModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
                onSubmit={handleRefundSubmit}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                    Ajukan Refund & Buat Pesanan Baru
                </h3>
                <button
                    type="button"
                    onClick={() => setRefundModalOrder(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                Pesanan{' '}
                <strong className="text-slate-900 dark:text-white">
                    {refundModalOrder.po_number}
                </strong>{' '}
                tidak sesuai permintaan. Setelah refund diajukan, Anda akan langsung diarahkan untuk
                membuat{' '}
                <strong className="text-red-600 dark:text-red-400">Pesanan Baru (PO)</strong>.
                </p>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Alasan Ketidaksesuaian & Pengajuan Refund (Wajib)
                </label>
                <textarea
                    rows={3}
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Contoh: Spesifikasi komponen berbeda dan jumlah barang kurang dari PO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-amber-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRefundModalOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyOrderId === refundModalOrder.id}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer"
                >
                    Ajukan Refund & Lanjut Pesanan Baru
                </button>
                </div>
            </form>
            </div>
        )}

        {rejectModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
                onSubmit={handleSupplierRejectSubmit}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Tolak Restock Order</h3>
                <button
                    type="button"
                    onClick={() => setRejectModalOrder(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                Nomor PO:{' '}
                <strong className="text-slate-900 dark:text-white">
                    {rejectModalOrder.po_number}
                </strong>
                . Anda wajib mencantumkan alasan penolakan.
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
                    placeholder="Contoh: Stok komponen sedang kosong di pabrik hingga akhir bulan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRejectModalOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyOrderId === rejectModalOrder.id}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                    Konfirmasi Tolak PO
                </button>
                </div>
            </form>
            </div>
        )}

        {ratingModalOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <form
                onSubmit={handleRatingSubmit}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                    Rating & Feedback Supplier
                </h3>
                <button
                    type="button"
                    onClick={() => setRatingModalOrder(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400">
                Penilaian untuk{' '}
                <strong className="text-slate-900 dark:text-white">
                    {ratingModalOrder.supplier_company || ratingModalOrder.supplier_name}
                </strong>{' '}
                ({ratingModalOrder.po_number})
                </p>

                <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
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
                            ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-400 text-amber-500'
                            : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600'
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Catatan Ulasan (Opsional)
                </label>
                <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Contoh: Pengiriman tepat waktu dan kemasan part aman"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setRatingModalOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={busyOrderId === ratingModalOrder.id}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
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