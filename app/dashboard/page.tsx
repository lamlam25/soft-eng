import Countdown from "@/components/countdown";
import ProgressChart from "@/components/progress-chart";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { SUBJECTS } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await requireRole("student");
  const supabase = await createServerSupabase();

  const [{ data: notices }, { data: materials }, { data: progressRows }] = await Promise.all([
    supabase
      .from("notices")
      .select("id,title,subject,syllabus,scheduled_at,event_type")
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(8),
    supabase.from("materials").select("id,subject"),
    supabase
      .from("student_progress")
      .select("material_id,completed")
      .eq("student_id", profile.id)
      .eq("completed", true)
  ]);

  const bySubject = SUBJECTS.map((subject) => {
    const total = (materials ?? []).filter((m) => m.subject === subject.slug).length;
    const done = (progressRows ?? []).filter((p) =>
      (materials ?? []).some((m) => m.id === p.material_id && m.subject === subject.slug)
    ).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { subject: subject.label, percent };
  });

  return (
    <section className="space-y-6">
      <div className="neo-panel animated-border rounded-2xl p-6">
        <h1 className="text-3xl font-black tracking-tight gradient-title">
          Welcome, {profile.full_name ?? profile.student_code}
        </h1>
        <p className="mt-1 text-sm text-slate-600">Track notices, materials, videos, and progress in one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="neo-panel rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-bold">Upcoming Notices</h2>
          <div className="space-y-3">
            {(notices ?? []).map((notice) => (
              <article key={notice.id} className="lift rounded-xl border border-slate-200 bg-white/90 p-4">
                <p className="font-semibold">{notice.title}</p>
                <p className="text-sm text-slate-600">
                  {notice.subject} • {notice.event_type} • {new Date(notice.scheduled_at).toLocaleString()}
                </p>
                <p className="text-sm">Syllabus: {notice.syllabus}</p>
                <p className="mt-1 text-sm">
                  Starts in: <Countdown targetIso={notice.scheduled_at} />
                </p>
              </article>
            ))}
            {(notices ?? []).length === 0 && <p className="text-sm text-slate-600">No upcoming notices yet.</p>}
          </div>
        </div>

        <div className="neo-panel rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-bold">Subject Progress</h2>
          <ProgressChart rows={bySubject} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/project-search" className="neo-panel lift rounded-2xl p-4 font-semibold">Topic & subject search</Link>
        <Link href="/videos" className="neo-panel lift rounded-2xl p-4 font-semibold">Quiz/Mid/Final tutorials</Link>
        <Link href="/defense-schedule" className="neo-panel lift rounded-2xl p-4 font-semibold">Exam countdown timer</Link>
      </div>
    </section>
  );
}
