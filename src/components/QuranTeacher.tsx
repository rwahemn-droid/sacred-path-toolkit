import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Eye, EyeOff, Mic, Square, RotateCcw, Volume2, GraduationCap, Play, Pause, Repeat2, BookOpen, Circle } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl, type Reciter } from "@/lib/reciters";
import { compareRecitation, saveResult, getSavedResult, type RecitationResult } from "@/lib/recitation-check";
import { RecitationResultCard } from "./RecitationResultCard";
import { TajweedAyah } from "./TajweedAyah";

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
  reciter: { ku: "قاری", bad: "قاری", kmr: "Qarî", ar: "القارئ", en: "Reciter" },
  replay: { ku: "دووبارەکردنەوە", bad: "دووبارەکرن", kmr: "Dîsa bike", ar: "إعادة الآية", en: "Replay ayah" },
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
function normalizeArabic(text: string) {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/ـ/g, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .trim();
}
export function QuranTeacher({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const rtl = lang === "ar" || lang === "ku" || lang === "bad";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const PrevIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;

  const [surahNum, setSurahNum] = useState(1);
  const [ayahNum, setAyahNum] = useState(1);
  const [hideQuran, setHideQuran] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  useEffect(() => {
    if (!recording) return;
    setRecSecs(0);
    const id = setInterval(() => setRecSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState(0);
  const [liveListening, setLiveListening] = useState(false);
  const [reciterId, setReciterId] = useState(() => typeof window !== "undefined" ? localStorage.getItem(RECITER_KEY) || DEFAULT_RECITER_ID : DEFAULT_RECITER_ID);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const currentAyahRef = useRef<HTMLSpanElement | null>(null);

  const reciter: Reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<RecitationResult | null>(null);
  const checkRef = useRef<any>(null);
  useEffect(() => {
    checkRef.current?.abort?.();
    setChecking(false);
    setCheckResult(null);
  }, [surahNum, ayahNum]);
  useEffect(() => () => checkRef.current?.abort?.(), []);

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
      recognitionRef.current?.stop();
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
    setAudioProgress(0);
    setAudioDuration(0);
    a.onloadedmetadata = () => setAudioDuration(Number.isFinite(a.duration) ? a.duration : 0);
    a.ontimeupdate = () => setAudioProgress(a.currentTime);
    a.onended = () => {
  setListening(false);
  setAudioProgress(a.duration || 0);

  if (surah && ayahNum < surah.numberOfAyahs) {
    setAyahNum(ayahNum + 1);
  }
};
    a.onerror = () => setListening(false);
    a.play().catch(() => setListening(false));
  }
  function stopListening() {
    playerRef.current?.pause();
    setListening(false);
  }
  function replayAyah() {
    if (!playerRef.current || playerRef.current.src !== ayahAudioUrl(reciter, surahNum, ayahNum)) {
      listen();
      return;
    }
    playerRef.current.currentTime = 0;
    setAudioProgress(0);
    setListening(true);
    playerRef.current.play().catch(() => setListening(false));
  }
  function selectReciter(id: string) {
    stopListening();
    setAudioProgress(0);
    setAudioDuration(0);
    setReciterId(id);
    localStorage.setItem(RECITER_KEY, id);
  }
  function seekAudio(value: number) {
    if (!playerRef.current) return;
    playerRef.current.currentTime = value;
    setAudioProgress(value);
  }
function startLiveHifz() {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setMicError(true);
    return;
  }

  const currentAyah = ayahs?.find(
    (a) => a.numberInSurah === ayahNum
  );

  if (!currentAyah) return;

  const expectedWords = normalizeArabic(currentAyah.text)
    .split(/\s+/)
    .filter(Boolean);

  setRecognizedWords(0);
  setMicError(false);

  const recognition = new SpeechRecognition();

  recognition.lang = "ar-SA";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    setLiveListening(true);
  };

  recognition.onend = () => {
    setLiveListening(false);
  };

  recognition.onerror = () => {
    setLiveListening(false);
    setMicError(true);
  };

  recognition.onresult = (event: any) => {
    let transcript = "";

    for (let i = 0; i < event.results.length; i++) {
      transcript += " " + event.results[i][0].transcript;
    }

    const heardWords = normalizeArabic(transcript)
      .split(/\s+/)
      .filter(Boolean);

    let matched = 0;
    let heardIndex = 0;

    for (
      let expectedIndex = 0;
      expectedIndex < expectedWords.length &&
      heardIndex < heardWords.length;
    ) {
      if (
        heardWords[heardIndex] === expectedWords[expectedIndex]
      ) {
        matched++;
        expectedIndex++;
      }

      heardIndex++;
    }

    setRecognizedWords((prev) => Math.max(prev, matched));
const lastWord = expectedWords[expectedWords.length - 1];

const finishedAyah =
  matched >= expectedWords.length ||
  (
    heardWords.length >= Math.max(1, expectedWords.length - 1) &&
    heardWords.slice(-3).includes(lastWord)
  );

if (finishedAyah) {
  recognition.stop();

  setTimeout(() => {
    goAyah(1);
    setRecognizedWords(0);
  }, 300);
}
if (expectedWords.length > 0 && matched >= expectedWords.length) {
  recognition.onresult = null;
  recognition.stop();

  setTimeout(() => {
    goAyah(1);
    setRecognizedWords(0);
  }, 300);
}
  };

  recognitionRef.current = recognition;
  recognition.start();
}

function stopLiveHifz() {
  recognitionRef.current?.stop();
  setLiveListening(false);
}

  // Recitation mistake detection (word-level, v1)
  function startCheck() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setMicError(true); return; }
    const ayah = ayahs?.find((a) => a.numberInSurah === ayahNum);
    if (!ayah) return;
    stopListening();
    setMicError(false);
    setCheckResult(null);
    const key = `${surahNum}:${ayahNum}`;
    const rec = new SR();
    rec.lang = "ar-SA";
    rec.continuous = true;
    rec.interimResults = true;
    let transcript = "";
    rec.onstart = () => setChecking(true);
    rec.onresult = (event: any) => {
      let s = "";
      for (let i = 0; i < event.results.length; i++) s += " " + event.results[i][0].transcript;
      transcript = s;
    };
    rec.onerror = (e: any) => { if (e?.error !== "no-speech" && e?.error !== "aborted") setMicError(true); };
    rec.onend = () => {
      setChecking(false);
      if (!transcript.trim()) return;
      const r = compareRecitation(key, ayah.text, transcript);
      saveResult(r);
      setCheckResult(r);
    };
    checkRef.current = rec;
    rec.start();
  }
  function stopCheck() {
    checkRef.current?.stop();
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

  const total = surah?.numberOfAyahs ?? 0;
  const reciterName = RECITERS.find((r) => r.id === reciterId)?.name ?? "";
  const currentAyah = ayahs?.find((a) => a.numberInSurah === ayahNum);
  const recMins = String(Math.floor(recSecs / 60)).padStart(2, "0");
  const recRem = String(recSecs % 60).padStart(2, "0");
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const glass = "rounded-3xl border border-sky-200/10 bg-white/[0.04] backdrop-blur-md shadow-[0_8px_30px_rgba(2,8,23,0.45)]";
  const mode = "flex flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2.5 text-[11px] font-medium transition active:scale-95";
  const modeOff = "border-sky-200/10 bg-white/[0.04] text-white/75 hover:border-sky-300/30";

  return (
    <section className="fixed inset-0 z-[60] flex h-dvh flex-col overflow-hidden bg-[#081225] text-white animate-in fade-in duration-300">
      <header className="shrink-0 bg-[#081225]/95 px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 transition active:scale-95 hover:bg-white/10" aria-label={t(S.back, lang)}>
              <BackIcon className="h-4 w-4" />
            </button>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold leading-tight">{t(S.title, lang)}</h1>
              <p dir="ltr" className="truncate text-[11px] tracking-wide text-sky-200/60">Learn • Recite • Memorize</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t(S.selectSurah, lang)}</span>
              <select value={surahNum} onChange={(e) => { setSurahNum(Number(e.target.value)); setAyahNum(1); }} className="h-11 w-full truncate rounded-2xl border border-sky-200/10 bg-white/[0.05] px-4 text-sm font-medium text-white outline-none focus:border-sky-300/50">
                {surahs?.map((s) => <option key={s.number} value={s.number} className="bg-[#0B1A33] text-white">{s.number}. {s.name} — {s.englishName}</option>)}
              </select>
            </label>
            <label className="w-24 shrink-0">
              <span className="sr-only">{t(S.selectAyah, lang)}</span>
              <select value={ayahNum} onChange={(e) => setAyahNum(Number(e.target.value))} className="h-11 w-full rounded-2xl border border-sky-200/10 bg-white/[0.05] px-2 text-center text-sm text-white outline-none focus:border-sky-300/50">
                {Array.from({ length: total || 7 }, (_, i) => i + 1).map((n) => <option key={n} value={n} className="bg-[#0B1A33] text-white">{n}</option>)}
              </select>
            </label>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        <div className="mx-auto w-full max-w-xl space-y-4">
          {/* Focus card: current ayah */}
          <div key={`${surahNum}-${ayahNum}`} className="rounded-3xl border border-sky-300/15 bg-gradient-to-b from-[#12284A] to-[#0C1C38] p-5 shadow-[0_12px_40px_rgba(2,8,23,0.55)] animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-[11px]">
              <span className="rounded-full bg-sky-400/15 px-3 py-1 font-medium text-sky-200">{surah?.englishName ?? ""}</span>
              <span className="rounded-full border border-white/10 px-3 py-1 tabular-nums text-white/70">{ayahNum} / {total}</span>
            </div>
            <p dir="rtl" lang="ar" className="mt-2 text-center font-amiri text-lg text-sky-100/80">{surah?.name ?? ""}</p>
            <div dir="rtl" lang="ar" className="mt-3 min-h-[5rem] text-center font-amiri text-[1.7rem] leading-[2.2] text-white sm:text-[1.9rem]">
              {!currentAyah ? (
                <span className="text-sm text-white/40">{t(S.loading, lang)}</span>
              ) : hideQuran ? (
                currentAyah.text.split(/\s+/).map((word, i) => <span key={i} className={i < recognizedWords ? "visible" : "invisible"}>{word}{" "}</span>)
              ) : <TajweedAyah surah={surahNum} ayah={ayahNum} fallback={currentAyah.text} lang={lang} onListen={replayAyah} onPractice={startCheck} />}
              {currentAyah && <span className="mx-1.5 inline-grid h-7 w-7 place-items-center rounded-full border border-sky-300/40 align-middle text-xs text-sky-200">{toArDigits(ayahNum)}</span>}
            </div>
          </div>

          {checking && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 py-2 text-xs text-red-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> 🎙️ …
            </div>
          )}
          {checkResult && !checking && (
            <RecitationResultCard result={checkResult} lang={lang} best={getSavedResult(checkResult.key)?.best}
              onRetry={() => { setCheckResult(null); startCheck(); }} onListen={replayAyah} />
          )}

          {/* Mode cards */}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={listening ? stopListening : listen} className={`${mode} ${listening ? "border-sky-300/50 bg-sky-400/15 text-sky-200" : modeOff}`}>
              <Volume2 className="h-5 w-5" /><span className="truncate">{t(S.listen, lang)}</span>
            </button>
            <button onClick={() => { if (hideQuran) { if (liveListening) stopLiveHifz(); else startLiveHifz(); } else if (checking) stopCheck(); else startCheck(); }} className={`${mode} ${liveListening || checking ? "border-red-400/50 bg-red-500/10 text-red-200" : modeOff}`}>
              {liveListening || checking ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}<span className="truncate">Recite</span>
            </button>
            <button onClick={() => setHideQuran((v) => !v)} className={`${mode} ${hideQuran ? "border-sky-300/50 bg-sky-400/15 text-sky-200" : modeOff}`} aria-label={t(S.hifzMode, lang)}>
              {hideQuran ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}<span className="truncate">{hideQuran ? t(S.showQuran, lang) : t(S.hifzMode, lang)}</span>
            </button>
            <button onClick={recording ? stopRecording : startRecording} className={`${mode} ${recording ? "border-red-400/50 bg-red-500/10 text-red-200" : modeOff}`}>
              {recording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}<span className="truncate">{recording ? t(S.stopRec, lang) : "Record"}</span>
            </button>
          </div>

          {recording && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 py-2 text-xs text-red-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> REC <span className="tabular-nums">{recMins}:{recRem}</span>
            </div>
          )}
          {audioUrl && !recording && (
            <div className={`${glass} flex items-center gap-2 p-2`}>
              <audio controls src={audioUrl} className="h-10 min-w-0 flex-1" aria-label={t(S.playMine, lang)} />
              <button onClick={clearRecording} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 active:scale-95" aria-label={t(S.tryAgain, lang)}><RotateCcw className="h-4 w-4" /></button>
            </div>
          )}
          {micError && <p className="rounded-2xl border border-red-400/20 bg-red-500/10 py-2 text-center text-xs text-red-200">{t(S.micError, lang)}</p>}

          {/* Full surah page */}
          <div dir="rtl" lang="ar" className={`${glass} px-4 py-6 sm:px-6`}>
            {isFetching || !ayahs ? (
              <p className="text-center text-sm text-white/40">{t(S.loading, lang)}</p>
            ) : (
              <div className={hideQuran ? "select-none" : ""}>
                {surahNum !== 9 && (
                  <p className={`mb-5 text-center font-amiri text-[1.4rem] leading-loose text-sky-100 ${hideQuran ? "invisible" : ""}`}>{BISMILLAH}</p>
                )}
                <p className="text-center font-amiri text-[1.35rem] leading-[2.3] text-white/85 sm:text-[1.55rem]">
                  {ayahs.map((a) => {
                    const active = a.numberInSurah === ayahNum;
                    return (
                      <span key={a.numberInSurah} ref={active ? currentAyahRef : undefined} onClick={() => setAyahNum(a.numberInSurah)}
                        className={`cursor-pointer rounded-md transition-colors ${hideQuran ? "" : active ? "bg-sky-400/15 text-white" : "hover:bg-white/5"}`}>
                        {hideQuran && active ? (
                          <>{a.text.split(/\s+/).map((word, index) => <span key={index} className={index < recognizedWords ? "visible" : "invisible"}>{word}{" "}</span>)}</>
                        ) : <span className={hideQuran ? "invisible" : ""}>{a.text}</span>}
                        <span className={`mx-1.5 inline-grid h-6 w-6 place-items-center rounded-full border align-middle text-[10px] leading-none ${active ? "border-sky-300 bg-sky-400/20 text-sky-100" : "border-sky-300/30 text-sky-200/70"}`}>
                          {toArDigits(a.numberInSurah)}
                        </span>
                      </span>
                    );
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-3 pb-[max(.7rem,env(safe-area-inset-bottom))] pt-1">
        <div className={`${glass} mx-auto w-full max-w-xl space-y-2 bg-[#0E1E3A]/90 p-3`}>
          <div className="flex items-center gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t(S.reciter, lang)}</span>
              <select value={reciterId} onChange={(e) => selectReciter(e.target.value)} className="h-9 w-full truncate rounded-xl border border-white/10 bg-white/[0.05] px-3 text-xs font-medium text-white outline-none focus:border-sky-300/50" title={reciterName}>
                {RECITERS.map((r) => <option key={r.id} value={r.id} className="bg-[#0B1A33] text-white">{r.name}</option>)}
              </select>
            </label>
            <span dir="ltr" className="shrink-0 text-[10px] tabular-nums text-white/45">{fmt(audioProgress)} / {fmt(audioDuration)}</span>
          </div>
          <input aria-label="Audio progress" type="range" min={0} max={audioDuration || 1} step="0.1" value={Math.min(audioProgress, audioDuration || 1)} onChange={(e) => seekAudio(Number(e.target.value))} className="h-1 w-full accent-sky-400 transition-all" />
          <div className="flex items-center justify-between px-2">
            <button onClick={replayAyah} className="grid h-10 w-10 place-items-center rounded-full text-white/70 transition active:scale-90 hover:bg-white/10" aria-label={t(S.replay, lang)}><Repeat2 className="h-[18px] w-[18px]" /></button>
            <button onClick={() => goAyah(-1)} disabled={ayahNum <= 1} className="grid h-11 w-11 place-items-center rounded-full bg-white/5 text-white/80 transition active:scale-90 hover:bg-white/10 disabled:opacity-30" aria-label="Previous ayah"><PrevIcon className="h-5 w-5" /></button>
            <button onClick={listening ? stopListening : listen} className="grid h-14 w-14 place-items-center rounded-full bg-sky-400 text-[#081225] shadow-lg shadow-sky-400/25 ring-4 ring-sky-400/15 transition active:scale-95" aria-label={listening ? t(S.stopRec, lang) : t(S.listen, lang)}>{listening ? <Pause className="h-6 w-6" /> : <Play className="ms-0.5 h-6 w-6" />}</button>
            <button onClick={() => goAyah(1)} disabled={ayahNum >= total} className="grid h-11 w-11 place-items-center rounded-full bg-white/5 text-white/80 transition active:scale-90 hover:bg-white/10 disabled:opacity-30" aria-label="Next ayah"><NextIcon className="h-5 w-5" /></button>
            <button onClick={recording ? stopRecording : startRecording} className={`grid h-10 w-10 place-items-center rounded-full transition active:scale-90 ${recording ? "bg-red-500/15 text-red-300" : "text-white/70 hover:bg-white/10"}`} aria-label={recording ? t(S.stopRec, lang) : t(S.startRec, lang)}>{recording ? <Square className="h-4 w-4" /> : <Mic className="h-[18px] w-[18px]" />}</button>
          </div>
        </div>
      </footer>
    </section>
  );
}
