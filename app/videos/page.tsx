import { requireAnyUser } from "@/lib/auth";
import VideosHub from "@/components/videos-hub";

export default async function VideosPage() {
  await requireAnyUser();

  return (
    <VideosHub />
  );
}
