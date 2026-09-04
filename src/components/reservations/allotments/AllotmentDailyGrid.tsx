import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Plus,
  Ban,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Bed,
} from "lucide-react";
import {
  AllotmentContract,
  AllotmentDailyQuota,
  RoomCategory,
  MealPlan,
} from "../../../types";

interface AllotmentDailyGridProps {
  contract: AllotmentContract;
  onUpdateContract: (updated: AllotmentContract) => void;
  onOpenNewVoucher: (category: RoomCategory, date: string) => void;
}

export const AllotmentDailyGrid: React.FC<AllotmentDailyGridProps> = ({
  contract,
  onUpdateContract,
  onOpenNewVoucher,
}) => {
  // Start from today: 2026-09-04
  const [startDateStr, setStartDateStr] = useState<string>("2026-09-04");
  const [daysCount, setDaysCount] = useState<number>(10);

  // Generate date array
  const dates: { dateStr: string; dayName: string; dayNum: string; isWeekend: boolean }[] = [];
  const baseDate = new Date(startDateStr);
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    dates.push({ dateStr, dayName, dayNum, isWeekend });
  }

  // Calculate days difference from today (2026-09-04)
  const today = new Date("2026-09-04");

  // Helper to get vouchers active on a given date for a category
  const getPickedUpCount = (dateStr: string, category: RoomCategory): number => {
    return contract.vouchers.filter((v) => {
      if (v.status === "CANCELLED") return false;
      if (v.roomCategory !== category) return false;
      return dateStr >= v.checkIn && dateStr < v.checkOut;
    }).length;
  };

  // Helper to check if stop sale applies
  const isDateStopSale = (dateStr: string, category: RoomCategory): { isStopped: boolean; reason?: string } => {
    const found = contract.stopSales.find(
      (ss) =>
        dateStr >= ss.startDate &&
        dateStr <= ss.endDate &&
        (ss.roomCategory === "ALL" || ss.roomCategory === category)
    );
    return {
      isStopped: !!found,
      reason: found?.reason,
    };
  };

  // Check if date is within release cutoff
  const getReleaseStatus = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (contract.allotmentType === "GUARANTEED_BLOCK") {
      return {
        label: "Guaranteed (Dead-Bed)",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        isPastRelease: false,
        daysLeft: diffDays,
      };
    }

    if (diffDays <= contract.releaseDays) {
      return {
        label: `Past Cut-Off (${contract.releaseDays}d)`,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        isPastRelease: true,
        daysLeft: diffDays,
      };
    }

    const daysUntilRelease = diffDays - contract.releaseDays;
    return {
      label: `Release in ${daysUntilRelease}d`,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      isPastRelease: false,
      daysLeft: daysUntilRelease,
    };
  };

  const handleToggleStopSaleForDate = (dateStr: string, category: RoomCategory) => {
    const { isStopped } = isDateStopSale(dateStr, category);
    let updatedStopSales = [...contract.stopSales];

    if (isStopped) {
      // Remove stop sale for this date
      updatedStopSales = updatedStopSales.filter(
        (ss) =>
          !(
            dateStr >= ss.startDate &&
            dateStr <= ss.endDate &&
            (ss.roomCategory === "ALL" || ss.roomCategory === category)
          )
      );
    } else {
      // Add stop sale for single date
      updatedStopSales.push({
        id: `ss-${Date.now()}`,
        startDate: dateStr,
        endDate: dateStr,
        roomCategory: category,
        reason: "Manual Yield Protection / Capacity Compression",
        appliedDate: new Date().toISOString().split("T")[0],
        appliedBy: "Revenue Manager",
      });
    }

    onUpdateContract({
      ...contract,
      stopSales: updatedStopSales,
    });
  };

  const shiftDates = (offset: number) => {
    const cur = new Date(startDateStr);
    cur.setDate(cur.getDate() + offset);
    setStartDateStr(cur.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      {/* Grid Controls & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => shiftDates(-7)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Previous 7 Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStartDateStr("2026-09-04")}
              className="px-2.5 py-1 text-xs font-mono font-bold text-amber-400 hover:text-amber-300"
            >
              Today (Sep 4)
            </button>
            <button
              onClick={() => shiftDates(7)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Next 7 Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Viewing <span className="font-semibold text-white">{daysCount} days</span> starting from{" "}
            <span className="font-mono text-amber-400">{startDateStr}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Open Allotment</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Past Rolling Cutoff</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
            <Ban className="w-3 h-3 text-red-400" />
            <span>Stop Sale</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Guaranteed Quota</span>
          </span>
        </div>
      </div>

      {/* 2D Daily Quota Matrix by Category */}
      <div className="space-y-6">
        {contract.roomAllocations.map((alloc) => {
          return (
            <div
              key={alloc.roomCategory}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl"
            >
              {/* Category Header */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center space-x-2">
                      <span>{alloc.roomCategory}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
                        Daily Quota: {alloc.dailyQuota} rooms
                      </span>
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center space-x-3 mt-0.5">
                      <span>
                        Contracted Net:{" "}
                        <strong className="text-emerald-400 font-mono">
                          ${alloc.contractedNetRate}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Public BAR:{" "}
                        <strong className="text-slate-300 font-mono line-through">
                          ${alloc.retailBarRate}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">
                        Wholesale Margin: {Math.round(((alloc.retailBarRate - alloc.contractedNetRate) / alloc.retailBarRate) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenNewVoucher(alloc.roomCategory, startDateStr)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Pick Up Voucher Booking</span>
                  </button>
                </div>
              </div>

              {/* Day-by-Day Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40">
                      <th className="py-2.5 px-3 font-semibold text-slate-400 w-28 sticky left-0 bg-slate-950/90 z-10">
                        Metric
                      </th>
                      {dates.map((d) => (
                        <th
                          key={d.dateStr}
                          className={`py-2.5 px-3 font-mono text-center min-w-[100px] border-l border-slate-800/60 ${
                            d.isWeekend ? "bg-slate-900/60" : ""
                          }`}
                        >
                          <div className="text-[10px] text-slate-400 uppercase font-sans">
                            {d.dayName}
                          </div>
                          <div className="font-bold text-white text-xs">{d.dayNum}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {/* Row 1: Release / Cut-Off Status */}
                    <tr className="bg-slate-900/30 text-[10px]">
                      <td className="py-2 px-3 text-slate-400 font-sans font-medium sticky left-0 bg-slate-950/90 z-10">
                        Release Window
                      </td>
                      {dates.map((d) => {
                        const rel = getReleaseStatus(d.dateStr);
                        const stop = isDateStopSale(d.dateStr, alloc.roomCategory);
                        return (
                          <td
                            key={d.dateStr}
                            className={`py-1.5 px-2 text-center border-l border-slate-800/60 ${
                              d.isWeekend ? "bg-slate-900/40" : ""
                            }`}
                          >
                            {stop.isStopped ? (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-800">
                                <Ban className="w-2.5 h-2.5" />
                                <span>STOP SALE</span>
                              </span>
                            ) : (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[9px] border font-sans ${rel.color}`}
                              >
                                {rel.label}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 2: Contracted Quota */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-300 font-sans font-medium sticky left-0 bg-slate-950/90 z-10">
                        Contract Quota
                      </td>
                      {dates.map((d) => (
                        <td
                          key={d.dateStr}
                          className={`py-2 px-3 text-center border-l border-slate-800/60 font-bold text-slate-200 ${
                            d.isWeekend ? "bg-slate-900/40" : ""
                          }`}
                        >
                          {alloc.dailyQuota}
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Picked Up via Vouchers */}
                    <tr className="hover:bg-slate-800/30 bg-indigo-950/10">
                      <td className="py-2.5 px-3 text-indigo-300 font-sans font-medium sticky left-0 bg-slate-950/90 z-10 flex items-center justify-between">
                        <span>Picked Up</span>
                        <span className="text-[10px] text-indigo-400 font-mono">Vouchers</span>
                      </td>
                      {dates.map((d) => {
                        const picked = getPickedUpCount(d.dateStr, alloc.roomCategory);
                        const pct = Math.round((picked / alloc.dailyQuota) * 100);
                        return (
                          <td
                            key={d.dateStr}
                            className={`py-2 px-3 text-center border-l border-slate-800/60 ${
                              d.isWeekend ? "bg-slate-900/40" : ""
                            }`}
                          >
                            <div className="font-bold text-indigo-300 text-sm">{picked}</div>
                            <div className="text-[9px] text-slate-400 font-sans">{pct}%</div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 4: Remaining Available Quota */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-emerald-300 font-sans font-medium sticky left-0 bg-slate-950/90 z-10">
                        Remaining Quota
                      </td>
                      {dates.map((d) => {
                        const picked = getPickedUpCount(d.dateStr, alloc.roomCategory);
                        const stop = isDateStopSale(d.dateStr, alloc.roomCategory);
                        const remaining = stop.isStopped ? 0 : Math.max(0, alloc.dailyQuota - picked);
                        return (
                          <td
                            key={d.dateStr}
                            className={`py-2 px-3 text-center border-l border-slate-800/60 ${
                              d.isWeekend ? "bg-slate-900/40" : ""
                            }`}
                          >
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                                remaining === 0
                                  ? "text-slate-500 bg-slate-800/40"
                                  : remaining <= 2
                                  ? "text-amber-400 bg-amber-500/10"
                                  : "text-emerald-400 bg-emerald-500/10"
                              }`}
                            >
                              {remaining}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 5: Actions (Quick Pick Up & Stop Sale Toggle) */}
                    <tr className="bg-slate-950/40">
                      <td className="py-2 px-3 text-slate-400 font-sans text-[11px] sticky left-0 bg-slate-950/90 z-10">
                        Cell Controls
                      </td>
                      {dates.map((d) => {
                        const stop = isDateStopSale(d.dateStr, alloc.roomCategory);
                        return (
                          <td
                            key={d.dateStr}
                            className={`py-2 px-2 text-center border-l border-slate-800/60 ${
                              d.isWeekend ? "bg-slate-900/40" : ""
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => onOpenNewVoucher(alloc.roomCategory, d.dateStr)}
                                className="p-1 rounded bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 transition-colors"
                                title={`Pick up voucher booking for ${d.dateStr}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleToggleStopSaleForDate(d.dateStr, alloc.roomCategory)}
                                className={`p-1 rounded transition-colors ${
                                  stop.isStopped
                                    ? "bg-red-500 text-white hover:bg-red-400"
                                    : "bg-slate-800 text-slate-400 hover:bg-red-950 hover:text-red-300"
                                }`}
                                title={stop.isStopped ? "Remove Stop-Sale" : "Apply Stop-Sale"}
                              >
                                <Ban className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
