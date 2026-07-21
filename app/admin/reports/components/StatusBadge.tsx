"use client";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const styles = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status as keyof typeof styles] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}