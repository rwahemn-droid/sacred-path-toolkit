import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Clock, Search, Bookmark, BookmarkCheck,
  Play, Pause, ChevronDown, Sunrise, Moon, Settings as SettingsIcon, Globe, MapPin, BookMarked,
  BookText, X, Calendar, VolumeX, Bell, Repeat, Compass, Type, ScrollText, CalendarCheck,
  Gauge, Timer, RotateCcw, Sparkles, Flame, Palette,
} from "lucide-react";
import { SplashScreen } from "@/components/SplashScreen";
import { QiblaCompass } from "@/components/QiblaCompass";
import { TafsirSheet } from "@/components/TafsirSheet";
import { KhatmTracker } from "@/components/KhatmTracker";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl } from "@/lib/reciters";
import { MORNING_ADHKAR, EVENING_ADHKAR, type Dhikr } from "@/lib/adhkar";
import { TASBIHAT, DEFAULT_TASBIH_ID } from "@/lib/tasbihat";
import { HADITHS } from "@/lib/hadith";
import { CITIES, findCity } from "@/lib/cities";
import { DICTS, DIRS, LANG_LABELS, type Lang, type Dict } from "@/lib/i18n";
import {
  useSettings,
  FONT_SIZE_PX,
  ARABIC_FONT_CSS,
  type FontSize,
} from "@/lib/settings";
import { VERSES_OF_DAY } from "@/lib/verse-of-day";
import { useStats, bumpListening, markActive } from "@/lib/stats";

const KU_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toLocaleDigits = (n: number | string, lang: Lang) =>
  lang === "en" || lang === "kmr" ? String(n) : String(n).replace(/\d/g, (d) => KU_DIGITS[+d]);

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

// Robust bismillah stripper — normalize diacritics & alif variants, then check first 4 words.
const stripArabicDiacritics = (s: string) =>
  s.replace(/[\u064B-\u0652\u0670\u0653\u0654\u0655\u0656\u0657\u0658\u0640]/g, "").replace(/ٱ/g, "ا");

function stripBismillah(text: string, surahNum: number, ayahInSurah: number) {
  if (ayahInSurah !== 1 || surahNum === 1 || surahNum === 9) return text;
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return text;
  const head = stripArabicDiacritics(words.slice(0, 4).join(" "));
  if (head === "بسم الله الرحمن الرحيم") {
    return words.slice(4).join(" ").trim();
  }
  return text;
}

// Beads (tasbih) icon — lucide doesn't include one. Realistic prayer-beads loop.
function BeadsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Tassel */}
      <path d="M12 3v2.2" />
      <path d="M10.6 5.2h2.8l-.5 2.3h-1.8z" fill="currentColor" stroke="none" />
      <path d="M11.4 7.6v1.6M12 7.6v1.8M12.6 7.6v1.6" />
      {/* Bead loop */}
      <ellipse cx="12" cy="14.5" rx="7.5" ry="5.5" />
      <circle cx="12" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="6.2" cy="12.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.8" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="6.2" cy="17.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="19.7" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="20.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="19.7" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.8" cy="17.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.2" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.8" cy="12.2" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}


export const Route = createFileRoute("/")({
  component: AppRoot,
  head: () => ({
    meta: [
      { title: "IbadahPro — Quran, Prayer, Dhikr" },
      { name: "description", content: "Quran, prayer times, morning & evening adhkar, tasbih — Kurdish / Arabic / English." },
    ],
  }),
});

function AppRoot() {
  const [splash, setSplash] = useState(true);
  return (
    <>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      <Dashboard />
    </>
  );
}

type TabId = "quran" | "prayer" | "dhikr" | "tasbih" | "settings";

function Dashboard() {
  const [settings] = useSettings();
  const t = DICTS[settings.lang];
  const dir = DIRS[settings.lang];
  const [active, setActive] = useState<TabId>("quran");

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "quran", label: t.tabs.quran, icon: BookOpen },
    { id: "prayer", label: t.tabs.prayer, icon: Clock },
    { id: "dhikr", label: t.tabs.dhikr, icon: BookText },
    { id: "tasbih", label: t.tabs.tasbih, icon: BeadsIcon },
    { id: "settings", label: t.tabs.settings, icon: SettingsIcon },
  ];

  return (
    <div dir={dir} lang={settings.lang} className={`min-h-screen flex flex-col pb-32 ${settings.theme === "sepia" ? "theme-sepia" : ""}`}>
      <header className="px-6 pt-8 pb-4 text-center">
        <p className="text-xs tracking-[0.3em] text-primary/80 uppercase">{t.appTitle}</p>
        <h1 className="mt-2 text-2xl font-semibold font-display">{t.bismillah}</h1>
      </header>

      <main className="flex-1 px-4">
        {active === "quran" && <QuranView t={t} lang={settings.lang} />}
        {active === "prayer" && <PrayerView t={t} lang={settings.lang} cityId={settings.cityId} madhab={settings.madhab} />}
        {active === "dhikr" && <DhikrView t={t} lang={settings.lang} />}
        {active === "tasbih" && <TasbihView t={t} lang={settings.lang} />}
        {active === "settings" && <SettingsView t={t} lang={settings.lang} />}
      </main>

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[min(94%,30rem)] z-50">
        <div
          className="flex items-center justify-around rounded-full border px-1.5 py-2 backdrop-blur-xl"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", boxShadow: "var(--shadow-glow)" }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-full transition-all ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={isActive ? { background: "var(--gradient-gold)" } : undefined}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border p-5 backdrop-blur-xl ${className}`}
      style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
    >
      {children}
    </div>
  );
}

// ============ QURAN ============
type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

type Ayah = { number: number; text: string; numberInSurah: number };
type EditionData = { ayahs: Ayah[]; edition: { identifier: string; language: string; name: string } };

