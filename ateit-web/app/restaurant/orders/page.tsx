"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    MapPin,
    Phone
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { motion } from "framer-motion";

const statusConfig = {
    PENDING: { label: "Pending", icon: Clock, class: "bg-orange-100 text-orange-600 border-orange-200" },
    COMPLETED: { label: "Completed", icon: CheckCircle2, class: "bg-emerald-100 text-emerald-600 border-emerald-200" },
    CANCELLED: { label: "Cancelled", icon: XCircle, class: "bg-red-100 text-red-600 border-red-200" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await api.get("/restaurant/orders/");
                setOrders(response.data.data.results || response.data.data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                // Mock data
                setOrders([
                    {
                        id: 1,
                        order_id: "ORD-84A2",
                        customer_name: "John Doe",
                        total_amount: 340,
                        status: "PENDING",
                        items: "2x Spicy Paneer Wrap, 1x Coke",
                        created_at: "2024-01-20T10:30:00Z"
                    },
                    {
                        id: 2,
                        order_id: "ORD-92B1",
                        customer_name: "Alice Smith",
                        total_amount: 120,
                        status: "COMPLETED",
                        items: "1x Veg Cheese Burger",
                        created_at: "2024-01-20T09:15:00Z"
                    },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 leading-tight">Active Orders</h1>
                <p className="text-muted-foreground mt-1">Process rescues and keep your customers happy.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {orders.map((order, i) => {
                    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                    return (
                        <Card key={order.id} delay={i * 0.1} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                    <ClipboardList size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{order.order_id}</p>
                                                    <h3 className="font-bold text-lg text-slate-800">{order.customer_name}</h3>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 flex items-center gap-2 rounded-full border text-xs font-bold ${config.class}`}>
                                                <config.icon size={14} />
                                                {config.label}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                Self Pickup
                                            </div>
                                        </div>

                                        <div className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            {order.items}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between items-center md:items-end w-full md:w-48 gap-4">
                                        <div className="text-center md:text-right">
                                            <p className="text-xs text-muted-foreground">Total Amount</p>
                                            <h4 className="text-2xl font-bold text-primary">{formatCurrency(order.total_amount)}</h4>
                                        </div>
                                        <div className="flex md:flex-col gap-2 w-full">
                                            <Button variant="outline" size="sm" className="flex-1 gap-2">
                                                <Eye size={16} /> Details
                                            </Button>
                                            {order.status === 'PENDING' && (
                                                <Button size="sm" className="flex-1 gap-2">
                                                    <CheckCircle2 size={16} /> Ready
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
