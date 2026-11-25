'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

export default function ExportCsvButton({
    moduleName = 'transactions',
    label = 'Export Excel (.xlsx)',
    }) {
    const [downloading, setDownloading] = useState(false);

    async function handleDownload() {
        setDownloading(true);
        try {
        const response = await fetch(`/api/export?module=${encodeURIComponent(moduleName)}`);
        if (!response.ok) {
            throw new Error('Gagal mengunduh file Excel');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const today = new Date().toISOString().split('T')[0];

        const link = document.createElement('a');
        link.href = url;
        link.download = `inventora-${moduleName}-${today}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        } catch (error) {
        alert(error.message || 'Terjadi kesalahan saat mengunduh laporan Excel');
        } finally {
        setDownloading(false);
        }
    }

    return (
        <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold transition cursor-pointer disabled:opacity-60"
        >
        {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
        ) : (
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        )}
        <span>{downloading ? 'Menyiapkan Excel...' : label}</span>
        </button>
    );
}