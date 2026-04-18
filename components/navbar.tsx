import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

async function signOut() {
  "use server";
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
}

export default async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href={profile?.role === "cr" || profile?.role === "admin" ? "/cr/admin" : "/dashboard"}
          className="text-xl font-extrabold tracking-tight gradient-title"
        >
          StudyBuddy
        </Link>
        {profile ? (
          <div className="flex max-w-[78vw] items-center gap-2 overflow-x-auto text-sm">
            {profile.role === "student" && (
              <>
                <Link href="/dashboard" className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Dashboard</Link>
                <Link href="/materials" className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Courses</Link>
                <Link href="/videos" className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Tutorials</Link>
                <Link href="/project-search" className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Topic Search</Link>
                <Link href="/defense-schedule" className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Exam Timer</Link>
                <Link href="/feedback" className="rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Suggestions</Link>
                <Link href="/notifications" className="rounded-full bg-gradient-to-r from-slate-700 to-slate-900 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Notices</Link>
                <Link href="/progress" className="rounded-full bg-gradient-to-r from-lime-500 to-green-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Progress</Link>
              </>
            )}
            {(profile.role === "cr" || profile.role === "admin") && (
              <>
                <Link href="/cr/admin" className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Admin</Link>
                <Link href="/materials" className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Courses</Link>
                <Link href="/videos" className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Tutorials</Link>
                <Link href="/project-search" className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Topic Search</Link>
                <Link href="/defense-schedule" className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Exam Timer</Link>
                <Link href="/cr/admin/notices" className="rounded-full bg-gradient-to-r from-slate-700 to-slate-900 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Notice Admin</Link>
                <Link href="/cr/admin/feedback" className="rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Suggestions</Link>
                <Link href="/cr/admin/credentials" className="rounded-full bg-gradient-to-r from-lime-500 to-green-500 px-3 py-1.5 font-semibold text-white transition hover:opacity-90">Credentials</Link>
              </>
            )}
            <form action={signOut}>
              <button className="rounded-full bg-slate-900 px-4 py-1.5 text-white transition hover:bg-slate-700">Logout</button>
            </form>
          </div>
        ) : (
          <div className="flex gap-3 text-sm">
            <Link href="/login" className="rounded-full px-3 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700">Student Login</Link>
            <Link href="/cr/login" className="rounded-full bg-indigo-600 px-4 py-1.5 text-white transition hover:bg-indigo-500">CR Login</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
