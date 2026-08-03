// Hadith categories + bookmarks (client-side).
import { useEffect, useState } from "react";
import { HADITHS, type Hadith } from "./hadith";

export type CatId = "prayer" | "fasting" | "ethics" | "family" | "faith";

export const CATEGORIES: { id: CatId; ku: string; ar: string; en: string; icon: string }[] = [
  { id: "faith", ku: "ئیمان", ar: "الإيمان", en: "Faith", icon: "🕋" },
  { id: "prayer", ku: "نوێژ", ar: "الصلاة", en: "Prayer", icon: "🕌" },
  { id: "fasting", ku: "ڕۆژوو", ar: "الصيام", en: "Fasting", icon: "🌙" },
  { id: "ethics", ku: "ئەخلاق", ar: "الأخلاق", en: "Ethics", icon: "✨" },
  { id: "family", ku: "خێزان", ar: "الأسرة", en: "Family", icon: "👨‍👩‍👧" },
];

const KEYWORDS: Record<CatId, string[]> = {
  faith: ["إيمان", "الإسلام", "الله", "توحيد", "شهد", "قدر", "إحسان"],
  prayer: ["الصلاة", "صلاة", "الطهور", "وضوء", "المسجد", "سجد"],
  fasting: ["الصيام", "صام", "رمضان", "أفطر", "صوم"],
  ethics: ["الصدق", "الكذب", "حسن", "الخلق", "يعنيه", "لسان", "غضب", "الحياء"],
  family: ["والد", "أم", "أهل", "الرحم", "زوج", "ولد", "أخي", "لأخيه", "جار"],
};

/** Best-effort categorisation of the curated hadith set. */
export function hadithsByCategory(cat: CatId): Hadith[] {
  const keys = KEYWORDS[cat];
  return HADITHS.filter((h) => keys.some((k) => h.ar.includes(k)));
}

const BM_KEY = "ibadah:hadith:bookmarks";

export type HadithBookmark = {
  key: string;
  ar: string;
  ku?: string;
  ref: string;
};

function read(): HadithBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BM_KEY) || "[]") as HadithBookmark[];
  } catch {
    return [];
  }
}

let current: HadithBookmark[] = [];
const listeners = new Set<(b: HadithBookmark[]) => void>();
if (typeof window !== "undefined") current = read();

function write(next: HadithBookmark[]) {
  current = next;
  try {
    localStorage.setItem(BM_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(next));
}

export function toggleHadithBookmark(b: HadithBookmark) {
  write(current.some((x) => x.key === b.key) ? current.filter((x) => x.key !== b.key) : [...current, b]);
}

export function useHadithBookmarks(): HadithBookmark[] {
  const [b, setB] = useState<HadithBookmark[]>(current);
  useEffect(() => {
    setB(current);
    const fn = (n: HadithBookmark[]) => setB(n);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return b;
}
