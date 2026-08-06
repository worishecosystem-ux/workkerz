type Props = {
  order: any;
};

export default function CustomerCard({ order }: Props) {
  return (
    <div className="rounded-2xl border p-5">
      <h3 className="mb-4 text-lg font-semibold">
        Customer Details
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500">
            Customer Name
          </p>

          <p className="font-semibold text-slate-900">
            {order.customer_name}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Phone
          </p>

          <p>{order.customer_phone}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Email
          </p>

          <p>{order.customer_email || "-"}</p>
        </div>
      </div>
    </div>
  );
}