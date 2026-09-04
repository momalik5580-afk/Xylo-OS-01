import React from "react";
import {
  TrendingUp,
  Percent,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { AllotmentContract } from "../../../types";

interface AllotmentAnalyticsProps {
  contracts: AllotmentContract[];
  onSelectContract: (contractId: string) => void;
}

export const AllotmentAnalytics: React.FC<AllotmentAnalyticsProps> = ({
  contracts,
  onSelectContract,
}) => {
  // Compute metrics for each contract
  const partnersSummary = contracts.map((c) => {
    const totalDailyQuota = c.roomAllocations.reduce((sum, a) => sum + a.dailyQuota, 0);

    // Calculate nights & revenue from confirmed/active vouchers
    const activeVouchers = c.vouchers.filter((v) => v.status !== "CANCELLED");
    const totalPickedNights = activeVouchers.reduce((sum, v) => sum + v.nights, 0);
    const totalNetRevenue = activeVouchers.reduce((sum, v) => sum + v.totalNetCharge, 0);
    const totalBarEquivalent = activeVouchers.reduce((sum, v) => sum + v.retailBarEquivalent, 0);

    // Weighted average contracted net rate
    const avgNetRate =
      c.roomAllocations.reduce((acc, a) => acc + a.contractedNetRate * a.dailyQuota, 0) /
      (totalDailyQuota || 1);
    const avgBarRate =
      c.roomAllocations.reduce((acc, a) => acc + a.retailBarRate * a.dailyQuota, 0) /
      (totalDailyQuota || 1);

    // Baseline estimated monthly contracted nights (30 days * dailyQuota)
    const monthlyContractedNights = totalDailyQuota * 30;
    const materializationRate = Math.min(
      100,
      Math.round((totalPickedNights / Math.max(1, monthlyContractedNights * 0.4)) * 100)
    );

    const discountPct = Math.round(((avgBarRate - avgNetRate) / avgBarRate) * 100);

    return {
      contract: c,
      totalDailyQuota,
      activeVouchersCount: activeVouchers.length,
      totalPickedNights,
      totalNetRevenue,
      totalBarEquivalent,
      avgNetRate: Math.round(avgNetRate),
      avgBarRate: Math.round(avgBarRate),
      discountPct,
      materializationRate,
    };
  });

  const grandTotalQuota = partnersSummary.reduce((acc, p) => acc + p.totalDailyQuota, 0);
  const grandTotalRevenue = partnersSummary.reduce((acc, p) => acc + p.totalNetRevenue, 0);
  const grandTotalNights = partnersSummary.reduce((acc, p) => acc + p.totalPickedNights, 0);
  const grandAvgMaterialization = Math.round(
    partnersSummary.reduce((acc, p) => acc + p.materializationRate, 0) / (partnersSummary.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top High-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Wholesale Allotments</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{contracts.length} Partners</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active Contracted Quotas</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Daily Quota Committed</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
            {grandTotalQuota} Rooms / Night
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across All Tour Operators</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Wholesale Net Revenue Recognized</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ${grandTotalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {grandTotalNights} Picked Room Nights
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Avg Materialization Efficiency</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {grandAvgMaterialization}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target Benchmark: &gt;75%</div>
        </div>
      </div>

      {/* Partner Comparison Matrix */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Tour Operator & Wholesaler Performance League</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating contractual pickup velocity, materialization rates, and net yield parity.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-3 px-4">Partner & Contract Code</th>
                <th className="py-3 px-4">Segment & Type</th>
                <th className="py-3 px-4">Daily Quota</th>
                <th className="py-3 px-4">Picked Nights</th>
                <th className="py-3 px-4">Materialization %</th>
                <th className="py-3 px-4 text-right">Avg Net Rate</th>
                <th className="py-3 px-4 text-right">Wholesale Revenue</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {partnersSummary.map((p) => {
                return (
                  <tr key={p.contract.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Partner Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm font-sans">
                        {p.contract.partnerName}
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                        {p.contract.contractCode} • {p.contract.releaseDays}d Release
                      </div>
                    </td>

                    {/* Segment */}
                    <td className="py-3 px-4 font-sans">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {p.contract.partnerType.replace("_", " ")}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {p.contract.allotmentType.replace("_", " ")}
                      </div>
                    </td>

                    {/* Daily Quota */}
                    <td className="py-3 px-4 font-bold text-white">
                      {p.totalDailyQuota} Rms/Day
                    </td>

                    {/* Picked Nights */}
                    <td className="py-3 px-4 text-indigo-300 font-bold">
                      {p.totalPickedNights} Nights
                      <div className="text-[10px] text-slate-500 font-sans">
                        {p.activeVouchersCount} Vouchers
                      </div>
                    </td>

                    {/* Materialization */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.materializationRate >= 75
                                ? "bg-emerald-500"
                                : p.materializationRate >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${p.materializationRate}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold text-xs ${
                            p.materializationRate >= 75
                              ? "text-emerald-400"
                              : p.materializationRate >= 50
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {p.materializationRate}%
                        </span>
                      </div>
                    </td>

                    {/* Avg Net Rate */}
                    <td className="py-3 px-4 text-right">
                      <div className="text-white font-bold">${p.avgNetRate}</div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        BAR: ${p.avgBarRate} (-{p.discountPct}%)
                      </div>
                    </td>

                    {/* Wholesale Revenue */}
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold text-sm">
                      ${p.totalNetRevenue.toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => onSelectContract(p.contract.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center space-x-1 ml-auto"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contracting Strategic AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
            <Award className="w-4 h-4" />
            <span>High-Yield Allotment Performance</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>TUI Nordic Holidays</strong> and <strong>Emirates Crew Quota</strong> exhibit superior pickup consistency (&gt;75%). Emirates Crew provides 100% dead-bed take-or-pay guarantee, securing base occupancy of 15 rooms nightly at zero displacement risk.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Yield & Release Optimization Advice</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            For <strong>Hotelbeds B2B Wholesaler</strong>, current 7-day release window results in last-minute washes during high-season compression. Recommended: Shift release window to 10 days for Q4 or enforce stop-sales on Formula 1 weekend.
          </p>
        </div>
      </div>
    </div>
  );
};
