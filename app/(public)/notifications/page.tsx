"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Globe, User, CheckCircle2 } from "lucide-react";

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
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setLoading(false);
        return;
      }

      await loadNotifications();

      // Remove old channels (important during HMR)
      await supabase.removeAllChannels();

      channel = supabase.channel(`notifications-${user.id}-${Date.now()}`);

      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          const notification = payload.new as Notification;

          if (
            notification.is_global ||
            notification.customer_email === user.email
          ) {
            await loadNotifications();
          }
        },
      );

      channel.subscribe((status) => {
        console.log("Realtime:", status);
      });
    };

    void init();

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  async function loadNotifications() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .or(`is_global.eq.true,customer_email.eq.${user.email}`)
    .order("created_at", { ascending: false });

  if (error || !data) {
    setLoading(false);
    return;
  }

  // Unread notifications mark as read
  const unreadIds = data.filter((n) => !n.is_read).map((n) => n.id);

  if (unreadIds.length > 0) {
   const { error: updateError } = await supabase
  .from("notifications")
  .update({ is_read: true })
  .in("id", unreadIds);

console.log("Update Error:", updateError);

    // Local state bhi update karo
    data.forEach((n) => {
      if (unreadIds.includes(n.id)) {
        n.is_read = true;
      }
    });
  }

  setNotifications(data);
if (!error && data) {
  setNotifications(data);

  const unreadIds = data.filter((n) => !n.is_read).map((n) => n.id);

  if (unreadIds.length > 0) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
  }

  // ✅ Update complete hone ke baad
  window.dispatchEvent(new Event("notifications-read"));
}


  setLoading(false);
}

  return (
    <div className="min-h-screen bg-slate-50 pt-10">
      <div className="sticky top-0 z-20 bg-white border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <Bell className="text-indigo-600" />
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <NotificationSkeleton key={index} />
            ))}
          </>
        )}

        {!loading && notifications.length === 0 && (
          <div className="rounded-2xl bg-white border p-10 text-center">
            <Bell className="mx-auto mb-3 text-slate-400" />
            <p className="text-slate-500">No notifications yet.</p>
          </div>
        )}

        {notifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
              !item.is_read ? "border-indigo-200" : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  {item.is_global ? (
                    <Globe size={16} className="text-blue-600" />
                  ) : (
                    <User size={16} className="text-green-600" />
                  )}

                  <h2 className="font-semibold">{item.title}</h2>
                </div>

                <p className="mt-2 text-sm text-slate-600">{item.message}</p>

                <p className="mt-3 text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>

              {item.is_read && (
                <CheckCircle2 className="text-green-500" size={18} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-slate-200" />
            <div className="h-4 w-40 rounded bg-slate-200" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-5/6 rounded bg-slate-200" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
          </div>

          <div className="mt-4 h-3 w-28 rounded bg-slate-200" />
        </div>

        <div className="ml-4 h-5 w-5 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
