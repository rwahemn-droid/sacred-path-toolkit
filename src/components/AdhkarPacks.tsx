import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Sun, Moon, Bed, Utensils, Home as HomeIcon, Plane } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { MORNING_ADHKAR, EVENING_ADHKAR, type Dhikr } from "@/lib/adhkar";

type Pack = { id: string; title: string; icon: React.ComponentType<{ className?: string }>; bg: string; items: Dhikr[] };

const SLEEP: Dhikr[] = [
  { ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", ku: "بەناوی تۆ ئەی خوا دەمرم و دەژیم", count: 1 },
  { ar: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", ku: "ئەی خوا بمپارێزە لە سزات", count: 3 },
  { ar: "سُبْحَانَ اللَّهِ (33) الْحَمْدُ لِلَّهِ (33) اللَّهُ أَكْبَرُ (34)", ku: "تەسبیح و حەمد و تەکبیر", count: 1 },
  { ar: "آيَةُ الْكُرْسِيِّ", ku: "ئایەتولکورسی", count: 1 },
];
const FOOD_BEFORE: Dhikr[] = [
  { ar: "بِسْمِ اللَّهِ", ku: "بەناوی خوا", count: 1 },
];
const FOOD_AFTER: Dhikr[] = [
  { ar: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", ku: "سوپاس بۆ خوا کە خواردنی داومێ", count: 1 },
];
const HOME_ENTER: Dhikr[] = [
  { ar: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا", ku: "دوعای هاتنە ماڵەوە", count: 1 },
];
const HOME_LEAVE: Dhikr[] = [
  { ar: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", ku: "دوعای دەرچوون لە ماڵ", count: 1 },
];
const TRAVEL: Dhikr[] = [
  { ar: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ", ku: "دوعای سواربوون", count: 1 },
  { ar: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى", ku: "دوعای گەشت", count: 1 },
];

export function AdhkarPacks({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const PACKS: Pack[] = [
    { id: "morning", title: L("ئەذکاری بەیانی", "أذكار الصباح", "Morning Adhkar"), icon: Sun, bg: "linear-gradient(135deg,#f59e0b,#f97316)", items: MORNING_ADHKAR },
    { id: "evening", title: L("ئەذکاری ئێواره", "أذكار المساء", "Evening Adhkar"), icon: Moon, bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", items: EVENING_ADHKAR },
    { id: "sleep", title: L("ئەذکاری خەو", "أذكار النوم", "Sleep Adhkar"), icon: Bed, bg: "linear-gradient(135deg,#0f172a,#334155)", items: SLEEP },
    { id: "food-before", title: L("پێش خواردن", "قبل الطعام", "Before Eating"), icon: Utensils, bg: "linear-gradient(135deg,#10b981,#059669)", items: FOOD_BEFORE },
    { id: "food-after", title: L("دوای خواردن", "بعد الطعام", "After Eating"), icon: Utensils, bg: "linear-gradient(135deg,#14b8a6,#0d9488)", items: FOOD_AFTER },
    { id: "home-enter", title: L("چوونە ماڵ", "دخول المنزل", "Entering Home"), icon: HomeIcon, bg: "linear-gradient(135deg,#0ea5e9,#2563eb)", items: HOME_ENTER },
    { id: "home-leave", title: L("دەرچوون لە ماڵ", "الخروج من المنزل", "Leaving Home"), icon: HomeIcon, bg: "linear-gradient(135deg,#3b82f6,#1d4ed8)", items: HOME_LEAVE },
    { id: "travel", title: L("گەشت", "السفر", "Travel"), icon: Plane, bg: "linear-gradient(135deg,#a855f7,#7c3aed)", items: TRAVEL },
  ];
  const [active, setActive] = useState<Pack | null>(null);
  const BackIcon = lang === "ar" || lang === "ku" ? ArrowRight : ArrowLeft;

  if (active) return <PackView pack={active} lang={lang} onBack={() => setActive(null)} />;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold">{L("پاکێجەکانی ئەذکار", "باقات الأذكار", "Adhkar Packs")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PACKS.map((p) => {
          const Icon = p.icon;
          return (
            <button key={p.id} onClick={() => setActive(p)}
              className="text-start rounded-2xl border p-4 backdrop-blur-xl transition hover:-translate-y-0.5"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
              <div className="h-11 w-11 rounded-2xl grid place-items-center text-white mb-2" style={{ background: p.bg }}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm">{p.title}</p>
              <p className="text-[11px] text-muted-foreground">{p.items.length} {L("ئەذکار", "ذكر", "items")}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PackView({ pack, lang, onBack }: { pack: Pack; lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const key = `adhkar:progress:${pack.id}`;
  const [progress, setProgress] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch { /* */ }
    return pack.items.map(() => 0);
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* */ }
  }, [progress, key]);

  const bump = (i: number) => setProgress((p) => p.map((v, idx) => idx === i ? Math.min(pack.items[i].count, v + 1) : v));
  const reset = () => setProgress(pack.items.map(() => 0));
  const BackIcon = lang === "ar" || lang === "ku" ? ArrowRight : ArrowLeft;
  const done = progress.every((v, i) => v >= pack.items[i].count);

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold flex-1">{pack.title}</h2>
        <button onClick={reset} className="p-2 rounded-lg hover:bg-white/5" aria-label="reset"><RotateCcw className="h-4 w-4" /></button>
      </div>
      {done && (
        <div className="rounded-xl border p-3 text-center text-sm" style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}>
          {L("تەواو بوو ✨ تەقەبەڵ الله", "تقبل الله ✨", "Completed ✨ May Allah accept")}
        </div>
      )}
      <div className="space-y-2">
        {pack.items.map((d, i) => {
          const cur = progress[i] ?? 0;
          const full = cur >= d.count;
          return (
            <button key={i} onClick={() => bump(i)} disabled={full}
              className="w-full text-start rounded-2xl border p-4 backdrop-blur-xl transition active:scale-[0.99] disabled:opacity-70"
              style={{ background: "var(--glass-bg)", borderColor: full ? "hsl(var(--primary) / 0.6)" : "var(--glass-border)" }}>
              <p className="font-display text-xl leading-loose" dir="rtl">{d.ar}</p>
              <p className="text-xs text-muted-foreground mt-2">{d.ku}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${(cur / d.count) * 100}%`, background: "var(--gradient-gold)" }} />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">{cur}/{d.count}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
