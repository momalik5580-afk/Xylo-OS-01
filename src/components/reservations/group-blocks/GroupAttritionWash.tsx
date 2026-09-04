import React, { useState } from "react";
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingDown,
  Lock,
  Unlock,
  ShieldAlert,
  ArrowRight,
  Receipt,
  FileCheck,
  RotateCcw,
  Info,
} from "lucide-react";
import { GroupBlock, GroupMasterTransaction } from "../../../types";

interface GroupAttritionWashProps {
  currentBlock: GroupBlock;
  onUpdateBlock: (updated: GroupBlock) => void;
  onShowToast?: (msg: string) => void;
}

export const GroupAttritionWash: React.FC<GroupAttritionWashProps> = ({
  currentBlock,
  onUpdateBlock,
  onShowToast,
}) => {
  const [washConfirmationOpen, setWashConfirmationOpen] = useState(false);
  const [autoPostAttritionFee, setAutoPostAttritionFee] = useState(true);

  // Contract Math
  const totalAllocated = currentBlock.allocatedRooms || 0;
  const pickedUp = currentBlock.pickedUpRooms || 0;
  const unpickedRooms = Math.max(0, totalAllocated - pickedUp);

  const start = new Date(currentBlock.startDate);
  const end = new Date(currentBlock.endDate);
  const stayNights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalContractedNights = totalAllocated * stayNights;
  const actualPickedUpNights = pickedUp * stayNights;

  const thresholdPct = currentBlock.attritionThresholdPercent || 80;
  const minRequiredNights = Math.ceil(totalContractedNights * (thresholdPct / 100));
  const minRequiredRooms = Math.ceil(totalAllocated * (thresholdPct / 100));

  const shortfallNights = Math.max(0, minRequiredNights - actualPickedUpNights);
  const shortfallRooms = Math.max(0, minRequiredRooms - pickedUp);
  const negotiatedRate = currentBlock.negotiatedRate || 500;
  const attritionPenaltyAmount = shortfallNights * negotiatedRate;

  const pickupPct = totalAllocated > 0 ? Math.round((pickedUp / totalAllocated) * 100) : 0;
  const isBreached = shortfallNights > 0;

  // Cut-off date status
  const today = new Date("2026-09-04");
  const cutOff = new Date(currentBlock.cutOffDate);
  const daysRemaining = Math.round((cutOff.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const cutOffPassed = daysRemaining <= 0;

  // Execute Wash & Optional Attrition Posting
  const handleExecuteWash = () => {
    // 1. Release unpicked rooms: new allocatedRooms = pickedUp
    // 2. Adjust roomGrid to match pickedUp counts
    const updatedGrid = currentBlock.roomGrid?.map((day) => ({
      ...day,
      allocations: day.allocations.map((alloc) => ({
        ...alloc,
        allocated: alloc.pickedUp, // Wash unpicked back to general house
      })),
    }));

    // 3. New Wash history entry
    const washEntry = {
      date: new Date().toISOString().split("T")[0],
      roomsReleased: unpickedRooms,
      reason: `Cut-off wash executed: Released ${unpickedRooms} unpicked rooms back to transient inventory.${
        isBreached && autoPostAttritionFee
          ? ` Attrition shortfall fee of $${attritionPenaltyAmount.toLocaleString()} posted to Master Folio.`
          : ""
      }`,
    };

    // 4. If breached & autoPost, create debit transaction on master folio
    let updatedTransactions: GroupMasterTransaction[] = [...(currentBlock.masterTransactions || [])];
    let newBalance = currentBlock.masterBalance || 0;

    if (isBreached && autoPostAttritionFee && attritionPenaltyAmount > 0) {
      const tx: GroupMasterTransaction = {
        id: `tx-att-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        category: "ATTRITION_FEE",
        description: `Contractual Attrition Liquidated Damages (${shortfallNights} shortfall room nights @ $${negotiatedRate}/nt - Contract Clause 8.2)`,
        referenceNo: `ATT-${currentBlock.blockCode}`,
        amount: attritionPenaltyAmount,
        postedBy: "S&C Revenue Management",
      };
      updatedTransactions.push(tx);
      newBalance += attritionPenaltyAmount;
    }

    const updatedBlock: GroupBlock = {
      ...currentBlock,
      allocatedRooms: pickedUp, // unpicked released
      roomGrid: updatedGrid || currentBlock.roomGrid,
      washHistory: [washEntry, ...(currentBlock.washHistory || [])],
      masterTransactions: updatedTransactions,
      masterBalance: newBalance,
      inventoryStatus: "DEDUCT", // picked up stay deduct
    };

    onUpdateBlock(updatedBlock);
    setWashConfirmationOpen(false);

    if (onShowToast) {
      onShowToast(
        `✓ Cut-off wash executed: ${unpickedRooms} rooms released to transient inventory.${
          isBreached && autoPostAttritionFee
            ? ` Attrition penalty $${attritionPenaltyAmount.toLocaleString()} posted to Master Folio.`
            : ""
        }`
      );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Banner: Logic Explanation */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-white">OPERA Attrition Management & Cut-Off Wash Engine</h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard MICE Group Contract Clause: The group commits to pick up at least {thresholdPct}% of contracted room nights.
            If pickup is below threshold at cut-off date, the shortfall is billed as liquidated damages to the Master Folio.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border flex items-center space-x-1.5 ${
              isBreached
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {isBreached ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>ATTRITION SHORTFALL DETECTED</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CONTRACT COMMITMENT MET</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 4 Financial & Inventory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Contracted vs Picked Up */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Contracted vs Actual</span>
            <span className="font-mono text-purple-400 font-bold">{pickupPct}%</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {pickedUp} <span className="text-sm text-slate-400 font-sans font-normal">/ {totalAllocated} Rooms</span>
          </div>
          <div className="text-xs text-slate-400">
            Total Room Nights: <span className="text-white font-mono">{actualPickedUpNights} / {totalContractedNights}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all ${
                isBreached ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, pickupPct)}%` }}
            />
            {/* Threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
              style={{ left: `${thresholdPct}%` }}
              title={`Attrition Threshold (${thresholdPct}%)`}
            />
          </div>
        </div>

        {/* Card 2: Minimum Required Pickup */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Contracted Threshold</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300">
              {thresholdPct}% CLAUSE
            </span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {minRequiredRooms} <span className="text-sm text-slate-400 font-sans font-normal">Rooms Min.</span>
          </div>
          <div className="text-xs text-slate-400">
            Minimum Required Nights: <span className="text-white font-mono">{minRequiredNights} nights</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Group owes 100% of room rate for any rooms below this mark.
          </p>
        </div>

        {/* Card 3: Shortfall Room Nights */}
        <div className={`p-4 rounded-xl border space-y-2 ${
          isBreached ? "bg-rose-500/5 border-rose-500/30" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Attrition Shortfall</span>
            <TrendingDown className={`w-4 h-4 ${isBreached ? "text-rose-400" : "text-slate-500"}`} />
          </div>
          <div className={`text-xl font-bold font-mono ${isBreached ? "text-rose-400" : "text-emerald-400"}`}>
            {shortfallNights} <span className="text-sm font-sans font-normal text-slate-400">Room Nights</span>
          </div>
          <div className="text-xs text-slate-400">
            Shortfall Rooms: <span className="text-white font-mono">{shortfallRooms} rooms</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isBreached ? "Below minimum contractual guarantee" : "Pickup meets or exceeds guarantee"}
          </p>
        </div>

        {/* Card 4: Liquidated Damages Penalty */}
        <div className={`p-4 rounded-xl border space-y-2 ${
          isBreached ? "bg-rose-500/10 border-rose-500/40" : "bg-slate-900 border-slate-800"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Attrition Liability Due</span>
            <DollarSign className={`w-4 h-4 ${isBreached ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${isBreached ? "text-rose-400" : "text-emerald-400"}`}>
            ${attritionPenaltyAmount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            Rate applied: <span className="text-white font-mono">${negotiatedRate} / nt</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isBreached ? "Payable directly by Master Corporate Account" : "Zero penalty liability"}
          </p>
        </div>
      </div>

      {/* Cut-Off Date Action Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h5 className="text-sm font-bold text-white">Cut-Off Date & Inventory Wash Execution</h5>
            </div>
            <p className="text-xs text-slate-400">
              Contract Cut-Off Date: <span className="text-white font-mono font-bold">{currentBlock.cutOffDate}</span> ({daysRemaining > 0 ? `${daysRemaining} days remaining` : "Cut-Off Passed"}).
              Executing the cut-off wash releases all unpicked rooms ({unpickedRooms} rooms) from DEDUCT status back to general hotel inventory.
            </p>
          </div>

          <button
            onClick={() => setWashConfirmationOpen(true)}
            disabled={unpickedRooms === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-amber-600/20 transition cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Execute Cut-Off Wash ({unpickedRooms} Rooms)</span>
          </button>
        </div>

        {/* Wash Audit History Log */}
        <div className="space-y-2">
          <h6 className="text-xs font-mono font-bold text-slate-400">WASH AUDIT LOG & HISTORICAL RELEASES</h6>
          {currentBlock.washHistory && currentBlock.washHistory.length > 0 ? (
            <div className="space-y-2">
              {currentBlock.washHistory.map((wh, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2 font-mono text-slate-400 text-[11px]">
                      <span className="text-purple-400 font-bold">{wh.date}</span>
                      <span>•</span>
                      <span className="text-white font-bold">{wh.roomsReleased} Rooms Released</span>
                    </div>
                    <p className="text-slate-300">{wh.reason}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    WASH EXECUTED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-lg bg-slate-950 border border-slate-800/60 text-xs text-slate-500">
              No previous cut-off washes have been executed on this block.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {washConfirmationOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Cut-Off Inventory Wash</h3>
                <p className="text-xs text-slate-400">Block: {currentBlock.blockCode}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Unpicked Rooms to Release:</span>
                <span className="text-white font-mono font-bold">{unpickedRooms} rooms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className="text-emerald-400">Return to Transient CRS Sale</span>
              </div>
              {isBreached && (
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Contractual Attrition Due:</span>
                  <span className="text-rose-400 font-mono font-bold">
                    ${attritionPenaltyAmount.toLocaleString()} ({shortfallNights} nts)
                  </span>
                </div>
              )}
            </div>

            {isBreached && (
              <label className="flex items-start space-x-2 text-xs text-slate-300 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPostAttritionFee}
                  onChange={(e) => setAutoPostAttritionFee(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  <strong className="text-purple-300">Auto-Post Liquidated Damages to Master Folio:</strong> Automatically create a debit entry on the corporate Master Account ledger for ${attritionPenaltyAmount.toLocaleString()}.
                </span>
              </label>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setWashConfirmationOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteWash}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow transition cursor-pointer"
              >
                Execute Wash Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
