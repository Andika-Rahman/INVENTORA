import { FileSpreadsheet } from 'lucide-react';

export default function ExportCsvButton({ moduleName, label = 'Export CSV' }) {
    return (
        <a
        href={`/api/export?module=${moduleName}`}
        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600/20 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-xs font-semibold transition"
        >
        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
        <span>{label}</span>
        </a>
    );
}