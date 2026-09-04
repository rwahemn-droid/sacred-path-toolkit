import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Eye, EyeOff, Mic, Square, RotateCcw, Volume2, GraduationCap } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl, type Reciter } from "@/lib/reciters";

// ---------- i18n (5 languages) ----------
type L = { ku: string; bad: string; kmr: string; ar: string; en: string };
const S = {
  title: { ku: "مامۆستای قورئان", bad: "مامۆستای قورئان", kmr: "Mamosteyê Quranê", ar: "معلّم القرآن", en: "Quran Teacher" },
  selectSurah: { ku: "سوورەت هەڵبژێرە", bad: "سوورەتێ هەلبژێرە", kmr: "Sûre hilbijêre", ar: "اختر السورة", en: "Select Surah" },
  selectAyah: { ku: "ئایەت هەڵبژێرە", bad: "ئایەتێ هەلبژێرە", kmr: "Ayete hilbijêre", ar: "اختر الآية", en: "Select Ayah" },
  listen: { ku: "گوێگرتن", bad: "گوهداری", kmr: "Guhdarî", ar: "استمع", en: "Listen" },
  startRec: { ku: "دەستپێکردنی تۆمار", bad: "دەستپێکا تۆمارێ", kmr: "Destpêkirina tomarkirinê", ar: "بدء التسجيل", en: "Start Recording" },
  stopRec: { ku: "وەستانی تۆمار", bad: "ڤەرتینا تۆمارێ", kmr: "Rawestandina tomarkirinê", ar: "إيقاف التسجيل", en: "Stop Recording" },
  playMine: { ku: "گوێگرتن بە تۆمارەکەم", bad: "گوهداریێ ب تۆمارا من", kmr: "Guhdariya tomara min", ar: "تشغيل تسجيلي", en: "Play My Recording" },
  tryAgain: { ku: "دووبارە هەوڵبدەوە", bad: "دیاسا هەوڵ بدە", kmr: "Dîsa biceribîne", ar: "حاول مجدداً", en: "Try Again" },
  back: { ku: "گەڕانەوە", bad: "زڤرین", kmr: "Vegere", ar: "رجوع", en: "Back" },
  micError: { ku: "ڕێگە بە مایکرۆفۆن نەدرا", bad: "ڕێ مایکرۆفۆنی نەهاتە دان", kmr: "Destûr nedan mîkrofonê", ar: "تم رفض إذن الميكروفون", en: "Microphone permission denied" },
  loading: { ku: "باردەکرێت...", bad: "دهێتە بارکرن...", kmr: "Tê barkirin...", ar: "جارٍ التحميل...", en: "Loading..." },
  showQuran: { ku: "👁 پیشاندانی قورئان", bad: "👁 پیشاندانا قورئانێ", kmr: "👁 Quranê nîşan bide", ar: "👁 إظهار القرآن", en: "👁 Show Quran" },
  hideQuran: { ku: "🙈 شاردنەوەی قورئان", bad: "🙈 ڤەشارتنا قورئانێ", kmr: "🙈 Quranê veşêre", ar: "🙈 إخفاء القرآن", en: "🙈 Hide Quran" },
  hifzMode: { ku: "دۆخی حیفز", bad: "مۆدا حیفزێ", kmr: "Moda hifzê", ar: "وضع الحفظ", en: "Hifz Mode" },
} as const;
function t(l: L, lang: Lang) {
  return l[lang as keyof L] ?? l.en;
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toArDigits = (n: number) => String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);

type SurahMeta = { number: number; name: string; englishName: string; numberOfAyahs: number };
type Ayah = { number: number; text: string; numberInSurah: number };

const RECITER_KEY = "ibadah:reciter";
const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

