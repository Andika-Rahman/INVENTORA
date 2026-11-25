import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import * as dbModule from '@/lib/db';

const db = dbModule.default || dbModule.pool || dbModule;

function formatDateValue(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toISOString().split('T')[0];
}

function applyStatusStyle(cell, text) {
    const val = String(text || '').toLowerCase();
    if (
        val.includes('approved') ||
        val.includes('shipped') ||
        val.includes('received') ||
        val.includes('diperiksa') ||
        val.includes('masuk') ||
        val.includes('normal')
    ) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
        return;
    }

    if (
        val.includes('rejected') ||
        val.includes('keluar') ||
        val.includes('habis') ||
        val.includes('severe')
    ) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
        return;
    }

    if (
        val.includes('pending') ||
        val.includes('refund') ||
        val.includes('transit') ||
        val.includes('confirmed') ||
        val.includes('low')
    ) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB45309' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    }
}

function buildStyledSheet(workbook, { sheetName, title, columns, rows, statusColumns = [] }) {
    const worksheet = workbook.addWorksheet(sheetName, {
        pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        },
    });

    const lastColLetter = worksheet.getColumn(columns.length).letter;

    worksheet.mergeCells(`A1:${lastColLetter}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    worksheet.getRow(1).height = 30;

    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const subtitleCell = worksheet.getCell('A2');
    const printedDate = new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
    });
    subtitleCell.value = `INVENTORA Warehouse Management System • Diunduh pada: ${printedDate}`;
    subtitleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    worksheet.getRow(2).height = 20;

    worksheet.getRow(3).height = 10;

    const headerRow = worksheet.getRow(4);
    headerRow.height = 26;

    columns.forEach((col, index) => {
        const colNumber = index + 1;
        worksheet.getColumn(colNumber).width = col.width;
        const cell = headerRow.getCell(colNumber);
        cell.value = col.header;
        cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
        top: { style: 'thin', color: { argb: 'FF065F46' } },
        left: { style: 'thin', color: { argb: 'FF10B981' } },
        bottom: { style: 'medium', color: { argb: 'FF047857' } },
        right: { style: 'thin', color: { argb: 'FF10B981' } },
        };
    });

    rows.forEach((rowData, rowIndex) => {
        const excelRow = worksheet.getRow(rowIndex + 5);
        const isEven = rowIndex % 2 === 1;
        let maxLines = 1;

        columns.forEach((col, colIndex) => {
        const colNumber = colIndex + 1;
        const cell = excelRow.getCell(colNumber);
        const val = rowData[col.key] ?? '-';
        cell.value = val;

        const textLength = String(val).length;
        const estimatedLines = Math.ceil(textLength / Math.max(col.width - 3, 10));
        if (estimatedLines > maxLines) {
            maxLines = estimatedLines;
        }

        cell.font = {
            name: 'Calibri',
            size: 10,
            bold: col.bold || false,
            color: { argb: 'FF0F172A' },
        };

        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' },
        };

        cell.alignment = {
            vertical: 'middle',
            horizontal: col.align || 'left',
            wrapText: true,
        };

        cell.border = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };

        if (statusColumns.includes(col.key)) {
            applyStatusStyle(cell, val);
        }
        });

        excelRow.height = Math.max(24, Math.min(maxLines * 15 + 6, 90));
    });

    worksheet.autoFilter = {
        from: 'A4',
        to: `${lastColLetter}4`,
    };

    worksheet.views = [{ state: 'frozen', ySplit: 4 }];
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const moduleName = (
        searchParams.get('module') ||
        searchParams.get('type') ||
        'transactions'
        ).toLowerCase();

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'INVENTORA Warehouse';
        workbook.created = new Date();

        const today = new Date().toISOString().split('T')[0];
        let fileName = `inventora-${moduleName}-${today}.xlsx`;

        if (moduleName === 'restocks') {
        const res = await db.query(`
            SELECT
            ro.po_number,
            ro.order_date,
            ro.expected_delivery_date,
            ro.status,
            COALESCE(s.company_name, s.name, '-') AS supplier_name,
            COALESCE(u.name, '-') AS created_by_name,
            COALESCE(ro.notes, '-') AS notes,
            COALESCE(
                STRING_AGG(p.sku || ' (' || roi.quantity || ' ' || p.unit || ')', ', '),
                '-'
            ) AS items_summary
            FROM restock_orders ro
            LEFT JOIN users s ON ro.supplier_id = s.id
            LEFT JOIN users u ON ro.created_by = u.id
            LEFT JOIN restock_order_items roi ON ro.id = roi.restock_order_id
            LEFT JOIN products p ON roi.product_id = p.id
            GROUP BY ro.id, s.company_name, s.name, u.name
            ORDER BY ro.created_at DESC
        `);

        const formattedRows = res.rows.map((row, idx) => ({
            no: idx + 1,
            po_number: row.po_number,
            order_date: formatDateValue(row.order_date),
            expected_delivery_date: formatDateValue(row.expected_delivery_date),
            supplier_name: row.supplier_name,
            items_summary: row.items_summary,
            status: row.status,
            created_by_name: row.created_by_name,
            notes: row.notes || '-',
        }));

        buildStyledSheet(workbook, {
            sheetName: 'Restock PO',
            title: 'LAPORAN PURCHASE ORDER (RESTOCK) — INVENTORA',
            statusColumns: ['status'],
            columns: [
            { header: 'No', key: 'no', width: 6, align: 'center' },
            { header: 'Nomor PO', key: 'po_number', width: 20, align: 'center', bold: true },
            { header: 'Tgl Order', key: 'order_date', width: 14, align: 'center' },
            { header: 'Est. Tiba', key: 'expected_delivery_date', width: 14, align: 'center' },
            { header: 'Mitra Supplier', key: 'supplier_name', width: 28, align: 'left' },
            { header: 'Daftar Komponen & Qty', key: 'items_summary', width: 36, align: 'left' },
            { header: 'Status PO', key: 'status', width: 20, align: 'center' },
            { header: 'Dibuat Oleh', key: 'created_by_name', width: 22, align: 'left' },
            { header: 'Catatan', key: 'notes', width: 38, align: 'left' },
            ],
            rows: formattedRows,
        });
        } else if (moduleName === 'products') {
        const res = await db.query(`
            SELECT
            p.sku,
            p.name,
            COALESCE(c.name, '-') AS category_name,
            p.rack_location,
            p.purchase_price,
            p.selling_price,
            p.stock,
            p.min_stock,
            p.low_stock,
            p.unit
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.sku ASC
        `);

        const formattedRows = res.rows.map((row, idx) => {
            let stockStatus = 'Normal';
            if (row.stock === 0) stockStatus = 'Stok Habis';
            else if (row.stock <= row.min_stock) stockStatus = 'Severe (Kritis)';
            else if (row.stock <= row.low_stock) stockStatus = 'Low Stock';

            return {
            no: idx + 1,
            sku: row.sku,
            name: row.name,
            category_name: row.category_name,
            rack_location: row.rack_location,
            purchase_price: Number(row.purchase_price),
            selling_price: Number(row.selling_price),
            stock: `${row.stock} ${row.unit}`,
            stock_status: stockStatus,
            };
        });

        buildStyledSheet(workbook, {
            sheetName: 'Stok Produk',
            title: 'LAPORAN INVENTARIS KOMPONEN GUDANG — INVENTORA',
            statusColumns: ['stock_status'],
            columns: [
            { header: 'No', key: 'no', width: 6, align: 'center' },
            { header: 'Kode SKU', key: 'sku', width: 20, align: 'center', bold: true },
            { header: 'Nama Komponen', key: 'name', width: 36, align: 'left' },
            { header: 'Kategori', key: 'category_name', width: 24, align: 'left' },
            { header: 'Lokasi Rak', key: 'rack_location', width: 15, align: 'center' },
            { header: 'Harga Beli (Rp)', key: 'purchase_price', width: 18, align: 'right' },
            { header: 'Harga Jual (Rp)', key: 'selling_price', width: 18, align: 'right' },
            { header: 'Stok Aktual', key: 'stock', width: 14, align: 'center', bold: true },
            { header: 'Status Stok', key: 'stock_status', width: 18, align: 'center' },
            ],
            rows: formattedRows,
        });
        } else {
        const res = await db.query(`
            SELECT
            t.transaction_number,
            t.type,
            t.transaction_date,
            COALESCE(ro.po_number, '-') AS po_number,
            COALESCE(s.company_name, s.name, '-') AS supplier_name,
            COALESCE(t.customer_name, '-') AS customer_name,
            t.status,
            COALESCE(u.name, '-') AS created_by_name,
            COALESCE(t.notes, '-') AS notes,
            COALESCE(
                STRING_AGG(p.sku || ' - ' || p.name || ' (' || ti.quantity || ' ' || p.unit || ')', '; '),
                '-'
            ) AS items_summary
            FROM transactions t
            LEFT JOIN restock_orders ro ON t.restock_order_id = ro.id
            LEFT JOIN users s ON t.supplier_id = s.id
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
            LEFT JOIN products p ON ti.product_id = p.id
            GROUP BY t.id, ro.po_number, s.company_name, s.name, u.name
            ORDER BY t.transaction_date DESC, t.created_at DESC
        `);

        const formattedRows = res.rows.map((row, idx) => ({
            no: idx + 1,
            transaction_number: row.transaction_number,
            type: row.type === 'IN' ? 'Barang Masuk' : 'Barang Keluar',
            transaction_date: formatDateValue(row.transaction_date),
            po_number: row.po_number || '-',
            supplier_name: row.type === 'IN' ? row.supplier_name : '-',
            customer_name: row.type === 'OUT' ? row.customer_name : '-',
            items_summary: row.items_summary,
            status: row.status,
            created_by_name: row.created_by_name,
            notes: row.notes || '-',
        }));

        buildStyledSheet(workbook, {
            sheetName: 'Transaksi Gudang',
            title: 'LAPORAN TRANSAKSI BARANG MASUK & KELUAR — INVENTORA',
            statusColumns: ['type', 'status'],
            columns: [
            { header: 'No', key: 'no', width: 6, align: 'center' },
            { header: 'No Transaksi', key: 'transaction_number', width: 22, align: 'center', bold: true },
            { header: 'Tipe', key: 'type', width: 16, align: 'center' },
            { header: 'Tanggal', key: 'transaction_date', width: 14, align: 'center' },
            { header: 'Nomor PO', key: 'po_number', width: 18, align: 'center' },
            { header: 'Supplier', key: 'supplier_name', width: 28, align: 'left' },
            { header: 'Customer Tujuan', key: 'customer_name', width: 26, align: 'left' },
            { header: 'Rincian Komponen & Qty', key: 'items_summary', width: 38, align: 'left' },
            { header: 'Status', key: 'status', width: 15, align: 'center' },
            { header: 'Dicatat Oleh', key: 'created_by_name', width: 22, align: 'left' },
            { header: 'Catatan', key: 'notes', width: 42, align: 'left' },
            ],
            rows: formattedRows,
        });
        }

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'no-store',
        },
        });
    } catch (error) {
        return NextResponse.json(
        { error: 'Gagal membuat file Excel: ' + error.message },
        { status: 500 }
        );
    }
}