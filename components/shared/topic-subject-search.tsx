"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, SUBJECTS } from "@/lib/types";

type Row = {
  type: "material" | "notice";
  title: string;
  subject: string;
  category: string;
  link?: string;
  time?: string;
};

export default function TopicSubjectSearch() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    const res = await fetch(`/api/topic-search?${params.toString()}`);
    if (!res.ok) {
      setRows([]);
      return;
    }
    const json = await res.json();
    setRows(json.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="neo-panel animated-border rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Topic & Subject Search</h1>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Search topic/title" value={q} onChange={(e) => setQ(e.target.value)} />
          <button onClick={() => void load()} className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 font-semibold text-white">
            Search
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {rows.map((row, idx) => (
          <article key={`${row.type}-${idx}`} className="neo-panel lift rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-indigo-700">{row.type}</p>
              <p className="text-xs text-slate-500">{row.subject}</p>
            </div>
            <h2 className="text-lg font-bold">{row.title}</h2>
            <p className="text-sm text-slate-600">{row.category}</p>
            {row.time && <p className="text-sm">Time: {new Date(row.time).toLocaleString()}</p>}
            {row.link && (
              <a href={row.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-semibold text-cyan-700">
                Open link
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
