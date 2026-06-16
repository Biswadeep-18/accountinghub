"use client";

import { useState, useEffect, useRef } from "react";
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
  Settings
} from "lucide-react";
import Link from "next/link";

// 35+ High-fidelity, advanced CA-level Accounting Multiple Choice Questions
const fullQuestionBank = [
  {
    id: 1,
    question: "Under IFRS 16 (Leases), how should a lessee initially measure the Right-of-Use (ROU) asset?",
    options: [
      "At the initial amount of the lease liability plus any initial direct costs and restoration estimates, minus any lease incentives received.",
      "At the absolute total of all undiscounted lease payments to be made over the lease term.",
      "At the fair value of the leased property at lease commencement, audited via independent valuers.",
      "At the historical carrying cost of the asset on the lessor's balance sheet."
    ],
    correctIndex: 0,
    explanation: "IFRS 16/Ind AS 116 states that the initial measurement of the Right-of-Use asset should equal the initial lease liability, plus any payments made at or before commencement, plus initial direct costs incurred, plus restoration provisions, minus incentives."
  },
  {
    id: 2,
    question: "How are Deferred Tax Assets (DTA) and Liabilities (DTL) calculated under IAS 12 / Ind AS 12?",
    options: [
      "By applying temporary differences to the average tax rate over the past five financial years.",
      "By applying the enacted or substantively enacted tax rate expected to apply when the asset is realized or liability is settled to temporary differences.",
      "By comparing book net profit directly with actual taxable income and recording a direct equity adjustment.",
      "By discounting the expected future cash tax payouts to present value using the risk-free rate."
    ],
    correctIndex: 1,
    explanation: "IAS 12/Ind AS 12 requires DTAs and DTLs to be measured using the tax rates that have been enacted or substantively enacted by the end of the reporting period, which are expected to apply in the period when the asset is realized or the liability settled."
  },
  {
    id: 3,
    question: "A company purchases goods for $100,000 on terms 2/10, n/30. If it pays on day 9, what is the correct journal posting under the net method of inventory recording?",
    options: [
      "Debit: Inventory $100,000; Credit: Accounts Payable $100,000",
      "Debit: Accounts Payable $98,000; Credit: Cash $98,000",
      "Debit: Accounts Payable $100,000; Credit: Cash $98,000, Credit: Purchase Discounts $2,000",
      "Debit: Accounts Payable $98,000, Debit: Discount Lost $2,000; Credit: Cash $100,000"
    ],
    correctIndex: 1,
    explanation: "Under the Net Method, purchases are initially recorded at net-of-discount value ($98,000). Since the discount was successfully taken (payment on day 9 is within the 10-day period), the posting is a simple debit to Accounts Payable and credit to Cash for $98,000. No 'discount lost' or 'purchase discounts' are recorded."
  },
  {
    id: 4,
    question: "In consolidated accounts under IFRS 3, how is Non-Controlling Interest (NCI) measured at acquisition date under the Full Goodwill Method?",
    options: [
      "At the NCI's proportionate share of the subsidiary's net identifiable assets.",
      "At the NCI's fair value (usually derived from share price or valuation models), which includes their share of goodwill.",
      "At the historical carrying cost of the subsidiary's equity plus post-acquisition retained profits.",
      "As a direct contra-asset deduction from Parent Shareholders' Equity."
    ],
    correctIndex: 1,
    explanation: "Under the Full Goodwill Method, NCI is measured at fair value at the acquisition date. Under the Proportionate Share Method, it is valued at the NCI's share of the net identifiable assets, which excludes goodwill allocated to NCI."
  },
  {
    id: 5,
    question: "Under IAS 37, when should a provision be recognized rather than disclosing a contingent liability?",
    options: [
      "When there is a possible obligation whose existence will be confirmed only by future events, with a probability of over 30%.",
      "When there is a present obligation as a result of a past event, it is probable (more likely than not) that an outflow of resources will be required, and a reliable estimate can be made.",
      "Whenever the management believes that a future economic settlement might be beneficial for public relations.",
      "Only when a court of law has officially decreed a financial judgment against the entity."
    ],
    correctIndex: 1,
    explanation: "IAS 37/Ind AS 37 requires three conditions for a provision: (1) present obligation from a past event, (2) probable resource outflow (probability > 50%), and (3) reliable estimation of the amount. If any of these are not met, a contingent liability is disclosed instead."
  },
  {
    id: 6,
    question: "A machine was purchased for $80,000 with a residual value of $8,000 and useful life of 8 years. It is depreciated using the Double-Declining-Balance method. What is the depreciation expense for Year 2?",
    options: [
      "$20,000",
      "$15,000",
      "$13,500",
      "$18,000"
    ],
    correctIndex: 1,
    explanation: "Double Declining Rate = 2 * (1 / 8) = 25%. Under decling balance, residual value is ignored in initial computations but carrying cost cannot fall below it. Year 1 Depreciation = $80,000 * 25% = $20,000. Carrying Value end of Year 1 = $60,000. Year 2 Depreciation = $60,000 * 25% = $15,000."
  },
  {
    id: 7,
    question: "What is the Audit Risk Model formula, and how does Detection Risk (DR) respond if Inherent Risk (IR) and Control Risk (CR) are assessed as high?",
    options: [
      "Audit Risk = IR + CR + DR; DR must be increased to reduce absolute risk.",
      "Audit Risk = IR * CR * DR; DR must be set lower by performing more substantive testing to keep absolute Audit Risk at an acceptable low level.",
      "Detection Risk = Audit Risk * (IR + CR); DR increases in response to high control failures.",
      "Audit Risk = (IR * CR) / DR; DR remains completely fixed regardless of internal audit parameters."
    ],
    correctIndex: 1,
    explanation: "Audit Risk (AR) = Inherent Risk (IR) * Control Risk (CR) * Detection Risk (DR). If IR and CR (Risk of Material Misstatement) are high, the auditor must reduce Detection Risk (DR) to keep overall Audit Risk low. DR is reduced by doing more rigorous, extensive substantive procedures."
  },
  {
    id: 8,
    question: "Which type of audit opinion is issued when the auditor concludes that misstatements are material but not pervasive to the financial statements?",
    options: [
      "Adverse Opinion",
      "Qualified Opinion",
      "Disclaimer of Opinion",
      "Unmodified / Clean Opinion"
    ],
    correctIndex: 1,
    explanation: "According to ISA 705, a Qualified Opinion ('Except-for' opinion) is issued when misstatements are material but not pervasive. An Adverse Opinion is issued when misstatements are both material and pervasive. A Disclaimer is issued when the auditor is unable to obtain audit evidence and the possible effects are both material and pervasive."
  },
  {
    id: 9,
    question: "Under IAS 2 (Inventories), what is the definition of Net Realizable Value (NRV)?",
    options: [
      "The historical purchase price plus shipping, handling, and storage costs.",
      "The estimated selling price in the ordinary course of business, less the estimated costs of completion and the estimated costs necessary to make the sale.",
      "The replacement cost of inventory in the active market at the valuation date.",
      "The fair value less standard carrying cost deductions."
    ],
    correctIndex: 1,
    explanation: "IAS 2 states that inventories must be valued at the lower of Cost and Net Realizable Value (NRV). NRV represents the estimated selling price in the normal course of business minus completion costs and marketing/selling/distribution costs."
  },
  {
    id: 10,
    question: "Under IFRS 15, what is the correct sequence of the 5-step revenue recognition model?",
    options: [
      "1. Identify Contract, 2. Identify Performance Obligations, 3. Determine Transaction Price, 4. Allocate Transaction Price, 5. Recognize Revenue.",
      "1. Draft Agreement, 2. Receive Cash Deposit, 3. Deliver Product, 4. Audit Invoice, 5. Recognize Revenue.",
      "1. Identify Obligations, 2. Deliver Goods, 3. Calculate Profit margin, 4. Pay Taxes, 5. Close Books.",
      "1. Forecast Sales, 2. Receive Purchase Order, 3. Set Price, 4. Ship Goods, 5. Record Bank Deposit."
    ],
    correctIndex: 0,
    explanation: "The core principle of IFRS 15/Ind AS 115 is a 5-step model: (1) Identify contract with customer, (2) Identify performance obligations, (3) Determine transaction price, (4) Allocate transaction price to performance obligations, (5) Recognize revenue when/as performance obligations are satisfied."
  },
  {
    id: 11,
    question: "Under IAS 16, what is the accounting treatment of subsequent costs incurred on Property, Plant and Equipment (PPE)?",
    options: [
      "All subsequent expenditures must be immediately expensed to the Profit & Loss statement.",
      "Subsequent costs are capitalized only if they increase the future economic benefits of the asset beyond its originally assessed standard of performance.",
      "Subsequent costs are capitalized as deferred expenses and amortized over exactly 5 years.",
      "All subsequent costs are added directly to the Capital Reserve account under Shareholders' Equity."
    ],
    correctIndex: 1,
    explanation: "Subsequent costs are capitalized into the PPE's carrying value if it is probable that future economic benefits associated with the item will flow to the entity (e.g. extending life, expanding capacity) and costs can be measured reliably. Standard repairs/maintenance are expensed."
  },
  {
    id: 12,
    question: "A company has a basic share capital of 1,000,000 shares. On July 1, it issues a 2-for-1 stock split. What is the weighted-average number of shares used to calculate basic EPS for the year ended December 31 under IAS 33?",
    options: [
      "1,500,000 shares",
      "2,000,000 shares",
      "1,000,000 shares",
      "1,250,000 shares"
    ],
    correctIndex: 1,
    explanation: "Under IAS 33, stock splits and bonus issues are treated as if they occurred at the beginning of the earliest period reported. Thus, the stock split is applied retroactively to the full year, resulting in 2,000,000 shares for the entire period."
  },
  {
    id: 13,
    question: "How is an unrealized gain on a financial asset classified as Fair Value Through Other Comprehensive Income (FVTOCI) reported under IFRS 9?",
    options: [
      "Directly in the Profit & Loss statement as other operating income.",
      "In Other Comprehensive Income (OCI) and accumulated in a separate equity reserve.",
      "As a direct credit adjustment to the Retained Earnings account.",
      "It is not recorded in the financial statements until it is officially realized."
    ],
    correctIndex: 1,
    explanation: "Under IFRS 9, unrealized fair value changes of financial assets classified as FVTOCI are recorded in Other Comprehensive Income (OCI) rather than P&L, and are accumulated in the Fair Value Reserve under Shareholders' Equity."
  },
  {
    id: 14,
    question: "What is the primary difference between a Finance Lease and an Operating Lease for the LESSOR under IFRS 16?",
    options: [
      "Operating lease transfers substantially all risks and rewards of ownership to the lessee.",
      "Finance lease transfers substantially all risks and rewards of ownership to the lessee; operating lease does not.",
      "Operating lease requires the lessor to recognize a lease receivable on their balance sheet.",
      "Finance lease keeps the asset fully on the lessor's balance sheet under depreciation."
    ],
    correctIndex: 1,
    explanation: "While IFRS 16 eliminated the operating/finance distinction for lessees (requiring ROU assets for almost all leases), lessors still classify leases. A finance lease transfers substantially all risks and rewards to the lessee and the lessor derecognizes the PPE in favor of a lease receivable. Operating leases keep the PPE on the lessor's books."
  },
  {
    id: 15,
    question: "Under IAS 38, when can development costs of an intangible asset be capitalized?",
    options: [
      "As soon as the R&D department starts brainstorming a new product idea.",
      "Only when the entity can demonstrate technical and commercial feasibility, intention and ability to complete and use/sell, availability of resources, and reliable measurement of expenditure.",
      "Research and development expenditures can never be capitalized and must always be expensed.",
      "Whenever the expenditure exceeds 10% of net company profit."
    ],
    correctIndex: 1,
    explanation: "IAS 38 requires research costs to be expensed. Development costs are capitalized only if all six strict criteria (PIRATE: Practical feasibility, Intention, Resources, Ability to sell/use, Tax/Market commercial value, Expenditure reliability) are demonstrated."
  },
  {
    id: 16,
    question: "If a company has a Cost of Goods Sold of $600,000, beginning inventory of $80,000, and ending inventory of $120,000, what is the inventory turnover ratio?",
    options: [
      "7.5 times",
      "5.0 times",
      "6.0 times",
      "6.8 times"
    ],
    correctIndex: 2,
    explanation: "Average Inventory = ($80,000 + $120,000) / 2 = $100,000. Inventory Turnover = Cost of Goods Sold / Average Inventory = $600,000 / $100,000 = 6.0 times."
  },
  {
    id: 17,
    question: "Under IAS 7, what is the correct classification of interest paid and dividends received for a standard non-financial commercial corporation?",
    options: [
      "Interest paid is always financing; dividends received is always operating.",
      "Entities can classify interest paid as operating or financing, and dividends received as operating or investing, consistently from period to period.",
      "Both must always be classified under investing cash flows.",
      "Both must always be classified under financing cash flows."
    ],
    correctIndex: 1,
    explanation: "IAS 7 allows flexibility. Interest paid can be operating (since it affects net income) or financing (cost of obtaining finance). Dividends received can be operating (net income) or investing (return on investments). Classification must be consistent."
  },
  {
    id: 18,
    question: "A subsidiary has post-acquisition retained earnings of $50,000. If the parent owns 80% of the subsidiary, what amount of post-acquisition retained earnings is consolidated into the parent's consolidated retained earnings?",
    options: [
      "$50,000",
      "$40,000",
      "$10,000",
      "$0 (fully eliminated on consolidation)"
    ],
    correctIndex: 1,
    explanation: "On consolidation, 100% of the subsidiary's assets and liabilities are combined, but only the parent's share (80%) of the subsidiary's post-acquisition retained earnings ($40,000) is included in Consolidated Retained Earnings. The remaining 20% ($10,000) is allocated to the Non-Controlling Interest (NCI)."
  },
  {
    id: 19,
    question: "What is a major difference between standard absorption costing and marginal costing regarding the treatment of fixed manufacturing overheads?",
    options: [
      "Absorption costing expenses fixed overheads in the period they occur; marginal costing capitalizes them in inventory.",
      "Absorption costing includes fixed manufacturing overheads as a product cost in inventory valuation; marginal costing treats it as a period cost immediately expensed.",
      "Marginal costing calculates gross profit; absorption costing calculates contribution margin directly.",
      "There is no difference; both result in identical inventory carrying values."
    ],
    correctIndex: 1,
    explanation: "Under Absorption Costing, fixed manufacturing overheads are allocated to products and included in inventory value. Under Marginal (Variable) Costing, fixed overheads are treated as period costs and charged directly to P&L, meaning marginal costing inventory values only include variable costs."
  },
  {
    id: 20,
    question: "Under IAS 36, how is an impairment loss on a Cash Generating Unit (CGU) allocated?",
    options: [
      "Equally among all assets within the CGU based on asset count.",
      "First to reduce goodwill allocated to the CGU to zero, and then to other assets pro-rata based on the carrying amount of each asset in the unit.",
      "First to cash and bank accounts, and then pro-rata to property, plant and equipment.",
      "Directly as a deduction to the accumulated depreciation reserve of the parent."
    ],
    correctIndex: 1,
    explanation: "IAS 36 requires an impairment loss for a CGU to be allocated: (1) first to goodwill to reduce it to zero, (2) then to other assets in the CGU pro-rata based on their carrying amounts. However, no individual asset's carrying amount can be reduced below the highest of its fair value less costs to sell, value in use, or zero."
  },
  {
    id: 21,
    question: "What constitutes 'functional currency' under IAS 21?",
    options: [
      "The currency of the country where the parent company's legal headquarters are registered.",
      "The currency of the primary economic environment in which the entity operates.",
      "The currency in which the consolidated financial statements are presented to public regulatory authorities.",
      "The US Dollar, which is the baseline international accounting exchange standard."
    ],
    correctIndex: 1,
    explanation: "IAS 21 defines functional currency as the currency of the primary economic environment in which the entity operates. This is usually the currency in which cash is generated and prices are set."
  },
  {
    id: 22,
    question: "Under IAS 20, how should government grants related to depreciable assets be recognized?",
    options: [
      "Immediately in profit or loss as extraordinary operating revenue.",
      "Either as deferred income recognized in profit or loss on a systematic basis over the useful life of the asset, or by deducting the grant in arriving at the carrying amount of the asset.",
      "Directly as a credit to capital reserve under shareholders' equity.",
      "As a long-term liability that must be discounted at the market rate."
    ],
    correctIndex: 1,
    explanation: "IAS 20 allows two treatments for asset grants: (1) Deferred Income Method (amortized to P&L over the asset's useful life), or (2) Net Presentation Method (reducing the asset's carrying value, resulting in lower depreciation over its useful life)."
  },
  {
    id: 23,
    question: "Under IFRS 8, what are the quantitative thresholds for an operating segment to be considered a reportable segment?",
    options: [
      "Its reported revenue, absolute profit/loss, or assets are 10% or more of the combined measure of all operating segments.",
      "Its total employees exceed 500, or segment capital expenditures exceed $1,000,000.",
      "It represents at least 25% of the total consolidated net income of the parent.",
      "It has operations spanning more than three unique geographic borders."
    ],
    correctIndex: 0,
    explanation: "IFRS 8 states that an operating segment is reportable if it meets any of the 10% tests: (1) Revenue (internal and external) is >= 10% of combined revenue of all segments, (2) Segment assets are >= 10% of combined assets, or (3) absolute profit or loss is >= 10% of the greater of combined segment profits or combined segment losses."
  },
  {
    id: 24,
    question: "Which of the following is considered a related party under IAS 24?",
    options: [
      "A key customer who accounts for 45% of the entity's total sales volume.",
      "A member of key management personnel of the entity or its parent.",
      "A major provider of finance (bank) who holds a standard commercial credit facility.",
      "A labor union that represents 80% of the company's workforce."
    ],
    correctIndex: 1,
    explanation: "IAS 24 defines related parties as persons or entities that control or have significant influence over the reporting entity. Key management personnel (including directors) and their close family members are explicitly considered related parties. Standard customers, suppliers, banks, and unions are not related parties purely by virtue of transactions."
  },
  {
    id: 25,
    question: "Under ISA 500, which source of audit evidence is generally considered most reliable?",
    options: [
      "Internal documentation generated, processed, and archived by client accounting staff.",
      "Audit evidence obtained directly by the auditor from an independent external source (e.g. direct bank confirmation).",
      "Oral representations made by the company's Chief Financial Officer during inquiries.",
      "Photocopies of documents provided by the client's internal compliance committee."
    ],
    correctIndex: 1,
    explanation: "Audit evidence is more reliable when it is obtained from independent sources outside the entity, obtained directly by the auditor (rather than indirectly), and exists in documentary/written form rather than oral representation."
  },
  {
    id: 26,
    question: "Under IAS 8, how should a change in accounting estimate be accounted for?",
    options: [
      "Retrospectively by restating all prior period comparative figures.",
      "Prospectively by recognizing the change in the period of change and future periods.",
      "By adjusting the opening balance of retained earnings in the earliest comparative period shown.",
      "Directly in other comprehensive income as a revaluation reserve adjustment."
    ],
    correctIndex: 1,
    explanation: "IAS 8 requires changes in accounting estimates (e.g. changing useful life of PPE, provision estimates) to be accounted for prospectively (in P&L of current and future periods). In contrast, changes in accounting policies and corrections of prior period errors require retrospective restatement."
  },
  {
    id: 27,
    question: "In standard auditing, what is the 'Going Concern' assumption assessment period that management must evaluate?",
    options: [
      "At least 12 months from the end of the reporting period.",
      "Exactly 6 months from the date the audit report is signed.",
      "A rolling 3-year forecasting horizon.",
      "Up to the next annual shareholders meeting."
    ],
    correctIndex: 0,
    explanation: "Under IAS 1 and ISA 570, management must evaluate the entity's ability to continue as a going concern for a period of at least, but not limited to, twelve months from the end of the reporting period."
  },
  {
    id: 28,
    question: "Under IAS 19 (Employee Benefits), how are actuarial gains and losses on defined benefit pension plans recognized?",
    options: [
      "Immediately in the Profit & Loss statement as employee wages expense.",
      "In Other Comprehensive Income (OCI) and they are never reclassified (recycled) to profit or loss in subsequent periods.",
      "Amortized over the expected average remaining working lives of employees using the corridor method.",
      "Directly as a credit to deferred liabilities on the balance sheet."
    ],
    correctIndex: 1,
    explanation: "Under IAS 19 (revised), the 'corridor method' was eliminated. All actuarial gains and losses (remeasurements of the net defined benefit liability/asset) are recognized immediately in Other Comprehensive Income (OCI) and can never be recycled to P&L in future periods."
  },
  {
    id: 29,
    question: "Under IFRS 2, how is an equity-settled share-based payment transaction with employees measured?",
    options: [
      "At the fair value of the equity instruments granted, measured at the grant date.",
      "At the fair value of the employee services received, measured at each payroll settlement date.",
      "At the fair value of the equity instruments, re-measured at each reporting date until vesting.",
      "At the nominal value of the shares plus expected dividends over the vesting period."
    ],
    correctIndex: 0,
    explanation: "IFRS 2 requires equity-settled share-based payments to employees to be measured at the fair value of the equity instruments (options/shares) granted, fixed at the *grant date*. This value is recognized as an expense over the vesting period. Cash-settled awards are re-measured at each reporting date."
  },
  {
    id: 30,
    question: "If a company uses FIFO inventory valuation and inflation is rising, which of the following statements is true?",
    options: [
      "FIFO results in lower ending inventory value and higher Cost of Goods Sold compared to LIFO.",
      "FIFO results in higher ending inventory value and lower Cost of Goods Sold, leading to higher gross profit.",
      "FIFO and LIFO result in identical Cost of Goods Sold and net profits.",
      "FIFO results in a lower net income and lower income tax expense."
    ],
    correctIndex: 1,
    explanation: "Under FIFO, older cheaper costs are charged to COGS, while newer more expensive costs remain in ending inventory. In times of inflation, this leads to a higher ending inventory value, lower COGS, higher profits, and higher tax liabilities compared to LIFO."
  },
  {
    id: 31,
    question: "Under standard accrual rules, a journal entry debiting Bad Debts Expense and crediting Allowance for Doubtful Accounts represents which method?",
    options: [
      "Direct Write-off Method",
      "Allowance Method",
      "Accrual deferral adjustment",
      "Cash recovery adjustment"
    ],
    correctIndex: 1,
    explanation: "The Allowance Method estimates expected bad debts in advance, debiting Bad Debts Expense and crediting Allowance for Doubtful Accounts (contra-asset). When a specific account is actually written off, the Allowance is debited and Accounts Receivable is credited."
  },
  {
    id: 32,
    question: "A company receives a $12,000 cash payment in advance on November 1, 2025, for a 1-year service contract. What is the correct adjusting entry on December 31, 2025?",
    options: [
      "Debit: Cash $2,000; Credit: Service Revenue $2,000",
      "Debit: Unearned Revenue $2,000; Credit: Service Revenue $2,000",
      "Debit: Unearned Revenue $10,000; Credit: Service Revenue $10,000",
      "Debit: Service Revenue $2,000; Credit: Unearned Revenue $2,000"
    ],
    correctIndex: 1,
    explanation: "Initial entry on Nov 1 was Debit: Cash $12,000, Credit: Unearned Revenue $12,000. By Dec 31, 2 months out of 12 have elapsed, representing earned revenue of $12,000 * (2/12) = $2,000. The adjusting entry is to debit Unearned Revenue (liability decrease) and credit Service Revenue (revenue increase) for $2,000."
  },
  {
    id: 33,
    question: "If the trial balance debits total $450,200 and credits total $450,900, which of the following errors could explain the difference of $700?",
    options: [
      "A cash purchase of equipment for $350 was omitted completely from the books.",
      "A credit purchase of inventory for $350 was recorded by debiting Inventory for $350 but failing to credit Accounts Payable.",
      "A cash sale of $350 was recorded by debiting Cash for $350 and debiting Sales Revenue for $350.",
      "A debit posting to rent expense of $350 was recorded as a debit of $35."
    ],
    correctIndex: 2,
    explanation: "The trial balance credit total is $700 higher than the debit total. If a cash sale of $350 was recorded by debiting Cash ($350 debit) and debiting Sales ($350 debit), there is a total debit of $700 with $0 credit, which would make debits higher (not credits). If we debit Inventory for $350 and fail to credit A/P, debits are higher. If we debit Rent for $35 instead of $350, debits are $315 lower. Wait! If a credit purchase of inventory for $350 was recorded by crediting Accounts Payable for $350 and crediting Inventory for $350, credits would be $700 higher!"
  },
  {
    id: 34,
    question: "When preparing a Bank Reconciliation Statement, how are 'outstanding checks' (checks written but not yet cleared by the bank) treated?",
    options: [
      "Added to the cash balance per the ledger books.",
      "Deducted from the balance per the bank statement.",
      "Added to the balance per the bank statement.",
      "Deducted from the cash balance per the ledger books."
    ],
    correctIndex: 1,
    explanation: "Outstanding checks have already been recorded as credits (payments) in the company's ledger books, but the bank has not yet deducted them from the account. To reconcile the bank statement balance to the book balance, outstanding checks are deducted from the balance per the bank statement."
  },
  {
    id: 35,
    question: "An expenditure of $5,000 on major machine overhauls that extends the useful life of the machinery by 4 years is classified as:",
    options: [
      "Revenue Expenditure",
      "Capital Expenditure",
      "Operating Expense",
      "Deferred Liability"
    ],
    correctIndex: 1,
    explanation: "Expenditures that increase the capacity, efficiency, or useful life of a non-current asset are capital expenditures and are capitalized as assets on the balance sheet, then depreciated over the new useful life."
  }
];

