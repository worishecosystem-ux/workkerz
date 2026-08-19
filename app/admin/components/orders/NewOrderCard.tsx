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
  const [arrivalTime, setArrivalTime] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!order?.id) return;

    const startedAt = Date.now();

    setArrivalTime(startedAt);
    setNow(startedAt);
  }, [order?.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - arrivalTime) / 1000),
  );

  const minutes = Math.floor(elapsedSeconds / 60);
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
        box-border
        w-full
        max-w-[420px]
        min-w-[340px]
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        hover:border-orange-200
        hover:shadow-md
      "
    >
      {/* LEFT ACCENT */}

      <div
        className={`
          absolute
          inset-y-0
          left-0
          z-10
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

      <div className="p-4 pl-4.5">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* USER */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-orange-50
              "
            >
              <User className="h-[18px] w-[18px] text-orange-600" />
            </div>

            {/* CUSTOMER */}

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-slate-900">
                {order.customer_name || "Customer"}
              </h3>

              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                #{order.order_number || "-"}
              </p>

              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="
                    mt-0.5
                    block
                    truncate
                    text-[11px]
                    text-slate-500
                    transition
                    hover:text-orange-600
                  "
                >
                  {order.customer_phone}
                </a>
              )}
            </div>
          </div>

          {/* NEW */}

          <span
            className="
              flex
              shrink-0
              items-center
              gap-1.5
              rounded-full
              bg-red-50
              px-2.5
              py-1.5
              text-[9px]
              font-bold
              text-red-600
            "
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            NEW
          </span>
        </div>

        {/* =====================================================
            VALUE + TIMER
        ===================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-[1fr_auto]
            items-center
            gap-3
            rounded-xl
            bg-slate-50
            px-3
            py-2.5
          "
        >
          {/* VALUE */}

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Order Value
            </p>

            <div className="mt-1 flex items-center gap-1">
              <IndianRupee className="h-4 w-4 text-emerald-600" />

              <span className="truncate text-lg font-extrabold leading-none text-emerald-600">
                {Number(order.total || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* TIMER */}

          <div
            className={`
              flex
              min-w-[100px]
              items-center
              gap-2
              rounded-xl
              border
              px-2.5
              py-2
              ${timerConfig.wrapper}
            `}
          >
            <div
              className="
                relative
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-white
              "
            >
              <Clock3
                className={`h-3.5 w-3.5 ${timerConfig.icon}`}
              />

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

            <div>
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">
                {timerConfig.label}
              </p>

              <p
                className={`
                  mt-0.5
                  font-mono
                  text-sm
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
            INFO
        ===================================================== */}

        <div className="mt-3 grid grid-cols-3 gap-2">
          {/* ITEMS */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-slate-100
              px-2
              py-2
            "
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-slate-500" />

            <span className="truncate text-[9px] font-semibold text-slate-600">
              {order.items?.length || 1} Items
            </span>
          </div>

          {/* PAYMENT */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-emerald-50
              px-2
              py-2
            "
          >
            <CreditCard className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

            <span className="truncate text-[9px] font-semibold text-emerald-700">
              {order.payment_method || "Cash"}
            </span>
          </div>

          {/* DISTANCE */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-blue-50
              px-2
              py-2
            "
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />

            <span className="text-[9px] font-semibold text-blue-700">
              2.4 km
            </span>
          </div>
        </div>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div className="mt-4 grid grid-cols-[1fr_1fr_42px] gap-2">
          {/* ACCEPT */}

          <button
            type="button"
            onClick={() => onConfirm(order.id, "Confirmed")}
            className="
              flex
              h-9
              min-w-0
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-emerald-600
              px-3
              text-[10px]
              font-bold
              text-white
              shadow-sm
              transition-all
              hover:bg-emerald-700
              active:scale-[0.98]
            "
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Accept</span>
          </button>

          {/* REJECT */}

          <button
            type="button"
            onClick={() => onReject(order)}
            className="
              flex
              h-9
              min-w-0
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-red-50
              px-3
              text-[10px]
              font-bold
              text-red-600
              transition-all
              hover:bg-red-100
              active:scale-[0.98]
            "
          >
            <XCircle className="h-4 w-4 shrink-0" />
            <span>Reject</span>
          </button>

          {/* VIEW */}

          <button
            type="button"
            onClick={() => onView(order)}
            title="View Order"
            className="
              flex
              h-9
              w-[42px]
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-600
              transition-all
              hover:border-slate-300
              hover:bg-slate-50
              active:scale-[0.98]
            "
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* =====================================================
            STATUS
        ===================================================== */}

        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span
            className={`
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              ${timerConfig.dot}
              ${timerState === "urgent" ? "animate-pulse" : ""}
            `}
          />

          <span className="text-[9px] font-medium text-slate-400">
            {timerState === "urgent"
              ? "Please respond"
              : "Waiting for response"}
          </span>
        </div>
      </div>
    </article>
  );
}