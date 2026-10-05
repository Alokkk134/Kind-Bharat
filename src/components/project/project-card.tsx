import Link from "next/link";
import { BadgeCheck, CalendarClock, MapPin, Users } from "lucide-react";
import { Tilt } from "@/components/motion/tilt";
import { Progress } from "@/components/ui/progress";
import type { PublicProject } from "@/lib/database.types";
import { categoryEmoji, categoryLabel } from "@/lib/constants";
import { daysLeft, formatINR, formatNumber, percent } from "@/lib/format";
import { publicUrl } from "@/lib/storage";

export function ProjectCard({ p, priority }: { p: PublicProject; priority?: boolean }) {
  const pct = percent(p.raised, p.goal_amount);
  const left = daysLeft(p.deadline);
  const completed = p.status === "completed";
  const cover = publicUrl("media", p.cover_path);

  return (
    <Tilt className="rounded-[1.75rem]" max={7}>
      <Link
        href={`/projects/${p.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_18px_40px_-28px_rgba(15,94,89,0.55)] transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(15,94,89,0.6)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">{categoryEmoji(p.category)}</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink shadow backdrop-blur [transform:translateZ(40px)]">
            {categoryEmoji(p.category)} {categoryLabel(p.category)}
          </span>
          {completed ? (
            <span className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-white shadow">
              ✓ Completed with proof
            </span>
          ) : p.status === "funded" ? (
            <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow">
              🎉 Goal reached
            </span>
          ) : null}
          <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white">
            <MapPin className="h-3.5 w-3.5" /> {p.city}, {p.state}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 [transform:translateZ(20px)]">
          <p className="flex items-center gap-1 text-xs font-semibold text-primary">
            <BadgeCheck className="h-4 w-4" /> {p.ngo_name}
          </p>
          <h3 className="mt-1.5 line-clamp-2 font-serif text-lg font-semibold leading-snug">{p.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{p.summary}</p>

          <div className="mt-auto pt-4">
            <Progress value={pct} done={completed} />
            <div className="mt-2 flex items-baseline justify-between gap-2 text-sm">
              <p>
                <strong className="tabular-nums">{formatINR(p.raised)}</strong>
                <span className="text-muted"> of {formatINR(p.goal_amount)}</span>
              </p>
              <span className="font-semibold text-accent-ink">{pct}%</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {formatNumber(p.donor_count)} donor{p.donor_count === 1 ? "" : "s"}
              </span>
              {!completed && left !== null && (
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {left > 0 ? `${left} day${left === 1 ? "" : "s"} left` : left === 0 ? "Last day" : "Ended"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Tilt>
  );
}
