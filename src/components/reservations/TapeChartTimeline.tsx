import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  User,
  Sparkles,
  BedDouble,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { Reservation, Room, RoomCategory } from "../../types";

interface TapeChartTimelineProps {
  rooms: Room[];
  reservations: Reservation[];
  onSelectReservation: (res: Reservation) => void;
  onBookSlot: (room: Room, dateStr: string) => void;
}

export const TapeChartTimeline: React.FC<TapeChartTimelineProps> = ({
  rooms,
  reservations,
  onSelectReservation,
  onBookSlot,
}) => {
  // Timeline base date (starts from 2026-09-04)
  const [baseDateIndex, setBaseDateIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedFloor, setSelectedFloor] = useState<string>("ALL");

  // Generate 10 consecutive days starting from 2026-09-04 + baseDateIndex
  const initialStartDate = new Date(2026, 8, 4 + baseDateIndex); // Sep 4, 2026

  const daysCount = 10;
  const timelineDates = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(initialStartDate);
    d.setDate(initialStartDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    return { dateStr, dayName, dayNum, monthName, fullDate: d };
  });

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    const catMatch = selectedCategory === "ALL" || r.category === selectedCategory;
    const floorMatch = selectedFloor === "ALL" || r.floor.toString() === selectedFloor;
    return catMatch && floorMatch;
  });

  // Helper to check if a reservation covers a specific room and date
  const getReservationForRoomAndDate = (roomNumber: string, dateStr: string) => {
    return reservations.find((res) => {
      if (res.status === "CANCELLED") return false;
      if (!res.roomNumber) return false;
      // Match room number or suite number
      const cleanRoom = res.roomNumber.replace(/[^0-9]/g, "");
      const currentRoom = roomNumber.replace(/[^0-9]/g, "");
      if (cleanRoom && currentRoom && cleanRoom !== currentRoom) return false;

      // Check date range: checkIn <= dateStr < checkOut
      return dateStr >= res.checkIn && dateStr < res.checkOut;
    });
  };

  // Helper to check if dateStr is the arrival date for this reservation
  const isArrivalDate = (res: Reservation, dateStr: string) => res.checkIn === dateStr;

  // Calculate day occupancy across all rooms
  const getOccupancyForDate = (dateStr: string) => {
    const occupiedCount = rooms.filter((room) => {
      return reservations.some((res) => {
        if (res.status === "CANCELLED" || !res.roomNumber) return false;
        const cleanRoom = res.roomNumber.replace(/[^0-9]/g, "");
        const currentRoom = room.roomNumber.replace(/[^0-9]/g, "");
        if (cleanRoom && currentRoom && cleanRoom !== currentRoom) return false;
        return dateStr >= res.checkIn && dateStr < res.checkOut;
      });
    }).length;
    const pct = Math.round((occupiedCount / Math.max(1, rooms.length)) * 100);
    return { count: occupiedCount, pct };
  };

  const getStatusColor = (res: Reservation) => {
    if (res.groupBlockCode) {
      return "bg-purple-600/90 border-purple-400/80 text-white hover:bg-purple-500 shadow-purple-900/40";
    }
    switch (res.status) {
      case "CHECKED_IN":
        return "bg-emerald-600/90 border-emerald-400/80 text-white hover:bg-emerald-500 shadow-emerald-900/40";
      case "CONFIRMED":
        return "bg-sky-600/90 border-sky-400/80 text-white hover:bg-sky-500 shadow-sky-900/40";
      case "CHECKED_OUT":
        return "bg-slate-700/80 border-slate-600 text-slate-300";
      default:
        return "bg-amber-600/90 border-amber-400 text-white";
    }
  };

  const getHkStatusBadge = (status: Room["status"]) => {
    switch (status) {
      case "INSPECTED":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">INSPECTED</span>;
      case "VACANT_CLEAN":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">CLEAN</span>;
      case "VACANT_DIRTY":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">DIRTY</span>;
      case "OUT_OF_ORDER":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">OOO</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">OCCUPIED</span>;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Control Header & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>OPERA Room Plan & Mews Timeline</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE PMS TAPE CHART
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Visual physical space inventory, housekeeping status & stay duration blocks
            </p>
          </div>
        </div>

        {/* Date Navigator & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Room Categories</option>
              <option value="Presidential Penthouse" className="bg-slate-900">Presidential Penthouse</option>
              <option value="Panoramic Sky Suite" className="bg-slate-900">Panoramic Sky Suite</option>
              <option value="Executive Ocean Suite" className="bg-slate-900">Executive Ocean Suite</option>
              <option value="Deluxe King" className="bg-slate-900">Deluxe King</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Floor:</span>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Floors</option>
              <option value="8" className="bg-slate-900">Floor 8 (Penthouse)</option>
              <option value="5" className="bg-slate-900">Floor 5</option>
              <option value="4" className="bg-slate-900">Floor 4</option>
              <option value="3" className="bg-slate-900">Floor 3</option>
              <option value="2" className="bg-slate-900">Floor 2</option>
              <option value="1" className="bg-slate-900">Floor 1</option>
            </select>
          </div>

          {/* Prev / Next Date Window */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setBaseDateIndex((prev) => prev - 5)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              title="Previous 5 Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setBaseDateIndex(0)}
              className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded"
            >
              Today
            </button>
            <button
              onClick={() => setBaseDateIndex((prev) => prev + 5)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              title="Next 5 Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between text-xs px-2 text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
            <span>In-House (Checked In)</span>
          </span>
          <span className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block"></span>
            <span>Confirmed / Guaranteed</span>
          </span>
          <span className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block"></span>
            <span>Group Block (MICE)</span>
          </span>
          <span className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
            <span>Due In Today</span>
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Tip: Click any booking to open the OPERA 8-Fold Folio • Click empty cell to quick book
        </div>
      </div>

      {/* The Master Tape Chart Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-x-auto">
        <table className="w-full border-collapse min-w-[950px]">
          {/* Header Rows: Dates and Daily Occupancy */}
          <thead>
            {/* Top Date Header */}
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="sticky left-0 z-20 bg-slate-950 p-3 text-left w-56 border-r border-slate-800">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Room & Housekeeping
                </span>
              </th>
              {timelineDates.map((d, idx) => {
                const isToday = d.dateStr === "2026-09-04";
                return (
                  <th
                    key={idx}
                    className={`p-2.5 text-center min-w-[90px] border-r border-slate-800/80 ${
                      isToday ? "bg-sky-950/40 border-sky-500/40" : ""
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      {d.dayName}
                    </div>
                    <div className={`text-sm font-bold font-mono ${isToday ? "text-sky-400" : "text-white"}`}>
                      {d.monthName} {d.dayNum}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* Daily Occupancy Summary Bar (Opera Style) */}
            <tr className="border-b border-slate-800/90 bg-slate-950/40 text-[10px] font-mono">
              <th className="sticky left-0 z-20 bg-slate-950 p-2 text-left border-r border-slate-800 text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Daily Occupancy</span>
                  <span className="text-emerald-400 font-bold">200 Rms Total</span>
                </div>
              </th>
              {timelineDates.map((d, idx) => {
                const { count, pct } = getOccupancyForDate(d.dateStr);
                return (
                  <th key={idx} className="p-2 text-center border-r border-slate-800/80 font-normal">
                    <div className="font-bold text-white font-mono">{pct}%</div>
                    <div className="text-[9px] text-slate-500">{count} occ</div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${pct > 90 ? "bg-rose-500" : pct > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body Rows: Rooms */}
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-slate-800/30 transition-colors group">
                {/* Fixed Left Room Column */}
                <td className="sticky left-0 z-10 bg-slate-950 p-3 border-r border-slate-800 group-hover:bg-slate-900 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-white text-sm flex items-center space-x-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                        <span>Room {room.roomNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={room.category}>
                        {room.category}
                      </div>
                    </div>
                    <div>
                      {getHkStatusBadge(room.status)}
                    </div>
                  </div>
                </td>

                {/* 10 Date Columns for this room */}
                {timelineDates.map((d, colIdx) => {
                  const res = getReservationForRoomAndDate(room.roomNumber, d.dateStr);
                  const isArrival = res ? isArrivalDate(res, d.dateStr) : false;

                  if (res) {
                    return (
                      <td
                        key={colIdx}
                        className="p-1 border-r border-slate-800/60 relative cursor-pointer"
                        onClick={() => onSelectReservation(res)}
                      >
                        <div
                          className={`h-11 px-2 py-1 rounded-lg border text-xs flex flex-col justify-center transition-all ${getStatusColor(
                            res
                          )}`}
                          title={`${res.guestName} (${res.confirmationNo}) - ${res.checkIn} to ${res.checkOut}`}
                        >
                          <div className="font-bold truncate text-[11px] flex items-center space-x-1">
                            {res.vipTier !== "None" && (
                              <Sparkles className="w-2.5 h-2.5 text-amber-300 inline shrink-0" />
                            )}
                            <span className="truncate">{res.guestName}</span>
                          </div>
                          <div className="text-[9px] font-mono opacity-90 truncate flex items-center justify-between">
                            <span>{res.confirmationNo}</span>
                            <span className="font-bold">${res.ratePerNight}</span>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  // Empty Cell (Available Room)
                  return (
                    <td
                      key={colIdx}
                      className="p-1 border-r border-slate-800/60 hover:bg-emerald-950/20 transition-colors cursor-pointer group/cell"
                      onClick={() => onBookSlot(room, d.dateStr)}
                      title={`Available - Click to book Room ${room.roomNumber} on ${d.dateStr}`}
                    >
                      <div className="h-11 rounded-lg border border-transparent group-hover/cell:border-emerald-500/40 group-hover/cell:bg-emerald-900/10 flex items-center justify-center transition-all">
                        <Plus className="w-3.5 h-3.5 text-slate-700 group-hover/cell:text-emerald-400 transition-colors opacity-0 group-hover/cell:opacity-100" />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
