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

import { useEffect, useState } from "react";

type Props = {
  order: any;
  onView: (order: any) => void;
  onConfirm: (id: string | number, status: string) => void;
  onReject: (order: any) => void;
};

export default function NewOrderCard({
  order,
  onView,
  onConfirm,
  onReject,
}: Props) {
  /*
   * =========================================================
   * RESPONSE TIMER
   * =========================================================
   *
   * Timer starts when this order appears in the card.
   * It does NOT use created_at.
   */

  const [arrivalTime, setArrivalTime] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());

  /*
   * Reset timer when a different order appears.
   */
  useEffect(() => {
    if (!order?.id) return;

    const startedAt = Date.now();

    setArrivalTime(startedAt);
    setNow(startedAt);
  }, [order?.id]);

  /*
   * Live timer
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * Calculate elapsed time
   */
  const elapsedSeconds = Math.max(0, Math.floor((now - arrivalTime) / 1000));

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;

  /*
   * Timer color/state
   */
  const timerState =
    elapsedSeconds >= 60
      ? "urgent"
      : elapsedSeconds >= 30
        ? "warning"
        : "normal";

  const timerConfig = {
    normal: {
      wrapper: "bg-emerald-50 border-emerald-100",
      icon: "text-emerald-600",
      time: "text-emerald-700",
      label: "Waiting",
      dot: "bg-emerald-500",
    },

    warning: {
      wrapper: "bg-orange-50 border-orange-100",
      icon: "text-orange-600",
      time: "text-orange-700",
      label: "Waiting",
      dot: "bg-orange-500",
    },

    urgent: {
      wrapper: "bg-red-50 border-red-100",
      icon: "text-red-600",
      time: "text-red-700",
      label: "Urgent",
      dot: "bg-red-500",
    },
  }[timerState];

  return (
    <article
      className="
        relative
        w-full
        min-w-[280px]
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition
        hover:border-orange-200
        hover:shadow-md
        sm:min-w-[300px]
      "
    >
      {/* =====================================================
          ACCENT
      ===================================================== */}

      <div
        className={`
          absolute
          inset-y-0
          left-0
          w-1
          ${
            timerState === "urgent"
              ? "bg-red-500"
              : timerState === "warning"
                ? "bg-orange-500"
                : "bg-gradient-to-b from-orange-500 to-red-500"
          }
        `}
      />

      <div className="p-3 sm:p-3.5">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* USER ICON */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-orange-50
              "
            >
              <User className="h-4 w-4 text-orange-600" />
            </div>

            {/* CUSTOMER */}

            <div className="min-w-0">
              <h3 className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                {order.customer_name || "Customer"}
              </h3>

              <p className="truncate text-[9px] text-slate-400">
                #{order.order_number || "-"}
              </p>

              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="
                    block
                    truncate
                    text-[10px]
                    text-slate-500
                    hover:text-orange-600
                  "
                >
                  {order.customer_phone}
                </a>
              )}
            </div>
          </div>

          {/* NEW BADGE */}

          <span
            className="
              flex
              shrink-0
              items-center
              gap-1
              rounded-full
              bg-red-50
              px-2
              py-1
              text-[8px]
              font-bold
              text-red-600
            "
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            NEW
          </span>
        </div>

        {/* =====================================================
            ORDER VALUE
        ===================================================== */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-2
            rounded-lg
            bg-slate-50
            px-2.5
            py-2
          "
        >
          <div className="min-w-0">
            <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
              Order Value
            </p>

            <div className="mt-0.5 flex items-center gap-0.5">
              <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />

              <span className="text-base font-extrabold text-emerald-600 sm:text-lg">
                {Number(order.total || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* ===================================================
              LIVE TIMER
          =================================================== */}

          <div
            className={`
              flex
              min-w-[82px]
              shrink-0
              items-center
              gap-1.5
              rounded-lg
              border
              px-2
              py-1.5
              ${timerConfig.wrapper}
            `}
          >
            <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-white/80">
              <Clock3 className={`h-3 w-3 ${timerConfig.icon}`} />

              <span
                className={`
                  absolute
                  -right-0.5
                  -top-0.5
                  h-1.5
                  w-1.5
                  rounded-full
                  ${timerConfig.dot}
                  ${timerState === "urgent" ? "animate-pulse" : ""}
                `}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[7px] font-bold uppercase tracking-wide opacity-60">
                {timerConfig.label}
              </p>

              <p
                className={`
                  font-mono
                  text-[13px]
                  font-black
                  leading-none
                  tabular-nums
                  ${timerConfig.time}
                `}
              >
                {formattedTime}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            INFO CHIPS
        ===================================================== */}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {/* ITEMS */}

          <span
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-slate-100
              px-2
              py-1
              text-[8px]
              font-semibold
              text-slate-600
            "
          >
            <ShoppingBag className="h-2.5 w-2.5" />
            {order.items?.length || 1} Items
          </span>

          {/* PAYMENT */}

          <span
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-emerald-50
              px-2
              py-1
              text-[8px]
              font-semibold
              text-emerald-700
            "
          >
            <CreditCard className="h-2.5 w-2.5" />

            {order.payment_method || "Cash"}
          </span>

          {/* DISTANCE */}

          <span
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-blue-50
              px-2
              py-1
              text-[8px]
              font-semibold
              text-blue-700
            "
          >
            <MapPin className="h-2.5 w-2.5" />
            2.4 km
          </span>
        </div>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-1.5">
          {/* ACCEPT */}

          <button
            type="button"
            onClick={() => onConfirm(order.id, "Confirmed")}
            className="
              flex
              h-8
              items-center
              justify-center
              gap-1
              rounded-lg
              bg-emerald-600
              px-2
              text-[9px]
              font-bold
              text-white
              transition
              hover:bg-emerald-700
              active:scale-[0.98]
              sm:h-9
              sm:text-[10px]
            "
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Accept
          </button>

          {/* REJECT */}

          <button
            type="button"
            onClick={() => onReject(order)}
            className="
              flex
              h-8
              items-center
              justify-center
              gap-1
              rounded-lg
              bg-red-50
              px-2
              text-[9px]
              font-bold
              text-red-600
              transition
              hover:bg-red-100
              active:scale-[0.98]
              sm:h-9
              sm:text-[10px]
            "
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </button>

          {/* VIEW */}

          <button
            type="button"
            onClick={() => onView(order)}
            title="View Order"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-600
              transition
              hover:bg-slate-100
              active:scale-[0.98]
              sm:h-9
              sm:w-9
            "
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* =====================================================
            RESPONSE STATUS
        ===================================================== */}

        <div className="mt-2 flex items-center justify-center gap-1">
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${timerConfig.dot}
              ${timerState === "urgent" ? "animate-pulse" : ""}
            `}
          />

          <span className="text-[8px] font-medium text-slate-400">
            {timerState === "urgent"
              ? "Please respond"
              : "Waiting for response"}
          </span>
        </div>
      </div>
    </article>
  );
}
