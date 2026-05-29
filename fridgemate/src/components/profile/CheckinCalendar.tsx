"use client";

import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { CookingDoneEvent } from "@/types";
import { dateKey } from "@/store/checkinStore";
import {
  WEEKDAY_LABELS,
  buildCheckedDateSet,
  buildMonthCells,
  countCheckedInMonth,
  formatMonthLabel,
  shiftMonth,
} from "@/lib/checkinCalendar";

interface CheckinCalendarProps {
  history: CookingDoneEvent[];
}

function todayParts(): { year: number; month: number; todayKey: string } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    todayKey: dateKey(now.getTime()),
  };
}

const dayVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 18,
      delay: i * 0.015,
    },
  }),
};

export function CheckinCalendar({ history }: CheckinCalendarProps) {
  const { year: initYear, month: initMonth, todayKey } = todayParts();
  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);

  const checked = useMemo(() => buildCheckedDateSet(history), [history]);
  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth]
  );
  const monthChecked = countCheckedInMonth(cells, checked);
  const isCurrentMonth = viewYear === initYear && viewMonth === initMonth;

  const goPrev = () => {
    const next = shiftMonth(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const goNext = () => {
    const next = shiftMonth(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const goToday = () => {
    setViewYear(initYear);
    setViewMonth(initMonth);
  };

  return (
    <motion.section
      className="clay-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring" as const, stiffness: 160, damping: 20, delay: 0.1 }}
    >
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          type="button"
          onClick={goPrev}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
          style={{
            background: "var(--color-surface)",
            color: "var(--color-ink-soft)",
            boxShadow:
              "0 1px 4px rgba(43,43,43,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="上一月"
        >
          &#8249;
        </motion.button>

        <div className="text-center min-w-0 flex-1 px-2">
          <div className="text-h3">{formatMonthLabel(viewYear, viewMonth)}</div>
          <motion.div
            className="text-caption mt-0.5"
            key={`${viewYear}-${viewMonth}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            本月打卡 {monthChecked} 天
          </motion.div>
        </div>

        <motion.button
          type="button"
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
          style={{
            background: "var(--color-surface)",
            color: "var(--color-ink-soft)",
            boxShadow:
              "0 1px 4px rgba(43,43,43,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset",
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="下一月"
        >
          &#8250;
        </motion.button>
      </div>

      {/* 回到本月按钮 */}
      {!isCurrentMonth && (
        <motion.button
          type="button"
          onClick={goToday}
          className="mb-4 w-full py-2 rounded-full text-xs font-medium"
          style={{
            color: "var(--color-primary-deep)",
            background: "var(--color-card-mint)",
            boxShadow:
              "0 1px 4px rgba(43,43,43,0.04), 0 0 0 1px rgba(255,255,255,0.4) inset",
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
        >
          回到本月
        </motion.button>
      )}

      {/* 星期标签 */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-caption py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell.key || cell.day === null) {
            return <div key={`empty-${i}`} className="aspect-square" aria-hidden />;
          }

          const isChecked = checked.has(cell.key);
          const isToday = cell.key === todayKey;

          return (
            <motion.div
              key={cell.key}
              className="aspect-square flex flex-col items-center justify-center rounded-2xl text-xs relative cursor-default"
              style={{
                background: isChecked
                  ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-pressed) 100%)"
                  : "transparent",
                color: isChecked
                  ? "var(--color-on-primary)"
                  : "var(--color-ink)",
                boxShadow: isChecked
                  ? "0 2px 8px var(--shadow-mint), 0 0 0 1px rgba(255,255,255,0.3) inset"
                  : isToday
                    ? "0 0 0 2px var(--color-primary), 0 0 12px var(--shadow-mint)"
                    : "none",
              }}
              variants={dayVariants}
              custom={i}
              initial="hidden"
              animate="visible"
              whileHover={!isChecked ? { scale: 1.08 } : undefined}
              whileTap={!isChecked ? { scale: 0.95 } : undefined}
              title={
                isChecked
                  ? `${cell.key} 已打卡`
                  : isToday
                    ? "今天"
                    : cell.key
              }
            >
              <span className="font-semibold text-sm leading-none">{cell.day}</span>
              {isChecked && (
                <motion.span
                  className="text-[10px] leading-none mt-0.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                >
                  &#10003;
                </motion.span>
              )}
              {!isChecked && isToday && (
                <span
                  className="text-[8px] leading-none mt-0.5 font-medium"
                  style={{ color: "var(--color-primary)" }}
                >
                  今天
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 图例 */}
      <motion.div
        className="flex flex-wrap gap-4 mt-5 text-xs justify-center"
        style={{ color: "var(--color-ink-soft)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3.5 w-3.5 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-pressed) 100%)",
              boxShadow: "0 1px 4px var(--shadow-mint)",
            }}
          />
          已打卡
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3.5 w-3.5 rounded-lg"
            style={{
              border: "2px solid var(--color-primary)",
              boxShadow: "0 0 6px var(--shadow-mint)",
            }}
          />
          今天
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-lg bg-transparent" />
          未打卡
        </span>
      </motion.div>
    </motion.section>
  );
}
