"use client";

interface Props {
  priority: string;
}

export default function PriorityBadge({ priority }: Props) {
  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-orange-100 text-orange-700",
    Low: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[priority as keyof typeof styles] ??
        "bg-slate-100 text-slate-700"
      }`}
    >
      {priority}
    </span>
  );
}