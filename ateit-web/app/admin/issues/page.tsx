"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AdminIssuesPage() {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchIssues() {
            try {
                const response = await api.get("/admin/issues/");
                setIssues(response.data.data.results || response.data.data);
            } catch (err) {
                console.error("Failed to fetch issues", err);
            } finally {
                setLoading(false);
            }
        }
        fetchIssues();
    }, []);

    if (loading) return <LoadingScreen />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Support Issues</h1>
                <p className="text-muted-foreground mt-1">Review and resolve reported customer issues.</p>
            </div>

            <div className="grid gap-4">
                {issues.map((issue) => (
                    <div key={issue.id} className="bg-white p-6 rounded-xl border shadow-sm flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${issue.status === 'OPEN' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                            {issue.status === 'OPEN' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${issue.status === 'OPEN' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                    {issue.status}
                                </span>
                            </div>
                            <p className="text-slate-600 text-sm mb-3">{issue.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-slate-50 p-3 rounded-lg">
                                <span className="flex items-center gap-1">
                                    <MessageSquare size={12} />
                                    Order #{issue.order || 'N/A'}
                                </span>
                                <span>Reported by: Customer {issue.customer}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {issues.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No issues reported.
                    </div>
                )}
            </div>
        </div>
    );
}
