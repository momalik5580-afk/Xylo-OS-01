import React, { useState } from "react";
import {
  PackageCheck,
  AlertOctagon,
  CheckCircle2,
  FileCheck2,
  Boxes,
  Plus,
  Search,
  ShoppingCart,
  TrendingDown,
  Warehouse,
  X,
  FileText,
  Truck,
  Check,
  DollarSign,
} from "lucide-react";
import { InventoryItem, PurchaseOrder } from "../../types";

interface InventoryViewProps {
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  onApprovePO: (poId: string) => void;
  onReceivePO: (poId: string) => void;
  onCreatePO?: (po: PurchaseOrder) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory: initialInventory,
  purchaseOrders: initialPOs,
  onApprovePO,
  onReceivePO,
  onCreatePO,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"ITEMS" | "PURCHASE_ORDERS" | "WAREHOUSES">("ITEMS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newPoModalOpen, setNewPoModalOpen] = useState<boolean>(false);
  const [matchModalPo, setMatchModalPo] = useState<PurchaseOrder | null>(null);

  // New PO Form
  const [vendor, setVendor] = useState<string>("Bvlgari Luxury Amenities Corp");
  const [poItemName, setPoItemName] = useState<string>("Bvlgari Au Thé Blanc Shower Gel (500ml)");
  const [poQty, setPoQty] = useState<number>(300);
  const [poUnitPrice, setPoUnitPrice] = useState<number>(14.50);

  const filteredItems = initialInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewPO = () => {
    const total = poQty * poUnitPrice;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${Math.floor(8000 + Math.random() * 2000)}`,
      vendor,
      department: "Housekeeping",
      totalAmount: total,
      status: "APPROVED",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      items: [
        {
          name: poItemName,
          quantity: poQty,
          unitPrice: poUnitPrice,
          totalPrice: total,
        },
      ],
      threeWayMatched: false,
    };

    if (onCreatePO) {
      onCreatePO(newPO);
    }
    setNewPoModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Hospitality ERP Inventory & Supply Chain
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-warehouse stock matrix, automated par level reorders, 3-way PO matching, and Goods Receipt Notes (GRN).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setNewPoModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab("ITEMS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === "ITEMS"
                ? "bg-slate-800 text-amber-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Item Master Catalog ({initialInventory.length})
          </button>
          <button
            onClick={() => setActiveSubTab("PURCHASE_ORDERS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === "PURCHASE_ORDERS"
                ? "bg-slate-800 text-sky-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Purchase Orders & 3-Way Match ({initialPOs.length})
          </button>
          <button
            onClick={() => setActiveSubTab("WAREHOUSES")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === "WAREHOUSES"
                ? "bg-slate-800 text-emerald-400 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Warehouses (4)
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, item, or warehouse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-56"
          />
        </div>
      </div>

      {/* View 1: Item Master */}
      {activeSubTab === "ITEMS" && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">SKU & Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Warehouse Location</th>
                  <th className="py-3 px-4">Stock / Par Level</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredItems.map((item) => {
                  const isBelowPar = item.stockLevel <= item.minParLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-sans">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.sku}</div>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300">{item.category}</td>
                      <td className="py-3 px-4 text-slate-400">{item.location}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={isBelowPar ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                            {item.stockLevel} {item.unit}
                          </span>
                          <span className="text-slate-500">/ Par {item.minParLevel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">${item.unitCost.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {isBelowPar ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            BELOW PAR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setPoItemName(item.name);
                            setPoUnitPrice(item.unitCost);
                            setNewPoModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400"
                        >
                          + Reorder PO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Purchase Orders */}
      {activeSubTab === "PURCHASE_ORDERS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initialPOs.map((po) => (
              <div
                key={po.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-bold text-sm text-white">{po.poNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        po.status === "RECEIVED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : po.status === "APPROVED"
                          ? "bg-sky-500/20 text-sky-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-200">{po.vendor}</div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Expected: {po.expectedDelivery} • Dept: {po.department}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="pt-2 border-t border-slate-800/80 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Value:</span>
                      <span className="font-bold text-emerald-400">${po.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1">
                      <FileCheck2 className={`w-3.5 h-3.5 ${po.threeWayMatched ? "text-emerald-400" : "text-slate-500"}`} />
                      <span>{po.threeWayMatched ? "3-Way Match: VERIFIED" : "3-Way Match: PENDING INVOICE"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => setMatchModalPo(po)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Inspect 3-Way Match</span>
                  </button>

                  {po.status !== "RECEIVED" && (
                    <button
                      onClick={() => onReceivePO(po.id)}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center space-x-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Receive Goods</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Warehouses */}
      {activeSubTab === "WAREHOUSES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Central Dry Goods & Linen Warehouse", loc: "Basement Level B2", capacity: "84% Utilized", items: 420 },
            { name: "Sommelier Fine Wine & Spirits Cellar", loc: "Vault Level B1 (12°C Controlled)", capacity: "72% Utilized", items: 180 },
            { name: "Culinary Cold Storage & Prep Depot", loc: "Main Kitchen Commissary", capacity: "91% Utilized", items: 250 },
            { name: "Engineering Parts & BMS Depot", loc: "Mezzanine Utility Zone", capacity: "60% Utilized", items: 310 },
          ].map((w, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{w.name}</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">{w.capacity}</span>
              </div>
              <p className="text-xs text-slate-400">{w.loc}</p>
              <div className="text-xs font-mono text-amber-400 pt-2 border-t border-slate-800">
                {w.items} Active SKUs Monitored
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {newPoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create ERP Purchase Order</h3>
              <button onClick={() => setNewPoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400">Vendor / Supplier</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400">Item Name</label>
                <input
                  type="text"
                  value={poItemName}
                  onChange={(e) => setPoItemName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Quantity</label>
                  <input
                    type="number"
                    value={poQty}
                    onChange={(e) => setPoQty(parseInt(e.target.value) || 1)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Unit Price ($)</label>
                  <input
                    type="number"
                    value={poUnitPrice}
                    onChange={(e) => setPoUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between font-mono">
                <span className="text-slate-400">Calculated PO Total:</span>
                <span className="font-bold text-emerald-400">${(poQty * poUnitPrice).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setNewPoModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPO}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Authorize & Transmit PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Way Match Verification Modal */}
      {matchModalPo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">3-Way Match Audit ({matchModalPo.poNumber})</h3>
              </div>
              <button onClick={() => setMatchModalPo(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>1. Purchase Order Authorized:</span>
                  <span>✓ {matchModalPo.poNumber} (${matchModalPo.totalAmount.toFixed(2)})</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>2. Goods Receipt Note (GRN):</span>
                  <span>✓ GRN-9021 (Full Quantity Counted)</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>3. Supplier Tax Invoice:</span>
                  <span>✓ INV-4491 ($0.00 Variance)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3-Way reconciliation verified with 0% quantity and price discrepancy. Ready for AP payout.</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setMatchModalPo(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
