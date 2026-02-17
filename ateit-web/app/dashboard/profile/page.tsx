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

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await api.get("/restaurant/profile/");
                setProfile(response.data.data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setProfile({
                    restaurant_name: "Healthy Bites",
                    description: "Fresh and organic salads and wraps.",
                    address: "123 Green Street, Foodie City",
                    phone: "+91 9876543210",
                    email: "owner@healthybites.com",
                    is_open: true,
                    image: null
                });
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Restaurant Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your restaurant basic details and visibility.</p>
                </div>
                <Button className="gap-2">
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
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${profile?.is_open ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                                    {profile?.is_open ? "Open" : "Closed"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Restaurant Name</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                                    <Building2 size={18} className="text-slate-400" />
                                    {profile?.restaurant_name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Contact Email</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                                    <Mail size={18} className="text-slate-400" />
                                    {profile?.email}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                                    <Phone size={18} className="text-slate-400" />
                                    {profile?.phone}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Operating Hours</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                                    <Clock size={18} className="text-slate-400" />
                                    09:00 AM - 11:00 PM
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                                <MapPin size={18} className="text-slate-400 mt-1" />
                                {profile?.address}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
