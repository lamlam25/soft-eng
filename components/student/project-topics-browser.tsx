"use client";

import { useEffect, useState } from "react";
import { PROJECT_CATEGORIES } from "@/lib/types";

type Topic = {
  id: string;
  title: string;
  category: string;
  description: string;
  video_url: string | null;
};

export default function ProjectTopicsBrowser() {
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Topic[]>([]);

  async function load() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    const res = await fetch(`/api/project-topics?${params.toString()}`);
    const json = await res.json();
    setRows(json.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="neo-panel rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Project Topic Ideas + Videos</h1>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics" />
          <button onClick={() => void load()} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Apply filters</button>
        </div>
      </div>

      <div className="grid gap-3">
        {rows.map((row) => (
          <article key={row.id} className="neo-panel rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase text-indigo-700">{row.category}</p>
            <h2 className="text-lg font-bold">{row.title}</h2>
            <p className="text-sm">{row.description}</p>
            {row.video_url && (
              <a href={row.video_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-cyan-700">
                Watch tutorial video
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
