import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardLayout({ children }) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    let pendingSuppliersCount = 0;
    if (session.role === "admin") {
        const res = await query(
        "SELECT COUNT(*)::int AS total FROM users WHERE role = 'supplier' AND status = 'Pending'",
        );
        pendingSuppliersCount = res.rows[0]?.total || 0;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
        <Sidebar
            role={session.role}
            pendingSuppliersCount={pendingSuppliersCount}
        />
        <div className="lg:pl-64 flex flex-col min-h-screen">
            <Navbar user={session} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
            </main>
        </div>
        </div>
    );
}
