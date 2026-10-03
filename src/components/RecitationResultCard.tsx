import { useEffect, useRef } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import type { RecitationResult, WordStatus } from "@/lib/recitation-check";

type L = Record<"ku" | "bad" | "kmr" | "ar" | "en", string>;
const T = {
  accuracy: { ku: "وردی", bad: "دروستی", kmr: "Rastî", ar: "الدقة", en: "Accuracy" },
  correct: { ku: "ڕاست", bad: "دروست", kmr: "Rast", ar: "صحيح", en: "Correct" },
  wrong: { ku: "هەڵە", bad: "خەلەت", kmr: "Şaş", ar: "أخطاء", en: "Mistakes" },
  missing: { ku: "بەجێماو", bad: "مایی", kmr: "Kêm", ar: "ناقص", en: "Missing" },
  extra: { ku: "زیادە", bad: "زێدە", kmr: "Zêde", ar: "زائد", en: "Extra" },
  again: { ku: "دووبارە هەوڵبدەرەوە", bad: "دووبارە بکە", kmr: "Dîsa biceribîne", ar: "حاول مرة أخرى", en: "Try Again" },
  listen: { ku: "گوێگرتن لە خوێندنەوەی ڕاست", bad: "گوهداریا خواندنا دروست", kmr: "Xwendina rast guhdar bike", ar: "استمع للتلاوة الصحيحة", en: "Listen to Correct Recitation" },
  best: { ku: "باشترین", bad: "باشترین", kmr: "Çêtirîn", ar: "الأفضل", en: "Best" },
} satisfies Record<string, L>;
const t = (l: L, lang: Lang) => l[(lang as keyof L)] ?? l.en;

const STYLE: Record<WordStatus, string> = {
  correct: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  wrong: "border-red-400/50 bg-red-500/15 text-red-200",
  missing: "border-amber-400/50 bg-amber-500/15 text-amber-200",
  extra: "border-sky-400/50 bg-sky-500/15 text-sky-200",
};

export function RecitationResultCard({ result, lang, best, onRetry, onListen }: {
  result: RecitationResult; lang: Lang; best?: number; onRetry: () => void; onListen: () => void;
}) {
  const firstErr = useRef<HTMLSpanElement | null>(null);
  const firstIdx = result.words.findIndex((w) => w.status !== "correct");
  useEffect(() => { firstErr.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [result]);

  const stats: [L, number, string][] = [
    [T.correct, result.correct, "text-emerald-300"],
    [T.wrong, result.wrong, "text-red-300"],
    [T.missing, result.missing, "text-amber-300"],
    [T.extra, result.extra, "text-sky-300"],
  ];

  return (
    <div className="rounded-3xl border border-sky-200/10 bg-white/[0.04] p-4 animate-in fade-in duration-300">
      <div dir="rtl" lang="ar" className="flex flex-wrap justify-center gap-1.5">
        {result.words.map((w, i) => (
          <span key={i} ref={i === firstIdx ? firstErr : undefined}
            className={`rounded-xl border px-2 py-1 font-amiri text-lg leading-snug ${STYLE[w.status]} ${i === firstIdx ? "ring-2 ring-offset-2 ring-offset-[#081225] ring-current animate-pulse" : ""}`}>
            {w.status === "extra" ? `+ ${w.heard}` : w.expected}
            {w.status === "wrong" && w.heard && <span className="ms-1 text-xs opacity-70">({w.heard})</span>}
            {w.status === "missing" && <span className="ms-1 text-xs">⚠️</span>}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3">
        <span className="text-xs text-white/60">{t(T.accuracy, lang)}{best != null && <> · {t(T.best, lang)} {best}%</>}</span>
        <span className={`text-2xl font-bold tabular-nums ${result.accuracy >= 90 ? "text-emerald-300" : result.accuracy >= 60 ? "text-amber-300" : "text-red-300"}`}>{result.accuracy}%</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2 text-center">
        {stats.map(([l, v, c], i) => (
          <div key={i} className="rounded-xl bg-white/[0.03] py-2">
            <div className={`text-lg font-semibold tabular-nums ${c}`}>{v}</div>
            <div className="truncate text-[10px] text-white/55">{t(l, lang)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={onRetry} className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-2 py-2.5 text-xs font-medium active:scale-95"><RotateCcw className="h-4 w-4" />{t(T.again, lang)}</button>
        <button onClick={onListen} className="flex items-center justify-center gap-1.5 rounded-2xl bg-sky-400/20 px-2 py-2.5 text-xs font-medium text-sky-100 active:scale-95"><Volume2 className="h-4 w-4 shrink-0" /><span className="truncate">{t(T.listen, lang)}</span></button>
      </div>
    </div>
  );
}
