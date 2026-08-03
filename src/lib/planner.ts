import { useEffect, useState } from "react";

export type Period = "daily" | "weekly" | "monthly";
export type GoalKind = "quran" | "dhikr" | "prayer";

export type Goal = {
  id: string;
  kind: GoalKind;
  period: Period;
  target: number;
  progress: number;
  updated: string; // period bucket key it belongs to
};

const KEY = "ibadah:planner";

function bucket(period: Period, d = new Date()) {
  const y = d.getFullYear();
  if (period === "daily") return `${y}-${d.getMonth() + 1}-${d.getDate()}`;
  if (period === "monthly") return `${y}-${d.getMonth() + 1}`;
  const start = new Date(y, 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${y}-W${week}`;
}

const DEFAULT_GOALS: Goal[] = [
  { id: "q-d", kind: "quran", period: "daily", target: 10, progress: 0, updated: "" },
  { id: "d-d", kind: "dhikr", period: "daily", target: 100, progress: 0, updated: "" },
  { id: "p-d", kind: "prayer", period: "daily", target: 5, progress: 0, updated: "" },
  { id: "q-w", kind: "quran", period: "weekly", target: 100, progress: 0, updated: "" },
  { id: "q-m", kind: "quran", period: "monthly", target: 600, progress: 0, updated: "" },
];

function rollover(goals: Goal[]): Goal[] {
  return goals.map((g) => {
    const b = bucket(g.period);
    return g.updated === b ? g : { ...g, progress: 0, updated: b };
  });
}

function read(): Goal[] {
  if (typeof window === "undefined") return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem(KEY);
    return rollover(raw ? (JSON.parse(raw) as Goal[]) : DEFAULT_GOALS);
  } catch {
    return DEFAULT_GOALS;
  }
}

let current: Goal[] = DEFAULT_GOALS;
const listeners = new Set<(g: Goal[]) => void>();
if (typeof window !== "undefined") current = read();

function write(next: Goal[]) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(next));
}

/** Add progress to every goal of a kind (all periods). */
export function addProgress(kind: GoalKind, amount = 1) {
  write(rollover(current).map((g) => (g.kind === kind ? { ...g, progress: g.progress + amount } : g)));
}

export function setTarget(id: string, target: number) {
  write(current.map((g) => (g.id === id ? { ...g, target: Math.max(1, target) } : g)));
}

export function resetGoal(id: string) {
  write(current.map((g) => (g.id === id ? { ...g, progress: 0 } : g)));
}

export function usePlanner(): Goal[] {
  const [g, setG] = useState<Goal[]>(current);
  useEffect(() => {
    write(rollover(current));
    const fn = (n: Goal[]) => setG(n);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return g;
}
