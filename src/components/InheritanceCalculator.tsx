import { useMemo, useState } from "react";
import { ArrowLeft, Scale } from "lucide-react";
import type { Lang } from "@/lib/i18n";

type Heir = {
  key: string;
  ku: string;
  ar: string;
  en: string;
  count?: boolean; // allow multiple
};

const HEIRS: Heir[] = [
  { key: "husband",       ku: "میرد",              ar: "الزوج",              en: "Husband" },
  { key: "wife",          ku: "ژن",                ar: "الزوجة",             en: "Wife (up to 4)", count: true },
  { key: "father",        ku: "باوک",              ar: "الأب",               en: "Father" },
  { key: "mother",        ku: "دایک",              ar: "الأم",               en: "Mother" },
  { key: "son",           ku: "کوڕ",               ar: "الابن",              en: "Son", count: true },
  { key: "daughter",      ku: "کچ",                ar: "البنت",              en: "Daughter", count: true },
  { key: "grandfather",   ku: "باپیری باوانی",     ar: "الجد لأب",           en: "Paternal grandfather" },
  { key: "grandmother",   ku: "داپیر",             ar: "الجدة",              en: "Grandmother", count: true },
  { key: "brother",       ku: "برای تەواو",        ar: "الأخ الشقيق",        en: "Full brother", count: true },
  { key: "sister",        ku: "خوشکی تەواو",       ar: "الأخت الشقيقة",      en: "Full sister", count: true },
];

type Result = { key: string; label: string; share: string; note?: string };

