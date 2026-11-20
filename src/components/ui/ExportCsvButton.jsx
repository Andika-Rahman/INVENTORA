import { FileSpreadsheet } from 'lucide-react';

export default function ExportCsvButton({ moduleName, label = 'Export CSV' }) {
    return (
        <a
        href={`/api/export?module=${moduleName}`}
        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 dark:bg-zinc-900 dark:hover:bg-emerald-500/10 dark:text-zinc-200 dark:hover:text-emerald-300 dark:border-zinc-800 dark:hover:border-emerald-500/40 text-xs font-semibold transition"
        >
        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>{label}</span>
        </a>
    );
}