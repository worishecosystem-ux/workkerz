import StatusBadge from "./StatusBadge";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  IndianRupee,
  X,
  User,
  Printer,
} from "lucide-react";
import OrderStatusTimeline from "./OrderStatusSelect";
import PaymentStatusSelect from "./PaymentStatusSelect";
type Props = {
  order: any;
  onClose: () => void;
  onPrint: () => void;
  onStatusChange: (id: string, status: string) => void;
  onPaymentStatusChange: (id: string, status: string) => void;
  paymentSummary?: React.ReactNode;
};

export default function OrderHeader({
  order,
  onClose,
  onPrint,
  onStatusChange,
  onPaymentStatusChange,
  paymentSummary,
}: Props) {
  const infoCard = (icon: React.ReactNode, label: string, value: string) => (
    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <div className="mt-0.5 text-slate-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-slate-900">
          {value || "-"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="border-b border-slate-200 bg-white">
      {/* Top */}
      <div className="flex items-start justify-between px-4 py-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              #{order.order_number}
            </h2>

            <StatusBadge status={order.status} />

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              ₹{Number(order.total || 0).toLocaleString()}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span>{order.customer_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{order.customer_phone}</span>
            </div>

            {order.customer_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{order.customer_email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="">
            <PaymentStatusSelect
              value={order.payment_status || "Pending"}
              onChange={(status) => onPaymentStatusChange(order.id, status)}
            />
          </div>

          <button
            onClick={onPrint}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-100"
          >
            <Printer className="h-5 w-5" />
          </button>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status Timeline */}

      <div className="border-y border-slate-200 bg-slate-50 px-4">
        <OrderStatusTimeline
          value={order.status || "Pending"}
          onChange={(status) => onStatusChange(order.id, status)}
        />
      </div>

      {/* Address */}

      <div className="flex items-center gap-3 px-5 py-2 text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="rounded-lg bg-emerald-50 p-1.5">
            <MapPin className="h-4 w-4 text-emerald-600" />
          </div>

          <span className="font-semibold whitespace-nowrap text-slate-900">
            Address:
          </span>

          <span className="truncate text-slate-600">
            {order.address}, {order.city}
            {order.pincode && ` • ${order.pincode}`}
          </span>
        </div>

        <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
          {order.delivery_option || "Standard"}
        </span>

        <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
          {order.delivery_slot || "-"}
        </span>
      </div>

     

      {/* Payment Summary */}

      {paymentSummary && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-2">
          {paymentSummary}
        </div>
      )}
    </div>
  );
}
