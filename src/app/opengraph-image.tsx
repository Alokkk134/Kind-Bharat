import { ImageResponse } from "next/og";
import { OgLogo } from "@/lib/og";

export const alt = "KindBharat — Give directly. See the proof.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #fbf8f3 0%, #fdf1e1 55%, #e3f0ee 100%)",
          color: "#1f2a2e",
        }}
      >
        <OgLogo />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Give directly.</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: "#0f5e59" }}>See the proof.</div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#56656a" }}>
            Verified NGO projects · Zero platform fees · Pay the NGO directly
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Verified NGOs", "Approved projects", "Proof of completion"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "12px 24px", borderRadius: 999, background: "#0f5e59", color: "#fff", fontSize: 24 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
