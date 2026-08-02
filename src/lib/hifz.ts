export type PlanDay = {
  key: string;
  from: number;
  to: number;
  date: string; // ISO yyyy-mm-dd target date
  done: boolean;
  doneAt?: string;
};

export type Revision = {
  key: string;
  from: number;
  to: number;
  stage: number; // spaced-repetition stage index
  due: string;
};

export type HifzState = {
  surah: number;
  surahName: string;
  perDay: number;
  plan: PlanDay[];
  revisions: Revision[];
  revisionCount: number;
  history: string[]; // ISO days with activity
};

const KEY = "ibadah:hifz";

export const EMPTY: HifzState = {
  surah: 0,
  surahName: "",
  perDay: 5,
  plan: [],
  revisions: [],
  revisionCount: 0,
  history: [],
};

/** Spaced-repetition intervals in days. */
const INTERVALS = [1, 3, 7, 14, 30, 60];

export function todayISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(days: number, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export function loadHifz(): HifzState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function saveHifz(s: HifzState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function buildPlan(
  state: HifzState,
  cfg: { surah: number; name: string; ayahs: number; perDay: number },
): HifzState {
  const plan: PlanDay[] = [];
  let day = 0;
  for (let from = 1; from <= cfg.ayahs; from += cfg.perDay) {
    const to = Math.min(from + cfg.perDay - 1, cfg.ayahs);
    plan.push({ key: `${cfg.surah}:${from}-${to}`, from, to, date: addDays(day), done: false });
    day++;
  }
  return { ...state, surah: cfg.surah, surahName: cfg.name, perDay: cfg.perDay, plan, revisions: [] };
}

export function markMemorized(state: HifzState, index: number): HifzState {
  const plan = state.plan.map((p, i) =>
    i === index ? { ...p, done: !p.done, doneAt: !p.done ? todayISO() : undefined } : p,
  );
  const entry = plan[index];
  if (!entry) return { ...state, plan };

  let revisions = state.revisions;
  if (entry.done) {
    revisions = revisions.some((r) => r.key === entry.key)
      ? revisions
      : [...revisions, { key: entry.key, from: entry.from, to: entry.to, stage: 0, due: addDays(INTERVALS[0]!) }];
  } else {
    revisions = revisions.filter((r) => r.key !== entry.key);
  }

  const today = todayISO();
  const history = state.history.includes(today) ? state.history : [...state.history, today];
  return { ...state, plan, revisions, history };
}

export function dueRevisions(state: HifzState): Revision[] {
  const today = todayISO();
  return state.revisions.filter((r) => r.due <= today).sort((a, b) => a.from - b.from);
}

export function markRevised(state: HifzState, key: string): HifzState {
  const revisions = state.revisions.map((r) => {
    if (r.key !== key) return r;
    const stage = Math.min(r.stage + 1, INTERVALS.length - 1);
    return { ...r, stage, due: addDays(INTERVALS[stage]!) };
  });
  const today = todayISO();
  const history = state.history.includes(today) ? state.history : [...state.history, today];
  return { ...state, revisions, revisionCount: state.revisionCount + 1, history };
}

export function hifzStats(state: HifzState) {
  const doneDays = state.plan.filter((p) => p.done);
  const ayahs = doneDays.reduce((acc, p) => acc + (p.to - p.from + 1), 0);
  const pct = state.plan.length ? Math.round((doneDays.length / state.plan.length) * 100) : 0;

  const days = new Set(state.history);
  let streak = 0;
  const cursor = new Date();
  // allow the streak to start yesterday if today has no activity yet
  if (!days.has(todayISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(todayISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { ayahs, days: doneDays.length, pct, streak, revisions: state.revisionCount };
}
