const TASHKENT_OFFSET_MS = 5 * 3600_000;

const isoDay = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

/** Bugungi sana — Toshkent (UTC+5) hisobida, mehmonning soatidan qat’i nazar. */
export function tashkentDateISO(offsetDays = 0): string {
  const d = new Date(Date.now() + TASHKENT_OFFSET_MS);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return isoDay(d);
}

/** Keyingi keladigan kun (0 = yakshanba … 6 = shanba) sanasi. */
export function nextTashkentWeekday(weekday: number): string {
  const d = new Date(Date.now() + TASHKENT_OFFSET_MS);
  const add = (weekday - d.getUTCDay() + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return isoDay(d);
}

export function setInviteDatePart(value: string, part: "date" | "time", next: string): string {
  const [date = "", time = ""] = value.split("T");
  return `${part === "date" ? next : date}T${part === "time" ? next : time}`;
}

export function isValidInviteDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value) && Number.isFinite(Date.parse(`${value}:00+05:00`));
}

export function inviteMapsUrl(value: string | undefined, address: string): string {
  if (value?.trim()) {
    try {
      const url = new URL(value.trim());
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch { /* fall back to an address search */ }
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}