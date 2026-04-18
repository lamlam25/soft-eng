"use client";

import { useState } from "react";

export default function VideoSettingsManager() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function runBackfill(force: boolean) {
    setBusy(true);
    const res = await fetch("/api/materials/videos/backfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(body.error || "Backfill failed.");
      setBusy(false);
      return;
    }
    const base = `Backfill done. Indexed: ${body.indexed ?? 0}, Skipped: ${body.skipped ?? 0}, Failed: ${body.failed ?? 0}.`;
    const details = body.firstFailure ? ` First failure: ${body.firstFailure}` : "";
    setMessage(`${base}${details}`);
    setBusy(false);
  }

  return (
    <section className="rounded bg-white p-5 shadow">
      <h1 className="mb-2 text-2xl font-bold">Auto Video Indexing</h1>
      <p className="mb-4 text-sm text-slate-600">
        CR/Admin only upload slides. The system auto-fetches up to 5 YouTube videos per mid/final slide topic.
      </p>
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => void runBackfill(false)} className="rounded bg-indigo-700 px-3 py-2 text-white disabled:opacity-60">
          {busy ? "Running..." : "Backfill missing videos"}
        </button>
        <button
          disabled={busy}
          onClick={() => void runBackfill(true)}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-700 disabled:opacity-60"
        >
          {busy ? "Running..." : "Re-fetch all videos"}
        </button>
      </div>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </section>
  );
}
