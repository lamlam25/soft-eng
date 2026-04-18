"use client";

import { useEffect, useState } from "react";

export default function InteractiveBackground() {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  useEffect(() => {
    function onMove(event: MouseEvent) {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      setMouse({ x, y });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
      <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
      <div
        className="absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl transition-all duration-300"
        style={{ left: `${mouse.x}%`, top: `${mouse.y}%` }}
      />
    </div>
  );
}
