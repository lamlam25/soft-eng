import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

type SlideVideoItem = {
  id: string;
  title: string;
  channel: string;
  publishedAt: string;
  videoUrl: string;
  rank: number;
};

type SlideVideoGroup = {
  materialId: string;
  slideTitle: string;
  subject: string;
  videos: SlideVideoItem[];
};

async function loadLegacyQuery(type: "quiz" | "mid" | "final") {
  const supabase = await createServerSupabase();
  const { data: config } = await supabase
    .from("video_config")
    .select("quiz_query,mid_query,final_query")
    .eq("id", 1)
    .maybeSingle();

  if (type === "quiz") {
    return config?.quiz_query || "operating system software engineering artificial intelligence data science quiz preparation";
  }
  if (type === "mid") {
    return config?.mid_query || "operating system software engineering artificial intelligence data science mid exam";
  }
  return config?.final_query || "operating system software engineering artificial intelligence data science final exam preparation";
}

async function fetchLegacyYoutubeItems(type: "quiz" | "mid" | "final"): Promise<SlideVideoItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Missing YOUTUBE_API_KEY.");

  const query = await loadLegacyQuery(type);
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("type", "video");
  endpoint.searchParams.set("order", "relevance");
  endpoint.searchParams.set("maxResults", "5");
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return (data.items ?? [])
    .map((item: any, index: number) => {
      const id = String(item?.id?.videoId ?? "");
      if (!id) return null;
      return {
        id,
        title: String(item?.snippet?.title ?? ""),
        channel: String(item?.snippet?.channelTitle ?? ""),
        publishedAt: String(item?.snippet?.publishedAt ?? new Date().toISOString()),
        videoUrl: `https://www.youtube.com/watch?v=${id}`,
        rank: index + 1
      };
    })
    .filter((item: SlideVideoItem | null): item is SlideVideoItem => Boolean(item));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  if (type !== "quiz" && type !== "mid" && type !== "final") {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  if (type === "quiz") {
    try {
      const legacyItems = await fetchLegacyYoutubeItems("quiz");
      return NextResponse.json({ items: legacyItems, slides: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load videos.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const category = type === "mid" ? "mid-slides" : "final-slides";

  const supabase = await createServerSupabase();
  const { data: materials, error: materialsError } = await supabase
    .from("materials")
    .select("id,title,subject")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(100);
  if (materialsError) {
    return NextResponse.json({ error: materialsError.message }, { status: 500 });
  }
  const materialIds = (materials ?? []).map((row) => row.id);
  if (materialIds.length === 0) {
    return NextResponse.json({ slides: [] });
  }

  const { data: videos, error: videosError } = await supabase
    .from("material_youtube_videos")
    .select("material_id,youtube_video_id,title,channel,published_at,video_url,rank")
    .in("material_id", materialIds)
    .order("rank", { ascending: true });

  if (videosError) {
    const missingTable = videosError.message.toLowerCase().includes("material_youtube_videos");
    if (!missingTable) {
      return NextResponse.json({ error: videosError.message }, { status: 500 });
    }
    try {
      const legacyItems = await fetchLegacyYoutubeItems(type);
      return NextResponse.json({ items: legacyItems, slides: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load videos.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const grouped = new Map<string, SlideVideoItem[]>();
  for (const row of videos ?? []) {
    const items = grouped.get(row.material_id) ?? [];
    items.push({
      id: row.youtube_video_id,
      title: row.title,
      channel: row.channel,
      publishedAt: row.published_at,
      videoUrl: row.video_url,
      rank: row.rank
    });
    grouped.set(row.material_id, items);
  }

  const slides: SlideVideoGroup[] = (materials ?? []).map((material) => ({
    materialId: material.id,
    slideTitle: material.title,
    subject: material.subject,
    videos: grouped.get(material.id) ?? []
  }));

  if (slides.every((s) => s.videos.length === 0)) {
    try {
      const legacyItems = await fetchLegacyYoutubeItems(type);
      return NextResponse.json({ items: legacyItems, slides });
    } catch {
      return NextResponse.json({ slides });
    }
  }

  return NextResponse.json({ slides, items: [] });
}
