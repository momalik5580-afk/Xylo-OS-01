import React, { useState, useEffect } from "react";
import {
  Building2,
  Sparkles,
  Command,
  Smartphone,
  Bell,
  Volume2,
  VolumeX,
  Search,
  ChevronDown,
  Sun,
  CloudSun,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Property, UserRole } from "../../types";
import { PROPERTIES } from "../../data/mockData";

interface HeaderProps {
  currentProperty: Property;
  onSelectProperty: (property: Property) => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenCommandPalette: () => void;
  onOpenAiBrain: () => void;
  onOpenMobilePreview: () => void;
  onOpenNotifications: () => void;
  unreadAiAlertsCount: number;
}

const ROLES: UserRole[] = [
  "General Manager",
  "Front Office Lead",
  "Executive Housekeeper",
  "Chief Engineer",
  "Revenue Director",
  "Finance Controller",
];

export const Header: React.FC<HeaderProps> = ({
  currentProperty,
  onSelectProperty,
  currentRole,
  onSelectRole,
  onOpenCommandPalette,
  onOpenAiBrain,
  onOpenMobilePreview,
  onOpenNotifications,
  unreadAiAlertsCount,
}) => {
  const [timeString, setTimeString] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState<boolean>(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none text-slate-100">
      {/* Left: Brand + Property Switcher */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-900/30">
            <span className="font-extrabold text-sm tracking-wider text-white">XY</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-white">XYLO OS</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                v.2 AI-NATIVE
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

        {/* Property Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setPropertyDropdownOpen(!propertyDropdownOpen);
              setRoleDropdownOpen(false);
            }}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[160px] truncate">{currentProperty.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {propertyDropdownOpen && (
            <div className="absolute left-0 mt-1 w-72 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Property / Complex
              </div>
              {PROPERTIES.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    onSelectProperty(prop);
                    setPropertyDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex flex-col ${
                    prop.id === currentProperty.id
                      ? "bg-slate-800 text-white font-medium"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{prop.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">{prop.totalRooms} Rms</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{prop.location}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Command Search Trigger & Telemetry */}
      <div className="hidden lg:flex items-center space-x-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs w-80 shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
          <span className="flex-1 text-left">Autonomous Command (`⌘K` or Natural query)...</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Live Hotel Environment & Time */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentProperty.weather.temp}°C</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{timeString || "12:00:00"}</span>
          </div>
        </div>
      </div>

      {/* Right: Role Switcher, Super App Modal, AI Brain Pulse, Sound & Alerts */}
      <div className="flex items-center space-x-2">
        {/* Role Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setPropertyDropdownOpen(false);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-900 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">{currentRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Operational Persona
              </div>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onSelectRole(role);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    role === currentRole
                      ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Super App Simulator Button */}
        <button
          onClick={onOpenMobilePreview}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          title="Open Guest & Staff Mobile Super App Simulator"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden xl:inline">Super App</span>
        </button>

        {/* AI Hotel Brain Trigger */}
        <button
          onClick={onOpenAiBrain}
          className="relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-rose-500/30 text-xs font-semibold text-rose-200 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
          <span className="hidden sm:inline">AI Brain</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        </button>

        {/* Notifications & Sound */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-md hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Telemetry Alerts & Events"
        >
          <Bell className="w-4 h-4" />
          {unreadAiAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadAiAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-md hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors hidden sm:block"
          title={soundEnabled ? "Mute Operational Telemetry Sounds" : "Enable Sound Effects"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
