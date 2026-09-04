import React, { useState } from "react";
import {
  GroupBlock,
  GroupDelegate,
  Reservation,
  Room,
  RoomCategory,
  GroupBlockDailyGrid,
} from "../../types";
import { GroupBlockHeader } from "./group-blocks/GroupBlockHeader";
import { GroupDailyRoomGrid } from "./group-blocks/GroupDailyRoomGrid";
import { GroupRoomingList } from "./group-blocks/GroupRoomingList";
import { GroupAttritionWash } from "./group-blocks/GroupAttritionWash";
import { GroupMasterFolio } from "./group-blocks/GroupMasterFolio";
import { GroupBeoEvents } from "./group-blocks/GroupBeoEvents";
import { Building2, X, Plus, Calendar, DollarSign, BedDouble, Info, ChevronRight } from "lucide-react";

export interface GroupBlocksManagerProps {
  groupBlocks: GroupBlock[];
  rooms: Room[];
  reservations?: Reservation[];
  onNewGroupBlock?: (block: GroupBlock) => void;
  onUpdateGroupBlock?: (updated: GroupBlock) => void;
  onPickupDelegate?: (blockId: string, delegate: GroupDelegate, reservation: Reservation) => void;
  onBatchPickupDelegates?: (blockId: string, delegates: GroupDelegate[], reservations: Reservation[]) => void;
  onCancelDelegate?: (blockId: string, delegateId: string, reservationId: string) => void;
  onCheckInDelegate?: (blockId: string, delegateId: string, reservationId: string) => void;
  onSwitchToAllotments?: () => void;
  onShowToast?: (msg: string) => void;
}

