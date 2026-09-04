import React, { useState } from "react";
import {
  CalendarCheck2,
  Plus,
  Search,
  Filter,
  Globe,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  X,
  Users,
  Building2,
  Compass,
  Sparkles,
  Bed,
  Tag,
  Clock,
  MapPin,
  Calendar,
  Check,
  CreditCard,
  Luggage,
  Coffee,
  Ship,
  Wine,
  Car,
  Plane,
  ChevronRight,
  Shield,
  Key,
  Flame,
} from "lucide-react";
import {
  Reservation,
  RoomCategory,
  GroupBlock,
  GroupDelegate,
  ResortActivity,
  ResortEventBooking,
  VipTier,
  Room,
  AllotmentContract,
} from "../../types";
import { INITIAL_ALLOTMENT_CONTRACTS } from "../../data/mockAllotments";
import { TapeChartTimeline } from "./TapeChartTimeline";
import { OperaReservationDetailModal } from "./OperaReservationDetailModal";
import { GroupBlocksManager } from "./GroupBlocksManager";
import { AllotmentsManager } from "./AllotmentsManager";

type CrsSubTab =
  | "timeline"
  | "reservations"
  | "booking-engine"
  | "group-blocks"
  | "allotments"
  | "activities-events";

interface ReservationsViewProps {
  reservations: Reservation[];
  rooms?: Room[];
  onNewReservation: (reservation: Reservation) => void;
  onUpdateReservation?: (reservation: Reservation) => void;
  groupBlocks?: GroupBlock[];
  onNewGroupBlock?: (block: GroupBlock) => void;
  onUpdateGroupBlock?: (block: GroupBlock) => void;
  onPickupGroupBlock?: (blockId: string, guestName: string) => void;
  onPickupGroupDelegate?: (blockId: string, delegate: GroupDelegate, reservation: Reservation) => void;
  onBatchPickupDelegates?: (blockId: string, delegates: GroupDelegate[], reservations: Reservation[]) => void;
  onCancelGroupDelegate?: (blockId: string, delegateId: string, reservationId: string) => void;
  onCheckInGroupDelegate?: (blockId: string, delegateId: string, reservationId: string) => void;
  allotments?: AllotmentContract[];
  onUpdateAllotment?: (contract: AllotmentContract) => void;
  onNewAllotment?: (contract: AllotmentContract) => void;
  resortActivities?: ResortActivity[];
  eventBookings?: ResortEventBooking[];
  onNewEventBooking?: (booking: ResortEventBooking) => void;
  defaultSubTab?: CrsSubTab;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  rooms = [],
  onNewReservation,
  onUpdateReservation,
  groupBlocks = [],
  onNewGroupBlock,
  onUpdateGroupBlock,
  onPickupGroupBlock,
  onPickupGroupDelegate,
  onBatchPickupDelegates,
  onCancelGroupDelegate,
  onCheckInGroupDelegate,
  allotments = INITIAL_ALLOTMENT_CONTRACTS,
  onUpdateAllotment,
  onNewAllotment,
  resortActivities = [],
  eventBookings = [],
  onNewEventBooking,
  defaultSubTab,
}) => {
  const [activeTab, setActiveTab] = useState<CrsSubTab>(defaultSubTab || "group-blocks");

  React.useEffect(() => {
    if (defaultSubTab) {
      setActiveTab(defaultSubTab);
    }
  }, [defaultSubTab]);
  const [internalAllotments, setInternalAllotments] = useState<AllotmentContract[]>(allotments);

  const currentAllotments = allotments && allotments.length > 0 ? allotments : internalAllotments;

  const handleUpdateAllotmentInternal = (updated: AllotmentContract) => {
    setInternalAllotments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (onUpdateAllotment) {
      onUpdateAllotment(updated);
    }
  };

  const handleNewAllotmentInternal = (created: AllotmentContract) => {
    setInternalAllotments((prev) => [created, ...prev]);
    if (onNewAllotment) {
      onNewAllotment(created);
    }
  };

  // Reservation list filters & state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // New Reservation Wizard State
  const [newBookingModalOpen, setNewBookingModalOpen] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [category, setCategory] = useState<RoomCategory>("Deluxe King");
  const [checkIn, setCheckIn] = useState<string>("2026-09-08");
  const [checkOut, setCheckOut] = useState<string>("2026-09-12");
  const [nights, setNights] = useState<number>(4);
  const [ratePerNight, setRatePerNight] = useState<number>(420);
  const [channel, setChannel] = useState<any>("Direct Web");
  const [vipTier, setVipTier] = useState<any>("None");

  // Booking Engine State
  const [beCheckIn, setBeCheckIn] = useState<string>("2026-09-15");
  const [beCheckOut, setBeCheckOut] = useState<string>("2026-09-19");
  const [beAdults, setBeAdults] = useState<number>(2);
  const [beChildren, setBeChildren] = useState<number>(0);
  const [bePromoCode, setBePromoCode] = useState<string>("XYLOVIP");
  const [bePromoApplied, setBePromoApplied] = useState<boolean>(true);
  const [beSelectedCategory, setBeSelectedCategory] = useState<RoomCategory>("Executive Ocean Suite");
  const [beRatePlan, setBeRatePlan] = useState<"BAR" | "VIP_DIRECT" | "ALL_INCLUSIVE">("VIP_DIRECT");
  const [beAddons, setBeAddons] = useState<{ [key: string]: boolean }>({
    limo: true,
    champagne: false,
    spa: true,
    yacht: false,
  });
  const [beGuestName, setBeGuestName] = useState<string>("Lady Vivienne Vance");
  const [beGuestEmail, setBeGuestEmail] = useState<string>("vivienne.vance@vanceholdings.co.uk");
  const [beGuestPhone, setBeGuestPhone] = useState<string>("+44 20 7946 0912");
  const [beSuccessModal, setBeSuccessModal] = useState<Reservation | null>(null);

  // Group Blocks State
  const [newGroupModalOpen, setNewGroupModalOpen] = useState<boolean>(false);
  const [pickupModalOpen, setPickupModalOpen] = useState<boolean>(false);
  const [selectedBlockForPickup, setSelectedBlockForPickup] = useState<GroupBlock | null>(null);
  const [pickupGuestName, setPickupGuestName] = useState<string>("");

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newBlockCode, setNewBlockCode] = useState<string>("");
  const [newContactPerson, setNewContactPerson] = useState<string>("");
  const [newContactEmail, setNewContactEmail] = useState<string>("");
  const [newGroupRooms, setNewGroupRooms] = useState<number>(25);
  const [newGroupRate, setNewGroupRate] = useState<number>(650);
  const [newGroupCategory, setNewGroupCategory] = useState<RoomCategory>("Executive Ocean Suite");
  const [newGroupStartDate, setNewGroupStartDate] = useState<string>("2026-10-01");
  const [newGroupEndDate, setNewGroupEndDate] = useState<string>("2026-10-05");

  // Activities & Events State
  const [selectedActivityCategory, setSelectedActivityCategory] = useState<string>("ALL");
  const [bookActivityModalOpen, setBookActivityModalOpen] = useState<boolean>(false);
  const [selectedActivityToBook, setSelectedActivityToBook] = useState<ResortActivity | null>(null);
  const [actGuestName, setActGuestName] = useState<string>("");
  const [actRoomNo, setActRoomNo] = useState<string>("Suite 801");
  const [actDate, setActDate] = useState<string>("2026-09-06");
  const [actTimeSlot, setActTimeSlot] = useState<string>("");
  const [actParticipants, setActParticipants] = useState<number>(2);
  const [actSpecialReq, setActSpecialReq] = useState<string>("");

  const channelRates = [
    { channel: "Direct Web (Xylo Engine)", rate: "$420", parityStatus: "BEST_PRICE", commission: "0%", directAdvantage: "Best Rate Guarantee + $50 Resort Credit" },
    { channel: "Booking.com", rate: "$445", parityStatus: "PARITY_OK", commission: "15%", directAdvantage: "Standard Rate" },
    { channel: "Expedia Travel Partner", rate: "$445", parityStatus: "PARITY_OK", commission: "18%", directAdvantage: "Standard Rate" },
    { channel: "GDS Corporate (Sabre/Amadeus)", rate: "$420", parityStatus: "PARITY_OK", commission: "10%", directAdvantage: "Corporate Negotiated" },
    { channel: "Airbnb Luxe", rate: "$460", parityStatus: "PARITY_OK", commission: "14%", directAdvantage: "Standard Rate" },
  ];

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.confirmationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.roomNumber && r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesChannel = filterChannel === "ALL" || r.channel === filterChannel;
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Calculate Booking Engine Prices
  const beNightsCalc = Math.max(
    1,
    Math.round(
      (new Date(beCheckOut).getTime() - new Date(beCheckIn).getTime()) / (1000 * 3600 * 24)
    ) || 4
  );

  const roomBaseRates: Record<RoomCategory, number> = {
    "Deluxe King": 420,
    "Executive Ocean Suite": 780,
    "Panoramic Sky Suite": 1450,
    "Presidential Penthouse": 2850,
    "Overwater Coral Villa": 3400,
  };

  const getBaseRate = (cat: RoomCategory) => roomBaseRates[cat] || 500;
  const currentCategoryBase = getBaseRate(beSelectedCategory);

  let planMultiplier = 1.0;
  if (beRatePlan === "VIP_DIRECT") planMultiplier = 0.85; // 15% discount for direct
  if (beRatePlan === "ALL_INCLUSIVE") planMultiplier = 1.25;

  const promoDiscount = bePromoApplied ? 0.1 : 0; // 10% promo discount
  const nightlyEffective = Math.round(currentCategoryBase * planMultiplier * (1 - promoDiscount));
  const roomStaySubtotal = nightlyEffective * beNightsCalc;

  const addonPrices = {
    limo: 150,
    champagne: 280,
    spa: 95 * beNightsCalc * beAdults,
    yacht: 450 * beAdults,
  };

  let addonsTotal = 0;
  if (beAddons.limo) addonsTotal += addonPrices.limo;
  if (beAddons.champagne) addonsTotal += addonPrices.champagne;
  if (beAddons.spa) addonsTotal += addonPrices.spa;
  if (beAddons.yacht) addonsTotal += addonPrices.yacht;

  const taxesTourism = Math.round((roomStaySubtotal + addonsTotal) * 0.12);
  const beGrandTotal = roomStaySubtotal + addonsTotal + taxesTourism;

  const handleExecuteDirectBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beGuestName) return;

    const newRes: Reservation = {
      id: `res-be-${Date.now()}`,
      confirmationNo: `XY-D${Math.floor(10000 + Math.random() * 90000)}`,
      guestName: beGuestName,
      guestEmail: beGuestEmail || "vip.guest@xylo-resort.com",
      guestPhone: beGuestPhone || "+1 555 0188",
      roomCategory: beSelectedCategory,
      checkIn: beCheckIn,
      checkOut: beCheckOut,
      nights: beNightsCalc,
      adults: beAdults,
      children: beChildren,
      status: "CONFIRMED",
      ratePlan:
        beRatePlan === "VIP_DIRECT"
          ? "Direct VIP Member"
          : beRatePlan === "ALL_INCLUSIVE"
          ? "All-Inclusive Package"
          : "Best Available Rate",
      ratePerNight: nightlyEffective,
      totalAmount: beGrandTotal,
      paidAmount: beGrandTotal,
      balance: 0,
      channel: "Direct Web",
      vipTier: beRatePlan === "VIP_DIRECT" ? "Diamond" : "Silver",
      digitalKeyActive: true,
      regCardSigned: true,
      specialRequests: [
        beAddons.limo ? "Private Limousine Transfer requested" : "",
        beAddons.champagne ? "Dom Pérignon on arrival" : "",
        beAddons.spa ? "Unlimited Spa Hydrothermal pass" : "",
        beAddons.yacht ? "Sunset Yacht Cruise reserved" : "",
      ].filter(Boolean),
    };

    onNewReservation(newRes);
    setBeSuccessModal(newRes);
  };

  const handleCreateGroupBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newBlockCode) return;

    const block: GroupBlock = {
      id: `blk-${Date.now()}`,
      groupName: newGroupName,
      blockCode: newBlockCode.toUpperCase().trim(),
      contactPerson: newContactPerson || "Lead Organizer",
      contactEmail: newContactEmail || "organizer@group.com",
      startDate: newGroupStartDate,
      endDate: newGroupEndDate,
      roomCategory: newGroupCategory,
      negotiatedRate: newGroupRate,
      allocatedRooms: newGroupRooms,
      pickedUpRooms: 0,
      cutOffDate: newGroupStartDate,
      status: "DEFINITE",
      billingMethod: "MASTER_FOLIO",
      depositPaid: Math.round(newGroupRooms * newGroupRate * 0.3),
    };

    if (onNewGroupBlock) {
      onNewGroupBlock(block);
    }
    setNewGroupModalOpen(false);
    setNewGroupName("");
    setNewBlockCode("");
  };

  const handleExecutePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlockForPickup || !pickupGuestName.trim()) return;

    if (onPickupGroupBlock) {
      onPickupGroupBlock(selectedBlockForPickup.id, pickupGuestName.trim());
    }
    setPickupModalOpen(false);
    setPickupGuestName("");
    setSelectedBlockForPickup(null);
  };

  const handleBookActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityToBook || !actGuestName.trim()) return;

    const total = selectedActivityToBook.pricePerPerson * actParticipants;
    const newBooking: ResortEventBooking = {
      id: `ev-${Date.now()}`,
      guestOrGroupName: actGuestName.trim(),
      activityTitle: selectedActivityToBook.title,
      category: selectedActivityToBook.category,
      date: actDate,
      timeSlot: actTimeSlot || selectedActivityToBook.dailySchedule[0],
      participants: actParticipants,
      totalPrice: total,
      roomNumber: actRoomNo,
      status: "CONFIRMED",
      specialRequirements: actSpecialReq || "VIP guest amenity standard",
    };

    if (onNewEventBooking) {
      onNewEventBooking(newBooking);
    }
    setBookActivityModalOpen(false);
    setActGuestName("");
    setActSpecialReq("");
    setSelectedActivityToBook(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarCheck2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Central Reservation System (CRS), Groups & Experiences
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Direct web booking engine, multi-channel OTA parity synchronization, group blocks (MICE), and resort activity scheduling.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {activeTab === "reservations" && (
            <button
              onClick={() => setNewBookingModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950 transition-all flex items-center space-x-1.5 shadow-lg shadow-amber-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
          )}

          {activeTab === "group-blocks" && (
            <button
              onClick={() => setNewGroupModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white transition-all flex items-center space-x-1.5 shadow-lg shadow-purple-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Contract Group Block</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === "timeline"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>OPERA Room Plan & Timeline</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-200 font-mono font-bold">
            PMS Tape Chart
          </span>
        </button>

        <button
          onClick={() => setActiveTab("reservations")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === "reservations"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>CRS Folios & Distribution ({reservations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("booking-engine")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === "booking-engine"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Direct CRS Booking Engine</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
            0% Comm
          </span>
        </button>

        <button
          onClick={() => setActiveTab("group-blocks")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === "group-blocks"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Group & Room Blocks (MICE) ({groupBlocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("allotments")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === "allotments"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Allotments & Wholesalers ({currentAllotments.length})</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
            Series
          </span>
        </button>

        <button
          onClick={() => setActiveTab("activities-events")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === "activities-events"
              ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-950/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Resort Activities & Events ({resortActivities.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 0: OPERA ROOM PLAN & MEWS TIMELINE TAPE CHART        */}
      {/* ========================================================= */}
      {activeTab === "timeline" && (
        <TapeChartTimeline
          rooms={rooms}
          reservations={reservations}
          onSelectReservation={(res) => setSelectedRes(res)}
          onBookSlot={(room, dateStr) => {
            setCategory(room.category);
            setCheckIn(dateStr);
            const nextDay = new Date(dateStr);
            nextDay.setDate(nextDay.getDate() + 2);
            setCheckOut(nextDay.toISOString().split("T")[0]);
            setNights(2);
            setRatePerNight(room.rate);
            setNewBookingModalOpen(true);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 1: CRS RESERVATIONS & CHANNELS                       */}
      {/* ========================================================= */}
      {activeTab === "reservations" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Channel Parity Matrix & Direct Upsell Yield */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Live Multi-Channel Rate Parity & OTA Distribution
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PARITY INTEGRITY: 100% (NO DISCREPANCIES)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {channelRates.map((ch, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-slate-300 truncate">{ch.channel}</div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-lg font-black text-white font-mono">{ch.rate}</span>
                    <span className="text-[10px] font-mono text-slate-400">Comm: {ch.commission}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{ch.directAdvantage}</div>
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 pt-1 border-t border-slate-800/80">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Synchronized (2-Way)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search, Filters, and Actions */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search guest name, confirmation # or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Channel Filter */}
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none font-mono"
              >
                <option value="ALL">All Channels</option>
                <option value="Direct Web">Direct Web</option>
                <option value="Booking.com">Booking.com</option>
                <option value="Expedia">Expedia</option>
                <option value="GDS Corporate">GDS Corporate</option>
                <option value="Airbnb Luxe">Airbnb Luxe</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">In-House</option>
                <option value="CHECKED_OUT">Checked Out</option>
              </select>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Showing <span className="font-bold text-white">{filteredReservations.length}</span> of{" "}
              {reservations.length} folios
            </div>
          </div>

          {/* Active CRS Bookings Registry */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Confirmation</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Room Type</th>
                    <th className="py-3 px-4">Room #</th>
                    <th className="py-3 px-4">Stay Dates</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Total Folio</th>
                    <th className="py-3 px-4">VIP Tier</th>
                    <th className="py-3 px-4">Digital Key</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredReservations.map((res) => (
                    <tr
                      key={res.id}
                      onClick={() => setSelectedRes(res)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {res.confirmationNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{res.guestName}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">
                          {res.guestEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{res.roomCategory}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {res.roomNumber || <span className="text-slate-500 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {res.checkIn} → {res.checkOut} ({res.nights}n)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {res.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ${res.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {res.vipTier && res.vipTier !== "None" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {res.vipTier}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Standard</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {res.digitalKeyActive ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 text-[10px] font-mono font-bold">
                            <Key className="w-3 h-3" />
                            <span>ISSUED</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] font-mono">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            res.status === "CONFIRMED"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : res.status === "CHECKED_IN"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DIRECT CRS BOOKING ENGINE                         */}
      {/* ========================================================= */}
      {activeTab === "booking-engine" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Booking Engine Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-slate-950">
                  DIRECT HIGH-YIELD ENGINE
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  Zero OTA Commission • 100% Profit Retention
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Guest & Reservationist Direct Booking Engine
              </h2>
              <p className="text-xs text-slate-300">
                Experience instant dynamic rate calculation, VIP member rate parity override, and customized experiential add-on packaging.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Engine Conversion</div>
                <div className="text-base font-black text-emerald-400 font-mono">14.8% Direct</div>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Search & Stay Parameters Bar */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Check-In</span>
              </label>
              <input
                type="date"
                value={beCheckIn}
                onChange={(e) => setBeCheckIn(e.target.value)}
                className="w-full mt-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Check-Out</span>
              </label>
              <input
                type="date"
                value={beCheckOut}
                onChange={(e) => setBeCheckOut(e.target.value)}
                className="w-full mt-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center space-x-1">
                <Users className="w-3 h-3 text-sky-400" />
                <span>Guests (Adults / Kids)</span>
              </label>
              <div className="flex items-center space-x-2 mt-1.5">
                <select
                  value={beAdults}
                  onChange={(e) => setBeAdults(Number(e.target.value))}
                  className="w-1/2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
                <select
                  value={beChildren}
                  onChange={(e) => setBeChildren(Number(e.target.value))}
                  className="w-1/2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                >
                  <option value={0}>0 Kids</option>
                  <option value={1}>1 Child</option>
                  <option value={2}>2 Children</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center space-x-1">
                <Tag className="w-3 h-3 text-purple-400" />
                <span>Promo Code</span>
              </label>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <input
                  type="text"
                  placeholder="e.g. XYLOVIP"
                  value={bePromoCode}
                  onChange={(e) => setBePromoCode(e.target.value.toUpperCase())}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setBePromoApplied(!bePromoApplied)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold font-mono transition-colors ${
                    bePromoApplied
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {bePromoApplied ? "Applied" : "Apply"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Calculated Duration</span>
              </label>
              <div className="mt-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono font-bold flex items-center justify-between">
                <span>{beNightsCalc} Nights Stay</span>
                <span className="text-[10px] text-slate-400">Standard Stay</span>
              </div>
            </div>
          </div>

          {/* Rate Plan Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              onClick={() => setBeRatePlan("BAR")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                beRatePlan === "BAR"
                  ? "bg-slate-900 border-amber-500 ring-1 ring-amber-500/40"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Best Available Rate (BAR)</span>
                {beRatePlan === "BAR" && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Flexible cancellation up to 48 hours prior to arrival. Includes high-speed Wi-Fi.
              </p>
            </div>

            <div
              onClick={() => setBeRatePlan("VIP_DIRECT")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                beRatePlan === "VIP_DIRECT"
                  ? "bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/30"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">Direct VIP Member Rate</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                    SAVE 15%
                  </span>
                </div>
                {beRatePlan === "VIP_DIRECT" && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Guaranteed early check-in (12:00 PM), welcome signature cocktail, and double loyalty points.
              </p>
            </div>

            <div
              onClick={() => setBeRatePlan("ALL_INCLUSIVE")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                beRatePlan === "ALL_INCLUSIVE"
                  ? "bg-slate-900 border-purple-500 ring-1 ring-purple-500/40 shadow-lg shadow-purple-950/30"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">All-Inclusive Luxury Gourmet</span>
                {beRatePlan === "ALL_INCLUSIVE" && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Unlimited à la carte dining across all 5 restaurants, 24h in-room dining, and daily spa access.
              </p>
            </div>
          </div>

          {/* Main Booking Engine Split: Room Cards + Booking Cart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room Categories Cards */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
                Select Suite Category Available For Selected Dates
              </div>

              {(
                [
                  {
                    name: "Deluxe King",
                    sqft: 650,
                    view: "Marina Skyline View",
                    amenities: ["King Simmons Bed", "Rain Shower", "Marble Bath", "Smart Tablet", "Nespresso"],
                    badge: "POPULAR",
                  },
                  {
                    name: "Executive Ocean Suite",
                    sqft: 1100,
                    view: "Panoramic Gulf Water Front",
                    amenities: ["Private Balcony", "Butler On-Demand", "Walk-in Closet", "Bose Sound System"],
                    badge: "RECOMMENDED",
                  },
                  {
                    name: "Panoramic Sky Suite",
                    sqft: 1850,
                    view: "360-Degree Top Floor Skyline",
                    amenities: ["Private Jacuzzi", "Helipad Welcome", "Dining Room for 8", "Lutron Controls"],
                    badge: "HIGH YIELD",
                  },
                  {
                    name: "Presidential Penthouse",
                    sqft: 3400,
                    view: "Exclusive Private Rooftop & Infinity Pool",
                    amenities: ["Private Elevator", "24h Dedicated Butler", "Wine Cellar", "Boardroom"],
                    badge: "ROYAL VIP",
                  },
                ] as const
              ).map((room, idx) => {
                const isSelected = beSelectedCategory === room.name;
                const base = roomBaseRates[room.name];
                const finalNightly = Math.round(base * planMultiplier * (bePromoApplied ? 0.9 : 1));

                return (
                  <div
                    key={idx}
                    onClick={() => setBeSelectedCategory(room.name as RoomCategory)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row justify-between gap-4 ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-500/50"
                        : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-white tracking-tight">
                          {room.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                          {room.badge}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        {room.sqft} sq.ft • {room.view} • Max {beAdults + beChildren} Guests
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {room.amenities.map((am, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sm:text-right flex sm:flex-col justify-between items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-500 line-through font-mono">
                          OTA: ${Math.round(base * 1.15)}/night
                        </div>
                        <div className="text-xl font-black text-emerald-400 font-mono">
                          ${finalNightly}
                          <span className="text-xs font-normal text-slate-400">/night</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ${finalNightly * beNightsCalc} for {beNightsCalc} nights
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`mt-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 shadow-md"
                            : "bg-slate-800 hover:bg-slate-700 text-white"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select Suite"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Experiential Add-Ons & Final Instant Booking Cart */}
            <div className="space-y-4">
              {/* Experiential Add-Ons */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Enhance Your Stay (VIP Add-Ons)
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer text-xs">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={beAddons.limo}
                        onChange={(e) => setBeAddons({ ...beAddons, limo: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1">
                          <Car className="w-3.5 h-3.5 text-sky-400" />
                          <span>Airport Rolls Royce Transfer</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Chauffeured both ways</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">+$150</span>
                  </label>

                  <label className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer text-xs">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={beAddons.champagne}
                        onChange={(e) => setBeAddons({ ...beAddons, champagne: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1">
                          <Wine className="w-3.5 h-3.5 text-purple-400" />
                          <span>Dom Pérignon 2013 on Arrival</span>
                        </div>
                        <div className="text-[10px] text-slate-400">With artisanal chocolate truffles</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">+$280</span>
                  </label>

                  <label className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer text-xs">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={beAddons.spa}
                        onChange={(e) => setBeAddons({ ...beAddons, spa: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1">
                          <Coffee className="w-3.5 h-3.5 text-amber-400" />
                          <span>Azure Spa Unlimited Hydrothermal</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Thermal saunas, steam & salt room</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">+${addonPrices.spa}</span>
                  </label>

                  <label className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer text-xs">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={beAddons.yacht}
                        onChange={(e) => setBeAddons({ ...beAddons, yacht: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1">
                          <Ship className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sunset Yacht Cruise Pass</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Champagne Sommelier onboard</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">+${addonPrices.yacht}</span>
                  </label>
                </div>
              </div>

              {/* Guest Details & Instant Booking Form */}
              <form
                onSubmit={handleExecuteDirectBooking}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Guest Contact & Payment Authorization
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-400 text-[10px] font-mono">Primary Guest Name</label>
                    <input
                      type="text"
                      required
                      value={beGuestName}
                      onChange={(e) => setBeGuestName(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-400 text-[10px] font-mono">Email</label>
                      <input
                        type="email"
                        required
                        value={beGuestEmail}
                        onChange={(e) => setBeGuestEmail(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 text-[10px] font-mono">Phone</label>
                      <input
                        type="text"
                        required
                        value={beGuestPhone}
                        onChange={(e) => setBeGuestPhone(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>
                      {beSelectedCategory} ({beNightsCalc}n × ${nightlyEffective})
                    </span>
                    <span>${roomStaySubtotal}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Experiential Add-ons</span>
                      <span>+${addonsTotal}</span>
                    </div>
                  )}
                  {bePromoApplied && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Direct VIP Promo (XYLOVIP 10%)</span>
                      <span>Included</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Taxes & Tourism Surcharge (12%)</span>
                    <span>+${taxesTourism}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="font-bold text-white text-sm">Grand Total Folio</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      ${beGrandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Instant Confirm & Issue Digital Key</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: OPERA SALES & CATERING (GROUP ROOM BLOCKS & MICE) */}
      {/* ========================================================= */}
      {activeTab === "group-blocks" && (
        <GroupBlocksManager
          groupBlocks={groupBlocks}
          rooms={rooms}
          reservations={reservations}
          onNewGroupBlock={onNewGroupBlock}
          onUpdateGroupBlock={onUpdateGroupBlock}
          onPickupDelegate={(blockId, del, res) => {
            if (onPickupGroupDelegate) {
              onPickupGroupDelegate(blockId, del, res);
            } else if (onPickupGroupBlock) {
              onPickupGroupBlock(blockId, del.guestName);
            }
          }}
          onBatchPickupDelegates={onBatchPickupDelegates}
          onCancelDelegate={onCancelGroupDelegate}
          onCheckInDelegate={onCheckInGroupDelegate}
          onSwitchToAllotments={() => setActiveTab("allotments")}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 3B: ALLOTMENTS & TOUR OPERATOR SERIES QUOTAS          */}
      {/* ========================================================= */}
      {activeTab === "allotments" && (
        <AllotmentsManager
          contracts={currentAllotments}
          onUpdateContract={handleUpdateAllotmentInternal}
          onNewContract={handleNewAllotmentInternal}
          onSyncReservationToPms={onNewReservation}
          onCheckInVoucherPms={(resId, roomNo) => {
            if (onUpdateReservation) {
              const res = reservations.find((r) => r.id === resId);
              if (res) {
                onUpdateReservation({
                  ...res,
                  status: "Checked In",
                  roomNumber: roomNo,
                  digitalKeyActive: true,
                });
              }
            }
          }}
          onCancelVoucherPms={(resId) => {
            if (onUpdateReservation) {
              const res = reservations.find((r) => r.id === resId);
              if (res) {
                onUpdateReservation({
                  ...res,
                  status: "Cancelled",
                });
              }
            }
          }}
          onSwitchToGroupBlocks={() => setActiveTab("group-blocks")}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 4: ACTIVITIES & EVENTS                               */}
      {/* ========================================================= */}
      {activeTab === "activities-events" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Category Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Resort Experiences & Concierge Activities</h3>
                <p className="text-xs text-slate-400">
                  Curated luxury excursions, spa rituals, water sports, and private banquet reservations.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {["ALL", "WATER_SPORTS", "WELLNESS_SPA", "VIP_TRANSFER", "DINING_EXPERIENCE", "EXCURSION"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedActivityCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-mono whitespace-nowrap ${
                      selectedActivityCategory === cat
                        ? "bg-sky-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
                    }`}
                  >
                    {cat.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Activities Catalogue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resortActivities
              .filter(
                (act) => selectedActivityCategory === "ALL" || act.category === selectedActivityCategory
              )
              .map((act) => (
                <div
                  key={act.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {act.category.replace("_", " ")}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${act.pricePerPerson} / guest
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{act.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Duration: {act.durationMinutes} mins</span>
                      <span>Max Cap: {act.maxCapacity}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Location: {act.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {act.dailySchedule.map((slot, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedActivityToBook(act);
                        setBookActivityModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Book For Guest / Group</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Confirmed Activities Register */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Today's In-House Activity & Event Schedule ({eventBookings.length})
              </h3>
              <span className="text-xs text-emerald-400 font-mono">
                Total Bookings Revenue: $
                {eventBookings.reduce((acc, e) => acc + e.totalPrice, 0).toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Guest / Group</th>
                    <th className="py-2.5 px-4">Experience Title</th>
                    <th className="py-2.5 px-4">Date & Slot</th>
                    <th className="py-2.5 px-4">Party Size</th>
                    <th className="py-2.5 px-4">Total Charged</th>
                    <th className="py-2.5 px-4">Room #</th>
                    <th className="py-2.5 px-4">Special Requests</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {eventBookings.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white">{ev.guestOrGroupName}</td>
                      <td className="py-3 px-4 text-slate-200">{ev.activityTitle}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-amber-400">
                        {ev.date} @ {ev.timeSlot}
                      </td>
                      <td className="py-3 px-4 font-mono">{ev.participants} guests</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ${ev.totalPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono">{ev.roomNumber || "N/A"}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                        {ev.specialRequirements || "Standard VIP"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: NEW RESERVATION WIZARD                           */}
      {/* ========================================================= */}
      {newBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarCheck2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create New Reservation</h3>
              </div>
              <button
                onClick={() => setNewBookingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!guestName) return;
                const total = nights * ratePerNight;
                const newRes: Reservation = {
                  id: `res-${Date.now()}`,
                  confirmationNo: `XY-${Math.floor(10000 + Math.random() * 90000)}`,
                  guestName,
                  guestEmail: guestEmail || "guest@example.com",
                  guestPhone: guestPhone || "+1 555 0192",
                  roomCategory: category,
                  checkIn,
                  checkOut,
                  nights,
                  adults: 2,
                  children: 0,
                  status: "CONFIRMED",
                  ratePlan: "Best Available Rate",
                  ratePerNight,
                  totalAmount: total,
                  paidAmount: total,
                  balance: 0,
                  channel,
                  vipTier,
                  digitalKeyActive: false,
                  regCardSigned: false,
                };
                onNewReservation(newRes);
                setNewBookingModalOpen(false);
                setGuestName("");
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victor Sterling"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. victor@sterling.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Room Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RoomCategory)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none font-mono"
                  >
                    <option value="Deluxe King">Deluxe King ($420/n)</option>
                    <option value="Executive Ocean Suite">Executive Ocean Suite ($780/n)</option>
                    <option value="Panoramic Sky Suite">Panoramic Sky Suite ($1,450/n)</option>
                    <option value="Presidential Penthouse">Presidential Penthouse ($2,850/n)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">VIP Tier</label>
                  <select
                    value={vipTier}
                    onChange={(e) => setVipTier(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none font-mono"
                  >
                    <option value="None">Standard Guest</option>
                    <option value="Silver">Silver Tier</option>
                    <option value="Gold">Gold Tier</option>
                    <option value="Diamond">Diamond VIP</option>
                    <option value="Royal VIP">Royal VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Check-In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Nights</label>
                  <input
                    type="number"
                    min="1"
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  >
                    <option value="Direct Web">Direct Web</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Expedia">Expedia</option>
                    <option value="GDS Corporate">GDS Corporate</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400">Total Calculated Stay:</span>
                <span className="text-base font-black text-emerald-400">${nights * ratePerNight}</span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewBookingModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-950/40"
                >
                  Book & Sync Channels
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DIRECT BOOKING CONFIRMATION MODAL               */}
      {/* ========================================================= */}
      {beSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Direct Booking Confirmed!</h3>
              <p className="text-xs text-slate-400 font-mono">
                Confirmation #{beSuccessModal.confirmationNo}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Guest:</span>
                <span className="text-white font-bold">{beSuccessModal.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suite:</span>
                <span className="text-emerald-400 font-bold">{beSuccessModal.roomCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-white">
                  {beSuccessModal.checkIn} → {beSuccessModal.checkOut} ({beSuccessModal.nights}n)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Digital Key:</span>
                <span className="text-emerald-400 font-bold">ISSUED TO MOBILE APP</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Folio Total:</span>
                <span className="text-base font-black text-emerald-400">
                  ${beSuccessModal.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setBeSuccessModal(null);
                setActiveTab("reservations");
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              View In All Reservations
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CONTRACT NEW GROUP BLOCK                        */}
      {/* ========================================================= */}
      {newGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Contract New Group Block (MICE)</h3>
              </div>
              <button
                onClick={() => setNewGroupModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupBlockSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-400 text-[10px] font-mono">Group / Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. World Financial Forum 2026"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Block Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WFF2026"
                    value={newBlockCode}
                    onChange={(e) => setNewBlockCode(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Room Category</label>
                  <select
                    value={newGroupCategory}
                    onChange={(e) => setNewGroupCategory(e.target.value as RoomCategory)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  >
                    <option value="Deluxe King">Deluxe King</option>
                    <option value="Executive Ocean Suite">Executive Ocean Suite</option>
                    <option value="Panoramic Sky Suite">Panoramic Sky Suite</option>
                    <option value="Presidential Penthouse">Presidential Penthouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Lead Organizer</label>
                  <input
                    type="text"
                    placeholder="e.g. Arthur Pendelton"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. arthur@wff.org"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Allocated Rooms</label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    value={newGroupRooms}
                    onChange={(e) => setNewGroupRooms(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Negotiated Rate ($/n)</label>
                  <input
                    type="number"
                    min="200"
                    value={newGroupRate}
                    onChange={(e) => setNewGroupRate(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Start Date</label>
                  <input
                    type="date"
                    value={newGroupStartDate}
                    onChange={(e) => setNewGroupStartDate(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">End Date</label>
                  <input
                    type="date"
                    value={newGroupEndDate}
                    onChange={(e) => setNewGroupEndDate(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewGroupModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg"
                >
                  Save Contracted Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: PICK UP ROOM UNDER GROUP BLOCK                  */}
      {/* ========================================================= */}
      {pickupModalOpen && selectedBlockForPickup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Pick Up Room in Block</h3>
                <p className="text-xs text-purple-400 font-mono">{selectedBlockForPickup.groupName}</p>
              </div>
              <button
                onClick={() => setPickupModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePickup} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-400 text-[10px] font-mono">Delegate / Guest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ambassador Carlos Mendoza"
                  value={pickupGuestName}
                  onChange={(e) => setPickupGuestName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Room Type:</span>
                  <span className="text-white font-bold">{selectedBlockForPickup.roomCategory}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Block Rate:</span>
                  <span className="text-emerald-400 font-bold">
                    ${selectedBlockForPickup.negotiatedRate}/night
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Billing:</span>
                  <span className="text-purple-300">{selectedBlockForPickup.billingMethod}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPickupModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg"
                >
                  Confirm Delegate Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: BOOK ACTIVITY / EXPERIENCE                      */}
      {/* ========================================================= */}
      {bookActivityModalOpen && selectedActivityToBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Book Resort Experience</h3>
                <p className="text-xs text-sky-400 font-mono">{selectedActivityToBook.title}</p>
              </div>
              <button
                onClick={() => setBookActivityModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookActivitySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-400 text-[10px] font-mono">Guest / Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lady Vivienne Vance"
                  value={actGuestName}
                  onChange={(e) => setActGuestName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Charge To Room #</label>
                  <input
                    type="text"
                    value={actRoomNo}
                    onChange={(e) => setActRoomNo(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Party Size (Guests)</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedActivityToBook.maxCapacity}
                    value={actParticipants}
                    onChange={(e) => setActParticipants(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Date</label>
                  <input
                    type="date"
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Time Slot</label>
                  <select
                    value={actTimeSlot}
                    onChange={(e) => setActTimeSlot(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none"
                  >
                    {selectedActivityToBook.dailySchedule.map((slot, i) => (
                      <option key={i} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-400 text-[10px] font-mono">Special Requirements / Concierge Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Dietary preferences, celebratory champagne, specific instructor"
                  value={actSpecialReq}
                  onChange={(e) => setActSpecialReq(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">
                  Total Charge ({actParticipants} × ${selectedActivityToBook.pricePerPerson}):
                </span>
                <span className="text-base font-black text-emerald-400">
                  ${selectedActivityToBook.pricePerPerson * actParticipants}
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBookActivityModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg"
                >
                  Charge & Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* OPERA CLOUD 8-FOLD RESERVATION DETAIL MODAL               */}
      {/* ========================================================= */}
      {selectedRes && (
        <OperaReservationDetailModal
          reservation={selectedRes}
          onClose={() => setSelectedRes(null)}
          onUpdateReservation={(updated) => {
            if (onUpdateReservation) onUpdateReservation(updated);
            setSelectedRes(updated);
          }}
        />
      )}
    </div>
  );
};
