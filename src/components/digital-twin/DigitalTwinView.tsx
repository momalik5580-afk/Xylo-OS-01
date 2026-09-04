import React, { useState } from "react";
import {
  Layers,
  Thermometer,
  Lock,
  Unlock,
  Zap,
  Radio,
  UserCheck,
  Sparkles,
  Wrench,
  Key,
  Shield,
  Eye,
  CheckCircle2,
  AlertOctagon,
  Moon,
  Brush,
  Sliders,
  X,
  Sun,
  Tv,
  Wind,
  Plus,
} from "lucide-react";
import { Room, RoomStatus } from "../../types";

interface DigitalTwinViewProps {
  rooms: Room[];
  onUpdateRoom: (updatedRoom: Room) => void;
  onDispatchHousekeeping: (roomNumber: string) => void;
  onCreateWorkOrder: (roomNumber: string, issue: string) => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  rooms,
  onUpdateRoom,
  onDispatchHousekeeping,
  onCreateWorkOrder,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(8);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [lightingPreset, setLightingPreset] = useState<"LUXURY" | "DAYLIGHT" | "EVENING" | "OFF">("LUXURY");
  const [acMode, setAcMode] = useState<"COOL" | "HEAT" | "ECO" | "OFF">("COOL");
  const [workOrderModalOpen, setWorkOrderModalOpen] = useState<boolean>(false);
  const [workOrderIssue, setWorkOrderIssue] = useState<string>("HVAC Chiller Delta-T Sensor Anomaly");

