import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Brain, CalendarClock, CheckCircle2, Circle, Loader2, RefreshCw, Trophy, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Lang } from "@/lib/i18n";
import {
  type HifzState,
  loadHifz,
  saveHifz,
  buildPlan,
  dueRevisions,
  markMemorized,
  markRevised,
  hifzStats,
  todayISO,
} from "@/lib/hifz";

type Surah = { number: number; name: string; englishName: string; numberOfAyahs: number };

const glass = { background: "var(--glass-bg)", borderColor: "var(--glass-border)" };

export function MemorizationPlan({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const [state, setState] = useState<HifzState | null>(null);
  const [tab, setTab] = useState<"plan" | "revision" | "quiz" | "stats">("plan");

  useEffect(() => setState(loadHifz()), []);
  const update = (next: HifzState) => {
    setState(next);
    saveHifz(next);
  };

  const { data: surahs } = useQuery({
    queryKey: ["surahs"],
    queryFn: async (): Promise<Surah[]> => {
      const res = await fetch("https://api.alquran.cloud/v1/surah");
      if (!res.ok) throw new Error("failed");
      return (await res.json()).data;
    },
  });

  if (!state) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">{L("حیفزی قورئان", "حفظ القرآن", "Memorization")}</h2>
      </div>

      {!state.plan.length ? (
        <PlanSetup lang={lang} surahs={surahs ?? []} onCreate={(cfg) => update(buildPlan(state, cfg))} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-1.5">
            {([
              ["plan", L("پلان", "الخطة", "Plan"), Target],
              ["revision", L("پێداچوونەوە", "المراجعة", "Revision"), RefreshCw],
              ["quiz", L("تاقیکردنەوە", "اختبار", "Quiz"), Brain],
              ["stats", L("ئاماری", "إحصاء", "Stats"), Trophy],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="rounded-2xl border py-2.5 text-[11px] flex flex-col items-center gap-1 transition"
                style={tab === id ? { background: "var(--gradient-teal)", color: "var(--primary-foreground)", borderColor: "transparent" } : glass}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "plan" && <PlanList lang={lang} state={state} onToggle={(i) => update(markMemorized(state, i))} onReset={() => update({ ...state, plan: [] })} />}
          {tab === "revision" && <RevisionList lang={lang} state={state} onRevise={(k) => update(markRevised(state, k))} />}
          {tab === "quiz" && <Quiz lang={lang} state={state} />}
          {tab === "stats" && <StatsPanel lang={lang} state={state} />}
        </>
      )}
    </div>
  );
}

function PlanSetup({
  lang,
  surahs,
  onCreate,
}: {
  lang: Lang;
  surahs: Surah[];
  onCreate: (cfg: { surah: number; name: string; ayahs: number; perDay: number }) => void;
}) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const [surah, setSurah] = useState(78);
  const [perDay, setPerDay] = useState(5);
  const s = surahs.find((x) => x.number === surah);

  return (
    <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-4" style={glass}>
      <p className="text-sm text-muted-foreground">
        {L("سوورەتێک هەڵبژێرە و ژمارەی ئایەت بۆ هەر ڕۆژ دیاری بکە.", "اختر سورة وحدد عدد الآيات يومياً.", "Pick a surah and how many ayahs to memorize each day.")}
      </p>

      <div className="space-y-2">
        <label className="text-xs text-primary">{L("سوورەت", "السورة", "Surah")}</label>
        <select
          value={surah}
          onChange={(e) => setSurah(Number(e.target.value))}
          className="w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
          style={glass}
        >
          {surahs.map((x) => (
            <option key={x.number} value={x.number} className="bg-background">
              {x.number}. {x.englishName} — {x.name} ({x.numberOfAyahs})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-primary">
          {L("ئایەت بۆ هەر ڕۆژ", "آيات في اليوم", "Ayahs per day")}: {perDay}
        </label>
        <input type="range" min={1} max={20} value={perDay} onChange={(e) => setPerDay(Number(e.target.value))} className="w-full accent-primary" />
      </div>

      {s && (
        <p className="text-xs text-muted-foreground">
          {L("کۆی ڕۆژان", "عدد الأيام", "Total days")}: {Math.ceil(s.numberOfAyahs / perDay)}
        </p>
      )}

      <button
        disabled={!s}
        onClick={() => s && onCreate({ surah: s.number, name: s.name, ayahs: s.numberOfAyahs, perDay })}
        className="w-full rounded-2xl py-3 text-sm font-medium disabled:opacity-40"
        style={{ background: "var(--gradient-teal)", color: "var(--primary-foreground)" }}
      >
        {L("دروستکردنی پلان", "إنشاء الخطة", "Create plan")}
      </button>
    </div>
  );
}

function PlanList({ lang, state, onToggle, onReset }: { lang: Lang; state: HifzState; onToggle: (i: number) => void; onReset: () => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const done = state.plan.filter((p) => p.done).length;
  const pct = Math.round((done / state.plan.length) * 100);

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={glass}>
        <div className="flex items-center justify-between">
          <p className="font-display text-xl" dir="rtl">{state.surahName}</p>
          <p className="text-sm text-primary">{pct}%</p>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-teal)" }} />
        </div>
        <button onClick={onReset} className="text-[11px] text-muted-foreground hover:text-destructive">
          {L("پلانی نوێ", "خطة جديدة", "New plan")}
        </button>
      </div>

      <div className="grid gap-2">
        {state.plan.map((p, i) => (
          <button
            key={p.key}
            onClick={() => onToggle(i)}
            className="text-start flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl hover:border-primary/40"
            style={glass}
          >
            {p.done ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {L("ڕۆژی", "اليوم", "Day")} {i + 1} · {L("ئایەت", "آية", "Ayah")} {p.from}–{p.to}
              </p>
              <p className="text-[11px] text-muted-foreground">{p.date}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RevisionList({ lang, state, onRevise }: { lang: Lang; state: HifzState; onRevise: (key: string) => void }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const due = dueRevisions(state);

  if (!due.length)
    return (
      <div className="rounded-3xl border p-8 text-center backdrop-blur-xl space-y-2" style={glass}>
        <CalendarClock className="h-7 w-7 mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">{L("هیچ پێداچوونەوەیەک نییە بۆ ئەمڕۆ", "لا مراجعة مستحقة اليوم", "No revisions due today")}</p>
      </div>
    );

  return (
    <div className="grid gap-2">
      {due.map((r) => (
        <div key={r.key} className="rounded-2xl border p-4 backdrop-blur-xl flex items-center gap-3" style={glass}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" dir="rtl">{state.surahName} · {r.from}–{r.to}</p>
            <p className="text-[11px] text-muted-foreground">
              {L("قۆناغی", "المرحلة", "Stage")} {r.stage + 1} · {L("کاتی", "موعد", "Due")} {r.due}
            </p>
          </div>
          <button
            onClick={() => onRevise(r.key)}
            className="px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: "var(--gradient-teal)", color: "var(--primary-foreground)" }}
          >
            {L("کرا", "تمت", "Done")}
          </button>
        </div>
      ))}
    </div>
  );
}

function Quiz({ lang, state }: { lang: Lang; state: HifzState }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const memorized = state.plan.filter((p) => p.done);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["hifz-ayahs", state.surah],
    queryFn: async (): Promise<{ numberInSurah: number; text: string }[]> => {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${state.surah}/quran-uthmani`);
      if (!res.ok) throw new Error("failed");
      return (await res.json()).data.ayahs;
    },
    enabled: memorized.length > 0,
  });

  const question = useMemo(() => {
    if (!data?.length) return null;
    const range = memorized.flatMap((p) => {
      const out: number[] = [];
      for (let n = p.from; n <= p.to; n++) out.push(n);
      return out;
    });
    const pool = range.filter((n) => n < data.length);
    if (pool.length < 2) return null;
    const seed = (round * 7919) % pool.length;
    const target = pool[seed]!;
    const prompt = data[target - 1];
    const correct = data[target];
    if (!prompt || !correct) return null;
    const others = data.filter((a) => a.numberInSurah !== correct.numberInSurah).slice(0, 40);
    const distractors = [others[(round * 13) % others.length], others[(round * 29 + 5) % others.length]].filter(Boolean) as { numberInSurah: number; text: string }[];
    const options = [correct, ...distractors].sort((a, b) => ((a.numberInSurah * round) % 7) - ((b.numberInSurah * round) % 7));
    return { prompt, correct, options };
  }, [data, memorized, round]);

  if (!memorized.length)
    return (
      <div className="rounded-3xl border p-8 text-center backdrop-blur-xl" style={glass}>
        <p className="text-sm text-muted-foreground">{L("سەرەتا هەندێک ئایەت حیفز بکە", "احفظ بعض الآيات أولاً", "Memorize some ayahs first")}</p>
      </div>
    );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!question)
    return (
      <div className="rounded-3xl border p-8 text-center backdrop-blur-xl" style={glass}>
        <p className="text-sm text-muted-foreground">{L("ئایەتی زیاتر پێویستە", "تحتاج آيات أكثر", "Need more memorized ayahs")}</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border p-5 backdrop-blur-xl space-y-3" style={glass}>
        <p className="text-[11px] text-primary">{L("ئایەتی دواتر کامەیە؟", "ما الآية التالية؟", "Which ayah comes next?")}</p>
        <p className="font-display text-xl leading-loose text-right" dir="rtl" style={{ lineHeight: 2.1 }}>{question.prompt.text}</p>
      </div>

      <div className="grid gap-2">
        {question.options.map((o, i) => {
          const isCorrect = o.numberInSurah === question.correct.numberInSurah;
          const revealed = picked !== null;
          return (
            <button
              key={o.numberInSurah}
              disabled={revealed}
              onClick={() => {
                setPicked(i);
                setScore((s) => ({ right: s.right + (isCorrect ? 1 : 0), total: s.total + 1 }));
              }}
              className="text-right rounded-2xl border p-4 backdrop-blur-xl transition"
              dir="rtl"
              style={{
                ...glass,
                borderColor: revealed && isCorrect ? "var(--primary)" : revealed && picked === i ? "hsl(var(--destructive))" : "var(--glass-border)",
              }}
            >
              <p className="font-display text-lg leading-loose">{o.text}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">{L("خاڵ", "النتيجة", "Score")}: {score.right}/{score.total}</p>
        <button
          onClick={() => { setPicked(null); setRound((r) => r + 1); }}
          className="px-4 py-2 rounded-xl text-xs font-medium"
          style={{ background: "var(--gradient-teal)", color: "var(--primary-foreground)" }}
        >
          {L("دواتر", "التالي", "Next")}
        </button>
      </div>
    </div>
  );
}

function StatsPanel({ lang, state }: { lang: Lang; state: HifzState }) {
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const s = hifzStats(state);
  const items = [
    [L("ئایەتی حیفزکراو", "آيات محفوظة", "Ayahs memorized"), String(s.ayahs)],
    [L("ڕۆژی تەواوکراو", "أيام مكتملة", "Days completed"), String(s.days)],
    [L("ڕێژە", "النسبة", "Completion"), `${s.pct}%`],
    [L("زنجیرە", "التتابع", "Streak"), String(s.streak)],
    [L("پێداچوونەوە", "مراجعات", "Revisions"), String(s.revisions)],
    [L("ئەمڕۆ", "اليوم", "Today"), todayISO()],
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-2xl border p-4 backdrop-blur-xl" style={glass}>
          <p className="text-[11px] text-muted-foreground">{k}</p>
          <p className="text-xl font-semibold mt-1">{v}</p>
        </div>
      ))}
    </div>
  );
}
