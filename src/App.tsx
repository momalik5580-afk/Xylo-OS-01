import React, { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { CommandCenter } from "./components/command-center/CommandCenter";
import { DigitalTwinView } from "./components/digital-twin/DigitalTwinView";
import { FrontOfficeView } from "./components/front-office/FrontOfficeView";
import { ReservationsView } from "./components/reservations/ReservationsView";
import { HousekeepingView } from "./components/housekeeping/HousekeepingView";
import { EngineeringView } from "./components/engineering/EngineeringView";
import { InventoryView } from "./components/inventory/InventoryView";
import { FnbPosView } from "./components/fnb/FnbPosView";
import { FinanceView } from "./components/finance/FinanceView";
import { CrmView } from "./components/crm/CrmView";
import { WorkflowEngineView } from "./components/workflows/WorkflowEngineView";
import { AiBrainCopilot } from "./components/ai-brain/AiBrainCopilot";
import { MobileDeviceModal } from "./components/mobile-preview/MobileDeviceModal";
import { CommandPaletteModal } from "./components/common/CommandPaletteModal";
import { NotificationDrawer } from "./components/common/NotificationDrawer";

import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_RESERVATIONS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_WORK_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_FNB_TICKETS,
  INITIAL_TEMPORAL_WORKFLOWS,
  INITIAL_AI_ACTIONS,
  INITIAL_GUEST_PROFILES,
  INITIAL_GROUP_BLOCKS,
  INITIAL_RESORT_ACTIVITIES,
  INITIAL_EVENT_BOOKINGS,
} from "./data/mockData";
import { INITIAL_ALLOTMENT_CONTRACTS } from "./data/mockAllotments";

import {
  NavigationModule,
  UserRole,
  Property,
  Room,
  Reservation,
  HousekeepingTask,
  WorkOrder,
  InventoryItem,
  PurchaseOrder,
  FnbTicket,
  TemporalWorkflowInstance,
  AiAutonomousAction,
  GuestProfile,
  RoomCategory,
  GroupBlock,
  GroupDelegate,
  ResortActivity,
  ResortEventBooking,
  AllotmentContract,
} from "./types";

