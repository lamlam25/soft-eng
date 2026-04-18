"use client";

import { useEffect, useState } from "react";

type User = { id: string; full_name: string | null };
type Message = { id: string; subject: string; message: string; created_at: string };

export default function FeedbackCenter() {
  const [toUser, setToUser] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<Message[]>([]);
  const [targets, setTargets] = useState<User[]>([]);
  const [status, setStatus] = useState("");

  async function loadMessages() {
    const res = await fetch("/api/feedback");
    const json = await res.json();
    setRows(json.items ?? []);
  }

  useEffect(() => {
    void loadMessages();
    async function loadTargets() {
      const [crRes, adminRes] = await Promise.all([
        fetch("/api/users?role=cr"),
        fetch("/api/users?role=admin")
      ]);
      const [crJson, adminJson] = await Promise.all([crRes.json(), adminRes.json()]);
      setTargets([...(crJson.items ?? []), ...(adminJson.items ?? [])]);
    }
    void loadTargets();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUser, subject, message })
    });
    const json = await res.json();
    setStatus(res.ok ? "Sent successfully." : json.error || "Failed to send.");
    if (res.ok) {
      setSubject("");
      setMessage("");
      await loadMessages();
    }
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="neo-panel rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Content Suggestions & Feedback</h1>
        <form onSubmit={submit} className="mt-3 grid gap-2">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={toUser} onChange={(e) => setToUser(e.target.value)}>
            <option value="">Choose CR/Admin recipient</option>
            {targets.map((u) => <option key={u.id} value={u.id}>{u.full_name ?? u.id}</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Subject (e.g., Add OS final solved papers)" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Your suggestion or feedback for course contents" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 font-semibold text-white">Send suggestion</button>
        </form>
        {status && <p className="mt-2 text-sm text-indigo-700">{status}</p>}
      </div>
      <div className="neo-panel rounded-2xl p-5">
        <h2 className="text-lg font-bold">Recent Messages</h2>
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-semibold">{row.subject}</p>
              <p className="text-sm">{row.message}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
