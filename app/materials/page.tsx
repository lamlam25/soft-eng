import Link from "next/link";
import { requireAnyUser } from "@/lib/auth";
import { SUBJECTS } from "@/lib/types";

export default async function MaterialsIndexPage() {
  await requireAnyUser();

  return (
    <section className="space-y-5">
      <div className="neo-panel animated-border rounded-2xl p-6">
        <h1 className="text-3xl font-black tracking-tight gradient-title">Study Materials</h1>
        <p className="mt-1 text-sm text-slate-600">Choose a subject and start tracking progress resource by resource.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SUBJECTS.map((subject) => (
          <Link
            key={subject.slug}
            href={`/materials/${subject.slug}`}
            className="neo-panel lift rounded-2xl p-5 font-semibold hover:text-indigo-700"
          >
            {subject.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
