"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Encode credentials
            const credentials = btoa(`${username}:${password}`);
            const basicAuthToken = credentials; // Store just the base64 string

            // Test login with Basic Auth
            const response = await api.post("/auth/auth/login/", {
                username,
                password,
            }, {
                headers: { 'Authorization': `Basic ${basicAuthToken}` }
            });

            // On success
            localStorage.setItem("token", basicAuthToken);

            const user = response.data.data; // Standard response data field
            const userRole = user.role;
            localStorage.setItem("role", userRole);

            if (userRole === 'ADMIN') {
                router.push("/admin/dashboard");
            } else if (userRole === 'RESTAURANT') {
                router.push("/restaurant/dashboard");
            } else {
                // For CUSTOMER or other roles, maybe a public landing or portal
                router.push("/");
            }
        } catch (err: any) {
            console.error(err);
            const responseData = err.response?.data;
            const errorMessage = responseData?.errors?.non_field_errors?.[0]
                || responseData?.errors?.detail
                || responseData?.message
                || "Invalid credentials. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <Store size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">ATEit</h1>
                    <p className="text-muted-foreground mt-2">Restaurant Partner Portal</p>
                </div>

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                            <LogIn className="w-5 h-5 text-primary" />
                            Welcome Back
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-destructive-foreground bg-destructive/10 p-3 rounded-md border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground pt-2">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-primary font-semibold hover:underline">
                                    Sign up here
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
