import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import type { Dict, Lang } from "@/lib/i18n";

const KHATM_KEY = "ibadah:khatm";
const TOTAL_PAGES = 604; // Standard Madinah mushaf

type KhatmState = {
  startDate: string; // YYYY-MM-DD
  pagesPerDay: number;
  pagesRead: number;
};

const KU_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toDigits = (n: number | string, lang: Lang) =>
  lang === "en" || lang === "kmr" ? String(n) : String(n).replace(/\d/g, (d) => KU_DIGITS[+d]);

function read(): KhatmState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KHATM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function write(s: KhatmState | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KHATM_KEY, JSON.stringify(s));
  else localStorage.removeItem(KHATM_KEY);
}

export function KhatmTracker({ t, lang }: { t: Dict; lang: Lang }) {
  const [state, setState] = useState<KhatmState | null>(() => read());
  const [pagesPerDay, setPagesPerDay] = useState(20);

  useEffect(() => { write(state); }, [state]);

  const start = () => {
    setState({
      startDate: new Date().toISOString().slice(0, 10),
      pagesPerDay,
      pagesRead: 0,
    });
  };

  const addPages = (n: number) => {
    if (!state) return;
    setState({ ...state, pagesRead: Math.max(0, Math.min(TOTAL_PAGES, state.pagesRead + n)) });
  };

  const reset = () => setState(null);

  const progress = state ? Math.min(100, (state.pagesRead / TOTAL_PAGES) * 100) : 0;
  const daysElapsed = useMemo(() => {
    if (!state) return 0;
    const ms = Date.now() - new Date(state.startDate).getTime();
    return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)) + 1);
  }, [state]);
  const targetToday = state ? Math.min(TOTAL_PAGES, state.pagesPerDay * daysElapsed) : 0;
  const onTrack = state ? state.pagesRead >= targetToday : false;
  const daysToFinish = state ? Math.ceil((TOTAL_PAGES - state.pagesRead) / state.pagesPerDay) : 0;

  if (!state) {
    return (
      <div
        className="rounded-3xl border p-5 backdrop-blur-xl space-y-4"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      >
        <div>
          <h3 className="font-medium">{t.khatm.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t.khatm.intro}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">{t.khatm.pagesPerDay}</p>
          <div className="flex flex-wrap gap-2">
            {[2, 5, 10, 20, 30, 50].map((n) => (
              <button
                key={n}
                onClick={() => setPagesPerDay(n)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  pagesPerDay === n ? "text-primary-foreground" : "text-muted-foreground"
                }`}
                style={{
                  background: pagesPerDay === n ? "var(--gradient-gold)" : "transparent",
                  borderColor: pagesPerDay === n ? "transparent" : "var(--glass-border)",
                }}
              >
                {toDigits(n, lang)}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {t.khatm.estimate} ≈ {toDigits(Math.ceil(TOTAL_PAGES / pagesPerDay), lang)} {t.khatm.days}
          </p>
        </div>
        <button
          onClick={start}
          className="w-full py-3 rounded-xl font-medium"
          style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
        >
          {t.khatm.start}
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl border p-5 backdrop-blur-xl space-y-4"
      style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{t.khatm.title}</h3>
          <p className="text-[11px] text-muted-foreground">
            {t.khatm.startedOn} {state.startDate} · {toDigits(state.pagesPerDay, lang)} {t.khatm.pagesPerDayShort}
          </p>
        </div>
        <button onClick={reset} className="p-2 rounded-lg hover:bg-white/5" aria-label="reset">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="text-center">
        <p
          className="text-5xl font-bold tabular-nums"
          style={{ background: "var(--gradient-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {toDigits(state.pagesRead, lang)}
          <span className="text-xl text-muted-foreground"> / {toDigits(TOTAL_PAGES, lang)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{t.khatm.pages}</p>
      </div>

      <div className="h-2 rounded-full overflow-hidden" style={{ background: "color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "var(--gradient-gold)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border px-3 py-2" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[10px] text-muted-foreground">{t.khatm.target}</p>
          <p className={`text-sm font-semibold ${onTrack ? "text-primary" : "text-destructive"}`}>
            {onTrack && <Check className="inline h-3 w-3 me-1" />}
            {toDigits(targetToday, lang)}
          </p>
        </div>
        <div className="rounded-xl border px-3 py-2" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[10px] text-muted-foreground">{t.khatm.remaining}</p>
          <p className="text-sm font-semibold">{toDigits(daysToFinish, lang)} {t.khatm.days}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => addPages(-1)}
          className="h-10 w-10 rounded-xl border font-bold"
          style={{ borderColor: "var(--glass-border)" }}
        >
          −
        </button>
        <button
          onClick={() => addPages(state.pagesPerDay)}
          className="flex-1 py-3 rounded-xl font-medium"
          style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
        >
          +{toDigits(state.pagesPerDay, lang)} {t.khatm.markToday}
        </button>
        <button
          onClick={() => addPages(1)}
          className="h-10 w-10 rounded-xl border font-bold"
          style={{ borderColor: "var(--glass-border)" }}
        >
          +
        </button>
      </div>
    </div>
  );
}