// Simplified Faraid engine covering the common Quranic-share cases only.
function calculate(vals: Record<string, number>, lang: Lang): { rows: Result[]; residueTo: string | null; residuePct: number } {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const rows: Result[] = [];
  const has = (k: string) => (vals[k] ?? 0) > 0;
  const n = (k: string) => vals[k] ?? 0;
  const hasSon = has("son");
  const hasDaughter = has("daughter");
  const hasChild = hasSon || hasDaughter;
  const numSiblings = n("brother") + n("sister");

  // Spouse
  if (has("husband")) {
    const share = hasChild ? 1 / 4 : 1 / 2;
    rows.push({ key: "husband", label: L("میرد", "الزوج", "Husband"), share: fmt(share) });
  }
  if (has("wife")) {
    const totalShare = hasChild ? 1 / 8 : 1 / 4;
    rows.push({ key: "wife", label: L(`ژن (${n("wife")})`, `الزوجة (${n("wife")})`, `Wife × ${n("wife")}`), share: fmt(totalShare), note: L("بەشە نێوان ژنەکاندا یەکسان", "يقسم بالتساوي", "Split equally") });
  }

  // Mother
  if (has("mother")) {
    let share: number;
    if (hasChild || numSiblings >= 2) share = 1 / 6;
    else share = 1 / 3;
    rows.push({ key: "mother", label: L("دایک", "الأم", "Mother"), share: fmt(share) });
  }

  // Father
  if (has("father")) {
    if (hasSon) {
      rows.push({ key: "father", label: L("باوک", "الأب", "Father"), share: fmt(1 / 6) });
    } else if (hasDaughter) {
      rows.push({ key: "father", label: L("باوک", "الأب", "Father"), share: fmt(1 / 6), note: L("١/٦ + پاشماوە", "١/٦ + الباقي تعصيباً", "1/6 + residue") });
    } else {
      rows.push({ key: "father", label: L("باوک", "الأب", "Father"), share: L("پاشماوە", "الباقي (تعصيب)", "Residue (asaba)") });
    }
  }

  // Daughters (only when no son — with son, they become residuaries 2:1)
  if (hasDaughter && !hasSon) {
    const share = n("daughter") === 1 ? 1 / 2 : 2 / 3;
    rows.push({
      key: "daughter",
      label: L(`کچ (${n("daughter")})`, `البنت (${n("daughter")})`, `Daughter × ${n("daughter")}`),
      share: fmt(share),
      note: n("daughter") > 1 ? L("بەشە یەکسان", "يقسم بالتساوي", "Split equally") : undefined,
    });
  }

  // Sons + daughters together take residue (2:1)
  if (hasSon) {
    const label = hasDaughter
      ? L(`کوڕ (${n("son")}) + کچ (${n("daughter")})`, `الابن (${n("son")}) + البنت (${n("daughter")})`, `Sons × ${n("son")} + Daughters × ${n("daughter")}`)
      : L(`کوڕ (${n("son")})`, `الابن (${n("son")})`, `Sons × ${n("son")}`);
    rows.push({
      key: "children",
      label,
      share: L("پاشماوە", "الباقي (تعصيب)", "Residue (asaba)"),
      note: hasDaughter ? L("کوڕ ٢، کچ ١", "للذكر مثل حظ الأنثيين", "Male : Female = 2 : 1") : undefined,
    });
  }

  // Grandmother — 1/6, blocked by mother
  if (has("grandmother") && !has("mother")) {
    rows.push({ key: "grandmother", label: L(`داپیر (${n("grandmother")})`, `الجدة (${n("grandmother")})`, `Grandmother × ${n("grandmother")}`), share: fmt(1 / 6) });
  }

  // Grandfather — like father when father absent
  if (has("grandfather") && !has("father")) {
    if (hasSon) rows.push({ key: "grandfather", label: L("باپیری باوانی", "الجد", "Grandfather"), share: fmt(1 / 6) });
    else if (hasDaughter) rows.push({ key: "grandfather", label: L("باپیری باوانی", "الجد", "Grandfather"), share: fmt(1 / 6), note: L("١/٦ + پاشماوە", "١/٦ + الباقي", "1/6 + residue") });
    else rows.push({ key: "grandfather", label: L("باپیری باوانی", "الجد", "Grandfather"), share: L("پاشماوە", "الباقي (تعصيب)", "Residue") });
  }

  // Full siblings — only when no child, no father, no grandfather (kalala)
  const kalala = !hasChild && !has("father") && !has("grandfather");
  if (kalala && (has("brother") || has("sister"))) {
    if (has("brother")) {
      const label = has("sister")
        ? L(`برا (${n("brother")}) + خوشک (${n("sister")})`, `الإخوة (${n("brother")}) والأخوات (${n("sister")})`, `Brothers × ${n("brother")} + Sisters × ${n("sister")}`)
        : L(`برا (${n("brother")})`, `الإخوة (${n("brother")})`, `Brothers × ${n("brother")}`);
      rows.push({ key: "siblings", label, share: L("پاشماوە", "الباقي (تعصيب)", "Residue"), note: has("sister") ? L("برا ٢، خوشک ١", "للذكر مثل حظ الأنثيين", "M:F = 2:1") : undefined });
    } else if (has("sister")) {
      const share = n("sister") === 1 ? 1 / 2 : 2 / 3;
      rows.push({ key: "sister", label: L(`خوشکی تەواو (${n("sister")})`, `الأخت الشقيقة (${n("sister")})`, `Full sister × ${n("sister")}`), share: fmt(share) });
    }
  }

  // Compute residue percent based on Quranic shares only (ignoring residuaries)
  const fixedTotal = rows.reduce((sum, r) => sum + (parseShare(r.share) ?? 0), 0);
  const residuePct = Math.max(0, 1 - fixedTotal);
  const residuaryRow = rows.find((r) => typeof r.share === "string" && /پاشماوە|الباقي|Residue/.test(r.share));

  return { rows, residueTo: residuaryRow?.key ?? null, residuePct };
}