export const GroupBlocksManager: React.FC<GroupBlocksManagerProps> = ({
  groupBlocks,
  rooms,
  reservations = [],
  onNewGroupBlock,
  onUpdateGroupBlock,
  onPickupDelegate,
  onBatchPickupDelegates,
  onCancelDelegate,
  onCheckInDelegate,
  onSwitchToAllotments,
  onShowToast,
}) => {
  // Selected Block ID
  const [selectedBlockId, setSelectedBlockId] = useState<string>(
    groupBlocks[0]?.id || ""
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "room-grid" | "rooming-list" | "attrition-wash" | "master-folio" | "beo-events"
  >("room-grid");

  // State for quick pickup triggered from Grid
  const [quickPickupPrefill, setQuickPickupPrefill] = useState<{
    date: string;
    roomCategory: RoomCategory;
    rate: number;
  } | null>(null);

  // New Contract Modal
  const [newBlockModalOpen, setNewBlockModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newBlockCode, setNewBlockCode] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("+1 415 555 0100");
  const [newCategory, setNewCategory] = useState<RoomCategory>("Executive Ocean Suite");
  const [newRooms, setNewRooms] = useState(30);
  const [newRate, setNewRate] = useState(550);
  const [newStart, setNewStart] = useState("2026-10-15");
  const [newEnd, setNewEnd] = useState("2026-10-19");
  const [newCutOff, setNewCutOff] = useState("2026-10-01");
  const [newAttritionPct, setNewAttritionPct] = useState(80);
  const [newRateCode, setNewRateCode] = useState("GRP_CONF26");
  const [newDeposit, setNewDeposit] = useState(30000);

  // Find currently active block
  const currentBlock =
    groupBlocks.find((b) => b.id === selectedBlockId) || groupBlocks[0];

  if (!currentBlock) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
        No group blocks found.
      </div>
    );
  }

  // Handle Lifecycle advance
  const handleAdvanceStatus = (nextStatus: GroupBlock["status"]) => {
    if (!onUpdateGroupBlock) return;

    const isDeduct = nextStatus === "DEFINITE";
    const updated: GroupBlock = {
      ...currentBlock,
      status: nextStatus,
      inventoryStatus: isDeduct ? "DEDUCT" : currentBlock.inventoryStatus,
    };

    onUpdateGroupBlock(updated);

    if (onShowToast) {
      onShowToast(`✓ Block ${currentBlock.blockCode} advanced to status ${nextStatus}`);
    }
  };

  // Handle Quick Pickup from Daily Grid
  const handleQuickPickupFromGrid = (date: string, roomCategory: RoomCategory, rate: number) => {
    setQuickPickupPrefill({ date, roomCategory, rate });
    setActiveTab("rooming-list");
  };

  // Create New Contract Submit
  const handleCreateBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newBlockCode.trim()) return;

    // Build default daily room grid
    const startDate = new Date(newStart);
    const endDate = new Date(newEnd);
    const grid: GroupBlockDailyGrid[] = [];

    const cur = new Date(startDate);
    while (cur < endDate) {
      const dateStr = cur.toISOString().split("T")[0];
      const dayName = cur.toLocaleDateString("en-US", { weekday: "short" });
      grid.push({
        date: dateStr,
        dayName,
        allocations: [
          {
            roomCategory: newCategory,
            allocated: newRooms,
            pickedUp: 0,
            rate: newRate,
          },
        ],
      });
      cur.setDate(cur.getDate() + 1);
    }

    const newBlockId = `blk-${Date.now()}`;
    const folioNo = `FOLIO-${Math.floor(1000 + Math.random() * 9000)}-MASTER`;

    const newBlock: GroupBlock = {
      id: newBlockId,
      groupName: newGroupName,
      blockCode: newBlockCode.toUpperCase(),
      contactPerson: newContact,
      contactEmail: newEmail,
      contactPhone: newPhone,
      companyAccount: newCompany || newGroupName,
      marketSegment: "MICE",
      startDate: newStart,
      endDate: newEnd,
      roomCategory: newCategory,
      negotiatedRate: newRate,
      allocatedRooms: newRooms,
      pickedUpRooms: 0,
      cutOffDate: newCutOff,
      status: "DEFINITE",
      billingMethod: "MASTER_FOLIO",
      depositPaid: newDeposit,
      masterFolioNo: folioNo,
      masterCreditLimit: 150000,
      masterBalance: -newDeposit,
      notes: "Contract created with automated inventory deduct & master folio billing.",
      attritionThresholdPercent: newAttritionPct,
      inventoryStatus: "DEDUCT",
      rateCode: newRateCode,
      shoulderDaysBefore: 2,
      shoulderDaysAfter: 2,
      roomGrid: grid,
      delegates: [],
      masterTransactions: [
        {
          id: `tx-dep-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          category: "DEPOSIT",
          description: "Initial Contract Guarantee Holding Deposit",
          referenceNo: `DEP-${newBlockCode.toUpperCase()}`,
          amount: -newDeposit,
          postedBy: "Corporate A/R Finance",
        },
      ],
      functionSpaces: [],
      washHistory: [],
    };

    if (onNewGroupBlock) {
      onNewGroupBlock(newBlock);
    }
    setSelectedBlockId(newBlockId);
    setNewBlockModalOpen(false);

    // Reset Form
    setNewGroupName("");
    setNewBlockCode("");
    setNewCompany("");
    setNewContact("");
    setNewEmail("");

    if (onShowToast) {
      onShowToast(`✓ Group Block ${newBlock.blockCode} contracted & DEDUCT inventory committed.`);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Differentiation & Quick Jump to Allotments */}
      {onSwitchToAllotments && (
        <div className="p-3 px-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 text-slate-300">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 text-[10px] uppercase font-mono">
              Expert Logic Notice
            </span>
            <span>
              Looking for <strong>Tour Operator (TUI, DER)</strong>, <strong>Wholesaler Bedbanks</strong>, or <strong>Airline Crew</strong> standing room quotas?
            </span>
          </div>
          <button
            onClick={onSwitchToAllotments}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition-colors flex items-center space-x-1 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Go to Allotments & Series</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Master Header & Summary KPIs */}
      <GroupBlockHeader
        groupBlocks={groupBlocks}
        selectedBlockId={currentBlock.id}
        onSelectBlockId={(id) => {
          setSelectedBlockId(id);
          setQuickPickupPrefill(null);
        }}
        onNewBlockClick={() => setNewBlockModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentBlock={currentBlock}
        onAdvanceStatus={handleAdvanceStatus}
      />

      {/* 2. Sub-Tab Active View */}
      {activeTab === "room-grid" && (
        <GroupDailyRoomGrid
          currentBlock={currentBlock}
          onUpdateBlock={(upd) => onUpdateGroupBlock && onUpdateGroupBlock(upd)}
          onQuickPickupFromGrid={handleQuickPickupFromGrid}
        />
      )}

      {activeTab === "rooming-list" && (
        <GroupRoomingList
          currentBlock={currentBlock}
          rooms={rooms}
          reservations={reservations}
          onPickupDelegate={(blockId, del, res) =>
            onPickupDelegate && onPickupDelegate(blockId, del, res)
          }
          onBatchPickupDelegates={(blockId, dels, resList) =>
            onBatchPickupDelegates && onBatchPickupDelegates(blockId, dels, resList)
          }
          onCancelDelegate={(blockId, delId, resId) =>
            onCancelDelegate && onCancelDelegate(blockId, delId, resId)
          }
          onCheckInDelegate={(blockId, delId, resId) =>
            onCheckInDelegate && onCheckInDelegate(blockId, delId, resId)
          }
          quickPickupPrefill={quickPickupPrefill}
          onClearQuickPickupPrefill={() => setQuickPickupPrefill(null)}
        />
      )}

      {activeTab === "attrition-wash" && (
        <GroupAttritionWash
          currentBlock={currentBlock}
          onUpdateBlock={(upd) => onUpdateGroupBlock && onUpdateGroupBlock(upd)}
          onShowToast={onShowToast}
        />
      )}

      {activeTab === "master-folio" && (
        <GroupMasterFolio
          currentBlock={currentBlock}
          onUpdateBlock={(upd) => onUpdateGroupBlock && onUpdateGroupBlock(upd)}
          onShowToast={onShowToast}
        />
      )}

      {activeTab === "beo-events" && (
        <GroupBeoEvents
          currentBlock={currentBlock}
          onUpdateBlock={(upd) => onUpdateGroupBlock && onUpdateGroupBlock(upd)}
          onShowToast={onShowToast}
        />
      )}

      {/* NEW CONTRACT BLOCK MODAL */}
      {newBlockModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>Contract New Group Block (OPERA S&C)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Initializes contract dates, daily room commitment matrix, and A/R master folio
                </p>
              </div>
              <button
                onClick={() => setNewBlockModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlockSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Group / Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. World FinTech Congress 2026"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Block Code (Alphanumeric) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FINTECH26"
                    value={newBlockCode}
                    onChange={(e) => setNewBlockCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 text-purple-400 font-mono font-bold rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Company / Corporate A/R Account
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Global FinTech Alliance LLC"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Primary Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. sarah@fintechcongress.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Rate Plan Code
                  </label>
                  <input
                    type="text"
                    value={newRateCode}
                    onChange={(e) => setNewRateCode(e.target.value)}
                    className="w-full bg-slate-950 text-purple-400 font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-2.5 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-2.5 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Cut-Off Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newCutOff}
                    onChange={(e) => setNewCutOff(e.target.value)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-2.5 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Room Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RoomCategory)}
                    className="w-full bg-slate-950 text-white rounded-lg px-2.5 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Executive Ocean Suite">Executive Ocean Suite</option>
                    <option value="Deluxe King">Deluxe King</option>
                    <option value="Panoramic Sky Suite">Panoramic Sky Suite</option>
                    <option value="Presidential Penthouse">Presidential Penthouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Nightly Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRooms}
                    onChange={(e) => setNewRooms(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-2.5 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Rate ($/nt)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={newRate}
                    onChange={(e) => setNewRate(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 text-emerald-400 font-mono rounded-lg px-2.5 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Attrition Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newAttritionPct}
                    onChange={(e) => setNewAttritionPct(parseInt(e.target.value) || 80)}
                    className="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Advance Deposit ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-emerald-400 font-mono rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  Contract & Commit Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
