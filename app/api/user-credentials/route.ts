import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || (profile.role !== "cr" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,role,student_code")
    .in("role", ["student", "cr"])
    .order("role", { ascending: true })
    .order("full_name", { ascending: true })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [] });
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || (profile.role !== "cr" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const targetUserId = String(body?.targetUserId ?? "");
  const fullName = String(body?.fullName ?? "").trim();
  const role = String(body?.role ?? "").trim();
  const newPassword = String(body?.newPassword ?? "").trim();
  if (!targetUserId) return NextResponse.json({ error: "targetUserId required." }, { status: 400 });

  if (fullName || role) {
    const payload: Record<string, string> = {};
    if (fullName) payload.full_name = fullName;
    if (role === "student" || role === "cr") payload.role = role;
    if (Object.keys(payload).length > 0) {
      const { error: updateError } = await supabase.from("profiles").update(payload).eq("id", targetUserId);
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  if (newPassword) {
    const admin = createAdminSupabase();
    const { error: passwordError } = await admin.auth.admin.updateUserById(targetUserId, { password: newPassword });
    if (passwordError) return NextResponse.json({ error: passwordError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
