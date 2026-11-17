"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Cpu,
    LayoutDashboard,
    Package,
    FolderTree,
    ArrowLeftRight,
    Truck,
    UserCheck,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { logoutAction } from "@/actions/authActions";

export default function Sidebar({ role, pendingSuppliersCount = 0 }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "warehouse_manager", "staff_gudang", "supplier"],
        },
        {
        label: "Produk Komponen",
        href: "/dashboard/products",
        icon: Package,
        roles: ["admin", "warehouse_manager", "staff_gudang"],
        },
        {
        label: "Kategori Part",
        href: "/dashboard/categories",
        icon: FolderTree,
        roles: ["admin", "warehouse_manager"],
        },
        {
        label: "Transaksi Gudang",
        href: "/dashboard/transactions",
        icon: ArrowLeftRight,
        roles: ["admin", "warehouse_manager", "staff_gudang", "supplier"],
        },
        {
        label: "Restock Order (PO)",
        href: "/dashboard/restocks",
        icon: Truck,
        roles: ["admin", "warehouse_manager", "supplier"],
        },
        {
        label: "Verifikasi Supplier",
        href: "/dashboard/suppliers",
        icon: UserCheck,
        roles: ["admin"],
        badge: pendingSuppliersCount > 0 ? pendingSuppliersCount : null,
        },
    ];

    const allowedItems = navItems.filter((item) => item.roles.includes(role));

    const renderLinks = () => (
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive =
            item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
            >
                <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                </div>
                {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                </span>
                )}
            </Link>
            );
        })}
        </nav>
    );

    const renderLogoutFooter = () => (
        <div className="p-3 border-t border-slate-800">
        <form action={logoutAction}>
            <button
            type="submit"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-500/30 transition cursor-pointer"
            >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
            </button>
        </form>
        </div>
    );

    return (
        <>
        <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden fixed bottom-5 right-5 z-40 p-3.5 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30"
            aria-label="Buka Menu"
        >
            <Menu className="w-5 h-5" />
        </button>

        {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
                onClick={() => setMobileOpen(false)}
            />
            <aside className="relative w-68 max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10">
                <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Cpu className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white tracking-tight">
                    INVENTORA
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>
                {renderLinks()}
                {renderLogoutFooter()}
            </aside>
            </div>
        )}

        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800">
            <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
            </div>
            <div>
                <span className="font-bold text-white tracking-tight block leading-none">
                INVENTORA
                </span>
                <span className="text-[11px] text-slate-400">
                PC & Laptop Warehouse
                </span>
            </div>
            </div>
            {renderLinks()}
            {renderLogoutFooter()}
        </aside>
        </>
    );
}
