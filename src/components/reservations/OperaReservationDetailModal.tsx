import React, { useState } from "react";
import {
  X,
  User,
  Building2,
  Briefcase,
  CreditCard,
  Calendar,
  Sparkles,
  Key,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Send,
  BedDouble,
  DollarSign,
  Plus,
} from "lucide-react";
import { Reservation, OperaTrace, GuaranteeType, RoutingInstructionType } from "../../types";

interface OperaReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
  onUpdateReservation: (updated: Reservation) => void;
}

export const OperaReservationDetailModal: React.FC<OperaReservationDetailModalProps> = ({
  reservation,
  onClose,
  onUpdateReservation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "routing" | "rate-grid" | "traces" | "guarantee">("profile");

  // Local state for interactive editing
  const [digitalKey, setDigitalKey] = useState(reservation.digitalKeyActive);
  const [routingType, setRoutingType] = useState<RoutingInstructionType>(
    reservation.routingInstruction || (reservation.groupBlockCode ? "MASTER_ROOM_AND_TAX" : "INDIVIDUAL_OWN_ACCOUNT")
  );
  const [guarantee, setGuarantee] = useState<GuaranteeType>(
    reservation.guaranteeType || "CC_GUARANTEE"
  );

  // Traces local state
  const [traces, setTraces] = useState<OperaTrace[]>(
    reservation.traces || [
      {
        id: "tr-1",
        department: "FRONT_DESK",
        date: "2026-09-04",
        note: "VIP Welcome: General Manager personal greeting & escort to suite.",
        resolved: false,
      },
      {
        id: "tr-2",
        department: "HOUSEKEEPING",
        date: "2026-09-04",
        note: "Feather-free synthetic microfiber pillows requested for allergy.",
        resolved: true,
      },
      {
        id: "tr-3",
        department: "CONCIERGE",
        date: "2026-09-05",
        note: "Airport Bentley transfer arranged for 16:30 arrival at Terminal 3.",
        resolved: false,
      },
    ]
  );
  const [newTraceDept, setNewTraceDept] = useState<OperaTrace["department"]>("FRONT_DESK");
  const [newTraceNote, setNewTraceNote] = useState("");

  const handleToggleDigitalKey = () => {
    const nextKey = !digitalKey;
    setDigitalKey(nextKey);
    onUpdateReservation({ ...reservation, digitalKeyActive: nextKey });
  };

  const handleAddTrace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraceNote.trim()) return;
    const newTrace: OperaTrace = {
      id: `tr-${Date.now()}`,
      department: newTraceDept,
      date: new Date().toISOString().split("T")[0],
      note: newTraceNote,
      resolved: false,
    };
    const updated = [newTrace, ...traces];
    setTraces(updated);
    setNewTraceNote("");
    onUpdateReservation({ ...reservation, traces: updated });
  };

  const handleToggleTraceResolve = (id: string) => {
    const updated = traces.map((t) => (t.id === id ? { ...t, resolved: !t.resolved } : t));
    setTraces(updated);
    onUpdateReservation({ ...reservation, traces: updated });
  };

  // Generate Night-by-Night Rate Grid breakdown
  const generateDailyRateBreakdown = () => {
    const nights = Math.max(1, reservation.nights);
    const start = new Date(reservation.checkIn);
    return Array.from({ length: nights }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const base = reservation.ratePerNight;
      const tourismDirham = 20;
      const vat = Math.round(base * 0.05);
      const muniTax = Math.round(base * 0.07);
      const totalDaily = base + tourismDirham + vat + muniTax;
      return { dateStr, dayName, base, tourismDirham, vat, muniTax, totalDaily };
    });
  };

  const dailyRates = generateDailyRateBreakdown();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  OPERA Cloud Reservation Card
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CONF #{reservation.confirmationNo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    reservation.status === "CHECKED_IN"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  }`}
                >
                  {reservation.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {reservation.guestName} • Room {reservation.roomNumber || "ROH (Unassigned)"} • {reservation.roomCategory}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opera Sub-Tabs Navigator */}
        <div className="px-5 pt-3 border-b border-slate-800/80 bg-slate-900/50 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeSubTab === "profile"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Profiles (Guest & Corp)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("routing")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeSubTab === "routing"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>2. 3-Window Billing Routing</span>
          </button>

          <button
            onClick={() => setActiveSubTab("rate-grid")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeSubTab === "rate-grid"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Daily Rate Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab("traces")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeSubTab === "traces"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>4. Traces & Alerts ({traces.filter((t) => !t.resolved).length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("guarantee")}
            className={`pb-2.5 px-3 text-xs font-mono font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeSubTab === "guarantee"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Guarantee & Deposit</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: PROFILES LINKED */}
          {activeSubTab === "profile" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Individual Guest Profile */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase">Guest Profile</span>
                    </div>
                    {reservation.vipTier !== "None" && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                        {reservation.vipTier}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-white text-sm">{reservation.guestName}</div>
                    <div className="text-slate-400 font-mono">{reservation.guestEmail}</div>
                    <div className="text-slate-400 font-mono">{reservation.guestPhone}</div>
                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      Loyalty #: {reservation.loyaltyNumber || "XYLO-88201-GOLD"}
                    </div>
                  </div>
                </div>

                {/* Corporate Account Profile */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase">Corporate Account</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300">
                      A/R 9042
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-white">
                      {reservation.companyName || (reservation.groupBlockCode ? "Vance Global Tech Consortium" : "Direct Corporate Billing")}
                    </div>
                    <div className="text-slate-400 font-mono">
                      Rate Code: <strong className="text-emerald-400">{reservation.ratePlan}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Credit Limit: <strong className="text-white">$150,000 (30 Days A/R)</strong>
                    </div>
                  </div>
                </div>

                {/* Travel Agent / Channel Source */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase">Channel / Agent</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      {reservation.channel}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-white">
                      {reservation.travelAgent || "Direct CRS (Zero Commission)"}
                    </div>
                    <div className="text-slate-400 font-mono">
                      IATA #: {reservation.iataNumber || "IATA-992100"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Market Code: {reservation.marketCode || (reservation.groupBlockCode ? "MICE_CORP" : "TRANSIENT_FIT")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Room Key & Physical Station Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Digital RFID Key Access</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          digitalKey ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {digitalKey ? "ACTIVE ON APPLE WALLET" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Target Lock: Door {reservation.roomNumber || "Suite 801"} • Battery: 94% • BLE Paired
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleDigitalKey}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
                    digitalKey
                      ? "bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {digitalKey ? "Revoke Digital Key" : "Issue / Re-encode Digital Key"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OPERA 3-WINDOW BILLING ROUTING */}
          {activeSubTab === "routing" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-300 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>OPERA Multi-Window Folio Routing Protocol</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Automatically routes specific charge codes (Room, Tax, F&B, Spa, Incidentals) to designated Master Accounts or Guest Folios.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Window 1: Room & Tax */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-white">Window 1: Room & Tax</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300">
                      Code: 1000/1001
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Routed To:</div>
                    <div className="p-2 rounded bg-slate-950 font-mono font-bold text-emerald-400">
                      {routingType === "MASTER_ROOM_AND_TAX" || routingType === "ALL_TO_MASTER"
                        ? "Master Folio #9042 (Company A/R)"
                        : "Individual Guest Folio"}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Includes nightly rate, municipal fee, and tourism taxes.</p>
                </div>

                {/* Window 2: Incidentals & F&B */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-white">Window 2: Incidentals & F&B</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                      Code: 2000/3000
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Routed To:</div>
                    <div className="p-2 rounded bg-slate-950 font-mono font-bold text-sky-400">
                      {routingType === "ALL_TO_MASTER"
                        ? "Master Folio #9042 (Company A/R)"
                        : "Guest Personal CC (Visa *4242)"}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Minibar, room service, Azure Spa, and valet expenses.</p>
                </div>

                {/* Window 3: Banqueting / BEO */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-white">Window 3: Banqueting & BEO</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300">
                      Code: 4000
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Routed To:</div>
                    <div className="p-2 rounded bg-slate-950 font-mono font-bold text-purple-400">
                      Event Master A/R #9042
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Ballroom rental, audiovisual packages, and group banquets.</p>
                </div>
              </div>

              {/* Routing Rule Selector */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-bold text-white uppercase">
                  Select Opera Routing Instruction Rule:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-2 transition-all ${
                      routingType === "MASTER_ROOM_AND_TAX"
                        ? "bg-purple-950/40 border-purple-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="routing"
                      checked={routingType === "MASTER_ROOM_AND_TAX"}
                      onChange={() => {
                        setRoutingType("MASTER_ROOM_AND_TAX");
                        onUpdateReservation({ ...reservation, routingInstruction: "MASTER_ROOM_AND_TAX" });
                      }}
                      className="text-purple-500"
                    />
                    <div>
                      <div className="font-bold">Room & Tax to Master</div>
                      <div className="text-[10px] opacity-80">Incidentals to Guest Own Account</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-2 transition-all ${
                      routingType === "ALL_TO_MASTER"
                        ? "bg-purple-950/40 border-purple-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="routing"
                      checked={routingType === "ALL_TO_MASTER"}
                      onChange={() => {
                        setRoutingType("ALL_TO_MASTER");
                        onUpdateReservation({ ...reservation, routingInstruction: "ALL_TO_MASTER" });
                      }}
                      className="text-purple-500"
                    />
                    <div>
                      <div className="font-bold">All Charges to Master</div>
                      <div className="text-[10px] opacity-80">100% Bill to Corporate A/R</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-2 transition-all ${
                      routingType === "INDIVIDUAL_OWN_ACCOUNT"
                        ? "bg-purple-950/40 border-purple-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="routing"
                      checked={routingType === "INDIVIDUAL_OWN_ACCOUNT"}
                      onChange={() => {
                        setRoutingType("INDIVIDUAL_OWN_ACCOUNT");
                        onUpdateReservation({ ...reservation, routingInstruction: "INDIVIDUAL_OWN_ACCOUNT" });
                      }}
                      className="text-purple-500"
                    />
                    <div>
                      <div className="font-bold">Individual Own Account</div>
                      <div className="text-[10px] opacity-80">Guest settles entire folio</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY NIGHTLY RATE MATRIX */}
          {activeSubTab === "rate-grid" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Daily Rate & Tax Schedule (Opera Rate Grid)</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Night-by-night breakdown of accommodation charges, taxes, and service fees
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">Total Stay Charges</div>
                  <div className="text-xl font-black text-emerald-400 font-mono">${reservation.totalAmount}</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Day</th>
                      <th className="p-3">Base Room Rate</th>
                      <th className="p-3">Tourism Dirham</th>
                      <th className="p-3">VAT (5%)</th>
                      <th className="p-3">Muni Tax (7%)</th>
                      <th className="p-3 text-right">Daily Net Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {dailyRates.map((day, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-200">{day.dateStr}</td>
                        <td className="p-3 text-slate-400 font-bold">{day.dayName}</td>
                        <td className="p-3 text-white font-bold">${day.base}</td>
                        <td className="p-3 text-slate-400">${day.tourismDirham}</td>
                        <td className="p-3 text-slate-400">${day.vat}</td>
                        <td className="p-3 text-slate-400">${day.muniTax}</td>
                        <td className="p-3 text-right font-black text-emerald-400">${day.totalDaily}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OPERA TRACES & ALERTS */}
          {activeSubTab === "traces" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Departmental Traces & Alerts</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Directives executed across Front Desk, Housekeeping, Concierge, and Engineering
                  </p>
                </div>
              </div>

              {/* Add Trace Form */}
              <form onSubmit={handleAddTrace} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-bold text-white uppercase">Add New Department Trace:</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newTraceDept}
                    onChange={(e) => setNewTraceDept(e.target.value as any)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="FRONT_DESK">Front Desk</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="CONCIERGE">Concierge</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="REVENUE">Revenue</option>
                    <option value="FINANCE">Finance</option>
                  </select>

                  <input
                    type="text"
                    value={newTraceNote}
                    onChange={(e) => setNewTraceNote(e.target.value)}
                    placeholder="E.g., Arrange champagne and strawberry welcome platter at 15:00..."
                    className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Trace</span>
                  </button>
                </div>
              </form>

              {/* Traces List */}
              <div className="space-y-2">
                {traces.map((trace) => (
                  <div
                    key={trace.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      trace.resolved
                        ? "bg-slate-950 border-slate-900 opacity-60"
                        : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTraceResolve(trace.id)}
                        className={`mt-0.5 p-1 rounded transition-colors ${
                          trace.resolved
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-500 hover:text-white"
                        }`}
                        title="Mark resolved"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {trace.department}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{trace.date}</span>
                        </div>
                        <p className={`text-xs ${trace.resolved ? "line-through text-slate-400" : "text-slate-200"}`}>
                          {trace.note}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        trace.resolved ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      {trace.resolved ? "RESOLVED" : "PENDING"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GUARANTEE & DEPOSIT */}
          {activeSubTab === "guarantee" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-white uppercase border-b border-slate-800 pb-2">
                    Guarantee Status
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Guarantee Type:</span>
                      <span className="text-white font-bold">{guarantee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status:</span>
                      <span className="text-emerald-400 font-bold">
                        {reservation.paidAmount >= reservation.totalAmount ? "FULLY PREPAID" : "CREDIT CARD ON FILE"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pre-Auth Amount:</span>
                      <span className="text-white font-bold">${reservation.totalAmount + 500} (Inc. $500 Incidentals)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Card Mask:</span>
                      <span className="text-slate-300">•••• •••• •••• 4242 (Exp: 08/29)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-white uppercase border-b border-slate-800 pb-2">
                    Cancellation Policy & Penalties
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>
                      <strong>48-Hour Standard Cut-Off:</strong> Free cancellation permitted until 15:00 local time, 2 days prior to scheduled arrival.
                    </p>
                    <p className="text-rose-400">
                      Late cancellation penalty: 1st night room & tax ($ {reservation.ratePerNight}) forfeited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            OPERA Cloud PMS ID: <span className="text-slate-200 font-bold">{reservation.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs transition-colors"
            >
              Close Folio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
