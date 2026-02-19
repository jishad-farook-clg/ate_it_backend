"use client";

import { useEffect, useState } from "react";
import { Search, UserCircle, Mail, MapPin } from "lucide-react";
import api from "@/lib/api";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await api.get("/admin/customers/");
                setUsers(response.data.data.results || response.data.data);
            } catch (err) {
                console.error("Failed to fetch customers", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    if (loading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage registered customers.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        className="w-full h-10 pl-9 pr-4 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Search users..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-white p-6 rounded-xl border shadow-sm flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                            <UserCircle size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-semibold text-slate-900 truncate">{user.username}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Mail size={14} />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.addresses && user.addresses[0] && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <MapPin size={14} />
                                    <span className="truncate">{user.addresses[0].city}, {user.addresses[0].state}</span>
                                </div>
                            )}
                            <div className="mt-4 flex items-center gap-2">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">Customer</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No customers found.
                </div>
            )}
        </div>
    );
}
