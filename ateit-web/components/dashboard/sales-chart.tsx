"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesData {
    period: string;
    total_sales: number;
    total_orders: number;
}

export function SalesChart({ endpoint = "/restaurant/analytics/sales/" }: { endpoint?: string }) {
    const [data, setData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSalesData() {
            try {
                const response = await api.get(`${endpoint}?period=daily`);
                // The backend returns latest first, recharts expects chronological
                const rawData = response.data.data || [];
                const formattedData = rawData.map((item: any) => ({
                    period: new Date(item.period).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    total_sales: parseFloat(item.total_sales),
                    total_orders: item.total_orders
                })).reverse();

                setData(formattedData);
            } catch (err) {
                console.error("Failed to fetch sales data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSalesData();
    }, []);

    if (loading) {
        return <div className="h-[300px] w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>;
    }

    if (data.length === 0) {
        return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
            No sales data available for the selected period.
        </div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                        }}
                        formatter={(value: any) => [`₹${value}`, 'Sales']}
                    />
                    <Area
                        type="monotone"
                        dataKey="total_sales"
                        stroke="var(--primary)"
                        fillOpacity={1}
                        fill="url(#colorSales)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
