import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("notices")
    .select("id,title,subject,event_type,scheduled_at,syllabus")
    .in("event_type", ["quiz", "mid", "final"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, subject, eventType, scheduledAt, syllabus } = body ?? {};
  if (!title || !subject || !eventType || !scheduledAt || !syllabus) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || (profile.role !== "cr" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error } = await supabase.from("notices").insert({
    title: String(title),
    subject: String(subject),
    event_type: String(eventType),
    scheduled_at: new Date(String(scheduledAt)).toISOString(),
    syllabus: String(syllabus),
    created_by: userId
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
