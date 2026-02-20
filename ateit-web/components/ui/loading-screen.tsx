"use client";

import { motion } from "framer-motion";
import { Store } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: [0.8, 1.1, 1],
                    opacity: 1
                }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-2xl shadow-primary/20"
            >
                <Store size={40} />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ATEit</h2>
                <p className="text-muted-foreground mt-2 animate-pulse">Preparing your dashboard...</p>
            </motion.div>

            <div className="mt-12 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>
        </div>
    );
}
