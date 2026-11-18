import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import TransactionManager from '@/components/transactions/TransactionManager';

export default async function TransactionsPage({ searchParams }) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const resolvedParams = await searchParams;
    const activeTab = String(resolvedParams?.type || 'ALL').toUpperCase();
    const statusFilter = String(resolvedParams?.status || '').trim();
    const dateFilter = String(resolvedParams?.date || '').trim();
    const partySearch = String(resolvedParams?.party || '').trim();
    const sort = String(resolvedParams?.sort || 'newest').trim();
    const preselectedProductId = String(resolvedParams?.product_id || '').trim();
    const initialModalType = String(resolvedParams?.open || '').toUpperCase();

    const conditions = [];
    const values = [];

    if (session.role === 'supplier') {
        values.push(session.id);
        conditions.push(`t.supplier_id = $${values.length}`);
    }

    if (activeTab === 'IN' || activeTab === 'OUT') {
        values.push(activeTab);
        conditions.push(`t.type = $${values.length}`);
    }

    if (statusFilter) {
        values.push(statusFilter);
        conditions.push(`t.status = $${values.length}`);
    }

    if (dateFilter) {
        values.push(dateFilter);
        conditions.push(`t.transaction_date = $${values.length}`);
    }

    if (partySearch) {
        values.push(`%${partySearch}%`);
        conditions.push(
        `(t.customer_name ILIKE $${values.length} OR u_sup.company_name ILIKE $${values.length} OR u_sup.name ILIKE $${values.length} OR t.transaction_number ILIKE $${values.length})`
        );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy =
        sort === 'oldest' ? 'ORDER BY t.created_at ASC' : 'ORDER BY t.created_at DESC';

    const [trxRes, trxItemsRes, availablePosRes, poItemsRes, suppliersRes, productsRes] =
        await Promise.all([
        query(
            `SELECT
            t.id,
            t.transaction_number,
            t.type,
            t.transaction_date,
            t.restock_order_id,
            t.supplier_id,
            t.customer_name,
            t.notes,
            t.status,
            t.rejection_reason,
            t.created_by,
            ro.po_number,
            u_sup.name AS supplier_name,
            u_sup.company_name AS supplier_company,
            u_crt.name AS created_by_name,
            u_apr.name AS approved_by_name
            FROM transactions t
            LEFT JOIN restock_orders ro ON t.restock_order_id = ro.id
            LEFT JOIN users u_sup ON t.supplier_id = u_sup.id
            JOIN users u_crt ON t.created_by = u_crt.id
            LEFT JOIN users u_apr ON t.approved_by = u_apr.id
            ${whereClause}
            ${orderBy}`,
            values
        ),
        query(`
            SELECT
            ti.id,
            ti.transaction_id,
            ti.product_id,
            ti.quantity,
            p.sku,
            p.name AS product_name,
            p.unit
            FROM transaction_items ti
            JOIN products p ON ti.product_id = p.id
            ORDER BY ti.id ASC
        `),
        query(`
            SELECT
            ro.id,
            ro.po_number,
            ro.supplier_id,
            u.name AS supplier_name,
            u.company_name AS supplier_company
            FROM restock_orders ro
            JOIN users u ON ro.supplier_id = u.id
            WHERE ro.status = 'Received'
            AND NOT EXISTS (
                SELECT 1 FROM transactions t
                WHERE t.restock_order_id = ro.id AND t.status <> 'Rejected'
            )
            ORDER BY ro.created_at DESC
        `),
        query('SELECT restock_order_id, product_id, quantity FROM restock_order_items'),
        query(`
            SELECT id, name, company_name
            FROM users
            WHERE role = 'supplier' AND status = 'Approved'
            ORDER BY company_name ASC, name ASC
        `),
        query('SELECT id, sku, name, stock, unit FROM products ORDER BY name ASC'),
        ]);

    const itemsByTrx = {};
    for (const item of trxItemsRes.rows) {
        if (!itemsByTrx[item.transaction_id]) {
        itemsByTrx[item.transaction_id] = [];
        }
        itemsByTrx[item.transaction_id].push(item);
    }

    const transactions = trxRes.rows.map((trx) => {
        const items = itemsByTrx[trx.id] || [];
        const totalQty = items.reduce((acc, row) => acc + row.quantity, 0);
        return {
        ...trx,
        items,
        total_qty: totalQty,
        };
    });

    const itemsByPo = {};
    for (const item of poItemsRes.rows) {
        if (!itemsByPo[item.restock_order_id]) {
        itemsByPo[item.restock_order_id] = [];
        }
        itemsByPo[item.restock_order_id].push(item);
    }

    const availablePos = availablePosRes.rows.map((po) => ({
        ...po,
        items: itemsByPo[po.id] || [],
    }));

    const tabs = [
        { key: 'ALL', label: 'Semua Transaksi' },
        { key: 'IN', label: 'Barang Masuk (IN)' },
        { key: 'OUT', label: 'Barang Keluar (OUT)' },
    ];

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-white">Transaksi Gudang</h1>
            <p className="text-sm text-slate-400 mt-1">
            Pencatatan dan validasi arus barang masuk dari supplier serta barang keluar ke tujuan
            </p>
        </div>

        {session.role !== 'supplier' && (
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
            {tabs.map((tab) => {
                const href =
                tab.key === 'ALL'
                    ? '/dashboard/transactions'
                    : `/dashboard/transactions?type=${tab.key}`;
                const isCurrent = activeTab === tab.key;

                return (
                <Link
                    key={tab.key}
                    href={href}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                    isCurrent
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                >
                    {tab.label}
                </Link>
                );
            })}
            </div>
        )}

        <form
            method="GET"
            action="/dashboard/transactions"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
            {activeTab !== 'ALL' && <input type="hidden" name="type" value={activeTab} />}

            <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                name="party"
                defaultValue={partySearch}
                placeholder="Cari no. transaksi, supplier, atau customer..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
            </div>

            <div>
            <input
                type="date"
                name="date"
                defaultValue={dateFilter}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
            </div>

            <div>
            <select
                name="status"
                defaultValue={statusFilter}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            >
                <option value="">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Shipped">Shipped</option>
            </select>
            </div>

            <div className="flex gap-2">
            <select
                name="sort"
                defaultValue={sort}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
            </select>

            <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
                Filter
            </button>
            </div>
        </form>

        <TransactionManager
            transactions={transactions}
            availablePos={availablePos}
            suppliers={suppliersRes.rows}
            products={productsRes.rows}
            userId={session.id}
            role={session.role}
            activeTab={activeTab}
            preselectedProductId={preselectedProductId}
            initialModalType={initialModalType}
        />
        </div>
    );
}