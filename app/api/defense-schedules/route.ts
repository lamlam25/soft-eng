import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("defense_schedules")
    .select("id,project_id,scheduled_at,venue,panel,created_at")
    .order("scheduled_at", { ascending: true })
    .limit(150);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const projectIds = (data ?? []).map((d) => d.project_id);
  let projects: { id: string; topic: string; student_id: string }[] = [];
  if (projectIds.length > 0) {
    const { data: proj } = await supabase
      .from("project_registrations")
      .select("id,topic,student_id")
      .in("id", projectIds);
    projects = proj ?? [];
  }
  const map = new Map(projects.map((p) => [p.id, p]));
  const items = (data ?? []).map((row) => ({ ...row, project: map.get(row.project_id) ?? null }));
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || (profile.role !== "cr" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Only CR/Admin can schedule defense." }, { status: 403 });
  }

  const body = await request.json();
  const projectId = String(body?.projectId ?? "");
  const scheduledAt = String(body?.scheduledAt ?? "");
  const venue = String(body?.venue ?? "");
  const panel = String(body?.panel ?? "");
  if (!projectId || !scheduledAt || !venue) {
    return NextResponse.json({ error: "projectId, scheduledAt and venue are required." }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("project_registrations")
    .select("id,student_id,topic")
    .eq("id", projectId)
    .single();
  if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 });

  const { error } = await supabase.from("defense_schedules").insert({
    project_id: projectId,
    scheduled_at: new Date(scheduledAt).toISOString(),
    venue,
    panel: panel || null,
    created_by: userId
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("notifications").insert({
    user_id: project.student_id,
    title: "Defense scheduled",
    message: `Defense for "${project.topic}" is scheduled on ${new Date(scheduledAt).toLocaleString()} at ${venue}.`
  });

  return NextResponse.json({ ok: true });
}
