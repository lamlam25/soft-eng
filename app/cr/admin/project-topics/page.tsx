import { requireRoles } from "@/lib/auth";
import ProjectTopicsManager from "@/components/admin/project-topics-manager";

export default async function AdminProjectTopicsPage() {
  await requireRoles(["cr", "admin"]);
  return <ProjectTopicsManager />;
}
