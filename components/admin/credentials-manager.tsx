"use client";

import { useEffect, useState } from "react";

type Credential = {
  id: string;
  credential_name: string;
  username: string;
  secret_hint: string;
  is_active: boolean;
};

type UserCredential = {
  id: string;
  full_name: string | null;
  role: "student" | "cr";
  student_code: string | null;
};

export default function CredentialsManager() {
  const [credentialName, setCredentialName] = useState("");
  const [username, setUsername] = useState("");
  const [secretHint, setSecretHint] = useState("");
  const [rows, setRows] = useState<Credential[]>([]);
  const [users, setUsers] = useState<UserCredential[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"student" | "cr">("student");
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [res, usersRes] = await Promise.all([
      fetch("/api/admin-credentials"),
      fetch("/api/user-credentials")
    ]);
    const [json, usersJson] = await Promise.all([res.json(), usersRes.json()]);
    setRows(json.items ?? []);
    setUsers(usersJson.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentialName, username, secretHint, isActive: true })
    });
    const json = await res.json();
    setMessage(res.ok ? "Credential metadata saved." : json.error || "Failed.");
    if (res.ok) {
      setCredentialName("");
      setUsername("");
      setSecretHint("");
      await load();
    }
  }

  async function updateUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/user-credentials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUserId,
        fullName: newName,
        role: newRole,
        newPassword
      })
    });
    const json = await res.json();
    setMessage(res.ok ? "User credential/profile updated." : json.error || "Failed.");
    if (res.ok) {
      setNewPassword("");
      setNewName("");
      await load();
    }
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="neo-panel rounded-2xl p-5">
        <h1 className="text-2xl font-black gradient-title">Admin Credential Management</h1>
        <p className="mt-1 text-xs text-slate-500">Store metadata and hints only, not raw passwords.</p>
        <form onSubmit={submit} className="mt-3 grid gap-2">
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Credential name" value={credentialName} onChange={(e) => setCredentialName(e.target.value)} />
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Username / email" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Secret hint" value={secretHint} onChange={(e) => setSecretHint(e.target.value)} />
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white">Save metadata</button>
        </form>
        {message && <p className="mt-2 text-sm text-indigo-700">{message}</p>}
      </div>
      <div className="neo-panel rounded-2xl p-5">
        <h2 className="text-lg font-bold">Stored credentials</h2>
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-semibold">{row.credential_name}</p>
              <p className="text-sm">Username: {row.username}</p>
              <p className="text-sm">Hint: {row.secret_hint}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="neo-panel rounded-2xl p-5 md:col-span-2">
        <h2 className="text-lg font-bold">Student / CR credential controls</h2>
        <form onSubmit={updateUser} className="mt-3 grid gap-2 md:grid-cols-4">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name ?? u.id} ({u.role}{u.student_code ? ` / ${u.student_code}` : ""})
              </option>
            ))}
          </select>
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="New full name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2" value={newRole} onChange={(e) => setNewRole(e.target.value as "student" | "cr")}>
            <option value="student">student</option>
            <option value="cr">cr</option>
          </select>
          <input className="rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder="Reset password (optional)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 font-semibold text-white md:col-span-4">
            Update user credentials/profile
          </button>
        </form>
      </div>
    </section>
  );
}
