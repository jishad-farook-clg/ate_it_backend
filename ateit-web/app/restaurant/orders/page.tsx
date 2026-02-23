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
    Phone,
    X,
    User,
    Calendar,
    Receipt
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";

const statusConfig = {
    PENDING: { label: "Pending", icon: Clock, class: "bg-orange-100 text-orange-600 border-orange-200" },
    COMPLETED: { label: "Completed", icon: CheckCircle2, class: "bg-emerald-100 text-emerald-600 border-emerald-200" },
    CANCELLED: { label: "Cancelled", icon: XCircle, class: "bg-red-100 text-red-600 border-red-200" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const fetchOrders = async () => {
        try {
            const response = await api.get("/restaurant/orders/");
            setOrders(response.data.data.results || response.data.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await api.patch(`/restaurant/orders/${id}/update_status/`, { status });
            fetchOrders();
            if (selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update order status.");
        }
    };

    const getCustomerName = (customer: any) => {
        if (!customer) return "Unknown Customer";
        if (typeof customer !== 'object') return `Customer #${customer}`;
        if (customer.first_name || customer.last_name) {
            return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        }
        return customer.username || `Customer #${customer.id}`;
    };

    if (loading) return <LoadingScreen />;

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
                                                    <h3 className="font-bold text-lg text-slate-800">{order.customer_name || getCustomerName(order.customer)}</h3>
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

                                        <div className="space-y-2 mb-4">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Items</p>
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 divide-y divide-slate-200">
                                                {order.items.map((item: any, index: number) => (
                                                    <div key={index} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                                                        <span className="text-slate-700 font-medium">{item.food_item.name}</span>
                                                        <span className="text-slate-500 font-bold">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between items-center md:items-end w-full md:w-48 gap-4">
                                        <div className="text-center md:text-right">
                                            <p className="text-xs text-muted-foreground">Total Amount</p>
                                            <h4 className="text-2xl font-bold text-primary">{formatCurrency(order.total_amount)}</h4>
                                        </div>
                                        <div className="flex md:flex-col gap-2 w-full">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-2"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye size={16} /> Details
                                            </Button>
                                            {order.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 gap-2"
                                                    onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                                >
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

                {orders.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No active orders.
                    </div>
                )}
            </div>

            <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={handleStatusUpdate}
                getCustomerName={getCustomerName}
            />
        </div>
    );
}

function OrderDetailsModal({ order, onClose, onStatusUpdate, getCustomerName }: { order: any, onClose: () => void, onStatusUpdate: (id: number, status: string) => void, getCustomerName: (c: any) => string }) {
    if (!order) return null;

    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border text-primary">
                                <Receipt size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Order #{order.order_id}</h2>
                                <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.class}`}>
                                    <config.icon size={10} />
                                    {config.label}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Customer & Time Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} /> Customer Info
                                </h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {(order.customer_name || 'C').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{order.customer_name || getCustomerName(order.customer)}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Phone size={10} /> Pick-up Order
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} /> Order Timeline
                                </h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-slate-600">Placed on</p>
                                        <p className="text-sm font-semibold">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="mt-2 flex justify-between items-center text-xs">
                                        <p className="text-slate-500 uppercase tracking-wider">Method</p>
                                        <p className="font-bold text-primary">Self Collect</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Summary</h3>
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                                            <th className="px-4 py-3 text-left">Item</th>
                                            <th className="px-4 py-3 text-center">Qty</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.items.map((item: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-800">{item.food_item.name}</td>
                                                <td className="px-4 py-3 text-center text-slate-500 font-bold">x{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(item.price_at_time_of_order)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(item.price_at_time_of_order * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-slate-500 font-medium">Subtotal</td>
                                            <td className="px-4 py-3 text-right font-bold">{formatCurrency(order.total_amount)}</td>
                                        </tr>
                                        <tr className="border-t-2 border-slate-100 bg-primary/5">
                                            <td colSpan={3} className="px-4 py-4 text-right text-primary font-bold text-lg">Order Total</td>
                                            <td className="px-4 py-4 text-right text-primary font-black text-xl">{formatCurrency(order.total_amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t bg-slate-50 flex flex-col md:flex-row gap-3">
                        <Button variant="ghost" className="md:flex-1" onClick={onClose}>
                            Close
                        </Button>
                        {order.status === 'PENDING' && (
                            <Button
                                className="md:flex-1 gap-2"
                                onClick={() => {
                                    onStatusUpdate(order.id, 'COMPLETED');
                                    onClose();
                                }}
                            >
                                <CheckCircle2 size={18} /> Mark as Ready
                            </Button>
                        )}
                        {order.status === 'PENDING' && (
                            <Button
                                variant="outline"
                                className="md:w-32 gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                onClick={() => {
                                    if (confirm("Are you sure you want to cancel this order?")) {
                                        onStatusUpdate(order.id, 'CANCELLED');
                                        onClose();
                                    }
                                }}
                            >
                                <XCircle size={18} /> Cancel
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
