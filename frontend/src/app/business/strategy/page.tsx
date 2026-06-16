"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Download, RefreshCcw, Lightbulb } from "lucide-react";
import { generateBusinessSolution } from "@/lib/api";

export default function StrategyMarketing() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [form, setForm] = useState({ campaignType: "Go-to-Market Strategy", targetAudience: "", prompt: "" });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const query = `Create a ${form.campaignType} for target audience: ${form.targetAudience}. Additional notes: ${form.prompt}`;
      const response = await generateBusinessSolution(query, "marketing_strategy");
      setOutput(response);
    } catch (error) {
      setOutput("Error generating strategy. Please check the backend connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Strategy & Marketing</h1>
        <p className="text-slate-500">Design go-to-market strategies and marketing campaigns backed by AI.</p>
      </header>

      <div className="flex gap-8 h-[calc(100vh-160px)]">
        <div className="w-1/3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Strategy Type</label>
              <select 
                value={form.campaignType}
                onChange={e => setForm({...form, campaignType: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-slate-800"
              >
                <option className="text-slate-800 bg-white">Go-to-Market Strategy</option>
                <option className="text-slate-800 bg-white">Social Media Campaign</option>
                <option className="text-slate-800 bg-white">Content Marketing Plan</option>
                <option className="text-slate-800 bg-white">Brand Positioning</option>
                <option className="text-slate-800 bg-white">SEO Strategy</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
              <input 
                type="text" 
                placeholder="e.g., Gen Z Tech Enthusiasts" 
                value={form.targetAudience}
                onChange={e => setForm({...form, targetAudience: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Description / Goals</label>
              <textarea 
                rows={4}
                value={form.prompt}
                onChange={e => setForm({...form, prompt: e.target.value})}
                placeholder="E.g., We are launching a new productivity app and want to reach 10,000 active users in 3 months..."
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-800"
              />
            </div>

            <button 
              type="submit"
              disabled={isGenerating || !form.targetAudience}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 px-4 font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70"
            >
              {isGenerating ? <RefreshCcw size={18} className="animate-spin" /> : <Wand2 size={18} />}
              {isGenerating ? "Formulating Strategy..." : "Generate Strategy"}
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
                <Lightbulb size={48} className="mb-4 opacity-20" />
                <p>Fill out the parameters and generate your strategy.</p>
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
                <div className="text-slate-500 font-medium animate-pulse">Analyzing market trends...</div>
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
