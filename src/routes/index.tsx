import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Sun, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "ئەپی قورئان — Quran Companion" },
      { name: "description", content: "قورئان، کاتەکانی نوێژ، ویرد و زیکر، تەسبیح" },
    ],
  }),
});

type TabId = "quran" | "prayer" | "dhikr" | "tasbih";

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "quran", label: "قورئان", icon: BookOpen },
  { id: "prayer", label: "نوێژ", icon: Clock },
  { id: "dhikr", label: "زیکر", icon: Sun },
  { id: "tasbih", label: "تەسبیح", icon: Target },
];

function Dashboard() {
  const [active, setActive] = useState<TabId>("quran");

  return (
    <div dir="rtl" className="min-h-screen flex flex-col pb-32">
      <header className="px-6 pt-10 pb-6 text-center">
        <p className="text-xs tracking-[0.3em] text-primary/80 uppercase">Bismillah</p>
        <h1 className="mt-2 text-3xl font-semibold">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h1>
      </header>

      <main className="flex-1 px-6">
        {active === "quran" && <QuranView />}
        {active === "prayer" && <PrayerView />}
        {active === "dhikr" && <DhikrView />}
        {active === "tasbih" && <TasbihView />}
      </main>

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[min(92%,28rem)]">
        <div
          className="flex items-center justify-around rounded-full border px-2 py-2 backdrop-blur-xl"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", boxShadow: "var(--shadow-glow)" }}
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={isActive ? { background: "var(--gradient-gold)" } : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl border p-6 backdrop-blur-xl"
      style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
    >
      {children}
    </div>
  );
}

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

function QuranView() {
  const { data: surahs, isLoading, isError } = useQuery({
    queryKey: ["surahs"],
    queryFn: async (): Promise<Surah[]> => {
      const res = await fetch("https://api.alquran.cloud/v1/surah");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 60,
  });
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-muted-foreground">قورئانی پیرۆز</p>
        <h2 className="mt-1 text-2xl font-semibold">١١٤ سوورەت</h2>
        <p className="text-sm text-primary mt-1">سەرچاوە: alquran.cloud</p>
      </Card>
      <h3 className="text-sm text-muted-foreground px-1">سورەتەکان</h3>
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">بارکردن...</div>
      )}
      {isError && (
        <div className="text-center py-12 text-destructive">هەڵە لە هێنانی داتا</div>
      )}
      <div className="grid gap-3">
        {surahs?.map((s) => (
          <div
            key={s.number}
            className="flex items-center justify-between rounded-2xl border p-4 backdrop-blur-xl transition hover:border-primary/40"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0"
                style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
              >
                {s.number}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{s.englishName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {s.englishNameTranslation} · {s.numberOfAyahs} ئایەت
                </p>
              </div>
            </div>
            <p className="font-display text-2xl shrink-0">{s.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrayerView() {
  const times = [
    { name: "بەیانی", time: "04:42" },
    { name: "نیوەڕۆ", time: "12:18" },
    { name: "عەسر", time: "15:51" },
    { name: "ئێوارە", time: "18:34" },
    { name: "خەفتنەوە", time: "20:02" },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-muted-foreground">نوێژی داهاتوو</p>
        <div className="mt-2 flex items-baseline justify-between">
          <h2 className="text-3xl font-semibold">عەسر</h2>
          <p className="text-2xl text-primary">15:51</p>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-2/3" style={{ background: "var(--gradient-gold)" }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">٢ کاتژمێر و ١٨ خولەک ماوە</p>
      </Card>
      <div className="grid gap-2">
        {times.map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-between rounded-2xl border px-5 py-4 backdrop-blur-xl"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          >
            <span className="font-medium">{t.name}</span>
            <span className="text-primary tabular-nums">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DhikrView() {
  const items = [
    { ar: "سُبْحَانَ اللَّهِ", ku: "پاکی بۆ خوا" },
    { ar: "الْحَمْدُ لِلَّهِ", ku: "سوپاس بۆ خوا" },
    { ar: "اللَّهُ أَكْبَرُ", ku: "خوا گەورەترە" },
    { ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", ku: "هیچ خوایەک نییە جگە لە خوا" },
  ];
  return (
    <div className="space-y-3">
      {items.map((d, i) => (
        <Card key={i}>
          <p className="font-display text-3xl text-center leading-relaxed">{d.ar}</p>
          <p className="mt-3 text-center text-sm text-muted-foreground">{d.ku}</p>
        </Card>
      ))}
    </div>
  );
}

function TasbihView() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <Card>
        <p className="font-display text-3xl text-center">سُبْحَانَ اللَّهِ</p>
      </Card>
      <div className="text-7xl font-bold tabular-nums" style={{ background: "var(--gradient-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {count}
      </div>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="h-40 w-40 rounded-full text-xl font-semibold transition-all active:scale-95"
        style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
      >
        تەسبیح
      </button>
      <button
        onClick={() => setCount(0)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        سفر کردنەوە
      </button>
    </div>
  );
}
