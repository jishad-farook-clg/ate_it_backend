"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');

            if (!token || role !== 'ADMIN') {
                router.push('/login');
            } else {
                setAuthorized(true);
            }
        }
    }, [router]);

    if (!authorized) {
        return null; // Don't render anything while checking
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b bg-white flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider">
                        <ShieldCheck size={16} />
                        ATEit Administration
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
