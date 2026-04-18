"use client";

import { useEffect, useState } from "react";
import { PROJECT_CATEGORIES } from "@/lib/types";

type User = { id: string; full_name: string | null };

export default function ProjectRegistrationForm() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<string>(PROJECT_CATEGORIES[0]);
  const [summary, setSummary] = useState("");
  const [crId, setCrId] = useState("");
  const [crs, setCrs] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/users?role=cr");
      const json = await res.json();
      setCrs(json.items ?? []);
    }
    void load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/project-registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, category, summary, crId })
    });
    const json = await res.json();
    setMessage(res.ok ? "Project registration submitted." : json.error || "Failed to submit.");
  }

  return (
    <section className="neo-panel rounded-2xl p-5">
      <h1 className="text-2xl font-black gradient-title">Project Registration</h1>
      <form onSubmit={submit} className="mt-3 grid gap-2">
        <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Project topic title" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Project summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={crId} onChange={(e) => setCrId(e.target.value)}>
          <option value="">Select CR (optional)</option>
          {crs.map((cr) => <option key={cr.id} value={cr.id}>{cr.full_name ?? cr.id}</option>)}
        </select>
        <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Submit registration</button>
      </form>
      {message && <p className="mt-3 text-sm text-indigo-700">{message}</p>}
    </section>
  );
}
