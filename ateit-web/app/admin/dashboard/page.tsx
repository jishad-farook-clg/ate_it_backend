"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    ShoppingBag,
    DollarSign,
    Calendar,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await api.get("/admin/dashboard/");
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
                // Graceful fallback or error state
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Platform Profit",
            value: formatCurrency(stats?.platform_profit || 0),
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            desc: "Total commission earned"
        },
        {
            label: "Total Orders",
            value: stats?.total_orders || 0,
            icon: ShoppingBag,
            color: "text-blue-500",
            bg: "bg-blue-50",
            desc: "All time orders"
        },
        {
            label: "Today's Orders",
            value: stats?.today_orders || 0,
            icon: Calendar,
            color: "text-purple-500",
            bg: "bg-purple-50",
            desc: "Orders placed today"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Admin Overview</h1>
                    <p className="text-muted-foreground mt-1">Monitor platform performance and metrics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={stat.bg + " p-3 rounded-lg " + stat.color}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={12} className="mr-1" />
                                    Live
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for future analytics charts */}
            <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                    <TrendingUp size={48} className="mb-4 opacity-20" />
                    <p>Detailed Analytics Charts coming soon</p>
                </CardContent>
            </Card>
        </div>
    );
}
