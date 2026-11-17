import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Package,
    ArrowLeftRight,
    Wallet,
    AlertTriangle,
    UserCheck,
    CheckCircle2,
    XCircle,
    Truck,
    FolderTree,
    Clock,
    PlusCircle,
    ArrowRight,
} from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatRupiah, formatDate, getStockStatus } from '@/lib/formatters';
import { updateSupplierStatusAction } from '@/actions/supplierActions';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if (session.role === 'admin') {
        const [statsRes, pendingSupRes, alertProductsRes] = await Promise.all([
        query(`
            SELECT
            (SELECT COUNT(*)::int FROM products) AS total_products,
            (SELECT COUNT(*)::int FROM transactions WHERE DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)) AS monthly_transactions,
            (SELECT COALESCE(SUM(stock * purchase_price), 0) FROM products) AS inventory_value
        `),
        query(`
            SELECT id, name, email, company_name, phone, created_at
            FROM users
            WHERE role = 'supplier' AND status = 'Pending'
            ORDER BY created_at DESC
        `),
        query(`
            SELECT p.id, p.sku, p.name, p.stock, p.min_stock, p.low_stock, p.unit, p.rack_location, c.name AS category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.stock <= p.min_stock
            ORDER BY p.stock ASC
        `),
        ]);

        const stats = statsRes.rows[0];
        const pendingSuppliers = pendingSupRes.rows;
        const alertProducts = alertProductsRes.rows;

        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Administrator</h1>
            <p className="text-sm text-slate-400 mt-1">
                Ringkasan inventori gudang, verifikasi supplier, dan peringatan stok kritis
            </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Produk</span>
                <Package className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stats.total_products}</p>
                <p className="text-xs text-slate-500 mt-1">SKU komponen terdaftar</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Transaksi Bulan Ini</span>
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">{stats.monthly_transactions}</p>
                <p className="text-xs text-slate-500 mt-1">Barang masuk & keluar</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Nilai Inventori</span>
                <Wallet className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-xl font-bold text-white mt-2">
                {formatRupiah(stats.inventory_value)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Berdasarkan harga beli</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Supplier Pending</span>
                <UserCheck className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-amber-400 mt-2">
                {pendingSuppliers.length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Menunggu persetujuan</p>
            </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-3">Akses Cepat Modul</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Link
                href="/dashboard/products"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
                >
                <Package className="w-4 h-4 text-blue-400" />
                <span>Produk</span>
                </Link>
                <Link
                href="/dashboard/categories"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
                >
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>Kategori</span>
                </Link>
                <Link
                href="/dashboard/transactions"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
                >
                <ArrowLeftRight className="w-4 h-4 text-violet-400" />
                <span>Transaksi</span>
                </Link>
                <Link
                href="/dashboard/restocks"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
                >
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Restock PO</span>
                </Link>
                <Link
                href="/dashboard/suppliers"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
                >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Verifikasi Supplier</span>
                </Link>
            </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <h2 className="font-bold text-white text-sm">
                    Supplier Menunggu Approval ({pendingSuppliers.length})
                    </h2>
                </div>
                <Link
                    href="/dashboard/suppliers"
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                    Lihat Semua
                </Link>
                </div>

                {pendingSuppliers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                    Tidak ada pengajuan supplier baru yang menunggu verifikasi.
                </p>
                ) : (
                <div className="space-y-3">
                    {pendingSuppliers.map((sup) => (
                    <div
                        key={sup.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                        <div>
                        <p className="font-semibold text-sm text-white">
                            {sup.company_name || sup.name}
                        </p>
                        <p className="text-xs text-slate-400">
                            PIC: {sup.name} • {sup.email}
                        </p>
                        </div>
                        <div className="flex items-center gap-2">
                        <form action={updateSupplierStatusAction}>
                            <input type="hidden" name="supplier_id" value={sup.id} />
                            <input type="hidden" name="status" value="Approved" />
                            <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                            </button>
                        </form>
                        <form action={updateSupplierStatusAction}>
                            <input type="hidden" name="supplier_id" value={sup.id} />
                            <input type="hidden" name="status" value="Rejected" />
                            <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                            </button>
                        </form>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h2 className="font-bold text-white text-sm">
                    Peringatan Stok Severe / Out of Stock ({alertProducts.length})
                    </h2>
                </div>
                <Link
                    href="/dashboard/products"
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                    Kelola Produk
                </Link>
                </div>

                {alertProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                    Seluruh stok komponen dalam kondisi aman.
                </p>
                ) : (
                <div className="space-y-2.5">
                    {alertProducts.map((item) => {
                    const statusInfo = getStockStatus(
                        item.stock,
                        item.min_stock,
                        item.low_stock
                    );
                    return (
                        <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                        >
                        <div>
                            <p className="text-xs font-mono text-slate-400">
                            {item.sku} • {item.rack_location}
                            </p>
                            <p className="text-sm font-semibold text-white">{item.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                            >
                            {statusInfo.label}
                            </span>
                            <p className="text-xs text-slate-300 mt-1">
                            Sisa: <strong className="text-white">{item.stock}</strong> {item.unit}
                            </p>
                        </div>
                        </div>
                    );
                    })}
                </div>
                )}
            </div>
            </div>
        </div>
        );
    }

    if (session.role === 'warehouse_manager') {
        const [overviewRes, pendingTrxRes, activeRestockRes] = await Promise.all([
        query(`
            SELECT
            COUNT(*)::int AS total_items,
            COALESCE(SUM(stock), 0)::int AS total_units,
            COUNT(*) FILTER (WHERE stock <= low_stock)::int AS low_stock_count
            FROM products
        `),
        query(`
            SELECT t.id, t.transaction_number, t.type, t.transaction_date, u.name AS staff_name
            FROM transactions t
            JOIN users u ON t.created_by = u.id
            WHERE t.status = 'Pending'
            ORDER BY t.created_at DESC
            LIMIT 5
        `),
        query(`
            SELECT ro.id, ro.po_number, ro.expected_delivery_date, ro.status, u.company_name, u.name AS supplier_name
            FROM restock_orders ro
            JOIN users u ON ro.supplier_id = u.id
            WHERE ro.status IN ('Pending', 'Confirmed', 'In Transit')
            ORDER BY ro.created_at DESC
            LIMIT 5
        `),
        ]);

        const overview = overviewRes.rows[0];

        return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Warehouse Manager</h1>
            <p className="text-sm text-slate-400 mt-1">
                Pemantauan stok gudang, persetujuan transaksi, dan progres restock supplier
            </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs text-slate-400">Total Jenis Komponen</span>
                <p className="text-2xl font-bold text-white mt-2">{overview.total_items} SKU</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs text-slate-400">Total Fisik Tersimpan</span>
                <p className="text-2xl font-bold text-blue-400 mt-2">{overview.total_units} Unit</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs text-slate-400">Low / Severe / Out of Stock</span>
                <p className="text-2xl font-bold text-amber-400 mt-2">
                {overview.low_stock_count} Item
                </p>
            </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-sm">Transaksi Menunggu Approval</h2>
                <Link href="/dashboard/transactions" className="text-xs text-blue-400">
                    Buka Transaksi
                </Link>
                </div>
                {pendingTrxRes.rows.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Tidak ada transaksi pending.</p>
                ) : (
                pendingTrxRes.rows.map((trx) => (
                    <div
                    key={trx.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                    <div>
                        <p className="font-bold text-white">{trx.transaction_number}</p>
                        <p className="text-slate-400">
                        Oleh {trx.staff_name} • {formatDate(trx.transaction_date)}
                        </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                        {trx.type === 'IN' ? 'Barang Masuk' : 'Barang Keluar'}
                    </span>
                    </div>
                ))
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-sm">Restock Order Berjalan</h2>
                <Link href="/dashboard/restocks" className="text-xs text-blue-400">
                    Kelola Restock
                </Link>
                </div>
                {activeRestockRes.rows.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Tidak ada PO aktif.</p>
                ) : (
                activeRestockRes.rows.map((po) => (
                    <div
                    key={po.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                    <div>
                        <p className="font-bold text-white">{po.po_number}</p>
                        <p className="text-slate-400">
                        {po.company_name || po.supplier_name} • Est. {formatDate(po.expected_delivery_date)}
                        </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
                        {po.status}
                    </span>
                    </div>
                ))
                )}
            </div>
            </div>
        </div>
        );
    }

    if (session.role === 'staff_gudang') {
        const todayTrxRes = await query(`
        SELECT id, transaction_number, type, status, customer_name, created_at
        FROM transactions
        WHERE transaction_date = CURRENT_DATE
        ORDER BY created_at DESC
        `);

        return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard Staff Gudang</h1>
                <p className="text-sm text-slate-400 mt-1">
                Pencatatan cepat transaksi barang masuk dan keluar hari ini
                </p>
            </div>
            <Link
                href="/dashboard/transactions"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
                <PlusCircle className="w-4 h-4" />
                <span>Quick Entry Transaksi</span>
            </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="font-bold text-white text-sm">
                Daftar Transaksi Hari Ini ({todayTrxRes.rows.length})
            </h2>
            {todayTrxRes.rows.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-950 rounded-xl border border-slate-800">
                Belum ada transaksi yang dicatat hari ini.
                </p>
            ) : (
                <div className="space-y-2.5">
                {todayTrxRes.rows.map((trx) => (
                    <div
                    key={trx.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                    <div>
                        <p className="font-bold text-white">{trx.transaction_number}</p>
                        <p className="text-slate-400">
                        Tipe: {trx.type === 'IN' ? 'Barang Masuk' : `Barang Keluar (${trx.customer_name || '-'})`}
                        </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-semibold">
                        {trx.status}
                    </span>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        );
    }

    const [pendingPoRes, historyPoRes] = await Promise.all([
        query(
        `SELECT id, po_number, order_date, expected_delivery_date, notes
        FROM restock_orders
        WHERE supplier_id = $1 AND status = 'Pending'
        ORDER BY created_at DESC`,
        [session.id]
        ),
        query(
        `SELECT id, po_number, order_date, expected_delivery_date, status
        FROM restock_orders
        WHERE supplier_id = $1 AND status <> 'Pending'
        ORDER BY created_at DESC
        LIMIT 8`,
        [session.id]
        ),
    ]);

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Mitra Supplier</h1>
            <p className="text-sm text-slate-400 mt-1">
            Konfirmasi pesanan restock dari gudang INVENTORA dan pantau riwayat pengiriman
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-white text-sm">
                    Restock Order Perlu Dikonfirmasi ({pendingPoRes.rows.length})
                </h2>
                </div>
                <Link
                href="/dashboard/restocks"
                className="text-xs text-blue-400 inline-flex items-center gap-1"
                >
                <span>Proses</span>
                <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {pendingPoRes.rows.length === 0 ? (
                <p className="text-xs text-slate-400 py-5 text-center bg-slate-950 rounded-xl border border-slate-800">
                Tidak ada pesanan restock baru yang menunggu konfirmasi.
                </p>
            ) : (
                pendingPoRes.rows.map((po) => (
                <div
                    key={po.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                    <div>
                    <p className="font-bold text-white">{po.po_number}</p>
                    <p className="text-slate-400">
                        Target Kirim: {formatDate(po.expected_delivery_date)}
                    </p>
                    </div>
                    <Link
                    href="/dashboard/restocks"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                    >
                    Konfirmasi
                    </Link>
                </div>
                ))
            )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="font-bold text-white text-sm">Riwayat Pengiriman ke Gudang</h2>
            {historyPoRes.rows.length === 0 ? (
                <p className="text-xs text-slate-400 py-5 text-center bg-slate-950 rounded-xl border border-slate-800">
                Belum ada riwayat pengiriman.
                </p>
            ) : (
                historyPoRes.rows.map((po) => (
                <div
                    key={po.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                    <div>
                    <p className="font-bold text-white">{po.po_number}</p>
                    <p className="text-slate-400">Order: {formatDate(po.order_date)}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-semibold">
                    {po.status}
                    </span>
                </div>
                ))
            )}
            </div>
        </div>
        </div>
    );
}