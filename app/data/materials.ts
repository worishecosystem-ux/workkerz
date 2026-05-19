export interface Material {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  category: string;
  icon: string;
  popular?: boolean;
}

export const materialsByCategory: Record<string, Material[]> = {
  construction: [
    { id: "c1",  name: "Portland Cement", description: "Standard 50kg bag for foundations & masonry", unit: "per bag",  price: 18,  category: "construction", icon: "🧱", popular: true },
    { id: "c2",  name: "River Sand",       description: "Fine washed sand, 25kg bag for mortar mix",   unit: "per bag",  price: 8,   category: "construction", icon: "🏖️" },
    { id: "c3",  name: "Common Bricks",    description: "Standard clay bricks, pack of 100",           unit: "per 100",  price: 45,  category: "construction", icon: "🧱", popular: true },
    { id: "c4",  name: "Gravel / Stone",   description: "Crushed stone aggregate, 25kg bag",           unit: "per bag",  price: 12,  category: "construction", icon: "⛏️" },
    { id: "c5",  name: "Steel Rebar",      description: "6m mild steel rod, 10mm diameter",            unit: "per rod",  price: 15,  category: "construction", icon: "🔩" },
    { id: "c6",  name: "Drywall Sheet",    description: "4×8ft gypsum board, 12mm thick",             unit: "per sheet", price: 14,  category: "construction", icon: "🪵" },
    { id: "c7",  name: "Interior Paint",   description: "Premium latex paint, 1 gallon",              unit: "per gallon", price: 32, category: "construction", icon: "🎨", popular: true },
    { id: "c8",  name: "Plywood Sheet",    description: "4×8ft structural plywood, 18mm",             unit: "per sheet", price: 35,  category: "construction", icon: "🪵" },
    { id: "c9",  name: "Ceramic Tiles",    description: "30×30cm floor/wall tiles",                   unit: "per m²",   price: 28,  category: "construction", icon: "⬜" },
    { id: "c10", name: "Screws & Nails",   description: "Mixed hardware fastener pack",               unit: "per pack",  price: 12,  category: "construction", icon: "🔧" },
    { id: "c11", name: "Adhesive Mortar",  description: "Pre-mixed tile adhesive, 25kg bag",          unit: "per bag",   price: 22,  category: "construction", icon: "🪣" },
    { id: "c12", name: "Waterproof Membrane", description: "Roll for damp-proof course, 10m",        unit: "per roll",  price: 45,  category: "construction", icon: "🛡️" },
  ],

  plumbing: [
    { id: "p1",  name: "PVC Pipe (50mm)", description: "3m schedule-40 drain pipe",                   unit: "per 3m",   price: 15,  category: "plumbing", icon: "🔵", popular: true },
    { id: "p2",  name: "Copper Pipe",     description: "1m type-L copper for supply lines",           unit: "per 1m",   price: 12,  category: "plumbing", icon: "🟠" },
    { id: "p3",  name: "Pipe Fittings",   description: "Assorted elbows, tees & couplings set",       unit: "per set",  price: 18,  category: "plumbing", icon: "🔧", popular: true },
    { id: "p4",  name: "Teflon Tape",     description: "Thread seal tape roll, 12mm",                 unit: "per roll", price: 4,   category: "plumbing", icon: "🌀" },
    { id: "p5",  name: "PVC Cement",      description: "Solvent weld cement, 250ml tin",              unit: "per tin",  price: 8,   category: "plumbing", icon: "🧴" },
    { id: "p6",  name: "Ball Valve (1/2\")", description: "Full-bore brass shut-off valve",           unit: "per unit", price: 22,  category: "plumbing", icon: "🔴" },
    { id: "p7",  name: "Drain Cleaner",   description: "Heavy-duty enzyme drain opener, 1L",          unit: "per bottle", price: 9, category: "plumbing", icon: "🧪" },
    { id: "p8",  name: "Silicone Sealant", description: "Waterproof bathroom sealant, clear",        unit: "per tube",  price: 11,  category: "plumbing", icon: "🪣" },
    { id: "p9",  name: "P-Trap Assembly", description: "Chrome sink trap with washers",               unit: "per unit",  price: 20,  category: "plumbing", icon: "🔩", popular: true },
    { id: "p10", name: "Pipe Insulation", description: "Foam sleeve, 22mm bore, 1m long",             unit: "per 1m",   price: 6,   category: "plumbing", icon: "🟡" },
    { id: "p11", name: "Flexible Hose",   description: "Braided stainless, 30cm tap connector",       unit: "per unit",  price: 14,  category: "plumbing", icon: "🌿" },
    { id: "p12", name: "Push-Fit Coupler", description: "SharkBite-style connector for 15mm pipe",   unit: "per unit",  price: 8,   category: "plumbing", icon: "🔗" },
  ],

  electrical: [
    { id: "e1",  name: "Electrical Cable (2.5mm)", description: "Twin & earth, 10m roll",            unit: "per 10m",  price: 16,  category: "electrical", icon: "⚡", popular: true },
    { id: "e2",  name: "Double Wall Outlet",       description: "13A switched socket",               unit: "per unit", price: 12,  category: "electrical", icon: "🔌", popular: true },
    { id: "e3",  name: "Circuit Breaker (20A)",    description: "MCB type-B DIN rail breaker",       unit: "per unit", price: 18,  category: "electrical", icon: "⚠️" },
    { id: "e4",  name: "Wire Nuts Pack",           description: "Assorted connector caps, 50 pcs",  unit: "per pack", price: 6,   category: "electrical", icon: "🟣" },
    { id: "e5",  name: "Electrical Tape",          description: "PVC insulating tape, 10m roll",    unit: "per roll", price: 4,   category: "electrical", icon: "🔵" },
    { id: "e6",  name: "Junction Box",             description: "Flush mount, IP44 rated, 86mm",    unit: "per unit", price: 8,   category: "electrical", icon: "📦" },
    { id: "e7",  name: "Light Switch (1-gang)",    description: "Modern rocker plate switch",        unit: "per unit", price: 9,   category: "electrical", icon: "💡" },
    { id: "e8",  name: "GFCI / RCD Outlet",        description: "Ground-fault protected socket",    unit: "per unit", price: 22,  category: "electrical", icon: "🛡️", popular: true },
    { id: "e9",  name: "Conduit Pipe (20mm)",      description: "2m rigid PVC surface conduit",     unit: "per 2m",   price: 10,  category: "electrical", icon: "⬛" },
    { id: "e10", name: "Cable Ties Pack",          description: "Nylon zip ties, assorted, 100 pcs", unit: "per pack", price: 7,  category: "electrical", icon: "🔗" },
    { id: "e11", name: "LED Downlight (9W)",       description: "Recessed ceiling light, warm white", unit: "per unit", price: 24, category: "electrical", icon: "💡" },
    { id: "e12", name: "MCB Breaker (32A)",        description: "High-current type-C rail breaker", unit: "per unit", price: 25,  category: "electrical", icon: "⚡" },
  ],

  driving: [
    { id: "d1",  name: "Moving Boxes (set of 10)", description: "Double-walled cardboard boxes",     unit: "per set",  price: 25,  category: "driving", icon: "📦", popular: true },
    { id: "d2",  name: "Bubble Wrap Roll",         description: "Anti-static, 30m × 50cm roll",      unit: "per roll", price: 18,  category: "driving", icon: "🛡️", popular: true },
    { id: "d3",  name: "Moving Blankets (pair)",   description: "Heavy-duty padded furniture covers", unit: "per pair", price: 28,  category: "driving", icon: "🛏️" },
    { id: "d4",  name: "Packing Tape (6 rolls)",   description: "Heavy-duty brown tape, 50mm wide",  unit: "per set",  price: 14,  category: "driving", icon: "📎" },
    { id: "d5",  name: "Rope & Ratchet Straps",    description: "Cargo securing set, 4 straps",      unit: "per set",  price: 22,  category: "driving", icon: "🪢", popular: true },
    { id: "d6",  name: "Corner Protectors",        description: "Foam edge guards, pack of 20",      unit: "per pack", price: 12,  category: "driving", icon: "🟩" },
    { id: "d7",  name: "Stretch Wrap Film",        description: "Clear pallet wrap, 400mm × 300m",   unit: "per roll", price: 16,  category: "driving", icon: "🌀" },
    { id: "d8",  name: "Furniture Dolly (pair)",   description: "4-wheel platform dollies",          unit: "per pair", price: 35,  category: "driving", icon: "🛞" },
    { id: "d9",  name: "Labels & Marker Pack",     description: "Adhesive moving labels + marker",   unit: "per pack", price: 8,   category: "driving", icon: "🏷️" },
    { id: "d10", name: "Zip Storage Bags",         description: "Heavy-duty, large, pack of 20",     unit: "per pack", price: 10,  category: "driving", icon: "🛍️" },
    { id: "d11", name: "Wardrobe Moving Box",      description: "Tall box with hanging bar",         unit: "per box",  price: 18,  category: "driving", icon: "👔" },
    { id: "d12", name: "Mattress Bag Cover",       description: "Waterproof, queen/king size",       unit: "per bag",  price: 14,  category: "driving", icon: "🛏️" },
  ],
};

export const categoryMaterialLabels: Record<string, string> = {
  construction: "Construction Materials",
  plumbing: "Plumbing Supplies",
  electrical: "Electrical Components",
  driving: "Moving & Packing Supplies",
};
