"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Utensils,
    ClipboardList,
    UserCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Utensils, label: "Menu Items", href: "/dashboard/menu" },
    { icon: ClipboardList, label: "Orders", href: "/dashboard/orders" },
    { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "flex flex-col h-screen bg-card border-r transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between p-4 h-16 border-b">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 font-bold text-primary text-xl"
                    >
                        <Store className="w-6 h-6" />
                        <span>ATEit</span>
                    </motion.div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-accent rounded-md transition-colors"
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
                                "flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-primary/10",
                                isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            <item.icon size={20} className={cn(isActive && "text-primary")} />
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

            <div className="p-3 border-t">
                <button
                    className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                    )}
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
