import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Plus,
  Play,
  RotateCcw,
  Package,
  Search,
  Sliders,
  Check,
  X,
  Layers,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
  CalendarCheck,
  Moon,
  Sun,
  Coffee,
  CheckSquare,
  Square,
  AlertTriangle,
  FileSpreadsheet,
  UserCheck,
  Wrench,
  BedDouble,
  Sparkle,
} from "lucide-react";
import { HousekeepingTask, HousekeepingPriority } from "../../types";

interface DailyStaffAssignment {
  id: string;
  attendantId: string;
  attendantName: string;
  section: string;
  shift: "MORNING" | "AFTERNOON" | "EVENING_TURNDOWN";
  targetCredits: number;
  completedCredits: number;
  status: "ACTIVE" | "ON_BREAK" | "COMPLETED";
  tasks: DailyTaskItem[];
}

interface DailyTaskItem {
  id: string;
  roomOrArea: string;
  taskType: "DAILY_STAYOVER" | "DEPARTURE_CLEAN" | "TURNDOWN_VIP" | "PUBLIC_AREA" | "DEEP_CLEAN_CYCLE";
  guestName?: string;
  vipTier?: string;
  creditValue: number;
  timeSlot: string;
  status: "PENDING" | "IN_SERVICE" | "COMPLETED" | "DND_SKIPPED" | "REFUSED";
  notes?: string;
  checklist: { item: string; done: boolean }[];
}

interface HousekeepingViewProps {
  tasks: HousekeepingTask[];
  onUpdateTaskStatus: (taskId: string, status: "PENDING" | "IN_PROGRESS" | "INSPECTED" | "COMPLETED") => void;
  onAutoDispatch: () => void;
  onAddTask?: (task: HousekeepingTask) => void;
}

