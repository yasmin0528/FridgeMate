import type { CookingDoneEvent } from "@/types";
import { dateKey } from "@/store/checkinStore";

export const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

export interface CalendarCell {
  /** YYYY-MM-DD；占位格为 null */
  key: string | null;
  day: number | null;
}

export function buildCheckedDateSet(history: CookingDoneEvent[]): Set<string> {
  const set = new Set<string>();
  for (const e of history) {
    set.add(dateKey(e.timestamp));
  }
  return set;
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

/** 生成当月日历格（含月初空白占位） */
export function buildMonthCells(year: number, month: number): CalendarCell[] {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDow; i++) {
    cells.push({ key: null, day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key, day: d });
  }
  return cells;
}

export function countCheckedInMonth(
  cells: CalendarCell[],
  checked: Set<string>
): number {
  let n = 0;
  for (const c of cells) {
    if (c.key && checked.has(c.key)) n++;
  }
  return n;
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
