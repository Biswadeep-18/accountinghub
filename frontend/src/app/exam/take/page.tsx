"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  User, 
  Check, 
  X, 
  GraduationCap, 
  ArrowRight, 
  Award, 
  AlertTriangle, 
  ClipboardList, 
  RotateCcw,
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Printer,
  Download,
  Lock,
  Mail,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { 
  getExamDetails, 
  examUserAuth, 
  submitExamAnswers, 
  ExamDetailsResponse, 
  ExamSubmitResponse,
  UserAuthResponse 
} from "@/lib/api";

function ExamTakerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  // Authentication State
  const [user, setUser] = useState<UserAuthResponse | null>(null);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isRegister, setIsRegister] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Exam Details & Setup State
  const [exam, setExam] = useState<ExamDetailsResponse | null>(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [examError, setExamError] = useState("");

  // Exam Taking State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [phase, setPhase] = useState<"auth" | "intro" | "testing" | "results">("auth");

  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamSubmitResponse | null>(null);

  // 1. Fetch Exam details on mount
  useEffect(() => {
    if (!code) {
      setExamError("No exam code provided. Please use a valid shared exam URL.");
      setLoadingExam(false);
      return;
    }

    async function loadExam() {
      try {
        const details = await getExamDetails(code!);
        setExam(details);
      } catch (err: any) {
        setExamError(err.message || "Failed to load examination details.");
      } finally {
        setLoadingExam(false);
      }
    }

    loadExam();
  }, [code]);

  // 2. Check local storage for existing session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("exam_user_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserAuthResponse;
          setUser(parsed);
          setPhase("intro");
        } catch (e) {
          localStorage.removeItem("exam_user_session");
        }
      }
    }
  }, []);

  // 3. Timer handler
  useEffect(() => {
    if (phase === "testing") {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            autoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [phase]);

  // Auth Handler (Login/Register)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const data = await examUserAuth(
        code!,
        authEmail,
        authPassword,
        isRegister,
        isRegister ? authName : undefined
      );
      setUser(data);
      localStorage.setItem("exam_user_session", JSON.stringify(data));
      setPhase("intro");
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Check your password or email.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Start Exam Session
  const handleStartExam = () => {
    if (!exam) return;
    setSecondsRemaining(exam.num_questions * 60); // 1 minute per question
    setPhase("testing");
  };

  const handleSelectOption = (oIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIdx]: oIdx
    }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleNext = () => {
    if (exam && currentIdx < exam.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const autoSubmit = async () => {
    if (!exam || !user) return;
    setSubmitting(true);
    try {
      const answersToSend: Record<string, number | string> = {};
      Object.keys(userAnswers).forEach(k => {
        answersToSend[k] = userAnswers[k];
      });
      const data = await submitExamAnswers(code!, user.user_id, answersToSend);
      setResult(data);
      setPhase("results");
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  };

  const handleSubmitExam = async () => {
    setIsSubmitModalOpen(false);
    await autoSubmit();
  };

  const logoutSession = () => {
    localStorage.removeItem("exam_user_session");
    setUser(null);
    setPhase("auth");
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingExam) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center font-sans">
        <Loader2 size={36} className="text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-semibold">Loading Exam Workspace...</p>
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertTriangle size={48} className="text-rose-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Error</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">{examError || "Exam not found"}</p>
        <Link href="/" className="bg-slate-900 hover:bg-slate-850 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative overflow-hidden print:bg-white print:text-slate-900 print:overflow-visible">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none print:hidden" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between z-20 shrink-0 print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/exam/it" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900">
            <ArrowLeft size={16} />
          </Link>
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
            EX
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm md:text-base leading-none">AI Adaptive Exam Center</h1>
            <p className="text-[10.5px] text-slate-450 font-semibold mt-1">Exam Link: <span className="font-mono text-blue-600 font-bold">{code}</span></p>
          </div>
        </div>

        {phase === "testing" && (
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono text-sm font-black shadow-sm transition-all ${
              secondsRemaining < 60 
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" 
                : "bg-white border-slate-200 text-slate-700"
            }`}>
              <Clock size={16} className={secondsRemaining < 60 ? "text-rose-500" : "text-slate-400"} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
            
            <button 
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              Submit Exam
            </button>
          </div>
        )}

        {user && phase === "intro" && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-800">{user.name}</div>
              <div className="text-[10px] text-slate-500">{user.email}</div>
            </div>
            <button
              onClick={logoutSession}
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-605 text-[10px] px-3 py-1.5 rounded-lg transition-all font-semibold"
            >
              Change Student
            </button>
          </div>
        )}
      </header>

      {/* Main Viewport Container */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible">
        <AnimatePresence mode="wait">
          
          {/* Phase 1: Authentication */}
          {phase === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-950 font-black">Student Verification</h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    You must register or log in to take the custom exam generated for: <strong className="text-slate-600 font-bold">{exam.subject}</strong>.
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  
                  {isRegister && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" size={16} />
                        <input 
                          type="text" 
                          required
                          value={authName}
                          onChange={e => setAuthName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 transition-all font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" size={16} />
                      <input 
                        type="email" 
                        required
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Exam Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" size={16} />
                      <input 
                        type="password" 
                        required
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 transition-all font-mono font-bold"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl text-xs font-semibold leading-relaxed">
                      {authError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group transition-all"
                  >
                    {authLoading ? (
                      <>Processing Verification...</>
                    ) : (
                      <>
                        {isRegister ? "Register & Enter Exam" : "Login & Enter Exam"}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setAuthError("");
                    }}
                    className="text-xs text-slate-500 hover:text-blue-600 font-bold"
                  >
                    {isRegister ? "Already registered? Login here" : "Need to register? Sign up here"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 2: Exam Intro & Instructions */}
          {phase === "intro" && user && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block font-black">Ready to Begin</span>
                  <h2 className="text-2xl font-black text-slate-900">{exam.subject} Examination</h2>
                  <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                    Welcome <strong className="text-slate-800 font-bold">{user.name}</strong>. Please review the official examination guidelines before starting your test session.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question Count</span>
                    <span className="text-lg font-black text-slate-900">{exam.num_questions} Questions</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Allowed</span>
                    <span className="text-lg font-black text-slate-900">{exam.num_questions * 1} Minutes</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed space-y-2">
                  <div className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={13} className="text-blue-500" />
                    Honor Code Guidelines
                  </div>
                  <ul className="list-disc pl-3.5 space-y-1.5 font-medium">
                    <li>This exam is auto-marked upon completion. Passing score is <strong>50%</strong>.</li>
                    <li>The countdown timer starts the moment you click begin.</li>
                    <li>If you leave the tab, the timer continues. Auto-submission triggers at 00:00.</li>
                    <li>Upon successful completion, you can download a verified Certificate of Achievement.</li>
                  </ul>
                </div>

                <button
                  onClick={handleStartExam}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group transition-all"
                >
                  Start My Examination Now
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Phase 3: Active Testing */}
          {phase === "testing" && (
            <motion.div
              key="testing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Question Drawer Sidebar */}
              <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col h-full shrink-0 hidden md:flex">
                <div className="mb-6 space-y-1 border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Student ID</span>
                  <div className="text-sm font-extrabold text-slate-900">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{user?.email}</div>
                </div>

                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Questions Sheet Navigator</div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {exam.questions.map((_, i) => {
                      const isAnswered = userAnswers[i] !== undefined;
                      const isMarked = markedForReview[i];
                      const isActive = i === currentIdx;

                      let bubbleClass = "bg-white border-slate-200 text-slate-500 hover:bg-slate-50";
                      
                      if (isAnswered) {
                        bubbleClass = "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100/50";
                      }
                      if (isMarked) {
                        bubbleClass = "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100/50";
                      }
                      if (isActive) {
                        bubbleClass = "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-50 shadow-md font-bold";
                      }

                      return (
                        <button 
                          key={i}
                          onClick={() => setCurrentIdx(i)}
                          className={`h-9 w-9 rounded-xl border text-xs flex items-center justify-center transition-all ${bubbleClass}`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="border-t border-slate-200 pt-6 space-y-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-blue-600 rounded-sm inline-block"></span>
                    <span>Currently Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-blue-50 border border-blue-200 rounded-sm inline-block"></span>
                    <span>Saved / Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-amber-50 border border-amber-200 rounded-sm inline-block"></span>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-white border border-slate-205 rounded-sm inline-block"></span>
                    <span>Unanswered Sheet</span>
                  </div>
                </div>
              </aside>

              {/* Main Questions Viewport */}
              <main className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
                <div className="max-w-3xl mx-auto w-full space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full border border-blue-500/20">
                      Subject: {exam.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Question {currentIdx + 1} of {exam.questions.length}
                    </span>
                  </div>

                  {/* Question Box */}
                  <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 md:p-8 space-y-6 relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
                    
                    <h3 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
                      {exam.questions[currentIdx]?.question}
                    </h3>

                    {/* Options or Text Area */}
                    {exam.questions[currentIdx]?.question_type === "short" ? (
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Your Short Answer Response</label>
                        <textarea
                          rows={4}
                          value={(userAnswers[currentIdx] as string) || ""}
                          onChange={e => setUserAnswers(prev => ({ ...prev, [currentIdx]: e.target.value }))}
                          placeholder="Type your detailed answer here... The AI agent will grade it based on key concepts."
                          className="w-full bg-slate-50 border border-slate-250 rounded-2xl p-4 text-xs md:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed resize-none font-semibold"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {exam.questions[currentIdx]?.options?.map((opt, oIdx) => {
                          const isSelected = userAnswers[currentIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(oIdx)}
                              className={`w-full text-left p-4 text-xs md:text-sm rounded-2xl border transition-all flex items-start gap-3.5 ${
                                isSelected 
                                  ? "bg-blue-50 border-blue-500 text-blue-900 font-bold" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                                isSelected 
                                  ? "bg-blue-600 border-blue-600 text-white" 
                                  : "border-slate-300 text-slate-400 bg-slate-50"
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="leading-relaxed font-semibold">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="max-w-3xl mx-auto w-full border-t border-slate-200 pt-6 mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={currentIdx === 0}
                      onClick={handlePrev}
                      className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 font-semibold text-xs px-4 py-2.5 rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button 
                      disabled={currentIdx === exam.questions.length - 1}
                      onClick={handleNext}
                      className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 font-semibold text-xs px-4 py-2.5 rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={toggleMarkForReview}
                    className={`font-semibold text-xs px-4 py-2.5 rounded-xl transition-all border ${
                      markedForReview[currentIdx] 
                        ? "bg-amber-50 border-amber-300 text-amber-700 font-bold" 
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {markedForReview[currentIdx] ? "★ Marked for Review" : "☆ Mark for Review"}
                  </button>
                </div>
              </main>
            </motion.div>
          )}

          {/* Phase 4: Results & Scorecard */}
          {phase === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 overflow-y-auto p-6 md:p-8 print:bg-white print:p-0 print:overflow-visible"
            >
              <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 my-4">
                
                {/* Printable Certificate (Visible only on print) */}
                {result.passed && (
                  <div className="hidden print:flex flex-col items-center justify-center border-[12px] border-double border-emerald-800 p-12 text-center space-y-6 bg-emerald-50 h-[210mm] w-[297mm] mx-auto box-border break-inside-avoid shadow-none">
                    <Award size={64} className="text-emerald-700 mb-1" />
                    <h1 className="text-4xl font-extrabold text-emerald-700 uppercase tracking-widest font-serif">Certificate of Achievement</h1>
                    <p className="text-base text-slate-700 font-serif max-w-xl">
                      This is officially awarded to
                    </p>
                    <h2 className="text-4xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 px-10 italic">
                      {user?.name}
                    </h2>
                    <p className="text-base text-slate-700 font-serif max-w-xl leading-relaxed">
                      for successfully passing the artificial intelligence validated examination for
                    </p>
                    <h3 className="text-2xl font-black text-slate-900">
                      {exam.subject}
                    </h3>
                    <p className="text-sm text-slate-700 font-serif">
                      with a final audited score of <strong>{result.percentage.toFixed(0)}%</strong>.
                    </p>
                    <div className="flex justify-between w-full mt-10 pt-6 border-t border-slate-400/80 px-8 text-xs">
                      <div className="text-center">
                        <p className="text-slate-800 font-bold">{new Date().toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Date Certified</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-800 font-bold font-mono">AH-EX-{result.attempt_id}-{code}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Verification Code</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scorecard Header Card (Screen view) */}
                <div className="bg-white border border-slate-205 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative print:hidden shadow-xl shadow-slate-100">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                  
                  <div className="space-y-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <span className="text-[10px] font-bold tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                        AI Certified Attempt
                      </span>
                      <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${
                        result.passed ? "bg-emerald-50 text-emerald-700 border border-emerald-250" : "bg-rose-50 text-rose-700 border border-rose-250"
                      }`}>
                        {result.passed ? "PASSED (CERTIFIED)" : "FAILED (RETRY REQUIRED)"}
                      </span>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 leading-none">
                      {user?.name}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs pt-1 text-slate-450 font-semibold">
                      <div>
                        <span className="block text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Subject Syllabus</span>
                        <span className="text-slate-800 text-[11px] font-bold">{exam.subject}</span>
                      </div>
                      <div>
                        <span className="block text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Exam ID Code</span>
                        <span className="text-slate-800 font-mono text-[11px] font-bold">{code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center ${
                      result.passed ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-rose-500 text-rose-600 bg-rose-50"
                    }`}>
                      <span className="text-3xl font-black leading-none">{result.score}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">/ {result.total_questions} Qs</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">{result.percentage.toFixed(0)}% Score</span>
                  </div>
                </div>

                {/* Score Summary Text (Screen view) */}
                <div className={`p-4 rounded-2xl border flex items-center gap-3.5 print:hidden ${
                  result.passed ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                  {result.passed ? <Award size={24} /> : <AlertTriangle size={24} />}
                  <div className="text-xs leading-relaxed font-semibold">
                    {result.passed 
                      ? "Congratulations! You scored at or above the 50% passing threshold for this AI-generated examination. Your customized Certificate of Achievement is available below."
                      : "You did not achieve the required 50% passing score for this examination. Review the correct answers and explanations below to improve, and request the admin for a new link to try again."
                    }
                  </div>
                </div>

                {/* Actions Row (Screen view) */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question-by-Question Academic Audit</h3>
                  <div className="flex items-center gap-2">
                    {result.passed && (
                      <button 
                        onClick={handlePrint}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Printer size={14} /> Print / Save Certificate
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setUserAnswers({});
                        setMarkedForReview({});
                        setPhase("intro");
                      }}
                      className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} /> Restart Attempt
                    </button>
                  </div>
                </div>

                {/* Review Question Sheets (Screen view) */}
                <div className="space-y-6 print:hidden">
                  {result.questions.map((q, idx) => {
                    const userAns = q.userAnswer ?? userAnswers[idx];
                    const isCorrect = q.question_type === "short" 
                      ? !!q.isCorrect 
                      : (q.correctIndex !== undefined ? userAns === q.correctIndex : false);
                    const isUnanswered = userAns === undefined || userAns === "";

                    return (
                      <div 
                        key={idx} 
                        className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden shadow-lg shadow-slate-100"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                          isUnanswered 
                            ? "bg-slate-300" 
                            : isCorrect 
                              ? "bg-emerald-500" 
                              : "bg-rose-500"
                        }`} />

                        <div className="flex items-start justify-between gap-4">
                          <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            Question {idx + 1}
                          </span>
                          
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                            isUnanswered 
                              ? "bg-slate-50 text-slate-400 border border-slate-200" 
                              : isCorrect 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {isUnanswered ? (
                              <>Unanswered</>
                            ) : isCorrect ? (
                              <><Check size={12} /> Correct (+1 point)</>
                            ) : (
                              <><X size={12} /> Incorrect (0 points)</>
                            )}
                          </span>
                        </div>

                        {/* Question Text */}
                        <h4 className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
                          {q.question}
                        </h4>

                        {/* Comparison Grid */}
                        <div className="grid md:grid-cols-2 gap-4 pt-2">
                          {/* User Selection */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                            <span className="text-[9.5px] font-extrabold text-slate-450 uppercase tracking-wider block font-bold">Your Answer Selection</span>
                            <div className="flex items-start gap-2.5">
                              {isUnanswered ? (
                                <span className="text-xs italic text-slate-400 leading-relaxed font-semibold">No answer was submitted.</span>
                              ) : q.question_type === "short" ? (
                                <span className="text-xs text-slate-700 font-semibold leading-relaxed font-mono whitespace-pre-wrap">
                                  {userAns as string}
                                </span>
                              ) : (
                                <>
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                                    isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                                  }`}>
                                    {String.fromCharCode(65 + (userAns as number))}
                                  </span>
                                  <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                                    {q.options?.[userAns as number]}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Correct Selection */}
                          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 space-y-2">
                            <span className="text-[9.5px] font-extrabold text-emerald-600 uppercase tracking-wider block font-black">
                              {q.question_type === "short" ? "Expected Key Concept" : "Correct Key Answer"}
                            </span>
                            <div className="flex items-start gap-2.5">
                              {q.question_type === "short" ? (
                                <span className="text-xs text-emerald-600 font-bold leading-relaxed">
                                  {q.correct_answer}
                                </span>
                              ) : (
                                <>
                                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                                    {String.fromCharCode(65 + (q.correctIndex ?? 0))}
                                  </span>
                                  <span className="text-xs text-slate-800 font-bold leading-relaxed">
                                    {q.options?.[q.correctIndex ?? 0]}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Feedback for Short Answer */}
                        {q.question_type === "short" && q.feedback && (
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs leading-relaxed text-slate-500 space-y-1">
                            <span className="font-extrabold text-indigo-600 block uppercase tracking-wider text-[9.5px] font-black">AI Evaluator Feedback</span>
                            <p className="italic text-slate-650 font-semibold">"{q.feedback}"</p>
                          </div>
                        )}

                        {/* Explanatory notes */}
                        <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 text-xs leading-relaxed text-slate-600 space-y-1">
                          <span className="font-extrabold text-blue-700 block uppercase tracking-wider text-[9.5px] font-black">Academic Explanation</span>
                          <p className="font-medium">{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Confirmation Submit Dialog Modal (Screen view) */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 print:hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-6"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-250 shadow-sm">
                <AlertTriangle size={26} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 leading-none">Confirm Submission?</h3>
                <p className="text-xs text-slate-400 leading-relaxed px-4 font-semibold">
                  You have answered <strong>{Object.keys(userAnswers).length}</strong> out of {exam.questions.length} total questions. Once submitted, your exam will be evaluated. You cannot modify answers.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  {submitting ? "Submitting..." : "Confirm & Submit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function ExamTakerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center font-sans">
        <Loader2 size={36} className="text-blue-650 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-semibold">Loading Exam Session...</p>
      </div>
    }>
      <ExamTakerContent />
    </Suspense>
  );
}
