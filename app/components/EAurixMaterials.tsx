import { useState } from "react";
import { Plus, Minus, ShoppingCart, Package, ChevronDown, ChevronUp, Sparkles, Tag } from "lucide-react";
import { Material, materialsByCategory, categoryMaterialLabels } from "../data/materials";

interface EAurixMaterialsProps {
  category: string;
  selectedMaterials: Record<string, number>;
  onChange: (materials: Record<string, number>) => void;
}

function MaterialCard({
  material,
  qty,
  onAdd,
  onRemove,
  onSet,
}: {
  material: Material;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onSet: (n: number) => void;
}) {
  const selected = qty > 0;

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
        selected
          ? "border-[#0EA5E9] bg-sky-50 shadow-sm shadow-sky-100"
          : "border-gray-100 bg-white hover:border-sky-200 hover:shadow-sm"
      }`}
    >
      {material.popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-[#0EA5E9] text-white text-[9px] px-2 py-0.5 rounded-bl-lg" style={{ fontWeight: 700 }}>
            POPULAR
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start gap-2.5 mb-2.5">
          <span className="text-xl mt-0.5 shrink-0">{material.icon}</span>
          <div className="min-w-0">
            <div className="text-[#0F172A] text-sm leading-tight" style={{ fontWeight: 600 }}>
              {material.name}
            </div>
            <div className="text-[#64748B] text-xs mt-0.5 leading-snug">{material.description}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Tag className="w-3 h-3 text-[#0EA5E9]" />
              <span className="text-[#0EA5E9] text-xs" style={{ fontWeight: 600 }}>
                ${material.price}
              </span>
              <span className="text-[#94A3B8] text-xs">/ {material.unit}</span>
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          {selected ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-1 flex-1 bg-white border border-sky-200 rounded-lg p-1">
                <button
                  onClick={onRemove}
                  className="w-6 h-6 rounded-md bg-sky-50 hover:bg-sky-100 flex items-center justify-center transition-colors shrink-0"
                >
                  <Minus className="w-3 h-3 text-[#0EA5E9]" />
                </button>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    onSet(Math.max(0, v));
                  }}
                  className="flex-1 text-center text-sm text-[#0F172A] outline-none bg-transparent w-0"
                  style={{ fontWeight: 600 }}
                />
                <button
                  onClick={onAdd}
                  className="w-6 h-6 rounded-md bg-[#0EA5E9] hover:bg-[#0284C7] flex items-center justify-center transition-colors shrink-0"
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="text-xs text-[#0F172A] shrink-0" style={{ fontWeight: 600 }}>
                ${(material.price * qty).toFixed(0)}
              </div>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sky-50 border border-sky-200 text-[#0EA5E9] text-xs hover:bg-sky-100 transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EAurixMaterials({ category, selectedMaterials, onChange }: EAurixMaterialsProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const materials: Material[] = materialsByCategory[category] || [];
  const label = categoryMaterialLabels[category] || "Work Materials";

  const totalQty = Object.values(selectedMaterials).reduce((a, b) => a + b, 0);
  const totalCost = materials.reduce((sum, m) => sum + m.price * (selectedMaterials[m.id] || 0), 0);

  const setQty = (id: string, qty: number) => {
    const updated = { ...selectedMaterials };
    if (qty <= 0) {
      delete updated[id];
    } else {
      updated[id] = qty;
    }
    onChange(updated);
  };

  const displayedMaterials = showAll ? materials : materials.slice(0, 6);

  return (
    <div className="rounded-2xl border-2 border-sky-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-linear-to-r from-[#0EA5E9] to-[#0284C7] text-white transition-opacity hover:opacity-95"
      >
        <div className="flex items-center gap-3">
          {/* E-Aurix Logo Badge */}
          <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span style={{ fontWeight: 800, fontSize: "0.85rem", letterSpacing: "-0.01em" }}>
              E-Aurix
            </span>
          </div>

          <div className="text-left">
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Material Add-Ons</div>
            <div className="text-sky-100 text-xs">
              {label} — sourced & delivered before your job starts
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {totalQty > 0 && (
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="text-sm" style={{ fontWeight: 700 }}>
                {totalQty} item{totalQty !== 1 ? "s" : ""} · ${totalCost}
              </span>
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-sky-200" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sky-200" />
          )}
        </div>
      </button>

      {/* Collapsed summary strip */}
      {!expanded && totalQty > 0 && (
        <div className="bg-sky-50 border-t border-sky-100 px-4 py-2.5 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#0EA5E9]" />
          <span className="text-sm text-[#0284C7]" style={{ fontWeight: 500 }}>
            {totalQty} material{totalQty !== 1 ? "s" : ""} selected — total cost:
          </span>
          <span className="text-sm text-[#0F172A]" style={{ fontWeight: 700 }}>
            ${totalCost}
          </span>
          <button
            onClick={() => setExpanded(true)}
            className="ml-auto text-xs text-[#0EA5E9] hover:underline"
            style={{ fontWeight: 600 }}
          >
            Edit
          </button>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="bg-white p-4">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3 bg-sky-50 border border-sky-100 rounded-xl mb-4">
            <Sparkles className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" />
            <p className="text-xs text-[#0369A1]">
              <span style={{ fontWeight: 600 }}>E-Aurix</span> handles sourcing, pricing, and delivery of all materials
              to your job site before work begins — so your worker arrives ready to go.
            </p>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {displayedMaterials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                qty={selectedMaterials[m.id] || 0}
                onAdd={() => setQty(m.id, (selectedMaterials[m.id] || 0) + 1)}
                onRemove={() => setQty(m.id, (selectedMaterials[m.id] || 1) - 1)}
                onSet={(n) => setQty(m.id, n)}
              />
            ))}
          </div>

          {materials.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-sm text-[#0EA5E9] py-2 rounded-xl border border-sky-100 hover:bg-sky-50 transition-colors"
              style={{ fontWeight: 600 }}
            >
              {showAll ? "Show Less" : `Show ${materials.length - 6} More Items`}
            </button>
          )}

          {/* Materials Sub-Total */}
          {totalQty > 0 && (
            <div className="mt-4 p-3 bg-linear-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#0EA5E9]" />
                <span className="text-sm text-[#0369A1]" style={{ fontWeight: 600 }}>
                  Materials Sub-Total ({totalQty} items)
                </span>
              </div>
              <span className="text-[#0F172A]" style={{ fontWeight: 700, fontSize: "1rem" }}>
                ${totalCost}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
