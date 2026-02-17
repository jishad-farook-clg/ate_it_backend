"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    ShoppingBag,
    Users,
    Package,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await api.get("/restaurant/analytics/sales/");
                setStats(response.data.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
                // Mock data for demo if backend fails or needs real auth
                setStats({
                    total_revenue: 12450.50,
                    total_orders: 84,
                    active_items: 12,
                    pending_orders: 3
                });
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        { label: "Total Revenue", value: formatCurrency(stats?.total_revenue || 0), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "Total Orders", value: stats?.total_orders || 0, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Active Items", value: stats?.active_items || 0, icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "Pending Orders", value: stats?.pending_orders || 0, icon: Calendar, color: "text-orange-500", bg: "bg-orange-50" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">Welcome back to your restaurant management panel.</p>
                </div>
                <div className="flex gap-2">
                    {/* Active Status Badge */}
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Kitchen Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} delay={i * 0.1}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={stat.bg + " p-3 rounded-lg " + stat.color}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={12} className="mr-1" />
                                    +12%
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2" delay={0.4}>
                    <CardHeader>
                        <CardTitle>Recent Sales Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                            [ Sales Chart Visualization ]
                            {/* Here we would integrate a library like Recharts */}
                        </div>
                    </CardContent>
                </Card>

                <Card delay={0.5}>
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center font-bold text-slate-400">
                                    FI
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-700">Cheese Burger</p>
                                    <p className="text-xs text-muted-foreground">Only 5 left in stock</p>
                                </div>
                                <div className="p-1 px-2 text-[10px] items-center text-center font-bold bg-orange-100 text-orange-700 rounded uppercase">
                                    Refill
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
