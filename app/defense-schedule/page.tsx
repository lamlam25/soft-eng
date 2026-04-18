import { requireAnyUser } from "@/lib/auth";
import DefenseScheduleView from "@/components/student/defense-schedule-view";

export default async function DefenseSchedulePage() {
  await requireAnyUser();
  return <DefenseScheduleView />;
}
