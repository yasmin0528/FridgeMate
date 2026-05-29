"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  minutes: number;
  onClose: () => void;
}

export function CookingTimer({ minutes, onClose }: Props) {
  const total = minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([400, 100, 400]);
        }
      }
      return;
    }
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const pct = ((total - remaining) / total) * 100;
  const done = remaining <= 0;

  return (
    <div
      role="dialog"
      aria-label="烹饪计时器"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: "rgba(43, 43, 43, 0.25)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      {/* Clay card with 32px rounded corners */}
      <div
        className="flex flex-col items-center gap-8"
        style={{
          background: "var(--color-surface-elevated)",
          borderRadius: "32px",
          padding: "40px 36px",
          minWidth: 280,
          boxShadow:
            "0 8px 24px rgba(43, 43, 43, 0.10), 0 0 0 1px rgba(255, 255, 255, 0.8) inset, 0 -1px 0 rgba(43, 43, 43, 0.03) inset",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="var(--color-hairline-soft)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 80}
            strokeDashoffset={2 * Math.PI * 80 * (1 - pct / 100)}
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          {/* Center text */}
          <text
            x="90"
            y="92"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="36"
            fontWeight="700"
            fill={done ? "var(--color-primary)" : "var(--color-ink)"}
          >
            {done
              ? "完成!"
              : `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`}
          </text>
        </svg>

        {/* Done state celebration */}
        {done && (
          <div
            className="text-body text-center animate-pulse-soft"
            style={{ color: "var(--color-ink-soft)" }}
          >
            烹饪完成！可以享用啦
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-primary"
        >
          {done ? "好的" : "关闭"}
        </button>
      </div>
    </div>
  );
}
