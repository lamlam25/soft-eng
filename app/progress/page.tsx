import ProgressChart from "@/components/progress-chart";
import { requireRole } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { SUBJECTS } from "@/lib/types";

export default async function ProgressPage() {
  const profile = await requireRole("student");
  const supabase = await createServerSupabase();
  const [{ data: materials }, { data: completedRows }] = await Promise.all([
    supabase.from("materials").select("id,subject"),
    supabase
      .from("student_progress")
      .select("material_id")
      .eq("student_id", profile.id)
      .eq("completed", true)
  ]);

  const completed = new Set((completedRows ?? []).map((r) => r.material_id));
  const rows = SUBJECTS.map((subject) => {
    const subjectMaterials = (materials ?? []).filter((m) => m.subject === subject.slug);
    const total = subjectMaterials.length;
    const done = subjectMaterials.filter((m) => completed.has(m.id)).length;
    return {
      subject: subject.label,
      percent: total === 0 ? 0 : Math.round((done / total) * 100)
    };
  });

  const allTotal = (materials ?? []).length;
  const allDone = (materials ?? []).filter((m) => completed.has(m.id)).length;
  const overall = allTotal === 0 ? 0 : Math.round((allDone / allTotal) * 100);

  return (
    <section className="space-y-5">
      <div className="neo-panel animated-border rounded-2xl p-6">
        <h1 className="text-3xl font-black gradient-title">Progress Tracker</h1>
        <p className="mt-1 text-sm text-slate-600">Mark materials as studied from Materials and watch your progress grow.</p>
      </div>
      <div className="neo-panel rounded-2xl p-5">
        <p className="mb-2 text-lg font-bold">Overall Progress: {overall}%</p>
        <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 transition-all duration-700"
            style={{ width: `${overall}%` }}
          />
        </div>
        <ProgressChart rows={rows} />
      </div>
    </section>
  );
}
