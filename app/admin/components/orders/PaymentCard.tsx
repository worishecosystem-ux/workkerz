import { CreditCard, Receipt, Truck, Wallet } from "lucide-react";

type Props = {
  order: any;
  onStatusChange: (id: string, status: string) => void;
  onPaymentStatusChange: (id: string, status: string) => void;
};

const statusStyle = (status: string) => {
  switch (status) {
    case "Paid":
      return " text-emerald-700";

    case "Pending":
      return " text-amber-700";

    case "Failed":
      return " text-red-700";

    case "Refunded":
      return " text-blue-700";

    default:
      return " text-slate-700";
  }
};

const Item = ({
  icon,
  label,
  value,
  valueClass = "",
  labelClass = "text-slate-500",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
  labelClass?: string;
}) => (
  <div className="flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
    <div className={`flex items-center gap-1.5 ${labelClass}`}>
      {icon}

      <span className="text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>

    <div className={`truncate text-sm font-bold ${valueClass}`}>{value}</div>
  </div>
);

export default function PaymentCard({ order }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      <Item
        labelClass="text-blue-600"
        icon={<CreditCard className="h-4 w-4" />}
        label="Method"
        value={order.payment_method || "COD"}
      />

      <Item
        labelClass="text-orange-600"
        icon={<Wallet className="h-4 w-4" />}
        label="Status"
        value={order.payment_status || "Pending"}
        valueClass={statusStyle(order.payment_status || "Pending")}
      />

      <Item
        labelClass="text-red-600"
        icon={<Receipt className="h-4 w-4" />}
        label="Items"
        value={`₹${Number(order.subtotal || 0).toLocaleString()}`}
      />

      <Item
        labelClass="text-violet-600"
        icon={<Truck className="h-4 w-4" />}
        label="Delivery"
        value={`₹${Number(order.delivery || 0).toLocaleString()}`}
      />

      <Item
        labelClass="text-emerald-700"
        icon={<Wallet className="h-4 w-4" />}
        label="Total"
        value={`₹${Number(order.total || 0).toLocaleString()}`}
        valueClass="text-emerald-700"
      />
    </div>
  );
}