export default function App() {
  // Navigation & Role State - default directly to group-blocks for active focus
  const [activeModule, setActiveModule] = useState<NavigationModule>("group-blocks");
  const [activeRole, setActiveRole] = useState<UserRole>("GENERAL_MANAGER");
  const [currentProperty, setCurrentProperty] = useState<Property>(INITIAL_PROPERTIES[0]);

  // Hotel Domain Operational State
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [hkTasks, setHkTasks] = useState<HousekeepingTask[]>(INITIAL_HOUSEKEEPING_TASKS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [fnbTickets, setFnbTickets] = useState<FnbTicket[]>(INITIAL_FNB_TICKETS);
  const [workflows, setWorkflows] = useState<TemporalWorkflowInstance[]>(INITIAL_TEMPORAL_WORKFLOWS);
  const [aiActions, setAiActions] = useState<AiAutonomousAction[]>(INITIAL_AI_ACTIONS);
  const [guests, setGuests] = useState<GuestProfile[]>(INITIAL_GUEST_PROFILES);
  const [groupBlocks, setGroupBlocks] = useState<GroupBlock[]>(INITIAL_GROUP_BLOCKS);
  const [allotments, setAllotments] = useState<AllotmentContract[]>(INITIAL_ALLOTMENT_CONTRACTS);
  const [resortActivities, setResortActivities] = useState<ResortActivity[]>(INITIAL_RESORT_ACTIVITIES);
  const [eventBookings, setEventBookings] = useState<ResortEventBooking[]>(INITIAL_EVENT_BOOKINGS);

  // Modals & Drawers
  const [aiBrainOpen, setAiBrainOpen] = useState<boolean>(false);
  const [mobileModalOpen, setMobileModalOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Keyboard shortcut Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Quick Action Handler (Autonomous simulation)
  const handleQuickAction = (actionType: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (actionType === "SURGE_PRICING") {
      const newAction: AiAutonomousAction = {
        id: `act-${Date.now()}`,
        actionType: "RATE_YIELD_CHANGE",
        department: "REVENUE",
        title: "Dynamic Weekend Surge (+18%) Activated",
        reasoning: "Occupancy crossed 94.0% velocity threshold. Increased Best Available Rate across all channels to maximize ADR.",
        timestamp: now,
        status: "EXECUTED",
        metricsImpact: "+$14,200 Projected RevPAR",
      };
      setAiActions((prev) => [newAction, ...prev]);
      showToast("⚡ Dynamic Weekend Surge Applied (+18% ADR Sync)");
    } else if (actionType === "REBALANCE_HK") {
      setHkTasks((prev) =>
        prev.map((task) =>
          task.priority === "URGENT_CHECKIN"
            ? { ...task, status: "IN_PROGRESS", attendant: "Maria Santos (Priority Team)" }
            : task
        )
      );
      const newAction: AiAutonomousAction = {
        id: `act-${Date.now()}`,
        actionType: "DISPATCH_TURNOVER",
        department: "HOUSEKEEPING",
        title: "Housekeeping Priority Rebalanced",
        reasoning: "Re-routed 4 floor attendants to prep 8th floor VIP Penthouse suites for 14:00 check-ins.",
        timestamp: now,
        status: "EXECUTED",
        metricsImpact: "0 SLA Breaches Guarantee",
      };
      setAiActions((prev) => [newAction, ...prev]);
      showToast("🧹 Housekeeping Turns Rebalanced for Arriving VIPs");
    } else if (actionType === "VIP_AUTO_UPGRADE") {
      const newAction: AiAutonomousAction = {
        id: `act-${Date.now()}`,
        actionType: "VIP_UPGRADE",
        department: "FRONT_OFFICE",
        title: "Diamond Member Auto-Upgraded to Penthouse 801",
        reasoning: "Guest Elena Rostova recognized upon approach. Upgraded from Deluxe King to Penthouse with Champagne welcome.",
        timestamp: now,
        status: "EXECUTED",
        metricsImpact: "100% VIP Loyalty Retention",
      };
      setAiActions((prev) => [newAction, ...prev]);
      showToast("👑 Diamond VIP Elena Rostova Upgraded to Penthouse 801");
    } else if (actionType === "SIMULATE_NIGHT_AUDIT") {
      const newAction: AiAutonomousAction = {
        id: `act-${Date.now()}`,
        actionType: "RATE_YIELD_CHANGE",
        department: "FINANCE",
        title: "Night Audit Pre-Check Balanced",
        reasoning: "Validated 188 in-house folios and matched all POS credit batches with zero variance.",
        timestamp: now,
        status: "EXECUTED",
        metricsImpact: "Zero Discrepancies Found",
      };
      setAiActions((prev) => [newAction, ...prev]);
      showToast("🌙 Night Audit Pre-Check Passed (100% Balanced)");
    }
  };

  // Domain Handlers
  const handleUpdateRoom = (updated: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleCheckInGuest = (reservationId: string, assignedRoom: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId
          ? { ...r, status: "CHECKED_IN", roomNumber: assignedRoom, digitalKeyActive: true }
          : r
      )
    );
    setRooms((prev) =>
      prev.map((rm) =>
        rm.roomNumber === assignedRoom
          ? {
              ...rm,
              status: "OCCUPIED",
              guestName: reservations.find((r) => r.id === reservationId)?.guestName || "In-House Guest",
            }
          : rm
      )
    );
    showToast(`✓ Guest Checked In & Assigned to Room ${assignedRoom}`);
  };

  const handleCheckOutGuest = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: "CHECKED_OUT" } : r))
    );
    if (res.roomNumber) {
      setRooms((prev) =>
        prev.map((rm) =>
          rm.roomNumber === res.roomNumber
            ? { ...rm, status: "VACANT_DIRTY", guestName: undefined }
            : rm
        )
      );
      // Auto create HK task
      const newTask: HousekeepingTask = {
        id: `hk-${Date.now()}`,
        roomNumber: res.roomNumber,
        floor: parseInt(res.roomNumber.charAt(0)) || 8,
        type: "Departure Turn",
        status: "PENDING",
        priority: "HIGH",
        attendant: "Unassigned (AI Routing)",
        estimatedMinutes: 35,
        notes: "Guest checked out. Full linen reset & minibar audit.",
        linenChanged: true,
      };
      setHkTasks((prev) => [newTask, ...prev]);
    }
    showToast(`✓ Check-Out Completed for ${res.guestName}. Room queued for turn.`);
  };

  const handleUpgradeGuest = (reservationId: string, newCat: RoomCategory, newRoom: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, roomCategory: newCat, roomNumber: newRoom } : r
      )
    );
    showToast(`👑 Guest upgraded to ${newCat} (Room ${newRoom})`);
  };

  const handleNewReservation = (res: Reservation) => {
    setReservations((prev) => [res, ...prev]);
    showToast(`✓ Reservation ${res.confirmationNo} confirmed & synced.`);
  };

  const handleNewGroupBlock = (newBlock: GroupBlock) => {
    setGroupBlocks((prev) => [newBlock, ...prev]);
    showToast(`📋 Group Block "${newBlock.groupName}" (${newBlock.blockCode}) Created`);
  };

  const handlePickupGroupDelegate = (
    blockId: string,
    delegate: GroupDelegate,
    reservation: Reservation
  ) => {
    setGroupBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const exists = b.delegates?.some((d) => d.id === delegate.id);
        const updatedDelegates = exists
          ? b.delegates?.map((d) => (d.id === delegate.id ? delegate : d))
          : [...(b.delegates || []), delegate];

        const newPickupCount = (updatedDelegates || []).filter((d) => d.status !== "CANCELLED").length;

        const updatedGrid = b.roomGrid?.map((day) => {
          if (day.date >= delegate.checkIn && day.date < delegate.checkOut) {
            return {
              ...day,
              allocations: day.allocations.map((alloc) =>
                alloc.roomCategory === delegate.roomCategory
                  ? { ...alloc, pickedUp: alloc.pickedUp + 1 }
                  : alloc
              ),
            };
          }
          return day;
        });

        return {
          ...b,
          pickedUpRooms: newPickupCount,
          delegates: updatedDelegates,
          roomGrid: updatedGrid || b.roomGrid,
        };
      })
    );

    setReservations((prev) => {
      const exists = prev.some((r) => r.id === reservation.id);
      if (exists) {
        return prev.map((r) => (r.id === reservation.id ? reservation : r));
      }
      return [reservation, ...prev];
    });

    showToast(`✓ Delegate ${delegate.guestName} picked up into room ${delegate.roomNumber || "assigned"}.`);
  };

  const handleBatchPickupDelegates = (
    blockId: string,
    delegates: GroupDelegate[],
    newReservations: Reservation[]
  ) => {
    setGroupBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const currentDelegates = b.delegates || [];
        const combinedDelegates = [...currentDelegates, ...delegates];
        const newPickupCount = combinedDelegates.filter((d) => d.status !== "CANCELLED").length;
        return {
          ...b,
          pickedUpRooms: newPickupCount,
          delegates: combinedDelegates,
        };
      })
    );

    setReservations((prev) => [...newReservations, ...prev]);
    showToast(`✓ Batch manifest imported: ${delegates.length} delegates registered & PMS synced.`);
  };

  const handleCancelGroupDelegate = (
    blockId: string,
    delegateId: string,
    reservationId: string
  ) => {
    setGroupBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const updatedDelegates = b.delegates?.map((d) =>
          d.id === delegateId ? { ...d, status: "CANCELLED" as const } : d
        );
        const newPickupCount = (updatedDelegates || []).filter((d) => d.status !== "CANCELLED").length;
        return {
          ...b,
          pickedUpRooms: newPickupCount,
          delegates: updatedDelegates,
        };
      })
    );

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: "CANCELLED" } : r
      )
    );

    showToast(`✓ Delegate reservation cancelled & room inventory released.`);
  };

  const handleCheckInGroupDelegate = (
    blockId: string,
    delegateId: string,
    reservationId: string
  ) => {
    setGroupBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const updatedDelegates = b.delegates?.map((d) =>
          d.id === delegateId ? { ...d, status: "CHECKED_IN" as const, digitalKeyIssued: true } : d
        );
        return {
          ...b,
          delegates: updatedDelegates,
        };
      })
    );

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: "CHECKED_IN", digitalKeyActive: true } : r
      )
    );

    showToast(`✓ Delegate checked in & Mobile NFC Key activated.`);
  };

  const handlePickupGroupBlock = (blockId: string, guestName: string) => {
    setGroupBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId && b.pickedUpRooms < b.allocatedRooms
          ? { ...b, pickedUpRooms: b.pickedUpRooms + 1 }
          : b
      )
    );
    const block = groupBlocks.find((b) => b.id === blockId);
    if (block) {
      const newRes: Reservation = {
        id: `res-blk-${Date.now()}`,
        confirmationNo: `XY-G${Math.floor(1000 + Math.random() * 9000)}`,
        guestName,
        guestEmail: `${guestName.toLowerCase().replace(/\s+/g, ".")}@group.com`,
        guestPhone: "+1 555 0199",
        roomCategory: block.roomCategory,
        checkIn: block.startDate,
        checkOut: block.endDate,
        nights: 4,
        adults: 1,
        children: 0,
        status: "CONFIRMED",
        ratePlan: "Corporate Luxury",
        ratePerNight: block.negotiatedRate,
        totalAmount: block.negotiatedRate * 4,
        paidAmount: block.billingMethod === "MASTER_FOLIO" ? block.negotiatedRate * 4 : 0,
        balance: block.billingMethod === "MASTER_FOLIO" ? 0 : block.negotiatedRate * 4,
        channel: "Direct Web",
        vipTier: "Silver",
        digitalKeyActive: true,
        regCardSigned: true,
      };
      setReservations((prev) => [newRes, ...prev]);
    }
    showToast(`🔑 Delegate room picked up for ${guestName}`);
  };

  const handleNewEventBooking = (booking: ResortEventBooking) => {
    setEventBookings((prev) => [booking, ...prev]);
    showToast(`✨ Experience "${booking.activityTitle}" booked for ${booking.guestOrGroupName}`);
  };

  const handleUpdateHkStatus = (
    taskId: string,
    status: "PENDING" | "IN_PROGRESS" | "INSPECTED" | "COMPLETED"
  ) => {
    setHkTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    if (status === "COMPLETED") {
      const task = hkTasks.find((t) => t.id === taskId);
      if (task) {
        setRooms((prev) =>
          prev.map((rm) =>
            rm.roomNumber === task.roomNumber ? { ...rm, status: "VACANT_CLEAN" } : rm
          )
        );
      }
    }
  };

  const handleDispatchHkFromTwin = (roomNumber: string) => {
    const newTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      roomNumber,
      floor: parseInt(roomNumber.charAt(0)) || 8,
      type: "Deep Sanitize",
      status: "IN_PROGRESS",
      priority: "HIGH",
      attendant: "Maria Santos (Lead)",
      estimatedMinutes: 30,
      notes: "Dispatched from Digital Twin console",
      linenChanged: true,
    };
    setHkTasks((prev) => [newTask, ...prev]);
    showToast(`🧹 Priority turn task dispatched for Room ${roomNumber}`);
  };

  const handleCreateWorkOrder = (order: Partial<WorkOrder>) => {
    const newWo: WorkOrder = {
      id: `CMMS-${Math.floor(1000 + Math.random() * 9000)}`,
      asset: order.asset || "HVAC Zone 8",
      location: order.location || "Room 801",
      category: order.category || "HVAC",
      priority: order.priority || "HIGH",
      status: "OPEN",
      reportedBy: order.reportedBy || "Staff Console",
      assignedEngineer: order.assignedEngineer || "David Keller",
      reportedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      slaMinutes: order.slaMinutes || 60,
      description: order.description || "General maintenance inspection",
      iotTriggered: order.iotTriggered || false,
    };
    setWorkOrders((prev) => [newWo, ...prev]);
    showToast(`🔧 Work Order ${newWo.id} Dispatched`);
  };

  const handleResolveWorkOrder = (id: string) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "RESOLVED" } : w))
    );
    showToast(`✓ Work Order ${id} resolved`);
  };

  const handleApprovePO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: "APPROVED" } : po))
    );
    showToast("✓ Purchase Order Approved");
  };

  const handleReceivePO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: "RECEIVED_GRN", threeWayMatched: true } : po))
    );
    showToast("✓ Goods Receipt Note (GRN) Logged & 3-Way Matched");
  };

  const handleUpdateFnbTicket = (ticketId: string, status: any) => {
    setFnbTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold shadow-2xl shadow-rose-950/60 animate-in slide-in-from-top-2 flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Structural Left Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenAiBrain={() => setAiBrainOpen(true)}
        badgeCounts={{
          frontOffice: reservations.filter((r) => r.status === "CONFIRMED").length,
          housekeeping: hkTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length,
          engineering: workOrders.filter((w) => w.status !== "RESOLVED").length,
          workflows: workflows.filter((w) => w.status === "RUNNING").length,
          aiActions: aiActions.filter((a) => a.status === "EXECUTED").length,
        }}
      />

      {/* Main Execution Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-950">
        {/* Top Header */}
        <Header
          currentProperty={currentProperty}
          properties={INITIAL_PROPERTIES}
          activeRole={activeRole}
          onSelectProperty={setCurrentProperty}
          onSelectRole={setActiveRole}
          onOpenAiBrain={() => setAiBrainOpen(true)}
          onOpenMobileModal={() => setMobileModalOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        {/* Dynamic Module Content View */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeModule === "command-center" && (
            <CommandCenter
              currentProperty={currentProperty}
              rooms={rooms}
              aiActions={aiActions}
              workflows={workflows}
              groupBlocks={groupBlocks}
              eventBookings={eventBookings}
              onTriggerQuickAction={handleQuickAction}
              onOpenAiBrain={() => setAiBrainOpen(true)}
              onNavigateModule={(mod) => setActiveModule(mod as NavigationModule)}
            />
          )}

          {activeModule === "digital-twin" && (
            <DigitalTwinView
              rooms={rooms}
              onUpdateRoom={handleUpdateRoom}
              onDispatchHousekeeping={handleDispatchHkFromTwin}
              onCreateWorkOrder={(roomNo, issue) =>
                handleCreateWorkOrder({ location: `Room ${roomNo}`, description: issue, priority: "HIGH" })
              }
            />
          )}

          {activeModule === "front-office" && (
            <FrontOfficeView
              reservations={reservations}
              rooms={rooms}
              onCheckInGuest={handleCheckInGuest}
              onCheckOutGuest={handleCheckOutGuest}
              onUpgradeGuest={handleUpgradeGuest}
              onNewReservation={handleNewReservation}
            />
          )}

          {(activeModule === "reservations" || activeModule === "group-blocks" || activeModule === "allotments") && (
            <ReservationsView
              reservations={reservations}
              rooms={rooms}
              defaultSubTab={
                activeModule === "group-blocks"
                  ? "group-blocks"
                  : activeModule === "allotments"
                  ? "allotments"
                  : "timeline"
              }
              onNewReservation={handleNewReservation}
              onUpdateReservation={(updated) => {
                setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                showToast(`✓ Reservation ${updated.confirmationNo} updated in OPERA Cloud.`);
              }}
              groupBlocks={groupBlocks}
              onNewGroupBlock={handleNewGroupBlock}
              onUpdateGroupBlock={(updated) => {
                setGroupBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                showToast(`✓ Group Block ${updated.blockCode} updated.`);
              }}
              onPickupGroupBlock={handlePickupGroupBlock}
              onPickupGroupDelegate={handlePickupGroupDelegate}
              onBatchPickupDelegates={handleBatchPickupDelegates}
              onCancelGroupDelegate={handleCancelGroupDelegate}
              onCheckInGroupDelegate={handleCheckInGroupDelegate}
              resortActivities={resortActivities}
              eventBookings={eventBookings}
              onNewEventBooking={handleNewEventBooking}
              allotments={allotments}
              onUpdateAllotment={(updated) => {
                setAllotments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                showToast(`✓ Allotment ${updated.contractCode} (${updated.partnerName}) updated.`);
              }}
              onNewAllotment={(created) => {
                setAllotments((prev) => [created, ...prev]);
                showToast(`✓ New Allotment ${created.contractCode} created.`);
              }}
            />
          )}

          {activeModule === "housekeeping" && (
            <HousekeepingView
              tasks={hkTasks}
              onUpdateTaskStatus={handleUpdateHkStatus}
              onAutoDispatch={() => handleQuickAction("REBALANCE_HK")}
              onAddTask={(task) => setHkTasks((prev) => [task, ...prev])}
            />
          )}

          {activeModule === "engineering" && (
            <EngineeringView
              workOrders={workOrders}
              onResolveWorkOrder={handleResolveWorkOrder}
              onCreateWorkOrder={handleCreateWorkOrder}
            />
          )}

          {activeModule === "inventory" && (
            <InventoryView
              inventory={inventory}
              purchaseOrders={purchaseOrders}
              onApprovePO={handleApprovePO}
              onReceivePO={handleReceivePO}
              onCreatePO={(newPo) => setPurchaseOrders((prev) => [newPo, ...prev])}
            />
          )}

          {activeModule === "fnb" && (
            <FnbPosView
              tickets={fnbTickets}
              onUpdateTicketStatus={handleUpdateFnbTicket}
              onNewOrder={(t) => setFnbTickets((prev) => [t, ...prev])}
            />
          )}

          {activeModule === "finance" && <FinanceView />}

          {activeModule === "crm" && <CrmView guests={guests} />}

          {activeModule === "workflows" && (
            <WorkflowEngineView
              workflows={workflows}
              onTriggerNewWorkflow={(wf) => setWorkflows((prev) => [wf, ...prev])}
            />
          )}
        </main>
      </div>

      {/* Slide-over AI Hotel Brain Copilot */}
      <AiBrainCopilot
        isOpen={aiBrainOpen}
        onClose={() => setAiBrainOpen(false)}
        currentProperty={currentProperty}
        rooms={rooms}
        reservations={reservations}
        onExecuteSimulatedAction={handleQuickAction}
      />

      {/* Interactive Mobile Device Simulator (Guest App & Staff Companion) */}
      <MobileDeviceModal
        isOpen={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
        rooms={rooms}
      />

      {/* Global Command Palette (Cmd + K) */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(mod) => setActiveModule(mod)}
        onTriggerQuickAction={handleQuickAction}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
