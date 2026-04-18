"use client";

import { useEffect, useState } from "react";

type VideoItem = {
  id: string;
  title: string;
  channel: string;
  publishedAt: string;
  videoUrl: string;
  rank: number;
};

type SlideGroup = {
  materialId: string;
  slideTitle: string;
  subject: string;
  videos: VideoItem[];
};

export default function YoutubeList({ type }: { type: "mid" | "final" }) {
  const [slides, setSlides] = useState<SlideGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/youtube?type=${type}`);
      if (!res.ok) {
        setLoading(false);
        setError("Could not load videos.");
        return;
      }
      const json = await res.json();
      setSlides(json.slides ?? []);
      setLoading(false);
    }
    void load();
  }, [type]);

  if (loading) return <p className="text-sm text-slate-600">Loading videos...</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (slides.length === 0) return <p className="text-sm text-slate-600">No slide-based videos found yet.</p>;

  return (
    <div className="grid gap-3">
      {slides.map((slide) => (
        <section key={slide.materialId} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <h3 className="font-semibold">{slide.slideTitle}</h3>
          <p className="mb-3 text-xs text-slate-600">{slide.subject.replace(/-/g, " ")}</p>
          {slide.videos.length === 0 ? (
            <p className="text-sm text-slate-500">No videos found for this slide topic yet.</p>
          ) : (
            <div className="grid gap-2">
              {slide.videos.map((item) => (
                <a
                  key={`${slide.materialId}-${item.id}`}
                  href={item.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white"
                >
                  <p className="font-medium">{item.rank}. {item.title}</p>
                  <p className="text-xs text-slate-600">
                    {item.channel} • {new Date(item.publishedAt).toLocaleDateString()}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
