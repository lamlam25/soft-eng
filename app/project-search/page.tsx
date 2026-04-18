import { requireAnyUser } from "@/lib/auth";
import TopicSubjectSearch from "@/components/shared/topic-subject-search";

export default async function ProjectSearchPage() {
  await requireAnyUser();
  return <TopicSubjectSearch />;
}
