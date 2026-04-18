"use client";

import { useEffect, useState } from "react";

type CrItem = {
  id: string;
  full_name: string | null;
  detail: { designation?: string; expertise?: string; bio?: string; contact_email?: string } | null;
};

export default function CrBrowser() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load(query: string) {
    setLoading(true);
    const res = await fetch(`/api/crs?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    setRows(json.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load("");
  }, []);

  async function selectCr(crId: string) {
    setMessage("");
    const res = await fetch("/api/cr/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crId, note: "Please supervise my project." })
    });
    const json = await res.json();
    setMessage(res.ok ? "CR selection request sent." : json.error || "Failed to send request.");
  }

  return (
    <section className="space-y-4">
      <div className="neo-panel rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">CR Search & Profiles</h1>
        <div className="mt-3 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search CR by name"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
          />
          <button onClick={() => void load(q)} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Search</button>
        </div>
        {message && <p className="mt-3 text-sm text-indigo-700">{message}</p>}
      </div>

      {loading && <p className="text-sm text-slate-600">Loading...</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="neo-panel lift rounded-2xl p-4">
            <h2 className="text-lg font-bold">{row.full_name ?? "Unnamed CR"}</h2>
            <p className="text-sm text-slate-600">{row.detail?.designation ?? "Class Representative"}</p>
            <p className="mt-2 text-sm">{row.detail?.bio ?? "No profile bio added yet."}</p>
            <p className="mt-1 text-xs text-slate-600">Expertise: {row.detail?.expertise ?? "General guidance"}</p>
            <p className="text-xs text-slate-600">Contact: {row.detail?.contact_email ?? "Not set"}</p>
            <button onClick={() => void selectCr(row.id)} className="mt-3 rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white">
              Select this CR
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
