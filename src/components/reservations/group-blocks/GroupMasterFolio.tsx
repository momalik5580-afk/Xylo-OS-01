import React, { useState } from "react";
import {
  Receipt,
  Plus,
  DollarSign,
  Download,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Sparkles,
  ShieldCheck,
  FileText,
  X,
  RefreshCw,
} from "lucide-react";
import {
  GroupBlock,
  GroupMasterTransaction,
  MasterTransactionCategory,
} from "../../../types";

interface GroupMasterFolioProps {
  currentBlock: GroupBlock;
  onUpdateBlock: (updated: GroupBlock) => void;
  onShowToast?: (msg: string) => void;
}

export const GroupMasterFolio: React.FC<GroupMasterFolioProps> = ({
  currentBlock,
  onUpdateBlock,
  onShowToast,
}) => {
  // Modals
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Charge form
  const [chargeCategory, setChargeCategory] = useState<MasterTransactionCategory>("BANQUET_CATERING");
  const [chargeDesc, setChargeDesc] = useState("");
  const [chargeRef, setChargeRef] = useState("");
  const [chargeAmount, setChargeAmount] = useState<number>(5000);

  // Payment form
  const [paymentDesc, setPaymentDesc] = useState("Corporate Direct Wire Transfer");
  const [paymentRef, setPaymentRef] = useState("WT-CORP-01");
  const [paymentAmount, setPaymentAmount] = useState<number>(25000);

  const transactions: GroupMasterTransaction[] = currentBlock.masterTransactions || [];

  // Calculate totals
  const totalDebits = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const calculatedBalance = totalDebits - totalCredits;

  // Handle Post Charge
  const handlePostCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeDesc.trim() || chargeAmount <= 0) return;

    const newTx: GroupMasterTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      category: chargeCategory,
      description: chargeDesc,
      referenceNo: chargeRef || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: chargeAmount,
      postedBy: "Corporate A/R Finance",
    };

    const updatedTxs = [...transactions, newTx];
    const newBal = (currentBlock.masterBalance || 0) + chargeAmount;

    onUpdateBlock({
      ...currentBlock,
      masterTransactions: updatedTxs,
      masterBalance: newBal,
    });

    setChargeDesc("");
    setChargeRef("");
    setChargeModalOpen(false);

    if (onShowToast) {
      onShowToast(`✓ Charge of $${chargeAmount.toLocaleString()} posted to Master Folio.`);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const newTx: GroupMasterTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      category: "PAYMENT_CREDIT",
      description: paymentDesc,
      referenceNo: paymentRef || `WT-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: -paymentAmount, // Negative for credit
      postedBy: "Corporate A/R Cashier",
    };

    const updatedTxs = [...transactions, newTx];
    const newBal = (currentBlock.masterBalance || 0) - paymentAmount;

    onUpdateBlock({
      ...currentBlock,
      masterTransactions: updatedTxs,
      masterBalance: newBal,
      depositPaid: (currentBlock.depositPaid || 0) + paymentAmount,
    });

    setPaymentModalOpen(false);

    if (onShowToast) {
      onShowToast(`✓ Payment credit of $${paymentAmount.toLocaleString()} recorded on Master Folio.`);
    }
  };

  // Auto-Reconcile Delegate Room Nights
  const handleReconcileDelegateRoomNights = () => {
    if (!currentBlock.delegates || currentBlock.delegates.length === 0) {
      if (onShowToast) onShowToast("No delegates to reconcile.");
      return;
    }

    const masterDelegates = currentBlock.delegates.filter(
      (d) =>
        d.status !== "CANCELLED" &&
        (d.billingRouting === "MASTER_FOLIO" || d.billingRouting === "SPLIT_BILLING")
    );

    let calculatedRoomRevenue = 0;
    masterDelegates.forEach((d) => {
      const start = new Date(d.checkIn);
      const end = new Date(d.checkOut);
      const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      calculatedRoomRevenue += nights * (currentBlock.negotiatedRate || 500);
    });

    // Check existing room & tax charges
    const existingRoomCharge = transactions
      .filter((t) => t.category === "ROOM_AND_TAX")
      .reduce((sum, t) => sum + t.amount, 0);

    const variance = calculatedRoomRevenue - existingRoomCharge;

    if (variance === 0) {
      if (onShowToast) onShowToast("✓ Master Folio Room & Tax is already fully balanced ($0 variance).");
      return;
    }

    const newTx: GroupMasterTransaction = {
      id: `tx-recon-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      category: "ROOM_AND_TAX",
      description: `Night Audit Room & Tax Auto-Transfer (${masterDelegates.length} delegates @ $${currentBlock.negotiatedRate}/nt)`,
      referenceNo: `NA-RECON-${currentBlock.blockCode}`,
      amount: variance,
      postedBy: "Night Audit Auto-Reconciliation",
    };

    const updatedTxs = [...transactions, newTx];
    const newBal = (currentBlock.masterBalance || 0) + variance;

    onUpdateBlock({
      ...currentBlock,
      masterTransactions: updatedTxs,
      masterBalance: newBal,
    });

    if (onShowToast) {
      onShowToast(`✓ Room & Tax reconciled: $${variance.toLocaleString()} posted to Master Folio.`);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Banner: Master Account Direct Bill Profile */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {currentBlock.masterFolioNo || "FOLIO-9042-MASTER"}
            </span>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Master Account & A/R Corporate Direct Bill Ledger
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
            <span>Company: <strong className="text-slate-200">{currentBlock.companyAccount}</strong></span>
            <span>•</span>
            <span>Billing Method: <strong className="text-purple-300">{currentBlock.billingMethod}</strong></span>
            <span>•</span>
            <span>Approved Credit Limit: <strong className="text-slate-200">${(currentBlock.masterCreditLimit || 150000).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReconcileDelegateRoomNights}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold border border-purple-500/30 transition cursor-pointer"
            title="Auto-calculate and post room & tax for all delegates routed to Master"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Reconcile Room & Tax</span>
          </button>

          <button
            onClick={() => setPaymentModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Payment / Deposit</span>
          </button>

          <button
            onClick={() => setChargeModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Master Charge</span>
          </button>

          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* 3 Ledger Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Debits (Charges)</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ${totalDebits.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Rooms, Catering, AV, Attrition, Meeting Spaces
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Credits (Payments & Deposits)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            ${totalCredits.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Advance Wires & Credit Card Guarantees
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Balance Due</span>
            <Receipt className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 font-mono">
            ${calculatedBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Terms: Net 30 Days Direct Bill A/R
          </p>
        </div>
      </div>

      {/* Double-Entry Ledger Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="py-3 px-4 font-semibold">DATE</th>
                <th className="py-3 px-4 font-semibold">CATEGORY</th>
                <th className="py-3 px-4 font-semibold">DESCRIPTION</th>
                <th className="py-3 px-4 font-semibold">REF #</th>
                <th className="py-3 px-4 text-right font-semibold">DEBIT (+)</th>
                <th className="py-3 px-4 text-right font-semibold">CREDIT (-)</th>
                <th className="py-3 px-4 font-semibold">POSTED BY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No transactions recorded on this Master Folio yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isDebit = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{tx.date}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.category.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-white font-medium">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-purple-400 font-bold">{tx.referenceNo}</td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {isDebit ? `$${tx.amount.toLocaleString()}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {!isDebit ? `$${Math.abs(tx.amount).toLocaleString()}` : "-"}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                        {tx.postedBy || "System"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-800 text-xs">
                <td colSpan={4} className="py-3 px-4 text-slate-300 font-sans">
                  TOTAL NET MASTER ACCOUNT BALANCE
                </td>
                <td className="py-3 px-4 text-right font-mono text-white">
                  ${totalDebits.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  ${totalCredits.toLocaleString()}
                </td>
                <td className="py-3 px-4 font-mono text-sky-400">
                  Due: ${calculatedBalance.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* POST MASTER CHARGE MODAL */}
      {chargeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-purple-400" />
                <span>Post Charge to Master Account Folio</span>
              </h3>
              <button
                onClick={() => setChargeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostCharge} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  Revenue Category
                </label>
                <select
                  value={chargeCategory}
                  onChange={(e) => setChargeCategory(e.target.value as MasterTransactionCategory)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="BANQUET_CATERING">Banquet Food & Beverage</option>
                  <option value="MEETING_ROOM_RENTAL">Meeting Room Rental</option>
                  <option value="AV_EQUIPMENT">Audio-Visual & Production</option>
                  <option value="ROOM_AND_TAX">Room & Tax Consolidated</option>
                  <option value="ATTRITION_FEE">Contractual Attrition Damages</option>
                  <option value="ADJUSTMENT">Administrative Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Ballroom Evening Gala Beverage Service"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Charge Amount ($) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Reference / BEO #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BEO-901"
                    value={chargeRef}
                    onChange={(e) => setChargeRef(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setChargeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  Post Debit to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Record Advance Payment / Wire Credit</span>
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  Payment Description
                </label>
                <input
                  type="text"
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Credit Amount ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-emerald-400 font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Wire / Tx Reference
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Apply Credit to Folio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE MASTER INVOICE STATEMENT MODAL */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">OPERA Accounts Receivable Statement</h3>
                <p className="text-[11px] text-slate-400 font-mono">Invoice #{currentBlock.masterFolioNo}</p>
              </div>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Invoice Header Details */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block">BILL TO (A/R CLIENT):</span>
                <span className="text-white font-bold block">{currentBlock.companyAccount}</span>
                <span className="text-slate-400 block">Attn: {currentBlock.contactPerson}</span>
                <span className="text-slate-400 block">{currentBlock.contactEmail}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">EVENT / CONTRACT:</span>
                <span className="text-purple-400 font-bold block">{currentBlock.groupName}</span>
                <span className="text-slate-400 block">Block Code: {currentBlock.blockCode}</span>
                <span className="text-slate-400 block">Date: {new Date().toISOString().split("T")[0]}</span>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                  <th className="py-2">DATE</th>
                  <th className="py-2">DESCRIPTION</th>
                  <th className="py-2 text-right">CHARGES</th>
                  <th className="py-2 text-right">PAYMENTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="py-1.5 text-slate-400">{t.date}</td>
                    <td className="py-1.5 text-white">{t.description}</td>
                    <td className="py-1.5 text-right text-white">
                      {t.amount > 0 ? `$${t.amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-1.5 text-right text-emerald-400">
                      {t.amount < 0 ? `$${Math.abs(t.amount).toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-slate-800 pt-3 flex justify-between items-baseline font-mono">
              <span className="text-slate-400">TOTAL BALANCE DUE:</span>
              <span className="text-lg font-bold text-sky-400">
                ${calculatedBalance.toLocaleString()} USD
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
