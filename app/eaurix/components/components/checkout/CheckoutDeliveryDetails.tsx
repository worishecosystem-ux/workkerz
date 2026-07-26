"use client";

import { CalendarDays, Truck } from "lucide-react";

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
  return (
    <div className="space-y-8">
      {/* DELIVERY SLOT */}

      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-[#0EA5E9]" />

        <div>
          <div className="text-[#0F172A] text-sm" style={{ fontWeight: 700 }}>
            Delivery Slot
          </div>

          <div className="text-[#64748B] text-xs">
            Select preferred delivery timing
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
        {[
          "09:00 AM - 12:00 PM",
          "12:00 PM - 03:00 PM",
          "03:00 PM - 06:00 PM",
          "06:00 PM - 09:00 PM",
        ].map((slot) => (
          <button
            key={slot}
            onClick={() => update("deliverySlot", slot)}
            className={`
        p-6 px-5 sm:p-4
        rounded-xl sm:rounded-2xl
        border
        sm:border-2
        text-left
        font-bold
        transition-all
        ${
          form.deliverySlot === slot
            ? "border-[#10B981] bg-sky-50"
            : "border-gray-200 hover:border-sky-200"
        }
      `}
          >
            <div className="text-[12px] sm:text-sm font-semibold leading-4 sm:leading-5 text-slate-900">
              {slot}
            </div>
          </button>
        ))}
      </div>

      {/* DELIVERY OPTION */}

      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-emerald-500" />

        <div>
          <div className="text-[#0F172A] text-sm" style={{ fontWeight: 700 }}>
            Delivery Option
          </div>

          <div className="text-[#64748B] text-xs">Select delivery speed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          {
            id: "standard",
            label: "Standard Delivery",
            sub: "2 - 4 Days Delivery",
            price: cartTotal > 100 ? "FREE" : "₹40",
            icon: "📦",
          },

          {
            id: "express",
            label: "Express Delivery",
            sub: "Same Day Fast Delivery",
            price: "₹99",
            icon: "⚡",
          },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => update("deliveryOption", opt.id)}
            className={`
              flex items-center gap-3
              p-2 
              px-4
              rounded-2xl
              border-2
              text-left
              transition-all
              ${
                form.deliveryOption === opt.id
                  ? "border-[#10B981] bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200"
              }
            `}
          >
            <span className="text-2xl">{opt.icon}</span>

            <div className="flex-1">
              <div
                className="text-sm text-[#0F172A]"
                style={{ fontWeight: 700 }}
              >
                {opt.label}
              </div>

              <div className="text-xs text-[#64748B] mt-1">{opt.sub}</div>
            </div>

            <div
              className="text-sm"
              style={{
                fontWeight: 800,
                color: opt.price === "FREE" ? "#10B981" : "#0EA5E9",
              }}
            >
              {opt.price}
            </div>
          </button>
        ))}
      </div>

      {/* NOTE */}

      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <label className="mb-2 block text-[11px] font-semibold text-slate-500">
          Delivery Instructions <span className="font-normal">(Optional)</span>
        </label>

        <textarea
          rows={2}
          value={form.deliveryNote}
          onChange={(e) => update("deliveryNote", e.target.value)}
          placeholder="Call before delivery, leave near gate, landmark..."
          className={`${inp} min-h-20 resize-none rounded-xl text-[13px] leading-5`}
        />
      </div>
    </div>
  );
}
