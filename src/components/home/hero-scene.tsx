import { BadgeCheck, Camera, CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";
import { Rangoli } from "@/components/motion/decor";
import { ParallaxScene } from "@/components/motion/parallax-scene";

// Shared path (in a 0–100 box) that the dotted line and the travelling hearts follow:
// donor card → NGO card → people helped.
const FLOW_PATH = "M28 20 C 28 32, 46 28, 60 36 S 76 58, 46 70";

/**
 * Layered 3D illustration of what KindBharat does:
 * a donor gives → a verified NGO receives & confirms → help reaches people in need (with proof).
 */
export function HeroScene() {
  return (
    <ParallaxScene className="relative mx-auto h-[480px] w-full max-w-[520px] sm:h-[500px]">
      <Rangoli className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 opacity-50 sm:h-[440px] sm:w-[440px] [transform:translateZ(-90px)]" />

      {/* Flow line with hearts travelling from donor to people */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible [transform:translateZ(10px)]"
      >
        <path
          d={FLOW_PATH}
          fill="none"
          stroke="var(--kb-primary)"
          strokeOpacity=".35"
          strokeWidth="2"
          strokeDasharray="2 6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="animate-[kb-dash_1.2s_linear_infinite]"
        />
        {[0, 1.2, 2.4].map((delay) => (
          <circle key={delay} r="1.6" fill="var(--kb-accent)">
            <animateMotion dur="3.6s" begin={`${delay}s`} repeatCount="indefinite" path={FLOW_PATH} />
            <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* 1 — You give */}
      <div className="absolute left-0 top-0 w-[62%] [transform:translateZ(70px)] sm:w-[56%]">
        <div className="animate-float rounded-[1.5rem] border border-white/70 bg-white/95 p-3.5 shadow-[0_30px_60px_-28px_rgba(15,94,89,0.55)] backdrop-blur">
          <Step n={1} label="You give" />
          <div className="mt-2.5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-ink text-white shadow-lg shadow-accent/30">
              <Smartphone className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-lg font-semibold leading-tight">₹500 via UPI</p>
              <p className="text-[11px] leading-snug text-muted">Straight to the NGO&apos;s own account</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2 — Verified NGO receives & confirms */}
      <div className="absolute right-0 top-[27%] w-[64%] [transform:translateZ(110px)] sm:w-[56%]">
        <div
          className="animate-float rounded-[1.5rem] border border-white/70 bg-white/95 p-3.5 shadow-[0_30px_60px_-28px_rgba(15,94,89,0.55)] backdrop-blur"
          style={{ animationDelay: "-2s" }}
        >
          <Step n={2} label="Verified NGO receives" />
          <div className="mt-2.5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#138a7f] to-primary-deep text-white shadow-lg shadow-primary/30">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-[15px] font-semibold leading-tight">Asha Foundation</p>
              <p className="flex items-center gap-1 text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3 w-3" /> Confirmed ₹500 received
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 — Help reaches people in need, with proof */}
      <div className="absolute bottom-0 left-[2%] w-[70%] [transform:translateZ(90px)] sm:w-[62%]">
        <div
          className="animate-float overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-[0_30px_60px_-28px_rgba(15,94,89,0.55)] backdrop-blur"
          style={{ animationDelay: "-4s" }}
        >
          <div className="relative flex h-16 items-center justify-center gap-1.5 bg-gradient-to-br from-accent-soft via-[#fde4c3] to-primary-soft text-3xl sm:h-20 sm:text-4xl">
            <span aria-hidden>👧</span>
            <span aria-hidden>📚</span>
            <span aria-hidden>🧒</span>
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary">
              <Camera className="h-3 w-3" /> Proof posted
            </span>
          </div>
          <div className="p-3.5">
            <Step n={3} label="Help reaches people in need" />
            <p className="mt-1.5 font-serif text-base font-semibold leading-tight">100 children get school kits</p>
            <p className="text-[11px] text-muted">Photos & bills checked by KindBharat</p>
          </div>
        </div>
      </div>

      {/* Spinning seal (3D coin): Verified ⇄ 0% fees */}
      <div className="absolute right-[3%] bottom-[30%] h-20 w-20 sm:bottom-[26%] [transform:translateZ(150px)]">
        <div className="preserve-3d relative h-full w-full animate-coin">
          <span className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary to-primary-deep text-white shadow-xl">
            <ShieldCheck className="h-7 w-7" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Verified</span>
          </span>
          <span className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-accent to-accent-ink text-white shadow-xl [transform:rotateY(180deg)]">
            <span className="font-serif text-xl font-bold">0%</span>
            <span className="text-[8px] font-bold uppercase tracking-wider">fees</span>
          </span>
        </div>
      </div>
    </ParallaxScene>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-ink">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">{n}</span>
      {label}
    </p>
  );
}
