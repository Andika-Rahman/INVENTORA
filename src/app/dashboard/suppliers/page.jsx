import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle2, XCircle, Clock, Mail, Phone, MapPin } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate } from '@/lib/formatters';
import { updateSupplierStatusAction } from '@/actions/supplierActions';

export default async function SuppliersPage({ searchParams }) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        redirect('/dashboard');
    }

    const resolvedParams = await searchParams;
    const activeFilter = resolvedParams?.status || 'ALL';

    let sql = `
        SELECT id, name, email, company_name, phone, address, status, created_at
        FROM users
        WHERE role = 'supplier'
    `;
    const params = [];

    if (['Pending', 'Approved', 'Rejected'].includes(activeFilter)) {
        sql += ' AND status = $1';
        params.push(activeFilter);
    }

    sql += `
        ORDER BY
        CASE status WHEN 'Pending' THEN 1 WHEN 'Approved' THEN 2 ELSE 3 END,
        created_at DESC
    `;

    const result = await query(sql, params);
    const suppliers = result.rows;

    const tabs = [
        { key: 'ALL', label: 'Semua Supplier' },
        { key: 'Pending', label: 'Menunggu Approval' },
        { key: 'Approved', label: 'Approved' },
        { key: 'Rejected', label: 'Rejected' },
    ];

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-white">Verifikasi & Manajemen Supplier</h1>
            <p className="text-sm text-slate-400 mt-1">
                Tinjau pendaftaran mitra supplier komponen sebelum diberikan akses sistem
            </p>
            </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
            {tabs.map((tab) => {
            const href =
                tab.key === 'ALL'
                ? '/dashboard/suppliers'
                : `/dashboard/suppliers?status=${tab.key}`;
            const isCurrent = activeFilter === tab.key;

            return (
                <Link
                key={tab.key}
                href={href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
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

        {suppliers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-sm">
            Tidak ada data supplier untuk filter ini.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((sup) => (
                <div
                key={sup.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                        <h2 className="font-bold text-white">
                            {sup.company_name || 'Perusahaan Supplier'}
                        </h2>
                        <p className="text-xs text-slate-400">PIC: {sup.name}</p>
                        </div>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        sup.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : sup.status === 'Rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                    >
                        {sup.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {sup.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {sup.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        <span>{sup.status}</span>
                    </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                    <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{sup.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{sup.phone || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>{sup.address || '-'}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-500">
                        Terdaftar pada {formatDate(sup.created_at)}
                    </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    {sup.status !== 'Approved' && (
                    <form action={updateSupplierStatusAction} className="flex-1">
                        <input type="hidden" name="supplier_id" value={sup.id} />
                        <input type="hidden" name="status" value="Approved" />
                        <button
                        type="submit"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Supplier</span>
                        </button>
                    </form>
                    )}

                    {sup.status !== 'Rejected' && (
                    <form action={updateSupplierStatusAction} className="flex-1">
                        <input type="hidden" name="supplier_id" value={sup.id} />
                        <input type="hidden" name="status" value="Rejected" />
                        <button
                        type="submit"
                        className="w-full py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                        </button>
                    </form>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
    }