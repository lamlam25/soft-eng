import { promises as fs } from "fs";
import path from "path";
import type { MaterialCategory, SubjectSlug } from "@/lib/types";

type LocalMaterial = {
  title: string;
  category: MaterialCategory;
  url: string;
};

export async function getLocalMaterials(subject: SubjectSlug): Promise<LocalMaterial[]> {
  const base = path.join(process.cwd(), "public", "course-content", subject);
  const categories: MaterialCategory[] = ["mid-slides", "final-slides", "questions"];
  const rows: LocalMaterial[] = [];

  for (const category of categories) {
    const folder = path.join(base, category);
    try {
      const entries = await fs.readdir(folder, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || entry.name === ".gitkeep") continue;
        rows.push({
          title: entry.name,
          category,
          url: `/course-content/${subject}/${category}/${encodeURIComponent(entry.name)}`
        });
      }
    } catch {
      // ignore missing folders
    }
  }

  return rows;
}
