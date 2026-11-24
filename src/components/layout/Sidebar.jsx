'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Cpu,
    LayoutDashboard,
    Package,
    Tags,
    ArrowLeftRight,
    Truck,
    UserCheck,
} from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function Sidebar({ session }) {
    const pathname = usePathname();
    const role = session?.role || 'staff_gudang';

    const navItems = [
        {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'warehouse_manager', 'staff_gudang', 'supplier'],
        },
        {
        href: '/dashboard/products',
        label: 'Produk Komponen',
        icon: Package,
        roles: ['admin', 'warehouse_manager', 'staff_gudang', 'supplier'],
        },
        {
        href: '/dashboard/categories',
        label: 'Kategori Part',
        icon: Tags,
        roles: ['admin', 'warehouse_manager', 'staff_gudang'],
        },
        {
        href: '/dashboard/transactions',
        label: 'Transaksi Gudang',
        icon: ArrowLeftRight,
        roles: ['admin', 'warehouse_manager', 'staff_gudang'],
        },
        {
        href: '/dashboard/restocks',
        label: 'Restock Order (PO)',
        icon: Truck,
        roles: ['admin', 'warehouse_manager', 'staff_gudang', 'supplier'],
        },
        {
        href: '/dashboard/suppliers',
        label: 'Verifikasi Supplier',
        icon: UserCheck,
        roles: ['admin'],
        },
    ];

    const allowedItems = navItems.filter((item) => item.roles.includes(role));

    return (
        <aside className="w-64 shrink-0 sticky top-0 h-screen overflow-y-auto bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
        <div>
            <div className="h-1 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="p-5 border-b border-slate-100 dark:border-zinc-800/80">
            <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm shadow-red-600/25">
                <Cpu className="w-5 h-5" />
                </div>
                <div>
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight block leading-none">
                    INVENTORA
                </span>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-1 block">
                    PC & Laptop Warehouse
                </span>
                </div>
            </Link>
            </div>

            <nav className="p-3.5 space-y-1.5">
            {allowedItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                        ? 'bg-red-600 text-white shadow-sm shadow-red-600/25'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-emerald-50/70 hover:text-emerald-700 dark:hover:bg-zinc-900 dark:hover:text-white'
                    }`}
                >
                    <Icon
                    className={`w-4 h-4 shrink-0 ${
                        isActive
                        ? 'text-white'
                        : 'text-slate-400 dark:text-zinc-500'
                    }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-300" />
                    )}
                </Link>
                );
            })}
            </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                Tampilan Tema
            </span>
            <ThemeToggle />
            </div>
        </div>
        </aside>
    );
}