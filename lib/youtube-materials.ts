import type { SupabaseClient } from "@supabase/supabase-js";

type MaterialRow = {
  id: string;
  title: string;
  subject: string;
  category: string;
};

type YoutubeFetchedVideo = {
  youtubeVideoId: string;
  title: string;
  channel: string;
  publishedAt: string;
  videoUrl: string;
};

type IndexResult = {
  materialId: string;
  status: "ready" | "error" | "skipped";
  query: string;
  count: number;
  reason?: string;
};

const ELIGIBLE_CATEGORIES = new Set(["mid-slides", "final-slides"]);
const STOP_WORDS = new Set([
  "slide",
  "slides",
  "lecture",
  "week",
  "chapter",
  "part",
  "class",
  "session",
  "ppt",
  "pptx",
  "pdf",
  "v1",
  "v2",
  "v3",
  "version"
]);

function normalizeSlideTitle(rawTitle: string) {
  const withoutExtension = rawTitle.replace(/\.[a-z0-9]{1,8}$/i, "");
  const normalized = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = normalized
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token.toLowerCase()))
    .filter((token) => !/^\d+$/.test(token));
  return (tokens.join(" ") || normalized).trim();
}

function buildQuery(material: MaterialRow) {
  const normalizedTitle = normalizeSlideTitle(material.title);
  const subjectLabel = material.subject.replace(/-/g, " ").trim();
  const focus = material.category === "mid-slides" ? "mid exam" : "final exam";
  return `${normalizedTitle} ${subjectLabel} ${focus}`.trim();
}

async function fetchYoutubeVideos(query: string, maxResults = 5): Promise<YoutubeFetchedVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("Missing YOUTUBE_API_KEY.");

  const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("type", "video");
  endpoint.searchParams.set("order", "relevance");
  endpoint.searchParams.set("maxResults", String(maxResults));
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint.toString(), { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return (data.items ?? [])
    .map((item: any) => {
      const videoId = String(item?.id?.videoId ?? "");
      if (!videoId) return null;
      return {
        youtubeVideoId: videoId,
        title: String(item?.snippet?.title ?? ""),
        channel: String(item?.snippet?.channelTitle ?? ""),
        publishedAt: String(item?.snippet?.publishedAt ?? new Date().toISOString()),
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`
      };
    })
    .filter((item: YoutubeFetchedVideo | null): item is YoutubeFetchedVideo => Boolean(item));
}

export async function indexMaterialVideos(
  supabase: SupabaseClient,
  material: MaterialRow,
  options?: { force?: boolean; maxVideos?: number }
): Promise<IndexResult> {
  const maxVideos = options?.maxVideos ?? 5;
  const force = options?.force ?? false;
  const query = buildQuery(material);

  if (!ELIGIBLE_CATEGORIES.has(material.category)) {
    return { materialId: material.id, status: "skipped", query, count: 0, reason: "category_not_eligible" };
  }

  if (!force) {
    const { data: existing, error: existingError } = await supabase
      .from("material_video_queries")
      .select("status")
      .eq("material_id", material.id)
      .maybeSingle();
    if (existingError) {
      return { materialId: material.id, status: "error", query, count: 0, reason: existingError.message };
    }
    if (existing?.status === "ready") {
      return { materialId: material.id, status: "skipped", query, count: 0, reason: "already_indexed" };
    }
  }

  const startedAt = new Date().toISOString();
  const { error: startError } = await supabase.from("material_video_queries").upsert(
    {
      material_id: material.id,
      query_text: query,
      source_filename: material.title,
      status: "fetching",
      last_fetched_at: startedAt,
      error_message: null
    },
    { onConflict: "material_id" }
  );
  if (startError) {
    return { materialId: material.id, status: "error", query, count: 0, reason: startError.message };
  }

  try {
    const videos = await fetchYoutubeVideos(query, maxVideos);
    await supabase.from("material_youtube_videos").delete().eq("material_id", material.id);

    if (videos.length > 0) {
      const rows = videos.map((video, index) => ({
        material_id: material.id,
        youtube_video_id: video.youtubeVideoId,
        title: video.title,
        channel: video.channel,
        published_at: video.publishedAt,
        video_url: video.videoUrl,
        rank: index + 1
      }));
      const { error: insertError } = await supabase.from("material_youtube_videos").insert(rows);
      if (insertError) throw new Error(insertError.message);
    }

    const { error: finalizeError } = await supabase
      .from("material_video_queries")
      .update({
        query_text: query,
        source_filename: material.title,
        status: "ready",
        last_fetched_at: new Date().toISOString(),
        error_message: null
      })
      .eq("material_id", material.id);
    if (finalizeError) throw new Error(finalizeError.message);

    return { materialId: material.id, status: "ready", query, count: videos.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown indexing error.";
    const { error: markError } = await supabase
      .from("material_video_queries")
      .update({
        query_text: query,
        source_filename: material.title,
        status: "error",
        last_fetched_at: new Date().toISOString(),
        error_message: message
      })
      .eq("material_id", material.id);
    return { materialId: material.id, status: "error", query, count: 0, reason: markError?.message || message };
  }
}

