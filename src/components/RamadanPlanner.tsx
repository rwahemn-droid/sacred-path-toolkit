import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Moon, Star } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type DayLog = { fasted: boolean; taraweeh: boolean; quran: number; sadaqah: boolean };
const empty: DayLog = { fasted: false, taraweeh: false, quran: 0, sadaqah: false };

export function RamadanPlanner({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const BackIcon = lang === "ar" || lang === "ku" ? ArrowRight : ArrowLeft;
  const KEY = "ramadan:planner";
  const [days, setDays] = useState<DayLog[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const arr = JSON.parse(raw) as DayLog[];
        if (Array.isArray(arr) && arr.length === 30) return arr;
      }
    } catch { /* */ }
    return Array.from({ length: 30 }, () => ({ ...empty }));
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(days)); } catch { /* */ }
  }, [days]);
  const [openDay, setOpenDay] = useState<number | null>(null);

  const stats = useMemo(() => {
    const fasted = days.filter((d) => d.fasted).length;
    const taraweeh = days.filter((d) => d.taraweeh).length;
    const quran = days.reduce((s, d) => s + (d.quran || 0), 0);
    const sadaqah = days.filter((d) => d.sadaqah).length;
    return { fasted, taraweeh, quran, sadaqah };
  }, [days]);

  const patch = (i: number, p: Partial<DayLog>) =>
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...p } : d)));

  const laylatCandidates = [21, 23, 25, 27, 29];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold flex-1">{L("پلانی ڕەمەزان", "خطة رمضان", "Ramadan Planner")}</h2>
        <Moon className="h-5 w-5 text-primary" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: L("ڕۆژوو", "صيام", "Fasts"), v: stats.fasted, max: 30 },
          { label: L("تراوێح", "تراويح", "Taraweeh"), v: stats.taraweeh, max: 30 },
          { label: L("جزء", "أجزاء", "Juz"), v: stats.quran, max: 30 },
          { label: L("سەدەقە", "صدقة", "Sadaqah"), v: stats.sadaqah, max: 30 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border p-3 backdrop-blur-xl text-center" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold tabular-nums">{s.v}<span className="text-xs text-muted-foreground">/{s.max}</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
        {days.map((d, i) => {
          const filled = d.fasted;
          const laylat = laylatCandidates.includes(i + 1);
          return (
            <button key={i} onClick={() => setOpenDay(i)}
              className="aspect-square rounded-xl border grid place-items-center text-sm font-semibold relative transition"
              style={{
                background: filled ? "var(--gradient-gold)" : "var(--glass-bg)",
                color: filled ? "var(--primary-foreground)" : undefined,
                borderColor: laylat ? "hsl(var(--primary))" : "var(--glass-border)",
              }}>
              {i + 1}
              {laylat && <Star className="absolute top-0.5 right-0.5 h-2.5 w-2.5" />}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        <Star className="inline h-3 w-3 me-1 text-primary" />
        {L("ڕۆژانی گومان لە لەیلەتولقەدر (فەرد)", "ليالي ليلة القدر الفردية", "Odd nights for Laylatul-Qadr")}
      </p>

      {openDay !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={() => setOpenDay(null)}>
          <div className="w-full max-w-sm rounded-3xl border p-5 backdrop-blur-xl space-y-3"
            style={{ background: "hsl(var(--background))", borderColor: "var(--glass-border)" }}
            onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-lg">{L("ڕۆژی", "يوم", "Day")} {openDay + 1}</p>
            {([
              ["fasted", L("ڕۆژووم گرت", "صمت اليوم", "I fasted")],
              ["taraweeh", L("تراوێح کرد", "صليت التراويح", "I prayed Taraweeh")],
              ["sadaqah", L("سەدەقەم دا", "تصدقت", "I gave sadaqah")],
            ] as const).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: "var(--glass-border)" }}>
                <span className="text-sm">{label}</span>
                <input type="checkbox" checked={!!days[openDay!][k]} onChange={(e) => patch(openDay!, { [k]: e.target.checked })} />
              </label>
            ))}
            <label className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: "var(--glass-border)" }}>
              <span className="text-sm">{L("جزء خوێندنەوە", "أجزاء القرآن", "Juz read")}</span>
              <input type="number" min={0} max={30} value={days[openDay!].quran}
                onChange={(e) => patch(openDay!, { quran: Math.max(0, Math.min(30, Number(e.target.value) || 0)) })}
                className="w-16 bg-transparent border rounded-lg px-2 py-1 text-end tabular-nums"
                style={{ borderColor: "var(--glass-border)" }} />
            </label>
            <button onClick={() => setOpenDay(null)} className="w-full py-2.5 rounded-xl text-primary-foreground" style={{ background: "var(--gradient-gold)" }}>
              {L("داخستن", "تم", "Done")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
