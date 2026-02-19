"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminFinancePage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingTopups = async () => {
        try {
            const response = await api.get("/admin/wallet/pending_topups/");
            setTransactions(response.data.data.results || response.data.data);
        } catch (err) {
            console.error("Failed to fetch pending topups", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTopups();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await api.post(`/admin/wallet/${id}/approve_topup/`);
            // Optimistic removal
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error("Failed to approve topup", err);
            alert("Failed to approve transaction.");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading finance data...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Finance Overview</h1>
                <p className="text-muted-foreground mt-1">Manage wallet top-ups and platform transactions.</p>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <h2 className="font-semibold text-slate-800">Pending Top-up Requests</h2>
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b font-medium text-slate-500">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Reference ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {/* Assuming serializer returns user details or we need to fetch */}
                                    User {tx.wallet}
                                    {/* Note: Serializer might just return wallet ID. 
                                        If so, UI will be limited. For now displaying ID/Wallet ID */}
                                </td>
                                <td className="px-6 py-4 text-emerald-600 font-bold">
                                    {formatCurrency(tx.amount)}
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                    {tx.reference_id || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(tx.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleApprove(tx.id)}
                                    >
                                        <CheckCircle size={14} className="mr-1" />
                                        Approve
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {transactions.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center text-muted-foreground">
                        <CheckCircle size={48} className="mb-4 text-emerald-100" />
                        <p>No pending top-ups.</p>
                        <p className="text-sm">All wallet requests have been processed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
