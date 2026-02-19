"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Store,
    Users,
    Wallet,
    AlertCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin/dashboard" },
    { icon: Store, label: "Restaurants", href: "/admin/restaurants" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Wallet, label: "Finance", href: "/admin/finance" },
    { icon: AlertCircle, label: "Issues", href: "/admin/issues" },
];

export function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "flex flex-col h-screen bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 font-bold text-lg"
                    >
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        <span>Admin</span>
                    </motion.div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-slate-800 rounded-md transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 flex flex-col gap-2 p-3 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-indigo-500/10 hover:text-indigo-400",
                                isActive ? "bg-indigo-500/20 text-indigo-400 font-semibold" : "text-slate-400"
                            )}
                        >
                            <item.icon size={20} className={cn(isActive && "text-indigo-400")} />
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-slate-800">
                <button
                    className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-950/30 transition-all"
                    )}
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }
                    }}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
