import { redirect } from 'next/navigation';
import { Search } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { getStockStatus } from '@/lib/formatters';
import ProductManager from '@/components/products/ProductManager';
import ExportCsvButton from '@/components/ui/ExportCsvButton';

export default async function ProductsPage({ searchParams }) {
    const session = await getSession();
    if (!session || session.role === 'supplier') {
        redirect('/dashboard');
    }

    const resolvedParams = await searchParams;
    const search = String(resolvedParams?.search || '').trim();
    const categoryFilter = String(resolvedParams?.category || '').trim();
    const statusFilter = String(resolvedParams?.status || '').trim();

    const conditions = [];
    const values = [];

    if (search) {
        values.push(`%${search}%`);
        conditions.push(`(p.name ILIKE $${values.length} OR p.sku ILIKE $${values.length})`);
    }

    if (categoryFilter) {
        values.push(Number(categoryFilter));
        conditions.push(`p.category_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [productsRes, allScanProductsRes, categoriesRes] = await Promise.all([
        query(
        `SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.created_at DESC`,
        values
        ),
        query(
        `SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC`
        ),
        query('SELECT id, name FROM categories ORDER BY name ASC'),
    ]);

    const filteredProducts = statusFilter
        ? productsRes.rows.filter(
            (item) =>
            getStockStatus(item.stock, item.min_stock, item.low_stock).label === statusFilter
        )
        : productsRes.rows;

    const canManage = ['admin', 'warehouse_manager'].includes(session.role);
    const canUpdateStock = ['admin', 'warehouse_manager', 'staff_gudang'].includes(session.role);
    const canRecordTransaction = ['staff_gudang', 'admin'].includes(session.role);

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-white">Produk Komponen Gudang</h1>
            <p className="text-sm text-slate-400 mt-1">
                Daftar master part PC & laptop beserta lokasi rak dan status ketersediaan stok
            </p>
            </div>

            <ExportCsvButton moduleName="products" label="Export Produk (CSV)" />
        </div>

        <form
            method="GET"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
            <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari nama komponen atau kode SKU..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
            </div>

            <div>
            <select
                name="category"
                defaultValue={categoryFilter}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            >
                <option value="">Semua Kategori</option>
                {categoriesRes.rows.map((cat) => (
                <option key={cat.id} value={cat.id}>
                    {cat.name}
                </option>
                ))}
            </select>
            </div>

            <div className="flex items-center gap-2">
            <select
                name="status"
                defaultValue={statusFilter}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            >
                <option value="">Semua Status</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
                <option value="Severe">Severe</option>
                <option value="Out of Stock">Out of Stock</option>
            </select>

            <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
            >
                Filter
            </button>
            </div>
        </form>

        <ProductManager
            products={filteredProducts}
            allProductsForScan={allScanProductsRes.rows}
            categories={categoriesRes.rows}
            canManage={canManage}
            canUpdateStock={canUpdateStock}
            canRecordTransaction={canRecordTransaction}
        />
        </div>
    );
}