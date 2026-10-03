// Word-level Quran recitation checker (v1).
// Modular: future audio/Tajweed analysers can add extra fields to RecitationResult.

export type WordStatus = "correct" | "wrong" | "missing" | "extra";

export type WordResult = {
  status: WordStatus;
  expected?: string; // original Quran word (display, unmodified)
  heard?: string; // what the user said
};

export type RecitationResult = {
  key: string; // "surah:ayah"
  words: WordResult[];
  correct: number;
  wrong: number;
  missing: number;
  extra: number;
  accuracy: number; // 0-100, based on expected words
  at: number;
};

/** Normalise Arabic for comparison only — never used for display. */
export function normalizeWord(s: string) {
  return s
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "") // harakat, Quranic marks, tatweel
    .replace(/[إأآٱا]/g, "ا")
    .replace(/[ىيۦ]/g, "ي")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
}

export function splitWords(text: string) {
  return text.split(/\s+/).filter((w) => normalizeWord(w).length > 0);
}

/** Align expected vs heard words with edit distance (substitution = wrong word). */
export function compareRecitation(key: string, expectedText: string, heardText: string): RecitationResult {
  const exp = splitWords(expectedText);
  const heard = splitWords(heardText);
  const e = exp.map(normalizeWord);
  const h = heard.map(normalizeWord);
  const n = e.length, m = h.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j - 1] + (e[i - 1] === h[j - 1] ? 0 : 1), d[i - 1][j] + 1, d[i][j - 1] + 1);

  const words: WordResult[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (e[i - 1] === h[j - 1] ? 0 : 1)) {
      words.push({ status: e[i - 1] === h[j - 1] ? "correct" : "wrong", expected: exp[i - 1], heard: heard[j - 1] });
      i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      words.push({ status: "missing", expected: exp[i - 1] });
      i--;
    } else {
      words.push({ status: "extra", heard: heard[j - 1] });
      j--;
    }
  }
  words.reverse();
  const count = (s: WordStatus) => words.filter((w) => w.status === s).length;
  const correct = count("correct");
  return {
    key, words, correct,
    wrong: count("wrong"), missing: count("missing"), extra: count("extra"),
    accuracy: n ? Math.round((correct / n) * 100) : 0,
    at: Date.now(),
  };
}

const STORE = "ibadah:recitation-results";

export function saveResult(r: RecitationResult) {
  try {
    const all = JSON.parse(localStorage.getItem(STORE) || "{}") as Record<string, Omit<RecitationResult, "words"> & { best: number; attempts: number }>;
    const prev = all[r.key];
    const { words: _w, ...summary } = r;
    all[r.key] = { ...summary, best: Math.max(prev?.best ?? 0, r.accuracy), attempts: (prev?.attempts ?? 0) + 1 };
    localStorage.setItem(STORE, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function getSavedResult(key: string) {
  try {
    return (JSON.parse(localStorage.getItem(STORE) || "{}") as Record<string, { best: number; attempts: number; accuracy: number }>)[key] ?? null;
  } catch { return null; }
}
