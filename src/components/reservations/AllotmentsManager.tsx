import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  Ban,
  RotateCcw,
  TrendingUp,
  FileText,
  Users,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Utensils,
  Bed,
  Tag,
  ChevronRight,
  Compass,
} from "lucide-react";
import {
  AllotmentContract,
  AllotmentPartnerType,
  AllotmentType,
  MealPlan,
  RoomCategory,
  Reservation,
} from "../../types";
import { AllotmentDailyGrid } from "./allotments/AllotmentDailyGrid";
import { AllotmentVouchersList } from "./allotments/AllotmentVouchersList";
import { AllotmentStopSales } from "./allotments/AllotmentStopSales";
import { AllotmentReleaseWash } from "./allotments/AllotmentReleaseWash";
import { AllotmentAnalytics } from "./allotments/AllotmentAnalytics";

type AllotmentSubTab =
  | "daily-grid"
  | "vouchers-manifest"
  | "stop-sales"
  | "release-wash"
  | "analytics";

interface AllotmentsManagerProps {
  contracts: AllotmentContract[];
  onUpdateContract: (updated: AllotmentContract) => void;
  onNewContract: (newContract: AllotmentContract) => void;
  onSyncReservationToPms: (reservation: Reservation) => void;
  onCheckInVoucherPms?: (reservationId: string, roomNumber: string) => void;
  onCancelVoucherPms?: (reservationId: string) => void;
  onSwitchToGroupBlocks?: () => void;
  onShowToast?: (msg: string) => void;
}

