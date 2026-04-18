"use client";

import { useEffect, useState } from "react";
import { PROJECT_CATEGORIES } from "@/lib/types";

type Project = {
  id: string;
  topic: string;
  category: string;
  summary: string;
  status: string;
  created_at: string;
};

export default function ProjectSearch() {
  const [category, setCategory] = useState("");
  const [rows, setRows] = useState<Project[]>([]);

  async function load() {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`/api/project-registrations${q}`);
    const json = await res.json();
    setRows(json.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="neo-panel rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Project Search by Category</h1>
        <div className="mt-3 flex gap-2">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => void load()} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Search</button>
        </div>
      </div>
      <div className="grid gap-3">
        {rows.map((row) => (
          <article key={row.id} className="neo-panel rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase text-indigo-700">{row.category}</p>
            <h2 className="text-lg font-bold">{row.topic}</h2>
            <p className="text-sm">{row.summary}</p>
            <p className="mt-1 text-sm">Status: <span className="font-semibold">{row.status}</span></p>
          </article>
        ))}
      </div>
    </section>
  );
}
