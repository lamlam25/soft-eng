"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeStudentCode, studentCodeToEmail } from "@/lib/student-code";

export default function RegisterPage() {
  const router = useRouter();
  const [studentCode, setStudentCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const code = normalizeStudentCode(studentCode);
      const registerResponse = await fetch("/api/register-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: code,
          fullName,
          password
        })
      });
      const registerJson = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerJson.error || "Registration failed.");
      }

      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: studentCodeToEmail(code),
        password
      });
      if (loginError) throw loginError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
      <h1 className="mb-1 text-3xl font-black gradient-title">Create Student Account</h1>
      <p className="mb-5 text-sm text-slate-600">Register once with your 3-digit student ID and password.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400"
          placeholder="Student ID (000-999)"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400"
          placeholder="Full name (optional)"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-2.5 font-semibold text-white transition hover:opacity-90">
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </section>
  );
}
