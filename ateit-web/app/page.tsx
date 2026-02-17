import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Store, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-primary text-2xl">
          <Store className="w-8 h-8" />
          <span>ATEit</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-bounce mb-4">
            <Sparkles size={16} />
            Empowering Restaurants to Rescue Food
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Manage Your Kitchen <br />
            <span className="text-primary italic">Smarter, Faster.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The all-in-one dashboard to manage orders, inventory, and analytics while making an impact on food waste.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg gap-2">
                Launch Dashboard <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { title: "Real-time Orders", desc: "Get instant notifications for new rescues.", icon: Zap },
            { title: "Menu Control", desc: "Update availability and pricing on the fly.", icon: Store },
            { title: "Secure Payments", desc: "Reliable and fast payouts every week.", icon: ShieldCheck },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all hover:bg-white hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-12 text-center text-muted-foreground text-sm">
        © 2026 ATEit Project. Built for Social Impact.
      </footer>
    </div>
  );
}
