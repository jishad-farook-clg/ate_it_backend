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
import { LoadingScreen } from "@/components/ui/loading-screen";
import { SalesChart } from "@/components/dashboard/sales-chart";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await api.get("/restaurant/analytics/stats/");
                setStats(response.data.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
                // Fallback / Mock
                setStats({
                    total_revenue: 0,
                    total_orders: 0,
                    active_items: 0,
                    pending_orders: 0
                });
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <LoadingScreen />;

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
                    {/* Active Status Badge */}
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${stats?.is_open ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        <div className={`w-2 h-2 rounded-full ${stats?.is_open ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        {stats?.is_open ? "Kitchen Active" : "Kitchen Closed"}
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
                        <SalesChart />
                    </CardContent>
                </Card>

                <Card delay={0.5}>
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(!stats?.low_stock_items || stats.low_stock_items.length === 0) ? (
                            <div className="text-center py-8 text-muted-foreground italic h-[200px] flex items-center justify-center">
                                No low stock items
                            </div>
                        ) : (
                            stats.low_stock_items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center font-bold text-slate-400">
                                        {item.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Only {item.quantity} left in stock</p>
                                    </div>
                                    <div className="p-1 px-2 text-[10px] items-center text-center font-bold bg-orange-100 text-orange-700 rounded uppercase">
                                        Refill
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
