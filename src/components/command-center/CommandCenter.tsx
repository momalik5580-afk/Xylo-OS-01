import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  Users,
  Hotel,
  ArrowUpRight,
  Clock,
  Flame,
  Radio,
  Globe,
  Building2,
  Compass,
  CreditCard,
} from "lucide-react";
import {
  Property,
  AiAutonomousAction,
  TemporalWorkflowInstance,
  Room,
  GroupBlock,
  ResortEventBooking,
} from "../../types";

interface CommandCenterProps {
  currentProperty: Property;
  rooms: Room[];
  aiActions: AiAutonomousAction[];
  workflows: TemporalWorkflowInstance[];
  groupBlocks?: GroupBlock[];
  eventBookings?: ResortEventBooking[];
  onTriggerQuickAction: (actionType: string) => void;
  onOpenAiBrain: () => void;
  onNavigateModule: (module: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  currentProperty,
  rooms,
  aiActions,
  workflows,
  groupBlocks = [],
  eventBookings = [],
  onTriggerQuickAction,
  onOpenAiBrain,
  onNavigateModule,
}) => {
  const [selectedKpiTimeframe, setSelectedKpiTimeframe] = useState<"24h" | "7d" | "30d">("24h");
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED" || r.status === "DAY_USE").length;
  const vacantCleanCount = rooms.filter((r) => r.status === "VACANT_CLEAN").length;
  const vacantDirtyCount = rooms.filter((r) => r.status === "VACANT_DIRTY").length;
  const inspectedCount = rooms.filter((r) => r.status === "INSPECTED").length;
  const oooCount = rooms.filter((r) => r.status === "OUT_OF_ORDER").length;
  const occupancyPercent = ((occupiedCount / rooms.length) * 100).toFixed(1);

  const handleSimulateAction = (type: string) => {
    setExecutingActionId(type);
    onTriggerQuickAction(type);
    setTimeout(() => {
      setExecutingActionId(null);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner: Global Autonomous Health */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Global Autonomous Command Center
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI BRAIN: OPTIMAL (100% HEALTH)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Operating <span className="text-slate-200 font-semibold">{currentProperty.name}</span> with 0ms human exception latency.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 z-10">
          <button
            onClick={() => onNavigateModule("workflows")}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>142 Active Sagas</span>
          </button>
          <button
            onClick={onOpenAiBrain}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-950/50 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch AI Brain</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Occupancy */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Occupancy Rate</span>
            <Hotel className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">{occupancyPercent}%</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center font-mono">
              +3.4% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {occupiedCount} / {rooms.length} Units Active
          </div>
        </div>

        {/* RevPAR */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">RevPAR (24h)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">$284.50</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center font-mono">
              +8.2% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            ADR: $302.00 | GOPPAR: $182.10
          </div>
        </div>

        {/* Autonomous AI Actions */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">AI Autonomous Events</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">1,842</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
              Today
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            0 human escalations pending
          </div>
        </div>

        {/* Guest Sentiment */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Guest Sentiment Score</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white tracking-tight">96.8%</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center font-mono">
              +1.2% <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Based on 84 in-app reviews
          </div>
        </div>
      </div>

      {/* Main Split: Live Autonomous Decisions & Temporal Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Autonomous Decisions Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Real-time Autonomous Decision Engine
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Streaming from Temporal Event Bus
              </span>
            </div>

            <div className="space-y-3">
              {aiActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {action.department}
                      </span>
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {action.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {action.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {action.reasoning}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 font-semibold pt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span>Impact: {action.metricsImpact}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-1.5 self-center">
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>EXECUTED</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct CRS Engine, Group Blocks & Resort Activities Dashboard Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Direct CRS Engine, Group Blocks (MICE) & Resort Experiences
                </h3>
              </div>
              <button
                onClick={() => onNavigateModule("reservations")}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center space-x-1"
              >
                <span>Open Full CRS & Booking Engine →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Direct Booking Engine Stat Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Direct CRS Yield</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    0% OTA Comm
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  58.4% <span className="text-xs font-normal text-emerald-400">Direct Share</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Direct web engine saved <strong className="text-emerald-400 font-mono">$14,280</strong> in OTA commissions this week.
                </div>
                <button
                  onClick={() => onNavigateModule("reservations")}
                  className="w-full mt-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono transition-colors text-center"
                >
                  Direct Booking Engine →
                </button>
              </div>

              {/* Group Blocks (MICE) Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Group Blocks (MICE)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300">
                    {groupBlocks.length} Active
                  </span>
                </div>

                <div className="space-y-1.5">
                  {groupBlocks.slice(0, 2).map((b) => (
                    <div key={b.id} className="text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span className="truncate max-w-[150px] font-bold">{b.groupName}</span>
                        <span className="text-purple-400 font-bold">{b.pickedUpRooms}/{b.allocatedRooms} rms</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${Math.round((b.pickedUpRooms / b.allocatedRooms) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateModule("reservations")}
                  className="w-full mt-1 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono transition-colors text-center"
                >
                  Manage Group Blocks →
                </button>
              </div>

              {/* Resort Activities & Events Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Today's Experiences</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300">
                    {eventBookings.length} Booked
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  {eventBookings.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="p-1.5 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                      <div className="truncate max-w-[140px]">
                        <div className="font-bold text-slate-200 truncate">{ev.activityTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ev.guestOrGroupName}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">${ev.totalPrice}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateModule("reservations")}
                  className="w-full mt-1 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold font-mono transition-colors text-center"
                >
                  Schedule Activities →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Autonomous Trigger Simulators */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Executive Action Simulators (Test Autonomous Sagas)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSimulateAction("SURGE_PRICING")}
                disabled={executingActionId === "SURGE_PRICING"}
                className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    ⚡ Trigger Dynamic Weekend Surge (+18%)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Sync BAR to OTAs & Direct CRS
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateAction("REBALANCE_HK")}
                disabled={executingActionId === "REBALANCE_HK"}
                className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    🧹 Rebalance Housekeeping Turn Queue
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Auto-assign 4 priority suites for 14:00 check-ins
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateAction("VIP_AUTO_UPGRADE")}
                disabled={executingActionId === "VIP_AUTO_UPGRADE"}
                className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                    👑 Auto-Upgrade Arriving Diamond VIPs
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Allocate Penthouse 801 & trigger Dom Pérignon order
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateAction("SIMULATE_NIGHT_AUDIT")}
                disabled={executingActionId === "SIMULATE_NIGHT_AUDIT"}
                className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                    🌙 Run Night Audit Pre-Check
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Verify 188 in-house folios & balance F&B batches
                  </div>
                </div>
                <Play className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Inventory Status & Sagas */}
        <div className="space-y-4">
          {/* Room Rack Status Distribution */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Room Inventory Telemetry
              </h3>
              <button
                onClick={() => onNavigateModule("digital-twin")}
                className="text-[11px] text-amber-400 hover:underline font-medium"
              >
                View 3D Twin →
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-200 font-medium">Occupied / In-House</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-100">{occupiedCount} rooms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span className="text-xs text-slate-200 font-medium">Vacant Clean & Ready</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-100">{vacantCleanCount} rooms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs text-slate-200 font-medium">Vacant Dirty (In Turn)</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-100">{vacantDirtyCount} rooms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="text-xs text-slate-200 font-medium">Inspected VIP</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-100">{inspectedCount} rooms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-200 font-medium">Out of Order / Maintenance</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-100">{oooCount} rooms</span>
              </div>
            </div>
          </div>

          {/* Active Temporal Workflow Sagas */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Active Temporal Workflows
                </h3>
              </div>
              <button
                onClick={() => onNavigateModule("workflows")}
                className="text-[11px] text-purple-400 hover:underline font-medium"
              >
                Orchestrator →
              </button>
            </div>

            <div className="space-y-3">
              {workflows.slice(0, 3).map((wf) => (
                <div key={wf.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{wf.name}</span>
                    <span className="text-[10px] font-mono font-semibold text-purple-400">{wf.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${wf.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="truncate">Step: {wf.currentStep}</span>
                    <span className="text-emerald-400">SLA {wf.slaMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
