import { requireAnyUser } from "@/lib/auth";
import NotificationsCenter from "@/components/student/notifications-center";

export default async function NotificationsPage() {
  await requireAnyUser();
  return <NotificationsCenter />;
}
