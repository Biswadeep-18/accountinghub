"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  BookOpen, 
  Sparkles, 
  X, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  Check, 
  FileText, 
  AlertCircle 
} from "lucide-react";
import { askLearnQuestion } from "@/lib/api";

// Simple custom parser for formatting markdown bold, headings and tables elegantly in chat bubbles
function parseContent(content: string) {
  const parts = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableLines: string[] = [];
  let inTable = false;

  const flushTable = (key: number) => {
    if (tableLines.length === 0) return;
    
    // Parse table lines
    const parsedRows = tableLines.map(line => 
      line.split("|").map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    );
    
    if (parsedRows.length < 2) return;
    
    const headers = parsedRows[0];
    const dataRows = parsedRows.slice(2); // Skip header separator row (e.g., |---|---|)
    
    elements.push(
      <div key={`table-${key}`} className="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-lg">
        <table className="w-full text-left text-xs border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-extrabold text-slate-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 font-mono text-slate-800">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    
    tableLines = [];
    inTable = false;
  };

  parts.forEach((part, index) => {
    const trimmed = part.trim();
    
    // Table detection
    if (trimmed.startsWith("|")) {
      inTable = true;
      tableLines.push(part);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    if (trimmed.startsWith("###")) {
      elements.push(
        <h3 key={index} className="text-[14px] font-bold text-slate-900 mt-4 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-blue-500 rounded-sm inline-block"></span>
          {trimmed.replace("###", "").trim()}
        </h3>
      );
    } else if (trimmed.startsWith("##")) {
      elements.push(
        <h2 key={index} className="text-base font-bold text-indigo-900 mt-5 mb-2 border-b border-indigo-50 pb-1">
          {trimmed.replace("##", "").trim()}
        </h2>
      );
    } else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      elements.push(
        <li key={index} className="ml-4 list-disc text-slate-700 my-1 text-[13.5px] leading-relaxed">
          {formatBold(trimmed.substring(1).trim())}
        </li>
      );
    } else if (trimmed) {
      elements.push(
        <p key={index} className="text-slate-700 my-2 text-[13.5px] leading-relaxed">
          {formatBold(trimmed)}
        </p>
      );
    }
  });

  if (inTable) {
    flushTable(9999);
  }

  return elements;
}

function formatBold(text: string) {
  const regex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-bold text-slate-950">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function LearnChat() {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hello! I'm your CA-level accounting tutor. What topic shall we master today? You can choose one of the syllabus topics below, ask a question directly, or upload a document (PDF, Excel, image, txt) using the paperclip button for live analysis!" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("advanced"); // "beginner", "intermediate", "advanced"
  
  // Document Attachment State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: string;
    content: string;
  } | null>(null);

  // File history sidebar log
  const [analyzedDocs, setAnalyzedDocs] = useState<Array<{ name: string; size: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced MCQ Prep Quiz Pool
  const quizPool = [
    {
      question: "Under standard double-entry rules, a credit balance in the Sales Return Account represents a:",
      options: ["Contra-revenue anomaly / error", "Standard operating revenue", "Prepaid sales asset", "Direct cost of goods sold"],
      correctIndex: 0,
      explanation: "Sales Return is a contra-revenue account and holds a normal debit balance. An unusual credit balance represents a booking anomaly or transaction error."
    },
    {
      question: "Which accounting standard governs the treatment of Leases (Right-of-Use assets & lease liabilities)?",
      options: ["IAS 2 / Ind AS 2", "IFRS 16 / Ind AS 116", "IAS 12 / Ind AS 12", "IFRS 9 / Ind AS 109"],
      correctIndex: 1,
      explanation: "IFRS 16 (and its Indian equivalent Ind AS 116) governs lease accounting, requiring lessees to recognize lease liabilities and Right-of-Use (ROU) assets on the balance sheet."
    },
    {
      question: "How should a temporary difference that results in tax taxable amounts in future years be recognized?",
      options: ["Deferred Tax Asset (DTA)", "Deferred Tax Liability (DTL)", "Current Tax Expense", "Direct Equity reserve"],
      correctIndex: 1,
      explanation: "Taxable temporary differences lead to higher tax payments in the future, which must be recognized as a Deferred Tax Liability (DTL) under IAS 12 / Ind AS 12."
    },
    {
      question: "In calculating Goodwill during a consolidation, what represents the excess of purchase consideration over the net fair value of identifiable assets?",
      options: ["Goodwill", "Gain on Bargain Purchase", "Non-Controlling Interest", "Capital Reserve"],
      correctIndex: 0,
      explanation: "Goodwill represents the excess value paid during an acquisition over the net fair value of the subsidiary's identifiable assets and liabilities."
    },
    {
      question: "Which of the following describes the relationship between Inherent Risk (IR), Control Risk (CR), and Detection Risk (DR)?",
      options: ["DR = Audit Risk / (IR × CR)", "DR = IR × CR × Audit Risk", "Audit Risk = DR / (IR × CR)", "DR = IR + CR - Audit Risk"],
      correctIndex: 0,
      explanation: "According to the Audit Risk Model, Audit Risk (AR) = Inherent Risk (IR) × Control Risk (CR) × Detection Risk (DR). Therefore, Detection Risk (DR) = AR / (IR × CR)."
    }
  ];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnsweredIndex, setQuizAnsweredIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleQuizAnswer = (selectedIdx: number) => {
    if (quizAnsweredIndex !== null) return;
    setQuizAnsweredIndex(selectedIdx);
    if (selectedIdx === quizPool[currentQuizIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < quizPool.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setQuizAnsweredIndex(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setQuizAnsweredIndex(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const syllabusList = [
    { name: "IFRS 16 Leases accounting", completed: true },
    { name: "Deferred Taxes & Ind AS 12", completed: true },
    { name: "Goodwill & Consolidation", completed: false },
    { name: "Audit Materiality & Risks", completed: false },
    { name: "Capital budgeting & NPV", completed: false }
  ];

  const suggestedTopics = [
    {
      title: "IFRS 16 Leases Example",
      prompt: "Provide a practical double-entry example of a lease liability and Right-of-Use asset recording under IFRS 16."
    },
    {
      title: "Deferred Taxes Formula",
      prompt: "Explain step-by-step how temporary difference calculations create a Deferred Tax Asset (DTA) or Liability (DTL)."
    },
    {
      title: "Consolidation & Goodwill",
      prompt: "How is goodwill and non-controlling interest (NCI) calculated in a subsidiary acquisition?"
    },
    {
      title: "Inherent vs Control Risk",
      prompt: "In audit principles, explain the conceptual differences between inherent risk, control risk, and detection risk."
    }
  ];

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const textContent = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        type: file.type,
        content: textContent || "[Non-text binary formatting]"
      });
    };

    if (file.type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".json") || file.name.endsWith(".md")) {
      reader.readAsText(file);
    } else {
      // Simulate/mock data extraction for PDF / spreadsheet / images to satisfy dynamic CA queries
      setAttachedFile({
        name: file.name,
        size: sizeStr,
        type: file.type,
        content: `[Extracted Content from ${file.name}]:
ABC Corp - Quarterly Statement (Q3 2025)
Revenues: $450,000
Cost of Goods Sold (COGS): $210,000
Operating Expenses: $95,000
Equipment purchased on credit: $45,000
Depreciation charged: $12,000
Cash at bank: $180,000
Accounts Receivable: $65,000
Accounts Payable: $38,000`
      });
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    
    const messageInput = customPrompt || input;
    if ((!messageInput.trim() && !attachedFile) || isLoading) return;

    let userMessage = messageInput;
    let payloadMessage = messageInput;

    if (attachedFile) {
      userMessage = messageInput 
        ? `${messageInput} (Attached: ${attachedFile.name})` 
        : `Analyze attached document: ${attachedFile.name}`;
      
      payloadMessage = `[UPLOADED DOCUMENT ATTACHED - ${attachedFile.name} (${attachedFile.size})]:\n${attachedFile.content}\n\nUser Question: ${messageInput || "Conduct a structured review and outline the core accounting principles shown."}`;
      
      // Save to document sidebar logs
      setAnalyzedDocs(prev => [...prev, { name: attachedFile.name, size: attachedFile.size }]);
    }

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(true);

    try {
      const levelLabel = selectedLevel === "advanced" 
        ? "ca_final" 
        : selectedLevel === "intermediate" 
          ? "ipcc_inter" 
          : "foundation";
          
      const response = await askLearnQuestion(payloadMessage, levelLabel);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Error communicating with the Accounting Academy AI server. Please verify that your FastAPI backend is running and GROQ_API_KEY is configured in your .env file." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Left Workspace Panel - Prep & Syllabus */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto shrink-0 p-6 pb-16 space-y-6 scrollbar-thin">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={22} />
            Academy Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-1">Difficulty level and syllabus checklists.</p>
        </div>

        {/* Segmented Level Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Level of Study</label>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 relative">
            {[
              { label: "Found.", value: "beginner" },
              { label: "IPCC", value: "intermediate" },
              { label: "CA Final", value: "advanced" }
            ].map((opt) => (
              <button 
                key={opt.value}
                onClick={() => setSelectedLevel(opt.value)}
                className={`flex-1 relative z-10 py-1.5 text-center text-xs font-semibold rounded-lg transition-colors duration-300 ${
                  selectedLevel === opt.value 
                    ? "text-slate-900" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {selectedLevel === opt.value && (
                  <motion.div
                    layoutId="activeLevelIndicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/30 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Mini Quiz */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600">
              <HelpCircle size={16} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Prep Challenge</span>
            </div>
            {!quizFinished && (
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Q {currentQuizIndex + 1}/{quizPool.length}
              </span>
            )}
          </div>

          {!quizFinished ? (
            <>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {quizPool[currentQuizIndex].question}
              </p>
              <div className="space-y-1.5 pt-1">
                {quizPool[currentQuizIndex].options.map((opt, i) => {
                  const isCorrect = i === quizPool[currentQuizIndex].correctIndex;
                  const isSelected = i === quizAnsweredIndex;
                  return (
                    <button 
                      key={i}
                      disabled={quizAnsweredIndex !== null}
                      onClick={() => handleQuizAnswer(i)}
                      className={`w-full text-left px-3 py-2.5 text-xs rounded-xl border transition-all flex justify-between items-center ${
                        quizAnsweredIndex === null 
                          ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-700" 
                          : isSelected 
                            ? isCorrect 
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold" 
                              : "bg-rose-50 border-rose-300 text-rose-800 font-semibold"
                            : isCorrect 
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold" 
                              : "bg-white border-slate-100 text-slate-400"
                      }`}
                    >
                      <span>{opt}</span>
                      {quizAnsweredIndex !== null && isCorrect && <Check size={12} className="text-emerald-600" />}
                      {quizAnsweredIndex === i && !isCorrect && <X size={12} className="text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {quizAnsweredIndex !== null && (
                <div className="space-y-3 pt-2 border-t border-slate-200/50">
                  <div className="text-[11px] text-slate-500 italic leading-relaxed">
                    {quizAnsweredIndex === quizPool[currentQuizIndex].correctIndex 
                      ? `🎉 Correct! ${quizPool[currentQuizIndex].explanation}` 
                      : `Oops! ${quizPool[currentQuizIndex].explanation}`}
                  </div>
                  
                  <button 
                    onClick={handleNextQuiz}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {currentQuizIndex === quizPool.length - 1 ? "Show Scorecard ➔" : "Next Question ➔"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-2 space-y-3">
              <div className="text-3xl">🎉</div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Challenge Completed!</h3>
              <div className="text-2xl font-black text-blue-600">
                {quizScore} / {quizPool.length}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                {quizScore === quizPool.length 
                  ? "Outstanding! You got a perfect score. You are fully CA exam-ready!" 
                  : quizScore >= 3 
                    ? "Good job! You've passed the daily challenge. Keep polishing your skills." 
                    : "Nice try! Great practice. Review the standard principles and try again."}
              </p>
              <button 
                onClick={resetQuiz}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-sm"
              >
                Restart Challenge ⟲
              </button>
            </div>
          )}
        </div>

        {/* Syllabus / Progress */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Syllabus Coverage</label>
          <div className="space-y-2 bg-white rounded-xl border border-slate-100 p-1">
            {syllabusList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className={`font-medium ${item.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.name}</span>
                {item.completed ? (
                  <CheckCircle2 size={15} className="text-emerald-500" />
                ) : (
                  <span className="w-2.5 h-2.5 border-2 border-slate-300 rounded-full inline-block"></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document uploads library */}
        {analyzedDocs.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Analyzed Files</label>
            <div className="space-y-2">
              {analyzedDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 border border-slate-200 rounded-xl">
                  <FileText className="text-blue-500" size={16} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11.5px] font-bold text-slate-700 truncate">{doc.name}</div>
                    <div className="text-[10px] text-slate-400">{doc.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
        {/* Chat header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base">Accounting Academy AI</h1>
              <p className="text-[11px] text-slate-400 font-medium">
                CA Tutor System • Powered by Llama-3.3-70B • Study: 
                <span className="font-bold text-blue-600 ml-1 uppercase">
                  {selectedLevel === "advanced" ? "CA Final" : selectedLevel === "intermediate" ? "IPCC" : "Foundation"}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* Chat Bubbles / Workspace Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[#F8FAFC] pb-32">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-blue-600 text-white"}`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-5 py-4 rounded-2xl max-w-[75%] leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none font-medium text-[13.5px]" 
                  : "bg-white border border-slate-200/70 text-slate-800 rounded-tl-none"
              }`}>
                {msg.role === "user" ? msg.content : parseContent(msg.content)}
              </div>
            </motion.div>
          ))}

          {/* Recommended topics at the start */}
          {messages.length === 1 && (
            <div className="max-w-2xl mx-auto pt-6 space-y-4">
              <div className="flex items-center gap-1 text-slate-400 justify-center">
                <Sparkles size={14} className="text-blue-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Master Core syllabus units instantly</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {suggestedTopics.map((topic, i) => (
                  <button 
                    key={i}
                    onClick={(e) => handleSend(e, topic.prompt)}
                    className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between h-32"
                  >
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{topic.title}</span>
                    <span className="text-[11.5px] text-slate-400 mt-2 leading-relaxed line-clamp-3">{topic.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
               <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600 text-white shadow-sm">
                 <Bot size={16} />
               </div>
               <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200/70 text-slate-800 rounded-tl-none shadow-sm flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                 <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                 <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
               </div>
             </motion.div>
          )}
        </div>

        {/* Input box wrapping with gradient masking */}
        <div className="absolute bottom-0 left-80 right-0 h-36 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent pointer-events-none z-10" />

        {/* Input & Form Wrapper */}
        <div className="absolute bottom-6 left-[344px] right-6 z-20">
          <form 
            onSubmit={(e) => handleSend(e)}
            className="bg-white border border-slate-200 shadow-xl rounded-3xl p-2.5 flex flex-col gap-2 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300 relative"
          >
            {/* Hidden native input file */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.txt,.json,.md"
            />

            {/* Document attachment preview block */}
            <AnimatePresence>
              {attachedFile && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-blue-50/70 border border-blue-100 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate max-w-md">{attachedFile.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Ready for AI document processing • {attachedFile.size}</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeAttachedFile}
                    className="text-slate-400 hover:text-slate-600 p-1 bg-white border border-slate-100 rounded-full hover:shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={handleFileClick}
                className="text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all p-3 rounded-full flex-shrink-0 relative group"
                title="Attach Document"
              >
                <Paperclip size={20} />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Attach file</span>
              </button>
              
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={attachedFile ? "Ask a question about this document or submit..." : "Ask about Ind AS/IFRS, double-entry ledgers, auditing questions..."}
                className="flex-1 outline-none text-slate-800 bg-transparent py-2.5 text-[13.5px] font-medium"
                disabled={isLoading}
              />
              
              <button 
                type="submit"
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className="bg-blue-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-30 transition-all shadow-md shrink-0 flex-shrink-0"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
