"use client";

import { motion } from "framer-motion";
import { FileText, Calculator, Lightbulb, Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarNav = [
  { name: "Financial Models", href: "/business/financial", icon: Calculator },
  { name: "Legal & Compliance", href: "/business/legal", icon: Shield },
  { name: "Business Plans", href: "/business/planning", icon: FileText },
  { name: "Strategy & Marketing", href: "/business/strategy", icon: Lightbulb },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8">
            <ChevronLeft size={16} className="mr-1" /> Back to Home
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Workspace</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise AI Generator</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarNav.map((item) => {
            const isActive = pathname.includes(item.href);
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 font-semibold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}>
                  <Icon size={18} className="mr-3" />
                  <span className="text-[15px]">{item.name}</span>
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  );
}