export function QuranTeacher({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const rtl = lang === "ar" || lang === "ku" || lang === "bad";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const PrevIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;

  const [surahNum, setSurahNum] = useState(1);
  const [ayahNum, setAyahNum] = useState(1);
  const [hideQuran, setHideQuran] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const currentAyahRef = useRef<HTMLSpanElement | null>(null);

  const reciter: Reciter = (() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(RECITER_KEY) || DEFAULT_RECITER_ID : DEFAULT_RECITER_ID;
    return RECITERS.find((r) => r.id === id) || RECITERS[0];
  })();

  const { data: surahs } = useQuery<SurahMeta[]>({
    queryKey: ["surah-list"],
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch("https://api.alquran.cloud/v1/surah");
      const j = await res.json();
      return j.data as SurahMeta[];
    },
  });
  const surah = surahs?.find((s) => s.number === surahNum);

  // Full surah text (same alquran.cloud source the app already uses)
  const { data: ayahs, isFetching } = useQuery<Ayah[]>({
    queryKey: ["teacher-surah", surahNum],
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
      const j = await res.json();
      let list = j.data.ayahs as Ayah[];
      // Strip the inline Bismillah from the first ayah (except 1 & 9) since we render it as a header
      if (surahNum !== 1 && surahNum !== 9 && list.length && list[0].text.startsWith(BISMILLAH)) {
        list = list.map((a, i) => (i === 0 ? { ...a, text: a.text.slice(BISMILLAH.length).trim() } : a));
      }
      return list;
    },
  });

  // cleanup: stop mic + audio when leaving Quran Teacher
  useEffect(() => {
    return () => {
      if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
      mediaRef.current?.stream.getTracks().forEach((tr) => tr.stop());
      playerRef.current?.pause();
    };
  }, []);

  // clamp ayah when surah changes; clear recording on selection change
  useEffect(() => {
    if (surah && ayahNum > surah.numberOfAyahs) setAyahNum(1);
  }, [surah, ayahNum]);
  useEffect(() => {
    clearRecording();
    playerRef.current?.pause();
    setListening(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahNum, ayahNum]);

  // keep the current ayah in view while navigating
  useEffect(() => {
    currentAyahRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [ayahNum, surahNum, hideQuran]);

  function listen() {
    playerRef.current?.pause();
    const a = new Audio(ayahAudioUrl(reciter, surahNum, ayahNum));
    playerRef.current = a;
    setListening(true);
    a.onended = () => setListening(false);
    a.onerror = () => setListening(false);
    a.play().catch(() => setListening(false));
  }
  function stopListening() {
    playerRef.current?.pause();
    setListening(false);
  }

  async function startRecording() {
    setMicError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((tr) => tr.stop());
      };
      mr.start();
      setRecording(true);
    } catch {
      setMicError(true);
    }
  }
  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    setRecording(false);
  }
  function clearRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  }

  function goAyah(delta: number) {
    if (!surah) return;
    const next = ayahNum + delta;
    if (next >= 1 && next <= surah.numberOfAyahs) setAyahNum(next);
  }

  const btn = "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition hover:border-primary/50 backdrop-blur-xl";
  const style = { background: "var(--glass-bg)", borderColor: "var(--glass-border)" };
  const total = surah?.numberOfAyahs ?? 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="rounded-3xl border p-5 backdrop-blur-xl" style={style}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border" style={style} aria-label={t(S.back, lang)}>
            <BackIcon className="h-4 w-4" />
          </button>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-primary-foreground" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{t(S.title, lang)}</h2>
            {surah && <p className="text-xs text-muted-foreground truncate">{surah.name} · {surah.englishName}</p>}
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">{t(S.selectSurah, lang)}</span>
          <select
            value={surahNum}
            onChange={(e) => { setSurahNum(Number(e.target.value)); setAyahNum(1); }}
            className="w-full rounded-2xl border bg-background px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--glass-border)" }}
          >
            {surahs?.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.name} — {s.englishName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">{t(S.selectAyah, lang)}</span>
          <select
            value={ayahNum}
            onChange={(e) => setAyahNum(Number(e.target.value))}
            className="w-full rounded-2xl border bg-background px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--glass-border)" }}
          >
            {Array.from({ length: total || 7 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Mushaf-style reading view */}
      <div className="rounded-3xl border backdrop-blur-xl overflow-hidden" style={style}>
        {/* Surah header ornament */}
        <div className="border-b px-4 py-3 text-center" style={{ borderColor: "var(--glass-border)", background: "linear-gradient(135deg, rgba(5,150,105,.08), rgba(16,185,129,.04))" }}>
          <p dir="rtl" lang="ar" className="font-amiri text-xl font-semibold">{surah?.name ?? ""}</p>
        </div>

        <div dir="rtl" lang="ar" className="max-h-[46vh] overflow-y-auto px-5 py-6">
          {isFetching || !ayahs ? (
            <p className="text-center text-sm text-muted-foreground">{t(S.loading, lang)}</p>
          ) : (
            <div className={hideQuran ? "select-none" : ""}>
              {surahNum !== 9 && (
                <p className={`font-amiri text-center text-2xl leading-loose mb-4 transition ${hideQuran ? "text-transparent select-none" : ""}`}>{BISMILLAH}</p>
              )}
              <p className="font-amiri text-[1.7rem] leading-[2.6] text-justify">
                {ayahs.map((a) => {
                  const active = a.numberInSurah === ayahNum;
                  return (
                    <span
                      key={a.numberInSurah}
                      ref={active ? currentAyahRef : undefined}
                      onClick={() => setAyahNum(a.numberInSurah)}
                      className={`cursor-pointer rounded-lg px-0.5 transition-colors ${
                        hideQuran
                        ? `text-transparent select-none ${active ? "bg-primary/15" : ""}`
                          : active
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-primary/10"
                      }`}
                    >
                      {a.text}
                      <span className={`mx-1 inline-grid h-7 w-7 place-items-center rounded-full border align-middle text-sm ${active && !hideQuran ? "border-primary text-primary" : "border-muted-foreground/40 text-muted-foreground"}`}>
                        {toArDigits(a.numberInSurah)}
                      </span>
                    </span>
                  );
                })}
              </p>
            </div>
          )}
        </div>

        {/* Ayah navigation + Hifz toggle */}
        <div className="flex items-center gap-2 border-t px-3 py-2.5" style={{ borderColor: "var(--glass-border)" }}>
          <button onClick={() => goAyah(-1)} disabled={ayahNum <= 1} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border disabled:opacity-40" style={style} aria-label="Previous ayah">
            <PrevIcon className="h-4 w-4" />
          </button>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{ayahNum} / {total}</span>
          <button onClick={() => goAyah(1)} disabled={ayahNum >= total} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border disabled:opacity-40" style={style} aria-label="Next ayah">
            <NextIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setHideQuran((v) => !v)}
            className={`${btn} flex-1 !py-2 ${hideQuran ? "border-primary/60 text-primary" : ""}`}
            style={style}
            aria-label={t(S.hifzMode, lang)}
          >
            {hideQuran ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="truncate">{hideQuran ? t(S.showQuran, lang) : t(S.hideQuran, lang)}</span>
          </button>
        </div>
      </div>

      {/* Listen */}
      <button onClick={listening ? stopListening : listen} className={`${btn} w-full`} style={style}>
        <Volume2 className="h-4 w-4" />
        {listening ? t(S.stopRec, lang) : t(S.listen, lang)}
        <span className="text-xs text-muted-foreground">· {reciter.name}</span>
      </button>

      {/* Recording controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!recording ? (
          <button onClick={startRecording} className={`${btn} text-red-500`} style={style}>
            <Mic className="h-4 w-4" /> {t(S.startRec, lang)}
          </button>
        ) : (
          <button onClick={stopRecording} className={`${btn} animate-pulse text-red-500`} style={style}>
            <Square className="h-4 w-4" /> {t(S.stopRec, lang)}
          </button>
        )}
        {audioUrl && !recording && (
          <div className="flex gap-2">
            <audio controls src={audioUrl} className="h-11 flex-1 min-w-0" aria-label={t(S.playMine, lang)} />
            <button onClick={clearRecording} className={btn} style={style} aria-label={t(S.tryAgain, lang)}>
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {micError && <p className="text-center text-sm text-destructive">{t(S.micError, lang)}</p>}
    </div>
  );
}
