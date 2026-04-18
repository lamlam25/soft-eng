import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { quizQuery, midQuery, finalQuery } = body ?? {};
  if (!quizQuery || !midQuery || !finalQuery) {
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

  const { error } = await supabase.from("video_config").upsert(
    {
      id: 1,
      quiz_query: String(quizQuery),
      mid_query: String(midQuery),
      final_query: String(finalQuery),
      updated_by: userId
    },
    { onConflict: "id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
