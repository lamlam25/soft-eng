import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const q = searchParams.get("q")?.trim() ?? "";

  let materialsQuery = supabase
    .from("materials")
    .select("title,subject,category,file_url,external_url")
    .order("created_at", { ascending: false })
    .limit(100);
  if (subject) materialsQuery = materialsQuery.eq("subject", subject);
  if (category) materialsQuery = materialsQuery.eq("category", category);
  if (q) materialsQuery = materialsQuery.ilike("title", `%${q}%`);

  let noticesQuery = supabase
    .from("notices")
    .select("title,subject,event_type,scheduled_at")
    .order("scheduled_at", { ascending: true })
    .limit(100);
  if (subject) noticesQuery = noticesQuery.eq("subject", subject);
  if (q) noticesQuery = noticesQuery.ilike("title", `%${q}%`);

  const [{ data: materials }, { data: notices }] = await Promise.all([materialsQuery, noticesQuery]);

  const items = [
    ...((materials ?? []).map((m) => ({
      type: "material" as const,
      title: m.title,
      subject: m.subject,
      category: m.category,
      link: m.file_url || m.external_url || undefined
    }))),
    ...((notices ?? []).map((n) => ({
      type: "notice" as const,
      title: n.title,
      subject: n.subject,
      category: n.event_type,
      time: n.scheduled_at
    })))
  ];

  return NextResponse.json({ items });
}
