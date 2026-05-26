import type { CookingDoneEvent } from "@/types";
import { dateKey } from "@/store/checkinStore";

export const RECENT_COOKING_LIMIT = 10;

export function sortHistoryDesc(
  history: CookingDoneEvent[]
): CookingDoneEvent[] {
  return [...history].sort((a, b) => b.timestamp - a.timestamp);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 列表展示用：今天 14:30 / 昨天 09:00 / 5月20日 18:00 */
export function formatCookingLabel(ts: number, nowMs = Date.now()): string {
  const d = new Date(ts);
  const day = dateKey(ts);
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  if (day === dateKey(nowMs)) return `今天 ${time}`;

  const yesterday = new Date(nowMs);
  yesterday.setDate(yesterday.getDate() - 1);
  if (day === dateKey(yesterday.getTime())) return `昨天 ${time}`;

  const now = new Date(nowMs);
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}月${d.getDate()}日 ${time}`;
  }
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${time}`;
}
