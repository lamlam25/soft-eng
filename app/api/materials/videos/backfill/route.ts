import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { indexMaterialVideos } from "@/lib/youtube-materials";

export async function POST(request: Request) {
  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "Missing YOUTUBE_API_KEY in environment." }, { status: 500 });
  }

  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
  if (!profile || (profile.role !== "cr" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const force = Boolean(body?.force);

  const { data: materials, error: materialsError } = await supabase
    .from("materials")
    .select("id,title,subject,category")
    .in("category", ["mid-slides", "final-slides"])
    .order("created_at", { ascending: false })
    .limit(500);

  if (materialsError) {
    return NextResponse.json({ error: materialsError.message }, { status: 500 });
  }

  const results = await Promise.all(
    (materials ?? []).map((material) => indexMaterialVideos(supabase, material, { force, maxVideos: 5 }))
  );
  const done = results.filter((row) => row.status === "ready").length;
  const skipped = results.filter((row) => row.status === "skipped").length;
  const failed = results.filter((row) => row.status === "error").length;
  const firstFailure = results.find((row) => row.status === "error")?.reason ?? null;

  return NextResponse.json({
    ok: true,
    total: results.length,
    indexed: done,
    skipped,
    failed,
    firstFailure,
    results
  });
}

