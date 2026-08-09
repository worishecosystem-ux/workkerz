"use client";

import React, {
  useEffect,
  useState,
} from "react";

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

export default function ShopsTab() {
  const [shops, setShops] =
    useState<Shop[]>([]);

  const [selectedShop, setSelectedShop] =
    useState<Shop | null>(null);

  const [viewShop, setViewShop] =
    useState<Shop | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [editingShop, setEditingShop] =
    useState<Shop | null>(null);

  const [shopProductsCount, setShopProductsCount] =
    useState(0);

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
        const products =
          await getProducts(
            viewShop.id,
          );

        setShopProductsCount(
          products?.length || 0,
        );
      } catch (error) {
        console.error(
          "LOAD PRODUCTS ERROR:",
          error,
        );

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

      const data =
        await getShops();

      setShops(data || []);
    } catch (error) {
      console.error(
        "LOAD SHOPS ERROR:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
     DELETE SHOP
  ====================================================== */

  async function deleteShop(
    id: string,
  ) {
    const confirmDelete =
      window.confirm(
        "Delete this shop?",
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const success =
        await removeShop(id);

      if (!success) {
        alert("Delete failed");
        return;
      }

      setViewShop(null);

      await loadShops();
    } catch (error) {
      console.error(
        "DELETE SHOP ERROR:",
        error,
      );

      alert(
        "Something went wrong while deleting the shop.",
      );
    }
  }

  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  async function toggleStatus(
    shop: Shop,
  ) {
    const isActive =
      shop.status !== "online";

    try {
      const success =
        await toggleShopStatus(
          shop.id,
          isActive,
        );

      if (!success) {
        alert(
          "Status update failed",
        );

        return;
      }

      const updatedShop = {
        ...shop,
        status: isActive
          ? "online"
          : "offline",
      };

      setShops((current) =>
        current.map((item) =>
          item.id === shop.id
            ? updatedShop
            : item,
        ),
      );

      setViewShop(
        updatedShop,
      );
    } catch (error) {
      console.error(
        "STATUS ERROR:",
        error,
      );
    }
  }

  /* ======================================================
     EDIT
  ====================================================== */

  function handleEdit(
    shop: Shop,
  ) {
    setEditingShop(shop);
    setViewShop(null);
    setDrawerOpen(true);
  }

  /* ======================================================
     PRODUCTS
  ====================================================== */

  if (selectedShop) {
    return (
      <ProductsTab
        shop={selectedShop}
        onBack={() =>
          setSelectedShop(null)
        }
      />
    );
  }

  /* ======================================================
     SEARCH
  ====================================================== */

  const query =
    search
      .trim()
      .toLowerCase();

  const filtered =
    shops.filter((shop) => {
      if (!query) {
        return true;
      }

      return (
        shop.shop_name
          ?.toLowerCase()
          .includes(query) ||
        shop.owner_name
          ?.toLowerCase()
          .includes(query) ||
        shop.city
          ?.toLowerCase()
          .includes(query) ||
        shop.shop_uid
          ?.toLowerCase()
          .includes(query)
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

            <span>
              Add Shop
            </span>
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
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search shops, owners, city or Shop ID..."
              className="min-w-0 flex-1 bg-transparent text-xs text-[#0F172A] outline-none placeholder:text-gray-400 sm:text-sm"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
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

        {!loading &&
          shops.length > 0 && (
            <div className="mb-3 flex items-center justify-between px-0.5 sm:mb-4">

              <p className="text-[11px] font-semibold text-gray-500 sm:text-xs">
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "shop"
                  : "shops"}{" "}
                found
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
            hasSearch={
              Boolean(query)
            }
            onClear={() =>
              setSearch("")
            }
          />
        ) : (
          /* ==================================================
             SHOP GRID
          ================================================== */

          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">

            {filtered.map(
              (shop, index) => {
                const color =
                  folderColors[
                    index %
                      folderColors.length
                  ];

                return (
                  <ShopFolder
                    key={shop.id}
                    shop={shop}
                    color={color}
                    onClick={() =>
                      setViewShop(
                        shop,
                      )
                    }
                  />
                );
              },
            )}

          </div>
        )}

      </div>

      {/* ==================================================
          SHOP DETAILS
      ================================================== */}

      {viewShop && (
        <ShopDetailsModal
          shop={viewShop}
          productsCount={
            shopProductsCount
          }
          onClose={() =>
            setViewShop(null)
          }
          onProducts={() => {
            setSelectedShop(
              viewShop,
            );

            setViewShop(null);
          }}
          onEdit={() =>
            handleEdit(
              viewShop,
            )
          }
          onDelete={() =>
            deleteShop(
              viewShop.id,
            )
          }
          onToggleStatus={() =>
            toggleStatus(
              viewShop,
            )
          }
        />
      )}

      {/* ==================================================
          DRAWER
      ================================================== */}

      {drawerOpen && (
        <ShopDrawer
          editingShop={
            editingShop
          }
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

      <div className="relative w-full max-w-[145px]">

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
                  src={getImageUrl(
                    shop.logo,
                  )}
                  alt={
                    shop.shop_name
                  }
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    (
                      event.currentTarget
                    ).style.display =
                      "none";
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
                ${
                  shop.status ===
                  "online"
                    ? "bg-green-400"
                    : "bg-red-400"
                }
              `}
            />

          </div>

        </div>
      </div>

      {/* NAME */}

      <div className="mt-1.5 w-full max-w-[170px] px-1 sm:mt-2 sm:max-w-[180px]">

        <h2 className="line-clamp-1 text-[12px] font-black leading-4 text-gray-800 sm:text-[14px]">
          {shop.shop_name}
        </h2>

        <p className="mt-0.5 line-clamp-1 text-[9px] leading-3 text-gray-500 sm:text-[11px] sm:leading-4">
          {shop.address ||
            shop.city ||
            shop.state ||
            "No Location"}
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
  const isOnline =
    shop.status === "online";

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-3 lg:p-5">

      <div className="relative flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl sm:h-[92vh] sm:rounded-[28px] lg:rounded-[35px]">

        {/* ==================================================
            CLOSE
        ================================================== */}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 shadow-lg backdrop-blur transition hover:bg-gray-50 sm:right-5 sm:top-5 sm:h-11 sm:w-11 sm:rounded-2xl"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* ==================================================
            BANNER
        ================================================== */}

        <div className="relative h-36 shrink-0 bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 sm:h-52 md:h-64 lg:h-72">

          {shop.banner ||
          shop.logo ? (
            <img
              src={
                shop.banner ||
                shop.logo
              }
              alt={shop.shop_name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Store className="h-14 w-14 text-white/40 sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/25" />

          {/* ==================================================
              LOGO
          ================================================== */}

          <div className="absolute -bottom-9 left-4 sm:left-7 sm:-bottom-12 lg:left-10 lg:-bottom-14">

            <div className="flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-[20px] border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24 sm:rounded-[28px] sm:border-5 lg:h-28 lg:w-28">

              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.shop_name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Store className="h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
              )}

            </div>
          </div>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFC] px-3 pb-4 pt-12 sm:px-5 sm:pb-6 sm:pt-16 lg:px-7">

          {/* ==================================================
              TOP INFO
          ================================================== */}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

            <div className="min-w-0">

              <h2 className="break-words text-xl font-black leading-tight text-[#0F172A] sm:text-2xl lg:text-3xl">
                {shop.shop_name}
              </h2>

              <p className="mt-1 text-[11px] font-semibold text-gray-500 sm:text-sm">
                Owner:{" "}
                <span className="text-gray-700">
                  {shop.owner_name ||
                    "-"}
                </span>
              </p>

              {/* IDS */}

              <div className="mt-2.5 flex max-w-full flex-wrap gap-1.5 sm:gap-2">

                <InfoBadge
                  text={`Shop: ${
                    shop.shop_uid ||
                    "N/A"
                  }`}
                  className="border-violet-100 bg-violet-50 text-violet-700"
                />

                <InfoBadge
                  text={`Serial: #${
                    shop.serial_no ||
                    0
                  }`}
                  className="border-orange-100 bg-orange-50 text-orange-700"
                />

                <InfoBadge
                  text={`Date: ${
                    shop.joined_date
                      ? new Date(
                          shop.joined_date,
                        ).toLocaleDateString(
                          "en-GB",
                        )
                      : "-"
                  }`}
                  className="border-emerald-100 bg-emerald-50 text-emerald-700"
                />

              </div>
            </div>

            {/* STATUS */}

            <div className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm sm:w-auto sm:justify-start sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">

              <div className="rounded-xl border border-sky-100 bg-sky-50 px-2.5 py-1.5 sm:px-3 sm:py-2">
                <p className="text-[10px] font-black text-sky-700 sm:text-xs">
                  Products:{" "}
                  {productsCount}
                </p>
              </div>

              <span
                className={`
                  flex
                  h-7
                  items-center
                  justify-center
                  rounded-full
                  px-3
                  text-[9px]
                  font-black
                  uppercase
                  tracking-wide
                  ${
                    isOnline
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }
                `}
              >
                {shop.status ||
                  "offline"}
              </span>

              <button
                type="button"
                aria-label="Toggle shop status"
                onClick={
                  onToggleStatus
                }
                className={`
                  flex
                  h-6
                  w-11
                  shrink-0
                  items-center
                  rounded-full
                  p-1
                  transition-all
                  ${
                    isOnline
                      ? "justify-end bg-green-500"
                      : "justify-start bg-gray-300"
                  }
                `}
              >
                <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
              </button>

            </div>
          </div>

          {/* ==================================================
              INFORMATION
          ================================================== */}

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3">

            <DetailCard
              icon={Phone}
              title="Phone"
              value={
                shop.phone ||
                "-"
              }
              iconClass="text-sky-500"
              iconBg="bg-sky-100"
            />

            <DetailCard
              icon={Mail}
              title="Email"
              value={
                shop.email ||
                "-"
              }
              iconClass="text-pink-500"
              iconBg="bg-pink-100"
            />

            <DetailCard
              icon={Package}
              title="Category"
              value={
                shop.category ||
                "-"
              }
              iconClass="text-orange-500"
              iconBg="bg-orange-100"
            />

            <DetailCard
              icon={MapPin}
              title="Location"
              value={
                [
                  shop.city,
                  shop.state,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                "-"
              }
              iconClass="text-green-500"
              iconBg="bg-green-100"
            />

            <DetailCard
              full
              icon={Store}
              title="Address"
              value={
                shop.address ||
                "-"
              }
              iconClass="text-violet-500"
              iconBg="bg-violet-100"
            />

            <DetailCard
              full
              icon={FileText}
              title="Description"
              value={
                shop.description ||
                "-"
              }
              iconClass="text-cyan-500"
              iconBg="bg-cyan-100"
            />

          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">

            <ActionButton
              primary
              icon={Package}
              label="Products"
              onClick={
                onProducts
              }
            />

            <ActionButton
              icon={Pencil}
              label="Edit"
              onClick={onEdit}
            />

            <ActionButton
              danger
              icon={Trash2}
              label="Delete"
              onClick={onDelete}
            />

          </div>

        </div>
      </div>
    </div>
  );
}

/* ======================================================
   INFO BADGE
====================================================== */

function InfoBadge({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
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
        ${
          full
            ? "sm:col-span-2"
            : ""
        }
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
          <Icon
            className={`h-4 w-4 ${iconClass}`}
          />
        </div>

        <p className="min-w-0 break-words text-[11px] leading-4 text-gray-600 sm:text-xs sm:leading-5">
          <span className="font-black text-[#0F172A]">
            {title}:
          </span>{" "}
          {value}
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
              {editingShop
                ? "Edit Shop"
                : "Register Shop"}
            </h2>

            <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-sm">
              {editingShop
                ? "Update shop information"
                : "Add a new shop"}
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
            editingShop={
              editingShop
            }
            onSuccess={
              onSuccess
            }
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
        {hasSearch
          ? "No Shops Found"
          : "No Shops Yet"}
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
        <div
          key={index}
          className="flex flex-col items-center"
        >

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