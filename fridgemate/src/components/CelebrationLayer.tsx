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
          "radial-gradient(circle at center, #10B981 0%, #059669 60%, #064E3B 100%)",
      }}
      onClick={onDismiss}
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
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
          {["✨", "🎉", "💫", "🌟"][i % 4]}
        </motion.span>
      ))}
      <div className="text-white text-2xl font-semibold mb-6 px-8 text-center">
        {message}
      </div>
      <div className="text-white text-7xl font-bold flex items-center gap-2">
        🔥 {displayStreak}
      </div>
      <div className="text-white/80 mt-2">连续 {displayStreak} 天</div>
      <div className="text-white/60 text-xs mt-8">点击或等待 3 秒返回</div>
    </div>
  );
}
