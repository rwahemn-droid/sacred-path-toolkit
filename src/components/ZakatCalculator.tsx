import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Coins, RotateCcw } from "lucide-react";
import { MORE } from "@/lib/more-i18n";
import type { Lang, Dict } from "@/lib/i18n";

const KU_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const fmt = (n: number, lang: Lang) => {
  const s = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
  return lang === "en" || lang === "kmr" ? s : s.replace(/\d/g, (d) => KU_DIGITS[+d]);
};

type Zakat = {
  cash: string;
  gold: string;
  silver: string;
  stocks: string;
  debts: string;
  currency: string;
  nisab: string;
};

const STORE = "ibadah:zakat";
const DEFAULT: Zakat = { cash: "", gold: "", silver: "", stocks: "", debts: "", currency: "USD", nisab: "5500" };

export function ZakatCalculator({ lang, t, onBack }: { lang: Lang; t: Dict; onBack: () => void }) {
  const m = MORE[lang].zakat;
  const [state, setState] = useState<Zakat>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {}
  }, [state]);

  const num = (v: string) => (parseFloat(v) || 0);
  const total = num(state.cash) + num(state.gold) + num(state.silver) + num(state.stocks) - num(state.debts);
  const nisab = num(state.nisab);
  const eligible = total >= nisab && total > 0;
  const zakat = eligible ? total * 0.025 : 0;

  const fields: { key: keyof Zakat; label: string }[] = [
    { key: "cash", label: m.cash },
    { key: "gold", label: m.gold },
    { key: "silver", label: m.silver },
    { key: "stocks", label: m.stocks },
    { key: "debts", label: m.debts },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
        <ArrowLeft className="h-4 w-4" /> {t.quran.back}
      </button>

      <div className="rounded-3xl border p-6 mb-4 backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
            <Coins className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{m.title}</h2>
            <p className="text-xs text-muted-foreground">{m.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border p-5 mb-4 backdrop-blur-xl space-y-4"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">{m.currency}</span>
            <input
              value={state.currency}
              onChange={(e) => setState((s) => ({ ...s, currency: e.target.value.toUpperCase().slice(0, 6) }))}
              className="mt-1 w-full rounded-xl border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
              style={{ borderColor: "var(--glass-border)" }}
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">{m.nisab}</span>
            <input
              inputMode="decimal"
              value={state.nisab}
              onChange={(e) => setState((s) => ({ ...s, nisab: e.target.value }))}
              className="mt-1 w-full rounded-xl border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
              style={{ borderColor: "var(--glass-border)" }}
            />
          </label>
        </div>

        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-muted-foreground">{f.label}</span>
            <input
              inputMode="decimal"
              value={state[f.key]}
              onChange={(e) => setState((s) => ({ ...s, [f.key]: e.target.value }))}
              placeholder="0"
              className="mt-1 w-full rounded-xl border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary"
              style={{ borderColor: "var(--glass-border)" }}
            />
          </label>
        ))}

        <p className="text-[11px] text-muted-foreground">{m.hint}</p>

        <button
          onClick={() => setState(DEFAULT)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {m.reset}
        </button>
      </div>

      <div className="rounded-3xl border p-6 backdrop-blur-xl text-center"
        style={{ background: "var(--gradient-gold)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs uppercase tracking-widest text-primary-foreground/80">{m.total}</p>
        <p className="mt-1 text-2xl font-bold text-primary-foreground tabular-nums">
          {fmt(total, lang)} <span className="text-sm">{state.currency}</span>
        </p>

        <div className="my-4 h-px bg-primary-foreground/20" />

        {eligible ? (
          <>
            <p className="text-xs uppercase tracking-widest text-primary-foreground/80">{m.zakatDue} (2.5%)</p>
            <p className="mt-1 text-4xl font-bold text-primary-foreground tabular-nums">
              {fmt(zakat, lang)}
            </p>
            <p className="mt-1 text-sm text-primary-foreground/90">{state.currency}</p>
          </>
        ) : (
          <p className="text-sm text-primary-foreground/90">{m.below}</p>
        )}
      </div>
    </div>
  );
}
