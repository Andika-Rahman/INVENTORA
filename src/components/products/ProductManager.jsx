'use client';

import { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    X,
    Upload,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    MapPin,
    QrCode,
    ScanBarcode,
    RefreshCw,
} from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import BarcodeModal from '@/components/products/BarcodeModal';
import QuickScanModal from '@/components/products/QuickScanModal';
import { formatRupiah, getStockStatus } from '@/lib/formatters';
import {
    createProductAction,
    updateProductAction,
    updateProductStockAction,
    deleteProductAction,
} from '@/actions/productActions';

const initialFormState = { error: '', success: '' };

export default function ProductManager({
    products,
    allProductsForScan,
    categories,
    canManage,
    canUpdateStock,
    canRecordTransaction,
    }) {
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stockModalProduct, setStockModalProduct] = useState(null);
    const [adjustmentType, setAdjustmentType] = useState('set');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [barcodeProduct, setBarcodeProduct] = useState(null);
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const [createState, createFormAction, isCreating] = useActionState(
        createProductAction,
        initialFormState
    );
    const [updateState, updateFormAction, isUpdating] = useActionState(
        updateProductAction,
        initialFormState
    );
    const [stockState, stockFormAction, isUpdatingStock] = useActionState(
        updateProductStockAction,
        initialFormState
    );

    const activeState = editingProduct ? updateState : createState;
    const isSubmitting = editingProduct ? isUpdating : isCreating;

    useEffect(() => {
        if (createState?.success || updateState?.success) {
        const timer = setTimeout(() => {
            setFormModalOpen(false);
            setEditingProduct(null);
            setImageUrl('');
        }, 600);
        return () => clearTimeout(timer);
        }
    }, [createState?.success, updateState?.success]);

    useEffect(() => {
        if (stockState?.success) {
        const timer = setTimeout(() => {
            setStockModalProduct(null);
        }, 650);
        return () => clearTimeout(timer);
        }
    }, [stockState?.success]);

    function openCreateModal() {
        setEditingProduct(null);
        setImageUrl('');
        setFormModalOpen(true);
    }

    function openEditModal(product) {
        setEditingProduct(product);
        setImageUrl(product.image_url || '');
        setFormModalOpen(true);
    }

    function openStockModal(product) {
        setAdjustmentType('set');
        setStockModalProduct(product);
    }

    async function handleFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const body = new FormData();
        body.append('file', file);
        body.append('folder', 'products');

        try {
        const res = await fetch('/api/upload', { method: 'POST', body });
        const data = await res.json();
        if (data.url) {
            setImageUrl(data.url);
        }
        } finally {
        setUploading(false);
        }
    }

    async function confirmDeleteProduct() {
        if (!deleteTarget) return;
        setDeleteError('');
        const res = await deleteProductAction(deleteTarget.id);
        if (res?.error) {
        setDeleteError(res.error);
        } else {
        setDeleteTarget(null);
        }
    }

    return (
        <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
            type="button"
            onClick={() => setScanModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
            >
            <ScanBarcode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Quick Scan SKU</span>
            </button>

            {canManage && (
            <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm shadow-red-600/20 transition cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>Tambah Komponen Baru</span>
            </button>
            )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="h-1 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950/60">
                    <th className="py-3.5 px-4">Produk & SKU</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Lokasi Rak</th>
                    <th className="py-3.5 px-4">Harga Jual</th>
                    <th className="py-3.5 px-4">Stok</th>
                    <th className="py-3.5 px-4">Status Stok</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-sm">
                {products.length === 0 ? (
                    <tr>
                    <td
                        colSpan={7}
                        className="py-10 text-center text-slate-500 dark:text-zinc-400 text-sm"
                    >
                        Tidak ada produk komponen yang sesuai dengan filter pencarian.
                    </td>
                    </tr>
                ) : (
                    products.map((item) => {
                    const statusInfo = getStockStatus(
                        item.stock,
                        item.min_stock,
                        item.low_stock
                    );

                    return (
                        <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                        <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                            <SafeImage
                                src={item.image_url}
                                alt={item.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
                            />
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white leading-snug">
                                {item.name}
                                </p>
                                <p className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {item.sku}
                                </p>
                            </div>
                            </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-zinc-300">
                            {item.category_name}
                        </td>
                        <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                            <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            {item.rack_location}
                            </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {formatRupiah(item.selling_price)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-zinc-300">
                            <strong className="text-slate-900 dark:text-white text-sm">
                            {item.stock}
                            </strong>{' '}
                            {item.unit}
                        </td>
                        <td className="py-3.5 px-4">
                            <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.badgeClass}`}
                            >
                            {statusInfo.label}
                            </span>
                        </td>
                        <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                            {canUpdateStock && (
                                <button
                                type="button"
                                onClick={() => openStockModal(item)}
                                title="Update Stok Real-Time"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Stok</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setBarcodeProduct(item)}
                                title="Barcode & QR Label"
                                className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-zinc-800 dark:hover:bg-emerald-500/20 text-slate-700 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
                            >
                                <QrCode className="w-4 h-4" />
                            </button>

                            <Link
                                href={`/dashboard/products/${item.id}`}
                                title="Detail Produk"
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition"
                            >
                                <Eye className="w-4 h-4" />
                            </Link>

                            {canManage && (
                                <>
                                <button
                                    type="button"
                                    onClick={() => openEditModal(item)}
                                    title="Edit Produk"
                                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                    setDeleteError('');
                                    setDeleteTarget(item);
                                    }}
                                    title="Hapus Produk"
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

        {barcodeProduct && (
            <BarcodeModal
            product={barcodeProduct}
            onClose={() => setBarcodeProduct(null)}
            />
        )}

        {scanModalOpen && (
            <QuickScanModal
            products={allProductsForScan || products}
            canRecordTransaction={canRecordTransaction}
            onClose={() => setScanModalOpen(false)}
            />
        )}

        {stockModalProduct && canUpdateStock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Update Stok Real-Time
                    </h2>
                    <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {stockModalProduct.sku} • Rak {stockModalProduct.rack_location}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setStockModalProduct(null)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                    {stockModalProduct.name}
                    </p>
                    <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                    Stok tercatat di sistem saat ini
                    </p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {stockModalProduct.stock} {stockModalProduct.unit}
                </span>
                </div>

                {stockState?.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{stockState.error}</span>
                </div>
                )}

                {stockState?.success && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{stockState.success}</span>
                </div>
                )}

                <form action={stockFormAction} className="space-y-4">
                <input type="hidden" name="id" value={stockModalProduct.id} />

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Metode Penyesuaian Stok
                    </label>
                    <select
                    name="adjustment_type"
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                    <option value="set">Set Stok Fisik Baru (Stock Opname)</option>
                    <option value="add">Tambah Jumlah Stok (+)</option>
                    <option value="subtract">Kurangi Jumlah Stok (-)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {adjustmentType === 'set'
                        ? `Jumlah Stok Aktual (${stockModalProduct.unit})`
                        : `Jumlah Perubahan (${stockModalProduct.unit})`}
                    </label>
                    <input
                    type="number"
                    name="quantity"
                    min={adjustmentType === 'set' ? 0 : 1}
                    required
                    defaultValue={adjustmentType === 'set' ? stockModalProduct.stock : 1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <button
                    type="button"
                    onClick={() => setStockModalProduct(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isUpdatingStock}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isUpdatingStock ? 'Memperbarui...' : 'Simpan Stok'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {formModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-8">
                <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

                <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {editingProduct ? 'Edit Komponen Gudang' : 'Tambah Komponen Baru'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Status stok akan dihitung otomatis berdasarkan batas stok minimum dan Low
                    </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => setFormModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                    <X className="w-5 h-5" />
                    </button>
                </div>

                {activeState?.error && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{activeState.error}</span>
                    </div>
                )}

                {activeState?.success && (
                    <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{activeState.success}</span>
                    </div>
                )}

                <form
                    action={editingProduct ? updateFormAction : createFormAction}
                    className="space-y-4"
                >
                    {editingProduct && (
                    <input type="hidden" name="id" value={editingProduct.id} />
                    )}
                    <input type="hidden" name="image_url" value={imageUrl} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Kode SKU (Unik)
                        </label>
                        <input
                        type="text"
                        name="sku"
                        required
                        disabled={Boolean(editingProduct)}
                        defaultValue={editingProduct?.sku || ''}
                        placeholder="Contoh: RAM-DDR5-32G"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Kategori Komponen
                        </label>
                        <select
                        name="category_id"
                        required
                        defaultValue={editingProduct?.category_id || ''}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                            {cat.name}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Nama Produk / Part
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        defaultValue={editingProduct?.name || ''}
                        placeholder="Contoh: Kingston Fury Beast 32GB DDR5 6000MHz"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Deskripsi & Spesifikasi Singkat
                    </label>
                    <textarea
                        name="description"
                        rows={2}
                        required
                        defaultValue={editingProduct?.description || ''}
                        placeholder="Spesifikasi teknis komponen PC atau laptop"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                    />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Harga Beli (Rp)
                        </label>
                        <input
                        type="number"
                        name="purchase_price"
                        min="0"
                        step="1"
                        required
                        defaultValue={editingProduct ? Number(editingProduct.purchase_price) : ''}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Harga Jual (Rp)
                        </label>
                        <input
                        type="number"
                        name="selling_price"
                        min="0"
                        step="1"
                        required
                        defaultValue={editingProduct ? Number(editingProduct.selling_price) : ''}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Stok Minimum (Severe)
                        </label>
                        <input
                        type="number"
                        name="min_stock"
                        min="0"
                        required
                        defaultValue={editingProduct?.min_stock ?? 2}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Batas Stok Low (&gt; Min)
                        </label>
                        <input
                        type="number"
                        name="low_stock"
                        min="1"
                        required
                        defaultValue={editingProduct?.low_stock ?? 5}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Jumlah Stok Saat Ini
                        </label>
                        <input
                        type="number"
                        name="stock"
                        min="0"
                        required
                        defaultValue={editingProduct?.stock ?? 0}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Satuan Unit
                        </label>
                        <select
                        name="unit"
                        required
                        defaultValue={editingProduct?.unit || 'pcs'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-red-500"
                        >
                        <option value="pcs">pcs</option>
                        <option value="unit">unit</option>
                        <option value="box">box</option>
                        <option value="tube">tube</option>
                        <option value="set">set</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Lokasi Rak Gudang
                        </label>
                        <input
                        type="text"
                        name="rack_location"
                        required
                        defaultValue={editingProduct?.rack_location || ''}
                        placeholder="Contoh: RAK-A2-05"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-red-500"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Foto Komponen
                    </label>
                    <div className="flex items-center gap-3">
                        <SafeImage
                        src={imageUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-zinc-800"
                        />
                        <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 text-xs text-slate-600 dark:text-zinc-300 cursor-pointer transition">
                        <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{uploading ? 'Mengunggah...' : 'Upload Foto Komponen'}</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        </label>
                    </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setFormModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || uploading}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        )}

        {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                    Konfirmasi Hapus Produk
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                    {deleteTarget.sku}
                    </p>
                </div>
                </div>

                {deleteTarget.stock > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                    <strong>Peringatan Stok Aktif:</strong> Produk{' '}
                    <strong>{deleteTarget.name}</strong> masih memiliki sisa stok sebanyak{' '}
                    <strong>
                    {deleteTarget.stock} {deleteTarget.unit}
                    </strong>{' '}
                    di gudang.
                </div>
                )}

                <p className="text-sm text-slate-700 dark:text-zinc-300">
                Apakah Anda yakin ingin menghapus produk{' '}
                <strong className="text-slate-900 dark:text-white">{deleteTarget.name}</strong>?
                </p>

                {deleteError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    {deleteError}
                </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={confirmDeleteProduct}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                >
                    Ya, Hapus Produk
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}