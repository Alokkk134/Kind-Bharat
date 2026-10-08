// Database types (kept in sync with supabase/migrations by hand).
// Regenerate with the Supabase CLI if you prefer: `npx supabase gen types typescript`.

export type UserRole = "donor" | "ngo" | "admin";
export type NgoStatus = "draft" | "pending" | "verified" | "rejected" | "suspended";
export type NgoType = "trust" | "society" | "section8" | "other";
export type ProjectStatus =
  | "draft"
  | "under_review"
  | "active"
  | "rejected"
  | "funded"
  | "proof_submitted"
  | "completed"
  | "paused"
  | "removed";
export type DonationStatus = "pending" | "confirmed" | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "open" | "reviewed" | "action_taken" | "dismissed";
export type ReportReason = "fake_scam" | "wrong_info" | "misuse_of_funds" | "inappropriate" | "other";
export type ReportTarget = "project" | "ngo";
export type FeedbackKind = "feature" | "bug" | "other";
export type FeedbackStatus = "new" | "planned" | "done" | "dismissed";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  created_at: string;
};

export type Ngo = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  type: NgoType;
  year_founded: number | null;
  registration_number: string | null;
  darpan_id: string | null;
  pan: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  social_links: string | null;
  about: string | null;
  focus_areas: string[];
  logo_path: string | null;
  status: NgoStatus;
  rejection_reason: string | null;
  has_12a: boolean;
  has_80g: boolean;
  has_fcra: boolean;
  is_demo: boolean;
  submitted_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NgoDocument = {
  id: string;
  ngo_id: string;
  doc_type: string;
  bucket: string;
  file_path: string;
  uploaded_at: string;
};

export type PaymentDetails = {
  id: string;
  ngo_id: string;
  upi_id: string | null;
  qr_path: string | null;
  bank_account_name: string | null;
  account_number: string | null;
  ifsc: string | null;
  bank_name: string | null;
  review_status: ReviewStatus;
  review_note: string | null;
  reviewed_at: string | null;
  updated_at: string;
};

export type Project = {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  beneficiaries_desc: string;
  beneficiaries_count: number | null;
  city: string;
  state: string;
  goal_amount: number;
  start_date: string | null;
  deadline: string | null;
  status: ProjectStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  funded_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetItem = {
  id: string;
  project_id: string;
  item: string;
  quantity: number;
  unit_cost: number;
  total: number | null;
  sort_order: number;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  file_path: string;
  sort_order: number;
};

export type Donation = {
  id: string;
  project_id: string;
  donor_user_id: string | null;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number;
  utr: string;
  screenshot_path: string | null;
  message: string | null;
  is_anonymous: boolean;
  status: DonationStatus;
  rejection_reason: string | null;
  ip_hash: string | null;
  confirmed_at: string | null;
  reviewed_at: string | null;
  admin_note: string | null;
  admin_reviewed_at: string | null;
  created_at: string;
};

export type Comment = {
  id: string;
  project_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  is_ngo_reply: boolean;
  is_hidden: boolean;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  target_type: ReportTarget;
  target_id: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
};

export type CompletionProof = {
  id: string;
  project_id: string;
  description: string;
  beneficiaries_reached: number;
  files: string[];
  status: ReviewStatus;
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export type PastProject = {
  id: string;
  ngo_id: string;
  title: string;
  date: string | null;
  description: string;
  beneficiaries: number | null;
  images: string[];
  created_at: string;
};

export type Feedback = {
  id: string;
  user_id: string | null;
  kind: FeedbackKind;
  message: string;
  name: string | null;
  email: string | null;
  page: string | null;
  status: FeedbackStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicNgo = {
  id: string;
  name: string;
  slug: string;
  type: NgoType;
  year_founded: number | null;
  city: string | null;
  state: string | null;
  website: string | null;
  social_links: string | null;
  contact_email: string | null;
  about: string | null;
  focus_areas: string[];
  logo_path: string | null;
  has_12a: boolean;
  has_80g: boolean;
  has_fcra: boolean;
  has_registration: boolean;
  has_darpan: boolean;
  verified_at: string | null;
  created_at: string;
  total_raised: number;
  active_projects: number;
  completed_projects: number;
  is_demo: boolean;
};

export type PublicProject = {
  id: string;
  ngo_id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  beneficiaries_desc: string;
  beneficiaries_count: number | null;
  city: string;
  state: string;
  goal_amount: number;
  start_date: string | null;
  deadline: string | null;
  status: ProjectStatus;
  approved_at: string | null;
  funded_at: string | null;
  completed_at: string | null;
  created_at: string;
  ngo_name: string;
  ngo_slug: string;
  ngo_logo_path: string | null;
  ngo_has_80g: boolean;
  raised: number;
  donor_count: number;
  cover_path: string | null;
  ngo_is_demo: boolean;
};

export type PublicDonation = {
  id: string;
  project_id: string;
  amount: number;
  confirmed_at: string;
  display_name: string;
  verified_by_admin: boolean;
};

export type PublicComment = {
  id: string;
  project_id: string;
  parent_id: string | null;
  body: string;
  is_ngo_reply: boolean;
  created_at: string;
  author_name: string;
};

// ---- Supabase client generic ----
type T<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };
type V<Row> = { Row: Row; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: T<Profile>;
      ngos: T<Ngo>;
      ngo_documents: T<NgoDocument>;
      ngo_payment_details: T<PaymentDetails>;
      projects: T<Project>;
      project_budget_items: T<BudgetItem>;
      project_images: T<ProjectImage>;
      donations: T<Donation>;
      comments: T<Comment>;
      reports: T<Report>;
      completion_proofs: T<CompletionProof>;
      past_projects: T<PastProject>;
      feedback: T<Feedback>;
    };
    Views: {
      public_ngos: V<PublicNgo>;
      public_projects: V<PublicProject>;
      public_donations: V<PublicDonation>;
      public_comments: V<PublicComment>;
    };
    Functions: {
      get_payment_details: {
        Args: { p_project_id: string };
        Returns: {
          upi_id: string | null;
          qr_path: string | null;
          bank_account_name: string | null;
          account_number: string | null;
          ifsc: string | null;
          bank_name: string | null;
        }[];
      };
      my_ngo_blocked: { Args: Record<string, never>; Returns: boolean };
      project_accepts_donations: { Args: { p_project_id: string }; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      ngo_status: NgoStatus;
      ngo_type: NgoType;
      project_status: ProjectStatus;
      donation_status: DonationStatus;
      review_status: ReviewStatus;
      report_status: ReportStatus;
      report_reason: ReportReason;
      report_target: ReportTarget;
    };
    CompositeTypes: Record<string, never>;
  };
};
