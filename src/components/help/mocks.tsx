// Simple drawings of logged-in screens for the help guides. Not interactive.
import {
  BadgeCheck,
  Camera,
  Check,
  Copy,
  FileCheck2,
  FileUp,
  ImageIcon,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { MockScreen } from "./guide";

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="mb-1 text-[11px] font-semibold">{label}</p>
    <div className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-muted">{value ?? " "}</div>
  </div>
);
const Btn = ({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "success" | "danger" | "outline" }) => (
  <span
    className={
      tone === "primary"
        ? "inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white"
        : tone === "success"
          ? "inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-[12px] font-semibold text-white"
          : tone === "danger"
            ? "inline-flex items-center gap-1 rounded-lg bg-danger px-3 py-1.5 text-[12px] font-semibold text-white"
            : "inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-primary"
    }
  >
    {children}
  </span>
);
const Pill = ({ children, tone }: { children: React.ReactNode; tone: "ok" | "wait" | "bad" | "info" }) => (
  <span
    className={{
      ok: "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-success",
      wait: "rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-warning",
      bad: "rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-danger",
      info: "rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-info",
    }[tone]}
  >
    {children}
  </span>
);
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">{children}</div>
);

// ---------------- Donor ----------------

export function MockPay() {
  return (
    <MockScreen url="kindbharat.org/projects/…/donate">
      <p className="rounded-xl border-2 border-amber-300 bg-amber-50 p-2 text-[11px] font-medium text-amber-950">
        Pay only to the details shown on this page.
      </p>
      <p className="font-serif text-base font-semibold">① Pay the NGO directly</p>
      <Card>
        <div className="flex gap-3">
          <div className="grid h-20 w-20 shrink-0 grid-cols-5 gap-0.5 rounded-lg border border-border bg-white p-1.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className={(i * 7) % 3 ? "bg-ink" : "bg-white"} />
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[11px] text-muted">UPI ID</p>
            <p className="flex items-center justify-between rounded-lg bg-bg px-2 py-1 font-mono text-[12px] font-semibold">
              ngoname@okaxis <Copy className="h-3.5 w-3.5 text-primary" />
            </p>
            <Btn>Open UPI app</Btn>
          </div>
        </div>
      </Card>
      <Card>
        <p className="font-semibold">Bank transfer</p>
        <p className="text-muted">Account name · Account no. · IFSC — each with a Copy button</p>
      </Card>
    </MockScreen>
  );
}

export function MockTellUs() {
  return (
    <MockScreen url="kindbharat.org/projects/…/donate">
      <p className="font-serif text-base font-semibold">② Tell us you paid</p>
      <Field label="Your name *" value="Rahul Sharma" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Email" value="rahul@…" />
        <Field label="Phone" value="98…" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Amount paid (₹) *" value="500" />
        <Field label="UTR / Transaction ID *" value="412345678901" />
      </div>
      <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-white p-2 text-muted">
        <ImageIcon className="h-4 w-4 text-primary" /> Add screenshot (optional)
      </div>
      <p className="flex items-center gap-2 text-[11px]"><span className="h-3.5 w-3.5 rounded border border-border bg-white" /> Show my name as “Anonymous”</p>
      <div className="text-center"><Btn>I have paid — submit details</Btn></div>
    </MockScreen>
  );
}

export function MockMyDonations() {
  return (
    <MockScreen url="kindbharat.org/dashboard">
      <p className="font-serif text-base font-semibold">My donations</p>
      {[
        { t: "School kits for 100 children", a: "₹500", s: <Pill tone="ok">Confirmed by NGO</Pill> },
        { t: "Meals for 50 elders", a: "₹1,000", s: <Pill tone="wait">Waiting for NGO</Pill> },
        { t: "Clean water for a village", a: "₹300", s: <Pill tone="bad">Not received</Pill> },
      ].map((d) => (
        <Card key={d.t}>
          <p className="font-semibold">{d.t}</p>
          <p className="text-[11px] text-muted">NGO name · 12 Oct · UTR 4123…</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="font-serif text-base font-semibold">{d.a}</span>
            {d.s}
          </div>
        </Card>
      ))}
    </MockScreen>
  );
}

