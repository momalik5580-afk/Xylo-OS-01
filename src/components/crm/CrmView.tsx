import React, { useState } from "react";
import {
  Users2,
  Crown,
  Heart,
  Search,
  Sparkles,
  DollarSign,
  Coffee,
  BedDouble,
  ShieldCheck,
  Calendar,
  Gift,
  Plus,
  X,
  Award,
  Send,
  MessageSquare,
  Wine,
} from "lucide-react";
import { GuestProfile } from "../../types";

interface CrmViewProps {
  guests: GuestProfile[];
}

export const CrmView: React.FC<CrmViewProps> = ({ guests: initialGuests }) => {
  const [guests, setGuests] = useState<GuestProfile[]>(initialGuests);
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile>(initialGuests[0]);
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [pointsModalOpen, setPointsModalOpen] = useState<boolean>(false);
  const [pointsAmount, setPointsAmount] = useState<number>(5000);
  const [prefModalOpen, setPrefModalOpen] = useState<boolean>(false);
  const [newPrefKey, setNewPrefKey] = useState<string>("Favorite Champagne");
  const [newPrefValue, setNewPrefValue] = useState<string>("Dom Pérignon Vintage 2013, chilled to 7°C");
  const [conciergeNote, setConciergeNote] = useState<string>("");
  const [noteSent, setNoteSent] = useState<boolean>(false);

  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.vipTier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAwardPoints = () => {
    const updated: GuestProfile = {
      ...selectedGuest,
      loyaltyPoints: (selectedGuest.loyaltyPoints || 12000) + pointsAmount,
    };
    setSelectedGuest(updated);
    setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setPointsModalOpen(false);
  };

  const handleAddPreference = () => {
    if (!newPrefKey || !newPrefValue) return;
    const updated: GuestProfile = {
      ...selectedGuest,
      preferences: {
        ...selectedGuest.preferences,
        [newPrefKey]: newPrefValue,
      },
    };
    setSelectedGuest(updated);
    setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setPrefModalOpen(false);
    setNewPrefKey("");
    setNewPrefValue("");
  };

  const handleSendConciergeNote = () => {
    if (!conciergeNote) return;
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setConciergeNote("");
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users2 className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Guest 360 CRM & Hyper-Personalization Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lifetime value analysis, AI experiential profile synthesis, dietary and climate preference memory.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search VIPs, loyalty tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Main Split: Guest List + 360 Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: VIP Guest Directory */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm space-y-1">
          <div className="p-3.5 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase font-mono">
            High-Value Profiles ({filteredGuests.length})
          </div>
          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[600px]">
            {filteredGuests.map((guest) => {
              const isSelected = selectedGuest.id === guest.id;
              return (
                <div
                  key={guest.id}
                  onClick={() => setSelectedGuest(guest)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-slate-800/80 border-l-2 border-amber-500"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center space-x-1.5">
                      <span>{guest.name}</span>
                      {guest.vipTier !== "None" && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {guest.vipTier}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>LTV: ${guest.lifetimeSpend.toLocaleString()}</span>
                    <span>{guest.stayHistoryCount} Stays</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Comprehensive 360 Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/20 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xl font-mono">
                  {selectedGuest.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">{selectedGuest.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {selectedGuest.vipTier} Tier
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {selectedGuest.email} • {selectedGuest.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPointsModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Award Points</span>
                </button>
                <button
                  onClick={() => setPrefModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Preference</span>
                </button>
              </div>
            </div>

            {/* Financial & Stay Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">Total Lifetime Spend</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  ${selectedGuest.lifetimeSpend.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">Total Completed Stays</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {selectedGuest.stayHistoryCount} Visits
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400">Loyalty Points Balance</div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                  {(selectedGuest.loyaltyPoints || 18500).toLocaleString()} pts
                </div>
              </div>
            </div>
          </div>

          {/* Hyper-Personalized Profile Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preferences */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase font-mono">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Guest Memory & Preferences</span>
              </div>
              <div className="space-y-2 text-xs">
                {Object.entries(selectedGuest.preferences || {}).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400 capitalize font-mono text-[11px]">{key}:</span>
                    <span className="font-semibold text-slate-200 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Concierge VIP Direct Messenger */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase font-mono">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>VIP Butler Concierge Dispatch</span>
                </div>
                <p className="text-xs text-slate-400">
                  Transmit an encrypted direct welcome or personalized note to the guest mobile app.
                </p>
                <textarea
                  rows={3}
                  value={conciergeNote}
                  onChange={(e) => setConciergeNote(e.target.value)}
                  placeholder={`e.g. Welcome back ${selectedGuest.name}! Your favorite champagne and pillows are prepared.`}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {noteSent ? "✓ Pushed to Guest App" : ""}
                </span>
                <button
                  onClick={handleSendConciergeNote}
                  disabled={!conciergeNote}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Guest App</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Award Points Modal */}
      {pointsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Award Loyalty Points</h3>
              <button onClick={() => setPointsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">Awarding bonus points to <strong>{selectedGuest.name}</strong></p>
              <div>
                <label className="text-[10px] font-mono text-slate-400">Points Amount</label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPointsModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardPoints}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Confirm Points Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Preference Modal */}
      {prefModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Guest Preference</h3>
              <button onClick={() => setPrefModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400">Preference Category / Key</label>
                <input
                  type="text"
                  value={newPrefKey}
                  onChange={(e) => setNewPrefKey(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  placeholder="e.g. Favorite Cocktail, Pillow Type"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">Detail / Requirement</label>
                <input
                  type="text"
                  value={newPrefValue}
                  onChange={(e) => setNewPrefValue(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  placeholder="e.g. Extra goose down pillows, high floor only"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPrefModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPreference}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Save Preference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
