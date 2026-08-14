"use client";

import {
  Bell,
  CheckCheck,
  Eye,
  Globe2,
} from "lucide-react";

type Props = {
  total: number;
  unread: number;
  read: number;
  global: number;
};

export default function NotificationStats({
  total,
  unread,
  read,
  global,
}: Props) {
  const cards = [
    {
      label: "Total",
      value: total,
      text: "All notifications",
      icon: Bell,
      className: "bg-blue-50 text-blue-600",
    },
    {
      label: "Unread",
      value: unread,
      text: "Waiting to be read",
      icon: Eye,
      className: "bg-orange-50 text-orange-600",
    },
    {
      label: "Read",
      value: read,
      text: "Read notifications",
      icon: CheckCheck,
      className: "bg-green-50 text-green-600",
    },
    {
      label: "Global",
      value: global,
      text: "Sent to all users",
      icon: Globe2,
      className: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {card.label}
              </span>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.className}`}
              >
                <Icon size={17} />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-950">
              {card.value}
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              {card.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}