// ---------------- NGO ----------------

export function MockNgoProfile() {
  return (
    <MockScreen url="kindbharat.org/ngo/profile">
      <p className="font-serif text-base font-semibold">Create your NGO profile</p>
      <Field label="Organisation name *" value="Asha Foundation" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Type *" value="Trust" />
        <Field label="Year founded" value="2012" />
      </div>
      <Field label="Registration number *" value="MH/123/2012" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="City *" value="Pune" />
        <Field label="State *" value="Maharashtra" />
      </div>
      <Field label="About the organisation *" value="We help…" />
      <div className="flex flex-wrap gap-1">
        {["📚 Education", "🍲 Food", "🩺 Health"].map((c, i) => (
          <span key={c} className={i === 0 ? "rounded-full bg-primary px-2 py-0.5 text-[11px] text-white" : "rounded-full border border-border bg-white px-2 py-0.5 text-[11px]"}>{c}</span>
        ))}
      </div>
      <Btn>Create profile</Btn>
    </MockScreen>
  );
}

export function MockDocuments() {
  return (
    <MockScreen url="kindbharat.org/ngo/documents">
      <p className="font-serif text-base font-semibold">Documents</p>
      <Field label="Document type" value="Registration certificate (required)" />
      <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-border bg-white p-4 text-center">
        <FileUp className="h-6 w-6 text-primary" />
        <span className="font-semibold">Choose a photo or PDF</span>
        <span className="text-[10px] text-muted">PDF max 1 MB, or a clear photo</span>
      </div>
      {["Registration certificate", "80G certificate"].map((d) => (
        <Card key={d}>
          <p className="flex items-center gap-2 font-semibold"><FileCheck2 className="h-4 w-4 text-primary" /> {d}</p>
        </Card>
      ))}
    </MockScreen>
  );
}

export function MockPayment() {
  return (
    <MockScreen url="kindbharat.org/ngo/payment">
      <div className="flex items-center justify-between">
        <p className="font-serif text-base font-semibold">Payment details</p>
        <Pill tone="wait">Pending review</Pill>
      </div>
      <p className="rounded-xl bg-amber-50 p-2 text-[11px] text-amber-950">Any change is hidden from donors until KindBharat checks it.</p>
      <Field label="UPI ID" value="ashafoundation@okaxis" />
      <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-white p-2 text-muted">
        <ImageIcon className="h-4 w-4 text-primary" /> UPI QR code (optional)
      </div>
      <Field label="Account holder name" value="Asha Foundation" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Account number" value="•••• 9012" />
        <Field label="IFSC" value="SBIN0001234" />
      </div>
      <Btn>Save payment details</Btn>
    </MockScreen>
  );
}

