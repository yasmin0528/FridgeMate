export const tokens = {
  colors: {
    primary: "#10B981",
    primaryDark: "#059669",
    primaryLight: "#D1FAE5",
    accent: "#F97316",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    bg: "#FAFAF9",
    surface: "#FFFFFF",
    border: "#E7E5E4",
    textPrimary: "#1C1917",
    textSecondary: "#57534E",
    textTertiary: "#A8A29E",
    protein: "#3B82F6",
    carb: "#F59E0B",
    fat: "#EC4899",
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  font: {
    sansZh: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
    mono: '"SF Mono", "JetBrains Mono", ui-monospace',
    sizes: {
      display: { size: 32, leading: 40 },
      h1: { size: 24, leading: 32 },
      h2: { size: 20, leading: 28 },
      body: { size: 16, leading: 24 },
      small: { size: 14, leading: 20 },
      caption: { size: 12, leading: 16 },
      stepTitle: { size: 28, leading: 36 }, // tutorial step
    },
  },
} as const;

export type Tokens = typeof tokens;
