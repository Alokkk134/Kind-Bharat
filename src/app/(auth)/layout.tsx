import { ShieldCheck, HandHeart, Camera } from "lucide-react";
import { Aurora, Rangoli } from "@/components/motion/decor";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden">
      <Aurora className="opacity-70" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div className="relative z-10 w-full max-w-md justify-self-center lg:justify-self-start">{children}</div>

        <aside className="perspective relative hidden h-[520px] lg:block" aria-hidden>
          <Rangoli className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
          <div className="preserve-3d absolute inset-0 [transform:rotateX(14deg)_rotateY(-18deg)]">
            {[
              { icon: ShieldCheck, title: "Every NGO verified", text: "Documents checked by a real person.", pos: "left-6 top-10", z: 60, delay: "0s" },
              { icon: HandHeart, title: "Pay the NGO directly", text: "UPI or bank. We never touch money.", pos: "right-4 top-48", z: 120, delay: "-2s" },
              { icon: Camera, title: "Proof when done", text: "Photos and results, reviewed by us.", pos: "left-16 bottom-8", z: 90, delay: "-4s" },
            ].map(({ icon: Icon, title, text, pos, z, delay }) => (
              <div
                key={title}
                className={`absolute ${pos} w-64 animate-float rounded-3xl border border-white/60 bg-white/80 p-5 shadow-2xl shadow-primary/20 backdrop-blur`}
                style={{ transform: `translateZ(${z}px)`, animationDelay: delay }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-serif text-lg font-semibold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
