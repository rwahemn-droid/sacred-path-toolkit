import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Flame, Check, Trash2 } from "lucide-react";
import { MORE } from "@/lib/more-i18n";
import type { Lang, Dict } from "@/lib/i18n";

const KU_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toLocaleDigits = (n: number | string, lang: Lang) =>
  lang === "en" || lang === "kmr" ? String(n) : String(n).replace(/\d/g, (d) => KU_DIGITS[+d]);

type Habit = { id: string; name: string; done: string[] }; // done: YYYY-MM-DD entries

const STORE = "ibadah:habits";
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

function computeStreak(done: string[]): number {
  const set = new Set(done);
  let streak = 0;
  let d = new Date();
  while (set.has(dayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function weekDays(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    out.push({ key: dayKey(nd), label: nd.toLocaleDateString("en", { weekday: "narrow" }) });
  }
  return out;
}

export function HabitTracker({ lang, t, onBack }: { lang: Lang; t: Dict; onBack: () => void }) {
  const m = MORE[lang].habits;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        setHabits(JSON.parse(raw));
      } else {
        // seed with presets
        const seeded: Habit[] = [
          { id: "fajr", name: m.presets.fajr, done: [] },
          { id: "quran", name: m.presets.quran, done: [] },
          { id: "dhikr", name: m.presets.dhikr, done: [] },
        ];
        setHabits(seeded);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(habits)); } catch {}
  }, [habits]);

  const today = dayKey();
  const week = useMemo(weekDays, []);

  const add = () => {
    const name = input.trim();
    if (!name) return;
    setHabits((h) => [...h, { id: Math.random().toString(36).slice(2), name, done: [] }]);
    setInput("");
  };
  const toggle = (id: string) => {
    setHabits((hs) =>
      hs.map((h) => {
        if (h.id !== id) return h;
        const has = h.done.includes(today);
        return { ...h, done: has ? h.done.filter((d) => d !== today) : [...h.done, today].sort() };
      }),
    );
  };
  const remove = (id: string) => setHabits((hs) => hs.filter((h) => h.id !== id));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
        <ArrowLeft className="h-4 w-4" /> {t.quran.back}
      </button>

      <div className="rounded-3xl border p-6 mb-4 backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <h2 className="text-lg font-semibold">{m.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{m.subtitle}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={m.placeholder}
          className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none backdrop-blur-xl focus:border-primary"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        />
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium text-primary-foreground"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Plus className="h-4 w-4" /> {m.add}
        </button>
      </div>

      {habits.length === 0 && <p className="text-center text-sm text-muted-foreground">{m.empty}</p>}

      <div className="space-y-3">
        {habits.map((h) => {
          const streak = computeStreak(h.done);
          const doneToday = h.done.includes(today);
          const doneSet = new Set(h.done);
          return (
            <div key={h.id} className="rounded-2xl border p-4 backdrop-blur-xl"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(h.id)}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition ${
                    doneToday ? "text-primary-foreground border-transparent" : "border-primary/40 text-primary/60"
                  }`}
                  style={doneToday ? { background: "var(--gradient-gold)" } : undefined}
                  aria-label="toggle"
                >
                  <Check className="h-4.5 w-4.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-primary" />
                    <span className="tabular-nums">{toLocaleDigits(streak, lang)}</span> {m.streak}
                  </p>
                </div>
                <button onClick={() => remove(h.id)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1.5">
                {week.map((d) => {
                  const active = doneSet.has(d.key);
                  return (
                    <div key={d.key} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-6 w-full rounded-md ${active ? "" : "bg-foreground/5"}`}
                        style={active ? { background: "var(--gradient-gold)" } : undefined}
                      />
                      <span className="text-[9px] text-muted-foreground">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
