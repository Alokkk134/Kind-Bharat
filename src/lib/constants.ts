import type {
  DonationStatus,
  NgoStatus,
  NgoType,
  ProjectStatus,
  ReportReason,
  ReportStatus,
  ReviewStatus,
} from "./database.types";

export const CATEGORIES = [
  { value: "education", label: "Education", emoji: "📚" },
  { value: "food", label: "Food", emoji: "🍲" },
  { value: "health", label: "Health", emoji: "🩺" },
  { value: "women", label: "Women", emoji: "👩" },
  { value: "environment", label: "Environment", emoji: "🌱" },
  { value: "animals", label: "Animals", emoji: "🐾" },
  { value: "disaster_relief", label: "Disaster Relief", emoji: "🆘" },
  { value: "other", label: "Other", emoji: "🤝" },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];
export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [Category, ...Category[]];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
export function categoryEmoji(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.emoji ?? "🤝";
}

export const NGO_TYPES: { value: NgoType; label: string }[] = [
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
  { value: "section8", label: "Section 8 Company" },
  { value: "other", label: "Other" },
];

export const DOC_TYPES = [
  { value: "registration", label: "Registration certificate (required)" },
  { value: "pan", label: "PAN card" },
  { value: "12a", label: "12A certificate" },
  { value: "80g", label: "80G certificate" },
  { value: "fcra", label: "FCRA registration" },
  { value: "darpan", label: "NGO Darpan" },
  { value: "other", label: "Other" },
] as const;
export function docTypeLabel(v: string) {
  return DOC_TYPES.find((d) => d.value === v)?.label.replace(" (required)", "") ?? v;
}

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  under_review: { label: "Under review", tone: "warning" },
  active: { label: "Active", tone: "info" },
  rejected: { label: "Rejected", tone: "danger" },
  funded: { label: "Goal reached", tone: "success" },
  proof_submitted: { label: "Proof submitted", tone: "accent" },
  completed: { label: "Completed", tone: "success" },
  paused: { label: "Paused", tone: "warning" },
  removed: { label: "Removed", tone: "danger" },
};

export const NGO_STATUS: Record<NgoStatus, { label: string; tone: Tone }> = {
  draft: { label: "Not submitted", tone: "neutral" },
  pending: { label: "Pending review", tone: "warning" },
  verified: { label: "Verified", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const DONATION_STATUS: Record<DonationStatus, { label: string; tone: Tone }> = {
  pending: { label: "Waiting for NGO", tone: "warning" },
  confirmed: { label: "Confirmed by NGO", tone: "success" },
  rejected: { label: "Not received", tone: "danger" },
};

export const REVIEW_STATUS: Record<ReviewStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "fake_scam", label: "Fake / Scam" },
  { value: "wrong_info", label: "Wrong information" },
  { value: "misuse_of_funds", label: "Misuse of funds" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

export const REPORT_STATUS: Record<ReportStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "warning" },
  reviewed: { label: "Reviewed", tone: "info" },
  action_taken: { label: "Action taken", tone: "success" },
  dismissed: { label: "Dismissed", tone: "neutral" },
};

export type { Tone };