const BOOKMARKS_KEY = "ibadah:bookmarks";
const RECITER_KEY = "ibadah:reciter";

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const toggle = (n: number) => {
    setBookmarks((prev) => {
      const next = prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      return next;
    });
  };
  return { bookmarks, toggle };
}

function QuranView({ t, lang }: { t: Dict; lang: Lang }) {
  const [selected, setSelected] = useState<Surah | null>(null);
  const [query, setQuery] = useState("");
  const { bookmarks, toggle } = useBookmarks();

  const { data: surahs, isLoading, isError } = useQuery({
    queryKey: ["surahs"],
    queryFn: async (): Promise<Surah[]> => {
      const res = await fetch("https://api.alquran.cloud/v1/surah");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });

  const filtered = useMemo(() => {
    if (!surahs) return [];
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number) === q,
    );
  }, [surahs, query]);

  const bookmarked = useMemo(
    () => (surahs ?? []).filter((s) => bookmarks.includes(s.number)),
    [surahs, bookmarks],
  );

  if (selected) return <SurahDetail surah={selected} onBack={() => setSelected(null)} t={t} lang={lang} />;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.quran.searchPlaceholder}
          className="w-full rounded-2xl border bg-transparent backdrop-blur-xl pe-11 ps-4 py-3 text-sm focus:outline-none focus:border-primary/50"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        />
      </div>

      {bookmarked.length > 0 && !query && (
        <div className="space-y-2">
          <h3 className="text-xs text-primary px-1 flex items-center gap-1.5">
            <BookmarkCheck className="h-3.5 w-3.5" /> {t.quran.bookmarked}
          </h3>
          <div className="grid gap-2">
            {bookmarked.map((s) => (
              <SurahItem key={`bm-${s.number}`} s={s} onOpen={() => setSelected(s)} isBookmarked onToggleBookmark={() => toggle(s.number)} lang={lang} t={t} />
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xs text-muted-foreground px-1">{t.quran.allSurahs} ({toLocaleDigits(filtered.length, lang)})</h3>
      {isLoading && <div className="text-center py-12 text-muted-foreground">{t.quran.loading}</div>}
      {isError && <div className="text-center py-12 text-destructive">{t.quran.error}</div>}
      <div className="grid gap-2">
        {filtered.map((s) => (
          <SurahItem
            key={s.number}
            s={s}
            onOpen={() => setSelected(s)}
            isBookmarked={bookmarks.includes(s.number)}
            onToggleBookmark={() => toggle(s.number)}
            lang={lang}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

function SurahItem({
  s, onOpen, isBookmarked, onToggleBookmark, lang, t,
}: {
  s: Surah; onOpen: () => void; isBookmarked: boolean; onToggleBookmark: () => void; lang: Lang; t: Dict;
}) {
  // Localized subtitle: en -> English name + translation; ar -> Arabic short name; ku -> ayah-count only
  const subtitle =
    lang === "en"
      ? `${s.englishName} · ${s.englishNameTranslation} · ${s.numberOfAyahs} ${t.quran.ayahs}`
      : lang === "ar"
        ? `${toLocaleDigits(s.numberOfAyahs, lang)} ${t.quran.ayahs}`
        : `${toLocaleDigits(s.numberOfAyahs, lang)} ${t.quran.ayahs}`;
  return (
    <div
      className="flex items-center gap-2 rounded-2xl border p-3 backdrop-blur-xl transition hover:border-primary/40"
      style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
    >
      <button onClick={onOpen} className="flex-1 flex items-center gap-3 min-w-0">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
        >
          {toLocaleDigits(s.number, lang)}
        </div>
        <div className="min-w-0 flex-1 text-start">
          <p className="font-display text-lg truncate" dir="rtl">{s.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
        </div>
      </button>
      <button onClick={onToggleBookmark} className="p-2 rounded-lg hover:bg-white/5 transition" aria-label="bookmark">
        {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
      </button>
    </div>
  );
}

// ============ SURAH DETAIL ============
type WordTiming = [number, number, number];
type AyahTiming = { verse_key: string; timestamp_from: number; timestamp_to: number; segments: WordTiming[] };

function SurahDetail({ surah, onBack, t, lang }: { surah: Surah; onBack: () => void; t: Dict; lang: Lang }) {
  const [settings] = useSettings();
  const arabicFontPx = FONT_SIZE_PX[settings.fontSize];
  const arabicFontFamily = ARABIC_FONT_CSS;

  const [reciterId, setReciterId] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_RECITER_ID;
    return localStorage.getItem(RECITER_KEY) || DEFAULT_RECITER_ID;
  });
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const [pickerOpen, setPickerOpen] = useState(false);

  // Loop for memorization: 1 = no loop, 2/3/5/10 = repeat N times total, 0 = infinite.
  const LOOP_OPTIONS: { value: number; label: string }[] = [
    { value: 1, label: t.quran.loopOff },
    { value: 3, label: `3×` },
    { value: 5, label: `5×` },
    { value: 10, label: `10×` },
    { value: 0, label: `∞ ${t.quran.loopInfinite}` },
  ];
  const [loopCount, setLoopCount] = useState<number>(1);

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [playAll, setPlayAll] = useState(false);
  const [activeWord, setActiveWord] = useState<{ ayahIdx: number; wordIdx: number } | null>(null);
  const [tafsirAyah, setTafsirAyah] = useState<{ surah: number; ayah: number; text: string } | null>(null);
  const [ayahQuery, setAyahQuery] = useState("");
  const [speed, setSpeed] = useState<number>(1);
  // Sleep timer: 0=off, -1=end of surah, otherwise minutes.
  const [sleep, setSleep] = useState<number>(0);
  const [sleepRemaining, setSleepRemaining] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listeningStartRef = useRef<number | null>(null);

  // Save last-read position whenever a new ayah starts playing.
  useEffect(() => {
    if (playingIdx == null) return;
    try {
      localStorage.setItem("ibadah:last-read", JSON.stringify({
        surah: surah.number, name: surah.name, ayah: playingIdx + 1, t: Date.now(),
      }));
    } catch { /* */ }
  }, [playingIdx, surah.number, surah.name]);

  // Countdown for sleep timer in minutes.
  useEffect(() => {
    if (sleep <= 0) { setSleepRemaining(0); return; }
    setSleepRemaining(sleep * 60);
    const id = window.setInterval(() => {
      setSleepRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          stopAudio();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleep]);

  // Translation edition by language (kmr/bad fall back to Kurdish Sorani translation)
  const translationEdition =
    lang === "en" ? "en.sahih" : lang === "ar" ? "ar.muyassar" : "ku.asan";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["surah", surah.number, translationEdition],
    queryFn: async (): Promise<EditionData[]> => {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,${translationEdition}`,
      );
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });

  const arabic = data?.[0]?.ayahs ?? [];
  const translation = data?.[1]?.ayahs ?? [];

  const { data: timings } = useQuery({
    enabled: !!reciter.quranComId && arabic.length > 0,
    queryKey: ["timings", reciter.quranComId, surah.number],
    queryFn: async (): Promise<Record<number, AyahTiming>> => {
      const res = await fetch(
        `https://api.quran.com/api/v4/recitations/${reciter.quranComId}/by_chapter/${surah.number}`,
      );
      if (!res.ok) return {};
      const json = await res.json();
      const out: Record<number, AyahTiming> = {};
      for (const f of (json.audio_files || []) as { verse_key: string; timestamp_from: number; timestamp_to: number; segments: WordTiming[] }[]) {
        const ayahNum = parseInt(f.verse_key.split(":")[1] || "0", 10);
        if (ayahNum) out[ayahNum] = f as AyahTiming;
      }
      return out;
    },
  });

  const chooseReciter = (id: string) => {
    setReciterId(id);
    localStorage.setItem(RECITER_KEY, id);
    setPickerOpen(false);
    stopAudio();
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingIdx(null);
    setPlayAll(false);
    setActiveWord(null);
  };

  // loopRemaining: undefined means "use current loopCount setting on first play".
  // For loop=0 (infinite) we pass Infinity; for loop=1 we pass 1; etc.
  const playAyah = (idx: number, continueAll = false, loopRemaining?: number) => {
    audioRef.current?.pause();
    const ayah = arabic[idx];
    if (!ayah) return;
    const remaining =
      loopRemaining ?? (continueAll ? 1 : loopCount === 0 ? Infinity : loopCount);
    const audio = new Audio(ayahAudioUrl(reciter, surah.number, ayah.numberInSurah));
    audioRef.current = audio;
    setPlayingIdx(idx);
    if (continueAll) setPlayAll(true);

    setTimeout(() => {
      ayahRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    const ayahTiming = timings?.[ayah.numberInSurah];
    if (ayahTiming?.segments?.length) {
      const baseMs = ayahTiming.timestamp_from;
      audio.addEventListener("timeupdate", () => {
        const ms = audio.currentTime * 1000 + baseMs;
        const seg = ayahTiming.segments.find((s) => ms >= s[1] && ms <= s[2]);
        if (seg) setActiveWord({ ayahIdx: idx, wordIdx: seg[0] - 1 });
      });
    } else {
      setActiveWord(null);
    }

    audio.addEventListener("ended", () => {
      setActiveWord(null);
      // Repeat this ayah if loop remaining > 1.
      if (remaining > 1) {
        playAyah(idx, continueAll, remaining - 1);
        return;
      }
      if (continueAll && idx + 1 < arabic.length) {
        playAyah(idx + 1, true);
      } else {
        setPlayingIdx(null);
        setPlayAll(false);
      }
    });

    audio.addEventListener("error", () => {
      setPlayingIdx(null);
      setPlayAll(false);
    });

    audio.play().catch(() => {
      setPlayingIdx(null);
      setPlayAll(false);
    });
  };

  useEffect(() => () => stopAudio(), []);

  const showBismillahBanner = surah.number !== 1 && surah.number !== 9;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} className="text-sm text-primary hover:underline shrink-0">
          {t.quran.back}
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-lg truncate" dir="rtl">{surah.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {surah.englishName} · {toLocaleDigits(surah.numberOfAyahs, lang)} {t.quran.ayahs}
          </p>
        </div>
      </div>

      <Card className="!p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex-1 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 hover:border-primary/40 transition"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          >
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${pickerOpen ? "rotate-180" : ""}`} />
            <div className="flex-1 min-w-0 text-start">
              <p className="text-[10px] text-muted-foreground">{t.quran.reciter}</p>
              <p className="text-sm font-medium truncate">{reciter.name}</p>
            </div>
          </button>
          <button
            onClick={() => (playingIdx !== null ? stopAudio() : playAyah(0, true))}
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition active:scale-95"
            style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
            aria-label="play all"
          >
            {playAll ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>

        {/* Loop selector for memorization */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          <Repeat className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[11px] text-muted-foreground shrink-0 me-1">{t.quran.loop}:</span>
          {LOOP_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setLoopCount(o.value)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                loopCount === o.value ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                background: loopCount === o.value ? "var(--gradient-gold)" : "transparent",
                borderColor: loopCount === o.value ? "transparent" : "var(--glass-border)",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {pickerOpen && (
          <div className="mt-3 max-h-72 overflow-y-auto grid gap-1 pe-1">
            {RECITERS.map((r) => (
              <button
                key={r.id}
                onClick={() => chooseReciter(r.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  r.id === reciterId ? "text-primary-foreground" : "hover:bg-white/5"
                }`}
                style={r.id === reciterId ? { background: "var(--gradient-gold)" } : undefined}
              >
                <span className="text-[10px] opacity-70">{r.quranComId ? t.quran.wordSync : ""}</span>
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {isLoading && <div className="text-center py-12 text-muted-foreground">{t.quran.loading}</div>}
      {isError && <div className="text-center py-12 text-destructive">{t.quran.error}</div>}

      {showBismillahBanner && arabic.length > 0 && (
        <Card>
          <p className="font-display text-2xl text-center" dir="rtl">{BISMILLAH}</p>
        </Card>
      )}

      {arabic.length > 0 && (
        <div className="relative">
          <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={ayahQuery}
            onChange={(e) => setAyahQuery(e.target.value)}
            placeholder={t.quran.searchAyah}
            className="w-full rounded-2xl border bg-transparent backdrop-blur-xl pe-11 ps-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          />
        </div>
      )}

      <div className="space-y-3">
        {arabic.map((a, i) => {
          const isActive = playingIdx === i;
          const cleanText = stripBismillah(a.text, surah.number, a.numberInSurah);
          const words = cleanText.split(/\s+/).filter(Boolean);
          const q = ayahQuery.trim();
          if (q) {
            const hay = stripArabicDiacritics(cleanText) + " " + (translation[i]?.text ?? "");
            const needle = stripArabicDiacritics(q.toLowerCase());
            if (!hay.toLowerCase().includes(needle) && String(a.numberInSurah) !== q) return null;
          }
          return (
            <div
              key={a.number}
              ref={(el) => { ayahRefs.current[i] = el; }}
              className={`rounded-3xl border p-5 backdrop-blur-xl transition-all ${isActive ? "border-primary/60 shadow-lg" : ""}`}
              style={{
                background: isActive ? "color-mix(in oklch, var(--primary) 8%, var(--glass-bg))" : "var(--glass-bg)",
                borderColor: isActive ? "var(--primary)" : "var(--glass-border)",
                boxShadow: isActive ? "var(--shadow-glow)" : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                  style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
                >
                  {toLocaleDigits(a.numberInSurah, lang)}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTafsirAyah({ surah: surah.number, ayah: a.numberInSurah, text: cleanText })}
                    className="h-9 px-3 rounded-full flex items-center gap-1.5 border hover:border-primary/60 transition text-[11px] text-primary"
                    style={{ borderColor: "var(--glass-border)" }}
                    aria-label="tafsir"
                  >
                    <ScrollText className="h-3.5 w-3.5" /> {t.quran.tafsir}
                  </button>
                  <button
                    onClick={() => (isActive ? stopAudio() : playAyah(i))}
                    className="h-9 w-9 rounded-full flex items-center justify-center border hover:border-primary/60 transition"
                    style={{ borderColor: "var(--glass-border)" }}
                    aria-label="play ayah"
                  >
                    {isActive ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary" />}
                  </button>
                </div>
              </div>

              <p
                className="leading-loose text-right"
                dir="rtl"
                style={{ fontFamily: arabicFontFamily, fontSize: `${arabicFontPx}px` }}
              >
                {words.map((w, wi) => {
                  const highlight = isActive && activeWord?.ayahIdx === i && activeWord?.wordIdx === wi;
                  return (
                    <span
                      key={`${a.number}-w-${wi}`}
                      className="transition-colors"
                      style={highlight ? { color: "oklch(0.92 0.18 95)", textShadow: "0 0 12px oklch(0.92 0.18 95 / 0.5)" } : undefined}
                    >
                      {w}{" "}
                    </span>
                  );
                })}
              </p>

              {translation[i] && (
                <p
                  className="mt-4 pt-4 border-t border-white/10 text-sm leading-relaxed text-muted-foreground"
                  dir={lang === "en" ? "ltr" : "rtl"}
                >
                  {translation[i].text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {tafsirAyah && (
        <TafsirSheet
          surahNum={tafsirAyah.surah}
          ayahNum={tafsirAyah.ayah}
          arabicText={tafsirAyah.text}
          lang={lang}
          t={t}
          onClose={() => setTafsirAyah(null)}
        />
      )}
    </div>
  );
}

// ============ PRAYER TIMES ============
type PrayerTimings = { Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string };
type HijriDate = { day: string; month: { ar: string; en: string; number: number }; year: string };

// Use the API's calculated times directly (Muslim World League). No manual offset.
const PRAYER_OFFSET_MIN = 0;
function adjustTime(hhmm: string, offset = PRAYER_OFFSET_MIN) {
  if (!hhmm || hhmm.length < 4) return hhmm;
  if (offset === 0) return hhmm.slice(0, 5);
  const [hStr, mStr] = hhmm.split(":");
  let total = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0) + offset;
  total = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Tick every second for live clock + countdown.
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const WEEKDAYS_KU = ["یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی", "شەممە"];
const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const NOTIFY_KEY = "ibadah:prayer:notify";
const ADHAN_URL = "https://www.islamcan.com/audio/adhan/azan2.mp3";

function readNotify(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(NOTIFY_KEY) || "{}"); } catch { return {}; }
}

// Convert "HH:MM" (24h) to localized 12h "h:MM AM/PM".
function to12h(hhmm: string, t: Dict): { time: string; suffix: string } {
  if (!hhmm || hhmm.length < 4) return { time: hhmm, suffix: "" };
  const [hStr, mStr] = hhmm.split(":");
  const h24 = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const suffix = h24 < 12 ? t.prayer.am : t.prayer.pm;
  let h = h24 % 12; if (h === 0) h = 12;
  return { time: `${h}:${String(m).padStart(2, "0")}`, suffix };
}

function PrayerView({ t, lang, cityId, madhab }: { t: Dict; lang: Lang; cityId: string; madhab: "shafi" | "hanafi" }) {
  const city = findCity(cityId);
  const school = madhab === "hanafi" ? 1 : 0;
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [notify, setNotify] = useState<Record<string, boolean>>(() => readNotify());
  const [previewing, setPreviewing] = useState<string | null>(null);
  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const now = useNow(1000);

  const todayStr = new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useQuery({
    queryKey: ["prayer", city.id, school, todayStr],
    queryFn: async (): Promise<{ timings: PrayerTimings; hijri: HijriDate; weekdayIdx: number }> => {
      const d = new Date();
      const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${city.lat}&longitude=${city.lon}&method=14&school=${school}&timezonestring=${encodeURIComponent(city.tz)}&tune=0,4,12,12,11,3,0,-10,0`,
      );
      const json = await res.json();
      return {
        timings: json.data.timings,
        hijri: json.data.date.hijri,
        weekdayIdx: d.getDay(),
      };
    },
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const toggleNotify = async (id: string) => {
    const turningOn = !notify[id];
    if (turningOn && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try { await Notification.requestPermission(); } catch { /* */ }
      }
    }
    setNotify((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(NOTIFY_KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  };

  const previewAdhan = (id: string) => {
    if (previewing === id) {
      adhanRef.current?.pause();
      adhanRef.current = null;
      setPreviewing(null);
      return;
    }
    adhanRef.current?.pause();
    const a = new Audio(ADHAN_URL);
    adhanRef.current = a;
    setPreviewing(id);
    a.addEventListener("ended", () => setPreviewing(null));
    a.addEventListener("error", () => setPreviewing(null));
    a.play().catch(() => setPreviewing(null));
  };

  useEffect(() => () => { adhanRef.current?.pause(); }, []);

  const prayers = data
    ? [
        { id: "fajr",    name: t.prayer.names.fajr,    time: adjustTime(data.timings.Fajr.slice(0, 5)) },
        { id: "sunrise", name: t.prayer.names.sunrise, time: adjustTime(data.timings.Sunrise.slice(0, 5)) },
        { id: "dhuhr",   name: t.prayer.names.dhuhr,   time: adjustTime(data.timings.Dhuhr.slice(0, 5)) },
        { id: "asr",     name: t.prayer.names.asr,     time: adjustTime(data.timings.Asr.slice(0, 5)) },
        { id: "maghrib", name: t.prayer.names.maghrib, time: adjustTime(data.timings.Maghrib.slice(0, 5)) },
        { id: "isha",    name: t.prayer.names.isha,    time: adjustTime(data.timings.Isha.slice(0, 5)) },
      ]
    : [];

  // Schedule real browser notifications for today's enabled prayers.
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!prayers.length) return;
    const timers: number[] = [];
    const nowMs = Date.now();
    for (const p of prayers) {
      if (!notify[p.id]) continue;
      const [h, m] = p.time.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      const delay = target.getTime() - nowMs;
      if (delay > 0 && delay < 24 * 3600 * 1000) {
        const id = window.setTimeout(() => {
          try {
            new Notification(t.appTitle, { body: `${p.name} — ${p.time}`, silent: false });
            const a = new Audio(ADHAN_URL);
            a.play().catch(() => {});
          } catch { /* */ }
        }, delay);
        timers.push(id);
      }
    }
    return () => { timers.forEach((id) => clearTimeout(id)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify, data?.timings.Fajr]);

  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  // Find next prayer + previous prayer for the progress bar.
  let nextIdx = prayers.findIndex((p) => {
    const [h, m] = p.time.split(":").map(Number);
    return h * 60 + m > now.getHours() * 60 + now.getMinutes();
  });
  if (nextIdx === -1) nextIdx = 0;
  const next = prayers[nextIdx];
  const prev = prayers[(nextIdx - 1 + prayers.length) % prayers.length];

  const toSec = (hhmm?: string) => {
    if (!hhmm) return 0;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 3600 + m * 60;
  };
  const nextSec = toSec(next?.time);
  const prevSec = toSec(prev?.time);
  let total = nextSec - prevSec;
  if (total <= 0) total += 24 * 3600;
  let elapsed = nowSec - prevSec;
  if (elapsed < 0) elapsed += 24 * 3600;
  const progress = next ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;

  let remainingSec = nextSec - nowSec;
  if (remainingSec < 0) remainingSec += 24 * 3600;
  const rH = Math.floor(remainingSec / 3600);
  const rM = Math.floor((remainingSec % 3600) / 60);
  const remainingHHMM = `${String(rH).padStart(2, "0")}:${String(rM).padStart(2, "0")}`;

  const cityName = lang === "ar" ? city.ar : lang === "en" ? city.en : city.ku;
  const headerTitle =
    lang === "ku" ? `کاتەکانی بانگ لە ${cityName}`
    : lang === "ar" ? `مواقيت الصلاة في ${cityName}`
    : `Prayer times in ${cityName}`;

  const weekdays = lang === "ar" ? WEEKDAYS_AR : lang === "en" ? WEEKDAYS_EN : WEEKDAYS_KU;
  const weekday = data ? weekdays[data.weekdayIdx] : "";
  const gDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const hijriStr = data ? `${toLocaleDigits(data.hijri.day, lang)} - ${data.hijri.month.ar} - ${toLocaleDigits(data.hijri.year, lang)}` : "";

  const clockStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <div className="text-center pt-2">
        <p className="text-base font-semibold" style={{ color: "oklch(0.78 0.13 180)" }}>{headerTitle}</p>
        <p className="mt-3 text-6xl font-bold tracking-wider tabular-nums text-foreground">
          {toLocaleDigits(clockStr, lang)}
        </p>
        <div className="mt-5 space-y-1">
          <p className="text-sm">
            <span className="text-primary font-medium">{weekday}</span>
            <span className="text-foreground tabular-nums">  {toLocaleDigits(gDate, lang)}</span>
          </p>
          <p className="text-xs text-muted-foreground" dir="rtl">{hijriStr}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-1">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: "var(--gradient-teal)" }}
          />
        </div>
        {next && (
          <p className="mt-2 text-xs text-muted-foreground text-right" dir="rtl">
            {next.name} ({toLocaleDigits(remainingHHMM, lang)})
          </p>
        )}
      </div>

      {isLoading && !data ? (
        <p className="text-center text-muted-foreground py-8">{t.quran.loading}</p>
      ) : (
        <div className="space-y-2.5">
          {prayers.map((p) => {
            const isNext = next && p.id === next.id;
            const on = !!notify[p.id];
            const playing = previewing === p.id;
            const { time: t12, suffix } = to12h(p.time, t);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl transition"
                style={{
                  background: isNext
                    ? "var(--gradient-gold)"
                    : "var(--glass-bg)",
                  borderColor: isNext ? "transparent" : "var(--glass-border)",
                  boxShadow: isNext ? "var(--shadow-glow)" : undefined,
                  color: isNext ? "var(--primary-foreground)" : undefined,
                }}
              >
                <div className="flex items-baseline gap-1.5 tabular-nums">
                  <span className={`text-2xl font-bold ${isNext ? "" : "text-primary"}`}>
                    {toLocaleDigits(t12, lang)}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase ${isNext ? "opacity-90" : "text-muted-foreground"}`}>
                    {suffix}
                  </span>
                </div>
                <span className={`flex-1 text-right font-display text-2xl ${isNext ? "" : "text-foreground"}`} dir="rtl">
                  {p.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMonthlyOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-medium transition"
          style={{ background: "var(--gradient-gold)", borderColor: "transparent", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
        >
          <Calendar className="h-4 w-4" /> {t.prayer.monthly}
        </button>
        <button
          onClick={() => setQiblaOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-medium transition"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        >
          <Compass className="h-4 w-4 text-primary" /> {t.prayer.qibla}
        </button>
      </div>

      {monthlyOpen && (
        <MonthlyTimes
          t={t}
          lang={lang}
          city={city}
          school={school}
          onClose={() => setMonthlyOpen(false)}
        />
      )}

      {qiblaOpen && (
        <QiblaCompass
          lat={city.lat}
          lon={city.lon}
          cityName={cityName}
          t={t}
          onClose={() => setQiblaOpen(false)}
        />
      )}
    </div>
  );
}

function MonthlyTimes({
  t, lang, city, school, onClose,
}: { t: Dict; lang: Lang; city: ReturnType<typeof findCity>; school: 0 | 1; onClose: () => void }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", city.id, school, year, month],
    queryFn: async () => {
      const res = await fetch(
        `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${city.lat}&longitude=${city.lon}&method=14&school=${school}&timezonestring=${encodeURIComponent(city.tz)}&tune=0,4,12,12,11,3,0,-10,0`,
      );
      const json = await res.json();
      return json.data as Array<{ timings: Record<string, string>; date: { gregorian: { date: string; day: string } } }>;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const trim = (s?: string) => (s ? adjustTime(s.split(" ")[0].slice(0, 5)) : "—");

  const prev = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); } else setMonth((m) => m + 1);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[88vh] rounded-3xl border overflow-hidden flex flex-col"
        style={{ background: "var(--background)", borderColor: "var(--glass-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
          <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5" aria-label={t.prayer.close}>
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="px-2.5 py-1 rounded-lg hover:bg-white/5">‹</button>
            <p className="text-sm font-medium tabular-nums">
              {t.prayer.monthlyTitle} {toLocaleDigits(month, lang)} / {toLocaleDigits(year, lang)}
            </p>
            <button onClick={next} className="px-2.5 py-1 rounded-lg hover:bg-white/5">›</button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {isLoading || !data ? (
            <p className="text-center py-12 text-muted-foreground">{t.quran.loading}</p>
          ) : (
            <table className="w-full text-xs tabular-nums">
              <thead className="sticky top-0" style={{ background: "var(--background)" }}>
                <tr className="text-primary">
                  <th className="py-2 px-2 font-medium">{t.prayer.date}</th>
                  <th className="py-2 px-2 font-medium">{t.prayer.names.fajr}</th>
                  <th className="py-2 px-2 font-medium">{t.prayer.names.sunrise}</th>
                  <th className="py-2 px-2 font-medium">{t.prayer.names.dhuhr}</th>
                  <th className="py-2 px-2 font-medium">{t.prayer.names.asr}</th>
                  <th className="py-2 px-2 font-medium">{t.prayer.names.maghrib}</th>
                  <th className="py-2 px-2 font-medium">{t.prayer.names.isha}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => {
                  const todayDay = new Date().getDate();
                  const dayNum = parseInt(d.date.gregorian.day, 10);
                  const isToday = dayNum === todayDay && year === new Date().getFullYear() && month === new Date().getMonth() + 1;
                  return (
                    <tr
                      key={i}
                      className="border-t"
                      style={{
                        borderColor: "var(--glass-border)",
                        background: isToday ? "color-mix(in oklch, var(--primary) 10%, transparent)" : undefined,
                      }}
                    >
                      <td className="py-2 px-2 text-primary font-medium">{toLocaleDigits(String(month).padStart(2, "0"), lang)}-{toLocaleDigits(d.date.gregorian.day, lang)}</td>
                      <td className="py-2 px-2 text-center">{toLocaleDigits(trim(d.timings.Fajr), lang)}</td>
                      <td className="py-2 px-2 text-center">{toLocaleDigits(trim(d.timings.Sunrise), lang)}</td>
                      <td className="py-2 px-2 text-center">{toLocaleDigits(trim(d.timings.Dhuhr), lang)}</td>
                      <td className="py-2 px-2 text-center">{toLocaleDigits(trim(d.timings.Asr), lang)}</td>
                      <td className="py-2 px-2 text-center">{toLocaleDigits(trim(d.timings.Maghrib), lang)}</td>
                      <td className="py-2 px-2 text-center">{toLocaleDigits(trim(d.timings.Isha), lang)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ DHIKR ============
function DhikrView({ t, lang }: { t: Dict; lang: Lang }) {
  const [sub, setSub] = useState<"morning" | "evening" | "khatm" | "hadith">(
    new Date().getHours() < 14 ? "morning" : "evening",
  );

  const tabs: { id: typeof sub; label: string; icon: React.ComponentType<{ className?: string }>; bg: string }[] = [
    { id: "morning", label: t.dhikr.morning, icon: Sunrise, bg: "var(--gradient-gold)" },
    { id: "evening", label: t.dhikr.evening, icon: Moon, bg: "var(--gradient-teal)" },
    { id: "khatm", label: t.dhikr.khatm, icon: CalendarCheck, bg: "var(--gradient-gold)" },
    { id: "hadith", label: t.dhikr.hadith, icon: ScrollText, bg: "var(--gradient-teal)" },
  ];

  const items = sub === "morning" ? MORNING_ADHKAR : sub === "evening" ? EVENING_ADHKAR : [];

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-4 gap-1 rounded-2xl border p-1 backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = sub === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSub(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[11px] font-medium transition ${
                active ? "text-primary-foreground" : "text-muted-foreground"
              }`}
              style={active ? { background: tab.bg, boxShadow: "var(--shadow-glow)" } : undefined}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {(sub === "morning" || sub === "evening") && (
        <div className="space-y-3">
          {items.map((d, i) => (
            <DhikrCard key={`${sub}-${i}`} dhikr={d} storageKey={`ibadah:dhikr:${sub}:${i}`} t={t} lang={lang} />
          ))}
        </div>
      )}

      {sub === "khatm" && <KhatmTracker t={t} lang={lang} />}

      {sub === "hadith" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">{t.hadith.title}</p>
          {HADITHS.map((h) => (
            <Card key={h.id}>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold"
                  style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
                >
                  {toLocaleDigits(h.id, lang)}
                </span>
                <span className="text-[10px] text-muted-foreground">{h.source}</span>
              </div>
              <p
                className="font-display text-xl text-right leading-loose"
                dir="rtl"
                style={{ lineHeight: 2 }}
              >
                {h.ar}
              </p>
              <p className="mt-3 text-[13px] text-muted-foreground text-right leading-relaxed" dir="rtl">
                {h.ku}
              </p>
              <p className="mt-2 text-[10px] text-primary text-right" dir="rtl">
                {t.hadith.narratedBy}: {h.narrator}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function DhikrCard({ dhikr, storageKey, t, lang }: { dhikr: Dhikr; storageKey: string; t: Dict; lang: Lang }) {
  const fullKey = `${storageKey}:${todayKey()}`;
  const [count, setCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const v = localStorage.getItem(fullKey);
      return v ? parseInt(v, 10) || 0 : 0;
    } catch { return 0; }
  });
  useEffect(() => {
    try { localStorage.setItem(fullKey, String(count)); } catch { /* */ }
  }, [count, fullKey]);
  const done = count >= dhikr.count;
  return (
    <Card>
      <p
        className="font-display text-2xl text-right"
        dir="rtl"
        style={{ lineHeight: 2.2, wordSpacing: "0.15em", letterSpacing: "0.01em" }}
      >
        {dhikr.ar}
      </p>
      <p className="mt-4 text-[13px] text-muted-foreground text-right leading-relaxed" dir="rtl">{dhikr.ku}</p>
      <button
        onClick={() => setCount((c) => (c >= dhikr.count ? 0 : c + 1))}
        className={`mt-4 w-full flex items-center justify-between rounded-xl border px-4 py-3 transition ${done ? "border-primary/60" : ""}`}
        style={{
          background: done ? "color-mix(in oklch, var(--primary) 12%, transparent)" : "var(--glass-bg)",
          borderColor: done ? "var(--primary)" : "var(--glass-border)",
        }}
      >
        <span className="text-xs text-muted-foreground">{done ? t.dhikr.done : t.dhikr.tap}</span>
        <span className="font-semibold tabular-nums">
          <span className="text-primary">{toLocaleDigits(count, lang)}</span> / {toLocaleDigits(dhikr.count, lang)}
        </span>
      </button>
    </Card>
  );
}

// ============ TASBIH ============
const TASBIH_KEY = "ibadah:tasbih:selected";

function TasbihView({ t, lang }: { t: Dict; lang: Lang }) {
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_TASBIH_ID;
    return localStorage.getItem(TASBIH_KEY) || DEFAULT_TASBIH_ID;
  });
  const selected = TASBIHAT.find((x) => x.id === selectedId) || TASBIHAT[0];
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(TASBIH_KEY, selectedId); } catch { /* */ }
  }, [selectedId]);

  const countKey = `ibadah:tasbih:count:${selected.id}`;
  const [count, setCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try { const v = localStorage.getItem(countKey); return v ? parseInt(v, 10) || 0 : 0; } catch { return 0; }
  });
  useEffect(() => {
    try { setCount(parseInt(localStorage.getItem(countKey) || "0", 10) || 0); } catch { /* */ }
  }, [countKey]);
  useEffect(() => {
    try { localStorage.setItem(countKey, String(count)); } catch { /* */ }
  }, [count, countKey]);

  const label = lang === "ku" ? selected.ku : lang === "en" ? selected.en : selected.ar_meaning;

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <Card className="w-full">
        <button onClick={() => setPickerOpen((v) => !v)} className="w-full flex items-center justify-between gap-2">
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${pickerOpen ? "rotate-180" : ""}`} />
          <div className="flex-1 min-w-0 text-center">
            <p className="text-[10px] text-muted-foreground">{t.tasbih.choose}</p>
            <p className="font-display text-2xl mt-1" dir="rtl">{selected.ar}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
          <BookMarked className="h-4 w-4 text-primary" />
        </button>
        {pickerOpen && (
          <div className="mt-4 grid gap-1 max-h-72 overflow-y-auto">
            {TASBIHAT.map((x) => (
              <button
                key={x.id}
                onClick={() => { setSelectedId(x.id); setPickerOpen(false); }}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition gap-3 ${
                  x.id === selectedId ? "text-primary-foreground" : "hover:bg-white/5"
                }`}
                style={x.id === selectedId ? { background: "var(--gradient-gold)" } : undefined}
              >
                <span className="text-[10px] opacity-70 shrink-0">×{toLocaleDigits(x.target, lang)}</span>
                <span className="truncate font-display text-base" dir="rtl">{x.ar}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div
        className="text-7xl font-bold tabular-nums"
        style={{ background: "var(--gradient-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        {toLocaleDigits(count, lang)}
        <span className="text-2xl text-muted-foreground"> / {toLocaleDigits(selected.target, lang)}</span>
      </div>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="h-40 w-40 rounded-full text-xl font-semibold transition-all active:scale-95"
        style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
      >
        +1
      </button>
      <button onClick={() => setCount(0)} className="text-sm text-muted-foreground hover:text-foreground">
        {t.tasbih.reset}
      </button>
    </div>
  );
}

// ============ SETTINGS ============
function SettingsView({ t, lang }: { t: Dict; lang: Lang }) {
  const [settings, update] = useSettings();
  const tzLocal = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const langs: Lang[] = ["ku", "ar", "en", "kmr", "bad"];
  const fontSizes: FontSize[] = ["sm", "md", "lg", "xl"];

  const cityLabel = (id: string) => {
    const c = findCity(id);
    // Cities only have ku/ar/en; fall back to Kurdish for kmr/bad (Arabic script users → ku).
    if (lang === "ar") return c.ar;
    if (lang === "en" || lang === "kmr") return c.en;
    return c.ku;
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{t.settings.language}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {langs.map((L) => (
            <button
              key={L}
              onClick={() => update({ lang: L })}
              className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                settings.lang === L ? "text-primary-foreground" : "text-foreground hover:border-primary/40"
              }`}
              style={{
                background: settings.lang === L ? "var(--gradient-gold)" : "var(--glass-bg)",
                borderColor: settings.lang === L ? "transparent" : "var(--glass-border)",
              }}
            >
              {LANG_LABELS[L]}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{t.settings.city}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pe-1">
          {CITIES.map((c) => {
            const isActive = settings.cityId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => update({ cityId: c.id })}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  isActive ? "text-primary-foreground" : "hover:border-primary/40"
                }`}
                style={{
                  background: isActive ? "var(--gradient-gold)" : "var(--glass-bg)",
                  borderColor: isActive ? "transparent" : "var(--glass-border)",
                  boxShadow: isActive ? "var(--shadow-glow)" : undefined,
                }}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{cityLabel(c.id)}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {findCity(settings.cityId).tz} · {tzLocal}
        </p>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <BookMarked className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{t.settings.madhab}</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">{t.settings.asrNote}</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: "shafi", label: t.settings.shafi },
            { id: "hanafi", label: t.settings.hanafi },
          ] as const).map((m) => (
            <button
              key={m.id}
              onClick={() => update({ madhab: m.id })}
              className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                settings.madhab === m.id ? "text-primary-foreground" : "text-foreground hover:border-primary/40"
              }`}
              style={{
                background: settings.madhab === m.id ? "var(--gradient-gold)" : "var(--glass-bg)",
                borderColor: settings.madhab === m.id ? "transparent" : "var(--glass-border)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{t.settings.fontSize}</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {fontSizes.map((s) => (
            <button
              key={s}
              onClick={() => update({ fontSize: s })}
              className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                settings.fontSize === s ? "text-primary-foreground" : "text-foreground hover:border-primary/40"
              }`}
              style={{
                background: settings.fontSize === s ? "var(--gradient-gold)" : "var(--glass-bg)",
                borderColor: settings.fontSize === s ? "transparent" : "var(--glass-border)",
                fontSize: `${Math.min(18, FONT_SIZE_PX[s] / 2 + 8)}px`,
              }}
            >
              {t.settings.sizes[s]}
            </button>
          ))}
        </div>

        <p
          className="mt-4 text-center leading-loose"
          dir="rtl"
          style={{
            fontFamily: ARABIC_FONT_CSS,
            fontSize: `${FONT_SIZE_PX[settings.fontSize]}px`,
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{t.settings.theme}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["dark", "sepia"] as const).map((th) => (
            <button
              key={th}
              onClick={() => update({ theme: th })}
              className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                settings.theme === th ? "text-primary-foreground" : "text-foreground hover:border-primary/40"
              }`}
              style={{
                background: settings.theme === th ? "var(--gradient-gold)" : "var(--glass-bg)",
                borderColor: settings.theme === th ? "transparent" : "var(--glass-border)",
              }}
            >
              {t.settings.themes[th]}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
