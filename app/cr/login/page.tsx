"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CrLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("CR login failed.");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id,role")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      if (!profile) {
        const { error: createProfileError } = await supabase.from("profiles").insert({
          id: user.id,
          role: "cr",
          full_name: "Class Representative"
        });
        if (createProfileError) throw createProfileError;
      } else if (profile.role !== "cr" && profile.role !== "admin") {
        throw new Error("This account exists but is not marked as CR.");
      }

      router.push("/cr/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CR login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[70vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-2xl backdrop-blur-xl md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-10 text-white md:flex md:flex-col md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">StudyBuddy</p>
          <h2 className="mt-3 text-4xl font-black leading-tight">Control Center for Class Updates</h2>
          <p className="mt-4 text-sm text-indigo-100">
            Publish notices, upload materials, and keep students always up to date.
          </p>
        </div>
        <p className="text-xs text-indigo-100">Class Representative Portal</p>
      </div>

      <div className="p-8 md:p-10">
        <h1 className="text-3xl font-black gradient-title">CR Login</h1>
        <p className="mt-1 text-sm text-slate-600">Manage notices, materials, and video suggestions.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400"
            type="email"
            placeholder="CR email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 p-3 font-semibold text-white transition hover:opacity-90"
          >
            {busy ? "Signing in..." : "Login as CR"}
          </button>
        </form>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
    </section>
  );
}
