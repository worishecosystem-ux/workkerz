import {
  Phone,
  Copy,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Props = {
  order: any;
  onStatusChange: (id: string, status: string) => void;
};

export default function OrderActions({
  order,
  onStatusChange,
}: Props) {
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-2 gap-3">

      <button
        onClick={() =>
          window.open(`tel:${order.customer_phone}`)
        }
        className="flex items-center justify-center gap-2 rounded-xl border p-3 hover:bg-slate-50"
      >
        <Phone className="h-4 w-4" />
        Call
      </button>

      <button
        onClick={() => copy(order.order_number)}
        className="flex items-center justify-center gap-2 rounded-xl border p-3 hover:bg-slate-50"
      >
        <Copy className="h-4 w-4" />
        Copy Order
      </button>

      <button
        onClick={() =>
          copy(
            `${order.address}, ${order.city}, ${order.pincode}`
          )
        }
        className="flex items-center justify-center gap-2 rounded-xl border p-3 hover:bg-slate-50"
      >
        <MapPin className="h-4 w-4" />
        Copy Address
      </button>

      <button
        onClick={() =>
          onStatusChange(order.id, "Delivered")
        }
        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 p-3 text-white hover:bg-green-700"
      >
        <CheckCircle2 className="h-4 w-4" />
        Deliver
      </button>

      <button
        onClick={() =>
          onStatusChange(order.id, "Cancelled")
        }
        className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-red-600 p-3 text-white hover:bg-red-700"
      >
        <XCircle className="h-4 w-4" />
        Cancel Order
      </button>

    </div>
  );
}