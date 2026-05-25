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
      className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{ minWidth: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx="90"
            cy="90"
            r="80"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 80}
            strokeDashoffset={2 * Math.PI * 80 * (1 - pct / 100)}
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <text
            x="90"
            y="92"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="36"
            fontWeight="600"
            fill={
              done ? "var(--color-success)" : "var(--color-text-primary)"
            }
          >
            {done
              ? "完成!"
              : `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`}
          </text>
        </svg>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {done ? "好的" : "关闭"}
        </button>
      </div>
    </div>
  );
}
