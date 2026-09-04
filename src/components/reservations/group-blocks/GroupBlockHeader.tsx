import React from "react";
import {
  Building2,
  Calendar,
  DollarSign,
  Plus,
  ShieldCheck,
  Sparkles,
  BedDouble,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertTriangle,
  Lock,
  Unlock,
  Layers,
  FileSpreadsheet,
  Receipt,
  Utensils,
  Scale,
} from "lucide-react";
import { GroupBlock } from "../../../types";

interface GroupBlockHeaderProps {
  groupBlocks: GroupBlock[];
  selectedBlockId: string;
  onSelectBlockId: (id: string) => void;
  onNewBlockClick: () => void;
  activeTab: "room-grid" | "rooming-list" | "attrition-wash" | "master-folio" | "beo-events";
  onTabChange: (tab: "room-grid" | "rooming-list" | "attrition-wash" | "master-folio" | "beo-events") => void;
  currentBlock: GroupBlock;
  onAdvanceStatus: (nextStatus: GroupBlock["status"]) => void;
}

export const GroupBlockHeader: React.FC<GroupBlockHeaderProps> = ({
  groupBlocks,
  selectedBlockId,
  onSelectBlockId,
  onNewBlockClick,
  activeTab,
  onTabChange,
  currentBlock,
  onAdvanceStatus,
}) => {
  // Financial & inventory KPI calculations
  const totalAllocated = currentBlock.allocatedRooms || 0;
  const pickedUp = currentBlock.pickedUpRooms || 0;
  const availableRooms = Math.max(0, totalAllocated - pickedUp);
  const pickupPct = totalAllocated > 0 ? Math.round((pickedUp / totalAllocated) * 100) : 0;

  // Calculate stay duration in nights
  const start = new Date(currentBlock.startDate);
  const end = new Date(currentBlock.endDate);
  const stayNights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalRoomNights = totalAllocated * stayNights;
  const pickedUpRoomNights = pickedUp * stayNights;
  const projectedRoomRevenue = pickedUpRoomNights * currentBlock.negotiatedRate;

  // Attrition analysis
  const thresholdPct = currentBlock.attritionThresholdPercent || 80;
  const minRequiredNights = Math.ceil(totalRoomNights * (thresholdPct / 100));
  const shortfallNights = Math.max(0, minRequiredNights - pickedUpRoomNights);
  const isAttritionAtRisk = shortfallNights > 0 && pickupPct < thresholdPct;

  // Cut-off countdown
  const today = new Date("2026-09-04");
  const cutOff = new Date(currentBlock.cutOffDate);
  const daysToCutOff = Math.round((cutOff.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      {/* Top Selector & Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                OPERA Sales & Catering (Group Room Blocks)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                MICE & S&C ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Contract lifecycle, live inventory deduct status, daily room matrix, rooming list manifest & A/R master folio
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Group Block Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <label className="text-[11px] text-slate-400 pl-2 font-mono">Contract:</label>
            <select
              value={selectedBlockId}
              onChange={(e) => onSelectBlockId(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {groupBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.blockCode} - {b.groupName} ({b.status})
                </option>
              ))}
            </select>
          </div>

          {/* New Contract Button */}
          <button
            onClick={onNewBlockClick}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Contract New Block</span>
          </button>
        </div>
      </div>

      {/* Selected Block Master Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        {/* Header Title, Block Code & Lifecycle Machine */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentBlock.blockCode}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">{currentBlock.groupName}</h3>
              {/* Inventory Deduct Badge */}
              <span
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  currentBlock.status === "DEFINITE" || currentBlock.inventoryStatus === "DEDUCT"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
                title="Deduct blocks hold physical rooms out of transient CRS sale"
              >
                {currentBlock.status === "DEFINITE" || currentBlock.inventoryStatus === "DEDUCT" ? (
                  <>
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>DEDUCT INVENTORY</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 text-amber-400" />
                    <span>NON-DEDUCT (SOFT HOLD)</span>
                  </>
                )}
              </span>

              {/* Market Segment */}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {currentBlock.marketSegment || "MICE"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300 font-medium">{currentBlock.companyAccount || "Direct Account"}</span>
              </span>
              <span>•</span>
              <span>Contact: {currentBlock.contactPerson} ({currentBlock.contactEmail})</span>
              {currentBlock.rateCode && (
                <>
                  <span>•</span>
                  <span className="font-mono text-purple-400">Rate Plan: {currentBlock.rateCode}</span>
                </>
              )}
            </div>
          </div>

          {/* Opera Lifecycle Control Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono self-start md:self-auto">
            <span className="text-[10px] text-slate-400 px-2 font-sans font-medium">Lifecycle:</span>
            {(["TENTATIVE", "DEFINITE", "CLOSED", "CANCELLED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => onAdvanceStatus(st)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold cursor-pointer ${
                  currentBlock.status === st
                    ? st === "DEFINITE"
                      ? "bg-emerald-500 text-slate-950 shadow"
                      : st === "TENTATIVE"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : st === "CANCELLED"
                      ? "bg-rose-500 text-white shadow"
                      : "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Financial & Inventory KPI Cards (Grid of 5) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          {/* 1. Dates & Stay Horizon */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Stay Horizon</span>
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {currentBlock.startDate} <span className="text-slate-500 font-sans">→</span> {currentBlock.endDate}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{stayNights} Nights Duration</span>
              <span className="text-purple-400 font-mono font-semibold">{totalRoomNights} Total Nights</span>
            </div>
          </div>

          {/* 2. Room Pickup Progress */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Pickup Rate</span>
              <BedDouble className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-white font-mono">{pickedUp}</span>
              <span className="text-xs text-slate-400 font-mono">/ {totalAllocated} Rooms</span>
              <span className="text-xs font-bold text-purple-400 font-mono ml-auto">{pickupPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, pickupPct)}%` }}
              />
            </div>
          </div>

          {/* 3. Negotiated Rate & Revenue */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Negotiated Rate</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              ${currentBlock.negotiatedRate}
              <span className="text-xs text-slate-400 font-normal"> /nt</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Projected Rooms: <span className="text-white font-mono font-semibold">${projectedRoomRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* 4. Cut-Off Date & Attrition Status */}
          <div className={`p-3 rounded-xl border ${
            isAttritionAtRisk
              ? "bg-amber-500/5 border-amber-500/30"
              : "bg-slate-950/60 border-slate-800/80"
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Cut-Off Date</span>
              {isAttritionAtRisk ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {currentBlock.cutOffDate}
            </div>
            <div className="text-[10px] mt-1 flex items-center justify-between">
              <span className={daysToCutOff <= 2 ? "text-rose-400 font-bold" : "text-slate-400"}>
                {daysToCutOff > 0 ? `${daysToCutOff}d remaining` : "Cut-Off Passed"}
              </span>
              <span className={`font-mono font-bold ${isAttritionAtRisk ? "text-amber-400" : "text-emerald-400"}`}>
                {isAttritionAtRisk ? `Shortfall: ${shortfallNights} nts` : "Attrition OK"}
              </span>
            </div>
          </div>

          {/* 5. Master Folio Balance */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Master A/R Balance</span>
              <Receipt className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              ${(currentBlock.masterBalance || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Limit: ${(currentBlock.masterCreditLimit || 150000).toLocaleString()}</span>
              <span className="text-sky-400 font-mono">{currentBlock.masterFolioNo?.slice(0, 10) || "FOLIO-AR"}</span>
            </div>
          </div>
        </div>

        {/* Operational Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 border-t border-slate-800/80 pt-3 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => onTabChange("room-grid")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "room-grid"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Daily Room Inventory Grid</span>
          </button>

          <button
            onClick={() => onTabChange("rooming-list")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "rooming-list"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>2. Rooming List Manifest ({currentBlock.delegates?.length || 0})</span>
          </button>

          <button
            onClick={() => onTabChange("attrition-wash")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "attrition-wash"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. Attrition & Cut-Off Wash Engine</span>
            {isAttritionAtRisk && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onTabChange("master-folio")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "master-folio"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>4. Master Folio & A/R Ledger</span>
          </button>

          <button
            onClick={() => onTabChange("beo-events")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "beo-events"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>5. Banquet Event Orders (BEO) ({currentBlock.functionSpaces?.length || 0})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
