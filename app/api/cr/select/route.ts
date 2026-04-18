import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role,full_name").eq("id", userId).single();
  if (!me || me.role !== "student") return NextResponse.json({ error: "Only students can select CR." }, { status: 403 });

  const body = await request.json();
  const crId = String(body?.crId ?? "");
  const note = String(body?.note ?? "");
  if (!crId) return NextResponse.json({ error: "CR id is required." }, { status: 400 });

  const { data: crProfile } = await supabase.from("profiles").select("id,role,full_name").eq("id", crId).maybeSingle();
  if (!crProfile || crProfile.role !== "cr") {
    return NextResponse.json({ error: "Selected CR does not exist." }, { status: 400 });
  }

  const { error } = await supabase
    .from("cr_selections")
    .upsert({ student_id: userId, cr_id: crId, status: "pending", note }, { onConflict: "student_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("notifications").insert({
    user_id: crId,
    title: "New CR selection request",
    message: `${me.full_name ?? "A student"} selected you for project supervision.`
  });

  return NextResponse.json({ ok: true });
}
