import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

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
    .from("admin_credentials")
    .select("id,credential_name,username,secret_hint,is_active,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
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
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const credentialName = String(body?.credentialName ?? "").trim();
  const username = String(body?.username ?? "").trim();
  const secretHint = String(body?.secretHint ?? "").trim();
  const isActive = Boolean(body?.isActive ?? true);
  if (!credentialName || !username || !secretHint) {
    return NextResponse.json({ error: "credentialName, username and secretHint are required." }, { status: 400 });
  }

  const { error } = await supabase.from("admin_credentials").insert({
    credential_name: credentialName,
    username,
    secret_hint: secretHint,
    is_active: isActive,
    managed_by: userId
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
