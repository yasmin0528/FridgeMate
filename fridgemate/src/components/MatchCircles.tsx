interface Props {
  filled: number; // 0..5
}

export function MatchCircles({ filled }: Props) {
  const clamped = Math.max(0, Math.min(5, filled));
  return (
    <span className="inline-flex gap-1" aria-label={`匹配度 ${clamped}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: "10px",
            height: "10px",
            backgroundColor:
              i < clamped ? "var(--color-primary)" : "var(--color-hairline)",
            boxShadow:
              i < clamped
                ? "0 2px 6px rgba(123, 207, 142, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.4) inset"
                : "none",
          }}
        />
      ))}
    </span>
  );
}
