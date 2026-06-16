"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  Sparkles, 
  Copy, 
  Check, 
  Mail, 
  ExternalLink, 
  History, 
  BookOpen, 
  HelpCircle,
  FileCode2,
  Brain,
  ShieldCheck,
  Plus,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { generateExam, listAllExams, getAdminStats, adminCreateUser, ExamCreateResponse, AdminStatsResponse } from "@/lib/api";

const PRESET_SUBJECTS = [
  { id: "java", name: "Java Programming", icon: FileCode2, color: "from-orange-500/5 to-red-500/5", borderColor: "border-orange-200", textColor: "text-orange-600", description: "OOPs, Collections, Multi-threading, JVM, Exceptions" },
  { id: "python", name: "Python Programming", icon: BookOpen, color: "from-blue-500/5 to-cyan-500/5", borderColor: "border-blue-200", textColor: "text-blue-600", description: "Data structures, Generators, Decorators, Web Frameworks" },
  { id: "ai", name: "AI & Machine Learning", icon: Brain, color: "from-purple-500/5 to-indigo-500/5", borderColor: "border-purple-200", textColor: "text-purple-600", description: "Neural Networks, NLP, Computer Vision, Transformers, LLMs" },
  { id: "tester", name: "Software Testing & QA", icon: ShieldCheck, color: "from-emerald-500/5 to-teal-500/5", borderColor: "border-emerald-200", textColor: "text-emerald-600", description: "Selenium, Playwright, Jest, Manual vs Automation, CI/CD" }
];

