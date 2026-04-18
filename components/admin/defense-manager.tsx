"use client";

import { useEffect, useState } from "react";

type Project = { id: string; topic: string };

export default function DefenseManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");
  const [panel, setPanel] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/project-registrations");
      const json = await res.json();
      setProjects((json.items ?? []).map((p: any) => ({ id: p.id, topic: p.topic })));
    }
    void load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/defense-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, scheduledAt, venue, panel })
    });
    const json = await res.json();
    setMessage(res.ok ? "Defense scheduled." : json.error || "Failed.");
  }

  return (
    <section className="neo-panel rounded-2xl p-5">
      <h1 className="text-2xl font-black gradient-title">Project Defense Scheduling</h1>
      <form onSubmit={submit} className="mt-3 grid gap-2">
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Select project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.topic}</option>)}
        </select>
        <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
        <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Panel members" value={panel} onChange={(e) => setPanel(e.target.value)} />
        <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Schedule defense</button>
      </form>
      {message && <p className="mt-2 text-sm text-indigo-700">{message}</p>}
    </section>
  );
}
