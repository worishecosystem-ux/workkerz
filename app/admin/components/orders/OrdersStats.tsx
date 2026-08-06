import {
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
  IndianRupee,
  PackageCheck,
} from "lucide-react";

type Props = {
  orders: any[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
};

export default function OrdersStats({
  orders,
  selectedStatus,
  onSelectStatus,
}: Props) {
  const totalOrders = orders.length;

  const pending = orders.filter((o) => o.status === "Pending").length;

  const delivery = orders.filter((o) => o.status === "Out For Delivery").length;
  const readyToDispatch = orders.filter(
    (o) => o.status === "Ready to Dispatch",
  ).length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;

  const cancelled = orders.filter((o) => o.status === "Cancelled").length;

  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const cards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      status: "All",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      status: "Pending",
    },
    {
      title: "Out For Delivery",
      value: delivery,
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50",
      status: "Out For Delivery",
    },
    {
      title: "Ready to Dispatch",
      value: readyToDispatch,
      icon: PackageCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      status: "Ready to Dispatch",
    },
    {
      title: "Delivered",
      value: delivered,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      status: "Delivered",
    },
    {
      title: "Cancelled",
      value: cancelled,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      status: "Cancelled",
    },
    {
      title: "Revenue",
      value: `₹${revenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      status: "",
    },
  ];

  return (
    <div className="mb-2 grid grid-cols-2 gap-1.5 md:grid-cols-4 xl:grid-cols-7">
  {cards.map((card) => {
    const Icon = card.icon;

    return (
      <button
        key={card.title}
        onClick={() => card.status && onSelectStatus(card.status)}
        className={`flex items-center gap-2 rounded-md border bg-white px-2 py-1.5 transition-all hover:border-orange-300 ${
          selectedStatus === card.status
            ? "border-orange-500 bg-orange-50"
            : "border-slate-200"
        }`}
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${card.bg}`}
        >
          <Icon className={`h-3.5 w-3.5 ${card.color}`} />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[9px] font-medium leading-none text-slate-500">
            {card.title}
          </p>

          <p className="mt-1 text-sm font-bold leading-none text-slate-900">
            {card.value}
          </p>
        </div>
      </button>
    );
  })}
</div>
  );
}
