import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, GraduationCap, CheckCircle2, Circle, Play, Pause, RotateCcw } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl } from "@/lib/reciters";

type Tri = [string, string, string]; // ku, ar, en
type Example = { parts: { t: string; hl?: boolean }[]; ref: Tri; a: [number, number] };
type Lesson = { id: string; name: Tri; desc: Tri; color: string; examples: Example[] };

const STORE = "tajweed-progress-v1";

const p = (t: string) => ({ t });
const h = (t: string) => ({ t, hl: true });


const LESSONS: Lesson[] = [
  {
    id: "intro-makharij",
    name: ["مەخرەجی پیتەکان", "مخارج الحروف", "Articulation Points"],
    desc: [
      "هەر پیتێکی عەرەبی شوێنێکی دیاریکراوی دەرچوونی هەیە لە دەم و گەروودا. دروست دەرکردنی پیتەکان بنەمای تەجویدە.",
      "لكل حرف عربي مخرج محدد في الفم والحلق. إخراج الحرف من مخرجه الصحيح هو أساس التجويد.",
      "Every Arabic letter has a precise point of articulation in the throat or mouth. Correct articulation is the foundation of Tajweed.",
    ],
    color: "#38bdf8",
    examples: [
      { parts: [p("قُلْ هُوَ اللَّهُ أَ"), h("حَ"), p("دٌ")], ref: ["ئیخلاص ١", "الإخلاص ١", "Al-Ikhlas 1"], a: [112, 1] },
      { parts: [h("ع"), p("َمَّ يَتَسَاءَلُونَ")], ref: ["نەبە ١", "النبأ ١", "An-Naba 1"], a: [78, 1] },
    ],
  },
  {
    id: "noon-sakinah-idhhar",
    name: ["ئیظهار", "الإظهار", "Idhhār (Clear pronunciation)"],
    desc: [
      "ئەگەر نوونی ساکن یان تەنوین پێش یەکێک لە پیتەکانی گەروو (ء ه ع ح غ خ) بێت، بە ڕوونی دەخوێنرێتەوە بێ غونە.",
      "إذا جاء بعد النون الساكنة أو التنوين أحد حروف الحلق (ء ه ع ح غ خ) تُنطق النون واضحة بلا غنّة.",
      "When nūn sākinah or tanwīn is followed by a throat letter (ء ه ع ح غ خ), the nūn is pronounced clearly with no nasalization.",
    ],
    color: "#22c55e",
    examples: [
      { parts: [p("مِ"), h("نْ ح"), p("َكِيمٍ حَمِيدٍ")], ref: ["فوسسیلەت ٤٢", "فصلت ٤٢", "Fussilat 42"], a: [41, 42] },
      { parts: [p("يَنْ"), h("ئ"), p("َوْنَ")], ref: ["ئەنعام ٢٦", "الأنعام ٢٦", "Al-Anʿam 26"], a: [6, 26] },
    ],
  },
  {
    id: "idgham",
    name: ["ئیدغام", "الإدغام", "Idghām (Merging)"],
    desc: [
      "نوونی ساکن یان تەنوین دەتوێتەوە لە پیتەکانی (ی ر م ل و ن). لەگەڵ (ی ن م و) بە غونەوە، لەگەڵ (ل ر) بێ غونە.",
      "تُدغم النون الساكنة أو التنوين في حروف (ي ر م ل و ن): مع (ينمو) بغنّة، ومع (ل ر) بغير غنّة.",
      "Nūn sākinah or tanwīn merges into (ي ر م ل و ن): with nasalization for ينمو, without it for ل and ر.",
    ],
    color: "#a855f7",
    examples: [
      { parts: [p("مَ"), h("نْ يَ"), p("عْمَلْ")], ref: ["زەلزەلە ٧", "الزلزلة ٧", "Az-Zalzalah 7"], a: [99, 7] },
      { parts: [p("مِ"), h("نْ رَ"), p("بِّهِمْ")], ref: ["بەقەرە ٥", "البقرة ٥", "Al-Baqarah 5"], a: [2, 5] },
    ],
  },
  {
    id: "iqlab",
    name: ["ئیقلاب", "الإقلاب", "Iqlāb (Conversion)"],
    desc: [
      "ئەگەر دوای نوونی ساکن یان تەنوین پیتی (ب) هات، نوون دەگۆڕدرێت بۆ (م) بە غونەوە.",
      "إذا جاء بعد النون الساكنة أو التنوين حرف الباء تُقلب النون ميماً مع الغنّة.",
      "When nūn sākinah or tanwīn is followed by (ب), the nūn turns into a hidden mīm with nasalization.",
    ],
    color: "#f97316",
    examples: [
      { parts: [p("مِ"), h("نْ بَ"), p("عْدِ")], ref: ["بەقەرە ٢٧", "البقرة ٢٧", "Al-Baqarah 27"], a: [2, 27] },
      { parts: [p("سَمِيعٌ"), h(" بَ"), p("صِيرٌ")], ref: ["ئیسرا ١", "الإسراء ١", "Al-Isra 1"], a: [17, 1] },
    ],
  },
  {
    id: "ikhfa",
    name: ["ئیخفا", "الإخفاء", "Ikhfāʾ (Hiding)"],
    desc: [
      "لەگەڵ ١٥ پیتی ماوە، نوونی ساکن یان تەنوین بە شێوەیەکی نێوان ئیظهار و ئیدغام دەخوێنرێت بە غونەی دوو حەرەکە.",
      "مع الحروف الخمسة عشر الباقية تُنطق النون بصفة بين الإظهار والإدغام مع غنّة بمقدار حركتين.",
      "With the remaining fifteen letters, the nūn is pronounced between clear and merged, with a two-count nasalization.",
    ],
    color: "#eab308",
    examples: [
      { parts: [p("أَ"), h("نْ ت"), p("َقُولُوا")], ref: ["مائیدە ١٩", "المائدة ١٩", "Al-Maidah 19"], a: [5, 19] },
      { parts: [p("مِ"), h("نْ ش"), p("َرِّ")], ref: ["فەلەق ٢", "الفلق ٢", "Al-Falaq 2"], a: [113, 2] },
    ],
  },
  {
    id: "meem-sakinah",
    name: ["حوکمەکانی میمی ساکن", "أحكام الميم الساكنة", "Rules of Mīm Sākinah"],
    desc: [
      "میمی ساکن سێ حوکمی هەیە: ئیخفای شەفەوی (پێش ب)، ئیدغامی مثلین (پێش م)، ئیظهاری شەفەوی (لەگەڵ ئەوانی تر).",
      "للميم الساكنة ثلاثة أحكام: الإخفاء الشفوي قبل الباء، وإدغام المثلين قبل الميم، والإظهار الشفوي مع باقي الحروف.",
      "Mīm sākinah has three rules: labial ikhfāʾ before ب, merging before م, and clear pronunciation with all other letters.",
    ],
    color: "#06b6d4",
    examples: [
      { parts: [p("تَرْمِيهِ"), h("مْ بِ"), p("حِجَارَةٍ")], ref: ["فیل ٤", "الفيل ٤", "Al-Fil 4"], a: [105, 4] },
      { parts: [p("لَهُ"), h("مْ مَ"), p("ا يَشَاءُونَ")], ref: ["زومەر ٣٤", "الزمر ٣٤", "Az-Zumar 34"], a: [39, 34] },
    ],
  },
  {
    id: "ghunnah",
    name: ["غونەی موشەددەد", "الغنّة المشدّدة", "Ghunnah (Nasalization)"],
    desc: [
      "هەر نوون و میمێکی شەددەدار بە غونەی دوو حەرەکە دەخوێنرێتەوە لە لووتەوە.",
      "كل نون أو ميم مشدّدة تُنطق بغنّة مقدارها حركتان من الخيشوم.",
      "Every doubled nūn or mīm is held with a two-count nasal sound.",
    ],
    color: "#ec4899",
    examples: [
      { parts: [p("إِ"), h("نَّ"), p(" الْإِنسَانَ")], ref: ["عەسر ٢", "العصر ٢", "Al-ʿAsr 2"], a: [103, 2] },
      { parts: [h("ثُمَّ"), p(" كَلَّا سَوْفَ تَعْلَمُونَ")], ref: ["تەکاسور ٤", "التكاثر ٤", "At-Takathur 4"], a: [102, 4] },
    ],
  },
  {
    id: "qalqalah",
    name: ["قەلقەلە", "القلقلة", "Qalqalah (Echo)"],
    desc: [
      "پیتەکانی (ق ط ب ج د) کاتێک ساکن بن بە دەنگێکی لەرزۆک و ئەکۆدار دەردەچن.",
      "حروف (ق ط ب ج د) إذا سكنت تُنطق باهتزاز وصدى في المخرج.",
      "The letters (ق ط ب ج د) produce a bouncing echo when they carry sukūn.",
    ],
    color: "#ef4444",
    examples: [
      { parts: [p("قُلْ أَعُوذُ بِرَ"), h("بِّ"), p(" الْفَلَ"), h("قْ")], ref: ["فەلەق ١", "الفلق ١", "Al-Falaq 1"], a: [113, 1] },
      { parts: [p("وَتَ"), h("بَّ"), p("")], ref: ["مەسەد ١", "المسد ١", "Al-Masad 1"], a: [111, 1] },
    ],
  },
  {
    id: "madd-tabii",
    name: ["مەددی سروشتی", "المدّ الطبيعي", "Natural Madd"],
    desc: [
      "درێژکردنەوەی دوو حەرەکە لەگەڵ (ا و ی) کاتێک هیچ هەمزە یان سوکوونێکیان بەدوادا نەیەت.",
      "مدّ حركتين مع حروف المدّ (ا و ي) إذا لم يأتِ بعدها همز أو سكون.",
      "A two-count elongation on (ا و ي) when not followed by a hamzah or sukūn.",
    ],
    color: "#14b8a6",
    examples: [
      { parts: [p("قَ"), h("ا"), p("لَ نُ"), h("و"), p("حٌ")], ref: ["نوح", "نوح", "Nuh"], a: [71, 1] },
      { parts: [p("الرَّحْمَ"), h("ٰ"), p("نِ الرَّحِ"), h("ي"), p("مِ")], ref: ["فاتیحە ٣", "الفاتحة ٣", "Al-Fatiha 3"], a: [1, 3] },
    ],
  },
  {
    id: "madd-muttasil",
    name: ["مەددی واجبی موتەصیل", "المدّ الواجب المتّصل", "Madd Wājib Muttaṣil"],
    desc: [
      "ئەگەر هەمزە دوای پیتی مەدد بێت لە هەمان وشەدا، بە ٤ تا ٥ حەرەکە درێژ دەکرێتەوە.",
      "إذا جاء الهمز بعد حرف المدّ في الكلمة نفسها يُمدّ أربع أو خمس حركات وجوباً.",
      "When a hamzah follows a madd letter in the same word, it is stretched 4–5 counts.",
    ],
    color: "#8b5cf6",
    examples: [
      { parts: [p("وَالسَّمَ"), h("اءِ"), p(" ذَاتِ الْبُرُوجِ")], ref: ["بوروج ١", "البروج ١", "Al-Buruj 1"], a: [85, 1] },
      { parts: [p("جَ"), h("اءَ"), p(" نَصْرُ اللَّهِ")], ref: ["نەسر ١", "النصر ١", "An-Nasr 1"], a: [110, 1] },
    ],
  },
  {
    id: "madd-lazim",
    name: ["مەددی لازم", "المدّ اللازم", "Madd Lāzim"],
    desc: [
      "کاتێک دوای پیتی مەدد سوکوونی جێگیر یان شەددە بێت، بە شەش حەرەکە درێژ دەکرێتەوە.",
      "إذا جاء بعد حرف المدّ سكون أصلي أو شدّة يُمدّ ستّ حركات لزوماً.",
      "When a permanent sukūn or shaddah follows a madd letter, it is stretched six counts.",
    ],
    color: "#f43f5e",
    examples: [
      { parts: [p("وَلَا "), h("الضَّالِّينَ")], ref: ["فاتیحە ٧", "الفاتحة ٧", "Al-Fatiha 7"], a: [1, 7] },
      { parts: [h("الم")], ref: ["بەقەرە ١", "البقرة ١", "Al-Baqarah 1"], a: [2, 1] },
    ],
  },
  {
    id: "lam-shamsiyyah",
    name: ["لامی شەمسی و قەمەری", "اللام الشمسية والقمرية", "Solar & Lunar Lām"],
    desc: [
      "لامی شەمسی نانووسرێتەوە بەڵکو دەتوێتەوە لە پیتی دوای، بەڵام لامی قەمەری بە ڕوونی دەخوێنرێت.",
      "اللام الشمسية تُدغم في الحرف بعدها ولا تُنطق، واللام القمرية تُنطق ظاهرة.",
      "Solar lām assimilates into the next letter, lunar lām is pronounced clearly.",
    ],
    color: "#0ea5e9",
    examples: [
      { parts: [p("ا"), h("لشَّ"), p("مْسُ")], ref: ["شەمس ١", "الشمس ١", "Ash-Shams 1"], a: [91, 1] },
      { parts: [p("ا"), h("لْقَ"), p("مَرُ")], ref: ["قەمەر ١", "القمر ١", "Al-Qamar 1"], a: [54, 1] },
    ],
  },
  {
    id: "tafkhim",
    name: ["تەفخیم و تەرقیق", "التفخيم والترقيق", "Tafkhīm & Tarqīq"],
    desc: [
      "هەندێ پیت بە قوڵی و ئەستووری دەردەچن (خ ص ض غ ط ق ظ)، وە هەندێکی تر بە باریکی.",
      "حروف الاستعلاء (خص ضغط قظ) تُنطق مفخّمة، وباقي الحروف تُرقّق.",
      "The elevated letters (خ ص ض غ ط ق ظ) are pronounced heavy; the rest are light.",
    ],
    color: "#d97706",
    examples: [
      { parts: [p("ا"), h("لصِّرَ"), p("اطَ الْمُسْتَقِيمَ")], ref: ["فاتیحە ٦", "الفاتحة ٦", "Al-Fatiha 6"], a: [1, 6] },
      { parts: [h("اللَّهُ"), p(" لَا إِلَٰهَ إِلَّا هُوَ")], ref: ["بەقەرە ٢٥٥", "البقرة ٢٥٥", "Al-Baqarah 255"], a: [2, 255] },
    ],
  },
  {
    id: "waqf",
    name: ["وەقف و ئیبتیدا", "الوقف والابتداء", "Stopping & Starting"],
    desc: [
      "زانینی شوێنی ڕاوەستان لە خوێندنەواندا مانا دەپارێزێت؛ نیشانەکانی (م ج ص لا) ڕێنمایی دەکەن.",
      "معرفة مواضع الوقف تحفظ المعنى، وعلامات الوقف (م ج ص لا) ترشد القارئ.",
      "Knowing where to pause preserves meaning; the marks (م ج ص لا) guide the reciter.",
    ],
    color: "#64748b",
    examples: [
      { parts: [p("الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"), h(" ۝")], ref: ["فاتیحە ٢", "الفاتحة ٢", "Al-Fatiha 2"], a: [1, 2] },
    ],
  },
];

