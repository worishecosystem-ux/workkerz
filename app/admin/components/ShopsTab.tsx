"use client";

import React, { useEffect, useState } from "react";
import ShopProfile from "./ShopProfile";
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
  Mail,
  FileText,
  Loader2,
} from "lucide-react";

import ProductsTab from "./ProductsTab";

import { getProducts } from "@/app/data/products";

import ShopRegistrationForm from "@/app/admin/components/ShopRegistrationForm";

import {
  getShops,
  deleteShop as removeShop,
  toggleShopStatus,
} from "@/app/data/shops";

/* ======================================================
   TYPES
====================================================== */
type ShopsTabProps = {
  onShopProfileChange?: (open: boolean) => void;
};
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

/* ======================================================
   HELPERS
====================================================== */

function getImageUrl(url?: string) {
  if (!url?.trim()) {
    return "";
  }

  return url.trim();
}

/* ======================================================
   FOLDER COLORS
====================================================== */

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

/* ======================================================
   COMPONENT
====================================================== */

export default function ShopsTab({ onShopProfileChange }: ShopsTabProps) {
  const [shops, setShops] = useState<Shop[]>([]);

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const [viewShop, setViewShop] = useState<Shop | null>(null);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const [shopProductsCount, setShopProductsCount] = useState(0);
  /* ======================================================
     SHOP PROFILE VISIBILITY
  ====================================================== */

  useEffect(() => {
    onShopProfileChange?.(!!viewShop);

    return () => {
      onShopProfileChange?.(false);
    };
  }, [viewShop, onShopProfileChange]);
  /* ======================================================
     LOAD SHOP PRODUCTS
  ====================================================== */

  useEffect(() => {
    async function loadShopProducts() {
      if (!viewShop?.id) {
        setShopProductsCount(0);
        return;
      }

      try {
        const products = await getProducts(viewShop.id);

        setShopProductsCount(products?.length || 0);
      } catch (error) {
        console.error("LOAD PRODUCTS ERROR:", error);

        setShopProductsCount(0);
      }
    }

    loadShopProducts();
  }, [viewShop]);

  /* ======================================================
     LOAD SHOPS
  ====================================================== */

  useEffect(() => {
    loadShops();
  }, []);

  async function loadShops() {
    try {
      setLoading(true);

      const data = await getShops();

      setShops(data || []);
    } catch (error) {
      console.error("LOAD SHOPS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
     DELETE SHOP
  ====================================================== */

  async function deleteShop(id: string) {
    const confirmDelete = window.confirm("Delete this shop?");

    if (!confirmDelete) {
      return;
    }

    try {
      const success = await removeShop(id);

      if (!success) {
        alert("Delete failed");
        return;
      }

      setViewShop(null);

      await loadShops();
    } catch (error) {
      console.error("DELETE SHOP ERROR:", error);

      alert("Something went wrong while deleting the shop.");
    }
  }

  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  async function toggleStatus(shop: Shop) {
    const isActive = shop.status !== "online";

    try {
      const success = await toggleShopStatus(shop.id, isActive);

      if (!success) {
        alert("Status update failed");

        return;
      }

      const updatedShop = {
        ...shop,
        status: isActive ? "online" : "offline",
      };

      setShops((current) =>
        current.map((item) => (item.id === shop.id ? updatedShop : item)),
      );

      setViewShop(updatedShop);
    } catch (error) {
      console.error("STATUS ERROR:", error);
    }
  }

  /* ======================================================
     EDIT
  ====================================================== */

  function handleEdit(shop: Shop) {
    setEditingShop(shop);
    setViewShop(null);
    setDrawerOpen(true);
  }

  /* ======================================================
     PRODUCTS
  ====================================================== */
  if (viewShop) {
    return (
      <ShopProfile
        shop={viewShop}
        productsCount={shopProductsCount}
        onBack={() => setViewShop(null)}
        onProducts={() => {
          setSelectedShop(viewShop);
          setViewShop(null);
        }}
        onEdit={() => handleEdit(viewShop)}
        onDelete={() => deleteShop(viewShop.id)}
        onToggleStatus={() => toggleStatus(viewShop)}
      />
    );
  }
  if (selectedShop) {
    return (
      <ProductsTab shop={selectedShop} onBack={() => setSelectedShop(null)} />
    );
  }

  /* ======================================================
     SEARCH
  ====================================================== */

  const query = search.trim().toLowerCase();

  const filtered = shops.filter((shop) => {
    if (!query) {
      return true;
    }

    return (
      shop.shop_name?.toLowerCase().includes(query) ||
      shop.owner_name?.toLowerCase().includes(query) ||
      shop.city?.toLowerCase().includes(query) ||
      shop.shop_uid?.toLowerCase().includes(query)
    );
  });

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ==================================================
          PAGE CONTAINER
      ================================================== */}

      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
              Shops
            </h1>

            <p className="mt-0.5 text-xs text-gray-500 sm:mt-1.5 sm:text-sm">
              Manage all registered shops
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingShop(null);
              setDrawerOpen(true);
            }}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0EA5E9] px-4 text-xs font-black text-white shadow-md shadow-sky-100 transition hover:bg-[#0284C7] sm:h-11 sm:w-auto sm:rounded-2xl sm:px-5 sm:text-sm"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />

            <span>Add Shop</span>
          </button>
        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex h-11 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-50 sm:h-12 sm:gap-3 sm:rounded-2xl sm:px-4">
            <Search className="h-4 w-4 shrink-0 text-gray-400 sm:h-5 sm:w-5" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search shops, owners, city or Shop ID..."
              className="min-w-0 flex-1 bg-transparent text-xs text-[#0F172A] outline-none placeholder:text-gray-400 sm:text-sm"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            RESULT COUNT
        ================================================== */}

        {!loading && shops.length > 0 && (
          <div className="mb-3 flex items-center justify-between px-0.5 sm:mb-4">
            <p className="text-[11px] font-semibold text-gray-500 sm:text-xs">
              {filtered.length} {filtered.length === 1 ? "shop" : "shops"} found
            </p>

            {query && (
              <p className="max-w-[55%] truncate text-[10px] text-gray-400 sm:text-xs">
                Searching: "{search}"
              </p>
            )}
          </div>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <ShopSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            hasSearch={Boolean(query)}
            onClear={() => setSearch("")}
          />
        ) : (
          /* ==================================================
             SHOP GRID
          ================================================== */

          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {filtered.map((shop, index) => {
              const color = folderColors[index % folderColors.length];

              return (
                <ShopFolder
                  key={shop.id}
                  shop={shop}
                  color={color}
                  onClick={() => setViewShop(shop)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================
          SHOP DETAILS
      ================================================== */}

      {/* ==================================================
          DRAWER
      ================================================== */}

      {drawerOpen && (
        <ShopDrawer
          editingShop={editingShop}
          onClose={() => {
            setDrawerOpen(false);
            setEditingShop(null);
          }}
          onSuccess={async () => {
            await loadShops();

            setDrawerOpen(false);
            setEditingShop(null);
          }}
        />
      )}
    </div>
  );
}

/* ======================================================
   SHOP FOLDER
====================================================== */

function ShopFolder({
  shop,
  color,
  onClick,
}: {
  shop: Shop;
  color: {
    top: string;
    body: string;
  };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 w-full flex-col items-center text-center outline-none"
    >
      {/* FOLDER */}

      <div className="relative w-full max-w-36.25">
        {/* FOLDER TAB */}

        <div
          className={`
            absolute
            left-1.5
            top-0
            z-10
            h-2
            w-9
            rounded-t-md
            sm:left-2
            sm:h-2.5
            sm:w-10
            ${color.top}
          `}
        />

        {/* FOLDER BODY */}

        <div
          className={`
            relative
            mt-1.5
            overflow-hidden
            rounded-xl
            rounded-tl-[5px]
            border
            border-white/10
            bg-linear-to-b
            px-2.5
            py-3
            shadow-sm
            transition-all
            duration-200
            group-hover:-translate-y-1
            group-hover:shadow-lg
            sm:mt-2
            sm:rounded-2xl
            sm:px-3
            sm:py-4
            ${color.body}
          `}
        >
          {/* LIGHT */}

          <div className="pointer-events-none absolute inset-0 bg-white/10" />

          {/* SHOP IMAGE */}

          <div className="relative z-10 mx-auto h-10 w-10 sm:h-12 sm:w-12">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/50 bg-white shadow sm:h-12 sm:w-12 sm:rounded-xl">
              {shop.logo ? (
                <img
                  src={getImageUrl(shop.logo)}
                  alt={shop.shop_name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Store className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              )}
            </div>

            {/* STATUS */}

            <span
              className={`
                absolute
                -left-1
                -top-1
                h-3
                w-3
                rounded-full
                border-2
                border-white
                shadow
                sm:h-3.5
                sm:w-3.5
                ${shop.status === "online" ? "bg-green-400" : "bg-red-400"}
              `}
            />
          </div>
        </div>
      </div>

      {/* NAME */}

      <div className="mt-1.5 w-full max-w-42.5 px-1 sm:mt-2 sm:max-w-45">
        <h2 className="line-clamp-1 text-[12px] font-black leading-4 text-gray-800 sm:text-[14px]">
          {shop.shop_name}
        </h2>

        <p className="mt-0.5 line-clamp-1 text-[9px] leading-3 text-gray-500 sm:text-[11px] sm:leading-4">
          {shop.address || shop.city || shop.state || "No Location"}
        </p>
      </div>
    </button>
  );
}

/* ======================================================
   SHOP DETAILS MODAL
====================================================== */

function ShopDetailsModal({
  shop,
  productsCount,
  onClose,
  onProducts,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  shop: Shop;
  productsCount: number;
  onClose: () => void;
  onProducts: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const isOnline = shop.status === "online";

  const location = [shop.city, shop.state].filter(Boolean).join(", ") || "-";

  const joinedDate = shop.joined_date
    ? new Date(shop.joined_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen w-full bg-[#f6f8fb]">
      {/* ==================================================
          TOP NAVBAR
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between px-3 sm:h-16 sm:px-5 lg:px-8">
          {/* BACK */}

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 sm:h-10 sm:px-4 sm:text-xs"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M19 12H5" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="hidden sm:inline">Back to Shops</span>

            <span className="sm:hidden">Back</span>
          </button>

          {/* TITLE */}

          <div className="min-w-0 px-3 text-center">
            <p className="truncate text-xs font-black text-slate-900 sm:text-sm">
              Shop Profile
            </p>

            <p className="hidden text-[9px] text-slate-400 sm:block">
              Shop management
            </p>
          </div>

          {/* STATUS */}

          <div className="flex items-center gap-2">
            <span
              className={`hidden rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wide sm:block ${
                isOnline
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>

            <button
              type="button"
              onClick={onToggleStatus}
              className={`relative flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
                isOnline
                  ? "justify-end bg-emerald-500"
                  : "justify-start bg-slate-300"
              }`}
              aria-label="Toggle shop status"
            >
              <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN PAGE
      ================================================== */}

      <main className="w-full">
        {/* ==================================================
            HERO / COVER
        ================================================== */}

        <section className="relative w-full overflow-hidden bg-slate-900">
          <div className="relative h-48 w-full sm:h-60 md:h-72 lg:h-80 xl:h-96">
            {shop.banner || shop.logo ? (
              <img
                src={getImageUrl(shop.banner || shop.logo)}
                alt={shop.shop_name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-sky-500 via-cyan-500 to-blue-700">
                <Store className="h-20 w-20 text-white/30 sm:h-28 sm:w-28" />
              </div>
            )}

            {/* OVERLAY */}

            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
          </div>

          {/* ==================================================
              SHOP ID
          ================================================== */}

          <div className="absolute right-3 top-3 sm:right-5 sm:top-5 lg:right-8">
            {shop.shop_uid && (
              <div className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[9px] font-bold text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-[10px]">
                {shop.shop_uid}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            PROFILE HEADER
        ================================================== */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-5 lg:px-8">
            <div className="relative flex flex-col gap-4 pb-5 pt-0 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
              {/* LOGO */}

              <div className="-mt-10 flex min-w-0 items-end gap-3 sm:-mt-12 sm:gap-4 lg:-mt-14">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24 sm:rounded-3xl sm:border-[5px] lg:h-28 lg:w-28">
                  {shop.logo ? (
                    <img
                      src={getImageUrl(shop.logo)}
                      alt={shop.shop_name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Store className="h-8 w-8 text-slate-400 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
                  )}
                </div>

                {/* NAME */}

                <div className="min-w-0 pb-0.5">
                  <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
                    {shop.shop_name}
                  </h1>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                      {shop.category || "General Shop"}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                    <span
                      className={`text-[10px] font-bold sm:text-xs ${
                        isOnline ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {isOnline ? "Open" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="grid grid-cols-3 gap-2 lg:flex lg:items-center">
                <button
                  type="button"
                  onClick={onProducts}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-3 text-[10px] font-black text-white shadow-sm transition hover:bg-sky-600 sm:h-11 sm:px-5 sm:text-xs"
                >
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Products
                </button>

                <button
                  type="button"
                  onClick={onEdit}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-700 transition hover:bg-slate-50 sm:h-11 sm:px-5 sm:text-xs"
                >
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 text-[10px] font-black text-red-500 transition hover:bg-red-100 sm:h-11 sm:px-5 sm:text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            {/* ==================================================
                LEFT / MAIN
            ================================================== */}

            <div className="space-y-4 lg:col-span-2 lg:space-y-6">
              {/* ==================================================
                  OVERVIEW
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5 lg:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-slate-950 sm:text-base">
                      Shop Overview
                    </h2>

                    <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">
                      Basic information about this shop
                    </p>
                  </div>

                  <div className="flex h-8 items-center gap-1.5 rounded-full bg-slate-50 px-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    />

                    <span className="text-[9px] font-bold text-slate-500">
                      {isOnline ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <ProfileInfo
                    icon={Phone}
                    label="Phone"
                    value={shop.phone || "-"}
                    iconBg="bg-sky-50"
                    iconColor="text-sky-500"
                  />

                  <ProfileInfo
                    icon={Mail}
                    label="Email"
                    value={shop.email || "-"}
                    iconBg="bg-pink-50"
                    iconColor="text-pink-500"
                  />

                  <ProfileInfo
                    icon={Package}
                    label="Category"
                    value={shop.category || "-"}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                  />

                  <ProfileInfo
                    icon={MapPin}
                    label="Location"
                    value={location}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-500"
                  />

                  <ProfileInfo
                    icon={MapPin}
                    label="Address"
                    value={shop.address || "-"}
                    iconBg="bg-violet-50"
                    iconColor="text-violet-500"
                    full
                  />
                </div>
              </section>

              {/* ==================================================
                  DESCRIPTION
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5 lg:p-6">
                <div className="mb-3">
                  <h2 className="text-sm font-black text-slate-950 sm:text-base">
                    About Shop
                  </h2>
                </div>

                <p className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
                  {shop.description ||
                    "No shop description has been added yet."}
                </p>
              </section>

              {/* ==================================================
                  SHOP DETAILS
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5 lg:p-6">
                <div className="mb-4">
                  <h2 className="text-sm font-black text-slate-950 sm:text-base">
                    Shop Details
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <MiniInfo label="Shop ID" value={shop.shop_uid || "-"} />

                  <MiniInfo
                    label="Serial Number"
                    value={shop.serial_no ? `#${shop.serial_no}` : "-"}
                  />

                  <MiniInfo label="Joined" value={joinedDate} />

                  <MiniInfo label="Owner" value={shop.owner_name || "-"} />

                  <MiniInfo label="City" value={shop.city || "-"} />

                  <MiniInfo label="State" value={shop.state || "-"} />

                  <MiniInfo
                    label="GST Number"
                    value={shop.gst_number || "-"}
                    fullOnMobile
                  />
                </div>
              </section>
            </div>

            {/* ==================================================
                RIGHT SIDEBAR
            ================================================== */}

            <aside className="space-y-4 lg:space-y-6">
              {/* ==================================================
                  PRODUCTS
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
                <div className="bg-linear-to-br from-sky-500 via-cyan-500 to-blue-600 p-5 text-white sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">
                        Inventory
                      </p>

                      <h2 className="mt-1 text-xl font-black sm:text-2xl">
                        {productsCount}
                      </h2>

                      <p className="mt-1 text-[10px] text-white/75 sm:text-xs">
                        Products listed
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur sm:h-12 sm:w-12 sm:rounded-2xl">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onProducts}
                    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-[10px] font-black text-sky-600 shadow-sm transition hover:bg-sky-50 sm:h-11 sm:text-xs"
                  >
                    Manage Products
                    <span>→</span>
                  </button>
                </div>
              </section>

              {/* ==================================================
                  STATUS
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
                <h2 className="text-sm font-black text-slate-950">
                  Shop Status
                </h2>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        isOnline ? "bg-emerald-100" : "bg-red-100"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isOnline ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                    </span>

                    <div>
                      <p className="text-xs font-black text-slate-800">
                        {isOnline ? "Shop is Online" : "Shop is Offline"}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {isOnline
                          ? "Customers can view this shop"
                          : "Shop is currently hidden"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onToggleStatus}
                    className={`relative flex h-6 w-11 items-center rounded-full p-1 transition ${
                      isOnline
                        ? "justify-end bg-emerald-500"
                        : "justify-start bg-slate-300"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </section>

              {/* ==================================================
                  QUICK CONTACT
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
                <h2 className="text-sm font-black text-slate-950">Contact</h2>

                <div className="mt-3 space-y-2">
                  <a
                    href={shop.phone ? `tel:${shop.phone}` : undefined}
                    className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                      <Phone className="h-4 w-4 text-sky-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="truncate text-[10px] font-bold text-slate-700 sm:text-xs">
                        {shop.phone || "Not available"}
                      </p>
                    </div>
                  </a>

                  <a
                    href={shop.email ? `mailto:${shop.email}` : undefined}
                    className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-100">
                      <Mail className="h-4 w-4 text-pink-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <p className="truncate text-[10px] font-bold text-slate-700 sm:text-xs">
                        {shop.email || "Not available"}
                      </p>
                    </div>
                  </a>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileInfo({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  full = false,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  full?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:rounded-2xl sm:p-3.5 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400 sm:text-[9px]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-[10px] font-bold leading-4 text-slate-700 sm:text-xs sm:leading-5">
          {value}
        </p>
      </div>
    </div>
  );
}

function MiniInfo({
  label,
  value,
  fullOnMobile = false,
}: {
  label: string;
  value: string;
  fullOnMobile?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50 p-3 sm:rounded-2xl sm:p-3.5 ${
        fullOnMobile ? "col-span-2 sm:col-span-1" : ""
      }`}
    >
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-[10px] font-black leading-4 text-slate-700 sm:text-xs">
        {value}
      </p>
    </div>
  );
}
/* ======================================================
   INFO BADGE
====================================================== */

function InfoBadge({ text, className }: { text: string; className: string }) {
  return (
    <div
      className={`max-w-full rounded-lg border px-2.5 py-1.5 sm:rounded-xl sm:px-3 sm:py-2 ${className}`}
    >
      <p className="max-w-[220px] truncate text-[9px] font-black sm:max-w-[300px] sm:text-[11px]">
        {text}
      </p>
    </div>
  );
}

/* ======================================================
   DETAIL CARD
====================================================== */

function DetailCard({
  icon: Icon,
  title,
  value,
  iconClass,
  iconBg,
  full = false,
}: {
  icon: typeof Store;
  title: string;
  value: string;
  iconClass: string;
  iconBg: string;
  full?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-gray-100
        bg-white
        p-2.5
        shadow-sm
        sm:rounded-2xl
        sm:p-3
        ${full ? "sm:col-span-2" : ""}
      `}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            sm:h-9
            sm:w-9
            sm:rounded-xl
            ${iconBg}
          `}
        >
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>

        <p className="min-w-0 break-words text-[11px] leading-4 text-gray-600 sm:text-xs sm:leading-5">
          <span className="font-black text-[#0F172A]">{title}:</span> {value}
        </p>
      </div>
    </div>
  );
}

/* ======================================================
   ACTION BUTTON
====================================================== */

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
  danger = false,
}: {
  icon: typeof Package;
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-10
        items-center
        justify-center
        gap-1.5
        rounded-xl
        text-[10px]
        font-black
        transition
        sm:h-11
        sm:rounded-2xl
        sm:gap-2
        sm:text-xs
        ${
          primary
            ? "bg-[#0EA5E9] text-white shadow-sm hover:bg-[#0284C7]"
            : danger
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }
      `}
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

      <span>{label}</span>
    </button>
  );
}

/* ======================================================
   DRAWER
====================================================== */

function ShopDrawer({
  editingShop,
  onClose,
  onSuccess,
}: {
  editingShop: Shop | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex bg-black/50 backdrop-blur-sm">
      {/* OVERLAY */}

      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* DRAWER */}

      <div className="relative ml-auto flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-w-xl lg:max-w-2xl">
        {/* HEADER */}

        <div className="relative z-20 flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-[#0F172A] sm:text-2xl">
              {editingShop ? "Edit Shop" : "Register Shop"}
            </h2>

            <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-sm">
              {editingShop ? "Update shop information" : "Add a new shop"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200 sm:h-11 sm:w-11 sm:rounded-2xl"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* FORM */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ShopRegistrationForm
            editingShop={editingShop}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   EMPTY STATE
====================================================== */

function EmptyState({
  hasSearch,
  onClear,
}: {
  hasSearch: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm sm:rounded-3xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 sm:h-16 sm:w-16 sm:rounded-3xl">
        <Store className="h-6 w-6 text-sky-400 sm:h-7 sm:w-7" />
      </div>

      <p className="mt-4 text-base font-black text-gray-700 sm:text-lg">
        {hasSearch ? "No Shops Found" : "No Shops Yet"}
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-gray-400 sm:text-sm">
        {hasSearch
          ? "Try another search term."
          : "Registered shops will appear here."}
      </p>

      {hasSearch && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-xl bg-sky-50 px-4 py-2 text-xs font-bold text-sky-600 transition hover:bg-sky-100"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}

/* ======================================================
   SKELETON
====================================================== */

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {Array.from({
        length: 12,
      }).map((_, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-full max-w-[145px]">
            <div className="ml-1.5 h-2 w-9 rounded-t-md bg-gray-200 sm:ml-2 sm:w-10" />

            <div className="mt-1.5 flex h-[78px] items-center justify-center rounded-xl rounded-tl-[5px] bg-gray-200 sm:mt-2 sm:h-[92px] sm:rounded-2xl">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-300 sm:h-12 sm:w-12 sm:rounded-xl" />
            </div>
          </div>

          <div className="mt-2 w-28 sm:w-36">
            <div className="mx-auto h-3 animate-pulse rounded bg-gray-200" />

            <div className="mx-auto mt-1.5 h-2 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
