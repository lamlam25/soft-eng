import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() ?? "";
  let query = supabase
    .from("project_registrations")
    .select("id,topic,category,summary,status,student_id,cr_id,created_at")
    .order("created_at", { ascending: false })
    .limit(150);

  if (category) query = query.eq("category", category);

  if (profile.role === "student") query = query.eq("student_id", userId);
  if (profile.role === "cr") query = query.or(`cr_id.eq.${userId},status.eq.proposed`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role,full_name").eq("id", userId).single();
  if (!profile || profile.role !== "student") {
    return NextResponse.json({ error: "Only students can register projects." }, { status: 403 });
  }

  const body = await request.json();
  const topic = String(body?.topic ?? "").trim();
  const category = String(body?.category ?? "").trim();
  const summary = String(body?.summary ?? "").trim();
  const crId = String(body?.crId ?? "").trim();
  if (!topic || !category || !summary) {
    return NextResponse.json({ error: "Topic, category and summary are required." }, { status: 400 });
  }

  const { error } = await supabase.from("project_registrations").insert({
    student_id: userId,
    cr_id: crId || null,
    topic,
    category,
    summary,
    status: "proposed"
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (crId) {
    await supabase.from("notifications").insert({
      user_id: crId,
      title: "New project registration",
      message: `${profile.full_name ?? "A student"} submitted a project topic: ${topic}`
    });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || (profile.role !== "cr" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Only CR/Admin can update status." }, { status: 403 });
  }

  const body = await request.json();
  const id = String(body?.id ?? "");
  const status = String(body?.status ?? "");
  if (!id || !status) return NextResponse.json({ error: "id and status are required." }, { status: 400 });

  const { data: row, error: getError } = await supabase
    .from("project_registrations")
    .select("student_id,topic")
    .eq("id", id)
    .single();
  if (getError) return NextResponse.json({ error: getError.message }, { status: 500 });

  const { error } = await supabase.from("project_registrations").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("notifications").insert({
    user_id: row.student_id,
    title: "Project status updated",
    message: `Your project "${row.topic}" is now "${status}".`
  });

  return NextResponse.json({ ok: true });
}
