import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { normalizeStudentCode, studentCodeToEmail } from "@/lib/student-code";

export async function POST(request: Request) {
  const body = await request.json();
  const rawStudentCode = String(body?.studentCode ?? "");
  const fullName = String(body?.fullName ?? "").trim();
  const password = String(body?.password ?? "");

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  let studentCode: string;
  try {
    studentCode = normalizeStudentCode(rawStudentCode);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid student ID." },
      { status: 400 }
    );
  }

  const admin = createAdminSupabase();
  const email = studentCodeToEmail(studentCode);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (createError) return NextResponse.json({ error: createError.message }, { status: 400 });

  const userId = created.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    student_code: studentCode,
    role: "student",
    full_name: fullName || null
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
