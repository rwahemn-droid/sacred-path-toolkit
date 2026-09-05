import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Eye, EyeOff, Mic, Square, RotateCcw, Volume2, GraduationCap, Play, Pause, Repeat2 } from "lucide-react";
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
    a.onended = () => { setListening(false); setAudioProgress(a.duration || 0); };
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
  };

  recognitionRef.current = recognition;
  recognition.start();
}

function stopLiveHifz() {
  recognitionRef.current?.stop();
  setLiveListening(false);
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

  const btn = "flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-xs font-medium transition hover:border-primary/50 disabled:opacity-40";
  const total = surah?.numberOfAyahs ?? 0;

  return (
    <section className="fixed inset-0 z-[60] flex h-dvh flex-col overflow-hidden bg-background text-foreground animate-in fade-in duration-300">
      <header className="shrink-0 border-b border-border bg-background/95 px-3 pb-2 pt-[max(.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-2">
          <button onClick={onBack} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-secondary/70 text-primary transition hover:bg-secondary" aria-label={t(S.back, lang)}>
            <BackIcon className="h-4 w-4" />
          </button>
          <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:grid">
            <GraduationCap className="h-5 w-5" />
          </div>
          <label className="min-w-0 flex-[2]">
            <span className="sr-only">{t(S.selectSurah, lang)}</span>
            <select value={surahNum} onChange={(e) => { setSurahNum(Number(e.target.value)); setAyahNum(1); }} className="h-10 w-full truncate rounded-xl border border-border bg-secondary/70 px-3 text-sm font-medium outline-none focus:border-primary">
              {surahs?.map((s) => <option key={s.number} value={s.number}>{s.number}. {s.name} — {s.englishName}</option>)}
            </select>
          </label>
          <label className="w-20 shrink-0">
            <span className="sr-only">{t(S.selectAyah, lang)}</span>
            <select value={ayahNum} onChange={(e) => setAyahNum(Number(e.target.value))} className="h-10 w-full rounded-xl border border-border bg-secondary/70 px-2 text-center text-sm outline-none focus:border-primary">
              {Array.from({ length: total || 7 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
      </header>

      <main dir="rtl" lang="ar" className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#151515] px-3 py-4 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-5 flex items-center justify-center gap-3 text-primary/70">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/40" />
            <div className="min-w-40 border-y border-primary/30 px-5 py-2 text-center">
              <p dir="rtl" lang="ar" className="font-amiri text-2xl font-semibold text-primary">{surah?.name ?? ""}</p>
              {surah && <p dir="ltr" className="mt-0.5 text-[10px] uppercase text-muted-foreground">{surah.englishName} · {surah.numberOfAyahs}</p>}
            </div>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          {isFetching || !ayahs ? (
            <p className="text-center text-sm text-muted-foreground">{t(S.loading, lang)}</p>
          ) : (
            <div className={hideQuran ? "select-none" : ""}>
              {surahNum !== 9 && (
                <p className={`mb-5 text-center font-amiri text-2xl leading-loose text-primary transition sm:text-3xl ${hideQuran ? "invisible select-none" : ""}`}>{BISMILLAH}</p>
              )}
              <p className="text-justify font-amiri text-[1.9rem] leading-[2.55] sm:text-[2.25rem]">
                {ayahs.map((a) => {
                  const active = a.numberInSurah === ayahNum;
                  return (
                    <span
                      key={a.numberInSurah}
                      ref={active ? currentAyahRef : undefined}
                      onClick={() => setAyahNum(a.numberInSurah)}
                      className={`cursor-pointer transition-colors ${hideQuran ? "select-none" : active ? "text-primary" : "hover:text-primary/80"}`}
                    >
                      {hideQuran && active ? (
                        <>{a.text.split(/\s+/).map((word, index) => <span key={index} className={index < recognizedWords ? "visible" : "invisible"}>{word}{" "}</span>)}</>
                      ) : <span className={hideQuran ? "invisible" : ""}>{a.text}</span>}
                      <span className={`mx-1.5 inline-grid h-7 w-7 place-items-center rounded-full border align-middle text-xs ${active ? "border-primary text-primary" : "border-primary/40 text-primary/70"}`}>
                        {toArDigits(a.numberInSurah)}
                      </span>
                    </span>
                  );
                })}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-border bg-background/95 px-3 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t(S.reciter, lang)}</span>
              <select value={reciterId} onChange={(e) => selectReciter(e.target.value)} className="h-9 w-full truncate rounded-lg border border-border bg-secondary/70 px-2 text-xs outline-none focus:border-primary">
                {RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{ayahNum} / {total}</span>
          </div>

          <input aria-label="Audio progress" type="range" min={0} max={audioDuration || 1} step="0.1" value={Math.min(audioProgress, audioDuration || 1)} onChange={(e) => seekAudio(Number(e.target.value))} className="h-1 w-full accent-primary" />

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => goAyah(-1)} disabled={ayahNum <= 1} className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30" aria-label="Previous ayah"><PrevIcon className="h-5 w-5" /></button>
            <button onClick={replayAyah} className="grid h-10 w-10 place-items-center rounded-full text-primary transition hover:bg-primary/10" aria-label={t(S.replay, lang)}><Repeat2 className="h-5 w-5" /></button>
            <button onClick={listening ? stopListening : listen} className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition active:scale-95" aria-label={listening ? t(S.stopRec, lang) : t(S.listen, lang)}>{listening ? <Pause className="h-6 w-6" /> : <Play className="ms-0.5 h-6 w-6" />}</button>
            <button onClick={() => goAyah(1)} disabled={ayahNum >= total} className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30" aria-label="Next ayah"><NextIcon className="h-5 w-5" /></button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setHideQuran((v) => !v)} className={`${btn} ${hideQuran ? "border-primary/60 text-primary" : ""}`} aria-label={t(S.hifzMode, lang)}>
              {hideQuran ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}<span className="truncate">{hideQuran ? t(S.showQuran, lang) : t(S.hideQuran, lang)}</span>
            </button>
            {hideQuran ? (
              <button onClick={liveListening ? stopLiveHifz : startLiveHifz} className={`${btn} ${liveListening ? "animate-pulse border-destructive/60 text-destructive" : "text-primary"}`}>
                {liveListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}<span className="truncate">{liveListening ? t(S.stopRec, lang) : t(S.startRec, lang)}</span>
              </button>
            ) : !recording ? (
              <button onClick={startRecording} className={`${btn} text-primary`}><Mic className="h-4 w-4" /><span className="truncate">{t(S.startRec, lang)}</span></button>
            ) : (
              <button onClick={stopRecording} className={`${btn} animate-pulse border-destructive/60 text-destructive`}><Square className="h-4 w-4" /><span className="truncate">{t(S.stopRec, lang)}</span></button>
            )}
          </div>

          {audioUrl && !recording && (
            <div className="flex items-center gap-2">
              <audio controls src={audioUrl} className="h-10 min-w-0 flex-1" aria-label={t(S.playMine, lang)} />
              <button onClick={clearRecording} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary/70 text-muted-foreground" aria-label={t(S.tryAgain, lang)}><RotateCcw className="h-4 w-4" /></button>
            </div>
          )}
          {micError && <p className="text-center text-xs text-destructive">{t(S.micError, lang)}</p>}
        </div>
      </footer>
    </section>
  );
}