export function MockJourney() {
  const steps = [
    { l: "Profile", d: true, i: Check },
    { l: "Documents", d: true, i: FileCheck2 },
    { l: "Payment", d: true, i: Wallet },
    { l: "Verified", d: false, i: ShieldCheck },
  ];
  return (
    <MockScreen url="kindbharat.org/ngo">
      <p className="font-serif text-base font-semibold">Verification journey</p>
      <Card>
        <div className="grid grid-cols-4 text-center">
          {steps.map(({ l, d, i: Icon }) => (
            <div key={l} className="flex flex-col items-center gap-1">
              <span className={d ? "flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white" : "flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-muted"}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[10px]">{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
          <span className="text-[11px] text-muted">Everything ready?</span>
          <Btn>Submit for verification</Btn>
        </div>
      </Card>
    </MockScreen>
  );
}

export function MockBudget() {
  return (
    <MockScreen url="kindbharat.org/ngo/projects/new">
      <p className="font-serif text-base font-semibold">3. Budget</p>
      <Card>
        {[
          ["Notebooks (pack of 6)", "100 × ₹90", "₹9,000"],
          ["Pencil set", "100 × ₹25", "₹2,500"],
          ["School bag", "100 × ₹80", "₹8,000"],
        ].map(([i, q, t]) => (
          <div key={i} className="flex justify-between border-b border-border py-1.5 last:border-0">
            <span>{i}<span className="block text-[10px] text-muted">{q}</span></span>
            <span className="font-semibold">{t}</span>
          </div>
        ))}
        <p className="mt-2 text-right">Budget total: <strong>₹19,500</strong></p>
      </Card>
      <Field label="Goal amount (₹) *" value="19500" />
      <p className="text-[11px] font-semibold text-success">✓ Budget matches the goal.</p>
      <div className="flex gap-2"><Btn tone="outline">Save draft</Btn><Btn>Submit for review</Btn></div>
    </MockScreen>
  );
}

export function MockConfirmDonation() {
  return (
    <MockScreen url="kindbharat.org/ngo/donations">
      <p className="font-serif text-base font-semibold">Donations · To confirm</p>
      <Card>
        <div className="flex items-start justify-between">
          <p className="font-serif text-xl font-semibold text-primary">₹500</p>
          <Pill tone="wait">Waiting for NGO</Pill>
        </div>
        <p className="text-[11px] text-muted">for School kits for 100 children</p>
        <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
          <span><span className="text-muted">UTR</span><br /><b className="font-mono">412345678901</b></span>
          <span><span className="text-muted">Donor</span><br />Rahul Sharma</span>
        </div>
        <p className="mt-1 text-[11px] font-semibold text-primary underline">View payment screenshot</p>
        <div className="mt-2 flex gap-2 border-t border-border pt-2">
          <Btn tone="success">✓ Confirm received</Btn>
          <Btn tone="danger">Not received</Btn>
        </div>
      </Card>
    </MockScreen>
  );
}

export function MockQA() {
  return (
    <MockScreen url="kindbharat.org/ngo/comments">
      <p className="font-serif text-base font-semibold">Questions from donors</p>
      <Card>
        <Pill tone="wait">Needs reply</Pill>
        <p className="mt-1.5 text-[11px]"><b>Priya M.</b> · 2 hours ago</p>
        <p>Will you share photos of the distribution day?</p>
        <div className="mt-2 rounded-lg border border-border bg-white p-2 text-muted">Write your answer…</div>
        <div className="mt-2 text-right"><Btn>Reply as NGO</Btn></div>
      </Card>
      <p className="text-[11px] text-muted">
        Your reply shows with an <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white"><BadgeCheck className="inline h-3 w-3" /> NGO</span> badge.
      </p>
    </MockScreen>
  );
}

export function MockProof() {
  return (
    <MockScreen url="kindbharat.org/ngo/projects/…/proof">
      <p className="font-serif text-base font-semibold">Proof of completion</p>
      <Field label="What was done? *" value="We handed out 100 kits at…" />
      <Field label="Number of people reached *" value="100" />
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className="aspect-square rounded-lg bg-gradient-to-br from-accent-soft to-primary-soft" />
        ))}
        <span className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-white">
          <Camera className="h-4 w-4 text-primary" />
        </span>
      </div>
      <Btn>Submit proof for review</Btn>
    </MockScreen>
  );
}

export function MockNgoMenu() {
  const items = ["Overview", "Organisation", "Documents", "Payment details", "Projects", "Donations ③", "Questions", "Past projects"];
  return (
    <MockScreen url="kindbharat.org/ngo">
      <p className="font-serif text-base font-semibold">Your NGO dashboard</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i, n) => (
          <span key={i} className={n === 0 ? "rounded-xl bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white" : "rounded-xl border border-border bg-white px-2.5 py-1.5 text-[11px]"}>{i}</span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {[["₹45,000", "Raised"], ["3", "To confirm"], ["4", "Projects"]].map(([v, l]) => (
          <Card key={l}><p className="font-serif text-base font-semibold text-primary">{v}</p><p className="text-[10px] text-muted">{l}</p></Card>
        ))}
      </div>
    </MockScreen>
  );
}
