'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    User,
    LogOut,
    ChevronDown,
    ShieldCheck,
    UserCog,
} from 'lucide-react';
import { logoutAction } from '@/actions/authActions';
import ThemeToggle from '@/components/theme/ThemeToggle';
import NotificationBell from '@/components/layout/NotificationBell';

const roleBadgeConfig = {
    admin: {
        label: 'Administrator',
        badgeClass:
        'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/25',
    },
    warehouse_manager: {
        label: 'Warehouse Manager',
        badgeClass:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
    },
    staff_gudang: {
        label: 'Staff Gudang',
        badgeClass:
        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
    },
    supplier: {
        label: 'Mitra Supplier',
        badgeClass:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
    },
};

export default function Navbar({ session }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const roleInfo = roleBadgeConfig[session?.role] || {
        label: session?.role || 'User',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    useEffect(() => {
        function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="h-1 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.badgeClass}`}
            >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{roleInfo.label}</span>
            </span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-zinc-400">
                • INVENTORA Warehouse HQ
            </span>
            </div>

            <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />

            <div ref={dropdownRef} className="relative">
                <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 pl-3 pr-2.5 py-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-400 transition cursor-pointer"
                >
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {session?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">
                    {session?.email}
                    </p>
                </div>

                {session?.avatar_url ? (
                    <img
                    src={session.avatar_url}
                    alt={session.name}
                    className="w-9 h-9 rounded-xl object-cover border border-emerald-400"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                    </div>
                )}

                <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                    }`}
                />
                </button>

                {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {session?.name}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {roleInfo.label}
                    </p>
                    </div>

                    <div className="p-1.5 space-y-1">
                    <Link
                        href="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition"
                    >
                        <UserCog className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Edit Profil & Foto</span>
                    </Link>

                    <form action={logoutAction}>
                        <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                        >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                        </button>
                    </form>
                    </div>
                </div>
                )}
            </div>
            </div>
        </div>
        </header>
    );
}