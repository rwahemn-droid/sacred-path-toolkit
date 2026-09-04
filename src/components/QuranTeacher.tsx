import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Mic, Square, RotateCcw, Volume2, GraduationCap } from "lucide-react";
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
} as const;
function t(l: L, lang: Lang) {
  return l[lang as keyof L] ?? l.en;
}

type SurahMeta = { number: number; name: string; englishName: string; numberOfAyahs: number };

const RECITER_KEY = "ibadah:reciter";

export function QuranTeacher({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const rtl = lang === "ar" || lang === "ku" || lang === "bad";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  const [surahNum, setSurahNum] = useState(1);
  const [ayahNum, setAyahNum] = useState(1);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const playerRef = useRef<HTMLAudioElement | null>(null);

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

  const { data: ayahText, isFetching } = useQuery<string>({
    queryKey: ["teacher-ayah", surahNum, ayahNum],
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/quran-uthmani`);
      const j = await res.json();
      return j.data.text as string;
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

  const btn = "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition hover:border-primary/50 backdrop-blur-xl";
  const style = { background: "var(--glass-bg)", borderColor: "var(--glass-border)" };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="rounded-3xl border p-5 backdrop-blur-xl" style={style}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-xl border" style={style} aria-label={t(S.back, lang)}>
            <BackIcon className="h-4 w-4" />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-2xl text-primary-foreground" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">{t(S.title, lang)}</h2>
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
            {Array.from({ length: surah?.numberOfAyahs ?? 7 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Ayah text */}
      <div className="rounded-3xl border p-6 backdrop-blur-xl text-center" style={style}>
        {isFetching ? (
          <p className="text-sm text-muted-foreground">{t(S.loading, lang)}</p>
        ) : (
          <p dir="rtl" lang="ar" className="font-amiri text-2xl leading-[2.4]">{ayahText}</p>
        )}
        {surah && (
          <p className="mt-3 text-xs text-muted-foreground">
            {surah.englishName} · {ayahNum} / {surah.numberOfAyahs}
          </p>
        )}
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
