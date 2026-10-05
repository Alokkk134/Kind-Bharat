import { ImageResponse } from "next/og";
import { indian, OgLogo, Rupee } from "@/lib/og";
import { publicUrl } from "@/lib/storage";
import { createPublicClient } from "@/lib/supabase/public";

export const alt = "Verified project on KindBharat";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: p } = supabase && /^[a-z0-9-]{3,120}$/.test(slug)
    ? await supabase.from("public_projects").select("title, ngo_name, city, state, goal_amount, raised, cover_path, status").eq("slug", slug).maybeSingle()
    : { data: null };

  if (!p) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbf8f3" }}>
        <OgLogo scale={1.6} />
      </div>,
      size,
    );
  }

  const pct = Math.min(100, Math.round((p.raised / Math.max(1, p.goal_amount)) * 100));
  const cover = publicUrl("media", p.cover_path);
  const done = p.status === "completed";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fbf8f3", color: "#1f2a2e" }}>
        <div style={{ width: 470, height: "100%", display: "flex", background: "#0f5e59" }}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" width={470} height={630} style={{ objectFit: "cover", width: 470, height: 630 }} />
          ) : (
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", fontSize: 120, color: "#fff" }}>KB</div>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 60px" }}>
          <OgLogo scale={0.8} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", padding: "6px 16px", borderRadius: 999, background: "#e3f0ee", color: "#0f5e59", fontSize: 22, fontWeight: 700 }}>
                Verified Project
              </div>
              {done && (
                <div style={{ display: "flex", padding: "6px 16px", borderRadius: 999, background: "#2e7d4f", color: "#fff", fontSize: 22, fontWeight: 700 }}>
                  Completed with proof
                </div>
              )}
            </div>
            <div style={{ display: "flex", marginTop: 20, fontSize: p.title.length > 60 ? 46 : 56, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5 }}>
              {p.title}
            </div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 26, color: "#56656a" }}>
              {`${p.ngo_name} · ${p.city}, ${p.state}`}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", height: 22, borderRadius: 999, background: "#e3f0ee", overflow: "hidden" }}>
              <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", borderRadius: 999, background: done ? "#2e7d4f" : "#e08a1e" }} />
            </div>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>
              <Rupee size={34} />
              {indian.format(p.raised)}
              <span style={{ marginLeft: 12, fontWeight: 400, color: "#56656a", display: "flex", alignItems: "center" }}>
                {"raised of "}<Rupee size={30} color="#56656a" />{`${indian.format(p.goal_amount)} · ${pct}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
