import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Truck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatRupiah, formatDate, getStockStatus } from '@/lib/formatters';
import SafeImage from '@/components/ui/SafeImage';

export default async function ProductDetailPage({ params }) {
    const session = await getSession();
    if (!session || session.role === 'supplier') {
        redirect('/dashboard');
    }

    const resolvedParams = await params;
    const productId = Number(resolvedParams.id);
    if (!productId) notFound();

    const [productRes, historyRes] = await Promise.all([
        query(
        `SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
        LIMIT 1`,
        [productId]
        ),
        query(
        `SELECT
            t.id,
            t.transaction_number,
            t.type,
            t.transaction_date,
            t.status,
            ti.quantity,
            u.name AS created_by_name
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN users u ON t.created_by = u.id
        WHERE ti.product_id = $1
        ORDER BY t.created_at DESC
        LIMIT 5`,
        [productId]
        ),
    ]);

    const product = productRes.rows[0];
    if (!product) notFound();

    const statusInfo = getStockStatus(
        product.stock,
        product.min_stock,
        product.low_stock
    );
    const isLowOrCritical = product.stock <= product.low_stock;
    const canRestock = ['admin', 'warehouse_manager'].includes(session.role);

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Produk</span>
            </Link>

            {canRestock && isLowOrCritical && (
            <Link
                href={`/dashboard/restocks?product_id=${product.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition self-start"
            >
                <Truck className="w-4 h-4" />
                <span>Create Restock Order</span>
            </Link>
            )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <SafeImage
                src={product.image_url}
                alt={product.name}
                className="w-44 h-44 rounded-2xl object-cover"
            />
            <span className="mt-4 text-xs font-mono px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-blue-400">
                {product.sku}
            </span>
            </div>

            <div className="lg:col-span-2 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                <span className="text-xs font-semibold text-blue-400">
                    {product.category_name}
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">{product.name}</h1>
                </div>
                <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.badgeClass}`}
                >
                {statusInfo.label}
                </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Stok Tersedia</span>
                <p className="text-lg font-bold text-white mt-1">
                    {product.stock} {product.unit}
                </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Lokasi Rak</span>
                <p className="text-sm font-mono font-bold text-slate-200 mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {product.rack_location}
                </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Harga Beli</span>
                <p className="text-sm font-bold text-slate-200 mt-1.5">
                    {formatRupiah(product.purchase_price)}
                </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Harga Jual</span>
                <p className="text-sm font-bold text-emerald-400 mt-1.5">
                    {formatRupiah(product.selling_price)}
                </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>
                Batas Severe (Min): <strong className="text-red-400">{product.min_stock}</strong>{' '}
                {product.unit}
                </span>
                <span>
                Batas Low: <strong className="text-amber-400">{product.low_stock}</strong>{' '}
                {product.unit}
                </span>
            </div>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">5 Riwayat Transaksi Terakhir</h2>

            {historyRes.rows.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center bg-slate-950 rounded-xl border border-slate-800">
                Belum ada riwayat transaksi untuk komponen ini.
            </p>
            ) : (
            <div className="space-y-2.5">
                {historyRes.rows.map((trx) => (
                <div
                    key={trx.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                    <div className="flex items-center gap-3">
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        trx.type === 'IN'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-blue-500/15 text-blue-400'
                        }`}
                    >
                        {trx.type === 'IN' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                        <ArrowUpRight className="w-4 h-4" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-white">{trx.transaction_number}</p>
                        <p className="text-slate-400">
                        {formatDate(trx.transaction_date)} • Oleh {trx.created_by_name}
                        </p>
                    </div>
                    </div>

                    <div className="text-right">
                    <p className="font-bold text-white">
                        {trx.type === 'IN' ? '+' : '-'}
                        {trx.quantity} {product.unit}
                    </p>
                    <span className="text-[11px] text-slate-400">{trx.status}</span>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
}