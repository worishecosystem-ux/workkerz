"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  Globe,
  User,
  CheckCircle2,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  customer_email: string | null;
  is_global: boolean;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(
        `is_global.eq.true,customer_email.eq.${user.email}`
      )
      .order("created_at", {
        ascending: false,
      });

    if (!error && data) {
      setNotifications(data);

      const unreadIds = data
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .in("id", unreadIds);
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-10">

      <div className="sticky top-0 z-20 bg-white border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <Bell className="text-indigo-600" />
          <h1 className="text-xl font-bold">
            Notifications
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {loading && (
          <div className="text-center py-10">
            Loading...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="rounded-2xl bg-white border p-10 text-center">
            <Bell className="mx-auto mb-3 text-slate-400" />
            <p className="text-slate-500">
              No notifications yet.
            </p>
          </div>
        )}

        {notifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
              !item.is_read
                ? "border-indigo-200"
                : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">

              <div>

                <div className="flex items-center gap-2">

                  {item.is_global ? (
                    <Globe
                      size={16}
                      className="text-blue-600"
                    />
                  ) : (
                    <User
                      size={16}
                      className="text-green-600"
                    />
                  )}

                  <h2 className="font-semibold">
                    {item.title}
                  </h2>

                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {item.message}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  {new Date(
                    item.created_at
                  ).toLocaleString()}
                </p>

              </div>

              {item.is_read && (
                <CheckCircle2
                  className="text-green-500"
                  size={18}
                />
              )}

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}