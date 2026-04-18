import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { indexMaterialVideos } from "@/lib/youtube-materials";

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]/g, "_");
}

export async function POST(request: Request) {
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

  const formData = await request.formData();
  const fileList = formData.getAll("files");
  const fallbackFile = formData.get("file");
  const subject = String(formData.get("subject") ?? "");
  const category = String(formData.get("category") ?? "");
  const titlePrefix = String(formData.get("titlePrefix") ?? "").trim();
  const files = (fileList.length > 0 ? fileList : fallbackFile ? [fallbackFile] : []).filter(
    (f): f is File => f instanceof File
  );

  if (files.length === 0) {
    return NextResponse.json({ error: "At least one file is required." }, { status: 400 });
  }
  if (!subject || !category) {
    return NextResponse.json({ error: "Missing subject/category." }, { status: 400 });
  }

  const admin = createAdminSupabase();
  const createdRows: {
    title: string;
    subject: string;
    category: string;
    file_url: string;
    external_url: null;
    created_by: string;
  }[] = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const bytes = await file.arrayBuffer();
    const key = `${subject}/${category}/${Date.now()}-${i}-${sanitizeFilename(file.name)}`;

    const { error: uploadError } = await admin.storage
      .from("study-materials")
      .upload(key, bytes, { contentType: file.type || "application/octet-stream" });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

    const { data: urlData } = admin.storage.from("study-materials").getPublicUrl(key);
    const computedTitle = titlePrefix ? `${titlePrefix} - ${file.name}` : file.name;
    createdRows.push({
      title: computedTitle,
      subject,
      category,
      file_url: urlData.publicUrl,
      external_url: null,
      created_by: userId
    });
  }

  const { data: insertedMaterials, error: insertError } = await supabase
    .from("materials")
    .insert(createdRows)
    .select("id,title,subject,category");
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const indexingResults = await Promise.all(
    (insertedMaterials ?? []).map((material) => indexMaterialVideos(supabase, material, { maxVideos: 5 }))
  );
  const attempted = indexingResults.filter((row) => row.status !== "skipped");
  const failed = indexingResults.filter((row) => row.status === "error");

  return NextResponse.json({
    ok: true,
    count: createdRows.length,
    videoIndexing: {
      attempted: attempted.length,
      failed: failed.length,
      results: indexingResults
    }
  });
}
