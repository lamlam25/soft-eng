"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsCenter() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [noticeRows, setNoticeRows] = useState<{ id: string; title: string; event_type: string; scheduled_at: string }[]>([]);

  async function load() {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    setRows(json.items ?? []);

    const noticeRes = await fetch("/api/notices");
    const noticeJson = await noticeRes.json();
    setNoticeRows((noticeJson.items ?? []).slice(0, 20));
  }

  useEffect(() => {
    void load();
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    await load();
  }

  return (
    <section className="space-y-4">
      <div className="neo-panel rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Notifications</h1>
      </div>
      <div className="grid gap-2">
        {noticeRows.map((row) => (
          <article key={`notice-${row.id}`} className="neo-panel rounded-2xl p-4">
            <p className="font-bold">Exam notice update ({row.event_type})</p>
            <p className="text-sm">{row.title}</p>
            <p className="text-sm text-slate-600">{new Date(row.scheduled_at).toLocaleString()}</p>
          </article>
        ))}
        {rows.map((row) => (
          <article key={row.id} className={`neo-panel rounded-2xl p-4 ${row.is_read ? "opacity-75" : ""}`}>
            <p className="font-bold">{row.title}</p>
            <p className="text-sm">{row.message}</p>
            {!row.is_read && (
              <button onClick={() => void markRead(row.id)} className="mt-2 rounded-lg bg-slate-900 px-3 py-1 text-xs text-white">
                Mark as read
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
