type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Processing: "bg-indigo-100 text-indigo-700",
    Packed: "bg-purple-100 text-purple-700",
    "Out For Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}