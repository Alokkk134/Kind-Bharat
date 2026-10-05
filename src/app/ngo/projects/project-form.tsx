"use client";

import { ActionForm } from "@/components/ui/action-form";
import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { initialState } from "@/lib/action-state";
import type { BudgetItem, Project } from "@/lib/database.types";
import { CATEGORIES, INDIAN_STATES } from "@/lib/constants";
import { formatINR, todayIST } from "@/lib/format";
import { PRESETS } from "@/lib/images";
import { cn } from "@/lib/utils";
import { FormMessage } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUploader } from "@/components/upload/image-uploader";
import { saveProjectAction } from "./actions";

type Row = { key: number; item: string; qty: string; unit: string };

const toNum = (v: string) => Number(v.replace(/[,₹\s]/g, "")) || 0;

export function ProjectForm({
  id,
  ngoId,
  project,
  budget,
  images,
  defaults,
}: {
  id: string;
  ngoId: string;
  project: Project | null;
  budget: BudgetItem[];
  images: string[];
  defaults: { city: string; state: string };
}) {
  const [state, action] = useActionState(saveProjectAction, initialState);
  const e = state.fieldErrors ?? {};
  const [rows, setRows] = useState<Row[]>(
    budget.length
      ? budget.map((b, i) => ({ key: i, item: b.item, qty: String(b.quantity), unit: String(b.unit_cost) }))
      : [{ key: 0, item: "", qty: "1", unit: "" }],
  );
  const [goal, setGoal] = useState(project ? String(project.goal_amount) : "");
  const total = useMemo(() => rows.reduce((s, r) => s + toNum(r.qty) * toNum(r.unit), 0), [rows]);
  const goalNum = toNum(goal);
  const matches = total > 0 && total === goalNum;

  function update(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <ActionForm action={action} className="space-y-10" noValidate>
      <input type="hidden" name="id" value={id} />
      <FormMessage state={state} />

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-serif text-xl font-semibold sm:col-span-2">1. The project</h2>
        <Input
          label="Title"
          name="title"
          defaultValue={project?.title}
          required
          placeholder="Stationery kits for 100 students"
          hint="Specific and concrete: what, for whom, how many."
          error={e.title}
          className="sm:col-span-2"
        />
        <Select label="Cause" name="category" options={CATEGORIES} defaultValue={project?.category ?? ""} placeholder="Choose a cause" required error={e.category} />
        <Input label="Number of beneficiaries" name="beneficiaries_count" inputMode="numeric" defaultValue={project?.beneficiaries_count ?? ""} required error={e.beneficiaries_count} />
        <Input
          label="Who benefits"
          name="beneficiaries_desc"
          defaultValue={project?.beneficiaries_desc}
          required
          placeholder="Class 5–8 students at Govt. School, Hadapsar"
          error={e.beneficiaries_desc}
          className="sm:col-span-2"
        />
        <Textarea
          label="Short summary"
          name="summary"
          rows={2}
          maxLength={300}
          defaultValue={project?.summary}
          required
          hint="1–2 sentences shown on project cards (max 300 characters)."
          error={e.summary}
          className="sm:col-span-2"
        />
        <Textarea
          label="Full description"
          name="description"
          rows={8}
          defaultValue={project?.description}
          required
          hint="The need, your plan, how items will be bought and distributed, and how you'll show proof."
          error={e.description}
          className="sm:col-span-2"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-serif text-xl font-semibold sm:col-span-2">2. Where & when</h2>
        <Input label="City / village" name="city" defaultValue={project?.city || defaults.city} required error={e.city} />
        <Select label="State" name="state" options={INDIAN_STATES} placeholder="Choose state" defaultValue={project?.state || defaults.state} required error={e.state} />
        <Input label="Start date" name="start_date" type="date" defaultValue={project?.start_date ?? todayIST()} required error={e.start_date} />
        <Input label="Deadline" name="deadline" type="date" min={todayIST()} defaultValue={project?.deadline ?? ""} required hint="Last day to accept donations." error={e.deadline} />
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">3. Budget</h2>
        <p className="text-sm text-muted">List every item. The total must match your goal exactly — donors love seeing where each rupee goes.</p>

        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="hidden grid-cols-[1fr_90px_130px_120px_44px] gap-2 bg-bg px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
            <span>Item</span><span>Qty</span><span>Unit cost (₹)</span><span className="text-right">Total</span><span />
          </div>
          <ul className="divide-y divide-border">
            {rows.map((r, i) => (
              <li key={r.key} className="grid animate-pop grid-cols-2 gap-2 p-3 sm:grid-cols-[1fr_90px_130px_120px_44px] sm:items-center sm:px-4">
                <input
                  aria-label={`Item ${i + 1}`}
                  name="budget_item"
                  value={r.item}
                  onChange={(ev) => update(r.key, { item: ev.target.value })}
                  placeholder="Notebook (200 pages)"
                  className="kb-input col-span-2 sm:col-span-1"
                />
                <input aria-label={`Quantity ${i + 1}`} name="budget_qty" inputMode="numeric" value={r.qty} onChange={(ev) => update(r.key, { qty: ev.target.value })} className="kb-input" placeholder="Qty" />
                <input aria-label={`Unit cost ${i + 1}`} name="budget_unit" inputMode="numeric" value={r.unit} onChange={(ev) => update(r.key, { unit: ev.target.value })} className="kb-input" placeholder="₹ each" />
                <span className="self-center text-right font-semibold tabular-nums">{formatINR(toNum(r.qty) * toNum(r.unit))}</span>
                <button
                  type="button"
                  onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : rs))}
                  className="justify-self-end rounded-xl p-2 text-danger hover:bg-red-50 disabled:opacity-30"
                  disabled={rows.length === 1}
                  aria-label={`Remove line ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-bg px-4 py-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setRows((rs) => [...rs, { key: Date.now(), item: "", qty: "1", unit: "" }])}>
              <Plus className="h-4 w-4" /> Add line
            </Button>
            <p className="text-sm">
              Budget total: <strong className="font-serif text-lg tabular-nums">{formatINR(total)}</strong>
            </p>
          </div>
        </div>
        {e.budget && <p className="text-xs font-medium text-danger">{e.budget}</p>}

        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            label="Goal amount (₹)"
            name="goal_amount"
            inputMode="numeric"
            value={goal}
            onChange={(ev) => setGoal(ev.target.value)}
            required
            error={e.goal_amount}
          />
          <Button type="button" variant="outline" onClick={() => setGoal(String(total))} disabled={!total}>
            <Wand2 className="h-4 w-4" /> Use budget total
          </Button>
        </div>
        <p className={cn("text-sm font-medium", matches ? "text-success" : "text-warning")}>
          {matches ? "✓ Budget matches the goal." : goalNum ? `Difference: ${formatINR(Math.abs(goalNum - total))}` : "Enter a goal amount."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">4. Photos</h2>
        <ImageUploader
          bucket="media"
          folder={`${ngoId}/projects/${id}`}
          name="images"
          max={8}
          preset={PRESETS.photo}
          initial={images}
          label="Project photos (first one is the cover)"
          hint="Real photos of the place, people or items. At least 1 needed to submit."
        />
      </section>

      <div className="sticky bottom-3 z-10 flex justify-end rounded-3xl border border-border bg-surface/90 p-3 shadow-xl backdrop-blur">
        <SubmitButton size="lg">Save draft</SubmitButton>
      </div>
    </ActionForm>
  );
}
