"use client";

import { useMemo, useState } from "react";
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
    <section className="rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg"
          style={{ borderColor: "var(--color-border)" }}
          aria-label="上一月"
        >
          ‹
        </button>
        <div className="text-center min-w-0 flex-1 px-2">
          <div className="font-semibold">{formatMonthLabel(viewYear, viewMonth)}</div>
          <div
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            本月打卡 {monthChecked} 天
          </div>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg"
          style={{ borderColor: "var(--color-border)" }}
          aria-label="下一月"
        >
          ›
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={goToday}
          className="mb-3 w-full py-1.5 text-xs rounded-lg"
          style={{
            color: "var(--color-primary)",
            backgroundColor: "var(--color-primary-light)",
          }}
        >
          回到本月
        </button>
      )}

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs py-1"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.key || cell.day === null) {
            return <div key={`empty-${i}`} className="aspect-square" aria-hidden />;
          }

          const isChecked = checked.has(cell.key);
          const isToday = cell.key === todayKey;

          return (
            <div
              key={cell.key}
              className="aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative"
              style={{
                backgroundColor: isChecked
                  ? "var(--color-primary)"
                  : "var(--color-bg)",
                color: isChecked
                  ? "#fff"
                  : "var(--color-text-primary)",
                border: isToday
                  ? "2px solid var(--color-primary)"
                  : "1px solid transparent",
                boxSizing: "border-box",
              }}
              title={
                isChecked
                  ? `${cell.key} 已打卡`
                  : isToday
                    ? "今天"
                    : cell.key
              }
            >
              <span className="font-medium">{cell.day}</span>
              {isChecked && (
                <span className="text-[10px] leading-none mt-0.5 opacity-90">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="flex flex-wrap gap-4 mt-4 text-xs justify-center"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
          已打卡
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded border-2"
            style={{ borderColor: "var(--color-primary)" }}
          />
          今天
        </span>
      </div>
    </section>
  );
}
