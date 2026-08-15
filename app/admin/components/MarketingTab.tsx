"use client";

import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Megaphone,
} from "lucide-react";

import AdminNotificationsPage from "@/app/admin/notifications/page";

type MarketingSection =
  | "home"
  | "notifications";

export default function MarketingTab() {
  const [section, setSection] =
    useState<MarketingSection>("home");

  /* =====================================================
     NOTIFICATIONS
     No extra header
  ===================================================== */

  if (section === "notifications") {
    return (
      <AdminNotificationsPage />
    );
  }

  /* =====================================================
     MARKETING HOME
  ===================================================== */

  return (
    <section
      className="
        min-h-screen
        bg-[#F8FAFC]
        p-4
        sm:p-6
        lg:p-8
      "
    >
      <div className="mx-auto max-w-[1200px]">

        {/* HEADER */}

        <div className="mb-6">

          <div className="flex items-center gap-2">

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-orange-50
              "
            >
              <Megaphone
                className="
                  h-4
                  w-4
                  text-[#FF5C39]
                "
              />
            </div>

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#FF5C39]
                "
              >
                Marketing
              </p>

              <h1
                className="
                  text-2xl
                  font-black
                  text-[#0F172A]
                "
              >
                Marketing
              </h1>

            </div>

          </div>

          <p
            className="
              mt-2
              text-sm
              text-[#64748B]
            "
          >
            Manage customer communication,
            notifications and promotional campaigns.
          </p>

        </div>

        {/* CARDS */}

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >

          {/* NOTIFICATIONS */}

          <button
            type="button"
            onClick={() =>
              setSection("notifications")
            }
            className="
              group
              rounded-2xl
              border
              border-gray-100
              bg-white
              p-5
              text-left
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:border-orange-100
              hover:shadow-md
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-50
                  text-[#FF5C39]
                "
              >
                <Bell className="h-5 w-5" />
              </div>

              <ChevronRight
                className="
                  h-5
                  w-5
                  text-gray-300
                  transition
                  group-hover:translate-x-1
                  group-hover:text-[#FF5C39]
                "
              />

            </div>

            <h2
              className="
                mt-4
                text-base
                font-black
                text-[#0F172A]
              "
            >
              Notifications
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-[#64748B]
              "
            >
              Send global or user-specific push
              notifications and manage notification
              history.
            </p>

          </button>

          {/* CAMPAIGNS */}

          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-gray-200
              bg-white/70
              p-5
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-gray-50
                text-gray-400
              "
            >
              <Megaphone className="h-5 w-5" />
            </div>

            <h2
              className="
                mt-4
                text-base
                font-black
                text-[#0F172A]
              "
            >
              Campaigns
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-[#94A3B8]
              "
            >
              Coming soon
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}