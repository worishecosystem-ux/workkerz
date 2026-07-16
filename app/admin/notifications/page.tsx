"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  Send,
  Trash2,
  Globe,
  User,
  Loader2,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sendTo, setSendTo] = useState<"all" | "user">("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    setNotifications(data || []);
  }

async function sendNotification() {
  if (!title.trim() || !message.trim()) {
    alert("Please fill all fields.");
    return;
  }

  if (sendTo === "user" && !email.trim()) {
    alert("Please enter customer email.");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        message: message.trim(),
        is_global: sendTo === "all",
        customer_email:
          sendTo === "user" ? email.trim().toLowerCase() : null,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to send notification");
    }

    setTitle("");
    setMessage("");
    setEmail("");

    await loadNotifications();

    alert("Notification sent successfully.");
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
}

  async function deleteNotification(id: string) {
    if (!confirm("Delete notification?")) return;

    await supabase.from("notifications").delete().eq("id", id);

    loadNotifications();
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="text-indigo-600" />
          Notifications
        </h1>

        <p className="text-slate-500 mt-1">
          Send notifications to all users or a specific customer.
        </p>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow">

        <div className="grid gap-5">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="rounded-xl border p-3"
          />

          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Notification message..."
            className="rounded-xl border p-3"
          />

          <div className="flex gap-8">

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={sendTo === "all"}
                onChange={() => setSendTo("all")}
              />
              <Globe size={18} />
              All Users
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={sendTo === "user"}
                onChange={() => setSendTo("user")}
              />
              <User size={18} />
              Specific User
            </label>

          </div>

          {sendTo === "user" && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Customer Email"
              className="rounded-xl border p-3"
            />
          )}

          <button
            onClick={sendNotification}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-white hover:bg-indigo-700"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}

            Send Notification
          </button>

        </div>

      </div>

      <div>

        <h2 className="mb-5 text-xl font-semibold">
          Recent Notifications
        </h2>

        <div className="space-y-4">

          {notifications.length === 0 && (
            <div className="rounded-xl border p-10 text-center text-slate-500">
              No notifications found.
            </div>
          )}

          {notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold text-lg">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-slate-600">
                    {item.message}
                  </p>

                  <div className="mt-4 flex gap-4 text-sm text-slate-500">

                    {item.is_global ? (
                      <span className="flex items-center gap-1">
                        <Globe size={15} />
                        All Users
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <User size={15} />
                        {item.customer_email}
                      </span>
                    )}

                    <span>
                      {new Date(item.created_at).toLocaleString()}
                    </span>

                  </div>

                </div>

                <button
                  onClick={() => deleteNotification(item.id)}
                  className="h-10 w-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}