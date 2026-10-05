// Shared bits for Open Graph images (rendered by next/og, so inline styles only).

/** ₹ drawn as SVG so it renders even if the OG font lacks the glyph. */
export function Rupee({ size = 40, color = "#0f5e59" }: { size?: number; color?: string }) {
  return (
    <svg width={size * 0.62} height={size} viewBox="0 0 62 100" style={{ marginRight: 4 }}>
      <path
        d="M6 8h50M6 30h50M18 8c22 0 30 8 30 22s-12 22-34 22h-8l40 42"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OgLogo({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * scale }}>
      <svg width={56 * scale} height={56 * scale} viewBox="0 0 32 32">
        <rect width="32" height="32" rx="10" fill="#0f5e59" />
        <path d="M16 24c-4-3-7-6-7-9.5a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1C23 18 20 21 16 24z" fill="#fff" />
        <path d="M16 23.5c-1.6-2.3-2.2-4.6-1.6-7.2.5.9 1 1.6 1.6 2.1.6-.5 1.1-1.2 1.6-2.1.6 2.6 0 4.9-1.6 7.2z" fill="#e08a1e" />
      </svg>
      <div style={{ display: "flex", fontSize: 40 * scale, fontWeight: 700, letterSpacing: -1 }}>
        <span style={{ color: "#0f5e59" }}>Kind</span>
        <span style={{ color: "#9a520b" }}>Bharat</span>
      </div>
    </div>
  );
}

export const indian = new Intl.NumberFormat("en-IN");
