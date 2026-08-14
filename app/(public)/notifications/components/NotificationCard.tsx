"use client";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  MessageCircle,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";

type NotificationCardProps = {
  title: string;
  message: string;
  type: string;
  image_url?: string | null;
  icon?: string | null;
  is_read: boolean;
  created_at: string;
  onClick?: () => void;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const diff =
    now.getTime() - date.getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case "booking":
      return (
        <CalendarDays
          size={20}
          strokeWidth={2}
        />
      );

    case "work":
      return (
        <Wrench
          size={20}
          strokeWidth={2}
        />
      );

    case "payment":
      return (
        <CreditCard
          size={20}
          strokeWidth={2}
        />
      );

    case "offer":
      return (
        <Gift
          size={20}
          strokeWidth={2}
        />
      );

    case "message":
      return (
        <MessageCircle
          size={20}
          strokeWidth={2}
        />
      );

    case "review":
      return (
        <Star
          size={20}
          strokeWidth={2}
        />
      );

    case "system":
      return (
        <Bell
          size={20}
          strokeWidth={2}
        />
      );

    default:
      return (
        <UserRound
          size={20}
          strokeWidth={2}
        />
      );
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "booking":
      return "bg-blue-50 text-blue-600";

    case "work":
      return "bg-orange-50 text-orange-600";

    case "payment":
      return "bg-purple-50 text-purple-600";

    case "offer":
      return "bg-pink-50 text-pink-600";

    case "message":
      return "bg-cyan-50 text-cyan-600";

    case "review":
      return "bg-yellow-50 text-yellow-600";

    case "system":
      return "bg-green-50 text-green-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "booking":
      return "Booking";

    case "work":
      return "Work";

    case "payment":
      return "Payment";

    case "offer":
      return "Offer";

    case "message":
      return "Message";

    case "review":
      return "Review";

    case "system":
      return "System";

    default:
      return "Update";
  }
}

export default function NotificationCard({
  title,
  message,
  type,
  image_url,
  icon,
  is_read,
  created_at,
  onClick,
}: NotificationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        flex
        w-full
        items-start
        gap-3
        border-b
        border-gray-100
        bg-white
        px-3
        py-4
        text-left
        transition
        duration-200
        active:bg-gray-50

        sm:gap-4
        sm:px-5
        sm:py-5

        ${
          !is_read
            ? "bg-[#fafffb]"
            : "bg-white"
        }
      `}
    >
      {/* =====================================
          UNREAD SIDE INDICATOR
      ====================================== */}

      {!is_read && (
        <span
          className="
            absolute
            bottom-0
            left-0
            top-0
            w-[3px]
            bg-green-600
          "
        />
      )}

      {/* =====================================
          IMAGE / ICON
      ====================================== */}

      <div className="relative shrink-0">
        {image_url ? (
          <img
            src={image_url}
            alt=""
            loading="lazy"
            className="
              h-12
              w-12
              rounded-xl
              object-cover

              sm:h-14
              sm:w-14
              sm:rounded-2xl
            "
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              ${getTypeColor(type)}

              sm:h-14
              sm:w-14
              sm:rounded-2xl
            `}
          >
            {icon ? (
              <span className="text-lg">
                {icon}
              </span>
            ) : (
              getTypeIcon(type)
            )}
          </div>
        )}

        {/* Unread dot */}

        {!is_read && (
          <span
            className="
              absolute
              -right-1
              -top-1
              h-3
              w-3
              rounded-full
              border-2
              border-white
              bg-green-600
            "
          />
        )}
      </div>

      {/* =====================================
          CONTENT
      ====================================== */}

      <div className="min-w-0 flex-1">
        {/* TITLE */}

        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={`
                  min-w-0
                  flex-1
                  truncate
                  text-[13px]
                  leading-5

                  sm:text-[14px]

                  ${
                    is_read
                      ? "font-semibold text-gray-800"
                      : "font-bold text-gray-950"
                  }
                `}
              >
                {title}
              </h3>

              {/* Mobile/Tablet type */}

              <span
                className={`
                  shrink-0
                  rounded-full
                  px-2
                  py-0.5
                  text-[8px]
                  font-bold

                  sm:text-[9px]

                  ${getTypeColor(type)}
                `}
              >
                {getTypeLabel(type)}
              </span>
            </div>
          </div>

          <ChevronRight
            size={17}
            strokeWidth={2}
            className="
              mt-0.5
              shrink-0
              text-gray-300
            "
          />
        </div>

        {/* MESSAGE */}

        <p
          className="
            mt-1
            line-clamp-2
            text-[11px]
            leading-[17px]
            text-gray-500

            sm:text-[12px]
            sm:leading-[18px]
          "
        >
          {message}
        </p>

        {/* FOOTER */}

        <div
          className="
            mt-2
            flex
            items-center
            gap-2.5
          "
        >
          <span
            className="
              flex
              items-center
              gap-1
              text-[9px]
              font-medium
              text-gray-400

              sm:text-[10px]
            "
          >
            <Clock3
              size={10}
              strokeWidth={2}
            />

            {formatTime(created_at)}
          </span>

          {is_read && (
            <span
              className="
                flex
                items-center
                gap-1
                text-[9px]
                text-gray-400

                sm:text-[10px]
              "
            >
              <Check
                size={10}
                strokeWidth={2.5}
              />

              Read
            </span>
          )}
        </div>
      </div>
    </button>
  );
}