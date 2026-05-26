"use client";

import { COOKS_PER_LEVEL } from "@/lib/profileXp";

interface ExpBarProps {
  level: number;
  progressInLevel: number;
  progressPercent: number;
}

export function ExpBar({ level, progressInLevel, progressPercent }: ExpBarProps) {
  const pct = Math.min(100, Math.max(0, progressPercent));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">Lv.{level}</span>
        <span style={{ color: "var(--color-text-secondary)" }}>
          {progressInLevel}/{COOKS_PER_LEVEL} 道菜升级
        </span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--color-border)" }}
        role="progressbar"
        aria-valuenow={progressInLevel}
        aria-valuemin={0}
        aria-valuemax={COOKS_PER_LEVEL}
        aria-label={`经验进度 ${progressInLevel}，共 ${COOKS_PER_LEVEL}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: "var(--color-primary)",
          }}
        />
      </div>
    </div>
  );
}
