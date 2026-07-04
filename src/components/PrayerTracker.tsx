import { useMemo, useState } from "react";
import { ArrowLeft, Check, X, Flame } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type Prayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
const PRAYERS: Prayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const LABELS: Record<Lang, Record<Prayer, string>> = {
  ku:  { fajr: "بەیانی", dhuhr: "نیوەڕۆ", asr: "عەسر", maghrib: "مەغریب", isha: "عیشا" },
  bad: { fajr: "بەیانی", dhuhr: "نیوەڕۆ", asr: "عەسر", maghrib: "مەغریب", isha: "عیشا" },
  ar:  { fajr: "الفجر",   dhuhr: "الظهر",  asr: "العصر", maghrib: "المغرب", isha: "العشاء" },
  en:  { fajr: "Fajr",   dhuhr: "Dhuhr",  asr: "Asr",   maghrib: "Maghrib", isha: "Isha" },
  kmr: { fajr: "Fecr",   dhuhr: "Zuhr",   asr: "Asr",   maghrib: "Meẍrib",  isha: "Îşa" },
};

const KEY = "ibadah:prayer-log"; // { [YYYY-MM-DD]: { fajr: bool, ... } }
type Log = Record<string, Partial<Record<Prayer, boolean>>>;

function loadLog(): Log {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function saveLog(l: Log) { localStorage.setItem(KEY, JSON.stringify(l)); }
function todayKey() { return new Date().toISOString().slice(0, 10); }

export function PrayerTracker({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [log, setLog] = useState<Log>(loadLog);
  const today = todayKey();
  const todayLog = log[today] || {};

  const toggle = (p: Prayer) => {
    const next = { ...log, [today]: { ...todayLog, [p]: !todayLog[p] } };
    setLog(next); saveLog(next);
  };

  // last 7 days
  const week = useMemo(() => {
    const arr: { key: string; label: string; done: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const l = log[k] || {};
      const done = PRAYERS.filter((p) => l[p]).length;
      arr.push({ key: k, label: String(d.getDate()), done });
    }
    return arr;
  }, [log]);

  // streak: consecutive days with 5/5
  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const l = log[k] || {};
      if (PRAYERS.every((p) => l[p])) s++;
      else if (i > 0) break;
      else break;
    }
    return s;
  }, [log]);

  const doneToday = PRAYERS.filter((p) => todayLog[p]).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">
          {lang === "ar" ? "متتبع الصلوات" : lang === "en" ? "Prayer Tracker" : "شوێنپێی نوێژ"}
        </h2>
      </div>

      <div className="rounded-3xl border p-5 backdrop-blur-xl text-center"
        style={{ background: "var(--gradient-teal)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs text-primary-foreground/80">{lang === "ar" ? "اليوم" : lang === "en" ? "Today" : "ئەمڕۆ"}</p>
        <p className="text-4xl font-bold text-primary-foreground mt-1">{doneToday}/5</p>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-primary-foreground/90 text-sm">
          <Flame className="h-4 w-4" /> {streak} {lang === "ar" ? "يوم متتالٍ" : lang === "en" ? "day streak" : "ڕۆژ بەردەوام"}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PRAYERS.map((p) => {
          const on = !!todayLog[p];
          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              className={`rounded-2xl border p-3 backdrop-blur-xl transition ${on ? "border-primary" : ""}`}
              style={{ background: on ? "color-mix(in oklab, var(--primary) 15%, transparent)" : "var(--glass-bg)", borderColor: on ? "var(--primary)" : "var(--glass-border)" }}
            >
              <div className="grid place-items-center mb-1">
                {on ? <Check className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-muted-foreground/50" />}
              </div>
              <p className="text-[10px] text-center truncate">{LABELS[lang][p]}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border p-4 backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs text-muted-foreground mb-3">
          {lang === "ar" ? "آخر ٧ أيام" : lang === "en" ? "Last 7 days" : "٧ ڕۆژی ڕابردوو"}
        </p>
        <div className="grid grid-cols-7 gap-2">
          {week.map((d) => (
            <div key={d.key} className="text-center">
              <div className="mx-auto h-10 w-10 rounded-xl grid place-items-center text-xs font-medium"
                style={{ background: d.done === 5 ? "var(--gradient-teal)" : d.done > 0 ? "color-mix(in oklab, var(--primary) 25%, transparent)" : "var(--glass-bg)", color: d.done === 5 ? "var(--primary-foreground)" : undefined }}>
                {d.done}
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">{d.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
