"use client";

import {
  Bell,
  Check,
  Eye,
  X,
  XCircle,
  ShoppingBag,
  Clock3,
  ChevronRight,
} from "lucide-react";

import { useEffect, useState } from "react";

type Props = {
  order: any;
  onClose: () => void;
  onView: () => void;
  onAccept?: () => void;
  onReject?: () => void;
};

const FINAL_STATUSES = [
  "accepted",
  "confirmed",
  "approved",
  "rejected",
  "cancelled",
  "canceled",
];

export default function NewOrderNotification({
  order,
  onClose,
  onView,
  onAccept,
  onReject,
}: Props) {
  /*
   * IMPORTANT:
   *
   * Timer starts when this notification receives a NEW order.
   * It does NOT use order.created_at.
   *
   * Example:
   * Order created in DB -> 10 seconds later notification appears
   * Timer will still start from 00:00 when notification appears.
   */

  const [arrivalTime, setArrivalTime] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());

  if (!order) return null;

  /* =========================================================
     ORDER STATUS
  ========================================================= */

  const status = String(order.status ?? "Pending").trim();

  const normalizedStatus = status.toLowerCase();

  const canAct = !FINAL_STATUSES.includes(normalizedStatus);

  /* =========================================================
     CUSTOMER
  ========================================================= */

  const customerName =
    order.customer_name ||
    order.customerName ||
    "New Customer";

  /* =========================================================
     ORDER NUMBER
  ========================================================= */

  const orderNumber = order.order_number
    ? `#${order.order_number}`
    : order.id
      ? `#${String(order.id).slice(0, 8).toUpperCase()}`
      : "#NEW";

  /* =========================================================
     AMOUNT
  ========================================================= */

  const amount =
    order.total_amount ??
    order.total ??
    order.amount ??
    null;

  const formattedAmount =
    amount !== null &&
    amount !== undefined &&
    !Number.isNaN(Number(amount))
      ? `₹${Number(amount).toLocaleString("en-IN")}`
      : null;

  /* =========================================================
     ORDER ARRIVAL TIME
  =========================================================
  
  Timer resets whenever a new order ID appears.
  */

  useEffect(() => {
    if (!order?.id) return;

    const startedAt = Date.now();

    setArrivalTime(startedAt);
    setNow(startedAt);
  }, [order?.id]);

  /* =========================================================
     LIVE TIMER
  ========================================================= */

  useEffect(() => {
    if (!canAct) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [canAct]);

  /* =========================================================
     ELAPSED TIME
  ========================================================= */

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

  /* =========================================================
     TIMER STATE
  ========================================================= */

  const timerState =
    elapsedSeconds >= 60
      ? "urgent"
      : elapsedSeconds >= 30
        ? "warning"
        : "normal";

  const timerConfig = {
    normal: {
      wrapper:
        "border-emerald-100 bg-emerald-50 text-emerald-700",
      icon: "text-emerald-600",
      timer: "text-emerald-700",
      label: "Waiting",
      dot: "bg-emerald-500",
    },

    warning: {
      wrapper:
        "border-orange-100 bg-orange-50 text-orange-700",
      icon: "text-orange-600",
      timer: "text-orange-700",
      label: "Waiting",
      dot: "bg-orange-500",
    },

    urgent: {
      wrapper:
        "border-red-100 bg-red-50 text-red-700",
      icon: "text-red-600",
      timer: "text-red-700",
      label: "Urgent",
      dot: "bg-red-500",
    },
  }[timerState];

  /* =========================================================
     STATUS CONFIG
  ========================================================= */

  const statusConfig = (() => {
    switch (normalizedStatus) {
      case "accepted":
      case "confirmed":
      case "approved":
        return {
          className: "bg-emerald-50 text-emerald-700",
          dot: "bg-emerald-500",
        };

      case "rejected":
      case "cancelled":
      case "canceled":
        return {
          className: "bg-red-50 text-red-700",
          dot: "bg-red-500",
        };

      default:
        return {
          className: "bg-orange-50 text-orange-700",
          dot: "bg-orange-500",
        };
    }
  })();

  /* =========================================================
     ACCEPT
  ========================================================= */

  const handleAccept = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!onAccept) {
      console.error(
        "[NewOrderNotification] onAccept handler is missing.",
      );
      return;
    }

    onAccept();
  };

  /* =========================================================
     REJECT
  ========================================================= */

  const handleReject = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!onReject) {
      console.error(
        "[NewOrderNotification] onReject handler is missing.",
      );
      return;
    }

    onReject();
  };

  /* =========================================================
     VIEW
  ========================================================= */

  const handleView = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    onView();
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const handleClose = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    onClose();
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="
        relative
        w-full
        max-w-[380px]
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-[0_12px_35px_-12px_rgba(15,23,42,0.28)]
      "
    >
      {/* =====================================================
          TOP ACCENT
      ===================================================== */}

      <div
        className={`
          absolute
          inset-x-0
          top-0
          h-[2px]
          ${
            timerState === "urgent"
              ? "bg-red-500"
              : timerState === "warning"
                ? "bg-orange-500"
                : "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400"
          }
        `}
      />

      <div className="p-3">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-center gap-2.5">
          {/* ICON */}

          <div className="relative shrink-0">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-orange-500
                shadow-sm
              "
            >
              <Bell className="h-4 w-4 text-white" />
            </div>

            {canAct && (
              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-white
                  bg-emerald-500
                "
              />
            )}
          </div>

          {/* TITLE */}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-[13px] font-extrabold text-slate-900">
                New Order
              </h3>

              {canAct && (
                <span
                  className="
                    shrink-0
                    rounded-full
                    bg-orange-50
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-extrabold
                    uppercase
                    tracking-wide
                    text-orange-600
                  "
                >
                  New
                </span>
              )}
            </div>

            <div className="mt-0.5 flex min-w-0 items-center gap-1">
              <span className="truncate text-[10px] font-semibold text-slate-600">
                {customerName}
              </span>

              <span className="text-[9px] text-slate-300">
                •
              </span>

              <span className="shrink-0 text-[9px] font-medium text-slate-400">
                {orderNumber}
              </span>
            </div>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close notification"
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-md
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              active:scale-95
            "
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* =====================================================
            ORDER ROW
        ===================================================== */}

        <div
          className="
            mt-2.5
            flex
            items-center
            justify-between
            gap-2
            rounded-lg
            border
            border-slate-100
            bg-slate-50
            px-2.5
            py-2
          "
        >
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-2">
            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-white
                ring-1
                ring-slate-200
              "
            >
              <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Order
              </p>

              <p className="truncate text-[10px] font-bold text-slate-800">
                {orderNumber}
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-1.5">
            {formattedAmount && (
              <span className="text-[12px] font-extrabold text-slate-900">
                {formattedAmount}
              </span>
            )}

            <span
              className={`
                inline-flex
                items-center
                gap-1
                rounded-full
                px-1.5
                py-0.5
                text-[8px]
                font-extrabold
                uppercase
                ${statusConfig.className}
              `}
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${statusConfig.dot}
                `}
              />

              {status || "Pending"}
            </span>
          </div>
        </div>

        {/* =====================================================
            LIVE WAITING TIMER
        ===================================================== */}

        {canAct && (
          <div
            className={`
              mt-2
              flex
              items-center
              justify-between
              rounded-lg
              border
              px-2.5
              py-2
              ${timerConfig.wrapper}
            `}
          >
            {/* LEFT */}

            <div className="flex items-center gap-2">
              <div
                className="
                  relative
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-md
                  bg-white/80
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
                    ${
                      timerState === "urgent"
                        ? "animate-pulse"
                        : ""
                    }
                  `}
                />
              </div>

              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                  {timerConfig.label}
                </p>

                <p className="text-[9px] font-medium opacity-70">
                  Waiting for your action
                </p>
              </div>
            </div>

            {/* TIMER */}

            <div className="text-right">
              <p
                className={`
                  font-mono
                  text-[18px]
                  font-black
                  leading-none
                  tabular-nums
                  ${timerConfig.timer}
                `}
              >
                {formattedTime}
              </p>

              <p className="mt-0.5 text-[7px] font-bold uppercase tracking-wider opacity-50">
                {timerState === "urgent"
                  ? "Please respond"
                  : "Response time"}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        {canAct && (
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {/* ACCEPT */}

            <button
              type="button"
              onClick={handleAccept}
              aria-label="Accept order"
              className="
                flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                bg-emerald-600
                px-2
                text-[11px]
                font-extrabold
                text-white
                transition
                hover:bg-emerald-700
                active:scale-[0.98]
              "
            >
              <Check className="h-3.5 w-3.5" />
              Accept
            </button>

            {/* REJECT */}

            <button
              type="button"
              onClick={handleReject}
              aria-label="Reject order"
              className="
                flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-red-200
                bg-white
                px-2
                text-[11px]
                font-extrabold
                text-red-600
                transition
                hover:bg-red-50
                active:scale-[0.98]
              "
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        )}

        {/* =====================================================
            VIEW ORDER
        ===================================================== */}

        <button
          type="button"
          onClick={handleView}
          className="
            group
            mt-1.5
            flex
            h-8
            w-full
            items-center
            justify-between
            rounded-lg
            border
            border-slate-100
            bg-white
            px-2.5
            text-[10px]
            font-bold
            text-slate-600
            transition
            hover:border-slate-200
            hover:bg-slate-50
            active:scale-[0.99]
          "
        >
          <span className="flex items-center gap-1.5">
            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-md
                bg-slate-100
              "
            >
              <Eye className="h-3 w-3 text-slate-500" />
            </span>

            View Order Details
          </span>

          <ChevronRight
            className="
              h-3.5
              w-3.5
              text-slate-400
              transition-transform
              group-hover:translate-x-0.5
            "
          />
        </button>

        {/* =====================================================
            LIVE STATUS
        ===================================================== */}

        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-emerald-400
                opacity-50
              "
            />

            <span
              className="
                relative
                inline-flex
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-500
              "
            />
          </span>

          <span className="text-[8px] font-semibold text-slate-400">
            Live notification
          </span>
        </div>
      </div>
    </div>
  );
}