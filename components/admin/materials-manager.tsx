"use client";

import { useState, type FormEvent } from "react";

export default function MaterialsManager() {
  const [titlePrefix, setTitlePrefix] = useState("");
  const [subject, setSubject] = useState("operating-system");
  const [category, setCategory] = useState("mid-slides");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (files.length === 0) {
      setMessage("Please choose at least one file.");
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      if (titlePrefix.trim()) formData.append("titlePrefix", titlePrefix.trim());
      formData.append("subject", subject);
      formData.append("category", category);

      const uploadRes = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage(uploadJson.error || "Upload failed.");
        return;
      }
      const attempted = Number(uploadJson?.videoIndexing?.attempted ?? 0);
      const failed = Number(uploadJson?.videoIndexing?.failed ?? 0);
      const summary =
        attempted > 0
          ? ` Video auto-indexing: ${attempted - failed}/${attempted} slide topic(s) fetched.`
          : " Video auto-indexing skipped for this category.";
      setMessage(`Uploaded ${uploadJson.count ?? files.length} file(s) successfully.${summary}`);
      setTitlePrefix("");
      setFiles([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded bg-white p-5 shadow">
      <h1 className="mb-2 text-2xl font-bold">Manage Materials</h1>
      <p className="mb-4 text-sm text-slate-600">
        Upload one or many files at once. Files go to Supabase bucket <code>study-materials</code> and are auto-saved to materials.
      </p>
      <form onSubmit={submit} className="grid gap-3">
        <input
          className="rounded border p-2"
          placeholder="Optional title prefix (e.g., OS Week 1)"
          value={titlePrefix}
          onChange={(e) => setTitlePrefix(e.target.value)}
        />
        <select className="rounded border p-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="operating-system">Operating System</option>
          <option value="software-engineering">Software Engineering</option>
          <option value="artificial-intelligence">Artificial Intelligence</option>
          <option value="introduction-to-data-science">Introduction to Data Science</option>
        </select>
        <select className="rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="mid-slides">Mid Slides</option>
          <option value="final-slides">Final Slides</option>
          <option value="questions">Questions</option>
        </select>
        <input
          className="rounded border p-2"
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        <p className="text-xs text-slate-600">{files.length} file(s) selected</p>
        <button disabled={busy} className="rounded bg-indigo-700 p-2 text-white disabled:opacity-60">
          {busy ? "Uploading..." : "Upload selected files"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </section>
  );
}