export default function ExamAdminPortal() {
  const [selectedPreset, setSelectedPreset] = useState("java");
  const [customSubject, setCustomSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("mcq"); // "mcq" or "short"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExamCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [pastExams, setPastExams] = useState<any[]>([]);

  // Admin Dashboard stats & tables
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Candidate modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState(false);

  // Tab management
  const [activeTab, setActiveTab] = useState<"attempts" | "candidates">("attempts");
  const [isMounted, setIsMounted] = useState(false);

  // Fetch past exams and statistics on mount
  useEffect(() => {
    setIsMounted(true);
    fetchPastExams();
    fetchStats();
  }, []);

  const formatDate = (dateStr: string, includeTime = false) => {
    if (!isMounted) return "";
    try {
      const d = new Date(dateStr);
      return includeTime ? d.toLocaleString() : d.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  const fetchPastExams = async () => {
    try {
      const exams = await listAllExams();
      setPastExams(exams);
    } catch (err) {
      console.error("Failed to load past exams:", err);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      setStatsError(err.message || "Failed to load admin statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePresetSelect = (id: string) => {
    setSelectedPreset(id);
    if (id !== "custom") {
      setCustomSubject("");
    }
  };

  const getSubjectName = () => {
    if (selectedPreset === "custom") {
      return customSubject.trim() || "Custom Subject";
    }
    const preset = PRESET_SUBJECTS.find(s => s.id === selectedPreset);
    return preset ? preset.name : "Java Programming";
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    
    const subject = getSubjectName();
    if (!subject || subject === "Custom Subject") {
      setError("Please select a subject or enter a custom subject name.");
      return;
    }

    setLoading(true);
    try {
      const response = await generateExam({
        subject,
        prompt,
        num_questions: numQuestions,
        question_type: questionType
      });
      setResult(response);
      fetchPastExams(); // Refresh list
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message || "Failed to generate exam questions. Please verify your API setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserSuccess(false);
    setCreateUserLoading(true);
    try {
      await adminCreateUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword || "Welcome@123"
      });
      setCreateUserSuccess(true);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      fetchStats(); // Refresh stats
      setTimeout(() => {
        setIsAddUserOpen(false);
        setCreateUserSuccess(false);
      }, 1500);
    } catch (err: any) {
      setCreateUserError(err.message || "Failed to register candidate.");
    } finally {
      setCreateUserLoading(false);
    }
  };

  const getFullShareLink = (sharePath: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${sharePath}`;
    }
    return sharePath;
  };

  const handleCopyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(getFullShareLink(result.share_link));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEmailHref = () => {
    if (!result) return "";
    const subject = encodeURIComponent(`Invitation to take "${getSubjectName()}" Exam`);
    const body = encodeURIComponent(
      `Hello,\n\nYou have been invited to complete the "${getSubjectName()}" mock examination on AccountingHUB Exam Hall.\n\n` +
      `Exam details:\n` +
      `- Subject: ${getSubjectName()}\n` +
      `- Questions: ${result.num_questions}\n` +
      `- Question Type: ${questionType === "short" ? "Short Answer" : "Multiple Choice (MCQ)"}\n\n` +
      `Click the link below to log in/register and start your exam:\n` +
      `${getFullShareLink(result.share_link)}\n\n` +
      `Good luck!\nAccountingHUB Admin`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Background neon grids */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[400px] bg-purple-500/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/85 px-6 py-4 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/exam/it" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            AH
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm md:text-base leading-none">Exam Generation Admin Console</h1>
            <p className="text-[10.5px] text-slate-500 font-semibold mt-1">Generate AI exam templates, share unique URLs, and view past exams</p>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-6 z-10 space-y-4">
        {statsError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <XCircle size={14} className="text-rose-500" />
              <span>{statsError}</span>
            </span>
            <button 
              onClick={fetchStats}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1 rounded-xl text-[10px] transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Registered Candidates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Registered Candidates</span>
              <div className="text-3xl font-black text-slate-900">
                {stats ? stats.total_users : (statsLoading ? "..." : 0)}
              </div>
              <button 
                onClick={() => setIsAddUserOpen(true)}
                className="text-[10px] font-bold text-blue-650 hover:text-blue-755 flex items-center gap-1 mt-1 transition-colors"
              >
                + Add Candidate
              </button>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Total Attendance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Exam Attendance</span>
              <div className="text-3xl font-black text-slate-900">
                {stats ? stats.total_attempts : (statsLoading ? "..." : 0)}
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Total finished submissions</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <ClipboardList size={22} />
            </div>
          </div>

          {/* Card 3: Pass Rate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Passing Rate</span>
              <div className="text-3xl font-black text-emerald-650">
                {stats ? `${stats.pass_percentage}%` : (statsLoading ? "..." : "0%")}
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Score ≥ 50% criteria</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 size={22} />
            </div>
          </div>

          {/* Card 4: Fail Rate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold">Failing Rate</span>
              <div className="text-3xl font-black text-rose-650">
                {stats ? `${stats.fail_percentage}%` : (statsLoading ? "..." : "0%")}
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Require additional retries</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-655 flex items-center justify-center border border-rose-100">
              <XCircle size={22} />
            </div>
          </div>

        </div>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid lg:grid-cols-12 gap-8 z-10 my-4">
        
        {/* Left Side: Exam Generation Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-slate-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-650 flex items-center justify-center border border-blue-500/20">
                <Settings size={18} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-black">Create Exam Instance</h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* Preset Subjects Cards */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-550 uppercase tracking-wider block">1. Select Subject Area</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PRESET_SUBJECTS.map(subj => {
                    const Icon = subj.icon;
                    const isSelected = selectedPreset === subj.id;
                    return (
                      <button
                        key={subj.id}
                        type="button"
                        onClick={() => handlePresetSelect(subj.id)}
                        className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-32 ${
                          isSelected 
                            ? "bg-slate-50 border-blue-650 shadow-lg shadow-blue-500/5" 
                            : "bg-white border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div className={`p-2.5 rounded-xl bg-white text-slate-700 border ${isSelected ? "border-blue-300" : "border-slate-200"}`}>
                            <Icon size={18} />
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-blue-650 text-white flex items-center justify-center text-xs font-bold">
                              <Check size={12} />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900 mt-2">{subj.name}</div>
                          <p className="text-[10px] text-slate-450 font-medium leading-normal mt-0.5 line-clamp-2">{subj.description}</p>
                        </div>
                      </button>
                    );
                  })}

                  {/* Custom Option Card */}
                  <button
                    type="button"
                    onClick={() => handlePresetSelect("custom")}
                    className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-32 ${
                      selectedPreset === "custom" 
                        ? "bg-slate-50 border-blue-650 shadow-lg" 
                        : "bg-white border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className={`p-2.5 rounded-xl bg-white text-slate-700 border ${selectedPreset === "custom" ? "border-blue-300" : "border-slate-200"}`}>
                        <Plus size={18} />
                      </div>
                      {selectedPreset === "custom" && (
                        <span className="w-5 h-5 rounded-full bg-blue-650 text-white flex items-center justify-center text-xs font-bold">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 mt-2">Custom Topic</div>
                      <p className="text-[10px] text-slate-450 font-medium leading-normal mt-0.5">Define your own IT framework, database, or tool subject</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom Subject Name Input (Conditional) */}
              <AnimatePresence>
                {selectedPreset === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-xs font-bold text-slate-550 uppercase tracking-wider block">Custom Subject Name</label>
                    <input
                      type="text"
                      required
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      placeholder="e.g. Next.js & React Server Components"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-semibold"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject Instructions Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-550 uppercase tracking-wider flex items-center gap-1.5">
                  2. Focus Area & Prompt Guidance 
                  <span className="text-[10px] text-slate-400 lowercase font-medium">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Focus on memory management, garbage collection, collections framework and avoid basic syntax questions."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 leading-relaxed font-semibold resize-none"
                />
              </div>

              {/* Number of Questions and Question Type Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-550 uppercase tracking-wider block">3. Question Count</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-550 uppercase tracking-wider block">4. Evaluation Format</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 gap-1 h-[46px] relative">
                    {[
                      { label: "MCQ Options", value: "mcq" },
                      { label: "Short Text Response", value: "short" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setQuestionType(opt.value)}
                        className={`flex-1 relative z-10 text-center text-xs font-extrabold rounded-lg transition-colors duration-300 ${
                          questionType === opt.value
                            ? "text-slate-900"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {questionType === opt.value && (
                          <motion.div
                            layoutId="activeFormatIndicator"
                            className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/40 -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-20">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-650 bg-red-50 border border-red-200 p-3.5 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Questions via Agent...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate Exam Link
                  </>
                )}
              </button>

            </form>
          </motion.div>

          {/* Results Share Box (Conditional) */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50/40 border border-emerald-200 rounded-3xl p-6 md:p-8 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-650 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-base">Exam Session Registered!</h3>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Code {result.exam_id.toUpperCase()} generated successfully</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Examination Link URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getFullShareLink(result.share_link)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-mono font-medium outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 text-xs font-bold"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2.5">
                  <a
                    href={getEmailHref()}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Mail size={14} /> Invite Candidates via Mail
                  </a>
                  <Link
                    href={result.share_link}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={14} /> Go to Examination Hall
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Side: Generated Exams Registry list (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xl shadow-slate-100 flex flex-col h-full">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-650 flex items-center justify-center border border-indigo-500/20">
                <History size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Session History</h3>
                <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Recently generated evaluation codes</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[520px] pr-2 space-y-3.5">
              {pastExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center gap-2.5">
                  <HelpCircle size={24} className="text-slate-350" />
                  <p className="text-xs font-semibold max-w-[200px]">No past exam sessions recorded in history.</p>
                </div>
              ) : (
                pastExams.map((ex) => {
                  const shareLink = ex.share_link || `/exam/take?code=${ex.id}`;
                  return (
                    <div
                      key={ex.id}
                      className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{ex.subject}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                            Code: <span className="font-mono text-slate-700">{ex.id.toUpperCase()}</span>
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">
                            {formatDate(ex.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="bg-white text-[9.5px] font-mono text-slate-655 px-2 py-0.5 rounded border border-slate-200">
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

                      <div className="mt-3 flex items-center justify-between text-[10px] border-t border-slate-200/60 pt-2.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getFullShareLink(shareLink));
                            alert(`Copied link for ${ex.id.toUpperCase()}`);
                          }}
                          className="text-slate-550 hover:text-slate-800 font-bold flex items-center gap-1 transition-colors"
                        >
                          <Copy size={11} /> Copy Invite Link
                        </button>
                        
                        <Link
                          href={shareLink}
                          className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 transition-colors"
                        >
                          Visit Hall <ChevronLeft size={12} className="rotate-180" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Statistics & Logs Panel (Full 12 cols width) */}
        <div className="lg:col-span-12 space-y-6 mt-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100 space-y-6">
            
            {/* Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("attempts")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "attempts"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Exam Attempts & Audit Log
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("candidates")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "candidates"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Registered Candidates ({stats ? stats.users.length : 0})
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={activeTab === "attempts" ? "Search attempts by candidate..." : "Search candidates..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            {/* Content view */}
            <div>
              {activeTab === "attempts" ? (
                // Attempts table
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="pb-3 pl-4">Candidate</th>
                        <th className="pb-3">Subject</th>
                        <th className="pb-3 text-center">Score</th>
                        <th className="pb-3 text-center">Percentage</th>
                        <th className="pb-3 text-center">Audit Status</th>
                        <th className="pb-3 pr-4 text-right">Completion Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {!stats || stats.attempts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                            No exam attempts recorded yet.
                          </td>
                        </tr>
                      ) : (
                        stats.attempts
                          .filter(att => 
                            att.user_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            att.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            att.exam_subject.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((att) => (
                            <tr key={att.attempt_id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 pl-4">
                                <div className="font-extrabold text-slate-900">{att.user_name}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-medium">{att.user_email}</div>
                              </td>
                              <td className="py-3.5">{att.exam_subject}</td>
                              <td className="py-3.5 text-center font-mono font-bold">
                                {att.score} / {att.total_questions}
                              </td>
                              <td className="py-3.5 text-center font-mono font-bold">
                                {att.percentage.toFixed(0)}%
                              </td>
                              <td className="py-3.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                                  att.passed
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}>
                                  {att.passed ? "PASSED" : "FAILED"}
                                </span>
                              </td>
                              <td className="py-3.5 pr-4 text-right text-slate-400 font-semibold">
                                {formatDate(att.completed_at, true)}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Candidates list
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="pb-3 pl-4">ID</th>
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3 pr-4 text-right">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {!stats || stats.users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-400 font-semibold">
                            No registered candidates found.
                          </td>
                        </tr>
                      ) : (
                        stats.users
                          .filter(u => 
                            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 pl-4 font-mono font-bold text-slate-400">#{u.id}</td>
                              <td className="py-3.5 font-extrabold text-slate-900">{u.name}</td>
                              <td className="py-3.5 font-mono text-slate-655 font-semibold">{u.email}</td>
                              <td className="py-3.5 pr-4 text-right text-slate-400 font-semibold">
                                {formatDate(u.created_at, true)}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-650" />
              
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
                  <Users size={22} />
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-none">Register New Candidate</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Add credentials to authorize exam access</p>
              </div>

              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Optional (Default: Welcome@123)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {createUserError && (
                  <p className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                    {createUserError}
                  </p>
                )}

                {createUserSuccess && (
                  <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    Candidate registered successfully!
                  </p>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="flex-1 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider disabled:opacity-50"
                  >
                    {createUserLoading ? "Registering..." : "Add Candidate"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
