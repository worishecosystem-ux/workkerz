"use client";

import {
  CheckCircle2,
  Clock3,
  XCircle,
  Truck,
  PackageCheck,
} from "lucide-react";

type Props = {
  history: any[];
};

const statusConfig: Record<
  string,
  {
    icon: typeof CheckCircle2;
    bg: string;
    text: string;
  }
> = {
  Pending: {
    icon: Clock3,
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  Confirmed: {
    icon: CheckCircle2,
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  "Ready to Dispatch": {
    icon: PackageCheck,
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  "Out For Delivery": {
    icon: Truck,
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  Delivered: {
    icon: CheckCircle2,
    bg: "bg-green-50",
    text: "text-green-600",
  },
  Cancelled: {
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-600",
  },
};

export default function OrderHistory({ history }: Props) {
  if (!history?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <Clock3 className="mx-auto mb-2 h-6 w-6 text-slate-300" />
        <p className="text-xs font-semibold text-slate-600">No Order History</p>
        <p className="mt-1 text-[10px] text-slate-400">
          Order status updates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Order History</h3>

        <p className="mt-0.5 text-[10px] text-slate-500">
          Complete order activity
        </p>
      </div>

      <div className="relative">
        {history.map((item, index) => {
          const config = statusConfig[item.status] || {
            icon: Clock3,
            bg: "bg-slate-100",
            text: "text-slate-500",
          };

          const Icon = config.icon;
          const isLast = index === history.length - 1;

          const date = item.created_at ? new Date(item.created_at) : null;

          return (
            <div
              key={item.id ?? `${item.status}-${index}`}
              className="relative flex gap-3"
            >
              {/* TIMELINE */}
              <div className="relative flex w-8 shrink-0 justify-center">
                {!isLast && (
                  <span className="absolute top-8 bottom-0 w-px bg-slate-200" />
                )}

                <div
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${config.bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${config.text}`} />
                </div>
              </div>

              {/* CONTENT */}
              <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${config.bg} ${config.text}`}
                    >
                      {item.status || "Updated"}
                    </span>

                    {date && (
                      <span className="text-[9px] text-slate-400">
                        {date.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        •{" "}
                        {date.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  {item.note && (
                    <p className="mt-1.5 wrap-break-word text-[10px] leading-relaxed text-slate-600">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
