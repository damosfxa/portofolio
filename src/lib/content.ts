import { supabase } from "@/lib/supabase";
import type { Certificate, Project, Skill, TimelineItem } from "@/lib/types";

/** Semua isi portofolio dari database (dipakai halaman utama dan versi ringkas). */
export async function loadPortfolio() {
  const [projectsRes, skillsRes, certsRes, timelineRes] = await Promise.all([
    supabase.from("projects").select("*").order("sort", { ascending: true }).order("id", { ascending: false }),
    supabase.from("skills").select("*").order("sort", { ascending: true }),
    supabase.from("certificates").select("*").order("sort", { ascending: true }).order("id", { ascending: false }),
    supabase.from("timeline").select("*").order("sort", { ascending: true }).order("id", { ascending: false }),
  ]);
  return {
    projects: (projectsRes.data ?? []) as Project[],
    skills: (skillsRes.data ?? []) as Skill[],
    certificates: (certsRes.data ?? []) as Certificate[],
    timeline: (timelineRes.data ?? []) as TimelineItem[],
  };
}
