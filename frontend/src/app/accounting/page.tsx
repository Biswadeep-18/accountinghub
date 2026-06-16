"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  BookOpen, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeftRight, 
  FileText, 
  RefreshCcw, 
  DollarSign, 
  Scale, 
  ChevronLeft 
} from "lucide-react";
import Link from "next/link";
import { askJournalDraft, JournalEntryLine } from "@/lib/api";

// Core Accounting Definitions
interface Account {
  name: string;
  category: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  startingBalance: number;
}

interface JournalEntry {
  id: string;
  date: string;
  narration: string;
  lines: JournalEntryLine[];
}

const DEFAULT_ACCOUNTS: Account[] = [
  // Assets
  { name: "Cash", category: "Asset", startingBalance: 10000.0 },
  { name: "Accounts Receivable", category: "Asset", startingBalance: 2500.0 },
  { name: "Inventory", category: "Asset", startingBalance: 3000.0 },
  { name: "Equipment", category: "Asset", startingBalance: 5000.0 },
  { name: "Prepaid Rent", category: "Asset", startingBalance: 0.0 },
  
  // Liabilities
  { name: "Accounts Payable", category: "Liability", startingBalance: 1200.0 },
  { name: "Bank Loan", category: "Liability", startingBalance: 4000.0 },
  
  // Equity
  { name: "Capital / Owner's Equity", category: "Equity", startingBalance: 15300.0 },
  
  // Revenues
  { name: "Service Revenue", category: "Revenue", startingBalance: 0.0 },
  
  // Expenses
  { name: "Rent Expense", category: "Expense", startingBalance: 0.0 },
  { name: "Salaries Expense", category: "Expense", startingBalance: 0.0 },
  { name: "Utilities Expense", category: "Expense", startingBalance: 0.0 },
];

const INITIAL_JOURNALS: JournalEntry[] = [
  {
    id: "tx-1",
    date: "2026-05-01",
    narration: "Owner's initial capital contribution in cash",
    lines: [
      { account: "Cash", type: "debit", amount: 10000.0 },
      { account: "Capital / Owner's Equity", type: "credit", amount: 10000.0 }
    ]
  },
  {
    id: "tx-2",
    date: "2026-05-05",
    narration: "Purchased equipment on account",
    lines: [
      { account: "Equipment", type: "debit", amount: 5000.0 },
      { account: "Accounts Payable", type: "credit", amount: 5000.0 }
    ]
  },
  {
    id: "tx-3",
    date: "2026-05-10",
    narration: "Received cash for services rendered",
    lines: [
      { account: "Cash", type: "debit", amount: 3500.0 },
      { account: "Service Revenue", type: "credit", amount: 3500.0 }
    ]
  }
];

