"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"; // Need to check if these exist or create them
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Need to create
import { CheckCircle, XCircle, Search, Store } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminRestaurantsPage() {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRestaurants = async () => {
        try {
            const response = await api.get("/admin/restaurants/");
            setRestaurants(response.data.data.results || response.data.data);
        } catch (err) {
            console.error("Failed to fetch restaurants", err);
            setError("Failed to load restaurant data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            await api.post(`/admin/restaurants/${id}/${action}/`);
            // Optimistic update
            setRestaurants(prev => prev.map(r =>
                r.id === id ? { ...r, is_approved: action === 'approve' } : r
            ));
        } catch (err) {
            console.error(`Failed to ${action} restaurant`, err);
            alert(`Failed to ${action} restaurant. Please try again.`);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading restaurants...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Restaurant Management</h1>
                    <p className="text-muted-foreground mt-1">Approve emerging partners and manage existing ones.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        className="w-full h-10 pl-9 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Search restaurants..."
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b font-medium text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Restaurant</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {restaurants.map((restaurant) => (
                            <tr key={restaurant.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Store size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{restaurant.restaurant_name}</p>
                                            <p className="text-xs text-muted-foreground">{restaurant.description || "No description"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${restaurant.is_approved
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                        }`}>
                                        {restaurant.is_approved ? "Active" : "Pending Approval"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {restaurant.address?.city || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="flex flex-col">
                                        <span>{restaurant.user?.username}</span>
                                        <span className="text-xs text-muted-foreground">{restaurant.user?.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {!restaurant.is_approved && (
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={() => handleAction(restaurant.id, 'approve')}
                                        >
                                            <CheckCircle size={14} className="mr-1" />
                                            Approve
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive hover:bg-destructive/10 border-destructive/20"
                                        onClick={() => handleAction(restaurant.id, 'reject')}
                                    >
                                        <XCircle size={14} className="mr-1" />
                                        Reject
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {restaurants.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No restaurants found.
                    </div>
                )}
            </div>
        </div>
    );
}
