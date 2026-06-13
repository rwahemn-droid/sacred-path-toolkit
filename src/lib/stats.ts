import { useEffect, useState } from "react";

export type Stats = {
  listeningSec: number;
  streak: number;
  lastActive: string;
  // YYYY-MM-DD -> activity score (minutes listened or ayahs read).
  daily: Record<string, number>;
};

const KEY = "ibadah:stats";

const DEFAULTS: Stats = { listeningSec: 0, streak: 0, lastActive: "", daily: {} };

function read(): Stats {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

let current: Stats = DEFAULTS;
const listeners = new Set<(s: Stats) => void>();

if (typeof window !== "undefined") current = read();

function write(next: Stats) {
  current = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ }
  listeners.forEach((l) => l(next));
}

export function ymd(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function bumpListening(seconds: number) {
  if (seconds <= 0) return;
  const today = ymd();
  const daily = { ...current.daily };
  daily[today] = (daily[today] ?? 0) + Math.round(seconds);
  write({ ...current, listeningSec: current.listeningSec + Math.round(seconds), daily });
}

export function markActive() {
  const today = ymd();
  if (current.lastActive === today) return;
  const yesterday = ymd(new Date(Date.now() - 86400000));
  const streak = current.lastActive === yesterday ? current.streak + 1 : 1;
  const daily = { ...current.daily };
  if (!daily[today]) daily[today] = 1;
  write({ ...current, streak, lastActive: today, daily });
}

export function useStats(): Stats {
  const [s, setS] = useState<Stats>(DEFAULTS);
  useEffect(() => {
    // Read on mount to avoid SSR/CSR hydration mismatches.
    setS(read());
    const fn = (n: Stats) => setS(n);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return s;
}

/** Last `days` days of activity, oldest → newest. */
export function lastDaysActivity(stats: Stats, days = 35) {
  const out: { date: string; value: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = ymd(d);
    out.push({ date: k, value: stats.daily[k] ?? 0 });
  }
  return out;
}
