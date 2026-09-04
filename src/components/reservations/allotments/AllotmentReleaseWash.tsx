import React, { useState } from "react";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  AllotmentContract,
  AllotmentReleaseLog,
  RoomCategory,
} from "../../../types";

interface AllotmentReleaseWashProps {
  contract: AllotmentContract;
  onUpdateContract: (updated: AllotmentContract) => void;
  onWashExecuted?: (roomsReleased: number, partnerName: string) => void;
}

export const AllotmentReleaseWash: React.FC<AllotmentReleaseWashProps> = ({
  contract,
  onUpdateContract,
  onWashExecuted,
}) => {
  const [washConfirmationOpen, setWashConfirmationOpen] = useState(false);

  // Today is 2026-09-04
  const todayStr = "2026-09-04";
  const today = new Date(todayStr);

  // Calculate cutoff threshold date based on contract.releaseDays
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() + contract.releaseDays);
  const cutoffDateStr = cutoffDate.toISOString().split("T")[0];

  // Calculate unpicked rooms for dates between today and cutoffDate
  const daysToCheck = contract.releaseDays;
  let totalUnpickedInReleaseWindow = 0;
  let estimatedBarValue = 0;

  const datesInCutoff: {
    dateStr: string;
    dayName: string;
    unpickedRooms: number;
    categoryBreakdown: { category: RoomCategory; unpicked: number; netRate: number; barRate: number }[];
  }[] = [];

  for (let i = 0; i < Math.min(daysToCheck, 14); i++) {
    const cur = new Date(today);
    cur.setDate(today.getDate() + i);
    const dStr = cur.toISOString().split("T")[0];
    const dName = cur.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const catBreakdown: { category: RoomCategory; unpicked: number; netRate: number; barRate: number }[] = [];
    let dayUnpicked = 0;

    contract.roomAllocations.forEach((alloc) => {
      const picked = contract.vouchers.filter(
        (v) => v.status !== "CANCELLED" && v.roomCategory === alloc.roomCategory && dStr >= v.checkIn && dStr < v.checkOut
      ).length;
      const unpicked = Math.max(0, alloc.dailyQuota - picked);

      dayUnpicked += unpicked;
      totalUnpickedInReleaseWindow += unpicked;
      estimatedBarValue += unpicked * alloc.retailBarRate;

      catBreakdown.push({
        category: alloc.roomCategory,
        unpicked,
        netRate: alloc.contractedNetRate,
        barRate: alloc.retailBarRate,
      });
    });

    datesInCutoff.push({
      dateStr: dStr,
      dayName: dName,
      unpickedRooms: dayUnpicked,
      categoryBreakdown: catBreakdown,
    });
  }

  // Execute wash
  const handleExecuteWash = () => {
    if (totalUnpickedInReleaseWindow === 0) return;

    const newLog: AllotmentReleaseLog = {
      id: `rel-${Date.now()}`,
      date: todayStr,
      roomsReleased: totalUnpickedInReleaseWindow,
      roomCategory: "ALL",
      targetArrivalDate: `${todayStr} to ${cutoffDateStr}`,
      reason: `${contract.releaseDays}-Day Rolling Release Wash: Reclaimed unpicked rooms to House Transient BAR`,
      triggeredBy: "Revenue Optimizer (Rolling Wash)",
      timestamp: new Date().toISOString(),
    };

    onUpdateContract({
      ...contract,
      releaseLogs: [newLog, ...contract.releaseLogs],
    });

    if (onWashExecuted) {
      onWashExecuted(totalUnpickedInReleaseWindow, contract.partnerName);
    }

    setWashConfirmationOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Explanation Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              Rolling Release Automation & Wash Engine
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Contract Terms:{" "}
              <strong className="text-amber-400 font-mono font-semibold">
                {contract.releaseDays}-Day Rolling Release
              </strong>{" "}
              ({contract.allotmentType === "GUARANTEED_BLOCK" ? "Guaranteed Dead-Bed Commitment" : "Standard Wholesaler Wash"}).
              Unreserved rooms inside the {contract.releaseDays}-day window can be washed back to house transient availability.
            </p>
          </div>
        </div>

        {/* Wash Trigger Button */}
        {contract.allotmentType !== "GUARANTEED_BLOCK" ? (
          <button
            onClick={() => setWashConfirmationOpen(true)}
            disabled={totalUnpickedInReleaseWindow === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg ${
              totalUnpickedInReleaseWindow > 0
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/40"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {totalUnpickedInReleaseWindow > 0
                ? `Wash & Release ${totalUnpickedInReleaseWindow} Rooms to House`
                : "No Expired Rooms to Wash"}
            </span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            Guaranteed Block (Take-or-Pay: 100% Contracted Liability)
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Unpicked Rooms in Release Horizon</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {totalUnpickedInReleaseWindow} Rooms
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Arrival dates up to <span className="text-white font-mono">{cutoffDateStr}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Potential Transient BAR Yield Value</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ${estimatedBarValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Reclaimed at Public Best Available Rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Historical Wash Executions</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
            {contract.releaseLogs.length} Events
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {contract.releaseLogs.reduce((acc, l) => acc + l.roomsReleased, 0)} Total Rooms Released
          </div>
        </div>
      </div>

      {/* Upcoming Release Window Schedule */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Next 14 Days: Unpicked Quota Eligible for House Release</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Cutoff Window: {contract.releaseDays} Days
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-2.5 px-4">Arrival Date</th>
                <th className="py-2.5 px-4">Days from Today</th>
                <th className="py-2.5 px-4">Unpicked Allotment Rooms</th>
                <th className="py-2.5 px-4">Category Breakdown</th>
                <th className="py-2.5 px-4 text-right">Potential BAR Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {datesInCutoff.map((d, i) => {
                return (
                  <tr key={d.dateStr} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-white">
                      {d.dateStr} <span className="text-slate-400 font-sans font-normal">({d.dayName})</span>
                    </td>

                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {i === 0 ? "Today" : `T + ${i} Days`}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-xs ${
                          d.unpickedRooms > 0
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            : "text-slate-500"
                        }`}
                      >
                        {d.unpickedRooms} Rooms Unpicked
                      </span>
                    </td>

                    <td className="py-2.5 px-4 font-sans text-slate-300">
                      <div className="flex flex-wrap gap-1.5">
                        {d.categoryBreakdown.map((cb) => (
                          <span
                            key={cb.category}
                            className="px-1.5 py-0.5 rounded bg-slate-950 text-[11px] text-slate-400 font-mono"
                          >
                            {cb.category}: <strong className="text-white">{cb.unpicked}</strong>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                      ${d.categoryBreakdown.reduce((sum, cb) => sum + cb.unpicked * cb.barRate, 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Release & Wash Log */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800">
          <h4 className="font-bold text-white text-sm flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Trail: Past Allotment Releases & Washes</span>
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-2.5 px-4">Execution Date</th>
                <th className="py-2.5 px-4">Rooms Released</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Target Horizon</th>
                <th className="py-2.5 px-4">Reason & Method</th>
                <th className="py-2.5 px-4 text-right">Triggered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {contract.releaseLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                    No release wash events recorded yet for this allotment contract.
                  </td>
                </tr>
              ) : (
                contract.releaseLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-white font-medium">{log.date}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        +{log.roomsReleased} Rooms
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">{log.roomCategory}</td>
                    <td className="py-2.5 px-4 text-slate-400">{log.targetArrivalDate}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">{log.reason}</td>
                    <td className="py-2.5 px-4 text-right font-sans text-slate-400">{log.triggeredBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {washConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Confirm Allotment Wash</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                You are about to release{" "}
                <strong className="text-amber-400 font-bold">{totalUnpickedInReleaseWindow} unpicked rooms</strong>{" "}
                back to general house inventory for{" "}
                <strong className="text-white">{contract.partnerName}</strong>.
              </p>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <strong className="block font-semibold">Revenue Protection Impact:</strong>
                These rooms will be instantly unlocked for transient booking on Direct Web and OTAs at Best Available Rate (~${estimatedBarValue.toLocaleString()} gross value).
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setWashConfirmationOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteWash}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Execute Wash Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
