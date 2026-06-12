import { useEffect, useState } from "react";

export type Stats = {
  listeningSec: number; // total seconds listened
  streak: number;       // consecutive days
  lastActive: string;   // YYYY-MM-DD
};

const KEY = "ibadah:stats";

const DEFAULTS: Stats = { listeningSec: 0, streak: 0, lastActive: "" };

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

function ymd(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function bumpListening(seconds: number) {
  if (seconds <= 0) return;
  write({ ...current, listeningSec: current.listeningSec + Math.round(seconds) });
}

export function markActive() {
  const today = ymd();
  if (current.lastActive === today) return;
  const yesterday = ymd(new Date(Date.now() - 86400000));
  const streak = current.lastActive === yesterday ? current.streak + 1 : 1;
  write({ ...current, streak, lastActive: today });
}

export function useStats(): Stats {
  const [s, setS] = useState<Stats>(current);
  useEffect(() => {
    setS(current);
    const fn = (n: Stats) => setS(n);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return s;
}
