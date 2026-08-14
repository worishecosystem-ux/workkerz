"use client";

import {
  ArrowLeft,
  CheckCheck,
} from "lucide-react";

import { useRouter } from "next/navigation";

type Props = {
  unreadCount?: number;
  onReadAll?: () => void;
};

export default function NotificationsHeader({
  unreadCount = 0,
  onReadAll,
}: Props) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleReadAll = () => {
    if (unreadCount <= 0) {
      return;
    }

    onReadAll?.();
  };

  return (
    <header
      className="
        sticky
        top-0
        z-[100]
        border-b
        border-gray-100
        bg-white
      "
      style={{
        paddingTop:
          "env(safe-area-inset-top)",
      }}
    >
      <div
        className="
          mx-auto
          flex
          min-h-[58px]
          w-full
          items-center
          justify-between
          px-3

          sm:px-5

          md:min-h-[64px]
          md:px-6
        "
      >
        {/* =================================================
            LEFT
        ================================================== */}

        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-800
              transition
              hover:bg-gray-100
              active:scale-95
              active:bg-gray-100

              md:h-10
              md:w-10
            "
          >
            <ArrowLeft
              size={20}
              strokeWidth={2.2}
            />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className="
                  truncate
                  text-[17px]
                  font-bold
                  tracking-tight
                  text-gray-950

                  sm:text-[18px]

                  md:text-[19px]
                "
              >
                Notifications
              </h1>

              {/* UNREAD BADGE */}

              {unreadCount > 0 && (
                <span
                  className="
                    flex
                    h-5
                    min-w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-green-600
                    px-1.5
                    text-[9px]
                    font-black
                    leading-none
                    text-white
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </div>

            {/* SUBTITLE */}

            {unreadCount > 0 ? (
              <p
                className="
                  mt-0.5
                  text-[10px]
                  font-medium
                  text-gray-400
                  sm:text-[11px]
                "
              >
                {unreadCount} unread
                notification
                {unreadCount !== 1
                  ? "s"
                  : ""}
              </p>
            ) : (
              <p
                className="
                  mt-0.5
                  hidden
                  text-[10px]
                  text-gray-400
                  sm:block
                "
              >
                Stay updated with Workkerz
              </p>
            )}
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================== */}

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleReadAll}
            aria-label="Mark all notifications as read"
            className="
              flex
              h-9
              shrink-0
              items-center
              gap-1.5
              rounded-full
              px-2.5
              text-[10px]
              font-bold
              text-green-700
              transition
              hover:bg-green-50
              active:scale-95

              sm:h-10
              sm:px-3
              sm:text-[11px]

              md:px-4
              md:text-xs
            "
          >
            <CheckCheck
              size={16}
              strokeWidth={2}
            />

            <span className="hidden sm:inline">
              Mark all as read
            </span>

            <span className="sm:hidden">
              Read all
            </span>
          </button>
        )}
      </div>
    </header>
  );
}