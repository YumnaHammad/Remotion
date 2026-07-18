const STORAGE_KEY = "framekit-recent-templates";
const MAX = 8;

/** Track recently used template IDs in localStorage. */
export function recordRecentTemplate(templateId: string): void {
  if (typeof window === "undefined") return;
  try {
    const prev = getRecentTemplateIds();
    const next = [templateId, ...prev.filter((id) => id !== templateId)].slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}

export function getRecentTemplateIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
