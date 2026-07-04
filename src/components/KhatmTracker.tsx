import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, RotateCcw } from "lucide-react";
import type { Lang, Dict } from "@/lib/i18n";
void 0 as unknown as Dict;

import type { Lang } from "@/lib/i18n";

const KEY = "ibadah:khatm"; // { juz: bool[30], startedAt: iso }
type State = { juz: boolean[]; startedAt: string };

function load(): State {
  if (typeof window === "undefined") return { juz: Array(30).fill(false), startedAt: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {/**/}
  return { juz: Array(30).fill(false), startedAt: new Date().toISOString() };
}
function save(s: State) { localStorage.setItem(KEY, JSON.stringify(s)); }

export function KhatmTracker({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [state, setState] = useState<State>(load);
  const done = state.juz.filter(Boolean).length;
  const pct = Math.round((done / 30) * 100);

  const toggle = (i: number) => {
    const juz = [...state.juz]; juz[i] = !juz[i];
    const next = { ...state, juz };
    setState(next); save(next);
  };

  const reset = () => {
    const next = { juz: Array(30).fill(false), startedAt: new Date().toISOString() };
    setState(next); save(next);
  };

  const daysSince = useMemo(() => {
    const d = Math.max(1, Math.round((Date.now() - new Date(state.startedAt).getTime()) / 86400000));
    return d;
  }, [state.startedAt]);

  const eta = done > 0 ? Math.round((daysSince / done) * (30 - done)) : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold flex-1">
          {lang === "ar" ? "متتبع الختمة" : lang === "en" ? "Khatmah Tracker" : "شوێنپێی خەتم"}
        </h2>
        <button onClick={reset} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5" title="Reset">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-3xl border p-5 backdrop-blur-xl text-center"
        style={{ background: "var(--gradient-gold)" }}>
        <BookOpen className="h-8 w-8 mx-auto text-primary-foreground/90" />
        <p className="text-5xl font-bold text-primary-foreground mt-2">{done}<span className="text-2xl opacity-70">/30</span></p>
        <p className="text-sm text-primary-foreground/90 mt-1">{pct}%</p>
        <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
        {eta !== null && (
          <p className="text-[11px] text-primary-foreground/80 mt-3">
            {lang === "ar" ? `متبقٍ ~${eta} يوم` : lang === "en" ? `~${eta} days remaining` : `~${eta} ڕۆژ ماوە`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {state.juz.map((v, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="aspect-square rounded-2xl border backdrop-blur-xl text-sm font-semibold transition"
            style={{
              background: v ? "var(--gradient-teal)" : "var(--glass-bg)",
              color: v ? "var(--primary-foreground)" : undefined,
              borderColor: "var(--glass-border)",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-center text-muted-foreground">
        {lang === "ar" ? "اضغط على الجزء لتمييزه" : lang === "en" ? "Tap a juz to mark it complete" : "کلیک لە جزء بکە بۆ ئاسانکاری"}
      </p>
    </div>
  );
}