  // Get distinct floors from rooms or defaults
  const availableFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a: any, b: any) => Number(b) - Number(a));
  const currentFloors = availableFloors.length > 0 ? availableFloors : [8, 5, 4, 3];

  const floorRooms = rooms.filter((r) => r.floor === selectedFloor);

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case "OCCUPIED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OCCUPIED</span>;
      case "VACANT_CLEAN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">VACANT CLEAN</span>;
      case "VACANT_DIRTY":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">VACANT DIRTY</span>;
      case "INSPECTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">INSPECTED VIP</span>;
      case "OUT_OF_ORDER":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">OUT OF ORDER</span>;
      case "DAY_USE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">DAY USE</span>;
    }
  };

  const handleToggleLock = (room: Room) => {
    setIsLocking(true);
    setTimeout(() => {
      const newStatus = room.iot.lockStatus === "LOCKED" ? "UNLOCKED" : "LOCKED";
      const updated: Room = {
        ...room,
        iot: {
          ...room.iot,
          lockStatus: newStatus,
        },
      };
      onUpdateRoom(updated);
      setActiveRoom(updated);
      setIsLocking(false);
    }, 400);
  };

  const handleAdjustTemp = (room: Room, delta: number) => {
    const newTarget = Math.round((room.iot.targetTemp + delta) * 10) / 10;
    const updated: Room = {
      ...room,
      iot: {
        ...room.iot,
        targetTemp: newTarget,
      },
    };
    onUpdateRoom(updated);
    setActiveRoom(updated);
  };

  const handleSetRoomStatus = (room: Room, status: RoomStatus) => {
    const updated: Room = {
      ...room,
      status,
    };
    onUpdateRoom(updated);
    setActiveRoom(updated);
  };

  const handleToggleDnd = (room: Room) => {
    const updated: Room = {
      ...room,
      iot: { ...room.iot, dnd: !room.iot.dnd },
    };
    onUpdateRoom(updated);
    setActiveRoom(updated);
  };

  const handleToggleMakeup = (room: Room) => {
    const updated: Room = {
      ...room,
      iot: { ...room.iot, makeupRoom: !room.iot.makeupRoom },
    };
    onUpdateRoom(updated);
    setActiveRoom(updated);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Digital Twin Hotel Spatial Environment & IoT Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            2.5D visual floor layout, Assa Abloy BLE lock actuators, Daikin VRV HVAC zones, power grid load, and occupancy radar.
          </p>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto">
          {currentFloors.map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-mono whitespace-nowrap ${
                selectedFloor === floor
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              Floor {floor} {floor === 8 ? "👑 (Penthouse)" : floor === 5 ? "(Sky Suites)" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Floor Overview Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Floor Climate Average</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">21.8°C</div>
          </div>
          <Thermometer className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Power Grid Draw</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">7.8 kW</div>
          </div>
          <Zap className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Smart Lock BLE Mesh</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">100% ONLINE</div>
          </div>
          <Radio className="w-5 h-5 text-sky-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Turnover Readiness</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">94.0% Ready</div>
          </div>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* 2.5D Room Floor Layout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {floorRooms.map((room) => {
          const isSelected = activeRoom?.id === room.id;
          const isTempHigh = room.iot.temperature > 24.5;

          return (
            <div
              key={room.id}
              onClick={() => {
                setActiveRoom(room);
                setInspectorOpen(true);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group shadow-md ${
                isSelected
                  ? "bg-slate-900 border-amber-500 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/40"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              {/* Top Row: Room Number + Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black text-white font-mono tracking-tight">
                    {room.roomNumber}
                  </span>
                  {room.vipTier && room.vipTier !== "None" && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {room.vipTier}
                    </span>
                  )}
                </div>
                {getStatusBadge(room.status)}
              </div>

              {/* Room Category & Guest */}
              <div className="space-y-1 mb-3">
                <div className="text-xs font-semibold text-slate-300 truncate">
                  {room.category}
                </div>
                {room.guestName ? (
                  <div className="text-xs text-amber-300/90 font-medium truncate flex items-center space-x-1">
                    <UserCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{room.guestName}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No in-house guest</div>
                )}
              </div>

              {/* IoT Live Sensors Strip */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                {/* Temp */}
                <div
                  className={`p-1.5 rounded flex items-center space-x-1 ${
                    isTempHigh
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-slate-950 text-slate-300"
                  }`}
                >
                  <Thermometer className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{room.iot.temperature.toFixed(1)}°</span>
                </div>

                {/* Lock */}
                <div className="p-1.5 rounded bg-slate-950 text-slate-300 flex items-center space-x-1">
                  {room.iot.lockStatus === "LOCKED" ? (
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Unlock className="w-3 h-3 text-amber-400 shrink-0" />
                  )}
                  <span className="truncate">{room.iot.lockStatus === "LOCKED" ? "Lock" : "Open"}</span>
                </div>

                {/* Power */}
                <div className="p-1.5 rounded bg-slate-950 text-slate-300 flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>{room.iot.powerKw}kW</span>
                </div>
              </div>

              {/* DND / Makeup Room Tags */}
              <div className="flex items-center space-x-2 mt-2 pt-1 text-[10px]">
                {room.iot.dnd && (
                  <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold font-mono">
                    <Moon className="w-2.5 h-2.5" />
                    <span>DND ACTIVE</span>
                  </span>
                )}
                {room.iot.makeupRoom && (
                  <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold font-mono">
                    <Brush className="w-2.5 h-2.5" />
                    <span>MAKEUP REQ</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-Over Room Inspector Modal */}
      {inspectorOpen && activeRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 h-full overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-white font-mono">
                      Room {activeRoom.roomNumber}
                    </span>
                    {getStatusBadge(activeRoom.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeRoom.category} • Floor {activeRoom.floor}</p>
                </div>
                <button
                  onClick={() => setInspectorOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guest & Reservation Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Stay & Guest Details
                </div>
                {activeRoom.guestName ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guest Name:</span>
                      <span className="font-bold text-white">{activeRoom.guestName}</span>
                    </div>
                    {activeRoom.vipTier && activeRoom.vipTier !== "None" && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">VIP Tier:</span>
                        <span className="font-bold text-purple-400">{activeRoom.vipTier}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Nightly Rate:</span>
                      <span className="font-bold text-emerald-400 font-mono">${activeRoom.rate}/night</span>
                    </div>
                    {activeRoom.checkInDate && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Stay Period:</span>
                        <span>{activeRoom.checkInDate} to {activeRoom.checkOutDate}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No in-house guest assigned currently.</div>
                )}
              </div>

              {/* IoT Live Control Center */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>IoT Smart Building Actuators</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Active Mesh</span>
                </div>

                {/* Thermostat Controls */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Climate Setpoint (HVAC Zone)</span>
                    <span className="font-mono font-bold text-amber-400">
                      Actual: {activeRoom.iot.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleAdjustTemp(activeRoom, -0.5)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-mono font-bold text-white text-xs border border-slate-700 transition-colors"
                    >
                      - 0.5°
                    </button>
                    <span className="text-lg font-black text-white font-mono">
                      {activeRoom.iot.targetTemp.toFixed(1)}°C Target
                    </span>
                    <button
                      onClick={() => handleAdjustTemp(activeRoom, 0.5)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-mono font-bold text-white text-xs border border-slate-700 transition-colors"
                    >
                      + 0.5°
                    </button>
                  </div>

                  {/* AC Modes */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[
                      { id: "COOL", label: "Cool ❄" },
                      { id: "HEAT", label: "Heat ♨" },
                      { id: "ECO", label: "Eco 🌿" },
                      { id: "OFF", label: "Off ⏻" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setAcMode(m.id as any)}
                        className={`py-1 rounded text-[10px] font-mono font-bold ${
                          acMode === m.id
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting Presets */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
                    <span>Lutron Lighting Scenes</span>
                    <span className="font-mono text-[10px] text-amber-400">{lightingPreset}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: "LUXURY", label: "Luxury Amber", icon: Sun },
                      { id: "DAYLIGHT", label: "Daylight 100%", icon: Sun },
                      { id: "EVENING", label: "Twilight", icon: Moon },
                      { id: "OFF", label: "Sleep Off", icon: Moon },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setLightingPreset(p.id as any)}
                        className={`p-1.5 rounded text-[10px] font-medium text-center ${
                          lightingPreset === p.id
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Lock Actuator */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Assa Abloy BLE Smart Lock</div>
                    <div className="text-[11px] text-slate-400">
                      Current State: <span className="font-bold text-emerald-400">{activeRoom.iot.lockStatus}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleLock(activeRoom)}
                    disabled={isLocking}
                    className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-all flex items-center space-x-1.5 ${
                      activeRoom.iot.lockStatus === "LOCKED"
                        ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {isLocking ? (
                      <span>Transmitting...</span>
                    ) : activeRoom.iot.lockStatus === "LOCKED" ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Remote Unlock</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Remote Lock</span>
                      </>
                    )}
                  </button>
                </div>

                {/* DND & Makeup Room Toggles */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleDnd(activeRoom)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      activeRoom.iot.dnd
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>DND: {activeRoom.iot.dnd ? "ON" : "OFF"}</span>
                  </button>

                  <button
                    onClick={() => handleToggleMakeup(activeRoom)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      activeRoom.iot.makeupRoom
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}
                  >
                    <Brush className="w-3.5 h-3.5" />
                    <span>Makeup: {activeRoom.iot.makeupRoom ? "REQ" : "OFF"}</span>
                  </button>
                </div>
              </div>

              {/* Status Override Selector */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Operational Room Status Override
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetRoomStatus(activeRoom, "VACANT_CLEAN")}
                    className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-300 text-left transition-colors"
                  >
                    ✓ Vacant Clean
                  </button>
                  <button
                    onClick={() => handleSetRoomStatus(activeRoom, "INSPECTED")}
                    className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-300 text-left transition-colors"
                  >
                    ★ Inspected VIP
                  </button>
                  <button
                    onClick={() => handleSetRoomStatus(activeRoom, "VACANT_DIRTY")}
                    className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 text-left transition-colors"
                  >
                    🧹 Vacant Dirty
                  </button>
                  <button
                    onClick={() => handleSetRoomStatus(activeRoom, "OUT_OF_ORDER")}
                    className="px-2.5 py-1.5 rounded text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-300 text-left transition-colors"
                  >
                    ⚠ Out of Order
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  onDispatchHousekeeping(activeRoom.roomNumber);
                  setInspectorOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-colors flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Dispatch Priority Turn Task</span>
              </button>

              <button
                onClick={() => {
                  setWorkOrderModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Create Maintenance Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Order Modal */}
      {workOrderModalOpen && activeRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create CMMS Work Order (Room {activeRoom.roomNumber})</h3>
              <button onClick={() => setWorkOrderModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400">Issue Description</label>
                <input
                  type="text"
                  value={workOrderIssue}
                  onChange={(e) => setWorkOrderIssue(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setWorkOrderModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onCreateWorkOrder(activeRoom.roomNumber, workOrderIssue);
                  setWorkOrderModalOpen(false);
                  setInspectorOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Dispatch Engineer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
