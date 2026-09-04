import React, { useState } from "react";
import {
  Smartphone,
  Key,
  Thermometer,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  CreditCard,
  X,
  UserCheck,
  Wrench,
  Brush,
} from "lucide-react";
import { Room } from "../../types";

interface MobileDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
}

export const MobileDeviceModal: React.FC<MobileDeviceModalProps> = ({
  isOpen,
  onClose,
  rooms,
}) => {
  const [appMode, setAppMode] = useState<"GUEST" | "STAFF">("GUEST");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [roomTemp, setRoomTemp] = useState<number>(21.5);
  const [lightsOn, setLightsOn] = useState<boolean>(true);
  const [orderSent, setOrderSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUnlockDoor = () => {
    setIsUnlocked(true);
    setTimeout(() => {
      setIsUnlocked(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative flex flex-col items-center space-y-4">
        {/* Top bar controls */}
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setAppMode("GUEST")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                appMode === "GUEST"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Guest Super App
            </button>
            <button
              onClick={() => setAppMode("STAFF")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                appMode === "STAFF"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Staff Companion App
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic iPhone Simulator Frame */}
        <div className="w-[340px] h-[680px] rounded-[48px] bg-slate-950 border-4 border-slate-700 shadow-2xl p-3.5 flex flex-col justify-between relative overflow-hidden ring-1 ring-slate-800">
          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-20 flex items-center justify-between px-3">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full rounded-[38px] bg-slate-900 text-slate-100 pt-9 pb-3 px-4 flex flex-col justify-between overflow-y-auto font-sans">
            {appMode === "GUEST" ? (
              <div className="space-y-4">
                {/* Guest Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">
                      Xylo Guest Experience
                    </span>
                    <h3 className="text-sm font-bold text-white">Welcome, Mr. Vance</h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Room 801
                  </span>
                </div>

                {/* Digital Key Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 shadow-lg text-white space-y-3 text-center">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-amber-100">
                    NFC Digital Room Key
                  </div>
                  <div className="text-xl font-black font-mono">PRESIDENTIAL SUITE 801</div>

                  <button
                    onClick={handleUnlockDoor}
                    className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    {isUnlocked ? (
                      <>
                        <Unlock className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">Door Unlocked ✓</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 text-amber-600" />
                        <span>Hold Near Door Sensor</span>
                      </>
                    )}
                  </button>
                </div>

                {/* In-Room IoT Controls */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                    Suite Environmental Controls
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">AC Climate Target</span>
                    <div className="flex items-center space-x-2 font-mono">
                      <button
                        onClick={() => setRoomTemp((t) => Math.round((t - 0.5) * 10) / 10)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-amber-400">{roomTemp}°C</span>
                      <button
                        onClick={() => setRoomTemp((t) => Math.round((t + 0.5) * 10) / 10)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                    <span className="text-slate-300">Architectural Lighting</span>
                    <button
                      onClick={() => setLightsOn(!lightsOn)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-colors ${
                        lightsOn
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {lightsOn ? "EVENING LOUNGE" : "LIGHTS OFF"}
                    </button>
                  </div>
                </div>

                {/* Room Service 1-Tap */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                      In-Room Dining
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">25m delivery</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">Wagyu Tenderloin & Truffle</div>
                      <div className="text-[10px] text-slate-400 font-mono">$185.00</div>
                    </div>
                    <button
                      onClick={() => setOrderSent(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px]"
                    >
                      {orderSent ? "Ordered ✓" : "Order"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Staff Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                      Xylo Staff Companion
                    </span>
                    <h3 className="text-sm font-bold text-white">Elena Rostova (Floor 8)</h3>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Task Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">Room 802 Turn</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      VIP ARRIVAL 14:00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Turnover for arriving Diamond Member. Restock Bvlgari bath line and chilled San Pellegrino.
                  </p>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">Estimated: 30 mins</span>
                    <button
                      onClick={() => alert("Marked Room 802 turn completed on PMS!")}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                    >
                      Complete Turn ✓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Home Indicator */}
            <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto self-center mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
