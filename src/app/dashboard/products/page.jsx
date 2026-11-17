import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import ProductManager from '@/components/products/ProductManager';

export default async function ProductsPage({ searchParams }) {
    const session = await getSession();
    if (!session || session.role === 'supplier') {
        redirect('/dashboard');
    }

    const resolvedParams = await searchParams;
    const search = String(resolvedParams?.search || '').trim();
    const category = String(resolvedParams?.category || '').trim();
    const status = String(resolvedParams?.status || '').trim();
    const sort = String(resolvedParams?.sort || 'newest').trim();
    const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
    const pageSize = 6;

    const conditions = [];
    const values = [];

    if (search) {
        values.push(`%${search}%`);
        conditions.push(`(p.name ILIKE $${values.length} OR p.sku ILIKE $${values.length})`);
    }

    if (category) {
        values.push(Number(category));
        conditions.push(`p.category_id = $${values.length}`);
    }

    if (status === 'Out of Stock') {
        conditions.push('p.stock = 0');
    } else if (status === 'Severe') {
        conditions.push('p.stock > 0 AND p.stock <= p.min_stock');
    } else if (status === 'Low') {
        conditions.push('p.stock > p.min_stock AND p.stock <= p.low_stock');
    } else if (status === 'Normal') {
        conditions.push('p.stock > p.low_stock');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sort === 'name_asc') orderByClause = 'ORDER BY p.name ASC';
    else if (sort === 'name_desc') orderByClause = 'ORDER BY p.name DESC';
    else if (sort === 'stock_asc') orderByClause = 'ORDER BY p.stock ASC';
    else if (sort === 'stock_desc') orderByClause = 'ORDER BY p.stock DESC';

    const countRes = await query(
        `SELECT COUNT(*)::int AS total FROM products p ${whereClause}`,
        values
    );
    const totalItems = countRes.rows[0]?.total || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const offset = (safePage - 1) * pageSize;

    const dataValues = [...values, pageSize, offset];

    const [productsRes, categoriesRes] = await Promise.all([
        query(
        `SELECT
            p.id, p.sku, p.name, p.category_id, p.description,
            p.purchase_price, p.selling_price, p.min_stock, p.low_stock,
            p.stock, p.unit, p.rack_location, p.image_url,
            c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ${orderByClause}
        LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
        dataValues
        ),
        query('SELECT id, name FROM categories ORDER BY name ASC'),
    ]);

    function buildPageUrl(targetPage) {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (status) params.set('status', status);
        if (sort && sort !== 'newest') params.set('sort', sort);
        params.set('page', String(targetPage));
        return `/dashboard/products?${params.toString()}`;
    }

    const canManage = ['admin', 'warehouse_manager'].includes(session.role);

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-white">Inventori Komponen PC & Laptop</h1>
            <p className="text-sm text-slate-400 mt-1">
            Monitoring stok real-time, lokasi rak, dan batas peringatan stok minimum
            </p>
        </div>

        <form
            method="GET"
            action="/dashboard/products"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
            <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari nama produk atau SKU..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
            </div>

            <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
                name="category"
                defaultValue={category}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            >
                <option value="">Semua Kategori</option>
                {categoriesRes.rows.map((cat) => (
                <option key={cat.id} value={cat.id}>
                    {cat.name}
                </option>
                ))}
            </select>
            </div>

            <div>
            <select
                name="status"
                defaultValue={status}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            >
                <option value="">Semua Status Stok</option>
                <option value="Out of Stock">Out of Stock (0)</option>
                <option value="Severe">Severe (&lt;= Min)</option>
                <option value="Low">Low (&lt;= Low)</option>
                <option value="Normal">Normal</option>
            </select>
            </div>

            <div className="flex gap-2">
            <div className="relative flex-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                name="sort"
                defaultValue={sort}
                className="w-full pl-9 pr-2 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                <option value="newest">Terbaru</option>
                <option value="name_asc">Nama A-Z</option>
                <option value="name_desc">Nama Z-A</option>
                <option value="stock_asc">Stok Terendah</option>
                <option value="stock_desc">Stok Tertinggi</option>
                </select>
            </div>
            <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
                Filter
            </button>
            </div>
        </form>

        <ProductManager
            products={productsRes.rows}
            categories={categoriesRes.rows}
            canManage={canManage}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>
            Menampilkan halaman <strong className="text-white">{safePage}</strong> dari{' '}
            <strong className="text-white">{totalPages}</strong> ({totalItems} total produk)
            </p>

            <div className="flex items-center gap-2">
            {safePage > 1 ? (
                <Link
                href={buildPageUrl(safePage - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
                >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
                </Link>
            ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/50 text-slate-600">
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
                </span>
            )}

            {safePage < totalPages ? (
                <Link
                href={buildPageUrl(safePage + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200"
                >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
                </Link>
            ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/50 text-slate-600">
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
                </span>
            )}
            </div>
        </div>
        </div>
    );
}