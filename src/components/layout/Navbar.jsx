import { LogOut, UserCircle2 } from "lucide-react";
import { logoutAction } from "@/actions/authActions";

const roleLabels = {
    admin: "Administrator",
    warehouse_manager: "Warehouse Manager",
    staff_gudang: "Staff Gudang",
    supplier: "Mitra Supplier",
};

export default function Navbar({ user }) {
    return (
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {roleLabels[user.role] || user.role}
            </span>
            {user.company_name && (
            <span className="hidden sm:inline text-xs text-slate-400">
                • {user.company_name}
            </span>
            )}
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-right">
            <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white leading-none">
                {user.name}
                </p>
                <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            </div>
            <UserCircle2 className="w-8 h-8 text-slate-400" />
            </div>

            <form action={logoutAction}>
            <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
            </button>
            </form>
        </div>
        </header>
    );
}
