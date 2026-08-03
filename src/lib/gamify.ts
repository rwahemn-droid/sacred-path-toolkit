import { useEffect, useState } from "react";

export type Gamify = {
  xp: number;
  badges: string[];
  days: string[]; // ISO days with any activity
  counters: {
    ayahsRead: number;
    dhikrCount: number;
    prayersLogged: number;
    hadithRead: number;
  };
};

const KEY = "ibadah:gamify";

const DEFAULTS: Gamify = {
  xp: 0,
  badges: [],
  days: [],
  counters: { ayahsRead: 0, dhikrCount: 0, prayersLogged: 0, hadithRead: 0 },
};

function read(): Gamify {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw);
    return { ...DEFAULTS, ...p, counters: { ...DEFAULTS.counters, ...(p.counters ?? {}) } };
  } catch {
    return DEFAULTS;
  }
}

let current: Gamify = DEFAULTS;
const listeners = new Set<(g: Gamify) => void>();
if (typeof window !== "undefined") current = read();

function write(next: Gamify) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(next));
}

function ymd(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const BADGES: { id: string; xp: number; ku: string; ar: string; en: string; icon: string }[] = [
  { id: "first-step", xp: 10, ku: "یەکەم هەنگاو", ar: "الخطوة الأولى", en: "First Step", icon: "🌱" },
  { id: "reader", xp: 200, ku: "خوێنەر", ar: "قارئ", en: "Reader", icon: "📖" },
  { id: "devoted", xp: 600, ku: "دڵسۆز", ar: "مخلص", en: "Devoted", icon: "🕌" },
  { id: "hafiz-path", xp: 1500, ku: "ڕێگای حیفز", ar: "طريق الحفظ", en: "Path of Hifz", icon: "🧠" },
  { id: "light", xp: 3000, ku: "ڕووناکی", ar: "نور", en: "Light", icon: "✨" },
  { id: "streak-7", xp: 0, ku: "٧ ڕۆژ بەردەوام", ar: "٧ أيام متتالية", en: "7-day streak", icon: "🔥" },
  { id: "streak-30", xp: 0, ku: "٣٠ ڕۆژ بەردەوام", ar: "٣٠ يوماً متتالياً", en: "30-day streak", icon: "🏆" },
];

/** Level curve: each level needs 100 more XP than the previous. */
export function levelFromXp(xp: number) {
  let level = 1;
  let need = 100;
  let acc = 0;
  while (xp >= acc + need) {
    acc += need;
    level++;
    need += 100;
  }
  return { level, into: xp - acc, need, pct: Math.round(((xp - acc) / need) * 100) };
}

export function streakOf(days: string[]) {
  const set = new Set(days);
  let streak = 0;
  const cur = new Date();
  if (!set.has(ymd(cur))) cur.setDate(cur.getDate() - 1);
  while (set.has(ymd(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

function recomputeBadges(g: Gamify): Gamify {
  const badges = new Set(g.badges);
  for (const b of BADGES) if (b.xp > 0 && g.xp >= b.xp) badges.add(b.id);
  const s = streakOf(g.days);
  if (s >= 7) badges.add("streak-7");
  if (s >= 30) badges.add("streak-30");
  return { ...g, badges: [...badges] };
}

/** Award XP and mark today active. */
export function awardXp(amount: number, counter?: keyof Gamify["counters"], by = 1) {
  const today = ymd();
  const days = current.days.includes(today) ? current.days : [...current.days, today];
  const counters = counter
    ? { ...current.counters, [counter]: current.counters[counter] + by }
    : current.counters;
  write(recomputeBadges({ ...current, xp: current.xp + amount, days, counters }));
}

export function useGamify(): Gamify {
  const [g, setG] = useState<Gamify>(current);
  useEffect(() => {
    setG(current);
    const fn = (n: Gamify) => setG(n);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return g;
}
