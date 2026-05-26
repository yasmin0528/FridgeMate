/** 每完成 N 道菜升 1 级（经验按 history 总次数计） */
export const COOKS_PER_LEVEL = 5;

export interface ProfileXp {
  level: number;
  totalCooks: number;
  progressInLevel: number;
  progressPercent: number;
}

export function computeProfileXp(totalCooks: number): ProfileXp {
  const safe = Math.max(0, totalCooks);
  const level = Math.floor(safe / COOKS_PER_LEVEL) + 1;
  const progressInLevel = safe % COOKS_PER_LEVEL;
  const progressPercent = (progressInLevel / COOKS_PER_LEVEL) * 100;

  return {
    level,
    totalCooks: safe,
    progressInLevel,
    progressPercent,
  };
}
