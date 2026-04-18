"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  subject: string;
  message: string;
  created_at: string;
};

export default function FeedbackManager() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/feedback");
      const json = await res.json();
      setRows(json.items ?? []);
    }
    void load();
  }, []);

  return (
    <section className="neo-panel rounded-2xl p-5">
      <h1 className="text-2xl font-black gradient-title">Supervisor Feedback & Suggestions</h1>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="font-semibold">{row.subject}</p>
            <p className="text-sm">{row.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
