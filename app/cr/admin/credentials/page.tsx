import { requireRoles } from "@/lib/auth";
import CredentialsManager from "@/components/admin/credentials-manager";

export default async function AdminCredentialsPage() {
  await requireRoles(["cr", "admin"]);
  return <CredentialsManager />;
}
