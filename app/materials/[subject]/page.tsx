import { notFound } from "next/navigation";
import MaterialProgressToggle from "@/components/material-progress-toggle";
import { requireAnyUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { getLocalMaterials } from "@/lib/local-content";
import { CATEGORIES, SUBJECTS, type SubjectSlug } from "@/lib/types";

type Params = { subject: SubjectSlug };

export default async function SubjectMaterialsPage({ params }: { params: Promise<Params> }) {
  const { subject: subjectSlug } = await params;
  const profile = await requireAnyUser();
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);
  if (!subject) notFound();

  const supabase = await createServerSupabase();
  const [{ data: materials }, { data: progress }, localMaterials] = await Promise.all([
    supabase
      .from("materials")
      .select("id,title,category,file_url,external_url")
      .eq("subject", subjectSlug)
      .order("created_at", { ascending: false }),
    supabase
      .from("student_progress")
      .select("material_id,completed")
      .eq("student_id", profile.id),
    getLocalMaterials(subjectSlug)
  ]);

  const doneIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.material_id));

  return (
    <section className="space-y-6">
      <div className="neo-panel animated-border rounded-2xl p-6">
        <h1 className="text-3xl font-black tracking-tight gradient-title">{subject.label}</h1>
        <p className="mt-1 text-sm text-slate-600">Open resources and mark each one as studied.</p>
      </div>
      {CATEGORIES.map((cat) => {
        const rows = (materials ?? []).filter((m) => m.category === cat.key);
        const localRows = localMaterials.filter((m) => m.category === cat.key);
        return (
          <div key={cat.key} className="neo-panel rounded-2xl p-5">
            <h2 className="mb-3 text-lg font-bold">{cat.label}</h2>
            {rows.length === 0 && localRows.length === 0 && <p className="text-sm text-slate-600">No files yet.</p>}
            <div className="space-y-2">
              {rows.map((item) => {
                const link = item.file_url || item.external_url || "#";
                return (
                  <div key={item.id} className="lift rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <a href={link} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-700 hover:text-indigo-500">
                          Open file
                        </a>
                      </div>
                      {profile.role === "student" && (
                        <MaterialProgressToggle materialId={item.id} initialChecked={doneIds.has(item.id)} />
                      )}
                    </div>
                  </div>
                );
              })}
              {localRows.map((item) => (
                <div key={`local-${item.url}`} className="lift rounded-xl border border-cyan-200 bg-cyan-50/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-cyan-700 hover:text-cyan-500">
                        Open local file
                      </a>
                    </div>
                    <span className="rounded-full bg-cyan-200 px-2 py-1 text-xs font-semibold text-cyan-800">LOCAL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
