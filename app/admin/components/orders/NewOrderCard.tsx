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

  /* =====================================================
     ORDER TIMER
  ===================================================== */

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

  const itemCount = Array.isArray(order?.items)
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

  return (
    <article
      className="
        relative
        box-border
        w-[calc(100vw-24px)]
        max-w-full
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        hover:border-orange-200
        hover:shadow-md

        sm:w-[360px]

        md:w-[380px]

        lg:w-[420px]
        lg:max-w-[420px]
      "
    >
      {/* =====================================================
          LEFT ACCENT
      ===================================================== */}

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

      <div
        className="
          min-w-0
          p-3
          pl-4

          sm:p-3.5
          sm:pl-4

          lg:p-4
          lg:pl-4.5
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            justify-between
            gap-2

            sm:gap-3
          "
        >
          {/* CUSTOMER */}

          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-2.5

              sm:gap-3
            "
          >
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

                sm:h-10
                sm:w-10
              "
            >
              <User
                className="
                  h-4
                  w-4
                  text-orange-600

                  sm:h-[18px]
                  sm:w-[18px]
                "
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="
                  truncate
                  text-[13px]
                  font-bold
                  text-slate-900

                  sm:text-sm
                "
              >
                {order?.customer_name || "Customer"}
              </h3>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[9px]
                  text-slate-400

                  sm:text-[10px]
                "
              >
                #{order?.order_number || "-"}
              </p>

              {order?.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="
                    mt-0.5
                    block
                    truncate
                    text-[10px]
                    text-slate-500
                    transition
                    hover:text-orange-600

                    sm:text-[11px]
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
              py-1.5
              text-[8px]
              font-bold
              text-red-600

              sm:gap-1.5
              sm:px-2.5
              sm:text-[9px]
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                animate-pulse
                rounded-full
                bg-red-500
              "
            />

            NEW
          </span>
        </div>

        {/* =====================================================
            VALUE + TIMER
        ===================================================== */}

        <div
          className="
            mt-3
            grid
            min-w-0
            grid-cols-[minmax(0,1fr)_auto]
            items-center
            gap-2
            rounded-xl
            bg-slate-50
            px-2.5
            py-2.5

            sm:mt-4
            sm:gap-3
            sm:px-3
          "
        >
          {/* VALUE */}

          <div className="min-w-0">
            <p
              className="
                text-[8px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-400

                sm:text-[9px]
              "
            >
              Order Value
            </p>

            <div className="mt-1 flex min-w-0 items-center gap-1">
              <IndianRupee
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                  text-emerald-600

                  sm:h-4
                  sm:w-4
                "
              />

              <span
                className="
                  truncate
                  text-base
                  font-extrabold
                  leading-none
                  text-emerald-600

                  sm:text-lg
                "
              >
                {total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* TIMER */}

          <div
            className={`
              flex
              min-w-0
              shrink-0
              items-center
              gap-1.5
              rounded-xl
              border
              px-2
              py-1.5

              sm:gap-2
              sm:px-2.5
              sm:py-2

              ${timerConfig.wrapper}
            `}
          >
            <div
              className="
                relative
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-white

                sm:h-7
                sm:w-7
              "
            >
              <Clock3
                className={`
                  h-3
                  w-3

                  sm:h-3.5
                  sm:w-3.5

                  ${timerConfig.icon}
                `}
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

            <div className="min-w-0">
              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500

                  sm:text-[8px]
                "
              >
                {timerConfig.label}
              </p>

              <p
                className={`
                  mt-0.5
                  font-mono
                  text-xs
                  font-black
                  leading-none
                  tabular-nums

                  sm:text-sm

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

        <div
          className="
            mt-2.5
            grid
            min-w-0
            grid-cols-3
            gap-1.5

            sm:mt-3
            sm:gap-2
          "
        >
          {/* ITEMS */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1
              overflow-hidden
              rounded-lg
              bg-slate-100
              px-1.5
              py-2

              sm:gap-1.5
              sm:px-2
            "
          >
            <ShoppingBag
              className="
                h-3
                w-3
                shrink-0
                text-slate-500

                sm:h-3.5
                sm:w-3.5
              "
            />

            <span
              className="
                truncate
                text-[8px]
                font-semibold
                text-slate-600

                sm:text-[9px]
              "
            >
              {itemCount} Items
            </span>
          </div>

          {/* PAYMENT */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1
              overflow-hidden
              rounded-lg
              bg-emerald-50
              px-1.5
              py-2

              sm:gap-1.5
              sm:px-2
            "
          >
            <CreditCard
              className="
                h-3
                w-3
                shrink-0
                text-emerald-600

                sm:h-3.5
                sm:w-3.5
              "
            />

            <span
              className="
                truncate
                text-[8px]
                font-semibold
                text-emerald-700

                sm:text-[9px]
              "
            >
              {paymentMethod}
            </span>
          </div>

          {/* DISTANCE */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1
              overflow-hidden
              rounded-lg
              bg-blue-50
              px-1.5
              py-2

              sm:gap-1.5
              sm:px-2
            "
          >
            <MapPin
              className="
                h-3
                w-3
                shrink-0
                text-blue-600

                sm:h-3.5
                sm:w-3.5
              "
            />

            <span
              className="
                truncate
                text-[8px]
                font-semibold
                text-blue-700

                sm:text-[9px]
              "
            >
              2.4 km
            </span>
          </div>
        </div>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div
          className="
            mt-3
            grid
            min-w-0
            grid-cols-[minmax(0,1fr)_minmax(0,1fr)_38px]
            gap-1.5

            sm:mt-4
            sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_42px]
            sm:gap-2
          "
        >
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
              gap-1
              overflow-hidden
              rounded-lg
              bg-emerald-600
              px-1.5
              text-[9px]
              font-bold
              text-white
              shadow-sm
              transition-all
              hover:bg-emerald-700
              active:scale-[0.98]

              sm:gap-1.5
              sm:px-3
              sm:text-[10px]
            "
          >
            <CheckCircle2
              className="
                h-3.5
                w-3.5
                shrink-0

                sm:h-4
                sm:w-4
              "
            />

            <span className="truncate">Accept</span>
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
              gap-1
              overflow-hidden
              rounded-lg
              bg-red-50
              px-1.5
              text-[9px]
              font-bold
              text-red-600
              transition-all
              hover:bg-red-100
              active:scale-[0.98]

              sm:gap-1.5
              sm:px-3
              sm:text-[10px]
            "
          >
            <XCircle
              className="
                h-3.5
                w-3.5
                shrink-0

                sm:h-4
                sm:w-4
              "
            />

            <span className="truncate">Reject</span>
          </button>

          {/* VIEW */}

          <button
            type="button"
            onClick={() => onView(order)}
            title="View Order"
            aria-label="View Order"
            className="
              flex
              h-9
              w-[38px]
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

              sm:w-[42px]
            "
          >
            <Eye
              className="
                h-3.5
                w-3.5

                sm:h-4
                sm:w-4
              "
            />
          </button>
        </div>

        {/* =====================================================
            STATUS
        ===================================================== */}

        <div
          className="
            mt-2.5
            flex
            items-center
            justify-center
            gap-1.5

            sm:mt-3
          "
        >
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

          <span
            className="
              text-[8px]
              font-medium
              text-slate-400

              sm:text-[9px]
            "
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