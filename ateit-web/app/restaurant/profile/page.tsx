"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    MapPin,
    Phone,
    Store,
    Building2,
    Camera,
    Save,
    Clock
} from "lucide-react";
import api from "@/lib/api";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/restaurant/profile/");
            setProfile(response.data.data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            // Sanitize payload: exclude image if it's a string (URL) as it causes issues with ImageField
            const { image, user, ...payload } = profile;
            await api.patch("/restaurant/profile/", payload);
            alert("Profile updated successfully!");
            fetchProfile();
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile.");
        }
    };

    const toggleStatus = async () => {
        try {
            const newStatus = !profile.is_open;
            // Optimistic update
            setProfile({ ...profile, is_open: newStatus });

            await api.patch("/restaurant/profile/", { is_open: newStatus });
            // No alert needed for toggle, just seamless update
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on failure
            setProfile({ ...profile, is_open: !profile.is_open });
            alert("Failed to update kitchen status.");
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Restaurant Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your restaurant basic details and visibility.</p>
                </div>
                <Button className="gap-2" onClick={handleSave}>
                    <Save size={18} />
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardContent className="p-6 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                                {profile?.image ? (
                                    <img src={profile.image} className="w-full h-full object-cover" />
                                ) : (
                                    <Store size={40} className="text-slate-300" />
                                )}
                            </div>
                            <button className="absolute bottom-[-10px] right-[-10px] p-2 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-110 transition-transform">
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 className="mt-6 font-bold text-xl text-slate-800">{profile?.restaurant_name}</h3>
                        <p className="text-sm text-muted-foreground text-center mt-1">{profile?.description}</p>

                        <div className="w-full mt-6 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-muted-foreground">Kitchen Status</span>
                                <button
                                    onClick={toggleStatus}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${profile?.is_open ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                                >
                                    {profile?.is_open ? "Open" : "Closed"}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Restaurant Name</label>
                                <input
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={profile?.restaurant_name || ""}
                                    onChange={(e) => setProfile({ ...profile, restaurant_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <input
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={profile?.description || ""}
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                <input
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={profile?.phone || ""}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
