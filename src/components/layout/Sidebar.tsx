import React from "react";
import {
  Activity,
  Layers,
  DoorOpen,
  CalendarCheck2,
  Building2,
  Sparkles,
  Wrench,
  PackageCheck,
  UtensilsCrossed,
  Receipt,
  Users2,
  GitMerge,
  Cpu,
  Radio,
  Server,
  Zap,
} from "lucide-react";

export type NavModule =
  | "command-center"
  | "digital-twin"
  | "front-office"
  | "reservations"
  | "group-blocks"
  | "allotments"
  | "housekeeping"
  | "engineering"
  | "inventory"
  | "fnb"
  | "finance"
  | "crm"
  | "workflows"
  | "ai-brain";

export interface BadgeCounts {
  frontOffice?: number;
  housekeeping?: number;
  engineering?: number;
  workflows?: number;
  aiActions?: number;
}

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (mod: NavModule) => void;
  badgeCounts?: BadgeCounts;
  onOpenAiBrain?: () => void;
}

interface NavItem {
  id: NavModule;
  label: string;
  category: "CORE ENGINE" | "OPERATIONS" | "ERP & SUPPLY" | "AUTONOMOUS AI";
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  hotkey?: string;
}

const NAV_ITEMS: NavItem[] = [
  // CORE ENGINE
  {
    id: "command-center",
    label: "Command Center",
    category: "CORE ENGINE",
    icon: Activity,
    hotkey: "1",
  },
  {
    id: "digital-twin",
    label: "Digital Twin 3D/2D",
    category: "CORE ENGINE",
    icon: Layers,
    hotkey: "2",
  },
  {
    id: "workflows",
    label: "Temporal Workflows",
    category: "CORE ENGINE",
    icon: GitMerge,
    badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    hotkey: "3",
  },

  // OPERATIONS
  {
    id: "front-office",
    label: "Front Office & Stays",
    category: "OPERATIONS",
    icon: DoorOpen,
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    hotkey: "4",
  },
  {
    id: "reservations",
    label: "CRS Tape Chart & Direct",
    category: "OPERATIONS",
    icon: CalendarCheck2,
    hotkey: "5",
  },
  {
    id: "group-blocks",
    label: "Group Blocks (MICE)",
    category: "OPERATIONS",
    icon: Building2,
    badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    hotkey: "G",
  },
  {
    id: "allotments",
    label: "Allotments & Series",
    category: "OPERATIONS",
    icon: Building2,
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    hotkey: "A",
  },
  {
    id: "housekeeping",
    label: "Housekeeping & Linen",
    category: "OPERATIONS",
    icon: Sparkles,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    hotkey: "6",
  },
  {
    id: "engineering",
    label: "Engineering CMMS",
    category: "OPERATIONS",
    icon: Wrench,
    badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    hotkey: "7",
  },

  // ERP & SUPPLY
  {
    id: "inventory",
    label: "Inventory & Supply ERP",
    category: "ERP & SUPPLY",
    icon: PackageCheck,
    hotkey: "8",
  },
  {
    id: "fnb",
    label: "F&B POS & KDS",
    category: "ERP & SUPPLY",
    icon: UtensilsCrossed,
    hotkey: "9",
  },
  {
    id: "finance",
    label: "Finance & Night Audit",
    category: "ERP & SUPPLY",
    icon: Receipt,
  },
  {
    id: "crm",
    label: "Guest 360 & Loyalty",
    category: "ERP & SUPPLY",
    icon: Users2,
  },

  // AUTONOMOUS AI
  {
    id: "ai-brain",
    label: "AI Hotel Brain",
    category: "AUTONOMOUS AI",
    icon: Cpu,
    badgeColor: "bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-200 border border-rose-500/40",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  badgeCounts,
  onOpenAiBrain,
}) => {
  const categories = ["CORE ENGINE", "OPERATIONS", "ERP & SUPPLY", "AUTONOMOUS AI"] as const;

  const getBadge = (id: NavModule) => {
    switch (id) {
      case "front-office":
        return badgeCounts?.frontOffice;
      case "housekeeping":
        return badgeCounts?.housekeeping;
      case "engineering":
        return badgeCounts?.engineering;
      case "workflows":
        return badgeCounts?.workflows;
      case "ai-brain":
        return badgeCounts?.aiActions;
      default:
        return undefined;
    }
  };

  return (
    <aside className="w-60 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between select-none h-full text-slate-300 overflow-y-auto">
      <div className="py-3 px-2 space-y-4">
        {categories.map((category) => {
          const items = NAV_ITEMS.filter((item) => item.category === category);
          return (
            <div key={category} className="space-y-0.5">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 font-mono">
                {category}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                const count = getBadge(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "ai-brain" && onOpenAiBrain) {
                        onOpenAiBrain();
                      } else {
                        onSelectModule(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-amber-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {count !== undefined && count > 0 && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            item.badgeColor || "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      {item.hotkey && (
                        <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                          {item.hotkey}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Distributed System Telemetry */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px]">KAFKA EVENT MESH</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">1,240 msg/s</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Server className="w-3 h-3 text-indigo-400" />
            <span className="font-mono text-[10px]">TEMPORAL SAGAS</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 font-semibold">0 Dead Letters</span>
        </div>

        <div className="pt-1 flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800/40">
          <span>REGION: AWS-EU-WEST-1</span>
          <span>LATENCY: 1.2ms</span>
        </div>
      </div>
    </aside>
  );
};