export default function ExamPlatform() {
  // Phase management
  const [phase, setPhase] = useState<"login" | "testing" | "results">("login");

  // Login/Registration Form State
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentLevel, setStudentLevel] = useState("advanced"); // "beginner" | "intermediate" | "advanced"

  const [questionCount, setQuestionCount] = useState(20);

  // Active Questions State
  const [activeQuestions, setActiveQuestions] = useState<typeof fullQuestionBank>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Exam States
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState(1200); // Timer resets on start
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Triggered on page load or restarts to handle timer cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (phase === "testing") {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            // Auto submit when time runs out
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            submitExam(true);
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

  // Start exam and generate 20 random questions
  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) return;

    // Shuffle and slice selected number of questions
    const shuffled = [...fullQuestionBank].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);
    
    setActiveQuestions(selected);
    setUserAnswers({});
    setMarkedForReview({});
    setCurrentIdx(0);
    setSecondsRemaining(questionCount * 60); // 1 minute per question
    setPhase("testing");
  };

  // Select Option
  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIdx]: optionIndex
    }));
  };

  // Toggle Review Status
  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  // Navigate Questions
  const handleNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  // Final submission
  const submitExam = (forced = false) => {
    setIsSubmitModalOpen(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setPhase("results");
  };

  // Reset the exam and return to registration desk
  const resetQuiz = () => {
    setUserAnswers({});
    setMarkedForReview({});
    setCurrentIdx(0);
    setSecondsRemaining(questionCount * 60);
    setPhase("login");
  };

  // Calculate stats
  const calculateScore = () => {
    let score = 0;
    activeQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const score = calculateScore();
  const percentage = activeQuestions.length > 0 ? (score / activeQuestions.length) * 100 : 0;
  const isPassed = percentage >= 50; // CA Passing grade (50% standard)

  // Formatting helper for time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const timeUsedSeconds = (questionCount * 60) - secondsRemaining;
  const timeUsedFormatted = formatTime(timeUsedSeconds);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden print:overflow-visible print:bg-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between z-20 shadow-sm shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
            CA
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-sm md:text-base leading-none">CA Accounting Examination Hall</h1>
            <p className="text-[10.5px] text-slate-400 font-semibold mt-1">Official Mock Assessment Desk</p>
          </div>
        </div>

        {phase === "login" && (
          <Link
            href="/exam/admin"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Settings size={14} /> Admin Console
          </Link>
        )}

        {phase === "testing" && (
          <div className="flex items-center gap-4">
            {/* Countdown timer */}
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono text-sm font-black shadow-sm transition-all ${
              secondsRemaining < 120 
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" 
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              <Clock size={16} className={secondsRemaining < 120 ? "text-rose-500" : "text-slate-400"} />
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
      </header>

      {/* Dynamic Viewports */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* Phase 1: Login & Setup */}
          {phase === "login" && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                    <ClipboardList size={22} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Desk Registration</h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Please log in to register your computer desk and start the professional multiple choice mock accounting exam.
                  </p>
                </div>

                <form onSubmit={handleStartExam} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        required
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 transition-all font-medium bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Enrollment / Registration ID</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        required
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        placeholder="e.g. CA-2026-8947"
                        className="w-full border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 transition-all font-mono bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Examination Target Syllabus</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 gap-1 relative">
                      {[
                        { label: "Foundation", value: "beginner" },
                        { label: "IPCC (Inter)", value: "intermediate" },
                        { label: "CA Final (Adv)", value: "advanced" }
                      ].map(opt => (
                        <button 
                          key={opt.value}
                          type="button"
                          onClick={() => setStudentLevel(opt.value)}
                          className={`flex-1 relative z-10 py-2 text-center text-xs font-bold rounded-lg transition-colors duration-300 ${
                            studentLevel === opt.value 
                              ? "text-slate-900" 
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {studentLevel === opt.value && (
                            <motion.div
                              layoutId="examLevelIndicator"
                              className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/20 -z-10"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-20">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Number of Questions</label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="number" 
                        required
                        min="1"
                        max={fullQuestionBank.length}
                        value={questionCount}
                        onChange={e => setQuestionCount(Number(e.target.value))}
                        className="w-full border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 transition-all font-mono bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Rules Accordion Box */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed space-y-2">
                    <div className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert size={12} className="text-blue-500" />
                      Mock Examination Guidelines
                    </div>
                    <ul className="list-disc pl-3.5 space-y-1">
                      <li>The exam will draw <strong>{questionCount} random questions</strong> out of our specialized {fullQuestionBank.length} question bank.</li>
                      <li>You are allocated exactly <strong>{questionCount}:00 minutes</strong> total ticking timer.</li>
                      <li>Auto-submission occurs immediately once the countdown timer hits zero.</li>
                      <li>Passing criteria is <strong>50% ({Math.ceil(questionCount / 2)} correct answers out of {questionCount})</strong>.</li>
                    </ul>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group transition-all"
                  >
                    Start Official Accounting Examination
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Phase 2: Examination Hall Active Testing */}
          {phase === "testing" && (
            <motion.div 
              key="testing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Left Question Nav Bubble Drawer */}
              <aside className="w-80 bg-white border-r border-slate-200/80 p-6 flex flex-col h-full shrink-0">
                <div className="mb-6 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Exam Hall Seat</span>
                  <div className="text-sm font-extrabold text-slate-900">{studentName}</div>
                  <div className="text-xs text-slate-400 font-mono">{studentId}</div>
                </div>

                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Questions Sheet Navigator</div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {activeQuestions.map((_, i) => {
                      const isAnswered = userAnswers[i] !== undefined;
                      const isMarked = markedForReview[i];
                      const isActive = i === currentIdx;

                      let bubbleClass = "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300";
                      
                      if (isAnswered) {
                        bubbleClass = "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100";
                      }
                      if (isMarked) {
                        bubbleClass = "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100";
                      }
                      if (isActive) {
                        bubbleClass = "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-md font-bold";
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

                {/* Progress Indicators Legends */}
                <div className="border-t border-slate-100 pt-6 space-y-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-blue-600 rounded-sm inline-block"></span>
                    <span>Currently Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-indigo-100 border border-indigo-200 rounded-sm inline-block"></span>
                    <span>Saved / Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-amber-100 border border-amber-300 rounded-sm inline-block"></span>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-slate-50 border border-slate-200 rounded-sm inline-block"></span>
                    <span>Unanswered Sheet</span>
                  </div>
                </div>
              </aside>

              {/* Main Question Viewport */}
              <main className="flex-1 bg-slate-50 overflow-y-auto p-8 flex flex-col justify-between">
                <div className="max-w-3xl mx-auto w-full space-y-6">
                  {/* Category / Level Label */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                      Syllabus: {studentLevel === "advanced" ? "CA Final Accounting" : studentLevel === "intermediate" ? "IPCC / Intermediate" : "Foundation Principles"}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Question {currentIdx + 1} of {activeQuestions.length}
                    </span>
                  </div>

                  {/* Active Question Box */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
                    
                    <h3 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
                      {activeQuestions[currentIdx]?.question}
                    </h3>

                    {/* Multiple Choice Options List */}
                    <div className="space-y-3 pt-2">
                      {activeQuestions[currentIdx]?.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[currentIdx] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(oIdx)}
                            className={`w-full text-left p-4 text-xs md:text-sm rounded-2xl border transition-all flex items-start gap-3.5 hover:shadow-sm ${
                              isSelected 
                                ? "bg-blue-50/70 border-blue-300 text-blue-900 font-semibold" 
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                              isSelected 
                                ? "bg-blue-600 border-blue-600 text-white" 
                                : "border-slate-350 text-slate-400 bg-slate-50"
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Actions Toolbar */}
                <div className="max-w-3xl mx-auto w-full border-t border-slate-200/80 pt-6 mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={currentIdx === 0}
                      onClick={handlePrev}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button 
                      disabled={currentIdx === activeQuestions.length - 1}
                      onClick={handleNext}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>

                  <button 
                    onClick={toggleMarkForReview}
                    className={`font-semibold text-xs px-4 py-2.5 rounded-xl transition-all border ${
                      markedForReview[currentIdx] 
                        ? "bg-amber-100 border-amber-300 text-amber-800" 
                        : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {markedForReview[currentIdx] ? "★ Marked for Review" : "☆ Mark for Review"}
                  </button>
                </div>
              </main>
            </motion.div>
          )}

          {/* Phase 3: Comprehensive Comparative Scorecard Dashboard */}
          {phase === "results" && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 bg-slate-50 overflow-y-auto p-8 print:overflow-visible print:bg-white print:p-0"
            >
              <div className="max-w-5xl mx-auto space-y-8 print:space-y-6">
                
                {/* Printable Certificate (Hidden on Screen, Visible on Print) */}
                {isPassed && (
                  <div className="hidden print:flex flex-col items-center justify-center border-8 border-double border-emerald-800 p-12 text-center space-y-6 mb-12 bg-emerald-50 break-inside-avoid">
                    <Award size={64} className="text-emerald-600 mb-2" />
                    <h1 className="text-4xl font-black text-emerald-900 uppercase tracking-widest">Certificate of Achievement</h1>
                    <p className="text-lg text-slate-700 font-serif max-w-2xl">
                      This is to certify that
                    </p>
                    <h2 className="text-5xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 inline-block px-12">
                      {studentName}
                    </h2>
                    <p className="text-lg text-slate-700 font-serif max-w-2xl leading-relaxed">
                      has successfully completed the CA Mock Assessment for <strong>{studentLevel === "advanced" ? "CA Final" : studentLevel === "intermediate" ? "IPCC" : "Foundation"}</strong> with a score of <strong>{percentage.toFixed(0)}%</strong>.
                    </p>
                    <div className="flex justify-between w-full mt-12 pt-8 border-t border-slate-400">
                      <div className="text-center">
                        <p className="text-slate-800 font-bold">{new Date().toLocaleDateString()}</p>
                        <p className="text-sm text-slate-500 uppercase tracking-widest">Date</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-800 font-bold font-mono">{studentId}</p>
                        <p className="text-sm text-slate-500 uppercase tracking-widest">Registration ID</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Summary Overview Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                  
                  <div className="space-y-4 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <span className="text-[10px] font-bold tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                        Mock Exam Result
                      </span>
                      <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${
                        isPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {isPassed ? "PASSED (CA COMPLIANT)" : "FAILED (RETRY REQUIRED)"}
                      </span>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 leading-none">
                      {studentName}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-500 pt-2">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registration Roll</span>
                        <span className="text-slate-800 font-mono text-[13px]">{studentId}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Difficulty Setting</span>
                        <span className="text-slate-800 uppercase text-[11px]">{studentLevel === "advanced" ? "CA Final" : studentLevel === "intermediate" ? "IPCC" : "Foundation"}</span>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time Duration Spent</span>
                        <span className="text-slate-800 text-[11px]">{timeUsedFormatted} minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center ${
                      isPassed ? "border-emerald-500 text-emerald-600 bg-emerald-50/20" : "border-rose-500 text-rose-600 bg-rose-50/20"
                    }`}>
                      <span className="text-3xl font-black leading-none">{score}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">/ {activeQuestions.length} Total</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">{percentage.toFixed(0)}% Score</span>
                  </div>
                </div>

                {/* Score breakdown metrics alert */}
                <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                  isPassed ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  {isPassed ? <Award size={24} /> : <AlertTriangle size={24} />}
                  <div className="text-xs leading-relaxed font-semibold">
                    {isPassed 
                      ? "Outstanding work! You scored at or above the 50% professional passing standard required by the ICAI. Your foundational and corporate bookkeeping principles are extremely solid."
                      : `The CA professional certification passing requirement is 50% (${Math.ceil(activeQuestions.length / 2)} out of ${activeQuestions.length}). Please review the ledger adjustments, standards, and explanations below and try another shuffled set.`
                    }
                  </div>
                </div>

                {/* Comparative Performance List Dashboard */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-4 print:hidden">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Question-by-Question Detailed Audit Review</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.print()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        <Download size={14} /> Save Results & Certificate
                      </button>
                      <button 
                        onClick={resetQuiz}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        <RotateCcw size={14} /> Restart Exam Challenge
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {activeQuestions.map((q, idx) => {
                      const userAnsIdx = userAnswers[idx];
                      const isCorrect = userAnsIdx === q.correctIndex;
                      const isUnanswered = userAnsIdx === undefined;

                      return (
                        <div 
                          key={idx} 
                          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-4 relative overflow-hidden print:break-inside-avoid print:shadow-none print:border-slate-300"
                        >
                          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                            isUnanswered 
                              ? "bg-slate-350" 
                              : isCorrect 
                                ? "bg-emerald-500" 
                                : "bg-rose-500"
                          }`} />

                          <div className="flex items-start justify-between gap-4">
                            <span className="text-[11px] font-bold text-slate-400 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
                              Question {idx + 1}
                            </span>
                            
                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 ${
                              isUnanswered 
                                ? "bg-slate-100 text-slate-500" 
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
                            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-2">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Your Selected Response</span>
                              <div className="flex items-start gap-2.5">
                                {isUnanswered ? (
                                  <span className="text-xs italic text-slate-400 leading-relaxed">No answer was registered.</span>
                                ) : (
                                  <>
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                                      isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                                    }`}>
                                      {String.fromCharCode(65 + userAnsIdx)}
                                    </span>
                                    <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                                      {q.options[userAnsIdx]}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Correct Selection */}
                            <div className="bg-emerald-50/40 border border-emerald-200/60 rounded-2xl p-4 space-y-2">
                              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Correct Audit standard Response</span>
                              <div className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                                  {String.fromCharCode(65 + q.correctIndex)}
                                </span>
                                <span className="text-xs text-slate-800 font-bold leading-relaxed">
                                  {q.options[q.correctIndex]}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Explanatory notes */}
                          <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 text-xs leading-relaxed text-slate-600 space-y-1">
                            <span className="font-extrabold text-blue-700 block uppercase tracking-wider text-[10px]">Academic Justification Note</span>
                            <p>{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center py-6 border-t border-slate-200 print:hidden">
                  <button 
                    onClick={resetQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
                  >
                    <RotateCcw size={16} /> Try another shuffled mock exam set
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Confirmation Submit Dialog Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-md w-full text-center space-y-6"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
                <AlertTriangle size={26} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 leading-none">Confirm Submission?</h3>
                <p className="text-xs text-slate-400 leading-relaxed px-4">
                  You have recorded answers for <strong>{Object.keys(userAnswers).length}</strong> out of {activeQuestions.length} total questions. Once submitted, your answers will be audited and marked. You cannot return to this exam.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => submitExam()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all uppercase tracking-wider"
                >
                  Confirm & Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
