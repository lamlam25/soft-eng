import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  let query = supabase
    .from("profiles")
    .select("id,full_name,student_code,role")
    .eq("role", "cr")
    .order("full_name", { ascending: true })
    .limit(50);

  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: profiles, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (profiles ?? []).map((p) => p.id);
  if (ids.length === 0) return NextResponse.json({ items: [] });

  const { data: details } = await supabase
    .from("cr_profiles")
    .select("cr_id,designation,expertise,bio,contact_email")
    .in("cr_id", ids);

  const detailMap = new Map((details ?? []).map((d) => [d.cr_id, d]));
  const items = (profiles ?? []).map((profile) => ({
    ...profile,
    detail: detailMap.get(profile.id) ?? null
  }));

  return NextResponse.json({ items });
}