export default function AccountingWorkspace() {
  const [activeTab, setActiveTab] = useState<"journal" | "ledger" | "trial" | "statements">("journal");
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [journals, setJournals] = useState<JournalEntry[]>(INITIAL_JOURNALS);

  // Manual Journal Entry Form State
  const [manualDate, setManualDate] = useState("2026-05-18");
  const [manualNarration, setManualNarration] = useState("");
  const [manualLines, setManualLines] = useState<JournalEntryLine[]>([
    { account: "Cash", type: "debit", amount: 0.0 },
    { account: "Service Revenue", type: "credit", amount: 0.0 }
  ]);
  const [manualError, setManualError] = useState("");

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState<{
    narration: string;
    entries: JournalEntryLine[];
    explanation: string;
  } | null>(null);

  // Ledger Account Selector State
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState("Cash");

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Add line to manual form
  const addManualLine = () => {
    setManualLines([...manualLines, { account: "Cash", type: "debit", amount: 0.0 }]);
  };

  // Remove line from manual form
  const removeManualLine = (index: number) => {
    if (manualLines.length <= 2) return;
    setManualLines(manualLines.filter((_, idx) => idx !== index));
  };

  // Handle line change
  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: any) => {
    const updated = [...manualLines];
    if (field === "amount") {
      updated[index][field] = parseFloat(value) || 0.0;
    } else {
      updated[index][field] = value;
    }
    setManualLines(updated);
  };

  // Post manual journal entry
  const postManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");

    const totalDebits = manualLines
      .filter(l => l.type === "debit")
      .reduce((sum, l) => sum + l.amount, 0);

    const totalCredits = manualLines
      .filter(l => l.type === "credit")
      .reduce((sum, l) => sum + l.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      setManualError(`Double-Entry Out of Balance: Total Debits ($${totalDebits.toFixed(2)}) must equal Total Credits ($${totalCredits.toFixed(2)}). Difference: $${Math.abs(totalDebits - totalCredits).toFixed(2)}`);
      return;
    }

    if (totalDebits <= 0) {
      setManualError("Amounts must be greater than zero.");
      return;
    }

    if (!manualNarration.trim()) {
      setManualError("Please provide a narration/description.");
      return;
    }

    const newEntry: JournalEntry = {
      id: `manual-${Date.now()}`,
      date: manualDate,
      narration: manualNarration,
      lines: [...manualLines]
    };

    setJournals([newEntry, ...journals]);
    setManualNarration("");
    setManualLines([
      { account: "Cash", type: "debit", amount: 0.0 },
      { account: "Service Revenue", type: "credit", amount: 0.0 }
    ]);
    showNotification("Journal entry successfully posted to General Ledger!");
  };

  // Request AI Draft
  const getAIDraft = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiDraft(null);
    try {
      const draft = await askJournalDraft(aiPrompt);
      setAiDraft(draft);
    } catch (err) {
      showNotification("Error connecting to AI Accounting Engine.");
    } finally {
      setAiLoading(false);
    }
  };

  // Post AI Draft
  const postAIDraft = () => {
    if (!aiDraft) return;

    const newEntry: JournalEntry = {
      id: `ai-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      narration: aiDraft.narration,
      lines: aiDraft.entries
    };

    setJournals([newEntry, ...journals]);
    setAiDraft(null);
    setAiPrompt("");
    showNotification("AI transaction analyzed and posted to General Ledger!");
  };

  // Calculate Balance for any Account
  const calculateAccountBalance = (accountName: string): number => {
    const acc = accounts.find(a => a.name === accountName);
    if (!acc) return 0;

    let balance = acc.startingBalance;

    // Standard accounting rules for debit vs credit increases
    const isDebitIncrease = acc.category === "Asset" || acc.category === "Expense";

    journals.forEach(j => {
      j.lines.forEach(l => {
        if (l.account === accountName) {
          if (l.type === "debit") {
            balance += isDebitIncrease ? l.amount : -l.amount;
          } else {
            balance += isDebitIncrease ? -l.amount : l.amount;
          }
        }
      });
    });

    return balance;
  };

  // Get all ledger lines for an account
  const getLedgerPostings = (accountName: string) => {
    const postings: { date: string; narration: string; debit: number; credit: number; running: number }[] = [];
    const acc = accounts.find(a => a.name === accountName);
    if (!acc) return [];

    const isDebitIncrease = acc.category === "Asset" || acc.category === "Expense";
    let running = acc.startingBalance;

    // Start with starting balance
    postings.push({
      date: "2026-05-01",
      narration: "Starting/Opening Balance",
      debit: isDebitIncrease && acc.startingBalance > 0 ? acc.startingBalance : 0,
      credit: !isDebitIncrease && acc.startingBalance > 0 ? acc.startingBalance : 0,
      running: running
    });

    // Process from oldest to newest journals
    [...journals].reverse().forEach(j => {
      j.lines.forEach(l => {
        if (l.account === accountName) {
          const debit = l.type === "debit" ? l.amount : 0;
          const credit = l.type === "credit" ? l.amount : 0;
          
          if (l.type === "debit") {
            running += isDebitIncrease ? l.amount : -l.amount;
          } else {
            running += isDebitIncrease ? -l.amount : l.amount;
          }

          postings.push({
            date: j.date,
            narration: j.narration,
            debit,
            credit,
            running
          });
        }
      });
    });

    return postings;
  };

  // Compile Trial Balance
  const compileTrialBalance = () => {
    let totalDebits = 0;
    let totalCredits = 0;

    const rows = accounts.map(acc => {
      const balance = calculateAccountBalance(acc.name);
      const isDebitIncrease = acc.category === "Asset" || acc.category === "Expense";
      
      let debit = 0;
      let credit = 0;

      if (balance >= 0) {
        if (isDebitIncrease) debit = balance;
        else credit = balance;
      } else {
        if (isDebitIncrease) credit = Math.abs(balance);
        else debit = Math.abs(balance);
      }

      totalDebits += debit;
      totalCredits += credit;

      return {
        name: acc.name,
        category: acc.category,
        debit,
        credit
      };
    });

    return { rows, totalDebits, totalCredits };
  };

  // Financial Statement calculations
  const compileProfitAndLoss = () => {
    const revenueAccounts = accounts.filter(a => a.category === "Revenue");
    const expenseAccounts = accounts.filter(a => a.category === "Expense");

    const revenues = revenueAccounts.map(a => ({ name: a.name, amount: calculateAccountBalance(a.name) }));
    const expenses = expenseAccounts.map(a => ({ name: a.name, amount: calculateAccountBalance(a.name) }));

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return { revenues, expenses, totalRevenue, totalExpenses, netIncome };
  };

  const compileBalanceSheet = (netIncome: number) => {
    const assetAccounts = accounts.filter(a => a.category === "Asset");
    const liabilityAccounts = accounts.filter(a => a.category === "Liability");
    const equityAccounts = accounts.filter(a => a.category === "Equity");

    const assets = assetAccounts.map(a => ({ name: a.name, amount: calculateAccountBalance(a.name) }));
    const liabilities = liabilityAccounts.map(a => ({ name: a.name, amount: calculateAccountBalance(a.name) }));
    
    // Capital + Net income for closing Equity
    const closingCapital = equityAccounts.reduce((sum, e) => sum + calculateAccountBalance(e.name), 0) + netIncome;

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = closingCapital;

    return { assets, liabilities, closingCapital, totalAssets, totalLiabilities, totalEquity };
  };

  const trial = compileTrialBalance();
  const pl = compileProfitAndLoss();
  const bs = compileBalanceSheet(pl.netIncome);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50"
          >
            <CheckCircle2 className="text-emerald-400" size={20} />
            <span className="font-medium text-sm">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ChevronLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Calculator size={22} />
              </div>
              Accounting Ledger Workspace
            </h1>
            <p className="text-slate-500 text-sm mt-1">Double-Entry Accounting & AI Ledger (Tally AI Engine)</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start">
            <button 
              onClick={() => setActiveTab("journal")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === "journal" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Plus size={16} className="inline mr-1" /> Journal Entry
            </button>
            <button 
              onClick={() => setActiveTab("ledger")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === "ledger" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <BookOpen size={16} className="inline mr-1" /> Ledger Book
            </button>
            <button 
              onClick={() => setActiveTab("trial")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === "trial" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Scale size={16} className="inline mr-1" /> Trial Balance
            </button>
            <button 
              onClick={() => setActiveTab("statements")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === "statements" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <FileText size={16} className="inline mr-1" /> Financials
            </button>
          </div>
        </header>

        {/* Outer Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main workspace section (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. JOURNAL TAB */}
            {activeTab === "journal" && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
              >
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">New Journal Entry</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Post a balanced double-entry transaction to your ledger book.</p>
                </div>

                <form onSubmit={postManualEntry} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Posting Date</label>
                      <input 
                        type="date"
                        value={manualDate}
                        onChange={e => setManualDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Narration / Description</label>
                      <input 
                        type="text"
                        placeholder="e.g. Paid monthly workspace internet bill"
                        value={manualNarration}
                        onChange={e => setManualNarration(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Debit & Credit Line Items</span>
                      <button 
                        type="button" 
                        onClick={addManualLine}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} /> Add Line Item
                      </button>
                    </div>

                    {manualLines.map((line, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <select 
                          value={line.account}
                          onChange={e => handleLineChange(idx, "account", e.target.value)}
                          className="flex-1 min-w-[180px] border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
                        >
                          {accounts.map(acc => (
                            <option key={acc.name} value={acc.name} className="text-slate-800 bg-white">{acc.name} ({acc.category})</option>
                          ))}
                        </select>

                        <select 
                          value={line.type}
                          onChange={e => handleLineChange(idx, "type", e.target.value)}
                          className="w-24 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium text-slate-700"
                        >
                          <option value="debit" className="text-slate-800 bg-white">Dr (Debit)</option>
                          <option value="credit" className="text-slate-800 bg-white">Cr (Credit)</option>
                        </select>

                        <div className="relative w-36">
                          <DollarSign size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input 
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={line.amount || ""}
                            onChange={e => handleLineChange(idx, "amount", e.target.value)}
                            className="w-full border border-slate-300 rounded-xl pl-8 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-slate-800"
                          />
                        </div>

                        <button 
                          type="button"
                          onClick={() => removeManualLine(idx)}
                          className={`text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-lg ${manualLines.length <= 2 ? "opacity-30 cursor-not-allowed" : ""}`}
                          disabled={manualLines.length <= 2}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {manualError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-xs font-medium leading-relaxed">
                      {manualError}
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>Total Debits: <span className="font-bold text-slate-800">${manualLines.filter(l => l.type === "debit").reduce((s, l) => s + l.amount, 0).toFixed(2)}</span></div>
                      <div>Total Credits: <span className="font-bold text-slate-800">${manualLines.filter(l => l.type === "credit").reduce((s, l) => s + l.amount, 0).toFixed(2)}</span></div>
                    </div>

                    <button 
                      type="submit"
                      className="bg-indigo-600 text-white rounded-xl py-2.5 px-6 font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
                    >
                      <Plus size={16} /> Post Journal Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. LEDGER TAB */}
            {activeTab === "ledger" && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
              >
                <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Ledger Book Account</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Filter by account to audit individual posting lines.</p>
                  </div>

                  <select 
                    value={selectedLedgerAccount}
                    onChange={e => setSelectedLedgerAccount(e.target.value)}
                    className="border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold text-slate-800"
                  >
                    {accounts.map(acc => (
                      <option key={acc.name} value={acc.name}>{acc.name} ({acc.category})</option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Narration / Description</th>
                        <th className="pb-3 text-right">Debit (Dr)</th>
                        <th className="pb-3 text-right">Credit (Cr)</th>
                        <th className="pb-3 text-right pr-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getLedgerPostings(selectedLedgerAccount).map((post, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pl-2 font-mono text-xs text-slate-500">{post.date}</td>
                          <td className="py-3.5 font-medium text-slate-700">{post.narration}</td>
                          <td className="py-3.5 text-right font-mono text-rose-600 font-semibold">
                            {post.debit > 0 ? `$${post.debit.toFixed(2)}` : "-"}
                          </td>
                          <td className="py-3.5 text-right font-mono text-emerald-600 font-semibold">
                            {post.credit > 0 ? `$${post.credit.toFixed(2)}` : "-"}
                          </td>
                          <td className="py-3.5 text-right font-mono text-slate-900 font-bold pr-2">
                            ${post.running.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* 3. TRIAL BALANCE TAB */}
            {activeTab === "trial" && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
              >
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Trial Balance</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Audit summary of all net Debit/Credit account balances.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Account Title</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3 text-right">Debit (Dr)</th>
                        <th className="pb-3 text-right pr-2">Credit (Cr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trial.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pl-2 font-semibold text-slate-800">{row.name}</td>
                          <td className="py-3.5 text-slate-500 text-xs font-medium">{row.category}</td>
                          <td className="py-3.5 text-right font-mono text-slate-700">
                            {row.debit > 0 ? `$${row.debit.toFixed(2)}` : "-"}
                          </td>
                          <td className="py-3.5 text-right font-mono text-slate-700 pr-2">
                            {row.credit > 0 ? `$${row.credit.toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td className="py-4 pl-4 text-slate-900" colSpan={2}>Total Trial Balance</td>
                        <td className="py-4 text-right font-mono text-indigo-700 text-[15px]">${trial.totalDebits.toFixed(2)}</td>
                        <td className="py-4 text-right font-mono text-indigo-700 text-[15px] pr-4">${trial.totalCredits.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {Math.abs(trial.totalDebits - trial.totalCredits) < 0.01 ? (
                  <div className="mt-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-3 rounded-2xl text-xs flex items-center gap-2.5 font-medium">
                    <CheckCircle2 size={16} /> Ledgers balanced successfully! Total debits equal total credits.
                  </div>
                ) : (
                  <div className="mt-6 bg-rose-50 border border-rose-100 text-rose-700 px-5 py-3 rounded-2xl text-xs flex items-center gap-2.5 font-medium">
                    Warning: Double-entry system is out of balance. Check manual journal postings.
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. FINANCIAL STATEMENTS TAB */}
            {activeTab === "statements" && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                {/* Income Statement */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Profit & Loss (Income Statement)</h2>
                    <p className="text-slate-500 text-xs mt-0.5">For the period ending May 18, 2026</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Operating Revenue</h3>
                      {pl.revenues.map((r, idx) => (
                        <div key={idx} className="flex justify-between py-2 text-sm pl-2">
                          <span className="text-slate-700 font-medium">{r.name}</span>
                          <span className="font-mono text-slate-800">${r.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2.5 border-t border-slate-100 font-bold text-sm bg-slate-50/50 px-2 rounded-xl mt-2">
                        <span className="text-slate-900">Total Revenue</span>
                        <span className="font-mono">${pl.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Operating Expenses</h3>
                      {pl.expenses.map((e, idx) => (
                        <div key={idx} className="flex justify-between py-2 text-sm pl-2">
                          <span className="text-slate-700 font-medium">{e.name}</span>
                          <span className="font-mono text-slate-800">${e.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2.5 border-t border-slate-100 font-bold text-sm bg-slate-50/50 px-2 rounded-xl mt-2">
                        <span className="text-slate-900">Total Operating Expenses</span>
                        <span className="font-mono">${pl.totalExpenses.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className={`flex justify-between p-4 rounded-2xl font-extrabold text-[16px] border ${pl.netIncome >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"}`}>
                      <span>Net Income / (Loss)</span>
                      <span className="font-mono">${pl.netIncome.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Balance Sheet */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Balance Sheet</h2>
                    <p className="text-slate-500 text-xs mt-0.5">As of May 18, 2026</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Assets */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Assets</h3>
                        {bs.assets.map((a, idx) => (
                          <div key={idx} className="flex justify-between py-2 text-sm pl-2">
                            <span className="text-slate-700 font-medium">{a.name}</span>
                            <span className="font-mono text-slate-800">${a.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between py-3 border-t-2 border-slate-200 font-extrabold text-sm bg-slate-100/50 px-3 rounded-xl">
                        <span className="text-slate-900">Total Assets</span>
                        <span className="font-mono text-indigo-700">${bs.totalAssets.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Right: Liabilities & Equity */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Liabilities</h3>
                        {bs.liabilities.map((l, idx) => (
                          <div key={idx} className="flex justify-between py-2 text-sm pl-2">
                            <span className="text-slate-700 font-medium">{l.name}</span>
                            <span className="font-mono text-slate-800">${l.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Equity</h3>
                        <div className="flex justify-between py-2 text-sm pl-2">
                          <span className="text-slate-700 font-medium">Owner's Closing Capital</span>
                          <span className="font-mono text-slate-800">${bs.closingCapital.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between py-3 border-t-2 border-slate-200 font-extrabold text-sm bg-slate-100/50 px-3 rounded-xl">
                        <span className="text-slate-900">Total Liabilities & Equity</span>
                        <span className="font-mono text-indigo-700">${(bs.totalLiabilities + bs.totalEquity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {Math.abs(bs.totalAssets - (bs.totalLiabilities + bs.totalEquity)) < 0.01 ? (
                    <div className="mt-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-3 rounded-2xl text-xs flex items-center gap-2.5 font-medium">
                      <Scale size={16} /> Balance Sheet Balanced! Assets (${bs.totalAssets.toFixed(2)}) = Liabilities & Equity (${(bs.totalLiabilities + bs.totalEquity).toFixed(2)}).
                    </div>
                  ) : (
                    <div className="mt-6 bg-rose-50 border border-rose-100 text-rose-700 px-5 py-3 rounded-2xl text-xs flex items-center gap-2.5 font-medium">
                      Balance Sheet out of balance. Verify all entries.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Journal History Log */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-slate-900 text-base">Journal History Log</h3>
                <p className="text-slate-500 text-xs mt-0.5">Chronological record of double-entry ledger postings.</p>
              </div>

              <div className="space-y-4">
                {journals.map((j) => (
                  <div key={j.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{j.narration}</span>
                        <span className="block text-[11px] text-slate-400 font-mono mt-0.5">ID: {j.id}</span>
                      </div>
                      <span className="font-mono text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">{j.date}</span>
                    </div>

                    <div className="space-y-2 border-t border-slate-100/70 pt-2.5">
                      {j.lines.map((line, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${line.type === "debit" ? "text-slate-800 pl-2" : "text-slate-500 pl-8"}`}>
                            {line.type === "debit" ? line.account : `To ${line.account}`}
                          </span>
                          <span className="font-mono font-bold">
                            {line.type === "debit" ? (
                              <span className="text-rose-600">${line.amount.toFixed(2)} (Dr)</span>
                            ) : (
                              <span className="text-emerald-600">${line.amount.toFixed(2)} (Cr)</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI Assistant Sidebar Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">AI Accountant Assistant</h2>
                    <p className="text-[10px] text-indigo-200">Convert plain text to Double-Entry Journals</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-indigo-100 font-light leading-relaxed">
                  <p>Type any real-world business transaction or scenario in plain English. The AI Ledger Agent will automatically resolve accounts, calculate debits/credits, and balance them!</p>
                </div>

                <div className="space-y-2">
                  <textarea 
                    rows={3}
                    placeholder="e.g. Received $4,200 cash from Acme Corp for consulting service..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs placeholder-indigo-300/50 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/10 transition-all resize-none text-white leading-relaxed"
                  />
                  <button 
                    onClick={getAIDraft}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-3 px-4 font-semibold text-xs transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCcw size={14} className="animate-spin" /> Analyzing transaction...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Analyze & Draft Entry
                      </>
                    )}
                  </button>
                </div>

                {/* AI Draft Response Card */}
                {aiDraft && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-indigo-200 space-y-4"
                  >
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">AI Draft Transaction</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{aiDraft.narration}</h4>
                    </div>

                    <div className="space-y-2">
                      {aiDraft.entries.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${entry.type === "debit" ? "text-slate-800" : "text-slate-500 pl-4"}`}>
                            {entry.type === "debit" ? entry.account : `To ${entry.account}`}
                          </span>
                          <span className={`font-mono font-bold ${entry.type === "debit" ? "text-rose-600" : "text-emerald-600"}`}>
                            ${entry.amount.toFixed(2)} {entry.type === "debit" ? "(Dr)" : "(Cr)"}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 italic leading-relaxed">
                      <strong>Logic:</strong> {aiDraft.explanation}
                    </div>

                    <button 
                      onClick={postAIDraft}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 px-4 font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Post to General Ledger
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Charts of Accounts Quick Reference */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Chart of Accounts</h3>
                <p className="text-slate-500 text-xs mt-0.5">Quick reference of accounts and current balances.</p>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const balance = calculateAccountBalance(acc.name);
                  return (
                    <div key={acc.name} className="flex justify-between items-center text-xs py-2 border-b border-slate-100 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                      <div>
                        <span className="font-semibold text-slate-800">{acc.name}</span>
                        <span className="block text-[10px] text-slate-400">{acc.category}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">
                        ${balance.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
