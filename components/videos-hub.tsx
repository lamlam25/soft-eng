"use client";

import { useState } from "react";
import YoutubeList from "@/components/youtube-list";

export default function VideosHub() {
  const [active, setActive] = useState<"mid" | "final">("mid");

  return (
    <section className="neo-panel animated-border card-shadow rounded-2xl p-5">
      <h1 className="mb-2 text-2xl font-black gradient-title">Tutorials by Uploaded Slides</h1>
      <p className="mb-3 text-sm text-slate-600">Each uploaded slide is used as a topic and auto-fetches up to 5 YouTube videos.</p>

      <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1">
        <button
          onClick={() => setActive("mid")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === "mid" ? "bg-white text-indigo-700 shadow" : "text-slate-600 hover:text-indigo-700"
          }`}
        >
          Mid Exam Focus
        </button>
        <button
          onClick={() => setActive("final")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === "final" ? "bg-white text-indigo-700 shadow" : "text-slate-600 hover:text-indigo-700"
          }`}
        >
          Final Exam Focus
        </button>
      </div>

      <div className="rounded-xl bg-white/70 p-3">
        <YoutubeList type={active} />
      </div>
    </section>
  );
}