function fmt(x: number): string {
  if (x === 1 / 2) return "1/2";
  if (x === 1 / 3) return "1/3";
  if (x === 2 / 3) return "2/3";
  if (x === 1 / 4) return "1/4";
  if (x === 1 / 6) return "1/6";
  if (x === 1 / 8) return "1/8";
  return `${(x * 100).toFixed(1)}%`;
}
function parseShare(s: string): number | null {
  const m = /^(\d+)\/(\d+)$/.exec(s);
  if (m) return Number(m[1]) / Number(m[2]);
  const p = /^([\d.]+)%$/.exec(s);
  if (p) return Number(p[1]) / 100;
  return null;
}

export function InheritanceCalculator({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const [estate, setEstate] = useState("100000");
  const [vals, setVals] = useState<Record<string, number>>({});

  const result = useMemo(() => calculate(vals, lang), [vals, lang]);
  const total = Number(estate) || 0;

  const heirName = (h: Heir) => (lang === "ar" ? h.ar : lang === "en" ? h.en : h.ku);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
        <ArrowLeft className="h-4 w-4" /> {L("گەڕانەوە", "رجوع", "Back")}
      </button>

      <div className="rounded-3xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl text-primary-foreground" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{L("ژماردەی میرات", "حاسبة الميراث", "Inheritance Calculator")}</p>
            <p className="text-xs text-muted-foreground">{L("بەگوێرەی حوکمی فەرائیز", "وفق أحكام الفرائض", "Based on Faraid rules")}</p>
          </div>
        </div>

        <label className="block text-xs text-muted-foreground mb-1">{L("کۆی سامان", "إجمالي التركة", "Total estate")}</label>
        <input
          type="number"
          inputMode="decimal"
          value={estate}
          onChange={(e) => setEstate(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 outline-none focus:border-primary"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        />
      </div>

      <div className="rounded-3xl border p-4 backdrop-blur-xl space-y-2" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-sm font-semibold mb-1">{L("میراتگرەکان", "الورثة", "Heirs")}</p>
        {HEIRS.map((h) => (
          <div key={h.key} className="flex items-center justify-between gap-3 py-1.5">
            <span className="text-sm">{heirName(h)}</span>
            {h.count ? (
              <input
                type="number"
                min={0}
                max={h.key === "wife" ? 4 : 20}
                value={vals[h.key] ?? 0}
                onChange={(e) => setVals({ ...vals, [h.key]: Math.max(0, Number(e.target.value) || 0) })}
                className="w-20 rounded-lg border px-2 py-1 text-sm outline-none focus:border-primary text-center"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
              />
            ) : (
              <input
                type="checkbox"
                checked={(vals[h.key] ?? 0) > 0}
                onChange={(e) => setVals({ ...vals, [h.key]: e.target.checked ? 1 : 0 })}
                className="h-5 w-5 accent-primary"
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="font-semibold">{L("ئەنجام", "النتيجة", "Result")}</p>
        {result.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{L("لیستێک هەڵبژێرە", "اختر ورثة", "Select at least one heir")}</p>
        ) : (
          <div className="space-y-2">
            {result.rows.map((r) => {
              const pct = parseShare(r.share);
              const amount = pct != null ? pct * total : r.key === (result.residueTo ?? "") ? result.residuePct * total : null;
              return (
                <div key={r.key} className="flex items-start justify-between gap-3 rounded-2xl border px-3 py-2" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.label}</p>
                    {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-semibold text-primary">{r.share}</p>
                    {amount != null && <p className="text-xs text-muted-foreground">{amount.toLocaleString()}</p>}
                  </div>
                </div>
              );
            })}
            {result.residueTo && (
              <p className="text-[11px] text-muted-foreground">
                {L("پاشماوە", "الباقي", "Residue")}: {(result.residuePct * 100).toFixed(1)}%
              </p>
            )}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground pt-2 border-t" style={{ borderColor: "var(--glass-border)" }}>
          {L(
            "ژماردنێکی سادەیە — بۆ حاڵەتی ئاڵۆز پەیوەندی بە زانا بکە.",
            "حساب مبسط — للحالات المعقدة استشر عالماً.",
            "Simplified calculation — consult a scholar for complex cases.",
          )}
        </p>
      </div>
    </div>
  );
}
