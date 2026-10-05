/** One-shot CSS confetti burst (marigold, teal, rose). Decorative. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const colors = ["var(--kb-accent)", "var(--kb-primary)", "var(--kb-rose)", "#f0c24b", "#138a7f"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: pieces }).map((_, i) => {
        const angle = (i / pieces) * Math.PI * 2;
        const dist = 110 + ((i * 37) % 90);
        return (
          <span
            key={i}
            className="absolute left-1/2 top-10 block h-2.5 w-1.5 rounded-sm"
            style={
              {
                background: colors[i % colors.length],
                "--x": `${Math.cos(angle) * dist}px`,
                "--y": `${Math.sin(angle) * dist - 40}px`,
                "--r": `${(i * 47) % 720}deg`,
                animation: `kb-confetti 1.3s cubic-bezier(.15,.8,.3,1) ${(i % 6) * 20}ms both`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
