import {
  Clock3,
  CheckCircle2,
  Package,
  PackageCheck,
  Truck,
  Bike,
  Check,
  XCircle,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (status: string) => void;
};

const statuses = [
  {
    value: "Pending",
    label: "Pending",
    icon: Clock3,
  },
  {
    value: "Confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    value: "Preparing",
    label: "Preparing",
    icon: Package,
  },
  {
    value: "Packed",
    label: "Packed",
    icon: PackageCheck,
  },
  {
    value: "Ready to Dispatch",
    label: "Dispatch",
    icon: Truck,
  },
  {
    value: "Out For Delivery",
    label: "Delivery",
    icon: Bike,
  },
  {
    value: "Delivered",
    label: "Delivered",
    icon: Check,
  },
  {
    value: "Cancelled",
    label: "Cancelled",
    icon: XCircle,
  },
];

export default function OrderStatusTimeline({
  value,
  onChange,
}: Props) {
  const currentIndex = statuses.findIndex(
    (s) => s.value === value
  );

  return (
    <div className="border-t border-slate-200 bg-slate-50 py-2">
      <div className="flex w-full items-center justify-between gap-1">
        {statuses.map((status, index) => {
          const Icon = status.icon;

          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div
              key={status.value}
              className="flex shrink-0 items-center"
            >
              <button
                onClick={() => onChange(status.value)}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all duration-200
                ${
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{status.label}</span>
              </button>

              {index !== statuses.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-6 rounded-full ${
                    completed || active
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}