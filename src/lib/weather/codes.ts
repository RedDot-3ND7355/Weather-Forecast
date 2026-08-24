import { t, type Locale } from "@/lib/i18n";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

export function weatherLabel(code: number, locale: Locale = "en"): string {
  if (code === 0) return t(locale, "wx0");
  if (code === 1) return t(locale, "wx1");
  if (code === 2) return t(locale, "wx2");
  if (code === 3) return t(locale, "wx3");
  if (code === 45 || code === 48) return t(locale, "wx45");
  if (code >= 51 && code <= 57) return t(locale, "wx51");
  if (code >= 61 && code <= 67) return t(locale, "wx61");
  if (code >= 71 && code <= 77) return t(locale, "wx71");
  if (code >= 80 && code <= 82) return t(locale, "wx80");
  if (code === 85 || code === 86) return t(locale, "wx85");
  if (code >= 95) return t(locale, "wx95");
  return t(locale, "wxMix");
}

export function weatherIcon(code: number, isDay: boolean): LucideIcon {
  if (code === 0) return isDay ? Sun : Moon;
  if (code === 1 || code === 2) return isDay ? CloudSun : Cloud;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code === 85 || code === 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}
