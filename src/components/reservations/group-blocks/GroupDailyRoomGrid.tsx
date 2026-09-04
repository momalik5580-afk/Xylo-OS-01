import React, { useState } from "react";
import {
  Calendar,
  Layers,
  Plus,
  Edit2,
  Check,
  X,
  UserPlus,
  BedDouble,
  DollarSign,
  TrendingUp,
  Sparkles,
  Info,
} from "lucide-react";
import {
  GroupBlock,
  GroupBlockDailyGrid,
  GroupBlockRoomTypeAllocation,
  RoomCategory,
} from "../../../types";

interface GroupDailyRoomGridProps {
  currentBlock: GroupBlock;
  onUpdateBlock: (updated: GroupBlock) => void;
  onQuickPickupFromGrid: (date: string, roomCategory: RoomCategory, rate: number) => void;
}

export const GroupDailyRoomGrid: React.FC<GroupDailyRoomGridProps> = ({
  currentBlock,
  onUpdateBlock,
  onQuickPickupFromGrid,
}) => {
  // State for cell inline editing
  const [editingCell, setEditingCell] = useState<{
    date: string;
    category: RoomCategory;
    allocated: number;
    rate: number;
  } | null>(null);

  // State for Add Category modal
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState<RoomCategory>("Deluxe King");
  const [newCatAlloc, setNewCatAlloc] = useState<number>(10);
  const [newCatRate, setNewCatRate] = useState<number>(420);

  // Build grid if not present or extract from currentBlock
  const roomGrid: GroupBlockDailyGrid[] = currentBlock.roomGrid || [];

  // Extract unique room categories present in the grid
  const uniqueCategories: RoomCategory[] = Array.from(
    new Set(
      roomGrid.flatMap((d) => d.allocations.map((a) => a.roomCategory))
    )
  );

  // If grid is empty, fallback
  if (uniqueCategories.length === 0 && currentBlock.roomCategory) {
    uniqueCategories.push(currentBlock.roomCategory);
  }

  // Calculate dynamic pickup from currentBlock.delegates for a specific date & category
  const getDynamicPickedUp = (dateStr: string, category: RoomCategory, fallbackCount: number): number => {
    if (!currentBlock.delegates || currentBlock.delegates.length === 0) {
      return fallbackCount;
    }
    const matchingDelegates = currentBlock.delegates.filter((del) => {
      if (del.status === "CANCELLED") return false;
      if (del.roomCategory !== category) return false;
      // Delegate stays from checkIn <= date < checkOut
      return dateStr >= del.checkIn && dateStr < del.checkOut;
    });
    return Math.max(matchingDelegates.length, fallbackCount);
  };

  // Save cell edit
  const handleSaveCellEdit = () => {
    if (!editingCell) return;

    const updatedGrid = roomGrid.map((day) => {
      if (day.date !== editingCell.date) return day;

      const exists = day.allocations.some((a) => a.roomCategory === editingCell.category);
      const updatedAllocations = exists
        ? day.allocations.map((alloc) =>
            alloc.roomCategory === editingCell.category
              ? { ...alloc, allocated: editingCell.allocated, rate: editingCell.rate }
              : alloc
          )
        : [
            ...day.allocations,
            {
              roomCategory: editingCell.category,
              allocated: editingCell.allocated,
              pickedUp: 0,
              rate: editingCell.rate,
            },
          ];

      return { ...day, allocations: updatedAllocations };
    });

    // Recompute total block allocated rooms (peak night)
    const maxNightlyAlloc = Math.max(
      ...updatedGrid.map((d) => d.allocations.reduce((sum, a) => sum + a.allocated, 0)),
      currentBlock.allocatedRooms
    );

    const updatedBlock: GroupBlock = {
      ...currentBlock,
      allocatedRooms: maxNightlyAlloc,
      roomGrid: updatedGrid,
    };

    onUpdateBlock(updatedBlock);
    setEditingCell(null);
  };

  // Add category to all days in the grid
  const handleAddCategoryToGrid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const updatedGrid = roomGrid.map((day) => {
      const alreadyHas = day.allocations.some((a) => a.roomCategory === newCatName);
      if (alreadyHas) return day;
      return {
        ...day,
        allocations: [
          ...day.allocations,
          {
            roomCategory: newCatName,
            allocated: newCatAlloc,
            pickedUp: 0,
            rate: newCatRate,
          },
        ],
      };
    });

    const updatedBlock: GroupBlock = {
      ...currentBlock,
      roomGrid: updatedGrid,
      allocatedRooms: currentBlock.allocatedRooms + newCatAlloc,
    };

    onUpdateBlock(updatedBlock);
    setAddCategoryModalOpen(false);
  };

  // Add Shoulder Date (1 day before start or 1 day after end)
  const handleAddShoulderDate = (direction: "PRE" | "POST") => {
    if (roomGrid.length === 0) return;

    if (direction === "PRE") {
      const firstDate = new Date(roomGrid[0].date);
      firstDate.setDate(firstDate.getDate() - 1);
      const newDateStr = firstDate.toISOString().split("T")[0];
      const dayName = firstDate.toLocaleDateString("en-US", { weekday: "short" });

      const newDay: GroupBlockDailyGrid = {
        date: newDateStr,
        dayName,
        allocations: uniqueCategories.map((cat) => ({
          roomCategory: cat,
          allocated: Math.round(currentBlock.allocatedRooms * 0.3), // default 30% shoulder allocation
          pickedUp: 0,
          rate: currentBlock.negotiatedRate,
        })),
      };

      const updatedBlock: GroupBlock = {
        ...currentBlock,
        startDate: newDateStr,
        roomGrid: [newDay, ...roomGrid],
      };
      onUpdateBlock(updatedBlock);
    } else {
      const lastDate = new Date(roomGrid[roomGrid.length - 1].date);
      lastDate.setDate(lastDate.getDate() + 1);
      const newDateStr = lastDate.toISOString().split("T")[0];
      const dayName = lastDate.toLocaleDateString("en-US", { weekday: "short" });

      const newDay: GroupBlockDailyGrid = {
        date: newDateStr,
        dayName,
        allocations: uniqueCategories.map((cat) => ({
          roomCategory: cat,
          allocated: Math.round(currentBlock.allocatedRooms * 0.3),
          pickedUp: 0,
          rate: currentBlock.negotiatedRate,
        })),
      };

      const updatedBlock: GroupBlock = {
        ...currentBlock,
        endDate: newDateStr,
        roomGrid: [...roomGrid, newDay],
      };
      onUpdateBlock(updatedBlock);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Action and Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Daily Room Inventory Commitment & Rate Matrix</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any cell to modify blocked inventory or daily negotiated rate. Use <span className="text-purple-300 font-semibold">+ Pick Up</span> to reserve delegates into that day.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAddShoulderDate("PRE")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Add 1 Pre-Conference Shoulder Date"
          >
            + Pre-Shoulder
          </button>
          <button
            onClick={() => handleAddShoulderDate("POST")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Add 1 Post-Conference Shoulder Date"
          >
            + Post-Shoulder
          </button>
          <button
            onClick={() => setAddCategoryModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Main 2D Matrix Grid */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                <th className="py-3 px-4 sticky left-0 bg-slate-950 z-10 w-48 border-r border-slate-800 font-semibold">
                  ROOM CATEGORY / METRIC
                </th>
                {roomGrid.map((day) => (
                  <th key={day.date} className="py-3 px-3 text-center min-w-[140px] border-r border-slate-800/60">
                    <div className="font-bold text-white text-xs">{day.dayName}</div>
                    <div className="text-[10px] text-purple-400">{day.date}</div>
                  </th>
                ))}
                <th className="py-3 px-4 text-center min-w-[120px] bg-purple-950/20 font-bold text-purple-300">
                  TOTAL ROOM NIGHTS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {uniqueCategories.map((category) => {
                let categoryTotalAlloc = 0;
                let categoryTotalPicked = 0;

                return (
                  <tr key={category} className="hover:bg-slate-800/30 transition-colors">
                    {/* Row Header: Room Category */}
                    <td className="py-3 px-4 sticky left-0 bg-slate-900 z-10 border-r border-slate-800 font-sans font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <BedDouble className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate max-w-[140px]" title={category}>
                          {category}
                        </span>
                      </div>
                    </td>

                    {/* Matrix Cells per Date */}
                    {roomGrid.map((day) => {
                      const alloc = day.allocations.find((a) => a.roomCategory === category) || {
                        roomCategory: category,
                        allocated: 0,
                        pickedUp: 0,
                        rate: currentBlock.negotiatedRate,
                      };

                      const dynamicPicked = getDynamicPickedUp(day.date, category, alloc.pickedUp);
                      const available = Math.max(0, alloc.allocated - dynamicPicked);
                      const isFull = available === 0 && alloc.allocated > 0;
                      categoryTotalAlloc += alloc.allocated;
                      categoryTotalPicked += dynamicPicked;

                      const isEditingThis =
                        editingCell &&
                        editingCell.date === day.date &&
                        editingCell.category === category;

                      return (
                        <td
                          key={day.date}
                          className="py-2.5 px-3 border-r border-slate-800/60 align-top"
                        >
                          {isEditingThis ? (
                            <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/60 space-y-1.5 shadow-lg">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Alloc:</span>
                                <input
                                  type="number"
                                  value={editingCell.allocated}
                                  onChange={(e) =>
                                    setEditingCell({
                                      ...editingCell,
                                      allocated: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-14 bg-slate-900 text-white font-mono px-1.5 py-0.5 rounded border border-slate-700 text-right text-xs"
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Rate $:</span>
                                <input
                                  type="number"
                                  value={editingCell.rate}
                                  onChange={(e) =>
                                    setEditingCell({
                                      ...editingCell,
                                      rate: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-14 bg-slate-900 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-slate-700 text-right text-xs"
                                />
                              </div>
                              <div className="flex items-center justify-end space-x-1 pt-1">
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={handleSaveCellEdit}
                                  className="p-1 rounded bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition group">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-slate-400 font-sans">Blocked:</span>
                                <span className="font-bold text-white font-mono">{alloc.allocated}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-slate-400 font-sans">Picked:</span>
                                <span className="font-bold text-purple-400 font-mono">
                                  {dynamicPicked}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
                                <span className={isFull ? "text-rose-400 font-bold" : "text-emerald-400"}>
                                  {isFull ? "CLOSED" : `${available} avail`}
                                </span>
                                <span className="text-slate-400">${alloc.rate}</span>
                              </div>

                              {/* Hover cell actions */}
                              <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between opacity-75 group-hover:opacity-100 transition">
                                <button
                                  onClick={() =>
                                    setEditingCell({
                                      date: day.date,
                                      category,
                                      allocated: alloc.allocated,
                                      rate: alloc.rate,
                                    })
                                  }
                                  className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-0.5 cursor-pointer"
                                  title="Edit Blocked & Rate"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                  <span>Edit</span>
                                </button>
                                {available > 0 && (
                                  <button
                                    onClick={() => onQuickPickupFromGrid(day.date, category, alloc.rate)}
                                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-0.5 cursor-pointer"
                                    title="Pick Up Delegate for this date"
                                  >
                                    <UserPlus className="w-2.5 h-2.5" />
                                    <span>Pick Up</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Row Summary Total */}
                    <td className="py-3 px-4 text-center bg-purple-950/10 font-bold">
                      <div className="text-white text-xs">
                        {categoryTotalPicked} <span className="text-slate-500 font-normal">/ {categoryTotalAlloc}</span>
                      </div>
                      <div className="text-[10px] text-purple-400 font-normal">
                        {categoryTotalAlloc > 0
                          ? Math.round((categoryTotalPicked / categoryTotalAlloc) * 100)
                          : 0}
                        % pickup
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* DAILY TOTALS & REVENUE FOOTER ROW */}
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-800 text-[11px]">
                <td className="py-3 px-4 sticky left-0 bg-slate-950 z-10 border-r border-slate-800 text-slate-300 font-sans">
                  DAILY TOTAL COMMITMENT
                </td>
                {roomGrid.map((day) => {
                  const dayTotalAlloc = day.allocations.reduce((sum, a) => sum + a.allocated, 0);
                  const dayTotalPicked = day.allocations.reduce(
                    (sum, a) => sum + getDynamicPickedUp(day.date, a.roomCategory, a.pickedUp),
                    0
                  );
                  const dayRevenue = day.allocations.reduce(
                    (sum, a) =>
                      sum +
                      getDynamicPickedUp(day.date, a.roomCategory, a.pickedUp) * a.rate,
                    0
                  );
                  const dayPct = dayTotalAlloc > 0 ? Math.round((dayTotalPicked / dayTotalAlloc) * 100) : 0;

                  return (
                    <td key={day.date} className="py-3 px-3 text-center border-r border-slate-800/60">
                      <div className="text-white text-xs">
                        {dayTotalPicked} <span className="text-slate-500 font-normal">/ {dayTotalAlloc}</span>
                      </div>
                      <div className="text-[10px] text-purple-400">{dayPct}% Picked</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        ${dayRevenue.toLocaleString()}
                      </div>
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-center bg-purple-950/30 text-purple-300 font-mono">
                  {roomGrid.reduce(
                    (sum, d) =>
                      sum +
                      d.allocations.reduce(
                        (sub, a) =>
                          sub + getDynamicPickedUp(d.date, a.roomCategory, a.pickedUp),
                        0
                      ),
                    0
                  )}{" "}
                  Total Nights
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Category Modal */}
      {addCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BedDouble className="w-4 h-4 text-purple-400" />
                <span>Add Room Category to Contract Grid</span>
              </h3>
              <button
                onClick={() => setAddCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategoryToGrid} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  Room Category
                </label>
                <select
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value as RoomCategory)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="Deluxe King">Deluxe King</option>
                  <option value="Executive Ocean Suite">Executive Ocean Suite</option>
                  <option value="Panoramic Sky Suite">Panoramic Sky Suite</option>
                  <option value="Presidential Penthouse">Presidential Penthouse</option>
                  <option value="Overwater Coral Villa">Overwater Coral Villa</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Nightly Allocation
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCatAlloc}
                    onChange={(e) => setNewCatAlloc(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Negotiated Rate ($)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={newCatRate}
                    onChange={(e) => setNewCatRate(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 text-emerald-400 font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  This category will be added to all {roomGrid.length} nights in the group block at the agreed negotiated rate.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  Add to Room Grid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
