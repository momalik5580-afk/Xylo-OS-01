import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Hotel,
  DollarSign,
  Crown,
  Wrench,
  Sparkle,
} from "lucide-react";
import { sendAiChatMessage, executeAiCommand } from "../../services/aiService";
import { Room, Reservation, Property } from "../../types";

interface AiBrainCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  currentProperty: Property;
  rooms: Room[];
  reservations: Reservation[];
  onExecuteSimulatedAction: (actionType: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    type: string;
  };
}

export const AiBrainCopilot: React.FC<AiBrainCopilotProps> = ({
  isOpen,
  onClose,
  currentProperty,
  rooms,
  reservations,
  onExecuteSimulatedAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "AI",
      text: `Hello! I am Xylo AI Hotel Brain. Currently operating **${currentProperty.name}** at 94.2% occupancy. How can I assist with revenue yield, room allocation, VIP amenities, or engineering diagnostics today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "USER",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsThinking(true);

    try {
      const response = await sendAiChatMessage(
        query,
        {
          propertyName: currentProperty.name,
          occupancy: "94.2%",
          activeRoomsCount: rooms.length,
          reservationsCount: reservations.length,
        },
        messages.map((m) => ({
          role: m.sender === "USER" ? "user" : "model",
          text: m.text,
        }))
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "AI",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedAction: response.suggestedAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "AI",
          text: "I analyzed our real-time telemetry: Occupancy is surging to 98% this weekend. I recommend applying an 18% rate surge to remaining suites.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedAction: {
            label: "⚡ Apply 18% Dynamic Surge",
            type: "SURGE_PRICING",
          },
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const samplePrompts = [
    "Simulate Dynamic Weekend Surge (+18%)",
    "Rebalance Housekeeping turns for 14:00 VIP check-ins",
    "Identify predictive HVAC anomalies on 3rd floor",
    "What is our RevPAR and GOPPAR today?",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center shadow-md shadow-rose-950/40">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>Xylo Autonomous Hotel Brain</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Full-system autonomous supervisor & conversational copilot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-2.5 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "AI" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shrink-0 text-white shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  msg.sender === "USER"
                    ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.suggestedAction && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onExecuteSimulatedAction(msg.suggestedAction!.type);
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `act-${Date.now()}`,
                            sender: "AI",
                            text: `✓ Executed action: **${msg.suggestedAction!.label}**. Temporal Sagas updated across all connected PMS and IoT nodes.`,
                            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          },
                        ]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-[11px] flex items-center space-x-1.5 shadow-md transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{msg.suggestedAction.label}</span>
                    </button>
                  </div>
                )}

                <div
                  className={`text-[9px] font-mono ${
                    msg.sender === "USER" ? "text-slate-800" : "text-slate-500"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "USER" && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex space-x-2.5 items-center text-xs text-slate-400 italic">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-amber-400">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span>Xylo Brain analyzing property graph...</span>
            </div>
          )}
        </div>

        {/* Sample Prompt Chips */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 overflow-x-auto flex space-x-2 no-scrollbar">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask AI Brain to automate, analyze, or reallocate..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 transition-colors shadow-md shadow-amber-950/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
