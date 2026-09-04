import React, { useState } from "react";
import {
  Ban,
  Plus,
  Trash2,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  AllotmentContract,
  AllotmentStopSale,
  RoomCategory,
} from "../../../types";

interface AllotmentStopSalesProps {
  contract: AllotmentContract;
  onUpdateContract: (updated: AllotmentContract) => void;
}

export const AllotmentStopSales: React.FC<AllotmentStopSalesProps> = ({
  contract,
  onUpdateContract,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("2026-09-18");
  const [endDate, setEndDate] = useState("2026-09-20");
  const [roomCat, setRoomCat] = useState<RoomCategory | "ALL">("ALL");
  const [reason, setReason] = useState("High Demand Peak Weekend Compression");

  const handleAddStopSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const newSS: AllotmentStopSale = {
      id: `ss-${Date.now()}`,
      startDate,
      endDate,
      roomCategory: roomCat,
      reason: reason.trim() || "Yield Optimization",
      appliedDate: new Date().toISOString().split("T")[0],
      appliedBy: "Revenue Manager",
    };

    onUpdateContract({
      ...contract,
      stopSales: [newSS, ...contract.stopSales],
    });

    setIsModalOpen(false);
  };

  const handleRemoveStopSale = (id: string) => {
    onUpdateContract({
      ...contract,
      stopSales: contract.stopSales.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="text-red-300 font-semibold block text-sm">
            Stop-Sale & Blackout Protection Engine
          </strong>
          Applying a stop-sale blocks wholesaler and tour operator voucher bookings for the selected date range.
          Rooms are retained by hotel revenue management for direct high-yield transient distribution at full Best Available Rate (BAR).
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div>
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Ban className="w-4 h-4 text-red-400" />
            <span>Active Stop-Sales for {contract.partnerName}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {contract.stopSales.length} active restriction{contract.stopSales.length !== 1 ? "s" : ""} on record.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-red-950/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Apply New Stop-Sale</span>
        </button>
      </div>

      {/* Stop Sales List */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">Restriction Period</th>
                <th className="py-3 px-4">Impacted Room Category</th>
                <th className="py-3 px-4">Reason & Justification</th>
                <th className="py-3 px-4">Applied Date & By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {contract.stopSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-sans">
                    No active stop-sales or blackout periods applied. Allotment is fully open according to contract terms.
                  </td>
                </tr>
              ) : (
                contract.stopSales.map((ss) => (
                  <tr key={ss.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-400" />
                        <span>{ss.startDate}</span>
                        <span className="text-slate-500 font-sans">→</span>
                        <span>{ss.endDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {ss.roomCategory === "ALL" ? "All Contracted Categories" : ss.roomCategory}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="text-slate-300 font-medium">{ss.reason}</span>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                      <div>{ss.appliedDate}</div>
                      <div className="text-slate-500">{ss.appliedBy}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                        <Ban className="w-2.5 h-2.5" />
                        <span>ACTIVE STOP</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleRemoveStopSale(ss.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 border border-slate-700 text-[11px] transition-colors flex items-center space-x-1 ml-auto"
                        title="Lift Stop-Sale"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Lift Stop</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Stop-Sale */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Ban className="w-5 h-5 text-red-400" />
                <span>Apply Stop-Sale / Blackout</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStopSale} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Category</label>
                <select
                  value={roomCat}
                  onChange={(e) => setRoomCat(e.target.value as RoomCategory | "ALL")}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="ALL">ALL Room Categories</option>
                  {contract.roomAllocations.map((a) => (
                    <option key={a.roomCategory} value={a.roomCategory}>
                      {a.roomCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reason for Stop-Sale</label>
                <input
                  type="text"
                  placeholder="e.g. F1 Grand Prix Compression, Sold Out to High-Yield Direct"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Enforce Stop-Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
