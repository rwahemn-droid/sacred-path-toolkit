import { useState } from "react";
import { Sparkles, Coins, CalendarDays, Flame, Star } from "lucide-react";
import type { Lang, Dict } from "@/lib/i18n";
import { MORE } from "@/lib/more-i18n";
import { AIMufti } from "./AIMufti";
import { AsmaAllah } from "./AsmaAllah";
import { ZakatCalculator } from "./ZakatCalculator";
import { IslamicEvents } from "./IslamicEvents";
import { HabitTracker } from "./HabitTracker";

type Sub = "hub" | "mufti" | "asma" | "zakat" | "events" | "habits";

export function MoreView({ lang, t }: { lang: Lang; t: Dict }) {
  const [sub, setSub] = useState<Sub>("hub");
  const m = MORE[lang];

  if (sub === "mufti") return <AIMufti lang={lang} t={t} onBack={() => setSub("hub")} />;
  if (sub === "asma") return <AsmaAllah lang={lang} t={t} onBack={() => setSub("hub")} />;
  if (sub === "zakat") return <ZakatCalculator lang={lang} t={t} onBack={() => setSub("hub")} />;
  if (sub === "events") return <IslamicEvents lang={lang} t={t} onBack={() => setSub("hub")} />;
  if (sub === "habits") return <HabitTracker lang={lang} t={t} onBack={() => setSub("hub")} />;

  const cards: {
    id: Sub;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    category: string;
  }[] = [
    { id: "mufti",  title: m.cards.mufti.title,  desc: m.cards.mufti.desc,  icon: Sparkles,    bg: "linear-gradient(135deg,#a855f7,#6366f1)", category: m.categories.ai },
    { id: "asma",   title: m.cards.asma.title,   desc: m.cards.asma.desc,   icon: Star,        bg: "linear-gradient(135deg,#f59e0b,#f97316)", category: m.categories.knowledge },
    { id: "zakat",  title: m.cards.zakat.title,  desc: m.cards.zakat.desc,  icon: Coins,       bg: "linear-gradient(135deg,#10b981,#14b8a6)", category: m.categories.tools },
    { id: "events", title: m.cards.events.title, desc: m.cards.events.desc, icon: CalendarDays,bg: "linear-gradient(135deg,#0ea5a3,#3b82f6)", category: m.categories.calendar },
    { id: "habits", title: m.cards.habits.title, desc: m.cards.habits.desc, icon: Flame,       bg: "linear-gradient(135deg,#ef4444,#f59e0b)", category: m.categories.tools },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="rounded-3xl border p-6 backdrop-blur-xl text-center"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <h2 className="text-lg font-semibold">{m.hubTitle}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setSub(c.id)}
              className="text-start rounded-2xl border p-4 backdrop-blur-xl transition hover:border-primary/50 hover:-translate-y-0.5"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary-foreground" style={{ background: c.bg }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-primary/80">{c.category}</p>
                  <p className="mt-0.5 font-semibold truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
