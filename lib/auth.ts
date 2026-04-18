import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,student_code,role,full_name")
    .eq("id", userId)
    .single();

  return (profile as Profile | null) ?? null;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) {
    if (profile.role === "cr" || profile.role === "admin") redirect("/cr/admin");
    redirect("/dashboard");
  }
  return profile;
}

export async function requireRoles(roles: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) {
    if (profile.role === "cr" || profile.role === "admin") redirect("/cr/admin");
    redirect("/dashboard");
  }
  return profile;
}

export async function requireAnyUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}