export function TajweedLessons({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const L = (t: Tri) => (lang === "ar" ? t[1] : lang === "en" ? t[2] : t[0]);
  const rtl = lang === "ar" || lang === "ku";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  const [i, setI] = useState(0);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw) as { done?: string[]; last?: number };
        setDone(Array.isArray(s.done) ? s.done : []);
        if (typeof s.last === "number" && s.last >= 0 && s.last < LESSONS.length) setI(s.last);
      }
    } catch { /* ignore */ }
  }, []);

  const save = (nextDone: string[], last: number) => {
    setDone(nextDone);
    try { localStorage.setItem(STORE, JSON.stringify({ done: nextDone, last })); } catch { /* ignore */ }
  };

  const go = (n: number) => {
    setI(n);
    try { localStorage.setItem(STORE, JSON.stringify({ done, last: n })); } catch { /* ignore */ }
  };

  const lesson = LESSONS[i];
  const isDone = done.includes(lesson.id);
  const toggle = () => save(isDone ? done.filter((d) => d !== lesson.id) : [...done, lesson.id], i);
  const pct = Math.round((done.length / LESSONS.length) * 100);

  // --- Stage 1 audio ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const reciter = RECITERS.find((r) => r.id === DEFAULT_RECITER_ID) ?? RECITERS[0];

  const stop = () => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }
    setPlaying(null);
  };
  // stop when leaving the lesson view or switching lesson
  useEffect(() => stop, []);
  useEffect(() => { stop(); }, [i]);

  const play = (key: string, url: string, restart = false) => {
    let a = audioRef.current;
    if (!a) { a = new Audio(); audioRef.current = a; a.onended = () => setPlaying(null); }
    if (playing === key && !restart) { a.pause(); setPlaying(null); return; }
    if (a.src !== url) a.src = url;
    a.currentTime = 0;
    void a.play().then(() => setPlaying(key)).catch(() => setPlaying(null));
  };


  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><BackIcon className="h-5 w-5" /></button>
        <h2 className="font-semibold flex-1">{L(["فێربوونی تەجوید", "تعلّم التجويد", "Learn Tajweed"])}</h2>
        <GraduationCap className="h-5 w-5 text-primary" />
      </div>

      {/* Intro */}
      <div className="rounded-2xl border p-4 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {L([
            "تەجوید زانستی دروست خوێندنەوەی قورئانە: دەرکردنی هەر پیتێک لە شوێنی خۆی لەگەڵ ڕەچاوکردنی سیفەتەکانی. پابەندبوون بە تەجوید مانای ئایەتەکان دەپارێزێت و خوێندنەوە جوانتر دەکات.",
            "التجويد هو علم تلاوة القرآن بإخراج كل حرف من مخرجه مع إعطائه حقّه من الصفات. الالتزام به يحفظ المعنى ويُجمّل التلاوة.",
            "Tajweed is the science of reciting the Qur'an by giving every letter its correct articulation and characteristics. It protects the meaning and beautifies the recitation.",
          ])}
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border p-4 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{L(["پێشکەوتن", "التقدّم", "Progress"])}</span>
          <span className="text-primary font-semibold">{done.length} / {LESSONS.length} · {pct}%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: "var(--gradient-gold)" }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {LESSONS.map((l, idx) => (
            <button key={l.id} onClick={() => go(idx)}
              title={L(l.name)}
              className={`h-7 w-7 rounded-lg text-[11px] font-semibold transition ${idx === i ? "ring-2 ring-primary" : ""}`}
              style={{
                background: done.includes(l.id) ? l.color : "rgba(255,255,255,0.07)",
                color: done.includes(l.id) ? "#fff" : undefined,
              }}>
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson */}
      <div className="rounded-2xl border p-5 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
        <p className="text-xs text-primary">{L(["وانە", "الدرس", "Lesson"])} {i + 1} / {LESSONS.length}</p>
        <div className="mt-1 flex items-start gap-2">
          <span className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ background: lesson.color }} />
          <p className="text-xl font-semibold">{L(lesson.name)}</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{L(lesson.desc)}</p>

        <div className="mt-4 space-y-3">
          {lesson.examples.map((ex, k) => (
            <div key={k} className="rounded-xl border p-3" style={{ borderColor: "var(--glass-border)" }}>
              <p className="font-display text-2xl leading-loose text-center" dir="rtl">
                {ex.parts.map((part, pi) =>
                  part.hl ? (
                    <span key={pi} className="rounded px-0.5" style={{ color: lesson.color, background: `${lesson.color}22` }}>{part.t}</span>
                  ) : (
                    <span key={pi}>{part.t}</span>
                  )
                )}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground text-center">{L(ex.ref)}</p>
            </div>
          ))}
        </div>

        <button onClick={toggle}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-sm"
          style={{ borderColor: "var(--glass-border)", background: isDone ? `${lesson.color}22` : undefined }}>
          {isDone ? <CheckCircle2 className="h-4 w-4" style={{ color: lesson.color }} /> : <Circle className="h-4 w-4" />}
          {isDone ? L(["تەواوکراوە", "مكتمل", "Completed"]) : L(["وەک تەواوکراو نیشانی بکە", "تعليم كمكتمل", "Mark as completed"])}
        </button>

        <div className="mt-3 flex gap-2">
          <button onClick={() => go(Math.max(0, i - 1))} disabled={i === 0}
            className="flex-1 py-2 rounded-xl border disabled:opacity-40" style={{ borderColor: "var(--glass-border)" }}>
            {L(["پێشوو", "السابق", "Previous"])}
          </button>
          <button onClick={() => go(Math.min(LESSONS.length - 1, i + 1))} disabled={i === LESSONS.length - 1}
            className="flex-1 py-2 rounded-xl text-primary-foreground disabled:opacity-40"
            style={{ background: "var(--gradient-gold)" }}>
            {L(["دواتر", "التالي", "Next"])}
          </button>
        </div>
      </div>
    </div>
  );
}