export const AllotmentsManager: React.FC<AllotmentsManagerProps> = ({
  contracts,
  onUpdateContract,
  onNewContract,
  onSyncReservationToPms,
  onCheckInVoucherPms,
  onCancelVoucherPms,
  onSwitchToGroupBlocks,
  onShowToast,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(
    contracts[0]?.id || ""
  );
  const [activeSubTab, setActiveSubTab] = useState<AllotmentSubTab>("daily-grid");
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>("ALL");

  // New Contract Modal State
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newContractCode, setNewContractCode] = useState("");
  const [newPartnerType, setNewPartnerType] = useState<AllotmentPartnerType>("TOUR_OPERATOR");
  const [newAllotmentType, setNewAllotmentType] = useState<AllotmentType>("ROLLING_RELEASE");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newValidFrom, setNewValidFrom] = useState("2026-05-01");
  const [newValidTo, setNewValidTo] = useState("2026-10-31");
  const [newReleaseDays, setNewReleaseDays] = useState(14);
  const [newMealPlan, setNewMealPlan] = useState<MealPlan>("HB");
  const [newQuotaKing, setNewQuotaKing] = useState(10);
  const [newNetRateKing, setNewNetRateKing] = useState(240);
  const [newQuotaSuite, setNewQuotaSuite] = useState(4);
  const [newNetRateSuite, setNewNetRateSuite] = useState(480);
  const [newPaymentTerms, setNewPaymentTerms] = useState("14-Day Post Departure Direct Billing");

  // Shortcut for opening single voucher modal from grid
  const [voucherModalTrigger, setVoucherModalTrigger] = useState<{
    category: RoomCategory;
    date: string;
  } | null>(null);

  // Active Contract
  const activeContract =
    contracts.find((c) => c.id === selectedContractId) || contracts[0];

  // Filtered Contracts for selector
  const filteredContracts = contracts.filter((c) => {
    if (partnerTypeFilter === "ALL") return true;
    return c.partnerType === partnerTypeFilter;
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !newContractCode.trim()) return;

    const contract: AllotmentContract = {
      id: `allot-${Date.now()}`,
      contractCode: newContractCode.toUpperCase().trim(),
      partnerName: newPartnerName.trim(),
      partnerType: newPartnerType,
      contactPerson: newContactPerson || "Key Account Director",
      contactEmail: newContactEmail || "contracting@partner.com",
      validFrom: newValidFrom,
      validTo: newValidTo,
      allotmentType: newAllotmentType,
      releaseDays: newReleaseDays,
      status: "ACTIVE",
      defaultMealPlan: newMealPlan,
      paymentTerms: newPaymentTerms,
      notes: "Contracted wholesale series allotment.",
      roomAllocations: [
        {
          roomCategory: "Deluxe King",
          dailyQuota: newQuotaKing,
          contractedNetRate: newNetRateKing,
          retailBarRate: 420,
          currency: "USD",
        },
        ...(newQuotaSuite > 0
          ? [
              {
                roomCategory: "Executive Ocean Suite" as RoomCategory,
                dailyQuota: newQuotaSuite,
                contractedNetRate: newNetRateSuite,
                retailBarRate: 750,
                currency: "USD",
              },
            ]
          : []),
      ],
      stopSales: [],
      vouchers: [],
      releaseLogs: [],
    };

    onNewContract(contract);
    setSelectedContractId(contract.id);
    setIsNewContractModalOpen(false);

    if (onShowToast) {
      onShowToast(`✓ Allotment Contract ${contract.contractCode} created.`);
    }
  };

  const handleWashExecuted = (roomsReleased: number, partnerName: string) => {
    if (onShowToast) {
      onShowToast(`✓ Successfully washed ${roomsReleased} rooms to house from ${partnerName}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Clarification & Cross-Navigation Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-950/40 shrink-0">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Allotments & Wholesaler Series Manager
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                Tour Operators & Bedbanks
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manage contracted standing room quotas for Tour Operators (TUI, DER Touristik), Wholesalers (Hotelbeds), and Airline Crew Layover blocks.
              Configure rolling release cutoff windows, stop-sales, voucher intake, and automated wash releases.
            </p>
          </div>
        </div>

        {/* Quick Cross-Nav to Group Blocks */}
        <div className="flex items-center space-x-2 shrink-0">
          {onSwitchToGroupBlocks && (
            <button
              onClick={onSwitchToGroupBlocks}
              className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Go to Single-Event MICE / Conference Group Blocks"
            >
              <Users className="w-4 h-4" />
              <span>Go to Group Blocks (MICE)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsNewContractModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-amber-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Allotment Contract</span>
          </button>
        </div>
      </div>

      {/* Contract Selector & Filter Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 font-medium">Select Allotment Partner:</div>

          {/* Partner Selector */}
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 min-w-[280px]"
          >
            {filteredContracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.partnerName} ({c.contractCode})
              </option>
            ))}
          </select>

          {/* Filter by Partner Type */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setPartnerTypeFilter("ALL")}
              className={`px-2 py-1 rounded transition-colors ${
                partnerTypeFilter === "ALL"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setPartnerTypeFilter("TOUR_OPERATOR")}
              className={`px-2 py-1 rounded transition-colors ${
                partnerTypeFilter === "TOUR_OPERATOR"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tour Operators
            </button>
            <button
              onClick={() => setPartnerTypeFilter("WHOLESALER_BEDBANK")}
              className={`px-2 py-1 rounded transition-colors ${
                partnerTypeFilter === "WHOLESALER_BEDBANK"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bedbanks
            </button>
            <button
              onClick={() => setPartnerTypeFilter("AIRLINE_CREW")}
              className={`px-2 py-1 rounded transition-colors ${
                partnerTypeFilter === "AIRLINE_CREW"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Airline Crew
            </button>
          </div>
        </div>

        {/* Selected Partner Badges */}
        {activeContract && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono font-bold">
              {activeContract.releaseDays}-Day Rolling Release
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold">
              {activeContract.defaultMealPlan} Plan
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {activeContract.validFrom} to {activeContract.validTo}
            </span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("daily-grid")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === "daily-grid"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Quota Matrix (Grid)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("vouchers-manifest")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === "vouchers-manifest"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Vouchers & Manifest ({activeContract?.vouchers.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("stop-sales")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === "stop-sales"
              ? "bg-red-600 text-white shadow-md shadow-red-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>Stop-Sale Restrictions ({activeContract?.stopSales.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("release-wash")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === "release-wash"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Rolling Release & Wash Automation</span>
        </button>

        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeSubTab === "analytics"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Partner Performance & Analytics</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeContract && activeSubTab === "daily-grid" && (
        <AllotmentDailyGrid
          contract={activeContract}
          onUpdateContract={onUpdateContract}
          onOpenNewVoucher={(category, date) => {
            setVoucherModalTrigger({ category, date });
            setActiveSubTab("vouchers-manifest");
          }}
        />
      )}

      {activeContract && activeSubTab === "vouchers-manifest" && (
        <AllotmentVouchersList
          contract={activeContract}
          onUpdateContract={onUpdateContract}
          onSyncReservationToPms={onSyncReservationToPms}
          onCheckInVoucherPms={onCheckInVoucherPms}
          onCancelVoucherPms={onCancelVoucherPms}
        />
      )}

      {activeContract && activeSubTab === "stop-sales" && (
        <AllotmentStopSales
          contract={activeContract}
          onUpdateContract={onUpdateContract}
        />
      )}

      {activeContract && activeSubTab === "release-wash" && (
        <AllotmentReleaseWash
          contract={activeContract}
          onUpdateContract={onUpdateContract}
          onWashExecuted={handleWashExecuted}
        />
      )}

      {activeSubTab === "analytics" && (
        <AllotmentAnalytics
          contracts={contracts}
          onSelectContract={(id) => {
            setSelectedContractId(id);
            setActiveSubTab("daily-grid");
          }}
        />
      )}

      {/* Modal: New Allotment Contract */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>Contract New Allotment Series</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Establish contracted room quota and release policies for Tour Operators or Wholesalers.
                </p>
              </div>
              <button
                onClick={() => setIsNewContractModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Partner Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kuoni Travel Switzerland"
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contract Reference Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ALLOT-KUONI-2026"
                    value={newContractCode}
                    onChange={(e) => setNewContractCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Partner Segment</label>
                  <select
                    value={newPartnerType}
                    onChange={(e) => setNewPartnerType(e.target.value as AllotmentPartnerType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="TOUR_OPERATOR">Tour Operator (Charter / Package Series)</option>
                    <option value="WHOLESALER_BEDBANK">Wholesaler / Bedbank (Hotelbeds, WebBeds)</option>
                    <option value="AIRLINE_CREW">Airline Flight Crew Quota</option>
                    <option value="TRAVEL_AGENCY_SERIES">Travel Agency Luxury Series</option>
                    <option value="CORPORATE_FIT">Corporate Standing Quota</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Allotment Contract Type</label>
                  <select
                    value={newAllotmentType}
                    onChange={(e) => setNewAllotmentType(e.target.value as AllotmentType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="ROLLING_RELEASE">Rolling Release (Unpicked rooms wash to house)</option>
                    <option value="GUARANTEED_BLOCK">Guaranteed Block (Take-or-pay dead bed commitment)</option>
                    <option value="FREE_SALE">Free-Sale (Open sale up to daily ceiling)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Valid From</label>
                  <input
                    type="date"
                    value={newValidFrom}
                    onChange={(e) => setNewValidFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Valid To</label>
                  <input
                    type="date"
                    value={newValidTo}
                    onChange={(e) => setNewValidTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Rolling Release Days</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={newReleaseDays}
                    onChange={(e) => setNewReleaseDays(parseInt(e.target.value) || 14)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Default Contract Meal Plan</label>
                  <select
                    value={newMealPlan}
                    onChange={(e) => setNewMealPlan(e.target.value as MealPlan)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="RO">RO - Room Only</option>
                    <option value="BB">BB - Bed & Breakfast</option>
                    <option value="HB">HB - Half Board (Breakfast + Dinner)</option>
                    <option value="FB">FB - Full Board</option>
                    <option value="AI">AI - All Inclusive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Payment & Billing Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Days Post-Departure Direct Billing"
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Room Allocations Definition */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="font-semibold text-white flex items-center space-x-2">
                  <Bed className="w-4 h-4 text-amber-400" />
                  <span>Contracted Daily Room Allocations & Net Rates</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Deluxe King Daily Quota</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newQuotaKing}
                      onChange={(e) => setNewQuotaKing(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Deluxe King Net Rate ($)</label>
                    <input
                      type="number"
                      min={50}
                      max={2000}
                      value={newNetRateKing}
                      onChange={(e) => setNewNetRateKing(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Executive Ocean Suite Daily Quota</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={newQuotaSuite}
                      onChange={(e) => setNewQuotaSuite(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Executive Ocean Suite Net Rate ($)</label>
                    <input
                      type="number"
                      min={50}
                      max={3000}
                      value={newNetRateSuite}
                      onChange={(e) => setNewNetRateSuite(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewContractModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-950/40"
                >
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
