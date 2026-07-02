import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Moon, Star } from "lucide-react";
import { MORE } from "@/lib/more-i18n";
import type { Lang, Dict } from "@/lib/i18n";

const KU_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toLocaleDigits = (n: number | string, lang: Lang) =>
  lang === "en" || lang === "kmr" ? String(n) : String(n).replace(/\d/g, (d) => KU_DIGITS[+d]);

type Event = {
  key: keyof ReturnType<typeof labels>;
  hMonth: number; // 1-12 Hijri month
  hDay: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const EVENTS: Event[] = [
  { key: "ramadan", hMonth: 9, hDay: 1, icon: Moon, color: "linear-gradient(135deg,#0ea5a3,#14b8a6)" },
  { key: "eidFitr", hMonth: 10, hDay: 1, icon: Star, color: "linear-gradient(135deg,#f59e0b,#f97316)" },
  { key: "eidAdha", hMonth: 12, hDay: 10, icon: Star, color: "linear-gradient(135deg,#dc2626,#f59e0b)" },
  { key: "hijriNewYear", hMonth: 1, hDay: 1, icon: CalendarDays, color: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
  { key: "ashura", hMonth: 1, hDay: 10, icon: Moon, color: "linear-gradient(135deg,#0f766e,#0ea5a3)" },
  { key: "mawlid", hMonth: 3, hDay: 12, icon: Star, color: "linear-gradient(135deg,#059669,#10b981)" },
];

function labels() {
  return { ramadan: 0, eidFitr: 0, eidAdha: 0, hijriNewYear: 0, ashura: 0, mawlid: 0 };
}

async function hijriToGregorian(day: number, month: number, year: number) {
  const url = `https://api.aladhan.com/v1/hToG/${day}-${month}-${year}`;
  const res = await fetch(url);
  const json = await res.json();
  const g = json?.data?.gregorian;
  if (!g) return null;
  const [d, mo, y] = g.date.split("-").map(Number);
  return new Date(y, mo - 1, d);
}

async function getHijriToday(): Promise<{ day: number; month: number; year: number } | null> {
  const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${new Date().toISOString().slice(0, 10).split("-").reverse().join("-")}`);
  const json = await res.json();
  const h = json?.data?.hijri;
  if (!h) return null;
  return { day: parseInt(h.day, 10), month: parseInt(h.month.number, 10), year: parseInt(h.year, 10) };
}

export function IslamicEvents({ lang, t, onBack }: { lang: Lang; t: Dict; onBack: () => void }) {
  const m = MORE[lang].events;
  const [items, setItems] = useState<{ key: Event["key"]; date: Date; days: number }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const h = await getHijriToday();
        if (!h) throw new Error("hijri");
        const results: { key: Event["key"]; date: Date; days: number }[] = [];
        for (const ev of EVENTS) {
          // Try current hijri year first, then next if passed
          let g = await hijriToGregorian(ev.hDay, ev.hMonth, h.year);
          if (!g || g.getTime() < today.getTime()) {
            g = await hijriToGregorian(ev.hDay, ev.hMonth, h.year + 1);
          }
          if (g) {
            const diff = Math.round((g.getTime() - today.getTime()) / 86400000);
            results.push({ key: ev.key, date: g, days: diff });
          }
        }
        if (!cancelled) setItems(results.sort((a, b) => a.days - b.days));
      } catch {
        if (!cancelled) setErr("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
        <ArrowLeft className="h-4 w-4" /> {t.quran.back}
      </button>

      <div className="rounded-3xl border p-6 mb-4 text-center backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <h2 className="text-lg font-semibold">{m.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{m.subtitle}</p>
      </div>

      {!items && !err && <p className="text-center text-sm text-muted-foreground">{t.quran.loading}</p>}
      {err && <p className="text-center text-sm text-destructive">{t.quran.error}</p>}

      <div className="space-y-3">
        {items?.map((it) => {
          const ev = EVENTS.find((e) => e.key === it.key)!;
          const Icon = ev.icon;
          const isToday = it.days === 0;
          return (
            <div key={it.key} className="rounded-2xl border p-4 backdrop-blur-xl flex items-center gap-4"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground" style={{ background: ev.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{m[it.key]}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {it.date.toLocaleDateString(lang === "ar" ? "ar" : lang === "en" || lang === "kmr" ? "en-GB" : "ar", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="text-end">
                {isToday ? (
                  <p className="text-sm font-semibold text-primary">{m.today}</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold tabular-nums text-primary">{toLocaleDigits(it.days, lang)}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">{m.daysLeft}</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
