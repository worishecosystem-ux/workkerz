"use client";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  IndianRupee,
  MapPin,
  ShoppingBag,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DeviceType = "mobile" | "tablet" | "desktop";

type Props = {
  device: DeviceType;
  order: any;
  onView: (order: any) => void;
  onConfirm: (id: string | number, status: string) => void;
  onReject: (order: any) => void;
};

export default function NewOrderCard({
  device,
  order,
  onView,
  onConfirm,
  onReject,
}: Props) {
  const isMobile = device === "mobile";
  const isTablet = device === "tablet";
  const isDesktop = device === "desktop";

  /* =====================================================
     CURRENT TIME
  ===================================================== */

  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  /* =====================================================
     ORDER CREATED TIME
  ===================================================== */

  const createdAt = useMemo(() => {
    if (!order?.created_at) return now;

    const timestamp = new Date(
      order.created_at,
    ).getTime();

    return Number.isFinite(timestamp)
      ? timestamp
      : now;
  }, [order?.created_at, now]);

  /* =====================================================
     ORDER TIMER
  ===================================================== */

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - createdAt) / 1000),
  );

  const minutes = Math.floor(
    elapsedSeconds / 60,
  );

  const seconds = elapsedSeconds % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;

  const timerState =
    elapsedSeconds >= 60
      ? "urgent"
      : elapsedSeconds >= 30
        ? "warning"
        : "normal";

  const timerConfig = {
    normal: {
      wrapper:
        "border-emerald-100 bg-emerald-50",
      icon: "text-emerald-600",
      time: "text-emerald-700",
      label: "Waiting",
      dot: "bg-emerald-500",
    },
    warning: {
      wrapper:
        "border-orange-100 bg-orange-50",
      icon: "text-orange-600",
      time: "text-orange-700",
      label: "Waiting",
      dot: "bg-orange-500",
    },
    urgent: {
      wrapper:
        "border-red-100 bg-red-50",
      icon: "text-red-600",
      time: "text-red-700",
      label: "Urgent",
      dot: "bg-red-500",
    },
  }[timerState];

  /* =====================================================
     ORDER DATA
  ===================================================== */

  const itemCount = Array.isArray(
    order?.items,
  )
    ? order.items.length
    : 1;

  const paymentMethod = String(
    order?.payment_method || "Cash",
  ).toUpperCase();

  const total = Number(
    order?.total ??
      order?.total_amount ??
      order?.amount ??
      0,
  );

  /* =====================================================
     DEVICE CLASSES
  ===================================================== */

  const cardRadius = isMobile
    ? "rounded-xl"
    : "rounded-2xl";

  const cardPadding = isMobile
    ? "p-3 pl-4"
    : isTablet
      ? "p-3.5 pl-4"
      : "p-4 pl-5";

  const headerGap = isMobile
    ? "gap-2"
    : isTablet
      ? "gap-2.5"
      : "gap-3";

  const avatarSize = isMobile
    ? "h-8 w-8"
    : isTablet
      ? "h-9 w-9"
      : "h-10 w-10";

  const avatarIconSize = isMobile
    ? "h-3.5 w-3.5"
    : isTablet
      ? "h-4 w-4"
      : "h-[18px] w-[18px]";

  const customerNameSize = isMobile
    ? "text-[12px]"
    : isTablet
      ? "text-[13px]"
      : "text-sm";

  const secondaryTextSize = isMobile
    ? "text-[9px]"
    : isTablet
      ? "text-[10px]"
      : "text-[11px]";

  const valueSectionMargin = isMobile
    ? "mt-2.5"
    : isTablet
      ? "mt-3"
      : "mt-4";

  const infoMargin = isMobile
    ? "mt-2"
    : isTablet
      ? "mt-2.5"
      : "mt-3";

  const actionMargin = isMobile
    ? "mt-2.5"
    : isTablet
      ? "mt-3"
      : "mt-4";

  const actionHeight = isMobile
    ? "h-8"
    : isTablet
      ? "h-9"
      : "h-10";

  const actionText = isMobile
    ? "text-[8px]"
    : isTablet
      ? "text-[9px]"
      : "text-[10px]";

  const infoText = isMobile
    ? "text-[7px]"
    : isTablet
      ? "text-[8px]"
      : "text-[9px]";

  return (
    <article
      className={`relative box-border w-full min-w-0 max-w-full overflow-hidden border border-slate-200 bg-white ${cardRadius} shadow-sm transition-all hover:border-orange-200 hover:shadow-md`}
    >
      {/* =====================================================
          LEFT ACCENT
      ===================================================== */}

      <div
        className={`absolute inset-y-0 left-0 z-10 w-1 ${
          timerState === "urgent"
            ? "bg-red-500"
            : timerState === "warning"
              ? "bg-orange-500"
              : "bg-gradient-to-b from-orange-500 to-red-500"
        }`}
      />

      <div className={`min-w-0 ${cardPadding}`}>
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className={`flex min-w-0 items-center justify-between ${headerGap}`}
        >
          {/* CUSTOMER */}

          <div
            className={`flex min-w-0 flex-1 items-center ${
              isMobile
                ? "gap-2"
                : isTablet
                  ? "gap-2.5"
                  : "gap-3"
            }`}
          >
            <div
              className={`flex shrink-0 items-center justify-center rounded-full bg-orange-50 ${avatarSize}`}
            >
              <User
                className={`${avatarIconSize} text-orange-600`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className={`truncate font-bold text-slate-900 ${customerNameSize}`}
              >
                {order?.customer_name ||
                  "Customer"}
              </h3>

              <p
                className={`mt-0.5 truncate text-slate-400 ${secondaryTextSize}`}
              >
                #{order?.order_number || "-"}
              </p>

              {order?.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className={`mt-0.5 block truncate text-slate-500 transition hover:text-orange-600 ${secondaryTextSize}`}
                >
                  {order.customer_phone}
                </a>
              )}
            </div>
          </div>

          {/* NEW BADGE */}

          <span
            className={`flex shrink-0 items-center rounded-full bg-red-50 font-bold text-red-600 ${
              isMobile
                ? "gap-1 px-2 py-1 text-[7px]"
                : isTablet
                  ? "gap-1 px-2 py-1.5 text-[8px]"
                  : "gap-1.5 px-2.5 py-1.5 text-[9px]"
            }`}
          >
            <span
              className={`animate-pulse rounded-full bg-red-500 ${
                isMobile
                  ? "h-1 w-1"
                  : "h-1.5 w-1.5"
              }`}
            />

            NEW
          </span>
        </div>

        {/* =====================================================
            VALUE + TIMER
        ===================================================== */}

        <div
          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center rounded-xl bg-slate-50 ${
            isMobile
              ? "gap-1.5 px-2 py-2"
              : isTablet
                ? "gap-2 px-2.5 py-2.5"
                : "gap-3 px-3 py-3"
          } ${valueSectionMargin}`}
        >
          {/* VALUE */}

          <div className="min-w-0">
            <p
              className={`font-semibold uppercase tracking-wider text-slate-400 ${
                isMobile
                  ? "text-[7px]"
                  : isTablet
                    ? "text-[8px]"
                    : "text-[9px]"
              }`}
            >
              Order Value
            </p>

            <div
              className={`mt-1 flex min-w-0 items-center ${
                isMobile
                  ? "gap-0.5"
                  : "gap-1"
              }`}
            >
              <IndianRupee
                className={`shrink-0 text-emerald-600 ${
                  isMobile
                    ? "h-3 w-3"
                    : isTablet
                      ? "h-3.5 w-3.5"
                      : "h-4 w-4"
                }`}
              />

              <span
                className={`truncate font-extrabold leading-none text-emerald-600 ${
                  isMobile
                    ? "text-sm"
                    : isTablet
                      ? "text-base"
                      : "text-lg"
                }`}
              >
                {total.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          </div>

          {/* TIMER */}

          <div
            className={`flex min-w-0 shrink-0 items-center rounded-xl border ${
              isMobile
                ? "gap-1 px-1.5 py-1"
                : isTablet
                  ? "gap-1.5 px-2 py-1.5"
                  : "gap-2 px-2.5 py-2"
            } ${timerConfig.wrapper}`}
          >
            <div
              className={`relative flex shrink-0 items-center justify-center rounded-lg bg-white ${
                isMobile
                  ? "h-5 w-5"
                  : isTablet
                    ? "h-6 w-6"
                    : "h-7 w-7"
              }`}
            >
              <Clock3
                className={`${isMobile ? "h-2.5 w-2.5" : isTablet ? "h-3 w-3" : "h-3.5 w-3.5"} ${timerConfig.icon}`}
              />

              <span
                className={`absolute -right-0.5 -top-0.5 rounded-full ${isMobile ? "h-1 w-1" : "h-1.5 w-1.5"} ${timerConfig.dot} ${
                  timerState === "urgent"
                    ? "animate-pulse"
                    : ""
                }`}
              />
            </div>

            <div className="min-w-0">
              <p
                className={`font-bold uppercase tracking-wide text-slate-500 ${
                  isMobile
                    ? "text-[6px]"
                    : isTablet
                      ? "text-[7px]"
                      : "text-[8px]"
                }`}
              >
                {timerConfig.label}
              </p>

              <p
                className={`mt-0.5 font-mono font-black leading-none tabular-nums ${
                  isMobile
                    ? "text-[10px]"
                    : isTablet
                      ? "text-xs"
                      : "text-sm"
                } ${timerConfig.time}`}
              >
                {formattedTime}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            INFO
        ===================================================== */}

        <div
          className={`grid min-w-0 grid-cols-3 ${
            isMobile
              ? "gap-1"
              : isTablet
                ? "gap-1.5"
                : "gap-2"
          } ${infoMargin}`}
        >
          {/* ITEMS */}

          <div
            className={`flex min-w-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ${
              isMobile
                ? "gap-0.5 px-1 py-1.5"
                : isTablet
                  ? "gap-1 px-1.5 py-2"
                  : "gap-1.5 px-2 py-2.5"
            }`}
          >
            <ShoppingBag
              className={`shrink-0 text-slate-500 ${
                isMobile
                  ? "h-2.5 w-2.5"
                  : isTablet
                    ? "h-3 w-3"
                    : "h-3.5 w-3.5"
              }`}
            />

            <span
              className={`truncate font-semibold text-slate-600 ${infoText}`}
            >
              {itemCount} Items
            </span>
          </div>

          {/* PAYMENT */}

          <div
            className={`flex min-w-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-50 ${
              isMobile
                ? "gap-0.5 px-1 py-1.5"
                : isTablet
                  ? "gap-1 px-1.5 py-2"
                  : "gap-1.5 px-2 py-2.5"
            }`}
          >
            <CreditCard
              className={`shrink-0 text-emerald-600 ${
                isMobile
                  ? "h-2.5 w-2.5"
                  : isTablet
                    ? "h-3 w-3"
                    : "h-3.5 w-3.5"
              }`}
            />

            <span
              className={`truncate font-semibold text-emerald-700 ${infoText}`}
            >
              {paymentMethod}
            </span>
          </div>

          {/* DISTANCE */}

          <div
            className={`flex min-w-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50 ${
              isMobile
                ? "gap-0.5 px-1 py-1.5"
                : isTablet
                  ? "gap-1 px-1.5 py-2"
                  : "gap-1.5 px-2 py-2.5"
            }`}
          >
            <MapPin
              className={`shrink-0 text-blue-600 ${
                isMobile
                  ? "h-2.5 w-2.5"
                  : isTablet
                    ? "h-3 w-3"
                    : "h-3.5 w-3.5"
              }`}
            />

            <span
              className={`truncate font-semibold text-blue-700 ${infoText}`}
            >
              2.4 km
            </span>
          </div>
        </div>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div
          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] ${
            isMobile
              ? "gap-1"
              : isTablet
                ? "gap-1.5"
                : "gap-2"
          } ${actionMargin}`}
        >
          {/* ACCEPT */}

          <button
            type="button"
            onClick={() =>
              onConfirm(
                order.id,
                "Confirmed",
              )
            }
            className={`flex min-w-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-600 font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] ${actionHeight} ${actionText} ${
              isMobile
                ? "gap-0.5 px-1"
                : isTablet
                  ? "gap-1 px-2"
                  : "gap-1.5 px-3"
            }`}
          >
            <CheckCircle2
              className={`shrink-0 ${
                isMobile
                  ? "h-3 w-3"
                  : isTablet
                    ? "h-3.5 w-3.5"
                    : "h-4 w-4"
              }`}
            />

            <span className="truncate">
              Accept
            </span>
          </button>

          {/* REJECT */}

          <button
            type="button"
            onClick={() =>
              onReject(order)
            }
            className={`flex min-w-0 items-center justify-center overflow-hidden rounded-lg bg-red-50 font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] ${actionHeight} ${actionText} ${
              isMobile
                ? "gap-0.5 px-1"
                : isTablet
                  ? "gap-1 px-2"
                  : "gap-1.5 px-3"
            }`}
          >
            <XCircle
              className={`shrink-0 ${
                isMobile
                  ? "h-3 w-3"
                  : isTablet
                    ? "h-3.5 w-3.5"
                    : "h-4 w-4"
              }`}
            />

            <span className="truncate">
              Reject
            </span>
          </button>

          {/* VIEW */}

          <button
            type="button"
            onClick={() =>
              onView(order)
            }
            title="View Order"
            aria-label="View Order"
            className={`flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] ${actionHeight} ${
              isMobile
                ? "w-8"
                : isTablet
                  ? "w-9"
                  : "w-10"
            }`}
          >
            <Eye
              className={`${
                isMobile
                  ? "h-3 w-3"
                  : isTablet
                    ? "h-3.5 w-3.5"
                    : "h-4 w-4"
              }`}
            />
          </button>
        </div>

        {/* =====================================================
            STATUS
        ===================================================== */}

        <div
          className={`flex items-center justify-center ${
            isMobile
              ? "mt-2 gap-1"
              : isTablet
                ? "mt-2.5 gap-1.5"
                : "mt-3 gap-1.5"
          }`}
        >
          <span
            className={`shrink-0 rounded-full ${
              isMobile
                ? "h-1 w-1"
                : "h-1.5 w-1.5"
            } ${timerConfig.dot} ${
              timerState === "urgent"
                ? "animate-pulse"
                : ""
            }`}
          />

          <span
            className={`font-medium text-slate-400 ${
              isMobile
                ? "text-[7px]"
                : isTablet
                  ? "text-[8px]"
                  : "text-[9px]"
            }`}
          >
            {timerState === "urgent"
              ? "Please respond"
              : "Waiting for response"}
          </span>
        </div>
      </div>
    </article>
  );
}