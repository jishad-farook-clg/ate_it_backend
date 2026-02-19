"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical, Edit2, Trash2, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchMenu() {
            try {
                const response = await api.get("/restaurant/food-items/");
                setItems(response.data.data.results || response.data.data);
            } catch (err) {
                console.error("Failed to fetch menu", err);
                // Mock data
                setItems([
                    { id: 1, name: "Spicy Paneer Wrap", price: 120, original_price: 180, is_available: true, description: "A spicy wrap with paneer and veggies." },
                    { id: 2, name: "Veg Cheese Burger", price: 80, original_price: 120, is_available: false, description: "Classic veg burger with extra cheese." },
                    { id: 3, name: "Cold Coffee", price: 60, original_price: 90, is_available: true, description: "Creamy cold coffee with chocolate syrup." },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchMenu();
    }, []);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Menu Management</h1>
                    <p className="text-muted-foreground mt-1">Add, edit, or remove items from your rescue menu.</p>
                </div>
                <Button className="gap-2">
                    <Plus size={18} />
                    Add Item
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex-1 flex items-center gap-2 px-3">
                    <Search size={18} className="text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full h-10 focus:outline-none bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredItems.map((item, i) => (
                        <Card key={item.id} delay={i * 0.05} className="group overflow-hidden">
                            <div className="h-40 bg-slate-100 flex items-center justify-center relative">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-slate-400 font-bold text-lg opacity-20">FOOD IMAGE</div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.is_available ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                                        {item.is_available ? "Available" : "Sold Out"}
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-primary">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-destructive">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                    {item.description || "No description provided for this item."}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.original_price)}</span>
                                        <span className="text-xl font-bold text-primary">{formatCurrency(item.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        <Tag size={12} />
                                        30% OFF
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
