'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Cpu,
    LayoutDashboard,
    Package,
    FolderTree,
    ArrowLeftRight,
    Truck,
    UserCheck,
    Sun,
    Moon,
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

function emptySubscribe() {
    return () => {};
}

export default function Sidebar({
    role,
    pendingSuppliersCount = 0,
    pendingCount = 0,
    }) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    const isDark = mounted && theme === 'dark';
    const supplierBadge = pendingSuppliersCount || pendingCount;

    const menuByRole = {
        admin: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Produk Komponen', href: '/dashboard/products', icon: Package },
        { label: 'Kategori Part', href: '/dashboard/categories', icon: FolderTree },
        { label: 'Transaksi Gudang', href: '/dashboard/transactions', icon: ArrowLeftRight },
        { label: 'Restock Order (PO)', href: '/dashboard/restocks', icon: Truck },
        {
            label: 'Verifikasi Supplier',
            href: '/dashboard/suppliers',
            icon: UserCheck,
            badge: supplierBadge,
        },
        ],
        warehouse_manager: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Produk Komponen', href: '/dashboard/products', icon: Package },
        { label: 'Kategori Part', href: '/dashboard/categories', icon: FolderTree },
        { label: 'Transaksi Gudang', href: '/dashboard/transactions', icon: ArrowLeftRight },
        { label: 'Restock Order (PO)', href: '/dashboard/restocks', icon: Truck },
        ],
        staff_gudang: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Produk Komponen', href: '/dashboard/products', icon: Package },
        { label: 'Transaksi Gudang', href: '/dashboard/transactions', icon: ArrowLeftRight },
        ],
        supplier: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Transaksi Gudang', href: '/dashboard/transactions', icon: ArrowLeftRight },
        { label: 'Restock Order (PO)', href: '/dashboard/restocks', icon: Truck },
        ],
    };

    const navItems = menuByRole[role] || menuByRole.staff_gudang;

    return (
        <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex-col">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/25 dark:text-red-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
            </div>
            <div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight block leading-none">
                INVENTORA
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                PC & Laptop Warehouse
            </span>
            </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
                item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
                <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                }`}
                >
                <span className="flex items-center gap-3">
                    <Icon
                    className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500'
                    }`}
                    />
                    <span>{item.label}</span>
                </span>

                {item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center justify-center">
                    {item.badge}
                    </span>
                )}
                </Link>
            );
            })}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
            <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ubah Tema Tampilan"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-800 text-xs font-semibold transition cursor-pointer"
            >
            <span className="flex items-center gap-2.5">
                {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                <Moon className="w-4 h-4 text-red-600" />
                )}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </span>

            <span
                className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors ${
                isDark ? 'bg-red-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
            >
                <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
            </span>
            </button>
        </div>
        </aside>
    );
}