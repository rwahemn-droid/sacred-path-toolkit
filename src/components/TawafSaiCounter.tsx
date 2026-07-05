import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Minus, Plus } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type Mode = "tawaf" | "sai";

export function TawafSaiCounter({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const BackIcon = lang === "ar" || lang === "ku" ? ArrowRight : ArrowLeft;
  const [mode, setMode] = useState<Mode>("tawaf");
  const key = `tawafsai:${mode}`;
  const [count, setCount] = useState<number>(() => {
    try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
  });
  useEffect(() => {
    try { setCount(Number(localStorage.getItem(key)) || 0); } catch { /* */ }
  }, [key]);
  useEffect(() => {
    try { localStorage.setItem(key, String(count)); } catch { /* */ }
  }, [count, key]);

  const total = 7;
  const label = mode === "tawaf" ? L("تەواف", "الطواف", "Tawaf") : L("سعی", "السعي", "Saʿi");
  const unit = mode === "tawaf" ? L("خول", "شوط", "circuit") : L("جار", "شوط", "lap");
  const done = count >= total;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold flex-1">{L("ژماردەی تەواف و سعی", "عداد الطواف والسعي", "Tawaf & Saʿi Counter")}</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["tawaf", "sai"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className="py-2.5 rounded-xl border text-sm font-medium transition"
            style={{
              background: mode === m ? "var(--gradient-gold)" : "var(--glass-bg)",
              color: mode === m ? "var(--primary-foreground)" : undefined,
              borderColor: "var(--glass-border)",
            }}>
            {m === "tawaf" ? L("تەواف", "الطواف", "Tawaf") : L("سعی", "السعي", "Saʿi")}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border p-6 backdrop-blur-xl text-center" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-3 text-7xl font-bold tabular-nums" style={{ color: done ? "hsl(var(--primary))" : undefined }}>{count}</p>
        <p className="text-sm text-muted-foreground">/ {total} {unit}</p>
        <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${Math.min(100, (count / total) * 100)}%`, background: "var(--gradient-gold)" }} />
        </div>

        <button
          onClick={() => setCount((c) => c + 1)}
          disabled={done}
          className="mt-6 w-full py-5 rounded-2xl text-lg font-semibold text-primary-foreground disabled:opacity-60 active:scale-[0.98] transition"
          style={{ background: "var(--gradient-gold)" }}>
          {done ? L("تەواو بوو ✓", "تم ✓", "Completed ✓") : `+1 ${unit}`}
        </button>

        <div className="mt-3 flex items-center justify-center gap-3">
          <button onClick={() => setCount((c) => Math.max(0, c - 1))} className="h-10 w-10 rounded-full border grid place-items-center" style={{ borderColor: "var(--glass-border)" }}><Minus className="h-4 w-4" /></button>
          <button onClick={() => setCount(0)} className="h-10 px-4 rounded-full border grid place-items-center gap-2 flex" style={{ borderColor: "var(--glass-border)" }}>
            <RotateCcw className="h-4 w-4" /><span className="text-xs">{L("سیفر", "تصفير", "Reset")}</span>
          </button>
          <button onClick={() => setCount((c) => c + 1)} className="h-10 w-10 rounded-full border grid place-items-center" style={{ borderColor: "var(--glass-border)" }}><Plus className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="rounded-2xl border p-4 text-xs text-muted-foreground leading-relaxed" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        {mode === "tawaf"
          ? L("تەواف: ٧ خول بە دەوری کەعبە، دەستپێک لە حەجەری ئەسوەد.", "الطواف: ٧ أشواط حول الكعبة تبدأ من الحجر الأسود.", "Tawaf: 7 circuits around the Kaaba, starting from the Black Stone.")
          : L("سعی: ٧ جار نێوان سەفا و مەروە.", "السعي: ٧ أشواط بين الصفا والمروة.", "Saʿi: 7 laps between Safa and Marwa.")}
      </div>
    </div>
  );
}
