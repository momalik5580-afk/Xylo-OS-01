import React from "react";
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: "notif-1",
      title: "Dynamic Surge Price Activated",
      time: "2 mins ago",
      desc: "Occupancy crossed 94.0%. Rate increased by +18% across Direct CRS and OTAs.",
      type: "AI_ACTION",
    },
    {
      id: "notif-2",
      title: "VIP Elena Rostova Checked In",
      time: "14 mins ago",
      desc: "Allocated Penthouse 801. Welcome amenity Champagne & Caviar dispatched.",
      type: "FRONT_OFFICE",
    },
    {
      id: "notif-3",
      title: "Predictive IoT Anomaly Detected",
      time: "32 mins ago",
      desc: "Room 304 HVAC compressor delta-T abnormal. Work order CMMS-9021 auto-dispatched.",
      type: "CMMS",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">System Events & Telemetry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{n.title}</span>
                <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
};
