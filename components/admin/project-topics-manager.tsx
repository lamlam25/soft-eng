"use client";

import { useEffect, useState } from "react";
import { PROJECT_CATEGORIES } from "@/lib/types";

type Topic = { id: string; title: string; category: string; description: string; video_url: string | null };

export default function ProjectTopicsManager() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(PROJECT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [rows, setRows] = useState<Topic[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/project-topics");
    const json = await res.json();
    setRows(json.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/project-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, description, videoUrl })
    });
    const json = await res.json();
    setMessage(res.ok ? "Topic added." : json.error || "Failed.");
    if (res.ok) {
      setTitle("");
      setDescription("");
      setVideoUrl("");
      await load();
    }
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="neo-panel rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Project Topic Ideas</h1>
        <form onSubmit={submit} className="mt-3 grid gap-2">
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Topic title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
            {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Topic description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Tutorial video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Add topic</button>
        </form>
        {message && <p className="mt-2 text-sm text-indigo-700">{message}</p>}
      </div>
      <div className="neo-panel rounded-2xl p-5">
        <h2 className="text-lg font-bold">Published Topics</h2>
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase text-indigo-700">{row.category}</p>
              <p className="font-semibold">{row.title}</p>
              <p className="text-sm">{row.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
