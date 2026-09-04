import React, { useState } from "react";
import {
  UtensilsCrossed,
  ChefHat,
  Clock,
  CheckCircle2,
  Bell,
  Sparkles,
  Flame,
  Wine,
  Plus,
  Search,
  DollarSign,
  Coffee,
  Sandwich,
  Pizza,
  X,
  Layers,
} from "lucide-react";
import { FnbTicket } from "../../types";

interface FnbPosViewProps {
  tickets: FnbTicket[];
  onUpdateTicketStatus: (ticketId: string, status: any) => void;
  onNewOrder: (ticket: FnbTicket) => void;
}

interface MenuItem {
  id: string;
  name: string;
  category: "Starters" | "Mains" | "Beverages & Wine" | "Desserts";
  price: number;
  outlet: string;
  prepTimeMinutes: number;
}

const MENU_CATALOG: MenuItem[] = [
  { id: "m-1", name: "Royal Osetra Caviar & Blinis", category: "Starters", price: 140, outlet: "Azure Coastal Grill", prepTimeMinutes: 8 },
  { id: "m-2", name: "Hokkaido Scallop Carpaccio", category: "Starters", price: 38, outlet: "Azure Coastal Grill", prepTimeMinutes: 10 },
  { id: "m-3", name: "Wagyu A5 Striploin (200g)", category: "Mains", price: 195, outlet: "Azure Coastal Grill", prepTimeMinutes: 20 },
  { id: "m-4", name: "Butter-Poached Maine Lobster", category: "Mains", price: 110, outlet: "Azure Coastal Grill", prepTimeMinutes: 18 },
  { id: "m-5", name: "Wild Black Truffle Tagliolini", category: "Mains", price: 62, outlet: "In-Room Dining", prepTimeMinutes: 15 },
  { id: "m-6", name: "Artisan Wagyu Smash Burger", category: "Mains", price: 42, outlet: "In-Room Dining", prepTimeMinutes: 14 },
  { id: "m-7", name: "Dom Pérignon Vintage 2013 (Bottle)", category: "Beverages & Wine", price: 480, outlet: "Skyline Observatory Bar", prepTimeMinutes: 5 },
  { id: "m-8", name: "Smoked Rosemary Old Fashioned", category: "Beverages & Wine", price: 28, outlet: "Skyline Observatory Bar", prepTimeMinutes: 4 },
  { id: "m-9", name: "Kyoto Matcha Soufflé", category: "Desserts", price: 26, outlet: "Azure Coastal Grill", prepTimeMinutes: 15 },
  { id: "m-10", name: "Grand Cru Chocolate Fondant", category: "Desserts", price: 24, outlet: "In-Room Dining", prepTimeMinutes: 12 },
];

