import { BadgeCheck, Camera, CheckCircle2, ShieldCheck } from "lucide-react";
import { Rangoli } from "@/components/motion/decor";
import { ParallaxScene } from "@/components/motion/parallax-scene";

/** Layered 3D illustration: rangoli, project card, confirmed-donation toast, proof card and a spinning seal. */
export function HeroScene() {
  return (
    <ParallaxScene className="relative mx-auto h-[380px] w-full max-w-[520px] sm:h-[460px]">
      <Rangoli className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-[440px] sm:w-[440px] [transform:translateZ(-80px)]" />

      {/* Main project card */}
      <div className="absolute left-1/2 top-1/2 w-[250px] -translate-x-1/2 -translate-y-1/2 [transform:translateZ(40px)] sm:w-[290px]">
        <div className="animate-float overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_40px_80px_-30px_rgba(15,94,89,0.6)]">
          <div className="relative h-32 bg-gradient-to-br from-[#138a7f] via-primary to-primary-deep sm:h-36">
            <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,#fff_0,transparent_40%),radial-gradient(circle_at_80%_70%,var(--kb-accent)_0,transparent_45%)]" />
            <span className="absolute bottom-3 left-3 text-4xl">📚</span>
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-primary">
              <ShieldCheck className="h-3 w-3" /> Verified Project
            </span>
          </div>
          <div className="p-4">
            <p className="flex items-center gap-1 text-[11px] font-semibold text-primary"><BadgeCheck className="h-3.5 w-3.5" /> Asha Foundation</p>
            <p className="mt-1 font-serif text-base font-semibold leading-snug">Stationery kits for 100 students</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-soft">
              <div className="kb-progress-fill relative h-full w-[72%] overflow-hidden rounded-full bg-gradient-to-r from-accent to-[#f0a53a]">
                <span className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            </div>
            <p className="mt-2 text-xs"><strong>₹18,000</strong> <span className="text-muted">of ₹25,000 · 31 donors</span></p>
          </div>
        </div>
      </div>

      {/* Confirmed donation toast */}
      <div className="absolute right-0 top-6 [transform:translateZ(120px)] sm:-right-4">
        <div className="animate-float rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 shadow-2xl backdrop-blur" style={{ animationDelay: "-2s" }}>
          <p className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-success" /> ₹500 · Rahul S.
          </p>
          <p className="text-[10px] text-success">Confirmed by NGO · 2 min ago</p>
        </div>
      </div>

      {/* Proof card */}
      <div className="absolute bottom-4 left-0 [transform:translateZ(90px)] sm:-left-4">
        <div className="animate-float flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-2.5 pr-4 shadow-2xl backdrop-blur" style={{ animationDelay: "-4s" }}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-rose text-white">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold">Proof of completion</p>
            <p className="text-[10px] text-muted">12 photos · 100 kits delivered</p>
          </div>
        </div>
      </div>

      {/* Spinning verified seal (3D coin) */}
      <div className="absolute bottom-16 right-6 h-20 w-20 [transform:translateZ(160px)] sm:right-2">
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
