import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { getStockStatus } from '@/lib/formatters';

function escapeCsvCell(value) {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
}

function buildCsvContent(headers, rows) {
    const headerLine = headers.map(escapeCsvCell).join(',');
    const dataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
    return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
}

export async function GET(request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetModule = String(searchParams.get('module') || '').toLowerCase();

    const rolePermissions = {
        admin: ['products', 'transactions', 'restocks', 'categories', 'suppliers'],
        warehouse_manager: ['products', 'transactions', 'restocks'],
        staff_gudang: ['transactions'],
    };

    const allowedModules = rolePermissions[session.role] || [];
    if (!allowedModules.includes(targetModule)) {
        return NextResponse.json(
        { error: 'Anda tidak memiliki hak akses untuk mengekspor modul ini.' },
        { status: 403 }
        );
    }

    let csvData = '';
    const dateStamp = new Date().toISOString().split('T')[0];

    if (targetModule === 'products') {
        const res = await query(`
        SELECT
            p.sku, p.name, c.name AS category_name, p.purchase_price, p.selling_price,
            p.min_stock, p.low_stock, p.stock, p.unit, p.rack_location
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.sku ASC
        `);

        const headers = [
        'SKU',
        'Nama Produk',
        'Kategori',
        'Harga Beli',
        'Harga Jual',
        'Stok Minimum',
        'Stok Low',
        'Stok Saat Ini',
        'Satuan',
        'Status Stok',
        'Lokasi Rak',
        ];

        const rows = res.rows.map((r) => [
        r.sku,
        r.name,
        r.category_name,
        Number(r.purchase_price),
        Number(r.selling_price),
        r.min_stock,
        r.low_stock,
        r.stock,
        r.unit,
        getStockStatus(r.stock, r.min_stock, r.low_stock).label,
        r.rack_location,
        ]);

        csvData = buildCsvContent(headers, rows);
    } else if (targetModule === 'transactions') {
        let sql = `
        SELECT
            t.transaction_number,
            t.type,
            t.transaction_date,
            ro.po_number,
            COALESCE(u_sup.company_name, u_sup.name, '-') AS supplier_name,
            COALESCE(t.customer_name, '-') AS customer_name,
            t.status,
            u_crt.name AS created_by_name,
            COALESCE(t.notes, '-') AS notes
        FROM transactions t
        LEFT JOIN restock_orders ro ON t.restock_order_id = ro.id
        LEFT JOIN users u_sup ON t.supplier_id = u_sup.id
        JOIN users u_crt ON t.created_by = u_crt.id
        `;
        const params = [];

        if (session.role === 'staff_gudang') {
        sql += ' WHERE t.created_by = $1';
        params.push(session.id);
        }

        sql += ' ORDER BY t.created_at DESC';
        const res = await query(sql, params);

        const headers = [
        'No Transaksi',
        'Tipe',
        'Tanggal',
        'Nomor PO',
        'Supplier',
        'Customer Tujuan',
        'Status',
        'Dicatat Oleh',
        'Catatan',
        ];

        const rows = res.rows.map((r) => [
        r.transaction_number,
        r.type === 'IN' ? 'Barang Masuk' : 'Barang Keluar',
        new Date(r.transaction_date).toISOString().split('T')[0],
        r.po_number || '-',
        r.supplier_name,
        r.customer_name,
        r.status,
        r.created_by_name,
        r.notes,
        ]);

        csvData = buildCsvContent(headers, rows);
    } else if (targetModule === 'restocks') {
        const res = await query(`
        SELECT
            ro.po_number,
            COALESCE(u_sup.company_name, u_sup.name) AS supplier_name,
            ro.order_date,
            ro.expected_delivery_date,
            ro.status,
            COALESCE(ro.supplier_rating::text, '-') AS rating,
            COALESCE(ro.notes, '-') AS notes
        FROM restock_orders ro
        JOIN users u_sup ON ro.supplier_id = u_sup.id
        ORDER BY ro.created_at DESC
        `);

        const headers = [
        'Nomor PO',
        'Supplier',
        'Tanggal Order',
        'Estimasi Tiba',
        'Status',
        'Rating Supplier',
        'Catatan',
        ];

        const rows = res.rows.map((r) => [
        r.po_number,
        r.supplier_name,
        new Date(r.order_date).toISOString().split('T')[0],
        new Date(r.expected_delivery_date).toISOString().split('T')[0],
        r.status,
        r.rating,
        r.notes,
        ]);

        csvData = buildCsvContent(headers, rows);
    } else if (targetModule === 'categories') {
        const res = await query(`
        SELECT c.name, COALESCE(c.description, '-') AS description, COUNT(p.id)::int AS total_sku
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC
        `);

        const headers = ['Nama Kategori', 'Deskripsi', 'Jumlah Produk SKU'];
        const rows = res.rows.map((r) => [r.name, r.description, r.total_sku]);
        csvData = buildCsvContent(headers, rows);
    } else if (targetModule === 'suppliers') {
        const res = await query(`
        SELECT name, COALESCE(company_name, '-') AS company_name, email, COALESCE(phone, '-') AS phone, status, created_at
        FROM users
        WHERE role = 'supplier'
        ORDER BY created_at DESC
        `);

        const headers = [
        'Nama PIC',
        'Perusahaan',
        'Email',
        'Telepon',
        'Status Verifikasi',
        'Tanggal Daftar',
        ];

        const rows = res.rows.map((r) => [
        r.name,
        r.company_name,
        r.email,
        r.phone,
        r.status,
        new Date(r.created_at).toISOString().split('T')[0],
        ]);

        csvData = buildCsvContent(headers, rows);
    }

    return new NextResponse(csvData, {
        status: 200,
        headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventora-${targetModule}-${dateStamp}.csv"`,
        },
    });
}