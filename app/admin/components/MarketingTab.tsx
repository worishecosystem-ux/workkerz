"use client";

import { useState } from "react";
import { Bell, ChevronRight, Megaphone } from "lucide-react";

import AdminNotificationsPage from "@/app/admin/notifications/page";

type MarketingSection = "home" | "notifications";

export default function MarketingTab() {
  const [section, setSection] = useState<MarketingSection>("home");

  if (section === "notifications") {
    return <AdminNotificationsPage />;
  }

  return (
    <section
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#F8FAFC]
        px-3
        pt-15
        pb-24
        sm:px-5
        sm:pt-5
        sm:pb-8
        lg:px-8
        lg:pt-8
        lg:pb-8
      "
    >
      <div className="mx-auto w-full max-w-[1200px]">
        {/* HEADER */}

        <div className="mb-5 sm:mb-6 lg:mb-7">
          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-sky-50
                sm:h-10
                sm:w-10
              "
            >
              <Megaphone
                className="
                  h-4
                  w-4
                  text-sky-600
                  sm:h-5
                  sm:w-5
                "
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-sky-600
                  sm:text-xs
                "
              >
                Marketing
              </p>

              <h1
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-[#0F172A]
                  sm:text-2xl
                  lg:text-3xl
                "
              >
                Marketing
              </h1>
            </div>
          </div>

          <p
            className="
              mt-2
              max-w-2xl
              text-xs
              leading-5
              text-[#64748B]
              sm:text-sm
            "
          >
            Manage customer communication, notifications and promotional
            campaigns.
          </p>
        </div>

        {/* CARDS */}

        <div
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            sm:gap-4
            lg:grid-cols-2
          "
        >
          {/* =================================================
              NOTIFICATIONS — SKY BLUE
          ================================================= */}

          <button
            type="button"
            onClick={() => setSection("notifications")}
            className="
              group
              relative
              min-h-[220px]
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-sky-200
              bg-gradient-to-br
              from-sky-50
              via-sky-100
              to-sky-200
              p-5
              text-left
              shadow-sm
              transition-all
              duration-300
              active:scale-[0.99]
              sm:min-h-[240px]
              sm:p-6
              sm:hover:-translate-y-1
              sm:hover:shadow-lg
            "
          >
            {/* TOP RIGHT FOLD */}

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                z-0
                h-24
                w-24
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  right-[-30px]
                  top-[-30px]
                  h-24
                  w-24
                  rotate-45
                  bg-sky-300/70
                "
              />

              <div
                className="
                  absolute
                  right-0
                  top-0
                  h-14
                  w-14
                  rounded-bl-[28px]
                  bg-sky-800/35
                "
              />

              <div
                className="
                  absolute
                  right-0
                  top-0
                  h-14
                  w-14
                  rounded-bl-[28px]
                  bg-sky-900/10
                  shadow-inner
                "
              />
            </div>

            {/* BOTTOM LEFT FOLD */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                left-0
                z-0
                h-24
                w-24
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  bottom-[-30px]
                  left-[-30px]
                  h-24
                  w-24
                  rotate-45
                  bg-sky-300/60
                "
              />

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-14
                  w-14
                  rounded-tr-[28px]
                  bg-sky-800/30
                "
              />

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-14
                  w-14
                  rounded-tr-[28px]
                  bg-sky-900/10
                  shadow-inner
                "
              />
            </div>

            {/* SOFT COLOR TINT */}

            <div
              className="
                pointer-events-none
                absolute
                -right-14
                -top-14
                h-44
                w-44
                rounded-full
                bg-white/70
                blur-3xl
                transition-transform
                duration-500
                group-hover:scale-125
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-16
                -left-12
                h-44
                w-44
                rounded-full
                bg-sky-400/20
                blur-3xl
              "
            />

            {/* CONTENT */}

            <div
              className="
                relative
                z-10
                flex
                items-start
                justify-between
              "
            >
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/75
                  text-sky-600
                  shadow-sm
                  ring-1
                  ring-sky-200
                  backdrop-blur-sm
                  transition-all
                  duration-500
                  group-hover:scale-110
                  group-hover:-rotate-3
                  sm:h-20
                  sm:w-20
                "
              >
                <Bell className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/75
                  text-sky-600
                  shadow-sm
                  ring-1
                  ring-sky-200
                  transition-all
                  duration-300
                  group-hover:translate-x-1
                  group-hover:bg-white
                "
              >
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-sky-700
                "
              >
                Customer Communication
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                "
              >
                Notifications
              </h2>

              <p
                className="
                  mt-2
                  max-w-md
                  text-xs
                  leading-5
                  text-slate-600
                  sm:text-sm
                "
              >
                Send global or user-specific push notifications and manage
                notification history.
              </p>
            </div>
          </button>

          {/* =================================================
              CAMPAIGNS — OLIVE
          ================================================= */}

          <div
            className="
              group
              relative
              min-h-[220px]
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-lime-200
              bg-[#F2F6DF]
              p-5
              shadow-sm
              transition-all
              duration-300
              sm:min-h-[240px]
              sm:p-6
              sm:hover:-translate-y-1
              sm:hover:shadow-lg
            "
          >
            {/* TOP RIGHT FOLD */}

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                z-0
                h-24
                w-24
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  right-[-30px]
                  top-[-30px]
                  h-24
                  w-24
                  rotate-45
                  bg-lime-300/70
                "
              />

              <div
                className="
                  absolute
                  right-0
                  top-0
                  h-14
                  w-14
                  rounded-bl-[28px]
                  bg-lime-900/35
                "
              />

              <div
                className="
                  absolute
                  right-0
                  top-0
                  h-14
                  w-14
                  rounded-bl-[28px]
                  bg-black/10
                  shadow-inner
                "
              />
            </div>

            {/* BOTTOM LEFT FOLD */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                left-0
                z-0
                h-24
                w-24
                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  bottom-[-30px]
                  left-[-30px]
                  h-24
                  w-24
                  rotate-45
                  bg-lime-300/60
                "
              />

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-14
                  w-14
                  rounded-tr-[28px]
                  bg-lime-900/30
                "
              />

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-14
                  w-14
                  rounded-tr-[28px]
                  bg-black/10
                  shadow-inner
                "
              />
            </div>

            {/* SOFT COLOR TINT */}

            <div
              className="
                pointer-events-none
                absolute
                -right-14
                -top-14
                h-44
                w-44
                rounded-full
                bg-white/70
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-16
                -right-12
                h-44
                w-44
                rounded-full
                bg-lime-400/20
                blur-3xl
              "
            />

            {/* CONTENT */}

            <div className="relative z-10">
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/75
                  text-lime-700
                  shadow-sm
                  ring-1
                  ring-lime-200
                  backdrop-blur-sm
                  transition-all
                  duration-500
                  group-hover:scale-110
                  group-hover:rotate-3
                  sm:h-20
                  sm:w-20
                "
              >
                <Megaphone className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-lime-800
                "
              >
                Promotional Marketing
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                "
              >
                Campaigns
              </h2>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-600
                  sm:text-sm
                "
              >
                Create promotional campaigns, offers and marketing broadcasts.
              </p>

              <div
                className="
                  mt-4
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-lime-300
                  bg-lime-100/80
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-lime-800
                "
              >
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
