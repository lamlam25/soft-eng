import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(profile.role === "cr" || profile.role === "admin" ? "/cr/admin" : "/dashboard");
}
