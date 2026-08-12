"use client";

import React from "react";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Package,
  Pencil,
  Trash2,
  Mail,
  FileText,
  Hash,
  CalendarDays,
  UserRound,
  MapPinned,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CircleCheck,
  CircleX,
  ShoppingBag,
  Building2,
  Globe2,
} from "lucide-react";

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

type ShopProfileProps = {
  shop: Shop;
  productsCount: number;

  onBack: () => void;
  onProducts: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
};

/* ======================================================
   HELPERS
====================================================== */

function getImageUrl(url?: string) {
  return url?.trim() || "";
}

function formatDate(date?: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ======================================================
   SHOP PROFILE
====================================================== */

export default function ShopProfile({
  shop,
  productsCount,
  onBack,
  onProducts,
  onEdit,
  onDelete,
  onToggleStatus,
}: ShopProfileProps) {
  const isOnline = shop.status === "online";

  const location =
    [shop.city, shop.state].filter(Boolean).join(", ") ||
    "Location not available";

  const shopId = shop.shop_uid || `SHOP-${shop.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900">
      {/* ==================================================
          SHOP HEADER
      ================================================== */}

      <header className="relative z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14.5 max-w-[1700px] items-center justify-between px-3 sm:h-16 sm:px-5 lg:px-8 mt-10">
          {/* BACK */}

          <button
            type="button"
            onClick={onBack}
            className="
              group
              flex
              h-9
              shrink-0
              items-center
              gap-1.5
              rounded-xl
              border
              border-slate-200
              bg-white
              px-2.5
              text-[10px]
              font-black
              text-slate-600
              shadow-sm
              transition
              hover:bg-slate-50
              active:scale-95
              sm:h-10
              sm:gap-2
              sm:px-3.5
              sm:text-xs
            "
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />

            <span className="hidden sm:inline">Back to Shops</span>

            <span className="sm:hidden">Back</span>
          </button>

          {/* CENTER */}

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm sm:h-9 sm:w-9">
              <Store className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-black tracking-tight text-slate-950">
                Store Hub
              </p>

              <p className="text-[9px] font-medium text-slate-400">
                Store management
              </p>
            </div>

            <p className="text-[11px] font-black text-slate-950 sm:hidden">
              Store Hub
            </p>
          </div>

          {/* STATUS */}

          <div className="flex items-center gap-2">
            {/* DESKTOP STATUS */}

            <div
              className={`
                hidden
                items-center
                gap-1.5
                rounded-full
                border
                px-3
                py-1.5
                sm:flex
                ${
                  isOnline
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-red-200 bg-red-50 text-red-500"
                }
              `}
            >
              {isOnline ? (
                <CircleCheck className="h-3.5 w-3.5" />
              ) : (
                <CircleX className="h-3.5 w-3.5" />
              )}

              <span className="text-[9px] font-black uppercase tracking-wide">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* MOBILE STATUS */}

            <div
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                border
                sm:hidden
                ${
                  isOnline
                    ? "border-emerald-100 bg-emerald-50"
                    : "border-red-100 bg-red-50"
                }
              `}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
            </div>

            {/* TOGGLE */}

            <button
              type="button"
              onClick={onToggleStatus}
              aria-label={isOnline ? "Set shop offline" : "Set shop online"}
              className={`
                relative
                flex
                h-6
                w-11
                items-center
                rounded-full
                p-1
                transition
                active:scale-95
                ${
                  isOnline
                    ? "justify-end bg-emerald-500"
                    : "justify-start bg-slate-300"
                }
              `}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1700px] px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950 shadow-[0_12px_40px_rgba(15,23,42,0.12)] sm:rounded-[30px]">
            {/* BANNER */}

            <div className="relative h-[190px] w-full sm:h-[270px] lg:h-[330px]">
              {shop.banner || shop.logo ? (
                <img
                  src={getImageUrl(shop.banner || shop.logo)}
                  alt={shop.shop_name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-700">
                  <Store className="h-20 w-20 text-white/20 sm:h-28 sm:w-28" />
                </div>
              )}

              {/* DARK OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              {/* TOP GLOW */}

              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

              {/* INNER BORDER */}

              <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/10 sm:rounded-[30px]" />

              {/* STORE ID */}

              <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
                <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/45 px-2.5 py-2 backdrop-blur-xl sm:px-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                    <Hash className="h-3.5 w-3.5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-white/50">
                      Store ID
                    </p>

                    <p className="max-w-[105px] truncate text-[9px] font-black text-white sm:max-w-[170px] sm:text-[10px]">
                      {shopId}
                    </p>
                  </div>
                </div>
              </div>

              {/* E-AURIX BADGE */}

              <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-xl">
                  <ShoppingBag className="h-3.5 w-3.5 text-white" />

                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white">
                    Listed on E-Aurix
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          STORE IDENTITY
      ================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1700px] px-3 sm:px-5 lg:px-8">
          <div className="relative">
            {/* IDENTITY */}

            <div className="flex items-end gap-3 sm:gap-5">
              {/* LOGO */}

              <div className="relative -mt-10 shrink-0 sm:-mt-14">
                <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[22px] border-[4px] border-white bg-white shadow-[0_10px_30px_rgba(15,23,42,0.18)] sm:h-[108px] sm:w-[108px] sm:rounded-[28px] sm:border-[5px]">
                  {shop.logo ? (
                    <img
                      src={getImageUrl(shop.logo)}
                      alt={shop.shop_name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Store className="h-9 w-9 text-slate-300 sm:h-12 sm:w-12" />
                  )}
                </div>

                {/* STATUS */}

                <span
                  className={`
                    absolute
                    bottom-1
                    right-1
                    h-4
                    w-4
                    rounded-full
                    border-[3px]
                    border-white
                    sm:bottom-2
                    sm:right-2
                    sm:h-5
                    sm:w-5
                    ${isOnline ? "bg-emerald-500" : "bg-red-500"}
                  `}
                />
              </div>

              {/* NAME */}

              <div className="min-w-0 flex-1 pb-1 sm:pb-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-lg font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
                    {shop.shop_name}
                  </h1>
                </div>

                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[10px] font-bold text-slate-500 sm:text-xs">
                    {shop.category || "General Store"}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span
                    className={`text-[10px] font-black sm:text-xs ${
                      isOnline ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {isOnline ? "Open" : "Offline"}
                  </span>
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />

                  <span className="truncate text-[9px] font-medium text-slate-400 sm:text-[10px]">
                    {location}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-4 grid grid-cols-3 gap-2 border-b border-slate-200 pb-4 sm:mt-5 sm:flex sm:justify-end sm:gap-2">
              <HubAction
                icon={Package}
                label="Products"
                primary
                onClick={onProducts}
              />

              <HubAction icon={Pencil} label="Edit" onClick={onEdit} />

              <HubAction
                icon={Trash2}
                label="Delete"
                danger
                onClick={onDelete}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="mx-auto max-w-[1700px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:gap-4">
          <HubStat
            icon={Package}
            label="Products"
            value={String(productsCount)}
            iconBg="bg-sky-50"
            iconColor="text-sky-500"
          />

          <HubStat
            icon={UserRound}
            label="Owner"
            value={shop.owner_name || "-"}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
          />

          <HubStat
            icon={CalendarDays}
            label="Joined"
            value={formatDate(shop.joined_date || shop.created_at)}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />

          <HubStat
            icon={ShieldCheck}
            label="Status"
            value={isOnline ? "Active" : "Offline"}
            iconBg={isOnline ? "bg-emerald-50" : "bg-red-50"}
            iconColor={isOnline ? "text-emerald-500" : "text-red-500"}
          />
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="min-w-0 space-y-4 lg:space-y-6">
            {/* STORE OVERVIEW */}

            <HubCard
              title="Store Overview"
              subtitle="Essential store information"
              icon={Building2}
            >
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
                  icon={MapPinned}
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
            </HubCard>

            {/* ABOUT */}

            <HubCard
              title="About Store"
              subtitle="Store description"
              icon={FileText}
            >
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="whitespace-pre-wrap break-words text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
                  {shop.description ||
                    "No store description has been added yet."}
                </p>
              </div>
            </HubCard>

            {/* STORE INFORMATION */}

            <HubCard
              title="Store Information"
              subtitle="Registered store details"
              icon={ShieldCheck}
            >
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <MiniInfo icon={Hash} label="Store ID" value={shopId} />

                <MiniInfo
                  icon={Hash}
                  label="Serial"
                  value={shop.serial_no ? `#${shop.serial_no}` : "-"}
                />

                <MiniInfo
                  icon={CalendarDays}
                  label="Joined"
                  value={formatDate(shop.joined_date || shop.created_at)}
                />

                <MiniInfo
                  icon={UserRound}
                  label="Owner"
                  value={shop.owner_name || "-"}
                />

                <MiniInfo icon={MapPin} label="City" value={shop.city || "-"} />

                <MiniInfo
                  icon={MapPinned}
                  label="State"
                  value={shop.state || "-"}
                />

                <MiniInfo
                  icon={FileText}
                  label="GST Number"
                  value={shop.gst_number || "-"}
                  full
                />
              </div>
            </HubCard>
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside className="min-w-0 space-y-4 lg:space-y-6">
            {/* INVENTORY */}

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-600 p-5 text-white sm:p-6">
                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10" />

                <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/65">
                        Inventory
                      </p>

                      <p className="mt-1 text-5xl font-black tracking-tight">
                        {productsCount}
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-white/75">
                        Products listed on E-Aurix
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onProducts}
                    className="
                      mt-6
                      flex
                      h-11
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      bg-white
                      px-4
                      text-[10px]
                      font-black
                      text-sky-600
                      shadow-lg
                      transition
                      hover:bg-sky-50
                      active:scale-[0.99]
                    "
                  >
                    <span>Manage Products</span>

                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* STATUS */}

            <HubCard
              title="Store Status"
              subtitle="Visibility on E-Aurix"
              icon={Globe2}
            >
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${isOnline ? "bg-emerald-100" : "bg-red-100"}
                    `}
                  >
                    {isOnline ? (
                      <CircleCheck className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <CircleX className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-800">
                      {isOnline ? "Store is Online" : "Store is Offline"}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {isOnline ? "Visible to customers" : "Currently hidden"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleStatus}
                  className={`
                    flex
                    h-6
                    w-11
                    shrink-0
                    items-center
                    rounded-full
                    p-1
                    transition
                    ${
                      isOnline
                        ? "justify-end bg-emerald-500"
                        : "justify-start bg-slate-300"
                    }
                  `}
                >
                  <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </HubCard>

            {/* CONTACT */}

            <HubCard
              title="Contact"
              subtitle="Store contact information"
              icon={Phone}
            >
              <div className="space-y-2">
                <ContactItem
                  icon={Phone}
                  label="Phone"
                  value={shop.phone || "Not available"}
                  href={shop.phone ? `tel:${shop.phone}` : undefined}
                  iconBg="bg-sky-50"
                  iconColor="text-sky-500"
                />

                <ContactItem
                  icon={Mail}
                  label="Email"
                  value={shop.email || "Not available"}
                  href={shop.email ? `mailto:${shop.email}` : undefined}
                  iconBg="bg-pink-50"
                  iconColor="text-pink-500"
                />

                <ContactItem
                  icon={MapPin}
                  label="Location"
                  value={location}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-500"
                />
              </div>
            </HubCard>

            {/* STORE ID */}

            <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Hash className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Store Identifier
                  </p>

                  <p className="mt-1 truncate text-xs font-black text-slate-900">
                    {shopId}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[8px] font-bold uppercase text-slate-400">
                    Serial
                  </p>

                  <p className="mt-1 text-xs font-black text-slate-800">
                    {shop.serial_no ? `#${shop.serial_no}` : "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[8px] font-bold uppercase text-slate-400">
                    GST
                  </p>

                  <p className="mt-1 truncate text-xs font-black text-slate-800">
                    {shop.gst_number || "-"}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ======================================================
   HUB STAT
