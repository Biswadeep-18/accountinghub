"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Award, 
  Code2, 
  Terminal, 
  Cpu, 
  ShieldAlert, 
  Key, 
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Users,
  Settings,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listAllExams } from "@/lib/api";

const PRESET_SUBJECTS = [
  { id: "java", name: "Java Programming", icon: Code2, color: "from-orange-500/5 to-red-500/5", borderColor: "border-orange-200", textColor: "text-orange-600", desc: "OOPs, Collections, Multi-threading, JVM internals & Memory Management" },
  { id: "python", name: "Python Programming", icon: Terminal, color: "from-blue-500/5 to-cyan-500/5", borderColor: "border-blue-200", textColor: "text-blue-600", desc: "Advanced concepts, Decorators, Generators, AsyncIO, Web Frameworks" },
  { id: "ai", name: "AI & Machine Learning", icon: Cpu, color: "from-purple-500/5 to-indigo-500/5", borderColor: "border-purple-200", textColor: "text-purple-600", desc: "Transformers, Neural Networks, NLP, LLMs, Computer Vision" },
  { id: "tester", name: "Software Testing & QA", icon: ShieldAlert, color: "from-emerald-500/5 to-teal-500/5", borderColor: "border-emerald-200", textColor: "text-emerald-600", desc: "Selenium, Playwright, Jest, CI/CD pipelines & QA Automation patterns" }
];

export default function ITExamDashboard() {
  const router = useRouter();
  const [examCode, setExamCode] = useState("");
  const [pastExams, setPastExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await listAllExams();
        setPastExams(data);
      } catch (err) {
        console.error("Failed to load exams", err);
      } finally {
        setLoadingExams(false);
      }
    }
    loadExams();
  }, []);

  const handleJoinExam = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    const cleanedCode = examCode.trim().toLowerCase();
    
    if (!cleanedCode) {
      setJoinError("Please enter a valid exam code.");
      return;
    }

    // Redirect to taker page
    router.push(`/exam/take?code=${cleanedCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Soft background ambient glow */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-purple-500/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black shadow-md shadow-blue-500/20">
            IT
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm md:text-base leading-none">IT Exam & Certification Hub</h1>
            <p className="text-[10.5px] text-slate-500 font-semibold mt-1">AI-driven testing platform for modern technical frameworks</p>
          </div>
        </div>

        <Link
          href="/exam/admin"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-950 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Settings size={14} /> Admin Console
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid lg:grid-cols-12 gap-8 z-10 my-6">
        
        {/* Left Side: Hero and Code Entry Portal (7 Cols) */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
          
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold"
            >
              <Sparkles size={12} className="animate-pulse" />
              Empowered by AI Grading Engines
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight"
            >
              Verify Your IT Skills <br />
              With <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Evaluations</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-555 text-sm md:text-base leading-relaxed max-w-xl font-medium"
            >
              Enter a shared exam code to start a customized multiple-choice or short-answer exam generated dynamically by AI agents. Submit and download certificates instantly.
            </motion.p>
          </div>

          {/* Join Exam Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-xl shadow-slate-100"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-650 flex items-center justify-center border border-blue-500/20">
                <Key size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Enter Examination Hall</h3>
                <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">Enter a valid shared exam code to begin</p>
              </div>
            </div>

            <form onSubmit={handleJoinExam} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={examCode}
                onChange={e => setExamCode(e.target.value)}
                placeholder="e.g. ex_4f89d3"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-sans uppercase"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/10 uppercase tracking-wider flex items-center justify-center gap-2 group"
              >
                Start Exam <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {joinError && (
              <p className="text-xs font-semibold text-red-650 bg-red-50 border border-red-200 p-3.5 rounded-xl">
                {joinError}
              </p>
            )}
          </motion.div>

          {/* Preset subject badge tracks */}
          <div className="space-y-3">
            <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Featured Subject Areas</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {PRESET_SUBJECTS.map((subj) => {
                const Icon = subj.icon;
                return (
                  <div 
                    key={subj.id}
                    className={`bg-gradient-to-br ${subj.color} border ${subj.borderColor} rounded-2xl p-4 flex gap-3.5 items-start`}
                  >
                    <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0 shadow-sm">
                      <Icon className={subj.textColor} size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-950">{subj.name}</h5>
                      <p className="text-[10.5px] text-slate-500 mt-1 leading-normal font-medium">{subj.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Available Exams Registry list (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-xl shadow-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-650 flex items-center justify-center border border-indigo-500/20">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Exam Registry</h3>
                  <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Click any listing to start practice sessions</p>
                </div>
              </div>
              
              <span className="bg-slate-100 text-[10px] font-mono text-slate-650 border border-slate-200/60 px-2 py-0.5 rounded-lg">
                {pastExams.length} Exams
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[460px] pr-2 space-y-3.5">
              {loadingExams ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[11px] font-semibold">Syncing with registry...</p>
                </div>
              ) : pastExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center gap-2">
                  <HelpCircle size={24} className="text-slate-300" />
                  <p className="text-xs font-semibold max-w-[200px]">No active examination templates are currently registered.</p>
                </div>
              ) : (
                pastExams.map((ex) => (
                  <Link 
                    key={ex.id}
                    href={`/exam/take?code=${ex.id}`}
                    className="group block bg-slate-50/40 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-2xl p-4 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors leading-relaxed">
                          {ex.subject}
                        </h4>
                        <div className="flex items-center gap-2.5 mt-1.5">
                          <span className="text-[9.5px] font-mono text-slate-500 font-semibold">Code: {ex.id.toUpperCase()}</span>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <span className="text-[9.5px] text-slate-500 font-semibold">{new Date(ex.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="bg-white text-[9.5px] font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                          {ex.actual_question_count} Qs
                        </span>
                        <span className={`text-[8px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider ${
                          ex.question_type === "short" 
                            ? "bg-purple-50 text-purple-700 border border-purple-200" 
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {ex.question_type === "short" ? "Short" : "MCQ"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-[10px] border-t border-slate-100 pt-2.5">
                      <span className="text-slate-400 font-semibold italic flex items-center gap-1">
                        <Users size={10} /> Launch practice exam
                      </span>
                      <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Start <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100 flex items-center gap-3 text-xs leading-relaxed text-slate-600 mt-auto">
              <Award className="text-amber-500 shrink-0 animate-bounce" size={16} />
              <p className="font-semibold text-[10.5px]">
                Score <strong>50% or higher</strong> to immediately download a verified certificate of accomplishment.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
