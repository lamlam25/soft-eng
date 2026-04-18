"use client";

import { useEffect, useMemo, useState } from "react";

function format(ms: number) {
  if (ms <= 0) return "Started";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

export default function Countdown({ targetIso }: { targetIso: string }) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
      {format(target - now)}
    </span>
  );
}
