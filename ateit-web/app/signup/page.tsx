"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, UserPlus, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        restaurant_name: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Adjusted based on backend RegisterView in core/views.py
            await api.post("/auth/auth/register/", {
                ...formData,
                role: "RESTAURANT", // Hardcoded for this portal
            });
            router.push("/login?signup=success");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md"
            >
                <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                </Link>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <Store size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Join ATEit</h1>
                    <p className="text-muted-foreground mt-2 text-center text-sm px-8">
                        Start saving food and growing your business as a Restaurant Partner.
                    </p>
                </div>

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Partner Registration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="CoolKitchen42"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="contact@restaurant.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Restaurant Name</label>
                                <input
                                    name="restaurant_name"
                                    type="text"
                                    required
                                    value={formData.restaurant_name}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="The Green Kitchen"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                        Creating Account...
                                    </>
                                ) : (
                                    "Register as Partner"
                                )}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground pt-2">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-semibold hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
