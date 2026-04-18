import VideoSettingsManager from "@/components/admin/video-settings-manager";
import { requireRoles } from "@/lib/auth";

export default async function AdminVideosPage() {
  await requireRoles(["cr", "admin"]);
  return <VideoSettingsManager />;
}
