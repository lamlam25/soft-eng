"use client";

import { useState, type FormEvent } from "react";

export default function NoticesManager() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("operating-system");
  const [eventType, setEventType] = useState("quiz");
  const [scheduledAt, setScheduledAt] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subject, eventType, scheduledAt, syllabus })
    });
    setMessage(res.ok ? "Notice saved." : "Failed to save notice.");
    if (res.ok) {
      setTitle("");
      setSyllabus("");
      setScheduledAt("");
    }
  }

  return (
    <section className="rounded bg-white p-5 shadow">
      <h1 className="mb-4 text-2xl font-bold">Manage Notices</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input className="rounded border p-2" placeholder="Notice title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="rounded border p-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="operating-system">Operating System</option>
          <option value="software-engineering">Software Engineering</option>
          <option value="artificial-intelligence">Artificial Intelligence</option>
          <option value="introduction-to-data-science">Introduction to Data Science</option>
        </select>
        <select className="rounded border p-2" value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="quiz">Quiz</option>
          <option value="mid">Mid</option>
          <option value="final">Final</option>
        </select>
        <input className="rounded border p-2" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        <textarea className="rounded border p-2" placeholder="Syllabus" value={syllabus} onChange={(e) => setSyllabus(e.target.value)} />
        <button className="rounded bg-indigo-700 p-2 text-white">Save notice</button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </section>
  );
}
