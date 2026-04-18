import MaterialsManager from "@/components/admin/materials-manager";
import { requireRoles } from "@/lib/auth";

export default async function AdminMaterialsPage() {
  await requireRoles(["cr", "admin"]);
  return <MaterialsManager />;
}
