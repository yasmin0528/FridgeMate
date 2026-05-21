interface Props {
  filled: number; // 0..5
}

export function MatchCircles({ filled }: Props) {
  const clamped = Math.max(0, Math.min(5, filled));
  return (
    <span className="inline-flex gap-0.5" aria-label={`匹配度 ${clamped}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor:
              i < clamped ? "var(--color-primary)" : "var(--color-border)",
          }}
        />
      ))}
    </span>
  );
}
