import React, { useState } from "react";
import {
  Receipt,
  Moon,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileSpreadsheet,
  Lock,
  Layers,
  Scale,
  Building2,
  Download,
  Plus,
  X,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

export const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"NIGHT_AUDIT" | "GENERAL_LEDGER" | "TAX_ENGINE" | "CONSOLIDATION">("NIGHT_AUDIT");
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditStep, setAuditStep] = useState<number>(0);
  const [auditCompleted, setAuditCompleted] = useState<boolean>(false);
  const [journalModalOpen, setJournalModalOpen] = useState<boolean>(false);

  // Journal Entry Form State
  const [newAccountCode, setNewAccountCode] = useState<string>("4010-00");
  const [newDebitCredit, setNewDebitCredit] = useState<"DEBIT" | "CREDIT">("CREDIT");
  const [newAmount, setNewAmount] = useState<string>("12500");
  const [newMemo, setNewMemo] = useState<string>("Corporate banquet catering charge");

  const [ledgerEntries, setLedgerEntries] = useState([
    { code: "1010-00", account: "Cash & Guest Credit Equivalents", debit: 48920.0, credit: 0.0, type: "Asset" },
    { code: "1020-00", account: "Stripe & Merchant Clearing Account", debit: 34150.0, credit: 0.0, type: "Asset" },
    { code: "4010-00", account: "Rooms Revenue (Transient + Corporate)", debit: 0.0, credit: 53820.0, type: "Revenue" },
    { code: "4020-00", account: "Food & Beverage Outlet Revenue", debit: 0.0, credit: 18440.0, type: "Revenue" },
    { code: "4030-00", account: "Spa & Wellness Experience Revenue", debit: 0.0, credit: 6210.0, type: "Revenue" },
    { code: "2050-00", account: "Municipal VAT & Tourism Surcharge (10%)", debit: 0.0, credit: 7847.0, type: "Liability" },
  ]);

  const auditStages = [
    { title: "Stage 1: Pre-Audit Guest Folio Trial Balance", desc: "Validating 188 in-house guest folios against room rate plans & city ledger guarantees." },
    { title: "Stage 2: Auto-Post Room Charges & Municipal Taxes", desc: "Posting $53,820.00 room charges + $5,382.00 10% VAT across all occupied units." },
    { title: "Stage 3: Settle Point-of-Sale Dining Batches", desc: "Reconciling Azure Coastal Grill, In-Room Dining & Skyline Bar credit settlement batches." },
    { title: "Stage 4: Yield Strategy Rollover & Channel Parity", desc: "Advancing hotel business date to 2026-08-19 and activating morning demand algorithms." },
    { title: "Stage 5: General Ledger Trial Balance Balancing", desc: "Matching debits and credits with zero financial discrepancy guarantee." },
  ];

  const handleRunNightAudit = () => {
    setAuditRunning(true);
    setAuditCompleted(false);
    setAuditStep(1);

    const stepInterval = setInterval(() => {
      setAuditStep((prev) => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          setAuditRunning(false);
          setAuditCompleted(true);
          return 5;
        }
        return prev + 1;
      });
    }, 700);
  };

  const handleAddJournalEntry = () => {
    const amt = parseFloat(newAmount) || 0;
    const isDebit = newDebitCredit === "DEBIT";

    const newEntry = {
      code: newAccountCode,
      account: newMemo || "Manual Journal Adjustment",
      debit: isDebit ? amt : 0,
      credit: isDebit ? 0 : amt,
      type: "Journal Entry",
    };

    setLedgerEntries((prev) => [newEntry, ...prev]);
    setJournalModalOpen(false);
  };

  const totalDebits = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Hospitality Finance, ERP General Ledger & Night Audit
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated midnight roll, zero-downtime room & tax posting, POS batch balancing, and owner financial consolidation.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {[
            { id: "NIGHT_AUDIT", label: "Night Audit Engine" },
            { id: "GENERAL_LEDGER", label: "General Ledger (GL)" },
            { id: "TAX_ENGINE", label: "VAT & Tax Engine" },
            { id: "CONSOLIDATION", label: "Global Portfolio" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: NIGHT AUDIT ENGINE */}
      {activeTab === "NIGHT_AUDIT" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Autonomous Night Audit Engine (Rollover: 2026-08-18 → 2026-08-19)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-audit checks passed: 188 In-House folios balanced, 0 unsettled POS batches.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunNightAudit}
                disabled={auditRunning}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 font-bold text-xs text-white shadow-xl shadow-rose-950/50 transition-all flex items-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{auditRunning ? "Auditing Pipeline..." : "Execute 5-Stage Night Audit"}</span>
              </button>
            </div>

            {/* Stages Progress Grid */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              {auditStages.map((stg, idx) => {
                const stepNum = idx + 1;
                const isPassed = auditStep > stepNum || auditCompleted;
                const isCurrent = auditStep === stepNum && auditRunning;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isPassed
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : isCurrent
                        ? "bg-amber-950/20 border-amber-500/40 text-amber-300 animate-pulse"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 text-[10px] flex items-center justify-center font-mono">
                          {stepNum}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-xs text-white">{stg.title}</div>
                        <div className="text-[11px] text-slate-400">{stg.desc}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold">
                      {isPassed ? "BALANCED & LOGGED" : isCurrent ? "EXECUTING..." : "QUEUED"}
                    </span>
                  </div>
                );
              })}
            </div>

            {auditCompleted && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center space-x-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      Night Audit Successfully Completed with Zero Variances
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Business date moved to 2026-08-19. Flash report published to Owner Portal.
                    </div>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Morning Flash Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL LEDGER */}
      {activeTab === "GENERAL_LEDGER" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">General Ledger Trial Balance</h3>
            <button
              onClick={() => setJournalModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Journal Entry</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Account Description</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4 text-right">Debit ($)</th>
                  <th className="py-3 px-4 text-right">Credit ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {ledgerEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 font-mono">
                    <td className="py-3 px-4 text-amber-400 font-bold">{entry.code}</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">{entry.account}</td>
                    <td className="py-3 px-4 text-slate-400">{entry.type}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-200">
                      {entry.debit > 0 ? `$${entry.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {entry.credit > 0 ? `$${entry.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950/80 font-mono font-bold text-xs text-white border-t border-slate-800">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right">Total Balanced:</td>
                  <td className="py-3 px-4 text-right text-indigo-400">
                    ${totalDebits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    ${totalCredits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TAX & MUNICIPAL SURCHARGES */}
      {activeTab === "TAX_ENGINE" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400">Municipal VAT (10%)</span>
            <div className="text-xl font-bold font-mono text-emerald-400">$7,847.00</div>
            <p className="text-[11px] text-slate-400">Accrued from room stays and dining outlets</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400">Tourism Dirham Fee</span>
            <div className="text-xl font-bold font-mono text-amber-400">$3,760.00</div>
            <p className="text-[11px] text-slate-400">20 AED per luxury bedroom per night</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400">Service Charge (7%)</span>
            <div className="text-xl font-bold font-mono text-indigo-400">$5,492.90</div>
            <p className="text-[11px] text-slate-400">Directly allocated to staff payroll pool</p>
          </div>
        </div>
      )}

      {/* TAB 4: GLOBAL PORTFOLIO CONSOLIDATION */}
      {activeTab === "CONSOLIDATION" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Xylo Grand Marina (Dubai)", rooms: 200, occ: "94.2%", revpar: "$284.50", rev: "$56,900" },
            { name: "Xylo Alpine Sanctuary (St. Moritz)", rooms: 120, occ: "88.5%", revpar: "$412.00", rev: "$49,440" },
            { name: "Xylo Urban Tower (Singapore)", rooms: 350, occ: "92.0%", revpar: "$245.00", rev: "$85,750" },
            { name: "Xylo Coral Reef (Maldives)", rooms: 160, occ: "97.5%", revpar: "$820.00", rev: "$131,200" },
          ].map((prop, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{prop.name}</span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">{prop.occ} Occ</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>RevPAR: {prop.revpar}</span>
                <span className="font-bold text-emerald-400">Daily Rev: {prop.rev}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Journal Entry Modal */}
      {journalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Post Manual Journal Entry</h3>
              <button onClick={() => setJournalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400">Account Code</label>
                <select
                  value={newAccountCode}
                  onChange={(e) => setNewAccountCode(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="4010-00">4010-00 Rooms Revenue</option>
                  <option value="4020-00">4020-00 F&B Dining Revenue</option>
                  <option value="1010-00">1010-00 Cash & Clearing</option>
                  <option value="2050-00">2050-00 Municipal Tax</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Debit / Credit</label>
                  <select
                    value={newDebitCredit}
                    onChange={(e) => setNewDebitCredit(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Amount ($)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">Description / Memo</label>
                <input
                  type="text"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  placeholder="e.g. Corporate Banquet adjustment"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setJournalModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddJournalEntry}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Post to General Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
