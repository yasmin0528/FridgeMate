export const tokens = {
  colors: {
    // Brand Primary - warm mint green
    primary: "#7BCF8E",
    primaryPressed: "#69BD7C",
    primaryDeep: "#57A968",
    onPrimary: "#FFFFFF",

    // Warm accents
    secondary: "#FFC97A",
    secondarySoft: "#FFE7BF",

    accentCoral: "#FF9E8A",
    accentPeach: "#FFD8C2",
    accentLavender: "#CDBDFF",
    accentSky: "#BFE7FF",

    // Backgrounds
    canvas: "#FFFDF8",
    surface: "#F8F6F1",
    surfaceSoft: "#FCFBF8",
    surfaceElevated: "#FFFFFF",

    // Emotional Card Tints
    cardMint: "#E5F7EA",
    cardPeach: "#FFF0E4",
    cardBanana: "#FFF7CC",
    cardLavender: "#F1EBFF",
    cardSky: "#E8F6FF",
    cardStrawberry: "#FFE5EA",

    // Text
    ink: "#2B2B2B",
    inkSoft: "#5F5B53",
    inkMuted: "#8F8A82",
    onDark: "#FFFFFF",

    // Borders
    hairline: "#ECE7DF",
    hairlineSoft: "#F3EFE8",

    // Semantic
    success: "#7BCF8E",
    warning: "#FFB84D",
    error: "#FF7A7A",

    // Shadow tints
    shadowMint: "rgba(123, 207, 142, 0.12)",
    shadowPeach: "rgba(255, 201, 122, 0.16)",

    // Macronutrient
    protein: "#CDBDFF",
    carb: "#FFC97A",
    fat: "#FF9E8A",
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    sectionSm: 48,
    section: 64,
    sectionLg: 96,
    hero: 120,
  },
  rounded: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    full: 9999,
  },
  font: {
    sansZh: '-apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    mono: '"SF Mono", "JetBrains Mono", ui-monospace',
    sizes: {
      heroDisplay: { size: 32, leading: 36, weight: 600, letter: -0.5 },
      display: { size: 28, leading: 32, weight: 600, letter: -0.3 },
      h1: { size: 22, leading: 28, weight: 600, letter: 0 },
      h2: { size: 18, leading: 24, weight: 600, letter: 0 },
      h3: { size: 16, leading: 22, weight: 600, letter: 0 },
      body: { size: 15, leading: 22, weight: 400, letter: 0 },
      bodyMedium: { size: 15, leading: 22, weight: 500, letter: 0 },
      small: { size: 13, leading: 18, weight: 400, letter: 0 },
      caption: { size: 12, leading: 16, weight: 500, letter: 0 },
      micro: { size: 11, leading: 14, weight: 600, letter: 0.5 },
    },
  },
  shadow: {
    soft: "0 2px 8px rgba(43, 43, 43, 0.06)",
    card: "0 4px 16px rgba(43, 43, 43, 0.08)",
    elevated: "0 8px 24px rgba(43, 43, 43, 0.10)",
    modal: "0 16px 48px rgba(43, 43, 43, 0.14)",
    glowMint: "0 4px 20px rgba(123, 207, 142, 0.25)",
    glowPeach: "0 4px 20px rgba(255, 201, 122, 0.25)",
  },
} as const;

export type Tokens = typeof tokens;
