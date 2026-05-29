"use client";

import { COOKS_PER_LEVEL } from "@/lib/profileXp";
import { motion } from "framer-motion";

interface ExpBarProps {
  level: number;
  progressInLevel: number;
  progressPercent: number;
}

const levelEmoji: Record<number, string> = {
  1: "\u{1F476}",  // 1: baby
  2: "\u{1F423}",  // 2: chick
  3: "\u{1F424}",  // 3: baby chick
  4: "\u{1F425}",  // 4: front-facing baby chick
  5: "\u{1F426}",  // 5: bird
};

function getLevelIcon(lvl: number): string {
  if (lvl <= 3) return "\u{1F476}";   // baby
  if (lvl <= 6) return "\u{1F424}";   // chick
  if (lvl <= 10) return "\u{1F426}";  // bird
  if (lvl <= 15) return "\u{1F985}";  // eagle
  if (lvl <= 20) return "\u{1F986}";  // duck
  if (lvl <= 30) return "\u{1F40A}";  // crocodile
  return "\u{1F432}";                  // dragon
}

export function ExpBar({ level, progressInLevel, progressPercent }: ExpBarProps) {
  const pct = Math.min(100, Math.max(0, progressPercent));

  return (
    <div className="mt-4">
      {/* 等级标题 + 进度文字 */}
      <div className="flex items-center justify-between mb-2">
        <motion.div
          className="flex items-center gap-1.5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring" as const, stiffness: 200, damping: 22 }}
        >
          <span className="text-lg" aria-hidden>{getLevelIcon(level)}</span>
          <span className="font-semibold" style={{ color: "var(--color-ink)", fontSize: 15 }}>
            等级 {level}
          </span>
        </motion.div>
        <motion.span
          className="text-xs font-medium"
          style={{ color: "var(--color-ink-soft)" }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring" as const, stiffness: 200, damping: 22, delay: 0.1 }}
        >
          {progressInLevel}/{COOKS_PER_LEVEL} 道菜
        </motion.span>
      </div>

      {/* 进度条轨道 */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          height: 14,
          background: "var(--color-surface)",
          boxShadow:
            "0 1px 3px rgba(43,43,43,0.06) inset, 0 0 0 1px rgba(255,255,255,0.6) inset",
        }}
        role="progressbar"
        aria-valuenow={progressInLevel}
        aria-valuemin={0}
        aria-valuemax={COOKS_PER_LEVEL}
        aria-label={`经验进度 ${progressInLevel}，共 ${COOKS_PER_LEVEL}`}
      >
        {/* 填充条 */}
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background:
              "linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-pressed) 100%)",
            boxShadow:
              "0 0 12px var(--shadow-mint), 0 0 0 1px rgba(255,255,255,0.3) inset",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring" as const, stiffness: 60, damping: 20, delay: 0.2 }}
        >
          {/* 光泽效果 */}
          <motion.div
            className="absolute inset-y-0 w-8 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
              right: "90%",
            }}
            animate={{ right: ["90%", "-20%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
      </motion.div>

      {/* 下一等级提示 */}
      {progressInLevel === 0 && (
        <motion.div
          className="text-xs mt-1.5 text-center"
          style={{ color: "var(--color-ink-muted)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          再做 {COOKS_PER_LEVEL} 道菜升到 Lv.{level + 1}
        </motion.div>
      )}
    </div>
  );
}
