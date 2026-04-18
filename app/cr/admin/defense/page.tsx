import { requireRoles } from "@/lib/auth";
import DefenseManager from "@/components/admin/defense-manager";

export default async function AdminDefensePage() {
  await requireRoles(["cr", "admin"]);
  return <DefenseManager />;
}
