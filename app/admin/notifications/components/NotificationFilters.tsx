"use client";

import {
  Filter,
  Search,
  Users,
  ChevronDown,
} from "lucide-react";

export const notificationTypes = [
  {
    value: "booking",
    label: "Booking",
    icon: "📋",
  },
  {
    value: "work",
    label: "Work",
    icon: "👷",
  },
  {
    value: "payment",
    label: "Payment",
    icon: "💳",
  },
  {
    value: "offer",
    label: "Offer",
    icon: "🎁",
  },
  {
    value: "message",
    label: "Message",
    icon: "💬",
  },
  {
    value: "review",
    label: "Review",
    icon: "⭐",
  },
  {
    value: "system",
    label: "System",
    icon: "📢",
  },
];

type Props = {
  search: string;
  typeFilter: string;
  targetFilter: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onTargetChange: (value: string) => void;
};

export default function NotificationFilters({
  search,
  typeFilter,
  targetFilter,
  onSearchChange,
  onTypeChange,
  onTargetChange,
}: Props) {
  return (
    <div className="border-b border-gray-100 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-950">
            Notification History
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            View and manage sent notifications
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                onSearchChange(e.target.value)
              }
              placeholder="Search notifications..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 sm:w-[260px]"
            />
          </div>

          <div className="relative">
            <Filter
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={typeFilter}
              onChange={(e) =>
                onTypeChange(e.target.value)
              }
              className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-xs font-medium outline-none focus:border-green-500 sm:w-[145px]"
            >
              <option value="all">
                All Types
              </option>

              {notificationTypes.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="relative">
            <Users
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={targetFilter}
              onChange={(e) =>
                onTargetChange(e.target.value)
              }
              className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-xs font-medium outline-none focus:border-green-500 sm:w-[140px]"
            >
              <option value="all">
                All Targets
              </option>

              <option value="global">
                Global
              </option>

              <option value="user">
                Users
              </option>
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}