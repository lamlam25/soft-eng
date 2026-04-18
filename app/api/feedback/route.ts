import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("feedback_messages")
    .select("id,from_user,to_user,subject,message,created_at")
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
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

  const body = await request.json();
  const toUser = String(body?.toUser ?? "");
  const subject = String(body?.subject ?? "").trim();
  const message = String(body?.message ?? "").trim();
  if (!toUser || !subject || !message) {
    return NextResponse.json({ error: "toUser, subject and message are required." }, { status: 400 });
  }

  const { error } = await supabase.from("feedback_messages").insert({
    from_user: userId,
    to_user: toUser,
    subject,
    message
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("notifications").insert({
    user_id: toUser,
    title: `New feedback: ${subject}`,
    message: message.slice(0, 140)
  });

  return NextResponse.json({ ok: true });
}
