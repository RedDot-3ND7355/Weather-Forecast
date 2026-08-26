import type { Locale } from "@/lib/i18n";

export type UvLevel = "low" | "moderate" | "high" | "veryHigh" | "extreme";

export type UvAdvice = {
  level: UvLevel;
  /** Rounded index for display */
  index: number;
  /** Short level label key suffix after uvLevel */
  labelKey: `uvLevel${"Low" | "Moderate" | "High" | "VeryHigh" | "Extreme"}`;
  /** Protection copy key */
  adviceKey: `uvAdvice${"Low" | "Moderate" | "High" | "VeryHigh" | "Extreme"}`;
};

export function uvLevel(index: number): UvLevel {
  const n = Number.isFinite(index) ? index : 0;
  if (n < 3) return "low";
  if (n < 6) return "moderate";
  if (n < 8) return "high";
  if (n < 11) return "veryHigh";
  return "extreme";
}

export function uvAdvice(index: number): UvAdvice {
  const level = uvLevel(index);
  const rounded = Math.round(Math.max(0, index) * 10) / 10;
  switch (level) {
    case "low":
      return {
        level,
        index: rounded,
        labelKey: "uvLevelLow",
        adviceKey: "uvAdviceLow",
      };
    case "moderate":
      return {
        level,
        index: rounded,
        labelKey: "uvLevelModerate",
        adviceKey: "uvAdviceModerate",
      };
    case "high":
      return {
        level,
        index: rounded,
        labelKey: "uvLevelHigh",
        adviceKey: "uvAdviceHigh",
      };
    case "veryHigh":
      return {
        level,
        index: rounded,
        labelKey: "uvLevelVeryHigh",
        adviceKey: "uvAdviceVeryHigh",
      };
    default:
      return {
        level,
        index: rounded,
        labelKey: "uvLevelExtreme",
        adviceKey: "uvAdviceExtreme",
      };
  }
}

/** Tone class for UV chips */
export function uvToneClass(level: UvLevel): string {
  switch (level) {
    case "low":
      return "text-muted";
    case "moderate":
      return "text-warn";
    case "high":
      return "text-accent";
    case "veryHigh":
      return "text-rain";
    case "extreme":
      return "text-fg";
  }
}

// silence unused if tree-shaken
void (null as unknown as Locale);
