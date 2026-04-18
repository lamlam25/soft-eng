import { requireRoles } from "@/lib/auth";
import FeedbackManager from "@/components/admin/feedback-manager";

export default async function AdminFeedbackPage() {
  await requireRoles(["cr", "admin"]);
  return <FeedbackManager />;
}
