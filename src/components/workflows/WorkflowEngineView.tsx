import React, { useState } from "react";
import {
  ShieldCheck,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  Terminal,
  Activity,
  Layers,
  ChevronRight,
  RotateCw,
  Undo2,
} from "lucide-react";
import { TemporalWorkflowInstance } from "../../types";
import { generateWorkflowWithGemini } from "../../services/aiService";

interface WorkflowEngineViewProps {
  workflows: TemporalWorkflowInstance[];
  onTriggerNewWorkflow: (workflow: TemporalWorkflowInstance) => void;
}

export const WorkflowEngineView: React.FC<WorkflowEngineViewProps> = ({
  workflows: initialWorkflows,
  onTriggerNewWorkflow,
}) => {
  const [workflowsList, setWorkflowsList] = useState<TemporalWorkflowInstance[]>(initialWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<TemporalWorkflowInstance>(initialWorkflows[0]);
  const [promptInput, setPromptInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleAiBuildWorkflow = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateWorkflowWithGemini(promptInput);
      const newWf: TemporalWorkflowInstance = {
        id: `wf-${Date.now()}`,
        name: generated.name || "Custom AI Temporal Saga",
        workflowType: "VIP_ARRIVAL_SAGA",
        status: "RUNNING",
        startedAt: new Date().toISOString().slice(11, 19),
        currentStep: generated.steps ? generated.steps[0]?.name : "Initialize",
        progressPercent: 20,
        slaMinutes: generated.slaMinutes || 30,
        steps: (generated.steps || []).map((s: any, idx: number) => ({
          id: s.id || `s-${idx}`,
          name: s.name || `Step ${idx + 1}`,
          actor: s.actor || "Service Engine",
          status: idx === 0 ? "IN_PROGRESS" : "WAITING",
          durationMs: s.durationMs || 500,
        })),
        logs: [
          `[${new Date().toLocaleTimeString()}] Temporal Saga initialized by Gemini 2.5 Flash`,
          `[${new Date().toLocaleTimeString()}] Executing step: ${generated.steps ? generated.steps[0]?.name : "Start"}`,
        ],
      };
      onTriggerNewWorkflow(newWf);
      setWorkflowsList((prev) => [newWf, ...prev]);
      setSelectedWorkflow(newWf);
      setPromptInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdvanceStep = () => {
    const updated: TemporalWorkflowInstance = {
      ...selectedWorkflow,
      progressPercent: Math.min(100, selectedWorkflow.progressPercent + 25),
      status: selectedWorkflow.progressPercent >= 75 ? "COMPLETED" : "RUNNING",
      logs: [
        ...selectedWorkflow.logs,
        `[${new Date().toLocaleTimeString()}] Step successfully confirmed by Temporal Activity Worker (Status: SUCCESS)`,
      ],
    };
    setSelectedWorkflow(updated);
    setWorkflowsList((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleSimulateRollback = () => {
    const updated: TemporalWorkflowInstance = {
      ...selectedWorkflow,
      status: "COMPENSATED",
      logs: [
        ...selectedWorkflow.logs,
        `[${new Date().toLocaleTimeString()}] ⚠ Activity Exception detected: Triggering distributed SAGA compensation handler`,
        `[${new Date().toLocaleTimeString()}] Releasing lock, refunding pre-auth charge, and restoring state cleanly (0 data-loss)`,
      ],
    };
    setSelectedWorkflow(updated);
    setWorkflowsList((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Temporal Saga Distributed Workflow Orchestrator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Resilient, fault-tolerant distributed transactions with automatic compensation logic and zero data-loss guarantees.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            TEMPORAL CLUSTER: ACTIVE (100% HEALTH)
          </span>
        </div>
      </div>

      {/* AI Temporal Workflow Generator Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200 font-mono">
            Gemini-Powered Natural Language Saga Generator
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          Describe any complex multi-department hospitality operation (e.g. "When a VIP suite has AC failure, comp dinner at Azure Grill, reallocate to Penthouse, and credit 10,000 loyalty points"):
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your autonomous workflow prompt..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiBuildWorkflow()}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            onClick={handleAiBuildWorkflow}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Compiling Saga..." : "Synthesize Workflow"}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Active Workflows & Saga Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Active Saga Registry */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm space-y-1">
          <div className="p-3.5 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase font-mono">
            Active Temporal Sagas ({workflowsList.length})
          </div>
          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[600px]">
            {workflowsList.map((wf) => {
              const isSelected = selectedWorkflow?.id === wf.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`p-3.5 cursor-pointer transition-colors space-y-2 ${
                    isSelected
                      ? "bg-slate-800/80 border-l-2 border-purple-500"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate max-w-[180px]">
                      {wf.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-purple-400">
                      {wf.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${wf.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate">{wf.currentStep}</span>
                    <span className="text-emerald-400 font-bold">{wf.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Selected Workflow Trace & Execution Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-black text-white">{selectedWorkflow.name}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300">
                    {selectedWorkflow.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  Saga ID: {selectedWorkflow.id} • Started {selectedWorkflow.startedAt}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAdvanceStep}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Advance Step</span>
                </button>
                <button
                  onClick={handleSimulateRollback}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Simulate Rollback</span>
                </button>
              </div>
            </div>

            {/* Visual State Machine Steps */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                <span>Distributed Saga Step Pipeline</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Trigger Event</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Lock Inventory</span>
                </div>

                <div className={`p-2.5 rounded-lg border font-mono font-bold flex items-center space-x-1.5 ${
                  selectedWorkflow.progressPercent >= 50
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-purple-500/20 border-purple-500/40 text-purple-300 animate-pulse"
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>3. Dispatch Tasks</span>
                </div>

                <div className={`p-2.5 rounded-lg border font-mono ${
                  selectedWorkflow.progressPercent >= 100
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}>
                  <span>4. Commit Folio</span>
                </div>
              </div>
            </div>

            {/* Execution Audit Trail Logs */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Temporal Worker Event Log</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                {selectedWorkflow.logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
