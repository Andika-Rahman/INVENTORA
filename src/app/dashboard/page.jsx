import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
    Package,
    ArrowLeftRight,
    Wallet,
    UserCheck,
    Tags,
    Truck,
    AlertTriangle,
    ArrowUpRight,
    Building2,
    Clock,
    CheckCircle2,
    ShieldCheck,
} from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));
}

const roleHeaderMap = {
    admin: {
        title: 'Dashboard Administrator',
        subtitle: 'Ringkasan inventori gudang, verifikasi supplier, dan peringatan stok kritis',
    },
    warehouse_manager: {
        title: 'Dashboard Warehouse Manager',
        subtitle: 'Kontrol pengadaan Restock PO, persetujuan transaksi, dan kesehatan stok',
    },
    staff_gudang: {
        title: 'Dashboard Staff Gudang',
        subtitle: 'Pemantauan penerimaan fisik barang, pengiriman keluar, dan lokasi rak',
    },
    supplier: {
        title: 'Dashboard Mitra Supplier',
        subtitle: 'Pantau pesanan Restock PO dari gudang dan status pengiriman komponen',
    },
};

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const headerInfo = roleHeaderMap[session.role] || roleHeaderMap.staff_gudang;
    const isSupplier = session.role === 'supplier';

    if (isSupplier) {
        const [poStatsRes, recentPoRes, productCountRes] = await Promise.all([
        query(
            `SELECT
            COUNT(*)::int AS total_po,
            COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending_po,
            COUNT(*) FILTER (WHERE status IN ('Confirmed', 'In Transit'))::int AS active_po,
            COUNT(*) FILTER (WHERE status = 'Received')::int AS completed_po
            FROM restock_orders
            WHERE supplier_id = $1`,
            [session.id]
        ),
        query(
            `SELECT id, po_number, order_date, expected_delivery_date, status
            FROM restock_orders
            WHERE supplier_id = $1
            ORDER BY created_at DESC
            LIMIT 5`,
            [session.id]
        ),
        query('SELECT COUNT(*)::int AS total FROM products'),
        ]);

        const stats = poStatsRes.rows[0];

        return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {headerInfo.title}
                </h1>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                    {headerInfo.subtitle}
                </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25 self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4" />
                <span>Akun Mitra Terverifikasi</span>
                </span>
            </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Total Restock PO
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                {stats.total_po}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Seluruh pesanan dari gudang
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Menunggu Konfirmasi
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                </div>
                </div>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-3">
                {stats.pending_po}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Perlu respon konfirmasi PO
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Pengiriman Berjalan
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
                </div>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
                {stats.active_po}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Status Confirmed & In Transit
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Katalog Komponen
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                {productCountRes.rows[0].total}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                SKU terdaftar di INVENTORA
                </p>
            </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Pesanan Restock PO Terbaru
                </h2>
                <Link
                href="/dashboard/restocks"
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                <span>Buka Manajemen PO</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {recentPoRes.rows.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
                Belum ada pesanan Restock PO untuk akun Anda.
                </p>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {recentPoRes.rows.map((po) => (
                    <div
                    key={po.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                        {po.po_number}
                        </p>
                        <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                        Estimasi Tiba: {new Date(po.expected_delivery_date).toLocaleDateString('id-ID')}
                        </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                        {po.status}
                    </span>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        );
    }

    const [productSummaryRes, trxCountRes, pendingSuppliersRes, criticalProductsRes] =
        await Promise.all([
        query(
            `SELECT
            COUNT(*)::int AS total_products,
            COALESCE(SUM(stock * purchase_price), 0) AS total_valuation
            FROM products`
        ),
        query('SELECT COUNT(*)::int AS total_transactions FROM transactions'),
        query(
            `SELECT id, name, email, company_name, created_at
            FROM users
            WHERE role = 'supplier' AND status = 'Pending'
            ORDER BY created_at DESC`
        ),
        query(
            `SELECT id, sku, name, rack_location, stock, min_stock, unit
            FROM products
            WHERE stock <= min_stock
            ORDER BY stock ASC, name ASC
            LIMIT 6`
        ),
        ]);

    const productSummary = productSummaryRes.rows[0];
    const totalTransactions = trxCountRes.rows[0].total_transactions;
    const pendingSuppliers = pendingSuppliersRes.rows;
    const criticalProducts = criticalProductsRes.rows;

    const quickLinks = [
        {
        href: '/dashboard/products',
        label: 'Produk',
        icon: Package,
        roles: ['admin', 'warehouse_manager', 'staff_gudang'],
        accent: 'text-red-600 dark:text-red-400',
        },
        {
        href: '/dashboard/categories',
        label: 'Kategori',
        icon: Tags,
        roles: ['admin', 'warehouse_manager', 'staff_gudang'],
        accent: 'text-emerald-600 dark:text-emerald-400',
        },
        {
        href: '/dashboard/transactions',
        label: 'Transaksi',
        icon: ArrowLeftRight,
        roles: ['admin', 'warehouse_manager', 'staff_gudang'],
        accent: 'text-red-600 dark:text-red-400',
        },
        {
        href: '/dashboard/restocks',
        label: 'Restock PO',
        icon: Truck,
        roles: ['admin', 'warehouse_manager', 'staff_gudang'],
        accent: 'text-emerald-600 dark:text-emerald-400',
        },
        {
        href: '/dashboard/suppliers',
        label: 'Verifikasi Supplier',
        icon: UserCheck,
        roles: ['admin'],
        accent: 'text-red-600 dark:text-red-400',
        },
    ].filter((item) => item.roles.includes(session.role));

    return (
        <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="h-1.5 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {headerInfo.title}
                </h1>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                {headerInfo.subtitle}
                </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-xs font-bold text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sistem Gudang Aktif</span>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Total Produk
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
                </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                {productSummary.total_products}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                SKU komponen terdaftar
            </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Transaksi Gudang
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
                </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                {totalTransactions}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Barang masuk & keluar
            </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Nilai Inventori
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
                </div>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-3 truncate">
                {formatRupiah(productSummary.total_valuation)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Berdasarkan harga beli
            </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Supplier Pending
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
                </div>
            </div>
            <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-3">
                {pendingSuppliers.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Menunggu persetujuan
            </p>
            </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Akses Cepat Modul
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-500/40 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition"
                >
                    <Icon className={`w-4 h-4 shrink-0 ${item.accent}`} />
                    <span>{item.label}</span>
                </Link>
                );
            })}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Supplier Menunggu Approval ({pendingSuppliers.length})
                </h2>
                </div>
                {session.role === 'admin' && (
                <Link
                    href="/dashboard/suppliers"
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                    Lihat Semua
                </Link>
                )}
            </div>

            {pendingSuppliers.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
                Seluruh pendaftaran mitra supplier telah diverifikasi.
                </div>
            ) : (
                <div className="space-y-3">
                {pendingSuppliers.map((sup) => (
                    <div
                    key={sup.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {sup.company_name || sup.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            PIC: {sup.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                            {sup.email}
                        </p>
                        </div>
                    </div>

                    {session.role === 'admin' ? (
                        <Link
                        href="/dashboard/suppliers"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition shrink-0"
                        >
                        <span>Tinjau Verifikasi</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25">
                        Menunggu Admin
                        </span>
                    )}
                    </div>
                ))}
                </div>
            )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Peringatan Stok Severe / Out of Stock ({criticalProducts.length})
                </h2>
                </div>
                <Link
                href="/dashboard/products"
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                Kelola Produk
                </Link>
            </div>

            {criticalProducts.length === 0 ? (
                <div className="p-6 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-center text-xs text-emerald-700 dark:text-emerald-300">
                Seluruh stok komponen berada di atas batas minimum.
                </div>
            ) : (
                <div className="space-y-2.5">
                {criticalProducts.map((item) => {
                    const isOut = Number(item.stock) === 0;

                    return (
                    <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3"
                    >
                        <div className="min-w-0">
                        <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                            {item.sku} • {item.rack_location}
                        </p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                            {item.name}
                        </p>
                        </div>

                        <div className="text-right shrink-0">
                        <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut
                                ? 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                            }`}
                        >
                            {isOut ? 'Out of Stock' : 'Severe'}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                            Sisa:{' '}
                            <strong className="text-slate-900 dark:text-white">
                            {item.stock}
                            </strong>{' '}
                            {item.unit}
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