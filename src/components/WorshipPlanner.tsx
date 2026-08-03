import { ArrowLeft, BookOpen, Heart, Sparkles, RotateCcw } from "lucide-react";
import { usePlanner, setTarget, resetGoal, type Goal } from "@/lib/planner";
import type { Lang } from "@/lib/i18n";

const ICONS = { quran: BookOpen, dhikr: Sparkles, prayer: Heart };

export function WorshipPlanner({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const goals = usePlanner();
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);

  const kindLabel = (k: Goal["kind"]) =>
    k === "quran" ? L("قورئان", "قرآن", "Quran") : k === "dhikr" ? L("زیکر", "ذكر", "Dhikr") : L("نوێژ", "صلاة", "Prayer");
  const periodLabel = (p: Goal["period"]) =>
    p === "daily" ? L("ڕۆژانە", "يومي", "Daily") : p === "weekly" ? L("هەفتانە", "أسبوعي", "Weekly") : L("مانگانە", "شهري", "Monthly");

  const groups: Goal["period"][] = ["daily", "weekly", "monthly"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">{L("پلانی عیبادەت", "مخطط العبادة", "Worship Planner")}</h2>
      </div>

      {groups.map((p) => {
        const list = goals.filter((g) => g.period === p);
        if (!list.length) return null;
        return (
          <div key={p} className="space-y-2">
            <p className="text-[11px] uppercase tracking-widest text-primary/80">{periodLabel(p)}</p>
            {list.map((g) => {
              const Icon = ICONS[g.kind];
              const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
              return (
                <div key={g.id} className="rounded-2xl border p-4 backdrop-blur-xl space-y-3" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-teal)" }}>
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{kindLabel(g.kind)}</p>
                      <p className="text-[11px] text-muted-foreground">{g.progress} / {g.target}</p>
                    </div>
                    <button onClick={() => resetGoal(g.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/5" aria-label="reset">
                      <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--gradient-gold)" : "var(--gradient-teal)" }} />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={g.kind === "prayer" ? 35 : g.period === "daily" ? 200 : 1000}
                    value={g.target}
                    onChange={(e) => setTarget(g.id, Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
