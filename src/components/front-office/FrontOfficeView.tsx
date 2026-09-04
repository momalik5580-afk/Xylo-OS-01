import React, { useState } from "react";
import {
  DoorOpen,
  UserCheck,
  Search,
  Plus,
  Key,
  CreditCard,
  FileText,
  ArrowRightLeft,
  Crown,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  DollarSign,
  Calendar,
  Check,
  Wine,
  Shield,
  EyeOff,
  UserPlus,
  Send,
  Sliders,
  Award,
  Bell,
  HeartHandshake,
  CheckSquare,
  Square,
  ChevronRight,
  PlaneLanding,
} from "lucide-react";
import { Reservation, Room, RoomCategory, VipTier } from "../../types";

interface VipProtocolProfile {
  id: string;
  reservationId: string;
  guestName: string;
  aliasName?: string;
  isIncognito: boolean;
  vipTier: VipTier;
  roomNumber: string;
  suiteName: string;
  arrivalFlight?: string;
  eta: string;
  assignedButler: string;
  dutyManager: string;
  amenitiesStaged: boolean;
  climatePresetDone: boolean;
  curbsideGreetingDispatched: boolean;
  inSuiteCheckinCompleted: boolean;
  specialProtocol: string;
  dietaryRestrictions: string[];
  beveragePreference: string;
  securityClearance: "STANDARD" | "HIGH_PROFILE" | "HEAD_OF_STATE_ARMED";
}

interface FrontOfficeViewProps {
  reservations: Reservation[];
  rooms: Room[];
  onCheckInGuest: (reservationId: string, assignedRoom: string) => void;
  onCheckOutGuest: (reservationId: string) => void;
  onUpgradeGuest: (reservationId: string, newCategory: RoomCategory, newRoom: string) => void;
  onNewReservation: (reservation: Reservation) => void;
}

