"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50/50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b bg-white flex items-center justify-between px-8">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Restaurant Partner Portal
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }
                        }}
                    >
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </Button>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