export const HousekeepingView: React.FC<HousekeepingViewProps> = ({
  tasks,
  onUpdateTaskStatus,
  onAutoDispatch,
  onAddTask,
}) => {
  const [activeTab, setActiveTab] = useState<"KANBAN" | "DAILY_ASSIGNMENTS" | "LINEN_SUPPLY" | "ATTENDANTS">("DAILY_ASSIGNMENTS");
  const [filterFloor, setFilterFloor] = useState<string>("ALL");
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState<boolean>(false);
  const [newDailyTaskModalOpen, setNewDailyTaskModalOpen] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<"ALL" | "MORNING" | "AFTERNOON" | "EVENING_TURNDOWN">("ALL");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("ALL");
  const [expandedTaskCard, setExpandedTaskCard] = useState<string | null>(null);

  // New turn form state
  const [newRoomNum, setNewRoomNum] = useState<string>("804");
  const [newAttendant, setNewAttendant] = useState<string>("Amina K.");
  const [newPriority, setNewPriority] = useState<HousekeepingPriority>("HIGH");
  const [newTurnType, setNewTurnType] = useState<"DEPARTURE_FULL" | "STAYOVER_TIDY" | "TURNDOWN_VIP" | "DEEP_CLEAN">("DEPARTURE_FULL");

  // New Daily Assignment form state
  const [assignStaff, setAssignStaff] = useState<string>("Amina K.");
  const [assignRoom, setAssignRoom] = useState<string>("802");
  const [assignTaskType, setAssignTaskType] = useState<"DAILY_STAYOVER" | "DEPARTURE_CLEAN" | "TURNDOWN_VIP" | "PUBLIC_AREA" | "DEEP_CLEAN_CYCLE">("DAILY_STAYOVER");
  const [assignTimeSlot, setAssignTimeSlot] = useState<string>("10:30 AM");
  const [assignCredits, setAssignCredits] = useState<number>(1.0);
  const [assignNotes, setAssignNotes] = useState<string>("Guest requested extra fresh hypoallergenic pillows");

  // Daily Staff Assignment Boards State
  const [dailyAssignments, setDailyAssignments] = useState<DailyStaffAssignment[]>([
    {
      id: "da-1",
      attendantId: "att-1",
      attendantName: "Amina K.",
      section: "Floor 8 (Royal Penthouse & VIP Sky Suites)",
      shift: "MORNING",
      targetCredits: 14,
      completedCredits: 10.5,
      status: "ACTIVE",
      tasks: [
        {
          id: "dt-101",
          roomOrArea: "Room 801 (Presidential Penthouse)",
          taskType: "DAILY_STAYOVER",
          guestName: "Sheikh Al-Maktoum",
          vipTier: "Royal VIP",
          creditValue: 2.5,
          timeSlot: "08:30 AM",
          status: "COMPLETED",
          notes: "Daily fresh Egyptian cotton linen replacement and silk pillow refresh.",
          checklist: [
            { item: "Strip and replace 600-thread Egyptian King linen", done: true },
            { item: "Disinfect jacuzzi bath and restock Bvlgari amenities", done: true },
            { item: "Replenish sparkling mineral water & espresso pods", done: true },
            { item: "Vacuum master bedroom & wipe balcony glass", done: true },
          ],
        },
        {
          id: "dt-102",
          roomOrArea: "Room 802 (Panoramic Sky Suite)",
          taskType: "DEPARTURE_CLEAN",
          guestName: "Lady Genevieve Vance",
          vipTier: "Diamond",
          creditValue: 2.0,
          timeSlot: "11:00 AM",
          status: "IN_SERVICE",
          notes: "Checkout clean. Next VIP guest arrives 15:00. Prioritize turn.",
          checklist: [
            { item: "Full departure turnover sanitization protocol", done: true },
            { item: "Minibar consumption inventory scan", done: true },
            { item: "Clean air filter and check smart lock battery", done: false },
            { item: "Final supervisor white-glove inspection", done: false },
          ],
        },
        {
          id: "dt-103",
          roomOrArea: "Room 803 (Executive Ocean Suite)",
          taskType: "DAILY_STAYOVER",
          guestName: "Marcus Sterling",
          vipTier: "Gold",
          creditValue: 1.5,
          timeSlot: "01:30 PM",
          status: "PENDING",
          notes: "Guest requested service after 13:00. Do not disturb before then.",
          checklist: [
            { item: "Daily bed making and linen straighten", done: false },
            { item: "Bathroom polish and fresh plush towels", done: false },
            { item: "Trash disposal and glass sanitizing", done: false },
          ],
        },
        {
          id: "dt-104",
          roomOrArea: "Floor 8 Executive Lounge & Lift Foyer",
          taskType: "PUBLIC_AREA",
          creditValue: 1.0,
          timeSlot: "03:00 PM",
          status: "PENDING",
          notes: "Afternoon floor refresh and flower water change.",
          checklist: [
            { item: "Mop marble elevator foyer", done: false },
            { item: "Wipe handrails and touchscreens", done: false },
            { item: "Replenish lounge fresh towels & sanitizers", done: false },
          ],
        },
      ],
    },
    {
      id: "da-2",
      attendantId: "att-2",
      attendantName: "Fatima Z.",
      section: "Floor 5 (Deluxe King & Ocean Wing)",
      shift: "MORNING",
      targetCredits: 14,
      completedCredits: 9.0,
      status: "ACTIVE",
      tasks: [
        {
          id: "dt-201",
          roomOrArea: "Room 501 (Deluxe King)",
          taskType: "DAILY_STAYOVER",
          guestName: "Elena Rostova",
          vipTier: "Silver",
          creditValue: 1.0,
          timeSlot: "09:00 AM",
          status: "COMPLETED",
          notes: "Regular stayover service. Guest left for conference at 08:30.",
          checklist: [
            { item: "Bed remake with crisp hospital corners", done: true },
            { item: "Bath vanity refresh & towel change", done: true },
            { item: "Vacuum bedroom and dust credenza", done: true },
          ],
        },
        {
          id: "dt-202",
          roomOrArea: "Room 502 (Executive Ocean Suite)",
          taskType: "DEPARTURE_CLEAN",
          guestName: "Harrison Ford (Corporate)",
          vipTier: "None",
          creditValue: 1.5,
          timeSlot: "10:30 AM",
          status: "COMPLETED",
          notes: "Early departure. Room released for early check-in.",
          checklist: [
            { item: "Full departure linen strip & remake", done: true },
            { item: "Deep clean shower stall & chrome polish", done: true },
            { item: "Restock vanity essentials & tea box", done: true },
          ],
        },
        {
          id: "dt-203",
          roomOrArea: "Room 504 (Deluxe King)",
          taskType: "DAILY_STAYOVER",
          guestName: "Sophie Martin",
          vipTier: "None",
          creditValue: 1.0,
          timeSlot: "12:15 PM",
          status: "DND_SKIPPED",
          notes: "DND light illuminated at 12:15. Left calling card. Scheduled retry 15:30.",
          checklist: [
            { item: "Verify DND indicator on IoT lock", done: true },
            { item: "Slip Housekeeping Calling Card under door", done: true },
            { item: "Queue retry task for afternoon cycle", done: true },
          ],
        },
        {
          id: "dt-204",
          roomOrArea: "Room 508 (Deluxe King)",
          taskType: "DAILY_STAYOVER",
          guestName: "Kenji Takahashi",
          vipTier: "Gold",
          creditValue: 1.0,
          timeSlot: "01:45 PM",
          status: "IN_SERVICE",
          notes: "Guest requested feather-free synthetic pillows.",
          checklist: [
            { item: "Remake bed with hypoallergenic pillows", done: true },
            { item: "Sanitize bathroom and replace bathmat", done: false },
            { item: "Restock Japanese green tea packets", done: false },
          ],
        },
      ],
    },
    {
      id: "da-3",
      attendantId: "att-3",
      attendantName: "Carlos M.",
      section: "Floor 4 (Stayover Refresh & Deep Clean)",
      shift: "AFTERNOON",
      targetCredits: 14,
      completedCredits: 6.0,
      status: "ACTIVE",
      tasks: [
        {
          id: "dt-301",
          roomOrArea: "Room 402 (Deluxe King)",
          taskType: "DEEP_CLEAN_CYCLE",
          creditValue: 2.5,
          timeSlot: "01:00 PM",
          status: "COMPLETED",
          notes: "Scheduled weekly mattress rotation, drape steaming, and vent disinfection.",
          checklist: [
            { item: "Rotate & flip king pillowtop mattress", done: true },
            { item: "Steam blackout drapes & sheer curtains", done: true },
            { item: "Disinfect HVAC vent grilles & filter", done: true },
          ],
        },
        {
          id: "dt-302",
          roomOrArea: "Room 405 (Deluxe King)",
          taskType: "DAILY_STAYOVER",
          guestName: "Alexander Wright",
          vipTier: "Silver",
          creditValue: 1.0,
          timeSlot: "02:30 PM",
          status: "IN_SERVICE",
          notes: "Daily refresh.",
          checklist: [
            { item: "Bed tidy and towel replacement", done: true },
            { item: "Vanity clean & trash empty", done: false },
          ],
        },
        {
          id: "dt-303",
          roomOrArea: "Floor 4 Service Pantry & Linen Depot",
          taskType: "PUBLIC_AREA",
          creditValue: 1.0,
          timeSlot: "04:00 PM",
          status: "PENDING",
          notes: "Restock clean linen carts and inventory count.",
          checklist: [
            { item: "Sort laundered sheets by size", done: false },
            { item: "Restock chemical spray bottles", done: false },
          ],
        },
      ],
    },
    {
      id: "da-4",
      attendantId: "att-4",
      attendantName: "David O.",
      section: "VIP Evening Turndown & Touch-up Squad",
      shift: "EVENING_TURNDOWN",
      targetCredits: 10,
      completedCredits: 3.5,
      status: "ACTIVE",
      tasks: [
        {
          id: "dt-401",
          roomOrArea: "Room 801 (Presidential Penthouse)",
          taskType: "TURNDOWN_VIP",
          guestName: "Sheikh Al-Maktoum",
          vipTier: "Royal VIP",
          creditValue: 1.5,
          timeSlot: "06:30 PM",
          status: "COMPLETED",
          notes: "VIP Evening Turndown with Valrhona chocolates and ambient lighting mood preset.",
          checklist: [
            { item: "Turn down duvet corner at 45-degree angle", done: true },
            { item: "Place Valrhona artisan chocolates on bedside table", done: true },
            { item: "Stage plush slippers and bathrobes by bedside", done: true },
            { item: "Set Lutron lighting to 'Evening Relaxation' (2200K warm)", done: true },
            { item: "Fill bedside ice bucket & fresh Evian glass bottles", done: true },
          ],
        },
        {
          id: "dt-402",
          roomOrArea: "Room 802 (Panoramic Sky Suite)",
          taskType: "TURNDOWN_VIP",
          guestName: "Lady Genevieve Vance",
          vipTier: "Diamond",
          creditValue: 1.0,
          timeSlot: "07:15 PM",
          status: "PENDING",
          notes: "Evening turndown with lavender pillow mist.",
          checklist: [
            { item: "Turn down bed & place bedside water and chocolate", done: false },
            { item: "Close sheer and blackout drapes", done: false },
            { item: "Tidy bathroom vanity and replenish evening towels", done: false },
          ],
        },
        {
          id: "dt-403",
          roomOrArea: "Room 502 (Executive Ocean Suite)",
          taskType: "TURNDOWN_VIP",
          guestName: "Kenji Takahashi",
          vipTier: "Gold",
          creditValue: 1.0,
          timeSlot: "08:00 PM",
          status: "PENDING",
          notes: "Evening refresh.",
          checklist: [
            { item: "Turn down bed & set ambient lighting", done: false },
            { item: "Empty trash & refresh ice bucket", done: false },
          ],
        },
      ],
    },
  ]);

  // Linen supplies state
  const [linenStock, setLinenStock] = useState([
    { id: "l-1", name: "600-Thread Egyptian Cotton King Sheets", par: 400, onHand: 342, inLaundry: 58, unit: "Sets" },
    { id: "l-2", name: "Bvlgari Au Thé Blanc Luxury Bath Amenities", par: 800, onHand: 710, inLaundry: 0, unit: "Bottles" },
    { id: "l-3", name: "Turkish Hydro-Cotton Bath Towels", par: 650, onHand: 512, inLaundry: 138, unit: "Pcs" },
    { id: "l-4", name: "Monogrammed Velvet Plush Bathrobes", par: 250, onHand: 215, inLaundry: 35, unit: "Pcs" },
  ]);

  const handleAiDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      onAutoDispatch();
      setIsDispatching(false);
    }, 600);
  };

  const handleAutoBalanceDailySections = () => {
    setIsDispatching(true);
    setTimeout(() => {
      // Simulate auto-balancing credits
      setDailyAssignments((prev) =>
        prev.map((board) => ({
          ...board,
          targetCredits: 14,
        }))
      );
      setIsDispatching(false);
    }, 700);
  };

  const handleReplenishLinen = (id: string) => {
    setLinenStock((prev) =>
      prev.map((item) => (item.id === id ? { ...item, onHand: item.par } : item))
    );
  };

  const handleCreateNewTask = () => {
    const newTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      roomNumber: newRoomNum,
      priority: newPriority,
      status: "PENDING",
      type: newTurnType,
      assignedAttendant: newAttendant,
      estimatedMinutes: newTurnType === "DEEP_CLEAN" ? 45 : 30,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (onAddTask) {
      onAddTask(newTask);
    }
    setNewTaskModalOpen(false);
  };

  const handleCreateDailyAssignment = () => {
    const newItem: DailyTaskItem = {
      id: `dt-${Date.now()}`,
      roomOrArea: `Room ${assignRoom}`,
      taskType: assignTaskType,
      creditValue: assignCredits,
      timeSlot: assignTimeSlot,
      status: "PENDING",
      notes: assignNotes,
      checklist: [
        { item: "Perform standard sanitization SOP", done: false },
        { item: "Replenish fresh towels & amenities", done: false },
        { item: "Verify HVAC and lighting presets", done: false },
      ],
    };

    setDailyAssignments((prev) =>
      prev.map((board) =>
        board.attendantName === assignStaff
          ? {
              ...board,
              targetCredits: board.targetCredits + assignCredits,
              tasks: [...board.tasks, newItem],
            }
          : board
      )
    );

    setNewDailyTaskModalOpen(false);
    setAssignNotes("");
  };

  const handleToggleTaskStatus = (boardId: string, taskId: string, newStatus: DailyTaskItem["status"]) => {
    setDailyAssignments((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board;

        let completedInc = 0;
        const updatedTasks = board.tasks.map((t) => {
          if (t.id === taskId) {
            if (newStatus === "COMPLETED" && t.status !== "COMPLETED") {
              completedInc += t.creditValue;
            } else if (t.status === "COMPLETED" && newStatus !== "COMPLETED") {
              completedInc -= t.creditValue;
            }
            return { ...t, status: newStatus };
          }
          return t;
        });

        return {
          ...board,
          completedCredits: Math.max(0, board.completedCredits + completedInc),
          tasks: updatedTasks,
        };
      })
    );
  };

  const handleToggleChecklistItem = (boardId: string, taskId: string, checkIndex: number) => {
    setDailyAssignments((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          tasks: board.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updatedChecklist = t.checklist.map((c, idx) =>
              idx === checkIndex ? { ...c, done: !c.done } : c
            );
            // If all checklist items are done, mark task completed
            const allDone = updatedChecklist.every((c) => c.done);
            return {
              ...t,
              checklist: updatedChecklist,
              status: allDone ? "COMPLETED" : t.status === "COMPLETED" ? "IN_SERVICE" : t.status,
            };
          }),
        };
      })
    );
  };

  const columns: { id: "PENDING" | "IN_PROGRESS" | "INSPECTED" | "COMPLETED"; title: string; color: string }[] = [
    { id: "PENDING", title: "Pending Turn / Queue", color: "border-slate-700 text-slate-300" },
    { id: "IN_PROGRESS", title: "In Progress", color: "border-amber-500/40 text-amber-300" },
    { id: "INSPECTED", title: "Supervisor Inspected", color: "border-purple-500/40 text-purple-300" },
    { id: "COMPLETED", title: "Ready for Check-In", color: "border-emerald-500/40 text-emerald-300" },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (filterFloor === "ALL") return true;
    return t.roomNumber.startsWith(filterFloor);
  });

  // Calculate high-level daily assignment totals
  const allDailyTasks = dailyAssignments.flatMap((b) => b.tasks);
  const totalDailyStayovers = allDailyTasks.filter((t) => t.taskType === "DAILY_STAYOVER").length;
  const totalDepartures = allDailyTasks.filter((t) => t.taskType === "DEPARTURE_CLEAN").length;
  const totalTurndowns = allDailyTasks.filter((t) => t.taskType === "TURNDOWN_VIP").length;
  const totalCompletedDaily = allDailyTasks.filter((t) => t.status === "COMPLETED").length;
  const totalAssignedCredits = dailyAssignments.reduce((acc, b) => acc + b.targetCredits, 0);
  const totalCompletedCredits = dailyAssignments.reduce((acc, b) => acc + b.completedCredits, 0);

  const filteredBoards = dailyAssignments.filter((board) => {
    if (selectedShift !== "ALL" && board.shift !== selectedShift) return false;
    if (selectedStaffFilter !== "ALL" && board.attendantName !== selectedStaffFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Housekeeping, Turnovers & Staff Daily Operations
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time room sanitization board, daily attendant assignment worksheets, routine stayover schedules, and linen telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab("DAILY_ASSIGNMENTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "DAILY_ASSIGNMENTS"
                  ? "bg-slate-800 text-amber-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Daily Staff Assignments</span>
            </button>
            <button
              onClick={() => setActiveTab("KANBAN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "KANBAN"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Turnover Kanban</span>
            </button>
            <button
              onClick={() => setActiveTab("LINEN_SUPPLY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "LINEN_SUPPLY"
                  ? "bg-slate-800 text-sky-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Linen Logistics</span>
            </button>
            <button
              onClick={() => setActiveTab("ATTENDANTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === "ATTENDANTS"
                  ? "bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Staff Roster</span>
            </button>
          </div>

          {activeTab === "DAILY_ASSIGNMENTS" ? (
            <button
              onClick={() => setNewDailyTaskModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Daily Task</span>
            </button>
          ) : (
            <button
              onClick={() => setNewTaskModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Turn</span>
            </button>
          )}

          <button
            onClick={activeTab === "DAILY_ASSIGNMENTS" ? handleAutoBalanceDailySections : handleAiDispatch}
            disabled={isDispatching}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs text-white transition-all flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isDispatching
                ? "Balancing Tasks..."
                : activeTab === "DAILY_ASSIGNMENTS"
                ? "AI Auto-Balance Sections"
                : "AI Auto-Dispatch"}
            </span>
          </button>
        </div>
      </div>

      {/* Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Daily Stayovers & Cleans</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {totalCompletedDaily} / {allDailyTasks.length} Done ({Math.round((totalCompletedDaily / (allDailyTasks.length || 1)) * 100)}%)
            </div>
          </div>
          <CalendarCheck className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Housekeeping Credits</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {totalCompletedCredits.toFixed(1)} / {totalAssignedCredits.toFixed(1)} pts
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Average Turn Time</div>
            <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">24.2 mins</div>
          </div>
          <Clock className="w-5 h-5 text-sky-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Active Attendants on Duty</div>
            <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">4 Sections (14 On Shift)</div>
          </div>
          <UserCheck className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* TAB: DAILY STAFF ASSIGNMENTS (The Core Requested Feature) */}
      {activeTab === "DAILY_ASSIGNMENTS" && (
        <div className="space-y-6">
          {/* Shift and Staff Filtering Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Shift Filter:</span>
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedShift("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                    selectedShift === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Shifts
                </button>
                <button
                  onClick={() => setSelectedShift("MORNING")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 ${
                    selectedShift === "MORNING" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Morning (07:00-15:30)</span>
                </button>
                <button
                  onClick={() => setSelectedShift("AFTERNOON")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 ${
                    selectedShift === "AFTERNOON" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Coffee className="w-3 h-3 text-sky-400" />
                  <span>Afternoon (12:00-20:00)</span>
                </button>
                <button
                  onClick={() => setSelectedShift("EVENING_TURNDOWN")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 ${
                    selectedShift === "EVENING_TURNDOWN" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Moon className="w-3 h-3 text-purple-400" />
                  <span>VIP Turndown (18:00-22:00)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Attendant:</span>
              <select
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Attendants</option>
                <option value="Amina K.">Amina K. (VIP Floor 8)</option>
                <option value="Fatima Z.">Fatima Z. (Floor 5)</option>
                <option value="Carlos M.">Carlos M. (Floor 4 & Deep Clean)</option>
                <option value="David O.">David O. (Turndown Specialist)</option>
              </select>
            </div>
          </div>

          {/* Daily Assignment Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBoards.map((board) => {
              const progressPct = Math.min(100, Math.round((board.completedCredits / (board.targetCredits || 1)) * 100));

              return (
                <div
                  key={board.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  {/* Top: Attendant Profile & Shift Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-sm">
                          {board.attendantName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-white">{board.attendantName}</h3>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {board.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{board.section}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-mono text-slate-400">Shift Credits Load</div>
                        <div className="text-sm font-bold font-mono text-amber-400">
                          {board.completedCredits.toFixed(1)} / {board.targetCredits.toFixed(1)} pts
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Daily Section Workload Progress</span>
                        <span>{progressPct}% Completed</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Task List on Daily Worksheet */}
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 uppercase">
                        <span>Assigned Daily Rooms & Areas ({board.tasks.length})</span>
                        <span>Scheduled Slot</span>
                      </div>

                      <div className="space-y-2">
                        {board.tasks.map((task) => {
                          const isExpanded = expandedTaskCard === task.id;

                          return (
                            <div
                              key={task.id}
                              className={`p-3.5 rounded-xl bg-slate-950 border transition-all ${
                                task.status === "COMPLETED"
                                  ? "border-emerald-500/30 bg-emerald-950/10"
                                  : task.status === "IN_SERVICE"
                                  ? "border-amber-500/40 bg-amber-950/10"
                                  : task.status === "DND_SKIPPED"
                                  ? "border-rose-500/30 bg-rose-950/10"
                                  : "border-slate-800/90 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-xs text-white">{task.roomOrArea}</span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                        task.taskType === "TURNDOWN_VIP"
                                          ? "bg-purple-500/20 text-purple-300"
                                          : task.taskType === "DEPARTURE_CLEAN"
                                          ? "bg-sky-500/20 text-sky-300"
                                          : task.taskType === "DEEP_CLEAN_CYCLE"
                                          ? "bg-rose-500/20 text-rose-300"
                                          : "bg-emerald-500/20 text-emerald-300"
                                      }`}
                                    >
                                      {task.taskType.replace(/_/g, " ")}
                                    </span>
                                    {task.vipTier && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                                        ★ {task.vipTier}
                                      </span>
                                    )}
                                  </div>

                                  {task.guestName && (
                                    <div className="text-[11px] text-slate-300 font-sans">
                                      Guest: <span className="font-semibold text-white">{task.guestName}</span>
                                    </div>
                                  )}

                                  {task.notes && (
                                    <div className="text-[11px] text-slate-400 italic">
                                      "{task.notes}"
                                    </div>
                                  )}
                                </div>

                                <div className="text-right shrink-0">
                                  <div className="text-xs font-mono font-bold text-slate-300">{task.timeSlot}</div>
                                  <div className="text-[10px] font-mono text-slate-500">{task.creditValue} credit pts</div>
                                </div>
                              </div>

                              {/* Checklist Collapsible / SOP Execution */}
                              <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() => setExpandedTaskCard(isExpanded ? null : task.id)}
                                    className="text-[11px] font-mono font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                                  >
                                    <span>Cleaning Checklist SOP ({task.checklist.filter((c) => c.done).length}/{task.checklist.length})</span>
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                  </button>

                                  <div className="flex items-center space-x-1.5">
                                    {task.status !== "COMPLETED" && (
                                      <>
                                        {task.status !== "IN_SERVICE" && (
                                          <button
                                            onClick={() => handleToggleTaskStatus(board.id, task.id, "IN_SERVICE")}
                                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold"
                                          >
                                            In Service
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleToggleTaskStatus(board.id, task.id, "DND_SKIPPED")}
                                          className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold"
                                        >
                                          Log DND
                                        </button>
                                        <button
                                          onClick={() => handleToggleTaskStatus(board.id, task.id, "COMPLETED")}
                                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow-sm"
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>Complete</span>
                                        </button>
                                      </>
                                    )}

                                    {task.status === "COMPLETED" && (
                                      <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px] font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Sanitized & Ready</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded SOP checklist items */}
                                {isExpanded && (
                                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs animate-in fade-in-50">
                                    {task.checklist.map((check, cIdx) => (
                                      <label
                                        key={cIdx}
                                        onClick={() => handleToggleChecklistItem(board.id, task.id, cIdx)}
                                        className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-800/50"
                                      >
                                        {check.done ? (
                                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        ) : (
                                          <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        )}
                                        <span className={`text-[11px] ${check.done ? "text-slate-400 line-through" : "text-slate-200"}`}>
                                          {check.item}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Worksheet Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Shift: {board.shift.replace(/_/g, " ")}</span>
                    </span>
                    <button
                      onClick={() => {
                        setAssignStaff(board.attendantName);
                        setNewDailyTaskModalOpen(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Room to Sheet</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: KANBAN BOARD */}
      {activeTab === "KANBAN" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div key={col.id} className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">
                      {col.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 min-h-[400px] p-2 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                  {colTasks.map((task) => {
                    const isUrgent = task.priority === "URGENT" || task.priority === "VIP";

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl bg-slate-900 border shadow-md space-y-2.5 transition-all hover:border-slate-700 ${
                          isUrgent ? "border-amber-500/40 bg-slate-900/90" : "border-slate-800"
                        }`}
                      >
                        {/* Top: Room + Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-white">
                            Room {task.roomNumber}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              task.priority === "VIP"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : task.priority === "URGENT"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Task Type & Time */}
                        <div className="text-[11px] text-slate-300 font-medium">
                          {task.type.replace(/_/g, " ")} • ⏱ {task.estimatedMinutes}m
                        </div>

                        {/* Attendant Info */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{task.assignedAttendant || "Unassigned"}</span>
                          </span>
                          <span className="font-mono text-[10px]">{task.createdAt}</span>
                        </div>

                        {/* Next Step Action Button */}
                        <div className="pt-1 flex items-center space-x-1">
                          {col.id === "PENDING" && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, "IN_PROGRESS")}
                              className="w-full py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center space-x-1 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-slate-950" />
                              <span>Start Turn</span>
                            </button>
                          )}
                          {col.id === "IN_PROGRESS" && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, "INSPECTED")}
                              className="w-full py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center justify-center space-x-1 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Submit for QA</span>
                            </button>
                          )}
                          {col.id === "INSPECTED" && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, "COMPLETED")}
                              className="w-full py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center space-x-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve & Release</span>
                            </button>
                          )}
                          {col.id === "COMPLETED" && (
                            <div className="w-full py-1 rounded bg-slate-950 text-center text-emerald-400 font-mono text-[10px] font-bold">
                              ✓ Ready for Check-In
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: LINEN & LAUNDRY SUPPLY LOGISTICS */}
      {activeTab === "LINEN_SUPPLY" && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Linen Par & Amenity Depletion Matrix</h3>
            <span className="text-xs font-mono text-slate-400">Automated laundry RFID cycle tracking</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linenStock.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{item.name}</span>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    {item.onHand} / {item.par} {item.unit}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                    style={{ width: `${(item.onHand / item.par) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>In Laundry Cycle: {item.inLaundry}</span>
                  <button
                    onClick={() => handleReplenishLinen(item.id)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                  >
                    Replenish from Laundry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ATTENDANTS ROSTER */}
      {activeTab === "ATTENDANTS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Amina K.", status: "Active in Room 801", turnsDone: 4, speed: "22m avg", score: "99%", section: "Floor 8 VIP Suites" },
            { name: "Fatima Z.", status: "Active in Room 502", turnsDone: 5, speed: "24m avg", score: "98%", section: "Floor 5 Deluxe Section" },
            { name: "Carlos M.", status: "Restocking Linen Cart", turnsDone: 3, speed: "25m avg", score: "100%", section: "Floor 4 & Deep Clean" },
            { name: "David O.", status: "Active in Room 304", turnsDone: 4, speed: "26m avg", score: "97%", section: "Turndown Specialist" },
          ].map((att, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center font-mono text-xs">
                  {att.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{att.name}</div>
                  <div className="text-[10px] text-slate-400">{att.status}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300">
                <div>Turns: <strong className="text-white">{att.turnsDone}</strong></div>
                <div>Speed: <strong className="text-amber-400">{att.speed}</strong></div>
                <div>QA Score: <strong className="text-emerald-400">{att.score}</strong></div>
                <div>Zone: <strong className="text-sky-400">{att.section}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Assign Custom Daily Task */}
      {newDailyTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Assign Regular Daily Cleaning Task</h3>
              </div>
              <button onClick={() => setNewDailyTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400">Assigned Attendant</label>
                <select
                  value={assignStaff}
                  onChange={(e) => setAssignStaff(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Amina K.">Amina K. (VIP Floor 8)</option>
                  <option value="Fatima Z.">Fatima Z. (Floor 5)</option>
                  <option value="Carlos M.">Carlos M. (Floor 4 & Deep Clean)</option>
                  <option value="David O.">David O. (Turndown Specialist)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Room or Area Number</label>
                  <input
                    type="text"
                    value={assignRoom}
                    onChange={(e) => setAssignRoom(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    placeholder="e.g. 802, Floor 5 Foyer"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400">Scheduled Time Slot</label>
                  <input
                    type="text"
                    value={assignTimeSlot}
                    onChange={(e) => setAssignTimeSlot(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    placeholder="e.g. 10:30 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Routine Task Type</label>
                  <select
                    value={assignTaskType}
                    onChange={(e) => setAssignTaskType(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="DAILY_STAYOVER">Daily Stayover Clean</option>
                    <option value="DEPARTURE_CLEAN">Full Departure Turnover</option>
                    <option value="TURNDOWN_VIP">VIP Evening Turndown</option>
                    <option value="PUBLIC_AREA">Public Corridor / Foyer</option>
                    <option value="DEEP_CLEAN_CYCLE">Weekly Deep Clean</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400">Credit Load (pts)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={assignCredits}
                    onChange={(e) => setAssignCredits(parseFloat(e.target.value) || 1.0)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">Special Guest Notes & Instructions</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  placeholder="e.g. Extra hypoallergenic pillows, service after 11:00 AM"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setNewDailyTaskModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDailyAssignment}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Add to Daily Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: New Turn Task Modal */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Housekeeping Turn Task</h3>
              <button onClick={() => setNewTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400">Target Room Number</label>
                <input
                  type="text"
                  value={newRoomNum}
                  onChange={(e) => setNewRoomNum(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  placeholder="e.g. 801"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">Assigned Attendant</label>
                <select
                  value={newAttendant}
                  onChange={(e) => setNewAttendant(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Amina K.">Amina K. (VIP Specialist)</option>
                  <option value="Fatima Z.">Fatima Z.</option>
                  <option value="Carlos M.">Carlos M.</option>
                  <option value="David O.">David O.</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Turn Type</label>
                  <select
                    value={newTurnType}
                    onChange={(e) => setNewTurnType(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="DEPARTURE_FULL">Departure Full Turn</option>
                    <option value="STAYOVER_TIDY">Stayover Tidy</option>
                    <option value="TURNDOWN_VIP">VIP Turndown Service</option>
                    <option value="DEEP_CLEAN">Deep Clean Protocol</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="VIP">VIP Guest</option>
                    <option value="URGENT">Urgent Rush</option>
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setNewTaskModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewTask}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Queue Turn Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
