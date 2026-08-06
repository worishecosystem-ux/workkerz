import { Eye, Phone, Printer, User } from "lucide-react";
import StatusBadge from "./StatusBadge";

type Props = {
  order: any;
  onView: (order: any) => void;
  highlight: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function OrderRow({
  order,
  onView,
  highlight,
  selected,
  onSelect,
}: Props) {
    const canSelect = ![
  "Delivered",
  "Cancelled",
  "Out For Delivery",
].includes(order.status);
  return (
    <tr
      className={`border-b transition-all duration-300 ${
        selected
          ? "bg-blue-50 ring-2 ring-inset ring-blue-200"
          : highlight
            ? "animate-pulse bg-yellow-50"
            : "hover:bg-slate-50"
      }`}
    >
      {/* Select */}
      <td className="px-4 py-5 text-center align-middle">
  {canSelect ? (
    <input
      type="checkbox"
      checked={selected}
      onChange={() => onSelect(order.id)}
      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-orange-600 focus:ring-orange-500"
    />
  ) : (
    <div className="flex justify-center">
      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
        Locked
      </span>
    </div>
  )}
</td>

      {/* Order */}
      <td className="px-5 py-5">
        <div>
          <p className="font-semibold text-slate-900">{order.order_number}</p>

          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
            #{order.id?.slice(0, 8)}
          </span>
        </div>
      </td>

      {/* Customer */}
      <td className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow">
            <User className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {order.customer_name}
            </p>

            <p className="text-xs text-slate-500">
              {order.customer_email || "No Email"}
            </p>
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="px-5 py-5">
        <a
          href={`tel:${order.customer_phone}`}
          className="font-medium text-slate-700 hover:text-orange-600"
        >
          {order.customer_phone}
        </a>
      </td>

      {/* Amount */}
      <td className="px-5 py-5">
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
          ₹{Number(order.total || 0).toLocaleString()}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-5">
        <StatusBadge status={order.status} />
      </td>

      {/* Date */}
      <td className="px-5 py-5">
        <div>
          <p className="font-medium text-slate-700">
            {new Date(order.created_at).toLocaleDateString()}
          </p>

          <p className="text-xs text-slate-500">
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-5">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onView(order)}
            title="View Order"
            className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </button>

          <a
            href={`tel:${order.customer_phone}`}
            title="Call Customer"
            className="rounded-xl bg-green-50 p-2.5 text-green-600 transition hover:bg-green-600 hover:text-white"
          >
            <Phone className="h-4 w-4" />
          </a>

          <button
            title="Print Invoice"
            className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition hover:bg-slate-700 hover:text-white"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
