"use client";

import {
  Bike,
  Check,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  XCircle,
} from "lucide-react";

type Props = {
  status: string;
};

const styles: Record<
  string,
  {
    bg: string;
    text: string;
    icon: React.ElementType;
  }
> = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: Clock3,
  },
  Confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: CheckCircle2,
  },
  Processing: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    icon: Package,
  },
  Preparing: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    icon: Package,
  },
  Packed: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: PackageCheck,
  },
  "Ready to Dispatch": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    icon: PackageCheck,
  },
  "Out For Delivery": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    icon: Bike,
  },
  Delivered: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: Check,
  },
  Cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: XCircle,
  },
};

export default function StatusBadge({ status }: Props) {
  const style = styles[status] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    icon: Clock3,
  };

  const Icon = style.icon;

  return (
    <span
      className={`inline-flex w-max items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold leading-none sm:px-2.5 sm:text-[10px] ${style.bg} ${style.text}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="whitespace-nowrap">{status || "Unknown"}</span>
    </span>
  );
}
