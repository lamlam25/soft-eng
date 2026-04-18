export type UserRole = "student" | "cr" | "admin";

export type SubjectSlug =
  | "operating-system"
  | "software-engineering"
  | "artificial-intelligence"
  | "introduction-to-data-science";

export type MaterialCategory = "mid-slides" | "final-slides" | "questions";

export const SUBJECTS: { slug: SubjectSlug; label: string }[] = [
  { slug: "operating-system", label: "Operating System" },
  { slug: "software-engineering", label: "Software Engineering" },
  { slug: "artificial-intelligence", label: "Artificial Intelligence" },
  { slug: "introduction-to-data-science", label: "Introduction to Data Science" }
];

export const CATEGORIES: { key: MaterialCategory; label: string }[] = [
  { key: "mid-slides", label: "Mid Slides" },
  { key: "final-slides", label: "Final Slides" },
  { key: "questions", label: "Questions" }
];

export type Profile = {
  id: string;
  student_code: string | null;
  role: UserRole;
  full_name: string | null;
};

export const PROJECT_CATEGORIES = [
  "ai-ml",
  "web-app",
  "mobile-app",
  "iot-embedded",
  "data-science",
  "software-engineering",
  "systems-os",
  "cybersecurity"
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
