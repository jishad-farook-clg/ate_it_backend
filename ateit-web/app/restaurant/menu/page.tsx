"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical, Edit2, Trash2, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function MenuPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        original_price: "",
        quantity: "1",
        is_available: true
    });

    const fetchMenu = async () => {
        try {
            const response = await api.get("/restaurant/food-items/");
            setItems(response.data.data.results || response.data.data);
        } catch (err) {
            console.error("Failed to fetch menu", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleOpenModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price.toString(),
                original_price: item.original_price.toString(),
                quantity: item.quantity.toString(),
                is_available: item.is_available
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                original_price: "",
                quantity: "1",
                is_available: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                original_price: parseFloat(formData.original_price),
                quantity: parseInt(formData.quantity)
            };

            if (editingItem) {
                await api.patch(`/restaurant/food-items/${editingItem.id}/`, payload);
            } else {
                await api.post("/restaurant/food-items/", payload);
            }

            setIsModalOpen(false);
            fetchMenu();
        } catch (err) {
            console.error("Failed to save item", err);
            alert("Failed to save item. Please check your input.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/restaurant/food-items/${id}/`);
            fetchMenu();
        } catch (err) {
            console.error("Failed to delete item", err);
            alert("Failed to delete item.");
        }
    };

    if (loading) return <LoadingScreen />;

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
                <Button className="gap-2" onClick={() => handleOpenModal()}>
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
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group overflow-hidden">
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
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-primary transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-destructive transition-colors"
                                            >
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
                                            QTY: {item.quantity}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingItem ? "Edit Item" : "Add New Item"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
                                    <input
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="e.g. Spicy Paneer Wrap"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24 resize-none"
                                        placeholder="Describe your item..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Rescue Price</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="Current Price"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Original Price</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="Old Price"
                                            value={formData.original_price}
                                            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Quantity Available</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="Stock"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-center">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2">Availability</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.is_available}
                                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            <span className="ml-3 text-sm font-medium text-slate-600">
                                                {formData.is_available ? "Available" : "Hidden"}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 h-14"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-[2] h-14 text-lg">
                                        {editingItem ? "Update Item" : "Create Item"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
