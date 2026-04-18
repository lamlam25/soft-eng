import Link from "next/link";
import { requireRoles } from "@/lib/auth";

export default async function CrAdminHome() {
  await requireRoles(["cr", "admin"]);
  return (
    <section className="space-y-5">
      <div className="glass card-shadow rounded-2xl p-6">
        <h1 className="text-3xl font-black gradient-title">CR Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-600">Manage notice updates, course contents, tutorial settings, feedback, and credentials.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Link href="/cr/admin/notices" className="glass card-shadow rounded-2xl p-5 font-semibold transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700">
          Manage Notices
        </Link>
        <Link href="/cr/admin/materials" className="glass card-shadow rounded-2xl p-5 font-semibold transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700">
          Manage Materials
        </Link>
        <Link href="/cr/admin/videos" className="glass card-shadow rounded-2xl p-5 font-semibold transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700">
          Video Auto Indexing
        </Link>
        <Link href="/cr/admin/feedback" className="glass card-shadow rounded-2xl p-5 font-semibold transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700">
          Feedback Inbox
        </Link>
        <Link href="/cr/admin/credentials" className="glass card-shadow rounded-2xl p-5 font-semibold transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700">
          Credentials
        </Link>
      </div>
    </section>
  );
}
