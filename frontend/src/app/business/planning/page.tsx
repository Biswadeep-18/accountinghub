"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Download, RefreshCcw, FileText } from "lucide-react";
import { generateBusinessSolution } from "@/lib/api";

export default function BusinessPlanning() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [form, setForm] = useState({ industry: "Technology", stage: "Startup", prompt: "" });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const query = `Create a business plan for a ${form.stage} company in the ${form.industry} industry. Additional notes: ${form.prompt}`;
      const response = await generateBusinessSolution(query, "business_plan");
      setOutput(response);
    } catch (error) {
      setOutput("Error generating business plan. Please check the backend connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Plans</h1>
        <p className="text-slate-500">Draft comprehensive business plans using AI agents tailored to your industry.</p>
      </header>

      <div className="flex gap-8 h-[calc(100vh-160px)]">
        <div className="w-1/3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <select 
                value={form.industry}
                onChange={e => setForm({...form, industry: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-slate-800"
              >
                <option className="text-slate-800 bg-white">Technology & SaaS</option>
                <option className="text-slate-800 bg-white">Retail & E-commerce</option>
                <option className="text-slate-800 bg-white">Healthcare</option>
                <option className="text-slate-800 bg-white">Real Estate</option>
                <option className="text-slate-800 bg-white">Food & Beverage</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Stage</label>
              <select 
                value={form.stage}
                onChange={e => setForm({...form, stage: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-slate-800"
              >
                <option className="text-slate-800 bg-white">Pre-Seed / Idea</option>
                <option className="text-slate-800 bg-white">Seed / Startup</option>
                <option className="text-slate-800 bg-white">Series A/B (Growth)</option>
                <option className="text-slate-800 bg-white">Established Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vision / Key Objectives</label>
              <textarea 
                rows={4}
                value={form.prompt}
                onChange={e => setForm({...form, prompt: e.target.value})}
                placeholder="E.g., We aim to disrupt the traditional supply chain by utilizing AI and blockchain technologies..."
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-800"
              />
            </div>

            <button 
              type="submit"
              disabled={isGenerating || !form.prompt}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70"
            >
              {isGenerating ? <RefreshCcw size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {isGenerating ? "Drafting Plan..." : "Generate Business Plan"}
            </button>
          </form>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3 flex items-center justify-end">
            <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-2 transition-colors">
              <Download size={16} /> Export to PDF
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto max-w-none">
            {!output && !isGenerating && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>Fill out the parameters and generate your business plan.</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <RefreshCcw size={32} className="text-indigo-500" />
                </motion.div>
                <div className="text-slate-500 font-medium animate-pulse">Structuring business model...</div>
              </div>
            )}

            {output && !isGenerating && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-800 whitespace-pre-wrap leading-relaxed"
              >
                {output}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
