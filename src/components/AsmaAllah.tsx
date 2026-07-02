import { ArrowLeft } from "lucide-react";
import { ASMA_ALLAH } from "@/lib/asma";
import { MORE } from "@/lib/more-i18n";
import type { Lang, Dict } from "@/lib/i18n";

const KU_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toLocaleDigits = (n: number | string, lang: Lang) =>
  lang === "en" || lang === "kmr" ? String(n) : String(n).replace(/\d/g, (d) => KU_DIGITS[+d]);

export function AsmaAllah({ lang, t, onBack }: { lang: Lang; t: Dict; onBack: () => void }) {
  const m = MORE[lang].asma;
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
        <ArrowLeft className="h-4 w-4" /> {t.quran.back}
      </button>

      <div className="rounded-3xl border p-6 mb-4 text-center backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-[11px] tracking-[0.3em] text-primary/80 uppercase">{m.subtitle}</p>
        <h2 className="mt-2 text-2xl font-semibold font-display">{m.title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ASMA_ALLAH.map((name) => (
          <div
            key={name.n}
            className="rounded-2xl border p-4 backdrop-blur-xl transition hover:border-primary/50"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-display leading-tight" dir="rtl" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                  {name.ar}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-primary/80">{name.translit}</p>
                <p className="mt-1.5 text-sm text-foreground/90">
                  {lang === "ku" || lang === "bad" ? name.ku : name.en}
                </p>
              </div>
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-foreground tabular-nums"
                style={{ background: "var(--gradient-gold)" }}
              >
                {toLocaleDigits(name.n, lang)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