export const FrontOfficeView: React.FC<FrontOfficeViewProps> = ({
  reservations,
  rooms,
  onCheckInGuest,
  onCheckOutGuest,
  onUpgradeGuest,
  onNewReservation,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "IN_HOUSE" | "DUE_IN" | "DUE_OUT" | "VIP_MANAGEMENT">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [checkInModalRes, setCheckInModalRes] = useState<Reservation | null>(null);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>("");
  const [digitalKeyGenerated, setDigitalKeyGenerated] = useState<boolean>(false);
  const [signatureDone, setSignatureDone] = useState<boolean>(false);

  // Folio / Billing Modal
  const [folioModalRes, setFolioModalRes] = useState<Reservation | null>(null);
  const [folioExtraCharges, setFolioExtraCharges] = useState<{ desc: string; amt: number }[]>([
    { desc: "In-Room Dining (KDS #310)", amt: 189.20 },
    { desc: "Spa Guerlain Wellness Ritual", amt: 320.00 },
  ]);
  const [newChargeDesc, setNewChargeDesc] = useState<string>("Minibar Champagne & Caviar");
  const [newChargeAmt, setNewChargeAmt] = useState<string>("145.00");
  const [settledSuccess, setSettledSuccess] = useState<boolean>(false);

  // Upgrade Modal
  const [upgradeModalRes, setUpgradeModalRes] = useState<Reservation | null>(null);
  const [targetCategory, setTargetCategory] = useState<RoomCategory>("Presidential Penthouse");

  // New Walk-In Reservation Modal
  const [newWalkInOpen, setNewWalkInOpen] = useState<boolean>(false);
  const [walkInName, setWalkInName] = useState<string>("Countess Julianna Moore");
  const [walkInEmail, setWalkInEmail] = useState<string>("j.moore@lux-consortium.org");
  const [walkInCategory, setWalkInCategory] = useState<RoomCategory>("Presidential Penthouse");
  const [walkInNights, setWalkInNights] = useState<number>(3);
  const [walkInVip, setWalkInVip] = useState<VipTier>("Diamond");

  // VIP Protocol Detail Modal
  const [selectedVipModal, setSelectedVipModal] = useState<VipProtocolProfile | null>(null);
  const [vipToast, setVipToast] = useState<string | null>(null);

  // VIP Protocol Profiles State
  const [vipProfiles, setVipProfiles] = useState<VipProtocolProfile[]>([
    {
      id: "vip-1",
      reservationId: "res-101",
      guestName: "Sheikh Al-Maktoum",
      aliasName: "Mr. S. Falcon",
      isIncognito: true,
      vipTier: "Royal VIP",
      roomNumber: "801",
      suiteName: "Presidential Penthouse",
      arrivalFlight: "EK 202 (Private Terminal 3)",
      eta: "14:30 Today",
      assignedButler: "Sebastian Cole (Master Butler)",
      dutyManager: "Marcus Vance (Head of Guest Experience)",
      amenitiesStaged: true,
      climatePresetDone: true,
      curbsideGreetingDispatched: true,
      inSuiteCheckinCompleted: true,
      specialProtocol: "Diplomatic Motorcade escort. Luggage pre-cleared. No photography permitted.",
      dietaryRestrictions: ["Strict Halal", "No Gluten", "Organic Produce Only"],
      beveragePreference: "Vintage 2012 Bateel Sparkling Date Juice & Evian Pure Glass",
      securityClearance: "HEAD_OF_STATE_ARMED",
    },
    {
      id: "vip-2",
      reservationId: "res-102",
      guestName: "Lady Genevieve Vance",
      aliasName: "G. Devereaux",
      isIncognito: false,
      vipTier: "Diamond",
      roomNumber: "802",
      suiteName: "Panoramic Sky Suite",
      arrivalFlight: "BA 107 (First Class)",
      eta: "16:00 Today",
      assignedButler: "Genevieve Laurent",
      dutyManager: "Elena Rostova",
      amenitiesStaged: true,
      climatePresetDone: false,
      curbsideGreetingDispatched: false,
      inSuiteCheckinCompleted: false,
      specialProtocol: "White orchids in master salon. Hypoallergenic silk bedding. Direct suite escort.",
      dietaryRestrictions: ["Pescatarian", "Shellfish Allergy"],
      beveragePreference: "Dom Pérignon Vintage 2013 & San Pellegrino",
      securityClearance: "HIGH_PROFILE",
    },
    {
      id: "vip-3",
      reservationId: "res-104",
      guestName: "Kenji Takahashi",
      aliasName: undefined,
      isIncognito: false,
      vipTier: "Gold",
      roomNumber: "502",
      suiteName: "Executive Ocean Suite",
      arrivalFlight: "JL 041 (Business)",
      eta: "18:45 Today",
      assignedButler: "David O.",
      dutyManager: "Marcus Vance",
      amenitiesStaged: false,
      climatePresetDone: true,
      curbsideGreetingDispatched: false,
      inSuiteCheckinCompleted: false,
      specialProtocol: "Green tea ceremony set prepared upon arrival. Quiet room requested.",
      dietaryRestrictions: ["No Dairy"],
      beveragePreference: "Gyokuro Green Tea & Japanese Sparkling Water",
      securityClearance: "STANDARD",
    },
  ]);

  const showVipToast = (msg: string) => {
    setVipToast(msg);
    setTimeout(() => setVipToast(null), 3000);
  };

  const handleToggleIncognito = (profileId: string) => {
    setVipProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = !p.isIncognito;
          showVipToast(updated ? `🔒 Incognito Privacy Shield Activated for ${p.aliasName || p.guestName}` : `🔓 Public Display Restored for ${p.guestName}`);
          return { ...p, isIncognito: updated };
        }
        return p;
      })
    );
  };

  const handleDispatchCurbsideGreeting = (profileId: string) => {
    setVipProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          showVipToast(`🚗 Curbside & Helipad Butler Greeting Dispatched for ${p.guestName}`);
          return { ...p, curbsideGreetingDispatched: true };
        }
        return p;
      })
    );
  };

  const handleStageAmenities = (profileId: string) => {
    setVipProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          showVipToast(`🍾 Luxury Welcome Amenities Staged & Verified in Room ${p.roomNumber}`);
          return { ...p, amenitiesStaged: true };
        }
        return p;
      })
    );
  };

  const handleExecuteInSuiteCheckin = (profile: VipProtocolProfile) => {
    onCheckInGuest(profile.reservationId, profile.roomNumber);
    setVipProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, inSuiteCheckinCompleted: true } : p))
    );
    showVipToast(`👑 Direct In-Suite Check-In Completed for ${profile.guestName} (Room ${profile.roomNumber})`);
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.confirmationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.roomNumber && res.roomNumber.includes(searchQuery));

    if (!matchesSearch) return false;

    if (activeTab === "IN_HOUSE") return res.status === "CHECKED_IN";
    if (activeTab === "DUE_IN") return res.status === "CONFIRMED";
    if (activeTab === "DUE_OUT") return res.status === "CHECKED_IN";
    return true;
  });

  const vacantCleanRooms = rooms.filter(
    (r) => r.status === "VACANT_CLEAN" || r.status === "INSPECTED"
  );

  const handleExecuteCheckIn = () => {
    if (!checkInModalRes || !selectedRoomNumber) return;
    onCheckInGuest(checkInModalRes.id, selectedRoomNumber);
    setCheckInModalRes(null);
    setSelectedRoomNumber("");
    setDigitalKeyGenerated(false);
    setSignatureDone(false);
  };

  const handleExecuteUpgrade = () => {
    if (!upgradeModalRes) return;
    const targetRoom = vacantCleanRooms.find((r) => r.category === targetCategory) || vacantCleanRooms[0];
    if (targetRoom) {
      onUpgradeGuest(upgradeModalRes.id, targetCategory, targetRoom.roomNumber);
      setUpgradeModalRes(null);
    }
  };

  const handleAddFolioCharge = () => {
    const amt = parseFloat(newChargeAmt) || 0;
    if (amt > 0 && newChargeDesc) {
      setFolioExtraCharges((prev) => [...prev, { desc: newChargeDesc, amt }]);
      setNewChargeDesc("");
      setNewChargeAmt("");
    }
  };

  const handleCreateWalkIn = () => {
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      confirmationNo: `XY-${Math.floor(10000 + Math.random() * 90000)}`,
      guestName: walkInName,
      guestEmail: walkInEmail,
      guestPhone: "+971 50 889 2001",
      vipTier: walkInVip,
      roomCategory: walkInCategory,
      ratePlan: "Direct VIP Member",
      ratePerNight: walkInCategory.includes("Penthouse") ? 2850 : walkInCategory.includes("Sky") ? 1450 : 850,
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: new Date(Date.now() + walkInNights * 86400000).toISOString().split("T")[0],
      nights: walkInNights,
      adults: 2,
      children: 0,
      totalAmount: (walkInCategory.includes("Penthouse") ? 2850 : 850) * walkInNights,
      paidAmount: (walkInCategory.includes("Penthouse") ? 2850 : 850) * walkInNights,
      balance: 0,
      channel: "Direct Web",
      status: "CONFIRMED",
      digitalKeyActive: true,
      regCardSigned: true,
      specialRequests: ["High floor with panoramic sea view", "Feather pillows"],
    };

    onNewReservation(newRes);
    setNewWalkInOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Toast */}
      {vipToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-slate-950 font-bold text-xs shadow-2xl animate-in slide-in-from-top-2 flex items-center space-x-2">
          <span>{vipToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <DoorOpen className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Front Office, Arrivals & VIP Protocol Command
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous mobile check-in, white-glove VIP management, digital key tokens, multi-currency folios, and suite upgrades.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab("VIP_MANAGEMENT")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-950/40"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>VIP Protocol Command</span>
          </button>

          <button
            onClick={() => setNewWalkInOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-950/40"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>New Walk-In Guest</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">In-House Guests</div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            {reservations.filter((r) => r.status === "CHECKED_IN").length} Checked-In
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Due In Arrivals Today</div>
          <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">
            {reservations.filter((r) => r.status === "CONFIRMED").length} Guests
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Vacant Clean & Inspected</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {vacantCleanRooms.length} Ready Units
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">VIP Tier Guests</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
            {vipProfiles.length} VIPs Staged
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by guest, confirmation #, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
          {[
            { id: "ALL", label: `All (${reservations.length})` },
            { id: "VIP_MANAGEMENT", label: `VIP Management (${vipProfiles.length})`, isSpecial: true },
            { id: "DUE_IN", label: `Due In (${reservations.filter((r) => r.status === "CONFIRMED").length})` },
            { id: "IN_HOUSE", label: `In-House (${reservations.filter((r) => r.status === "CHECKED_IN").length})` },
            { id: "DUE_OUT", label: "Due Out" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                activeTab === tab.id
                  ? tab.isSpecial
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm"
                    : "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                  : tab.isSpecial
                  ? "text-purple-400 hover:text-purple-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.isSpecial && <Crown className="w-3.5 h-3.5 text-amber-400" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: VIP PROTOCOL COMMAND SUITE */}
      {activeTab === "VIP_MANAGEMENT" && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">VIP Pre-Arrival Staging & White-Glove Protocol</h3>
                <p className="text-xs text-slate-400">Autonomous curbside greeting, private butler assignment, in-suite direct check-in, and privacy shields.</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                ✓ 100% VIP Suites Pre-Allocated
              </span>
            </div>
          </div>

          {/* VIP Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {vipProfiles.map((vip) => (
              <div
                key={vip.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-purple-500/40 transition-all"
              >
                <div>
                  {/* Card Header: VIP Badge & Tier */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">
                          {vip.isIncognito ? vip.aliasName : vip.guestName}
                        </span>
                        {vip.isIncognito && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1" title="Privacy Shield Active">
                            <EyeOff className="w-2.5 h-2.5" />
                            <span>Incognito</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-amber-400 font-medium mt-0.5">
                        Room {vip.roomNumber} • {vip.suiteName}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        vip.vipTier === "Royal VIP"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      ★ {vip.vipTier}
                    </span>
                  </div>

                  {/* Flight & Arrival Telemetry */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 text-[10px] block">FLIGHT / ROUTE</span>
                      <span className="text-slate-200 font-semibold">{vip.arrivalFlight || "Private Transport"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SCHEDULED ETA</span>
                      <span className="text-emerald-400 font-semibold">{vip.eta}</span>
                    </div>
                  </div>

                  {/* Assigned Staff */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-purple-400" />
                        <span>Private Butler:</span>
                      </span>
                      <span className="font-semibold text-white">{vip.assignedButler}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Shield className="w-3.5 h-3.5 text-sky-400" />
                        <span>Duty Manager:</span>
                      </span>
                      <span className="font-semibold text-white">{vip.dutyManager}</span>
                    </div>
                  </div>

                  {/* Pre-Arrival Staging Checklist Checklist */}
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Pre-Arrival Protocol Staging
                    </span>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-1.5 rounded bg-slate-950">
                        <span className="text-slate-300 flex items-center space-x-1.5 text-[11px]">
                          <Wine className="w-3.5 h-3.5 text-rose-400" />
                          <span>Welcome Amenities & Champagne</span>
                        </span>
                        {vip.amenitiesStaged ? (
                          <span className="text-emerald-400 font-mono text-[10px] font-bold">✓ Staged</span>
                        ) : (
                          <button
                            onClick={() => handleStageAmenities(vip.id)}
                            className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold"
                          >
                            Stage Now
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded bg-slate-950">
                        <span className="text-slate-300 flex items-center space-x-1.5 text-[11px]">
                          <PlaneLanding className="w-3.5 h-3.5 text-sky-400" />
                          <span>Curbside & Helipad Greeting</span>
                        </span>
                        {vip.curbsideGreetingDispatched ? (
                          <span className="text-emerald-400 font-mono text-[10px] font-bold">✓ Dispatched</span>
                        ) : (
                          <button
                            onClick={() => handleDispatchCurbsideGreeting(vip.id)}
                            className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold"
                          >
                            Dispatch
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded bg-slate-950">
                        <span className="text-slate-300 flex items-center space-x-1.5 text-[11px]">
                          <Crown className="w-3.5 h-3.5 text-purple-400" />
                          <span>In-Suite Direct Check-In</span>
                        </span>
                        {vip.inSuiteCheckinCompleted ? (
                          <span className="text-emerald-400 font-mono text-[10px] font-bold">✓ In-House</span>
                        ) : (
                          <button
                            onClick={() => handleExecuteInSuiteCheckin(vip)}
                            className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold"
                          >
                            Execute
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleIncognito(vip.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                    title="Toggle Privacy Incognito Mode"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{vip.isIncognito ? "Public" : "Incognito"}</span>
                  </button>

                  <button
                    onClick={() => setSelectedVipModal(vip)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center space-x-1"
                  >
                    <span>Full Protocol Sheet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STANDARD RESERVATIONS TABLE */}
      {activeTab !== "VIP_MANAGEMENT" && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Confirmation & Guest</th>
                  <th className="py-3 px-4">Room & Category</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Rate & Plan</th>
                  <th className="py-3 px-4">Channel & VIP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Guest & Conf */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span>{res.guestName}</span>
                        {res.vipTier && res.vipTier !== "None" && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {res.confirmationNo} • {res.guestEmail}
                      </div>
                    </td>

                    {/* Room & Category */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{res.roomCategory}</div>
                      <div className="text-[11px] font-mono text-amber-400">
                        {res.roomNumber ? `Room ${res.roomNumber}` : "Unallocated (AI Auto)"}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>In: {res.checkIn}</div>
                      <div className="text-slate-400">Out: {res.checkOut} ({res.nights}n)</div>
                    </td>

                    {/* Rate & Plan */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-emerald-400">${res.ratePerNight}/n</div>
                      <div className="text-[10px] text-slate-400">{res.ratePlan}</div>
                    </td>

                    {/* Channel & VIP */}
                    <td className="py-3 px-4">
                      <div className="text-[11px] font-medium text-slate-300">{res.channel}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {res.vipTier}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {res.status === "CHECKED_IN" ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>IN-HOUSE</span>
                        </span>
                      ) : res.status === "CONFIRMED" ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <span>CONFIRMED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                          {res.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {res.status === "CONFIRMED" && (
                          <button
                            onClick={() => {
                              setCheckInModalRes(res);
                              const bestRoom =
                                vacantCleanRooms.find((r) => r.category === res.roomCategory) ||
                                vacantCleanRooms[0];
                              setSelectedRoomNumber(bestRoom ? bestRoom.roomNumber : "803");
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-[11px] text-white transition-colors"
                          >
                            Check-In
                          </button>
                        )}

                        {res.status === "CHECKED_IN" && (
                          <button
                            onClick={() => onCheckOutGuest(res.id)}
                            className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-600 font-bold text-[11px] text-white transition-colors"
                          >
                            Check-Out
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setFolioModalRes(res);
                            setSettledSuccess(false);
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Guest Folio & Charges"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {res.status === "CONFIRMED" && (
                          <button
                            onClick={() => setUpgradeModalRes(res)}
                            className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-colors"
                            title="VIP Suite Upgrade"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIP Detailed Protocol Sheet Modal */}
      {selectedVipModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  VIP Dossier & Protocol Sheet: {selectedVipModal.guestName}
                </h3>
              </div>
              <button onClick={() => setSelectedVipModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-500">ASSIGNED SUITE</span>
                  <div className="font-bold text-amber-400 mt-0.5">Room {selectedVipModal.roomNumber} ({selectedVipModal.suiteName})</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500">VIP RECOGNITION TIER</span>
                  <div className="font-bold text-purple-300 mt-0.5">★ {selectedVipModal.vipTier}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">SPECIAL DIPLOMATIC & SECURITY PROTOCOL</span>
                <p className="text-slate-300 leading-relaxed font-sans">{selectedVipModal.specialProtocol}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">BEVERAGE & AMENITY PRESET</span>
                <div className="text-slate-200">{selectedVipModal.beveragePreference}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">DIETARY RESTRICTIONS</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedVipModal.dietaryRestrictions.map((diet, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {diet}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedVipModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Wizard Modal */}
      {checkInModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Autonomous Check-In Protocol
                </h3>
              </div>
              <button
                onClick={() => setCheckInModalRes(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-sm font-bold text-white">{checkInModalRes.guestName}</div>
                <div className="text-slate-400">
                  {checkInModalRes.confirmationNo} • {checkInModalRes.roomCategory} • {checkInModalRes.nights} Nights
                </div>
              </div>

              {/* Room Assignment */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                  Assigned Room (AI Clean & Inspected Matrix)
                </label>
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                >
                  {vacantCleanRooms.map((r) => (
                    <option key={r.id} value={r.roomNumber}>
                      Room {r.roomNumber} ({r.category}) - {r.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Digital Key Issuance */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-sky-400" />
                    <span>NFC / BLE Mobile Digital Key</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Transmit encrypted token to Guest Super App
                  </div>
                </div>
                <button
                  onClick={() => setDigitalKeyGenerated(true)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                    digitalKeyGenerated
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-sky-600 hover:bg-sky-500 text-white"
                  }`}
                >
                  {digitalKeyGenerated ? "✓ Pushed" : "Generate Key"}
                </button>
              </div>

              {/* E-Signature Reg Card */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Digital Registration Card</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    GDPR & Passport Verified
                  </div>
                </div>
                <button
                  onClick={() => setSignatureDone(true)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                    signatureDone
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-600 hover:bg-amber-500 text-white"
                  }`}
                >
                  {signatureDone ? "✓ Signed" : "Capture Sign"}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setCheckInModalRes(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCheckIn}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/40"
              >
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Folio Modal */}
      {folioModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Guest Folio #{folioModalRes.confirmationNo}
                </h3>
              </div>
              <button
                onClick={() => setFolioModalRes(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Guest: <strong className="text-white">{folioModalRes.guestName}</strong></span>
                <span>Room: <strong className="text-amber-400">{folioModalRes.roomNumber || "801"}</strong></span>
              </div>

              {/* Transactions list */}
              <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1 font-bold">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>Room Charge ({folioModalRes.nights} Nights @ ${folioModalRes.ratePerNight})</span>
                  <span>${folioModalRes.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>Municipal & Tourism Tax (10%)</span>
                  <span>${(folioModalRes.totalAmount * 0.1).toFixed(2)}</span>
                </div>

                {folioExtraCharges.map((c, i) => (
                  <div key={i} className="flex justify-between text-slate-200">
                    <span>{c.desc}</span>
                    <span>${c.amt.toFixed(2)}</span>
                  </div>
                ))}

                <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-2 font-bold">
                  <span>Payment Applied (Credit Card Pre-Auth)</span>
                  <span>-${folioModalRes.paidAmount.toFixed(2)}</span>
                </div>

                {settledSuccess && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Payment Applied (Card Settle)</span>
                    <span>-${(folioExtraCharges.reduce((s, c) => s + c.amt, 0)).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-slate-800">
                  <span>Balance Outstanding</span>
                  <span className="text-amber-400 font-mono">
                    ${settledSuccess ? "0.00" : (folioModalRes.balance + folioExtraCharges.reduce((s, c) => s + c.amt, 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Add Charge Input */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 text-[10px] font-mono">Post New Charge to Folio</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Charge description (e.g. Laundry, Wine)"
                    value={newChargeDesc}
                    onChange={(e) => setNewChargeDesc(e.target.value)}
                    className="flex-1 p-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  <input
                    type="number"
                    placeholder="$"
                    value={newChargeAmt}
                    onChange={(e) => setNewChargeAmt(e.target.value)}
                    className="w-20 p-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  />
                  <button
                    onClick={handleAddFolioCharge}
                    className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => alert("Invoice PDF dispatched to guest registered email.")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSettledSuccess(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle Balance</span>
                </button>
              </div>

              <button
                onClick={() => setFolioModalRes(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradeModalRes && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  VIP Suite Upgrade Allocation
                </h3>
              </div>
              <button
                onClick={() => setUpgradeModalRes(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Upgrading <strong>{upgradeModalRes.guestName}</strong> ({upgradeModalRes.vipTier} Tier)
              </p>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-400 text-[10px] font-mono">Target Category</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value as RoomCategory)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                >
                  <option value="Presidential Penthouse">Presidential Penthouse (8th Floor)</option>
                  <option value="Panoramic Sky Suite">Panoramic Sky Suite (8th Floor)</option>
                  <option value="Executive Ocean Suite">Executive Ocean Suite (5th Floor)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
                ✨ Complimentary VIP Upgrade policy applied ($0 fee). Concierge amenity workflow will trigger automatically.
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setUpgradeModalRes(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteUpgrade}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-In Reservation Modal */}
      {newWalkInOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create Walk-In Reservation</h3>
              </div>
              <button onClick={() => setNewWalkInOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400">Guest Full Name</label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={walkInEmail}
                  onChange={(e) => setWalkInEmail(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Room Category</label>
                  <select
                    value={walkInCategory}
                    onChange={(e) => setWalkInCategory(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Presidential Penthouse">Presidential Penthouse</option>
                    <option value="Panoramic Sky Suite">Panoramic Sky Suite</option>
                    <option value="Executive Ocean Suite">Executive Ocean Suite</option>
                    <option value="Deluxe Marina King">Deluxe Marina King</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Nights</label>
                  <input
                    type="number"
                    min={1}
                    value={walkInNights}
                    onChange={(e) => setWalkInNights(parseInt(e.target.value) || 1)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">VIP Recognition Tier</label>
                <select
                  value={walkInVip}
                  onChange={(e) => setWalkInVip(e.target.value as any)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Royal VIP">Royal VIP</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="None">Standard Guest</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setNewWalkInOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWalkIn}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
