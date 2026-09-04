import React, { useState, useEffect } from "react";
import {
  Search,
  Command,
  DoorOpen,
  Layers,
  Sparkles,
  Wrench,
  PackageCheck,
  UtensilsCrossed,
  Receipt,
  Users2,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: any) => void;
  onTriggerQuickAction: (actionType: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerQuickAction,
}) => {
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // handled in parent or toggle
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: "Go to Digital Twin (3D Floor Map)", module: "digital-twin", icon: Layers, group: "Navigation" },
    { label: "Go to Front Desk & Guest Check-In", module: "front-office", icon: DoorOpen, group: "Navigation" },
    { label: "Go to Housekeeping Turnover Board", module: "housekeeping", icon: Sparkles, group: "Navigation" },
    { label: "Go to Engineering CMMS Work Orders", module: "engineering", icon: Wrench, group: "Navigation" },
    { label: "Go to ERP Inventory & PO 3-Way Match", module: "inventory", icon: PackageCheck, group: "Navigation" },
    { label: "Go to F&B POS & Kitchen Display (KDS)", module: "fnb", icon: UtensilsCrossed, group: "Navigation" },
    { label: "Go to Finance & Night Audit", module: "finance", icon: Receipt, group: "Navigation" },
    { label: "Go to Guest 360 CRM & Preferences", module: "crm", icon: Users2, group: "Navigation" },
    { label: "Go to Temporal Distributed Sagas", module: "workflows", icon: ShieldCheck, group: "Navigation" },

    { label: "⚡ Trigger Dynamic Weekend Surge (+18%)", actionType: "SURGE_PRICING", icon: Zap, group: "Autonomous Action" },
    { label: "🧹 Rebalance Housekeeping Turn Queue", actionType: "REBALANCE_HK", icon: Zap, group: "Autonomous Action" },
    { label: "👑 Auto-Upgrade Arriving Diamond VIPs", actionType: "VIP_AUTO_UPGRADE", icon: Zap, group: "Autonomous Action" },
    { label: "🌙 Run Night Audit Pre-Check", actionType: "SIMULATE_NIGHT_AUDIT", icon: Zap, group: "Autonomous Action" },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-2">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or jump to module (e.g. 'Front desk', 'Surge', 'Twin')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.map((cmd, idx) => {
            const Icon = cmd.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (cmd.module) {
                    onNavigate(cmd.module);
                  } else if (cmd.actionType) {
                    onTriggerQuickAction(cmd.actionType);
                  }
                  onClose();
                }}
                className="p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between group text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-slate-950 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-900 border border-slate-800 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    {cmd.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                  {cmd.group}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
