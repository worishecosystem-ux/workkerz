"use client";

import React, { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Store,
  MapPin,
  Phone,
  Package,
  X,
  Pencil,
  Trash2,
  Power,
  Mail,
  FileText,
  CalendarDays,
  Hash,
} from "lucide-react";

import ProductsTab from "./ProductsTab";
import { getProducts } from "@/app/data/products";
import ShopRegistrationForm from "@/app/admin/components/ShopRegistrationForm";

import {
  getShops,
  updateShop,
  deleteShop as removeShop,
  toggleShopStatus,
} from "@/app/data/shops";

/* ====================================================== */

type Shop = {
  id: string;

  shop_uid?: string;

  serial_no?: number;

  joined_date?: string;

  created_at?: string;

  shop_name: string;

  owner_name: string;

  phone: string;

  email?: string;

  category?: string;

  address?: string;

  city?: string;

  state?: string;

  gst_number?: string;

  description?: string;

  logo?: string;

  banner?: string;

  status?: string;

  is_active?: boolean;
};

/* ====================================================== */

function getImageUrl(url?: string) {
  if (!url || url.trim() === "") {
    return "";
  }

  return url.trim();
}

/* ====================================================== */

export default function ShopsTab() {
  const [shops, setShops] = useState<Shop[]>([]);

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const [viewShop, setViewShop] = useState<Shop | null>(null);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopProductsCount, setShopProductsCount] = useState(0);

  useEffect(() => {
    async function loadShopProducts() {
      try {
        if (!viewShop?.id) return;

        const products = await getProducts(viewShop.id);

        setShopProductsCount(products.length || 0);
      } catch (err) {
        console.log(err);

        setShopProductsCount(0);
      }
    }

    loadShopProducts();
  }, [viewShop]);

  /* ====================================================== */

  useEffect(() => {
    loadShops();
  }, []);

  /* ====================================================== */

  async function loadShops() {
    try {
      setLoading(true);

      const data = await getShops();

      setShops(data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  /* ====================================================== */

  async function deleteShop(id: string) {
    const confirmDelete = confirm("Delete this shop?");

    if (!confirmDelete) return;

    try {
      const success = await removeShop(id);

      if (!success) {
        alert("Delete failed");

        return;
      }

      setViewShop(null);

      await loadShops();
    } catch (err) {
      console.log(err);
    }
  }

  /* ====================================================== */

  async function toggleStatus(shop: Shop) {
    const isActive = shop.status !== "online";

    try {
      const success = await toggleShopStatus(shop.id, isActive);

      if (!success) {
        alert("Status update failed");

        return;
      }

      await loadShops();

      setViewShop({
        ...shop,

        status: isActive ? "online" : "offline",
      });
    } catch (err) {
      console.log(err);
    }
  }

  function handleEdit(shop: Shop) {
    setEditingShop(shop);

    setViewShop(null);

    setDrawerOpen(true);
  }

  /* ====================================================== */

  if (selectedShop) {
    return (
      <ProductsTab shop={selectedShop} onBack={() => setSelectedShop(null)} />
    );
  }

  /* ====================================================== */

  const filtered = shops.filter((shop) => {
    const q = search.toLowerCase();

    return (
      shop.shop_name?.toLowerCase().includes(q) ||
      shop.owner_name?.toLowerCase().includes(q) ||
      shop.city?.toLowerCase().includes(q) ||
      shop.shop_uid?.toLowerCase().includes(q)
    );
  });

  /* ====================================================== */

  const folderColors = [
    {
      top: "bg-pink-400",
      body: "from-pink-400 to-pink-500",
    },

    {
      top: "bg-sky-400",
      body: "from-sky-400 to-sky-500",
    },

    {
      top: "bg-orange-400",
      body: "from-orange-400 to-orange-500",
    },

    {
      top: "bg-green-400",
      body: "from-green-400 to-green-500",
    },

    {
      top: "bg-violet-400",
      body: "from-violet-400 to-violet-500",
    },

    {
      top: "bg-red-400",
      body: "from-red-400 to-red-500",
    },
  ];

  /* ====================================================== */

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-[#0F172A]">Shops</h1>

          <p className="text-gray-500 mt-2">Manage all registered shops</p>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="h-12 px-6 rounded-2xl bg-[#0EA5E9] text-white flex items-center gap-2 font-bold shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Shop
        </button>
      </div>

      {/* SEARCH */}

      <div className="mb-8">
        <div className="h-12 rounded-2xl bg-white border border-gray-200 flex items-center px-4 gap-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops..."
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>
      </div>

      {/* GRID */}

      {loading ? (
        <div className="py-24 text-center text-gray-400 text-lg">
          Loading shops...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <Store className="w-12 h-12 mx-auto text-gray-300 mb-4" />

          <p className="text-gray-500 text-lg">No Shops Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-8 gap-5">
          {filtered.map((shop, index) => {
            const color = folderColors[index % folderColors.length];

            return (
              <div
                key={shop.id}
                onClick={() => setViewShop(shop)}
                className="group cursor-pointer flex flex-col items-center"
              >
                {/* REAL SMALL FOLDER */}

                <div className="relative w-30.75">
                  {/* FOLDER TOP */}

                  <div
                    className={`absolute top-0 left-2 w-10 h-2.5 rounded-t-lg z-10 ${color.top}`}
                  />

                  {/* FOLDER BODY */}

                  <div
                    className={`mt-2 relative bg-linear-to-b ${color.body} rounded-xl rounded-tl-[6px] px-2 py-4 shadow-md border border-white/10 overflow-hidden transition-all duration-300 group-hover:-translate-y-1`}
                  >
                    {/* LIGHT EFFECT */}

                    <div className="absolute inset-0 bg-white/10 pointer-events-none" />

                    {/* IMAGE ONLY */}
                    <div className="relative z-10 w-11 h-11 mx-auto">
                      {/* IMAGE */}

                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow border border-white/40 flex items-center justify-center">
                        {shop.logo ? (
                          <img
                            src={getImageUrl(shop.logo)}
                            alt={shop.shop_name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <Store className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      {/* STATUS DOT */}

                      <div
                        className={`absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${
                          shop.status === "online"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* NAME BELOW */}

                <div className="mt-1 text-center w-50.75">
                  <h2 className="text-[15px] font-black text-gray-800 line-clamp-1">
                    {shop.shop_name}
                  </h2>

                  <p className="text-[12px] text-gray-500 line-clamp-1">
                    {shop.address || shop.city || shop.state || "No Location"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP */}

      {viewShop && (
        <div className="fixed inset-0 z-999 bg-black/70 backdrop-blur-md flex items-center justify-center p-3">
          <div className="relative w-full h-full max-w-7xl bg-white rounded-[35px] overflow-hidden shadow-2xl flex flex-col">
            {/* CLOSE */}

            <button
              onClick={() => setViewShop(null)}
              className="absolute top-5 right-5 z-50 w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* BANNER */}

            <div className="relative h-100 bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600">
              {viewShop.banner || viewShop.logo ? (
                <img
                  src={viewShop.banner || viewShop.logo}
                  alt={viewShop.shop_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-24 h-24 text-white/40" />
                </div>
              )}

              {/* OVERLAY */}

              <div className="absolute inset-0 bg-black/30" />

              {/* LOGO */}

              <div className="absolute -bottom-16 left-10">
                <div className="w-32 h-32 rounded-[35px] bg-white border-[6px] border-white shadow-2xl overflow-hidden flex items-center justify-center">
                  {viewShop.logo ? (
                    <img
                      src={viewShop.logo}
                      alt={viewShop.shop_name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Store className="w-14 h-14 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="flex-1 overflow-y-auto pt-14 px-4 pb-5 bg-[#F8FAFC] mt-5">
              {/* TOP */}

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <h2 className="text-[26px] md:text-[30px] font-black text-[#0F172A] leading-tight">
                    {viewShop.shop_name}
                  </h2>

                  <p className="text-[13px] text-gray-500 mt-1 font-semibold">
                    Owner : {viewShop.owner_name}
                  </p>

                  {/* DETAILS */}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="px-3 py-2 rounded-xl bg-violet-50 border border-violet-100">
                      <h3 className="text-[12px] font-black text-violet-700 ">
                        Shop : {viewShop.shop_uid || "N/A"}
                      </h3>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-orange-50 border border-orange-100">
                      <h3 className="text-[12px] font-black text-orange-700 mt-0.5">
                        Serial : #{viewShop.serial_no || 0}
                      </h3>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <h3 className="text-[12px] font-black text-emerald-700 mt-0.5">
                        Date :{" "}
                        {viewShop.joined_date
                          ? new Date(viewShop.joined_date).toLocaleDateString(
                              "en-GB",
                            )
                          : "-"}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* STATUS */}

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-100">
                    <h3 className="text-[12px] font-black text-sky-700">
                      Products : {shopProductsCount}
                    </h3>
                  </div>
                  <span
                    className={`w-18 h-7 flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-wide shrink-0 ${
                      viewShop.status === "online"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {viewShop.status}
                  </span>

                  <button
                    onClick={() => toggleStatus(viewShop)}
                    className={`w-11 h-6 rounded-full flex items-center px-1 transition-all ${
                      viewShop.status === "online"
                        ? "bg-green-500 justify-end"
                        : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>

              {/* INFO */}

              <div className="grid md:grid-cols-2 gap-3 mt-5">
                {[
                  {
                    icon: Phone,
                    title: "Phone",
                    value: `${viewShop.phone || "-"}`,
                    color: "text-sky-500",
                    bg: "bg-sky-100",
                  },

                  {
                    icon: Mail,
                    title: "Email",
                    value: `${viewShop.email || "-"}`,
                    color: "text-pink-500",
                    bg: "bg-pink-100",
                  },

                  {
                    icon: Package,
                    title: "Category",
                    value: `${viewShop.category || "-"}`,
                    color: "text-orange-500",
                    bg: "bg-orange-100",
                  },

                  {
                    icon: MapPin,
                    title: "Location",
                    value: `${viewShop.city || ""} ${viewShop.state || ""}`,
                    color: "text-green-500",
                    bg: "bg-green-100",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>

                      <p className="text-[13px] text-gray-700 wrap-break-word leading-relaxed">
                        <span className="font-black text-[#0F172A]">
                          {item.title} :
                        </span>{" "}
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}

                {/* ADDRESS */}

                <div className="md:col-span-2 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Store className="w-4 h-4 text-violet-500" />
                    </div>

                    <h3 className="font-black text-[12px] text-[#0F172A]">
                      Address : {viewShop.address || "-"}
                    </h3>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-cyan-500" />
                    </div>

                    <h3 className="font-black text-[12px] text-[#0F172A]">
                      Description : {viewShop.description || "-"}
                    </h3>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="grid grid-cols-3 gap-2.5 mt-4">
                <button
                  onClick={() => {
                    setSelectedShop(viewShop);

                    setViewShop(null);
                  }}
                  className="h-11 rounded-2xl bg-[#0EA5E9] text-white text-[12px] font-black flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Package className="w-4 h-4" />
                  Products
                </button>

                <button
                  onClick={() => handleEdit(viewShop)}
                  className="h-11 rounded-2xl bg-white border border-gray-200 text-[12px] font-black flex items-center justify-center gap-1.5"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => deleteShop(viewShop.id)}
                  className="h-11 rounded-2xl bg-red-50 text-red-600 text-[12px] font-black flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER */}

      {drawerOpen && (
        <div className="fixed inset-0 z-999 flex">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="w-full max-w-2xl bg-white h-full overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Register Shop</h2>

                <p className="text-sm text-gray-500 mt-1">Add new shop</p>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[calc(100vh-90px)] overflow-y-auto">
              <ShopRegistrationForm
                editingShop={editingShop}
                onSuccess={() => {
                  loadShops();

                  setDrawerOpen(false);

                  setEditingShop(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
