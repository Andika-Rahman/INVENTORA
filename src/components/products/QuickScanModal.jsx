'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ScanBarcode,
    X,
    Search,
    Eye,
    ArrowDownLeft,
    ArrowUpRight,
    MapPin,
    AlertCircle,
} from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { formatRupiah, getStockStatus } from '@/lib/formatters';

export default function QuickScanModal({ products, canRecordTransaction, onClose }) {
    const [scanInput, setScanInput] = useState('');
    const [matchedProduct, setMatchedProduct] = useState(null);
    const [notFoundMessage, setNotFoundMessage] = useState('');

    function handleLookup(skuQuery) {
        const cleaned = String(skuQuery || '').trim().toUpperCase();
        if (!cleaned) return;

        const found = products.find((item) => item.sku.toUpperCase() === cleaned);
        if (found) {
        setMatchedProduct(found);
        setNotFoundMessage('');
        } else {
        setMatchedProduct(null);
        setNotFoundMessage(`SKU "${cleaned}" tidak ditemukan dalam inventori gudang.`);
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        handleLookup(scanInput);
    }

    const statusInfo = matchedProduct
        ? getStockStatus(
            matchedProduct.stock,
            matchedProduct.min_stock,
            matchedProduct.low_stock
        )
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ScanBarcode className="w-5 h-5" />
                </div>
                <div>
                <h3 className="font-bold text-white">Quick Scan Barcode / SKU</h3>
                <p className="text-xs text-slate-400">
                    Pindai barcode dengan scanner atau pilih kode SKU komponen
                </p>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white cursor-pointer"
            >
                <X className="w-5 h-5" />
            </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    autoFocus
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan atau ketik SKU (misal: CPU-INT-14700K)..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
                </div>
                <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                Cari SKU
                </button>
            </div>

            <div>
                <select
                value={matchedProduct?.sku || ''}
                onChange={(e) => {
                    setScanInput(e.target.value);
                    handleLookup(e.target.value);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                >
                <option value="">-- Atau pilih langsung dari daftar SKU aktif --</option>
                {products.map((prod) => (
                    <option key={prod.id} value={prod.sku}>
                    {prod.sku} — {prod.name}
                    </option>
                ))}
                </select>
            </div>
            </form>

            {notFoundMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{notFoundMessage}</span>
            </div>
            )}

            {matchedProduct && statusInfo && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-start gap-3.5">
                <SafeImage
                    src={matchedProduct.image_url}
                    alt={matchedProduct.name}
                    className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">
                        {matchedProduct.sku}
                    </span>
                    <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                    >
                        {statusInfo.label}
                    </span>
                    </div>
                    <p className="font-bold text-white text-sm mt-1">
                    {matchedProduct.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {matchedProduct.rack_location}
                    </span>
                    <span>
                        Stok:{' '}
                        <strong className="text-white">
                        {matchedProduct.stock} {matchedProduct.unit}
                        </strong>
                    </span>
                    <span>{formatRupiah(matchedProduct.selling_price)}</span>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-800">
                <Link
                    href={`/dashboard/products/${matchedProduct.id}`}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
                >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail Produk</span>
                </Link>

                {canRecordTransaction && (
                    <>
                    <Link
                        href={`/dashboard/transactions?open=IN&product_id=${matchedProduct.id}`}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
                    >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>Quick Masuk</span>
                    </Link>

                    <Link
                        href={`/dashboard/transactions?open=OUT&product_id=${matchedProduct.id}`}
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
                    >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Quick Keluar</span>
                    </Link>
                    </>
                )}
                </div>
            </div>
            )}
        </div>
        </div>
    );
}