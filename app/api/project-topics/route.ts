import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() ?? "";
  const q = searchParams.get("q")?.trim() ?? "";

  let query = supabase
    .from("project_topics")
    .select("id,title,category,description,video_url,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (category) query = query.eq("category", category);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || (profile.role !== "cr" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Only CR/Admin can add topics." }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body?.title ?? "").trim();
  const category = String(body?.category ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const videoUrl = String(body?.videoUrl ?? "").trim();
  if (!title || !category || !description) {
    return NextResponse.json({ error: "Title, category and description are required." }, { status: 400 });
  }

  const { error } = await supabase.from("project_topics").insert({
    title,
    category,
    description,
    video_url: videoUrl || null,
    created_by: userId
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
