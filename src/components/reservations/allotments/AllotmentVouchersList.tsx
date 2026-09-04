import React, { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  CreditCard,
  Bed,
  Utensils,
  ChevronDown,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  AllotmentContract,
  AllotmentVoucherBooking,
  RoomCategory,
  MealPlan,
  Reservation,
} from "../../../types";

interface AllotmentVouchersListProps {
  contract: AllotmentContract;
  onUpdateContract: (updated: AllotmentContract) => void;
  onSyncReservationToPms: (reservation: Reservation) => void;
  onCheckInVoucherPms?: (reservationId: string, roomNumber: string) => void;
  onCancelVoucherPms?: (reservationId: string) => void;
}

export const AllotmentVouchersList: React.FC<AllotmentVouchersListProps> = ({
  contract,
  onUpdateContract,
  onSyncReservationToPms,
  onCheckInVoucherPms,
  onCancelVoucherPms,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Single Voucher Modal
  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);
  const [voucherNo, setVoucherNo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [roomCat, setRoomCat] = useState<RoomCategory>(contract.roomAllocations[0]?.roomCategory || "Deluxe King");
  const [checkIn, setCheckIn] = useState("2026-09-08");
  const [checkOut, setCheckOut] = useState("2026-09-15");
  const [paxAdults, setPaxAdults] = useState(2);
  const [paxChildren, setPaxChildren] = useState(0);
  const [mealPlan, setMealPlan] = useState<MealPlan>(contract.defaultMealPlan || "BB");
  const [specialRequests, setSpecialRequests] = useState("");

  // Batch Import Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRawText, setBatchRawText] = useState("");

  // Check In Modal
  const [checkInTarget, setCheckInTarget] = useState<AllotmentVoucherBooking | null>(null);
  const [assignedRoom, setAssignedRoom] = useState("208");

  // Filter vouchers
  const filteredVouchers = contract.vouchers.filter((v) => {
    const matchesSearch =
      v.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.confirmationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.roomNumber && v.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || v.roomCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Totals
  const totalBookedRevenue = contract.vouchers.reduce((sum, v) => (v.status !== "CANCELLED" ? sum + v.totalNetCharge : sum), 0);
  const totalRoomNights = contract.vouchers.reduce((sum, v) => (v.status !== "CANCELLED" ? sum + v.nights : sum), 0);

  // Handle Single Voucher Submit
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherNo.trim() || !guestName.trim()) return;

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const nights = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

    const alloc = contract.roomAllocations.find((a) => a.roomCategory === roomCat);
    const netRate = alloc ? alloc.contractedNetRate : 240;
    const barRate = alloc ? alloc.retailBarRate : 420;
    const totalCharge = netRate * nights;

    const resId = `res-allot-${Date.now()}`;
    const confNo = `XY-${contract.contractCode.slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVoucher: AllotmentVoucherBooking = {
      id: `vch-${Date.now()}`,
      voucherNumber: voucherNo.trim(),
      reservationId: resId,
      confirmationNo: confNo,
      guestName: guestName.trim(),
      passengerEmail: guestEmail.trim() || undefined,
      passengerPhone: guestPhone.trim() || undefined,
      roomCategory: roomCat,
      checkIn,
      checkOut,
      nights,
      paxAdults,
      paxChildren,
      mealPlan,
      contractedNetRate: netRate,
      totalNetCharge: totalCharge,
      retailBarEquivalent: barRate * nights,
      status: "CONFIRMED",
      bookingDate: new Date().toISOString().split("T")[0],
      specialRequests: specialRequests.trim() || undefined,
    };

    // Sync to PMS Reservations
    const pmsRes: Reservation = {
      id: resId,
      confirmationNo: confNo,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, ".")}@guest.com`,
      guestPhone: guestPhone.trim() || "+1 555-0199",
      roomCategory: roomCat,
      checkIn,
      checkOut,
      nights,
      adults: paxAdults,
      children: paxChildren,
      status: "CONFIRMED",
      channel: "Wholesaler / Tour Operator",
      ratePlan: "Wholesale Series Contract",
      ratePerNight: netRate,
      totalAmount: totalCharge,
      paidAmount: totalCharge,
      balance: 0,
      vipTier: "None",
      digitalKeyActive: false,
      regCardSigned: false,
      companyName: contract.partnerName,
      specialRequests: [
        `Voucher Ref: ${voucherNo}`,
        `Meal Plan: ${mealPlan}`,
        `Tour Operator: ${contract.partnerName}`,
        specialRequests,
      ].filter(Boolean) as string[],
    };

    onSyncReservationToPms(pmsRes);

    onUpdateContract({
      ...contract,
      vouchers: [newVoucher, ...contract.vouchers],
    });

    setIsNewVoucherModalOpen(false);
    setVoucherNo("");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setSpecialRequests("");
  };

  // Handle Batch Import
  const handleBatchImport = () => {
    if (!batchRawText.trim()) return;

    const lines = batchRawText.split("\n").filter((l) => l.trim().length > 0);
    const newVouchers: AllotmentVoucherBooking[] = [];

    lines.forEach((line, idx) => {
      // Format: VoucherNumber, GuestName, CheckIn, CheckOut, RoomCategory, MealPlan
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        const vNo = parts[0] || `VCH-IMP-${Date.now()}-${idx}`;
        const gName = parts[1] || "Valued Passenger";
        const cIn = parts[2] || "2026-09-12";
        const cOut = parts[3] || "2026-09-19";
        const rCat = (parts[4] as RoomCategory) || contract.roomAllocations[0]?.roomCategory || "Deluxe King";
        const mPlan = (parts[5] as MealPlan) || contract.defaultMealPlan || "BB";

        const inDate = new Date(cIn);
        const outDate = new Date(cOut);
        const nights = Math.max(1, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

        const alloc = contract.roomAllocations.find((a) => a.roomCategory === rCat) || contract.roomAllocations[0];
        const netRate = alloc ? alloc.contractedNetRate : 240;
        const totalNet = netRate * nights;

        const resId = `res-allot-batch-${Date.now()}-${idx}`;
        const confNo = `XY-ALLOT-${Math.floor(1000 + Math.random() * 9000)}`;

        const v: AllotmentVoucherBooking = {
          id: `vch-b-${Date.now()}-${idx}`,
          voucherNumber: vNo,
          reservationId: resId,
          confirmationNo: confNo,
          guestName: gName,
          roomCategory: rCat,
          checkIn: cIn,
          checkOut: cOut,
          nights,
          paxAdults: 2,
          paxChildren: 0,
          mealPlan: mPlan,
          contractedNetRate: netRate,
          totalNetCharge: totalNet,
          retailBarEquivalent: (alloc?.retailBarRate || 420) * nights,
          status: "CONFIRMED",
          bookingDate: new Date().toISOString().split("T")[0],
          specialRequests: `Batch Imported via Wholesaler EDI / Manifest`,
        };

        newVouchers.push(v);

        // Sync PMS reservation
        onSyncReservationToPms({
          id: resId,
          confirmationNo: confNo,
          guestName: gName,
          guestEmail: `${gName.toLowerCase().replace(/\s+/g, ".")}@allotment-manifest.com`,
          guestPhone: "+1 555-0128",
          roomCategory: rCat,
          checkIn: cIn,
          checkOut: cOut,
          nights,
          adults: 2,
          children: 0,
          status: "CONFIRMED",
          channel: "Wholesaler / Tour Operator",
          ratePlan: "Wholesale Series Contract",
          ratePerNight: netRate,
          totalAmount: totalNet,
          paidAmount: totalNet,
          balance: 0,
          vipTier: "None",
          digitalKeyActive: false,
          regCardSigned: false,
          companyName: contract.partnerName,
          specialRequests: [`Voucher: ${vNo}`, `Meal Plan: ${mPlan}`, `Contract: ${contract.contractCode}`],
        });
      }
    });

    if (newVouchers.length > 0) {
      onUpdateContract({
        ...contract,
        vouchers: [...newVouchers, ...contract.vouchers],
      });
    }

    setIsBatchModalOpen(false);
    setBatchRawText("");
  };

  const loadSampleBatchManifest = () => {
    setBatchRawText(
      `TUI-VCH-994101, Gustav & Greta Lindqvist, 2026-09-12, 2026-09-19, Deluxe King, HB\n` +
      `TUI-VCH-994102, Magnus Carlsson, 2026-09-12, 2026-09-17, Deluxe King, HB\n` +
      `TUI-VCH-994103, Anders & Eva Holmberg, 2026-09-14, 2026-09-21, Executive Ocean Suite, HB`
    );
  };

  // Check in action
  const handleExecuteCheckIn = () => {
    if (!checkInTarget) return;

    const updatedVouchers = contract.vouchers.map((v) =>
      v.id === checkInTarget.id ? { ...v, status: "CHECKED_IN" as const, roomNumber: assignedRoom } : v
    );

    onUpdateContract({
      ...contract,
      vouchers: updatedVouchers,
    });

    if (onCheckInVoucherPms) {
      onCheckInVoucherPms(checkInTarget.reservationId, assignedRoom);
    }

    setCheckInTarget(null);
  };

  // Cancel action
  const handleCancelVoucher = (v: AllotmentVoucherBooking) => {
    const updatedVouchers = contract.vouchers.map((item) =>
      item.id === v.id ? { ...item, status: "CANCELLED" as const } : item
    );

    onUpdateContract({
      ...contract,
      vouchers: updatedVouchers,
    });

    if (onCancelVoucherPms) {
      onCancelVoucherPms(v.reservationId);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "Voucher Number",
      "Confirmation No",
      "Guest Name",
      "Room Category",
      "Room Number",
      "Check In",
      "Check Out",
      "Nights",
      "Adults",
      "Children",
      "Meal Plan",
      "Contracted Net Rate",
      "Total Net Charge",
      "Status",
    ];

    const rows = contract.vouchers.map((v) => [
      v.voucherNumber,
      v.confirmationNo,
      `"${v.guestName}"`,
      `"${v.roomCategory}"`,
      v.roomNumber || "Unassigned",
      v.checkIn,
      v.checkOut,
      v.nights,
      v.paxAdults,
      v.paxChildren,
      v.mealPlan,
      v.contractedNetRate,
      v.totalNetCharge,
      v.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Allotment_Vouchers_${contract.contractCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Picked Vouchers</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {contract.vouchers.filter((v) => v.status !== "CANCELLED").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Confirmed & Active in PMS
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Picked Room Nights</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
            {totalRoomNights}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Contracted Wholesaler Nights
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Net Recognized Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ${totalBookedRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Direct Wholesaler A/R
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Default Meal Inclusion</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1 flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <span>{contract.defaultMealPlan}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {contract.defaultMealPlan === "HB"
              ? "Half Board (Breakfast + Dinner)"
              : contract.defaultMealPlan === "BB"
              ? "Bed & Breakfast"
              : contract.defaultMealPlan === "AI"
              ? "All-Inclusive Resort"
              : "Room Only"}
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Voucher #, guest name, confirmation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Room Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Room Categories</option>
            {contract.roomAllocations.map((a) => (
              <option key={a.roomCategory} value={a.roomCategory}>
                {a.roomCategory}
              </option>
            ))}
          </select>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
            title="Export Manifest to CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-indigo-500/30"
          >
            <Upload className="w-4 h-4" />
            <span>Batch Manifest Intake</span>
          </button>

          <button
            onClick={() => setIsNewVoucherModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>+ Pick Up Wholesaler Voucher</span>
          </button>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="py-3 px-4">Voucher & Booking Ref</th>
                <th className="py-3 px-4">Passenger / Guest Name</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Room Category & No.</th>
                <th className="py-3 px-4">Meal Plan</th>
                <th className="py-3 px-4 text-right">Net Rate & Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-sans">
                    No wholesaler vouchers found matching the current criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Voucher & Conf No */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-amber-400 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-400/70" />
                          <span>{v.voucherNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                          CRS: <span className="font-mono text-slate-400">{v.confirmationNo}</span>
                        </div>
                      </td>

                      {/* Guest Name */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white text-sm">{v.guestName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {v.paxAdults} Adult{v.paxAdults > 1 ? "s" : ""}
                          {v.paxChildren > 0 ? `, ${v.paxChildren} Child` : ""}
                          {v.passengerPhone && ` • ${v.passengerPhone}`}
                        </div>
                      </td>

                      {/* Stay Dates */}
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">
                          {v.checkIn} <span className="text-slate-500">→</span> {v.checkOut}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {v.nights} Night{v.nights > 1 ? "s" : ""}
                        </div>
                      </td>

                      {/* Room Category */}
                      <td className="py-3 px-4 font-sans">
                        <div className="text-slate-200 font-medium flex items-center space-x-1.5">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.roomCategory}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {v.roomNumber ? (
                            <span className="text-emerald-400 font-bold">Room {v.roomNumber}</span>
                          ) : (
                            <span className="text-slate-500 italic">Not Assigned</span>
                          )}
                        </div>
                      </td>

                      {/* Meal Plan */}
                      <td className="py-3 px-4 font-sans">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Utensils className="w-3 h-3" />
                          <span>{v.mealPlan}</span>
                        </span>
                      </td>

                      {/* Net Rate & Total */}
                      <td className="py-3 px-4 text-right">
                        <div className="text-emerald-400 font-bold text-sm">
                          ${v.totalNetCharge.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          ${v.contractedNetRate}/night • BAR: ${v.retailBarEquivalent}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center font-sans">
                        {v.status === "CHECKED_IN" ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In-House</span>
                          </span>
                        ) : v.status === "CONFIRMED" ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            <Clock className="w-3 h-3" />
                            <span>Confirmed</span>
                          </span>
                        ) : v.status === "CHECKED_OUT" ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            <span>Checked Out</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end space-x-1.5">
                          {v.status === "CONFIRMED" && (
                            <>
                              <button
                                onClick={() => {
                                  setCheckInTarget(v);
                                  setAssignedRoom("304");
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                                title="Check In Passenger"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Check-In</span>
                              </button>

                              <button
                                onClick={() => handleCancelVoucher(v)}
                                className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] transition-colors"
                                title="Cancel Voucher"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {v.status === "CHECKED_IN" && (
                            <span className="text-[11px] text-emerald-400 font-mono">
                              Key Active
                            </span>
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

      {/* Modal: Pick Up Wholesaler Voucher */}
      {isNewVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Wholesaler Voucher Intake ({contract.partnerName})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick up tour operator voucher and automatically register in PMS reservations.
                </p>
              </div>
              <button
                onClick={() => setIsNewVoucherModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Wholesaler Voucher # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TUI-VCH-994820"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Lead Passenger / Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Henrik & Astrid Lindqvist"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Passenger Email</label>
                  <input
                    type="email"
                    placeholder="passenger@tour-booking.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+46 70 123 4567"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Room Category *</label>
                  <select
                    value={roomCat}
                    onChange={(e) => setRoomCat(e.target.value as RoomCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {contract.roomAllocations.map((a) => (
                      <option key={a.roomCategory} value={a.roomCategory}>
                        {a.roomCategory} (${a.contractedNetRate}/night net)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contracted Meal Plan</label>
                  <select
                    value={mealPlan}
                    onChange={(e) => setMealPlan(e.target.value as MealPlan)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="RO">RO - Room Only</option>
                    <option value="BB">BB - Bed & Breakfast</option>
                    <option value="HB">HB - Half Board (Breakfast + Dinner)</option>
                    <option value="FB">FB - Full Board</option>
                    <option value="AI">AI - All Inclusive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Check-In Date *</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Adults</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={paxAdults}
                    onChange={(e) => setPaxAdults(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Children</label>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={paxChildren}
                    onChange={(e) => setPaxChildren(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Special Requests & Flight Details</label>
                <input
                  type="text"
                  placeholder="e.g. Flight arrival LH-882 at 18:30, high floor, twin beds"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40"
                >
                  Confirm & Sync to PMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Batch Manifest Import */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  <span>Batch Wholesaler Manifest Intake</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import multiple tour operator vouchers simultaneously from tour manifest or CSV.
                </p>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                Format: <strong className="font-mono">VoucherNumber, GuestName, CheckIn, CheckOut, RoomCategory, MealPlan</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Paste manifest lines below:</span>
                <button
                  type="button"
                  onClick={loadSampleBatchManifest}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  Load Sample Tour Manifest
                </button>
              </div>

              <textarea
                rows={6}
                value={batchRawText}
                onChange={(e) => setBatchRawText(e.target.value)}
                placeholder="TUI-VCH-01, Lars Svensson, 2026-09-12, 2026-09-19, Deluxe King, HB&#10;TUI-VCH-02, Karin Eriksson, 2026-09-12, 2026-09-19, Deluxe King, HB"
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
              />

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchImport}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-950/40"
                >
                  Import All Vouchers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Check In Guest */}
      {checkInTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Check In Wholesaler Guest</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400">Passenger Name:</div>
                <div className="font-bold text-white text-sm">{checkInTarget.guestName}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Voucher: <span className="font-mono text-amber-400">{checkInTarget.voucherNumber}</span> • {checkInTarget.roomCategory}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Assign Room Number</label>
                <input
                  type="text"
                  value={assignedRoom}
                  onChange={(e) => setAssignedRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center space-x-2 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Issue RFID / Digital Key & mark in PMS Front Office</span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCheckInTarget(null)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteCheckIn}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Complete Check-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
