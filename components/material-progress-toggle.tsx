"use client";

import { useState } from "react";

type Props = {
  materialId: string;
  initialChecked: boolean;
};

export default function MaterialProgressToggle({ materialId, initialChecked }: Props) {
  const [checked, setChecked] = useState(initialChecked);
  const [busy, setBusy] = useState(false);

  async function onChange(next: boolean) {
    setBusy(true);
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId, completed: next })
    });
    setBusy(false);
    if (!response.ok) return;
    setChecked(next);
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        disabled={busy}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      Mark studied
    </label>
  );
}
