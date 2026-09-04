import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  Key,
  Trash2,
  BedDouble,
  FileSpreadsheet,
  Building2,
  DollarSign,
  AlertCircle,
  Clock,
  X,
  UserCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";
import {
  GroupBlock,
  GroupDelegate,
  Reservation,
  Room,
  RoomCategory,
  BillingRoutingInstruction,
} from "../../../types";

interface GroupRoomingListProps {
  currentBlock: GroupBlock;
  rooms: Room[];
  reservations?: Reservation[];
  onPickupDelegate: (blockId: string, delegate: GroupDelegate, reservation: Reservation) => void;
  onBatchPickupDelegates: (blockId: string, delegates: GroupDelegate[], reservations: Reservation[]) => void;
  onCancelDelegate: (blockId: string, delegateId: string, reservationId: string) => void;
  onCheckInDelegate: (blockId: string, delegateId: string, reservationId: string) => void;
  quickPickupPrefill?: {
    date: string;
    roomCategory: RoomCategory;
    rate: number;
  } | null;
  onClearQuickPickupPrefill?: () => void;
}

export const GroupRoomingList: React.FC<GroupRoomingListProps> = ({
  currentBlock,
  rooms,
  reservations = [],
  onPickupDelegate,
  onBatchPickupDelegates,
  onCancelDelegate,
  onCheckInDelegate,
  quickPickupPrefill,
  onClearQuickPickupPrefill,
}) => {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED">("ALL");
  const [routingFilter, setRoutingFilter] = useState<"ALL" | "MASTER_FOLIO" | "SPLIT_BILLING" | "INDIVIDUAL_OWN_ACCOUNT">("ALL");

  // Single Pickup Modal
  const [pickupModalOpen, setPickupModalOpen] = useState(!!quickPickupPrefill);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("+1 415 555 0100");
  const [vipTier, setVipTier] = useState<"Standard" | "Silver" | "Gold" | "Diamond" | "Royal VIP">("Gold");
  const [roomCategory, setRoomCategory] = useState<RoomCategory>(
    quickPickupPrefill?.roomCategory || currentBlock.roomCategory || "Executive Ocean Suite"
  );
  const [assignedRoomNumber, setAssignedRoomNumber] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState(
    quickPickupPrefill?.date || currentBlock.startDate
  );
  const [checkOutDate, setCheckOutDate] = useState(currentBlock.endDate);
  const [billingRouting, setBillingRouting] = useState<BillingRoutingInstruction>("MASTER_FOLIO");
  const [specialRequests, setSpecialRequests] = useState("Group Delegate Protocol Access");

  // Batch Manifest Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchRows, setBatchRows] = useState<
    Array<{
      name: string;
      email: string;
      category: RoomCategory;
      vip: string;
      room: string;
    }>
  >([
    { name: "Dr. Arthur Vance", email: "a.vance@techsummit.org", category: "Executive Ocean Suite", vip: "Diamond", room: "" },
    { name: "Elena Rostov", email: "elena.r@deepmind.com", category: "Deluxe King", vip: "Gold", room: "" },
    { name: "Marcus Aurelius", email: "marcus@rome-ai.org", category: "Executive Ocean Suite", vip: "Gold", room: "" },
    { name: "Siddharth Mehta", email: "smehta@consortium.in", category: "Deluxe King", vip: "Silver", room: "" },
  ]);

  // Sync quickPickupPrefill when passed
  React.useEffect(() => {
    if (quickPickupPrefill) {
      setRoomCategory(quickPickupPrefill.roomCategory);
      setCheckInDate(quickPickupPrefill.date);
      setPickupModalOpen(true);
    }
  }, [quickPickupPrefill]);

  // Extract delegates from currentBlock
  const delegates: GroupDelegate[] = currentBlock.delegates || [];

  // Filter delegates
  const filteredDelegates = delegates.filter((del) => {
    const matchesSearch =
      del.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      del.confirmationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      del.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      del.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || del.status === statusFilter;
    const matchesRouting = routingFilter === "ALL" || del.billingRouting === routingFilter;

    return matchesSearch && matchesStatus && matchesRouting;
  });

  // Calculate available rooms for selection
  const availableMatchingRooms = rooms.filter(
    (r) => r.category === roomCategory && (r.status === "VACANT_CLEAN" || r.status === "VACANT_INSPECTED")
  );

  // Handle single delegate submit
  const handleSinglePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const negotiatedRate = currentBlock.negotiatedRate || 500;
    const totalAmount = nights * negotiatedRate;
    const isMaster = billingRouting === "MASTER_FOLIO";

    const confNo = `XY-G${Math.floor(100 + Math.random() * 900)}`;
    const delegateId = `del-${Date.now()}`;
    const reservationId = `res-${delegateId}`;

    const newDelegate: GroupDelegate = {
      id: delegateId,
      reservationId,
      confirmationNo: confNo,
      guestName,
      email: guestEmail || `${guestName.toLowerCase().replace(/\s+/g, ".")}@group.com`,
      vipTier,
      roomCategory,
      roomNumber: assignedRoomNumber || undefined,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      billingRouting,
      folioBalance: isMaster ? 0 : totalAmount,
      status: "CONFIRMED",
    };

    const newReservation: Reservation = {
      id: reservationId,
      confirmationNo: confNo,
      guestName,
      guestEmail: guestEmail || `${guestName.toLowerCase().replace(/\s+/g, ".")}@group.com`,
      guestPhone,
      roomCategory,
      roomNumber: assignedRoomNumber || undefined,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      adults: 1,
      children: 0,
      status: "CONFIRMED",
      ratePlan: currentBlock.rateCode || "Corporate Luxury",
      ratePerNight: negotiatedRate,
      totalAmount,
      paidAmount: isMaster ? totalAmount : 0,
      balance: isMaster ? 0 : totalAmount,
      channel: "Direct Web",
      vipTier,
      specialRequests: specialRequests ? [specialRequests] : ["Group Block Delegate"],
      digitalKeyActive: false,
      regCardSigned: true,
      groupBlockCode: currentBlock.blockCode,
      routingInstruction: billingRouting,
      companyName: currentBlock.companyAccount,
    };

    onPickupDelegate(currentBlock.id, newDelegate, newReservation);

    // Reset & close
    setGuestName("");
    setGuestEmail("");
    setAssignedRoomNumber("");
    setPickupModalOpen(false);
    if (onClearQuickPickupPrefill) onClearQuickPickupPrefill();
  };

  // Handle batch manifest submit
  const handleBatchManifestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = batchRows.filter((r) => r.name.trim() !== "");
    if (validRows.length === 0) return;

    const start = new Date(currentBlock.startDate);
    const end = new Date(currentBlock.endDate);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const negotiatedRate = currentBlock.negotiatedRate || 500;
    const totalAmount = nights * negotiatedRate;

    const newDelegates: GroupDelegate[] = [];
    const newReservations: Reservation[] = [];

    validRows.forEach((row, idx) => {
      const confNo = `XY-G${Math.floor(200 + idx * 10 + Math.random() * 9)}`;
      const delId = `del-batch-${Date.now()}-${idx}`;
      const resId = `res-${delId}`;

      const del: GroupDelegate = {
        id: delId,
        reservationId: resId,
        confirmationNo: confNo,
        guestName: row.name,
        email: row.email || `${row.name.toLowerCase().replace(/\s+/g, ".")}@group.com`,
        vipTier: row.vip as any,
        roomCategory: row.category,
        roomNumber: row.room || undefined,
        checkIn: currentBlock.startDate,
        checkOut: currentBlock.endDate,
        billingRouting: "MASTER_FOLIO",
        folioBalance: 0,
        status: "CONFIRMED",
      };

      const res: Reservation = {
        id: resId,
        confirmationNo: confNo,
        guestName: row.name,
        guestEmail: row.email || `${row.name.toLowerCase().replace(/\s+/g, ".")}@group.com`,
        guestPhone: "+1 555 0100",
        roomCategory: row.category,
        roomNumber: row.room || undefined,
        checkIn: currentBlock.startDate,
        checkOut: currentBlock.endDate,
        nights,
        adults: 1,
        children: 0,
        status: "CONFIRMED",
        ratePlan: currentBlock.rateCode || "Corporate Luxury",
        ratePerNight: negotiatedRate,
        totalAmount,
        paidAmount: totalAmount,
        balance: 0,
        channel: "Direct Web",
        vipTier: row.vip as any,
        specialRequests: ["Batch Manifest Registered"],
        digitalKeyActive: false,
        regCardSigned: true,
        groupBlockCode: currentBlock.blockCode,
        routingInstruction: "MASTER_ROOM_AND_TAX",
        companyName: currentBlock.companyAccount,
      };

      newDelegates.push(del);
      newReservations.push(res);
    });

    onBatchPickupDelegates(currentBlock.id, newDelegates, newReservations);
    setBatchModalOpen(false);
  };

  // Export CSV Manifest
  const handleExportCsv = () => {
    if (delegates.length === 0) return;

    const headers = [
      "Confirmation No",
      "Guest Name",
      "Email",
      "VIP Tier",
      "Room Category",
      "Room Number",
      "Check-In",
      "Check-Out",
      "Billing Routing",
      "Status",
    ];

    const rows = delegates.map((d) => [
      d.confirmationNo,
      `"${d.guestName}"`,
      d.email,
      d.vipTier || "Standard",
      `"${d.roomCategory}"`,
      d.roomNumber || "Unassigned",
      d.checkIn,
      d.checkOut,
      d.billingRouting,
      d.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RoomingList_${currentBlock.blockCode}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Control Bar: Search, Filters & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search delegate, conf #, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500 w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Statuses ({delegates.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked-In</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={routingFilter}
            onChange={(e) => setRoutingFilter(e.target.value as any)}
            className="bg-slate-950 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Billing Routings</option>
            <option value="MASTER_FOLIO">Master Folio (100% Corp)</option>
            <option value="SPLIT_BILLING">Split (Room to Master / Incidentals Own)</option>
            <option value="INDIVIDUAL_OWN_ACCOUNT">Individual Own Account</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            disabled={delegates.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setBatchModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold border border-purple-500/30 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
            <span>Batch Manifest</span>
          </button>

          <button
            onClick={() => {
              setPickupModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pick Up Delegate</span>
          </button>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="py-3 px-4 font-semibold">CONF #</th>
                <th className="py-3 px-4 font-semibold">DELEGATE NAME & VIP</th>
                <th className="py-3 px-4 font-semibold">ROOM CATEGORY</th>
                <th className="py-3 px-4 font-semibold">ASSIGNED ROOM</th>
                <th className="py-3 px-4 font-semibold">STAY DATES</th>
                <th className="py-3 px-4 font-semibold">BILLING ROUTING</th>
                <th className="py-3 px-4 font-semibold">FOLIO BAL</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredDelegates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No delegates found matching the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredDelegates.map((del) => {
                  const isCheckedIn = del.status === "CHECKED_IN";
                  const isCancelled = del.status === "CANCELLED";

                  return (
                    <tr
                      key={del.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isCancelled ? "opacity-40 line-through" : ""
                      }`}
                    >
                      {/* Conf # */}
                      <td className="py-3 px-4 font-bold text-purple-400">
                        {del.confirmationNo}
                      </td>

                      {/* Delegate Name & VIP */}
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{del.guestName}</span>
                          {del.vipTier && (del.vipTier as string) !== "None" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {del.vipTier}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{del.email}</div>
                      </td>

                      {/* Room Category */}
                      <td className="py-3 px-4 font-sans text-slate-300">
                        {del.roomCategory}
                      </td>

                      {/* Assigned Room */}
                      <td className="py-3 px-4">
                        {del.roomNumber ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              {del.roomNumber}
                            </span>
                            {isCheckedIn && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Occupied" />
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-400/80 italic font-sans text-[11px]">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Stay Dates */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <div>
                          {del.checkIn} → {del.checkOut}
                        </div>
                      </td>

                      {/* Billing Routing */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            del.billingRouting === "MASTER_FOLIO"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : del.billingRouting === "SPLIT_BILLING"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {del.billingRouting === "MASTER_FOLIO"
                            ? "Master Folio"
                            : del.billingRouting === "SPLIT_BILLING"
                            ? "Split (Rm to Master)"
                            : "Direct Own Folio"}
                        </span>
                      </td>

                      {/* Folio Bal */}
                      <td className="py-3 px-4 font-bold text-slate-300">
                        ${del.folioBalance || 0}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            isCheckedIn
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : isCancelled
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {del.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isCheckedIn && !isCancelled && (
                            <button
                              onClick={() =>
                                onCheckInDelegate(currentBlock.id, del.id, del.reservationId)
                              }
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="Check In & Issue Digital Key"
                            >
                              <Key className="w-3 h-3" />
                              <span>Check In</span>
                            </button>
                          )}

                          {!isCancelled && (
                            <button
                              onClick={() =>
                                onCancelDelegate(currentBlock.id, del.id, del.reservationId)
                              }
                              className="p-1 rounded bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition cursor-pointer"
                              title="Cancel & Release Delegate"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE DELEGATE PICKUP MODAL */}
      {pickupModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Pick Up Delegate Room into Block ({currentBlock.blockCode})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Creates confirmed reservation synchronized with OPERA PMS & Room Inventory
                </p>
              </div>
              <button
                onClick={() => {
                  setPickupModalOpen(false);
                  if (onClearQuickPickupPrefill) onClearQuickPickupPrefill();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSinglePickupSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Vance"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Guest Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. a.vance@techsummit.org"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    VIP Tier
                  </label>
                  <select
                    value={vipTier}
                    onChange={(e) => setVipTier(e.target.value as any)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Royal VIP">Royal VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Room Category
                  </label>
                  <select
                    value={roomCategory}
                    onChange={(e) => setRoomCategory(e.target.value as RoomCategory)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
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
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Assign Physical Room (Optional)
                  </label>
                  <select
                    value={assignedRoomNumber}
                    onChange={(e) => setAssignedRoomNumber(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="">-- Assign Later / Auto --</option>
                    {availableMatchingRooms.map((rm) => (
                      <option key={rm.id} value={rm.roomNumber}>
                        {rm.roomNumber} - {rm.status} ({rm.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Billing Instruction
                  </label>
                  <select
                    value={billingRouting}
                    onChange={(e) => setBillingRouting(e.target.value as BillingRoutingInstruction)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  >
                    <option value="MASTER_FOLIO">Master Folio (100% to Group)</option>
                    <option value="SPLIT_BILLING">Split: Room to Master / Extras to Guest</option>
                    <option value="INDIVIDUAL_OWN_ACCOUNT">Individual Own Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Negotiated Group Rate:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${currentBlock.negotiatedRate} / night (Fixed Contract Rate)
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setPickupModalOpen(false);
                    if (onClearQuickPickupPrefill) onClearQuickPickupPrefill();
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  Confirm & Sync to PMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH MANIFEST MODAL */}
      {batchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  <span>Batch Rooming List Manifest ({currentBlock.blockCode})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Register multiple delegates simultaneously with automatic folio routing
                </p>
              </div>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px] border-b border-slate-800">
                    <th className="pb-2">GUEST FULL NAME</th>
                    <th className="pb-2">EMAIL</th>
                    <th className="pb-2">ROOM CATEGORY</th>
                    <th className="pb-2">VIP</th>
                    <th className="pb-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {batchRows.map((row, index) => (
                    <tr key={index} className="space-y-1">
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => {
                            const copy = [...batchRows];
                            copy[index].name = e.target.value;
                            setBatchRows(copy);
                          }}
                          className="w-full bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                          placeholder="Guest name"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="email"
                          value={row.email}
                          onChange={(e) => {
                            const copy = [...batchRows];
                            copy[index].email = e.target.value;
                            setBatchRows(copy);
                          }}
                          className="w-full bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                          placeholder="Email"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <select
                          value={row.category}
                          onChange={(e) => {
                            const copy = [...batchRows];
                            copy[index].category = e.target.value as RoomCategory;
                            setBatchRows(copy);
                          }}
                          className="w-full bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                        >
                          <option value="Executive Ocean Suite">Executive Ocean Suite</option>
                          <option value="Deluxe King">Deluxe King</option>
                          <option value="Panoramic Sky Suite">Panoramic Sky Suite</option>
                        </select>
                      </td>
                      <td className="py-1.5 pr-2">
                        <select
                          value={row.vip}
                          onChange={(e) => {
                            const copy = [...batchRows];
                            copy[index].vip = e.target.value;
                            setBatchRows(copy);
                          }}
                          className="w-full bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Diamond">Diamond</option>
                        </select>
                      </td>
                      <td className="py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setBatchRows(batchRows.filter((_, i) => i !== index));
                          }}
                          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                onClick={() =>
                  setBatchRows([
                    ...batchRows,
                    { name: "", email: "", category: "Deluxe King", vip: "Gold", room: "" },
                  ])
                }
                className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center space-x-1 pt-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                Total to register: {batchRows.filter((r) => r.name.trim()).length} delegates
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchManifestSubmit}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  Commit All to PMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
