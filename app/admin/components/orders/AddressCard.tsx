type Props = {
  order: any;
};

export default function AddressCard({ order }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        Delivery Address
      </h3>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Address</p>
          <p className="font-medium text-slate-900">
            {order.address || "-"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">City</p>
            <p>{order.city || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Pincode</p>
            <p>{order.pincode || "-"}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Delivery Option
          </p>
          <p>{order.delivery_option || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Delivery Slot
          </p>
          <p>{order.delivery_slot || "-"}</p>
        </div>
      </div>
    </div>
  );
}