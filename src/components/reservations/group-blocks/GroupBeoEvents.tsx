import React, { useState } from "react";
import {
  Utensils,
  Plus,
  Calendar,
  Users,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  X,
  Building2,
  Receipt,
  Sparkles,
} from "lucide-react";
import {
  GroupBlock,
  BanquetFunctionSpace,
  GroupMasterTransaction,
} from "../../../types";

interface GroupBeoEventsProps {
  currentBlock: GroupBlock;
  onUpdateBlock: (updated: GroupBlock) => void;
  onShowToast?: (msg: string) => void;
}

export const GroupBeoEvents: React.FC<GroupBeoEventsProps> = ({
  currentBlock,
  onUpdateBlock,
  onShowToast,
}) => {
  const [newSpaceModalOpen, setNewSpaceModalOpen] = useState(false);
  const [selectedBeoForSpec, setSelectedBeoForSpec] = useState<BanquetFunctionSpace | null>(null);

  // Form states
  const [spaceName, setSpaceName] = useState("Grand Marina Ballroom C");
  const [eventDate, setEventDate] = useState(currentBlock.startDate);
  const [timeSlot, setTimeSlot] = useState("09:00 AM - 05:00 PM");
  const [setupStyle, setSetupStyle] = useState<BanquetFunctionSpace["setupStyle"]>("THEATER");
  const [attendees, setAttendees] = useState(150);
  const [rentalFee, setRentalFee] = useState(8500);
  const [cateringPlan, setCateringPlan] = useState("Plenary Coffee Breaks & International Buffet");

  const functionSpaces: BanquetFunctionSpace[] = currentBlock.functionSpaces || [];

  // Add new BEO Space
  const handleAddSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName.trim()) return;

    const newSpace: BanquetFunctionSpace = {
      id: `fn-${Date.now()}`,
      name: spaceName,
      date: eventDate,
      timeSlot,
      setupStyle,
      attendees,
      rentalFee,
      cateringPlan,
      status: "CONFIRMED",
    };

    const updatedSpaces = [...functionSpaces, newSpace];

    onUpdateBlock({
      ...currentBlock,
      functionSpaces: updatedSpaces,
    });

    setNewSpaceModalOpen(false);
    if (onShowToast) {
      onShowToast(`✓ BEO Space "${spaceName}" added to contract schedule.`);
    }
  };

  // Post BEO to Master Folio
  const handlePostBeoToMaster = (space: BanquetFunctionSpace) => {
    const txRental: GroupMasterTransaction = {
      id: `tx-beo-rent-${Date.now()}`,
      date: space.date,
      category: "MEETING_ROOM_RENTAL",
      description: `BEO Room Rental: ${space.name} (${space.timeSlot}, ${space.attendees} Pax - ${space.setupStyle})`,
      referenceNo: `BEO-${space.id.slice(-4).toUpperCase()}`,
      amount: space.rentalFee,
      postedBy: "Sales & Catering Events Team",
    };

    const updatedTxs = [...(currentBlock.masterTransactions || []), txRental];
    const newBal = (currentBlock.masterBalance || 0) + space.rentalFee;

    onUpdateBlock({
      ...currentBlock,
      masterTransactions: updatedTxs,
      masterBalance: newBal,
    });

    if (onShowToast) {
      onShowToast(`✓ BEO Rental $${space.rentalFee.toLocaleString()} posted to Master Folio.`);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Utensils className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Banquet Event Orders (BEO) & Function Space Bookings</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            S&C event spaces, seating setups, headcount and food & beverage specifications
          </p>
        </div>

        <button
          onClick={() => setNewSpaceModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Function Space</span>
        </button>
      </div>

      {/* Function Space Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {functionSpaces.map((space) => (
          <div
            key={space.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-bold text-white">{space.name}</h5>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{space.date}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{space.timeSlot}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {space.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Setup & Headcount:</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-bold text-white font-mono">{space.attendees} Pax</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {space.setupStyle}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Space Rental Fee:</span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      ${space.rentalFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {space.cateringPlan && (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                  <span className="text-slate-400 block text-[10px] font-mono">F&B CATERING PACKAGE:</span>
                  <span className="text-slate-200 mt-0.5 block">{space.cateringPlan}</span>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setSelectedBeoForSpec(space)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View BEO Spec Sheet</span>
              </button>

              <button
                onClick={() => handlePostBeoToMaster(space)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                title="Post Rental Fee to Master Folio"
              >
                <Receipt className="w-3 h-3 text-purple-400" />
                <span>Post to Folio</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD FUNCTION SPACE MODAL */}
      {newSpaceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-purple-400" />
                <span>Add BEO Function Space Booking</span>
              </h3>
              <button
                onClick={() => setNewSpaceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSpace} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  Function Space / Room *
                </label>
                <input
                  type="text"
                  required
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Setup Style
                  </label>
                  <select
                    value={setupStyle}
                    onChange={(e) => setSetupStyle(e.target.value as any)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  >
                    <option value="THEATER">Theater</option>
                    <option value="CLASSROOM">Classroom</option>
                    <option value="BANQUET_ROUNDS">Banquet Rounds</option>
                    <option value="BOARDROOM">Boardroom</option>
                    <option value="U_SHAPE">U-Shape</option>
                    <option value="RECEPTION">Cocktail Reception</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Guaranteed Attendees
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={attendees}
                    onChange={(e) => setAttendees(parseInt(e.target.value) || 5)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Room Rental Fee ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rentalFee}
                    onChange={(e) => setRentalFee(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-emerald-400 font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Catering Package
                  </label>
                  <input
                    type="text"
                    value={cateringPlan}
                    onChange={(e) => setCateringPlan(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewSpaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Save BEO Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BEO SPEC SHEET MODAL */}
      {selectedBeoForSpec && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Banquet Event Order Spec Sheet
                </h3>
                <p className="text-[11px] text-purple-400">
                  {selectedBeoForSpec.name} ({selectedBeoForSpec.date})
                </p>
              </div>
              <button
                onClick={() => setSelectedBeoForSpec(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Client / Contract:</span>
                <span className="text-white">{currentBlock.groupName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Horizon:</span>
                <span className="text-white">{selectedBeoForSpec.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seating / Setup:</span>
                <span className="text-white">{selectedBeoForSpec.setupStyle} ({selectedBeoForSpec.attendees} Pax)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Catering Specification:</span>
                <span className="text-purple-300">{selectedBeoForSpec.cateringPlan}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                <span className="text-slate-400">Space Rental Charge:</span>
                <span className="text-emerald-400">${selectedBeoForSpec.rentalFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedBeoForSpec(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Close Spec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
