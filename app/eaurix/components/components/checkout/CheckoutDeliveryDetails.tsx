"use client";

import { CalendarDays, Truck, Info } from "lucide-react";

type Props = {
  form: any;
  update: (field: string, value: string) => void;
  inp: string;
  cartTotal: number;
};

export default function CheckoutDeliveryDetails({
  form,
  update,
  inp,
  cartTotal,
}: Props) {
  const minimumOrder = 2000;

  const isMinimumOrderMet =
    cartTotal >= minimumOrder;

  return (
    <div className="space-y-6">

      {/* =====================================================
          DELIVERY SLOT
      ===================================================== */}

      <div>
        <div className="mb-2.5 flex items-center gap-">
          <CalendarDays className="h-4 w-4 text-[#0EA5E9]" />

          <div>
            <div className="text-[12px] font-bold text-[#0F172A]">
              Delivery Slot
            </div>

            <div className="text-[10px] text-[#64748B]">
              Select your preferred delivery timing
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {[
            "09:00 AM - 12:00 PM",
            "12:00 PM - 03:00 PM",
            "03:00 PM - 06:00 PM",
            "06:00 PM - 09:00 PM",
          ].map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() =>
                update(
                  "deliverySlot",
                  slot,
                )
              }
              className={`
                rounded-lg
                border
                px-3
                py-2.5
                text-left
                transition-all

                ${
                  form.deliverySlot === slot
                    ? "border-[#10B981] bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200"
                }
              `}
            >
              <div className="text-[10px] font-semibold leading-4 text-slate-900">
                {slot}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          DELIVERY INFORMATION
      ===================================================== */}

      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-500" />

          <div>
            <div className="text-[12px] font-bold text-[#0F172A]">
              Delivery
            </div>

            <div className="text-[10px] text-[#64748B]">
              Charges depend on order and distance
            </div>
          </div>
        </div>

        {/* FREE DELIVERY */}

        <div
          className={`
            rounded-xl
            border
            p-2.5
            ${
              isMinimumOrderMet
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }
          `}
        >
          <div className="flex items-center gap-2">

            <div
              className={`
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                ${
                  isMinimumOrderMet
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                }
              `}
            >
              <Truck className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex items-center justify-between gap-1">

                <div className="text-[10px] font-bold leading-4 text-slate-900">
                  Delivery within 2 km
                </div>

                {isMinimumOrderMet && (
                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-emerald-500
                      px-1.5
                      py-0.5
                      text-[7px]
                      font-black
                      leading-3
                      text-white
                    "
                  >
                    FREE
                  </span>
                )}

              </div>

              <p className="mt-0.5 text-[8px] leading-3 text-slate-500">
                {isMinimumOrderMet
                  ? "Free delivery available for this order."
                  : `Free on orders ₹${minimumOrder.toLocaleString(
                      "en-IN",
                    )}+ within 2 km.`}
              </p>

            </div>
          </div>
        </div>

        {/* MINIMUM ORDER */}

        {!isMinimumOrderMet && (
          <div
            className="
              mt-1.5
              rounded-xl
              border
              border-gray-200
              bg-white
              p-2.5
            "
          >
            <div className="flex items-center justify-between">

              <span className="text-[9px] font-semibold text-slate-500">
                Current order value
              </span>

              <span className="text-[11px] font-black text-slate-900">
                ₹
                {cartTotal.toLocaleString(
                  "en-IN",
                )}
              </span>

            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(
                    (cartTotal /
                      minimumOrder) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>

            <p className="mt-1 text-[8px] leading-3 text-slate-500">
              Add ₹
              {Math.max(
                minimumOrder -
                  cartTotal,
                0,
              ).toLocaleString(
                "en-IN",
              )}{" "}
              more for free delivery within 2 km.
            </p>
          </div>
        )}

        {/* FINAL DELIVERY CHARGE */}

        <div
          className="
            mt-1.5
            rounded-xl
            border
            border-sky-100
            bg-sky-50
            p-2.5
          "
        >
          <div className="flex items-start gap-2">

            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-white
                text-sky-500
                shadow-sm
              "
            >
              <Info className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-black text-slate-900">
                Delivery charge confirmation
              </p>

              <p className="mt-0.5 text-[9px] leading-3.5 text-slate-600">
                Beyond the free 2 km eligibility,
                the final delivery charge is not
                fixed at checkout.
              </p>

              <p className="mt-1 text-[9px] font-bold leading-3.5 text-sky-700">
                Workkerz will contact the
                material/product shop and confirm
                the final delivery charge before
                delivery.
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DELIVERY INSTRUCTIONS
      ===================================================== */}

      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-2.5
          shadow-sm
        "
      >
        <label
          className="
            mb-1.5
            block
            text-[10px]
            font-semibold
            text-slate-500
          "
        >
          Delivery Instructions{" "}
          <span className="font-normal">
            (Optional)
          </span>
        </label>

        <textarea
          rows={2}
          value={form.deliveryNote}
          onChange={(e) =>
            update(
              "deliveryNote",
              e.target.value,
            )
          }
          placeholder="Call before delivery, landmark..."
          className={`
            ${inp}
            min-h-14
            resize-none
            rounded-lg
            px-2.5
            py-2
            text-[11px]
            leading-4
          `}
        />
      </div>

      {/* =====================================================
          FINAL NOTE
      ===================================================== */}

      <div
        className="
          rounded-lg
          border
          border-gray-100
          bg-gray-50
          px-2.5
          py-2
        "
      >
        <p
          className="
            text-center
            text-[8px]
            leading-3.5
            text-slate-500
          "
        >
          Delivery availability and final charges
          will be confirmed by Workkerz after
          coordinating with the shop.
        </p>
      </div>

    </div>
  );
}