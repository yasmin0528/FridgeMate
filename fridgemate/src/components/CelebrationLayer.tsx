"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  oldStreak: number;
  newStreak: number;
  onDismiss: () => void;
}

const ENCOURAGEMENT = [
  "做完一道！",
  "今天又靠自己吃了一顿健康的",
  "冰箱被你利用得很彻底",
  "做菜本人，自己骄傲一下",
  "厨房新星 +1",
  "再坚持一下，理想体重就在前方",
  "你才不是只会点外卖的人",
  "热量自己控，比谁都靠谱",
  "今天比昨天的你又强了一点",
  "晚饭做完了，今天提前打卡",
];

interface ParticleSpec {
  x: number;
  y: number;
  rotate: number;
}

function buildParticles(count: number): ParticleSpec[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 800,
    rotate: Math.random() * 720,
  }));
}

const PARTICLE_EMOJIS = ["✨", "🎉", "💫", "🌟", "🌸", "⭐"];

export function CelebrationLayer({
  oldStreak,
  newStreak,
  onDismiss,
}: Props) {
  const [displayStreak, setDisplayStreak] = useState(oldStreak);
  const [message] = useState(
    () => ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)]
  );
  const [particles] = useState<ParticleSpec[]>(() => buildParticles(20));

  useEffect(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    const start = Date.now();
    const dur = 600;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / dur);
      setDisplayStreak(
        Math.round(oldStreak + (newStreak - oldStreak) * t)
      );
      if (t >= 1) clearInterval(id);
    }, 40);
    const dismiss = setTimeout(onDismiss, 3000);
    return () => {
      clearInterval(id);
      clearTimeout(dismiss);
    };
  }, [oldStreak, newStreak, onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, var(--color-card-mint) 0%, var(--color-card-banana) 30%, var(--color-card-strawberry) 60%, var(--color-card-lavender) 100%)",
      }}
      onClick={onDismiss}
    >
      {/* Floating sparkle particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl floating-element"
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 1.5,
            rotate: p.rotate,
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.04,
            ease: "easeOut",
          }}
        >
          {PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length]}
        </motion.span>
      ))}

      {/* Warm clay card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="clay-card flex flex-col items-center px-10 py-10 min-w-[280px] z-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: "32px",
          backgroundColor: "rgba(255, 253, 248, 0.92)",
        }}
      >
        {/* Encouragement message */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-h2 text-center mb-8 px-2"
          style={{ color: "var(--color-ink)" }}
        >
          {message}
        </motion.div>

        {/* Streak number with animated count */}
        <motion.div
          key={displayStreak}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="flex items-center gap-3 animate-float"
          style={{ fontSize: "64px", fontWeight: 700, lineHeight: 1 }}
        >
          <span>🔥</span>
          <span style={{ color: "var(--color-primary)" }}>
            {displayStreak}
          </span>
        </motion.div>

        {/* Streak label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-3 text-small"
          style={{ color: "var(--color-ink-muted)" }}
        >
          连续 {displayStreak} 天
        </motion.div>

        {/* Dismiss hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
          className="mt-8 text-caption"
          style={{ color: "var(--color-ink-muted)" }}
        >
          点击或等待 3 秒返回
        </motion.div>
      </motion.div>
    </div>
  );
}
