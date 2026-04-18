export function normalizeStudentCode(raw: string): string {
  const trimmed = raw.trim();
  if (!/^\d{1,3}$/.test(trimmed)) {
    throw new Error("Student ID must be numeric and between 000 and 999.");
  }
  return trimmed.padStart(3, "0");
}

export function studentCodeToEmail(studentCode: string): string {
  return `${studentCode}@studybuddy.app`;
}
