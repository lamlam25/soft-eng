"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeStudentCode, studentCodeToEmail } from "@/lib/student-code";

export default function StudentLoginPage() {
  const router = useRouter();
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const normalized = normalizeStudentCode(studentCode);
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: studentCodeToEmail(normalized),
        password
      });
      if (authError) throw authError;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
      <h1 className="mb-1 text-3xl font-black gradient-title">Student Login</h1>
      <p className="mb-5 text-sm text-slate-600">Access dashboard, study materials, videos, and progress.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400"
          placeholder="Student ID (000-999)"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-2.5 font-semibold text-white transition hover:opacity-90">
          {busy ? "Signing in..." : "Login"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <p className="mt-4 text-sm">
        New student? <Link className="text-indigo-700 underline" href="/register">Create account</Link>
      </p>
      <p className="mt-2 text-sm">
        CR? <Link className="text-indigo-700 underline" href="/cr/login">CR login</Link>
      </p>
    </section>
  );
}
