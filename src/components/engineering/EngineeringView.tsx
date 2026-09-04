import React, { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Plus,
  Zap,
  Activity,
  ShieldAlert,
  Search,
  Filter,
  X,
} from "lucide-react";
import { WorkOrder } from "../../types";

interface EngineeringViewProps {
  workOrders: WorkOrder[];
  onResolveWorkOrder: (orderId: string) => void;
  onCreateWorkOrder: (order: Partial<WorkOrder>) => void;
}

export const EngineeringView: React.FC<EngineeringViewProps> = ({
  workOrders,
  onResolveWorkOrder,
  onCreateWorkOrder,
}) => {
  const [newOrderModalOpen, setNewOrderModalOpen] = useState<boolean>(false);
  const [location, setLocation] = useState<string>("Room 304");
  const [category, setCategory] = useState<any>("HVAC");
  const [priority, setPriority] = useState<any>("HIGH");
  const [description, setDescription] = useState<string>("");
  const [assignedEngineer, setAssignedEngineer] = useState<string>("David Keller (Lead HVAC)");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateWorkOrder({
      asset: `${category} Unit - ${location}`,
      location,
      category,
      priority,
      status: "OPEN",
      reportedBy: "Engineering Console",
      assignedEngineer,
      reportedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      slaMinutes: priority === "EMERGENCY" ? 30 : 60,
      description: description || "Standard diagnostic work order",
      iotTriggered: false,
    });
    setNewOrderModalOpen(false);
    setDescription("");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Engineering & CMMS Asset Maintenance
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive IoT failure detection, SLA countdown clocks, automated spare parts requisition, and technician routing.
          </p>
        </div>

        <button
          onClick={() => setNewOrderModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-950/40 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* IoT Predictive Alarm Strip */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-300 flex items-center space-x-2">
              <span>ACTIVE IOT ANOMALY: Room 304 Chiller Delta-T</span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-rose-500 text-slate-950 font-bold rounded">
                SLA: 18m Left
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Automated isolation saga active. Room 304 locked from CRS inventory; parts reserved in Engineering Depot.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-400">Assigned: David Keller</span>
        </div>
      </div>

      {/* CMMS Work Orders Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Active Maintenance Work Orders ({workOrders.length})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticket & Asset</th>
                <th className="py-3 px-4">Location & Category</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Assigned Engineer</th>
                <th className="py-3 px-4">Triggered By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{wo.asset}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{wo.id} • {wo.description}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-slate-200">{wo.location}</div>
                    <div className="text-[10px] text-amber-400">{wo.category}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {wo.priority === "EMERGENCY" ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                        EMERGENCY ({wo.slaMinutes}m)
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {wo.priority} ({wo.slaMinutes}m)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">{wo.assignedEngineer}</td>
                  <td className="py-3 px-4 text-[11px]">
                    {wo.iotTriggered ? (
                      <span className="text-sky-400 font-mono flex items-center space-x-1">
                        <Radio className="w-3 h-3" />
                        <span>IoT Sensor AI</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">{wo.reportedBy}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {wo.status === "RESOLVED" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        RESOLVED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {wo.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {wo.status !== "RESOLVED" && (
                      <button
                        onClick={() => onResolveWorkOrder(wo.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors"
                      >
                        Resolve ✓
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Work Order Modal */}
      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Create CMMS Work Order</h3>
              </div>
              <button
                onClick={() => setNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 504"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="HVAC">HVAC / Climate</option>
                    <option value="Smart Lock">Smart Lock BLE</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Elevator">Elevator Shaft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none font-mono"
                  >
                    <option value="EMERGENCY">EMERGENCY (30m SLA)</option>
                    <option value="HIGH">HIGH (45m SLA)</option>
                    <option value="MEDIUM">MEDIUM (90m SLA)</option>
                    <option value="ROUTINE">ROUTINE (240m SLA)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-400 text-[10px] font-mono">Assigned Engineer</label>
                  <select
                    value={assignedEngineer}
                    onChange={(e) => setAssignedEngineer(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="David Keller (Lead HVAC)">David Keller (Lead HVAC)</option>
                    <option value="Tariq Mansoor (Smart Locks)">Tariq Mansoor (Smart Locks)</option>
                    <option value="Marcus Vance (Plumbing)">Marcus Vance (Plumbing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-400 text-[10px] font-mono">Issue Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail symptoms, error code, or telemetry logs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
