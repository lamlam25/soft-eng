import { requireAnyUser } from "@/lib/auth";
import FeedbackCenter from "@/components/student/feedback-center";

export default async function FeedbackPage() {
  await requireAnyUser();
  return <FeedbackCenter />;
}
