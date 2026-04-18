"use client";

import { useEffect, useState } from "react";
import Countdown from "@/components/countdown";

type ExamNotice = {
  id: string;
  scheduled_at: string;
  title: string;
  subject: string;
  event_type: string;
};

export default function DefenseScheduleView() {
  const [rows, setRows] = useState<ExamNotice[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/notices");
      const json = await res.json();
      setRows(json.items ?? []);
    }
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="neo-panel animated-border rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Exam Timer Board</h1>
        <p className="mt-1 text-sm text-slate-600">Live countdown for quiz, mid and final notices.</p>
      </div>
      <div className="grid gap-2">
        {rows.map((row) => (
          <article key={row.id} className="neo-panel rounded-2xl p-4">
            <p className="font-semibold">{row.title}</p>
            <p className="text-sm">{row.subject} • {row.event_type}</p>
            <p className="text-sm">{new Date(row.scheduled_at).toLocaleString()}</p>
            <p className="mt-1 text-sm">Time left: <Countdown targetIso={row.scheduled_at} /></p>
          </article>
        ))}
      </div>
    </section>
  );
}
