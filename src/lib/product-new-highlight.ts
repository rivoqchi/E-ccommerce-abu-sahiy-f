export const NEW_HIGHLIGHT_DAYS = 30;

export function isNewHighlightActive(until?: string | null, now = Date.now()): boolean {
  if (!until) return false;
  const end = new Date(until).getTime();
  if (Number.isNaN(end)) return false;
  return end > now;
}

export function formatNewHighlightUntil(until?: string | null): string | null {
  if (!isNewHighlightActive(until)) return null;
  const d = new Date(until!);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}