export const FnbPosView: React.FC<FnbPosViewProps> = ({
  tickets,
  onUpdateTicketStatus,
  onNewOrder,
}) => {
  const [activeView, setActiveView] = useState<"KDS" | "NEW_ORDER" | "TABLE_MAP">("KDS");
  const [selectedOutlet, setSelectedOutlet] = useState<string>("ALL");
  const [menuCategory, setMenuCategory] = useState<string>("ALL");
  const [searchMenu, setSearchMenu] = useState<string>("");

  // New Order Cart State
  const [orderOutlet, setOrderOutlet] = useState<"Azure Coastal Grill" | "Skyline Observatory Bar" | "In-Room Dining" | "Lobby Lounge">("Azure Coastal Grill");
  const [orderTableOrRoom, setOrderTableOrRoom] = useState<string>("Table 04");
  const [orderServer, setOrderServer] = useState<string>("Chef Marc V.");
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; notes: string }[]>([]);

  const filteredTickets = tickets.filter(
    (t) => selectedOutlet === "ALL" || t.outlet === selectedOutlet
  );

  const filteredMenuItems = MENU_CATALOG.filter((item) => {
    const matchesCat = menuCategory === "ALL" || item.category === menuCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchMenu.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1, notes: "" }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const calculateSubtotal = () =>
    cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    const subtotal = calculateSubtotal();
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = subtotal + tax;

    const newTicket: FnbTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: `KDS-${Math.floor(1000 + Math.random() * 9000)}`,
      outlet: orderOutlet,
      tableOrRoom: orderTableOrRoom,
      server: orderServer,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      items: cart.map((c) => ({
        name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
        specialNotes: c.notes || undefined,
        status: "PREPARING",
      })),
      subtotal,
      tax,
      total,
      status: "IN_KITCHEN",
    };

    onNewOrder(newTicket);
    setCart([]);
    setActiveView("KDS");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Food & Beverage POS & Kitchen Display System (KDS)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-outlet order expediting, direct room folio charging, table maps, and recipe costing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView("KDS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeView === "KDS"
                ? "bg-slate-800 text-amber-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Kitchen Display
          </button>
          <button
            onClick={() => setActiveView("NEW_ORDER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
              activeView === "NEW_ORDER"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New POS Order</span>
          </button>
          <button
            onClick={() => setActiveView("TABLE_MAP")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeView === "TABLE_MAP"
                ? "bg-slate-800 text-indigo-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Table Floor Plan
          </button>
        </div>
      </div>

      {/* VIEW 1: KITCHEN DISPLAY SYSTEM */}
      {activeView === "KDS" && (
        <div className="space-y-4">
          {/* Outlet Filter Tabs */}
          <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 w-fit">
            {["ALL", "Azure Coastal Grill", "In-Room Dining", "Skyline Observatory Bar"].map((out) => (
              <button
                key={out}
                onClick={() => setSelectedOutlet(out)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedOutlet === out
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {out === "ALL" ? "All Outlets" : out}
              </button>
            ))}
          </div>

          {/* KDS Active Tickets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => {
              const isReady = ticket.status === "READY_EXPEDITE";
              const isDelivered = ticket.status === "DELIVERED" || ticket.status === "PAID";

              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl border p-4 space-y-3 shadow-md flex flex-col justify-between ${
                    isReady
                      ? "bg-slate-900/90 border-emerald-500/50 shadow-emerald-950/20"
                      : isDelivered
                      ? "bg-slate-950/60 border-slate-800/80 opacity-75"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {ticket.ticketNumber}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              ticket.status === "IN_KITCHEN"
                                ? "bg-amber-500/20 text-amber-300"
                                : ticket.status === "READY_EXPEDITE"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <div className="text-xs text-amber-400 font-semibold font-mono mt-0.5">
                          {ticket.tableOrRoom}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 justify-end">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{ticket.timestamp}</span>
                        </span>
                        <div className="text-[11px] text-slate-300 font-medium">{ticket.outlet}</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 divide-y divide-slate-800/40 text-xs">
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                              {item.quantity}×
                            </span>
                            <span className="text-slate-200 font-medium">{item.name}</span>
                          </div>
                          <span className="text-slate-400 font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Server */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">Server: {ticket.server}</span>
                      <span className="font-mono font-bold text-emerald-400">${ticket.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center space-x-2">
                    {ticket.status === "IN_KITCHEN" && (
                      <button
                        onClick={() => onUpdateTicketStatus(ticket.id, "READY_EXPEDITE")}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Mark Order Ready</span>
                      </button>
                    )}
                    {ticket.status === "READY_EXPEDITE" && (
                      <button
                        onClick={() => onUpdateTicketStatus(ticket.id, "DELIVERED")}
                        className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Deliver & Post to Folio</span>
                      </button>
                    )}
                    {ticket.status === "DELIVERED" && (
                      <div className="w-full py-1 rounded bg-slate-800 text-center text-slate-400 text-[11px] font-mono">
                        ✓ Billed to Folio / Settled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: NEW POS ORDER CREATOR */}
      {activeView === "NEW_ORDER" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Selection Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dining menu, caviar, steaks, cocktails..."
                  value={searchMenu}
                  onChange={(e) => setSearchMenu(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl">
                {["ALL", "Starters", "Mains", "Beverages & Wine", "Desserts"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMenuCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      menuCategory === cat
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group shadow-sm hover:shadow-amber-950/20"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <span className="font-mono">{item.category}</span>
                      <span>•</span>
                      <span>⏱ {item.prepTimeMinutes}m prep</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      ${item.price}
                    </span>
                    <button className="p-1 rounded-md bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 ml-2">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart & Billing Checkout Panel */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Active Order Ticket</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{cart.length} items</span>
              </div>

              {/* Outlet & Destination Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Outlet</label>
                  <select
                    value={orderOutlet}
                    onChange={(e) => setOrderOutlet(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="Azure Coastal Grill">Azure Coastal Grill</option>
                    <option value="In-Room Dining">In-Room Dining</option>
                    <option value="Skyline Observatory Bar">Skyline Observatory Bar</option>
                    <option value="Lobby Lounge">Lobby Lounge</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400">Table / Suite</label>
                  <input
                    type="text"
                    value={orderTableOrRoom}
                    onChange={(e) => setOrderTableOrRoom(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                    placeholder="e.g. Room 801 or Table 04"
                  />
                </div>
              </div>

              {/* Cart List */}
              <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-800/40">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Click items from menu to add to ticket.
                  </div>
                ) : (
                  cart.map((c) => (
                    <div key={c.item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-slate-200">{c.item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {c.quantity} × ${c.item.price}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-400">
                          ${(c.quantity * c.item.price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(c.item.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subtotals & Submit */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT & Service (10%)</span>
                  <span className="font-mono">${(calculateSubtotal() * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                  <span>Total Bill</span>
                  <span className="font-mono text-amber-400">
                    ${(calculateSubtotal() * 1.1).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={cart.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/40"
              >
                <ChefHat className="w-4 h-4 text-slate-950" />
                <span>Send Ticket to Kitchen & Bill Folio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TABLE FLOOR PLAN */}
      {activeView === "TABLE_MAP" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Azure Coastal Grill Table Map</h3>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span><span>Occupied (8)</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span>Reserved (3)</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span><span>Available (4)</span></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((tableNum) => {
              const isOccupied = tableNum % 2 === 0;
              return (
                <div
                  key={tableNum}
                  className={`p-4 rounded-xl border flex flex-col justify-between h-28 transition-all ${
                    isOccupied
                      ? "bg-slate-950 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">Table {tableNum.toString().padStart(2, "0")}</span>
                    <span className={`w-2 h-2 rounded-full ${isOccupied ? "bg-emerald-400" : "bg-slate-600"}`}></span>
                  </div>

                  <div className="text-[11px] font-mono">
                    {isOccupied ? (
                      <div>
                        <div className="text-white font-semibold">Elena Rostova</div>
                        <div className="text-[10px] text-slate-400">4 Guests • $380 Folio</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">Vacant & Clean</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
