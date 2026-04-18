import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { title, subject, category, fileUrl } = body ?? {};
  if (!title || !subject || !category || !fileUrl) {
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

  const { error } = await supabase.from("materials").insert({
    title: String(title),
    subject: String(subject),
    category: String(category),
    file_url: String(fileUrl),
    external_url: null,
    created_by: userId
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
