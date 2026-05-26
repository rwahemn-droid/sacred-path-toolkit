import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

export type Madhab = "shafi" | "hanafi";

export type Settings = {
  lang: Lang;
  cityId: string;
  madhab: Madhab;
};

const KEY = "ibadah:settings";

const DEFAULTS: Settings = { lang: "ku", cityId: "hawler", madhab: "shafi" };

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

// Simple subscribable store so all components stay in sync.
let current: Settings = DEFAULTS;
const listeners = new Set<(s: Settings) => void>();

if (typeof window !== "undefined") {
  current = read();
}

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
  const [s, setS] = useState<Settings>(current);
  useEffect(() => {
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
