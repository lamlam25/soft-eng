import NoticesManager from "@/components/admin/notices-manager";
import { requireRoles } from "@/lib/auth";

export default async function AdminNoticesPage() {
  await requireRoles(["cr", "admin"]);
  return <NoticesManager />;
}
