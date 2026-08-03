import { ArrowLeft, Trophy, Flame, Star } from "lucide-react";
import { BADGES, levelFromXp, streakOf, useGamify } from "@/lib/gamify";
import type { Lang } from "@/lib/i18n";

export function Achievements({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const g = useGamify();
  const { level, into, need, pct } = levelFromXp(g.xp);
  const streak = streakOf(g.days);
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">{L("دەستکەوتەکان", "الإنجازات", "Achievements")}</h2>
      </div>

      <div className="rounded-3xl border p-6 backdrop-blur-xl text-center" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl" style={{ background: "var(--gradient-gold)" }}>
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </div>
        <p className="mt-3 text-2xl font-semibold">{L("ئاست", "المستوى", "Level")} {level}</p>
        <p className="text-xs text-muted-foreground">{g.xp} XP</p>
        <div className="mt-4 h-2 rounded-full overflow-hidden bg-white/10">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-teal)" }} />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{into} / {need} XP</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Flame, label: L("ڕۆژی بەردەوام", "أيام متتالية", "Streak"), value: streak },
          { icon: Star, label: L("ئایەت", "آيات", "Ayahs"), value: g.counters.ayahsRead },
          { icon: Trophy, label: L("نیشان", "أوسمة", "Badges"), value: g.badges.length },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-2xl border p-3 text-center backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
              <Icon className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-lg font-semibold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {BADGES.map((b) => {
          const owned = g.badges.includes(b.id);
          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 text-center backdrop-blur-xl transition ${owned ? "border-primary/50" : "opacity-45"}`}
              style={{ background: "var(--glass-bg)", borderColor: owned ? "var(--primary)" : "var(--glass-border)" }}
            >
              <p className="text-3xl">{b.icon}</p>
              <p className="mt-1 text-sm font-medium">{lang === "ar" ? b.ar : lang === "en" ? b.en : b.ku}</p>
              {b.xp > 0 && <p className="text-[10px] text-muted-foreground">{b.xp} XP</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
