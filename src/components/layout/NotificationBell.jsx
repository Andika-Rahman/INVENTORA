'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Truck, PackageCheck, CheckCheck } from 'lucide-react';
import {
    getWarehouseNotificationsAction,
    markAllNotificationsReadAction,
} from '@/actions/notificationActions';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const containerRef = useRef(null);

    async function loadNotifications() {
        const data = await getWarehouseNotificationsAction();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
    }

    useEffect(() => {
        loadNotifications();
        const timer = setInterval(loadNotifications, 8000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        function handleOutsideClick(event) {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            setOpen(false);
        }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    async function handleToggle() {
        const nextState = !open;
        setOpen(nextState);
        if (nextState) {
        await loadNotifications();
        }
    }

    async function handleMarkRead() {
        await markAllNotificationsReadAction();
        setUnreadCount(0);
        setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    }

    return (
        <div ref={containerRef} className="relative">
        <button
            type="button"
            onClick={handleToggle}
            aria-label="Notifikasi Pengiriman"
            className="relative w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-red-400 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition cursor-pointer"
        >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
            </span>
            )}
        </button>

        {open && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="h-1 w-full bg-linear-to-r from-red-600 via-white to-emerald-600" />

            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Notifikasi Pengiriman Barang
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Status perjalanan & kedatangan Restock PO
                </p>
                </div>

                {unreadCount > 0 && (
                <button
                    type="button"
                    onClick={handleMarkRead}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai Dibaca</span>
                </button>
                )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
                {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                    Belum ada notifikasi pengiriman atau kedatangan barang.
                </div>
                ) : (
                notifications.map((item) => {
                    const isTransit = item.category === 'In Transit';

                    return (
                    <Link
                        key={item.id}
                        href="/dashboard/restocks"
                        onClick={() => setOpen(false)}
                        className={`block p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition ${
                        !item.is_read ? 'bg-red-50/40 dark:bg-red-500/5' : ''
                        }`}
                    >
                        <div className="flex items-start gap-3">
                        <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isTransit
                                ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/25'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25'
                            }`}
                        >
                            {isTransit ? (
                            <Truck className="w-4 h-4" />
                            ) : (
                            <PackageCheck className="w-4 h-4" />
                            )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.title}
                            </p>
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isTransit
                                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                }`}
                            >
                                {isTransit ? 'Dalam Perjalanan' : 'Sudah Sampai'}
                            </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                            {item.message}
                            </p>
                        </div>
                        </div>
                    </Link>
                    );
                })
                )}
            </div>
            </div>
        )}
        </div>
    );
}