import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

export type Madhab = "shafi" | "hanafi";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type Theme = "dark" | "sepia";

export type Settings = {
  lang: Lang;
  cityId: string;
  madhab: Madhab;
  fontSize: FontSize;
  theme: Theme;
  kidsMode: boolean;
};

const KEY = "ibadah:settings";

const DEFAULTS: Settings = {
  lang: "ku",
  cityId: "hawler",
  madhab: "shafi",
  fontSize: "md",
  theme: "dark",
  kidsMode: false,
};

function read(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

let current: Settings = DEFAULTS;
const listeners = new Set<(s: Settings) => void>();

function write(next: Settings) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(next));
}

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  // Start with DEFAULTS so SSR and first client render match, then sync from localStorage on mount.
  const [s, setS] = useState<Settings>(DEFAULTS);
  useEffect(() => {
    current = read();
    setS(current);
    const fn = (n: Settings) => setS(n);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  const update = (patch: Partial<Settings>) => write({ ...current, ...patch });
  return [s, update];
}

export const FONT_SIZE_PX: Record<FontSize, number> = {
  sm: 18,
  md: 24,
  lg: 30,
  xl: 38,
};

export const ARABIC_FONT_CSS =
  "'Amiri Quran', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif";
