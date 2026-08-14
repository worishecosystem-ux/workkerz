"use client";

import {
  Bell,
  Check,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";

import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export type NotificationPopupData = {
  id: string;
  title: string;
  message: string;
  type: string;
  image_url: string | null;
  icon: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

type Props = {
  notification: NotificationPopupData | null;
  open?: boolean;
  onClose: () => void;
  onAction?: () => void;
  onOpen?: () => void;
};

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.workkerz.app";

export default function NotificationPopup({
  notification,
  open = true,
  onClose,
  onAction,
  onOpen,
}: Props) {
  if (!open || !notification) {
    return null;
  }

  const actionUrl =
    typeof notification.action_url === "string"
      ? notification.action_url.trim()
      : "";

  const hasAction =
    actionUrl.length > 0;

  const normalizedActionUrl =
    actionUrl.toLowerCase();

  const isUpdate =
    normalizedActionUrl === "/update" ||
    normalizedActionUrl.startsWith("/update?") ||
    normalizedActionUrl.startsWith("/update#") ||
    normalizedActionUrl === "/app-update" ||
    normalizedActionUrl.startsWith("/app-update?") ||
    normalizedActionUrl.startsWith("/app-update#") ||
    notification.type === "update";

  /* =====================================================
     ACTION
  ===================================================== */

  const handleAction = async () => {
    /*
     * UPDATE NOTIFICATION
     *
     * Always send user directly to Play Store.
     */

    if (isUpdate) {
      try {
        onClose();

        /*
         * Capacitor Android
         */

        if (Capacitor.isNativePlatform()) {
          await Browser.open({
            url: PLAY_STORE_URL,
            presentationStyle: "popover",
          });

          return;
        }

        /*
         * Normal website
         */

        window.location.href =
          PLAY_STORE_URL;
      } catch (error) {
        console.error(
          "Unable to open Play Store:",
          error
        );

        /*
         * Fallback
         */

        window.open(
          PLAY_STORE_URL,
          "_blank",
          "noopener,noreferrer"
        );
      }

      return;
    }

    /*
     * Normal notification
     */

    if (onAction) {
      onAction();
      return;
    }

    if (onOpen) {
      onOpen();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/50
        px-4
        py-6
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[26px]
          border
          border-gray-100
          bg-white
          shadow-[0_25px_80px_rgba(0,0,0,0.22)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="
            absolute
            right-3
            top-3
            z-30
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/95
            text-gray-600
            shadow-md
            backdrop-blur
            transition
            hover:bg-white
            active:scale-95
          "
        >
          <X size={17} />
        </button>

        {/* IMAGE */}

        {notification.image_url ? (
          <div
            className="
              relative
              aspect-[16/8]
              w-full
              overflow-hidden
              bg-gray-100
            "
          >
            <img
              src={notification.image_url}
              alt=""
              className="
                h-full
                w-full
                object-cover
              "
            />
          </div>
        ) : (
          <div
            className="
              flex
              h-[155px]
              items-center
              justify-center
              bg-gradient-to-br
              from-green-50
              via-white
              to-emerald-50
            "
          >
            <div
              className="
                flex
                h-[70px]
                w-[70px]
                items-center
                justify-center
                rounded-[22px]
                bg-white
                text-[32px]
                shadow-lg
              "
            >
              {notification.icon || "📢"}
            </div>
          </div>
        )}

        {/* CONTENT */}

        <div className="p-5 sm:p-6">

          {/* BADGES */}

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-green-50
                px-2.5
                py-1
                text-[9px]
                font-black
                uppercase
                tracking-wide
                text-green-700
              "
            >
              <Bell size={11} />
              Workkerz
            </span>

            {isUpdate && (
              <span
                className="
                  rounded-full
                  bg-blue-50
                  px-2.5
                  py-1
                  text-[9px]
                  font-black
                  uppercase
                  tracking-wide
                  text-blue-700
                "
              >
                New Version
              </span>
            )}
          </div>

          {/* TITLE */}

          <h2
            className="
              mt-3
              text-[19px]
              font-black
              leading-6
              tracking-tight
              text-gray-950
            "
          >
            {notification.title ||
              "Workkerz Notification"}
          </h2>

          {/* MESSAGE */}

          <p
            className="
              mt-2.5
              text-[13px]
              leading-6
              text-gray-500
            "
          >
            {notification.message ||
              "You have a new notification."}
          </p>

          {/* UPDATE */}

          {isUpdate && (
            <div
              className="
                mt-4
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-green-100
                bg-green-50
                p-3.5
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-green-600
                  shadow-sm
                "
              >
                <Check size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black text-green-800">
                  Update available
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-green-600">
                  Open Google Play Store to update Workkerz.
                </p>
              </div>
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-5 flex gap-2">

            <button
              type="button"
              onClick={onClose}
              className="
                flex-1
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-3
                text-xs
                font-bold
                text-gray-700
                transition
                hover:bg-gray-50
                active:scale-[0.98]
              "
            >
              Later
            </button>

            {hasAction || isUpdate ? (
              <button
                type="button"
                onClick={handleAction}
                className="
                  flex
                  flex-[1.4]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-green-600
                  px-4
                  py-3
                  text-xs
                  font-black
                  text-white
                  shadow-lg
                  shadow-green-600/20
                  transition
                  hover:bg-green-700
                  active:scale-[0.98]
                "
              >
                {isUpdate ? (
                  <ExternalLink size={15} />
                ) : (
                  <ChevronRight size={16} />
                )}

                {isUpdate
                  ? "Update App"
                  : "Open"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="
                  flex
                  flex-[1.4]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-green-600
                  px-4
                  py-3
                  text-xs
                  font-black
                  text-white
                  transition
                  hover:bg-green-700
                "
              >
                <Check size={15} />
                Got it
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-[9px] text-gray-400">
            Workkerz
          </p>
        </div>
      </div>
    </div>
  );
}