====================================================== */

function HubStat({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            sm:h-10
            sm:w-10
            ${iconBg}
          `}
        >
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400 sm:text-[9px]">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xs font-black text-slate-900 sm:text-sm">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   HUB CARD
====================================================== */

function HubCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: typeof Store;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-sm font-black tracking-tight text-slate-950 sm:text-base">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[9px] font-medium text-slate-400 sm:text-[10px]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* ======================================================
   PROFILE INFO
====================================================== */

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
      className={`
        flex
        min-w-0
        items-start
        gap-3
        rounded-2xl
        border
        border-slate-100
        bg-slate-50/70
        p-3
        transition
        hover:border-slate-200
        hover:bg-white
        ${full ? "sm:col-span-2" : ""}
      `}
    >
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconBg}
        `}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black uppercase tracking-wide text-slate-400 sm:text-[9px]">
          {label}
        </p>

        <p className="mt-1 break-words text-[10px] font-bold leading-4 text-slate-700 sm:text-xs sm:leading-5">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ======================================================
   MINI INFO
====================================================== */

function MiniInfo({
  icon: Icon,
  label,
  value,
  full = false,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-slate-100
        bg-slate-50
        p-3
        sm:p-4
        ${full ? "col-span-2 sm:col-span-1" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-400" />

        <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-[10px] font-black leading-4 text-slate-700 sm:text-xs">
        {value}
      </p>
    </div>
  );
}

/* ======================================================
   CONTACT ITEM
====================================================== */

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  iconBg,
  iconColor,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  href?: string;
  iconBg: string;
  iconColor: string;
}) {
  const content = (
    <>
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconBg}
        `}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-bold text-slate-700 sm:text-xs">
          {value}
        </p>
      </div>

      {href && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100 active:scale-[0.99]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3">
      {content}
    </div>
  );
}

/* ======================================================
   HUB ACTION
====================================================== */

function HubAction({
  icon: Icon,
  label,
  onClick,
  primary = false,
  danger = false,
}: {
  icon: typeof Store;
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
        min-w-0
        items-center
        justify-center
        gap-1.5
        rounded-xl
        px-2
        text-[10px]
        font-black
        transition
        active:scale-95
        sm:h-11
        sm:px-5
        sm:text-xs
        ${
          primary
            ? "bg-sky-500 text-white shadow-sm shadow-sky-100 hover:bg-sky-600"
            : danger
              ? "border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }
      `}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />

      <span className="truncate">{label}</span>
    </button>
  );
}
