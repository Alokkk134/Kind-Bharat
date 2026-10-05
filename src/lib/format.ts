import { LOCALE, TIMEZONE } from "./config";

const inr = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat(LOCALE);

/** Whole rupees → "₹1,25,000" (Indian grouping). */
export function formatINR(rupees: number): string {
  return inr.format(rupees);
}

/** 125000 → "1,25,000" */
export function formatNumber(n: number): string {
  return num.format(n);
}

/** Date → "5 Oct 2026" in IST. */
export function formatDateIST(date: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(new Date(date));
}

/** Date + time → "5 Oct 2026, 3:40 pm" in IST. */
export function formatDateTimeIST(date: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(new Date(date));
}

/** Today's date in IST as YYYY-MM-DD. */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

/** Whole days from today (IST) until a YYYY-MM-DD deadline. Negative if passed. */
export function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  const today = Date.parse(todayIST());
  const end = Date.parse(deadline);
  return Math.round((end - today) / 86_400_000);
}

/** "just now", "5 min ago", "2 days ago", then a date. */
export function timeAgo(date: string | Date): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diff < 86400 * 30) {
    const d = Math.floor(diff / 86400);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  return formatDateIST(date);
}

export function percent(raised: number, goal: number): number {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
