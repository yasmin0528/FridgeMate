"use client";

import { useCheckinStore } from "@/store/checkinStore";
import { computeProfileXp } from "@/lib/profileXp";
import { ExpBar } from "@/components/profile/ExpBar";
import { CheckinCalendar } from "@/components/profile/CheckinCalendar";
import { RecentCookingList } from "@/components/profile/RecentCookingList";
import { motion, type Variants } from "framer-motion";

const PROFILE = {
  nickname: "小厨",
  avatar: "🧑‍🍳",
} as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 180, damping: 20 },
  },
};

function getStreakEmoji(streak: number): string {
  if (streak >= 30) return "👑";
  if (streak >= 14) return "🌟";
  if (streak >= 7) return "🏆";
  if (streak >= 5) return "💪";
  if (streak >= 3) return "⚡";
  if (streak >= 1) return "🔥";
  return "🌱";
}

function getStreakLabel(streak: number): string {
  if (streak === 0) return "今天开始打卡吧";
  if (streak >= 30) return "厨神附体！";
  if (streak >= 14) return "坚持大师！";
  if (streak >= 7) return "一周达人！";
  if (streak >= 3) return "渐入佳境！";
  return "好的开始！";
}

function getLevelEmoji(level: number): string {
  if (level >= 20) return "👑";
  if (level >= 10) return "🌟";
  if (level >= 5) return "🔥";
  return "🥚";
}

export default function ProfilePage() {
  const { history, streak, lastCookedDate } = useCheckinStore();
  const { level, progressInLevel, progressPercent } = computeProfileXp(
    history.length
  );

  return (
    <motion.main
      className="px-4 py-6 flex flex-col gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: 414, margin: "0 auto" }}
    >
      {/* ===== 游戏角色卡片 ===== */}
      <motion.section
        className="clay-card overflow-hidden relative"
        variants={itemVariants}
      >
        {/* 渐变背景 */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "linear-gradient(135deg, var(--color-card-mint) 0%, var(--color-card-sky) 40%, var(--color-card-lavender) 100%)",
          }}
        />

        {/* 装饰性浮动圆点 */}
        <div
          className="absolute w-24 h-24 rounded-full opacity-20"
          style={{
            background: "var(--color-primary)",
            top: -30,
            right: -20,
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute w-16 h-16 rounded-full opacity-15"
          style={{
            background: "var(--color-accent-peach)",
            bottom: 10,
            right: 40,
            filter: "blur(6px)",
          }}
        />

        <div className="relative z-10 p-5">
          {/* 头像 + 昵称 + 等级 */}
          <div className="flex items-center gap-4">
            <motion.div
              className="animate-float flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-4xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-card-banana) 0%, var(--color-card-peach) 100%)",
                boxShadow:
                  "0 4px 16px rgba(255, 201, 122, 0.25), 0 0 0 3px rgba(255, 255, 255, 0.6) inset",
              }}
              aria-hidden
            >
              {PROFILE.avatar}
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-h1 truncate">{PROFILE.nickname}</span>
                {/* 等级徽章 */}
                <motion.span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-deep) 100%)",
                    color: "var(--color-on-primary)",
                    boxShadow: "0 2px 8px var(--shadow-mint)",
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span>{getLevelEmoji(level)}</span>
                  <span>Lv.{level}</span>
                </motion.span>
              </div>
              <div className="text-small mt-0.5">
                累计完成 {history.length} 道菜
              </div>
            </div>
          </div>

          {/* 经验条 */}
          <ExpBar
            level={level}
            progressInLevel={progressInLevel}
            progressPercent={progressPercent}
          />

          {/* 底部勋章统计 */}
          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--color-hairline)" }}>
            {/* 连续打卡 */}
            <motion.div
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 flex-1"
              style={{
                background: "var(--color-surface)",
                boxShadow:
                  "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-2xl">{getStreakEmoji(streak)}</span>
              <div>
                <div className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                  连续打卡
                </div>
                <div className="text-h3">
                  {streak} 天
                </div>
              </div>
            </motion.div>

            {/* 总做饭次数 */}
            <motion.div
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 flex-1"
              style={{
                background: "var(--color-surface)",
                boxShadow:
                  "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-2xl">🍳</span>
              <div>
                <div className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                  总做饭
                </div>
                <div className="text-h3">
                  {history.length} 次
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ===== 激励语 ===== */}
      <motion.p
        className="text-small text-center animate-pulse-soft"
        variants={itemVariants}
      >
        {streak > 0 ? (
          <>
            🔥 已连续打卡 {streak} 天，{getStreakLabel(streak)}
          </>
        ) : (
          <span style={{ color: "var(--color-ink-muted)" }}>
            {lastCookedDate
              ? `上次烹饪：${lastCookedDate}`
              : "还没有记录，做完一道菜来打卡吧 \u2728"}
          </span>
        )}
      </motion.p>

      {/* ===== 打卡日历 ===== */}
      <motion.div variants={itemVariants}>
        <CheckinCalendar history={history} />
      </motion.div>

      {/* ===== 最近完成 ===== */}
      <motion.div variants={itemVariants}>
        <RecentCookingList history={history} />
      </motion.div>
    </motion.main>
  );
}
