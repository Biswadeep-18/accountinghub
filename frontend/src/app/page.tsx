"use client";

import { motion } from "framer-motion";
import { BookOpen, Briefcase, Calculator, ArrowRight, ClipboardList, Cpu, Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Admin Console button */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/exam/admin"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Settings size={14} /> Admin Console
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10 mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Intelligence for <span className="text-blue-600">Accounting</span>, <span className="text-blue-600">Business</span> & <span className="text-blue-600">IT</span>
        </h1>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full max-w-[95rem] z-10">
        {/* Learn Accounting Module Card */}
        <Link href="/learn">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Learn Accounting</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                  Comprehensive AI academy covering everything up to CA level. Ask questions, analyze complex concepts, and master audit & tax rules.
                </p>
              </div>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all mt-auto pt-4">
                Enter Academy <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Ledger Module Card */}
        <Link href="/accounting">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Calculator size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Accounting Ledger</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                  Full double-entry workspace with journals, ledgers, trial balance, and financial reports. Features an AI Tally journal assistant.
                </p>
              </div>
              <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all mt-auto pt-4">
                Enter Workspace <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Business Module Card */}
        <Link href="/business/financial">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Business Solutions</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                  Generate complex financial forecast models, draft tailored legal agreements, plan marketing strategies, and design tax plans.
                </p>
              </div>
              <div className="flex items-center text-violet-600 font-semibold group-hover:gap-3 transition-all mt-auto pt-4">
                Open Workspace <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Exam Module Card */}
        <Link href="/exam">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <ClipboardList size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Accounting Exam</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                  Official mock testing engine. Log in, take an exam with 20 random shuffled questions, watch the timer, and review comparative scorecards.
                </p>
              </div>
              <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 transition-all mt-auto pt-4">
                Enter Exam Hall <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </motion.div>
        </Link>

        {/* IT Exam Module Card */}
        <Link href="/exam/it">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Cpu size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">IT Certifications</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                  Verify capabilities in modern IT domains (Java, Python, AI, Software Testing) with AI-generated custom-tailored MCQ or Short-Answer assessments.
                </p>
              </div>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all mt-auto pt-4">
                Launch IT Hub <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}

