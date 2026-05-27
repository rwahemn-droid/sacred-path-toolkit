import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Clock, Search, Bookmark, BookmarkCheck,
  Play, Pause, ChevronDown, Sunrise, Moon, Settings as SettingsIcon, Globe, MapPin, BookMarked,
  BookText, X, Calendar,
} from "lucide-react";
import { SplashScreen } from "@/components/SplashScreen";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl } from "@/lib/reciters";
import { MORNING_ADHKAR, EVENING_ADHKAR, type Dhikr } from "@/lib/adhkar";
import { TASBIHAT, DEFAULT_TASBIH_ID } from "@/lib/tasbihat";
import { CITIES, findCity } from "@/lib/cities";
import { DICTS, DIRS, LANG_LABELS, type Lang, type Dict } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

const KU_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toLocaleDigits = (n: number | string, lang: Lang) =>
  lang === "en" ? String(n) : String(n).replace(/\d/g, (d) => KU_DIGITS[+d]);

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

// Beads (tasbih) icon — lucide doesn't include one.
function BeadsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 13c0 4 3.5 7 8 7s8-3 8-7" />
      <circle cx="6" cy="11" r="1.6" fill="currentColor" />
      <circle cx="10" cy="13" r="1.6" fill="currentColor" />
      <circle cx="14" cy="13" r="1.6" fill="currentColor" />
      <circle cx="18" cy="11" r="1.6" fill="currentColor" />
      <path d="M12 4v3" />
      <path d="M10.5 7h3l-0.5 2h-2z" fill="currentColor" />
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
    <div dir={dir} lang={settings.lang} className="min-h-screen flex flex-col pb-32">
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
          <p className="font-medium truncate text-sm">{s.englishName}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {s.englishNameTranslation} · {toLocaleDigits(s.numberOfAyahs, lang)} {t.quran.ayahs}
          </p>
        </div>
        <p className="font-display text-xl shrink-0" dir="rtl">{s.name}</p>
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
  const [reciterId, setReciterId] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_RECITER_ID;
    return localStorage.getItem(RECITER_KEY) || DEFAULT_RECITER_ID;
  });
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const [pickerOpen, setPickerOpen] = useState(false);

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [playAll, setPlayAll] = useState(false);
  const [activeWord, setActiveWord] = useState<{ ayahIdx: number; wordIdx: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Translation edition by language
  const translationEdition = lang === "en" ? "en.sahih" : lang === "ar" ? "ar.muyassar" : "ku.asan";

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

  const playAyah = (idx: number, continueAll = false) => {
    audioRef.current?.pause();
    const ayah = arabic[idx];
    if (!ayah) return;
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

      <div className="space-y-3">
        {arabic.map((a, i) => {
          const isActive = playingIdx === i;
          const cleanText = stripBismillah(a.text, surah.number, a.numberInSurah);
          const words = cleanText.split(/\s+/).filter(Boolean);
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
                <button
                  onClick={() => (isActive ? stopAudio() : playAyah(i))}
                  className="h-9 w-9 rounded-full flex items-center justify-center border hover:border-primary/60 transition"
                  style={{ borderColor: "var(--glass-border)" }}
                  aria-label="play ayah"
                >
                  {isActive ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary" />}
                </button>
              </div>

              <p className="font-display text-2xl leading-loose text-right" dir="rtl">
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
    </div>
  );
}

// ============ PRAYER TIMES ============
type PrayerTimings = { Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string };

function PrayerView({ t, lang, cityId, madhab }: { t: Dict; lang: Lang; cityId: string; madhab: "shafi" | "hanafi" }) {
  const city = findCity(cityId);
  const school = madhab === "hanafi" ? 1 : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useQuery({
    queryKey: ["prayer", city.id, school, todayStr],
    queryFn: async (): Promise<{ timings: PrayerTimings }> => {
      const d = new Date();
      const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${city.lat}&longitude=${city.lon}&method=3&school=${school}&timezonestring=${encodeURIComponent(city.tz)}`,
      );
      const json = await res.json();
      return { timings: json.data.timings };
    },
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const to12 = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? t.prayer.pm : t.prayer.am;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${toLocaleDigits(h12, lang)}:${toLocaleDigits(String(m).padStart(2, "0"), lang)} ${period}`;
  };
  const prayers = data
    ? [
        { name: t.prayer.names.fajr, time: data.timings.Fajr.slice(0, 5) },
        { name: t.prayer.names.sunrise, time: data.timings.Sunrise.slice(0, 5) },
        { name: t.prayer.names.dhuhr, time: data.timings.Dhuhr.slice(0, 5) },
        { name: t.prayer.names.asr, time: data.timings.Asr.slice(0, 5) },
        { name: t.prayer.names.maghrib, time: data.timings.Maghrib.slice(0, 5) },
        { name: t.prayer.names.isha, time: data.timings.Isha.slice(0, 5) },
      ]
    : [];

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = prayers.find((p) => {
    const [h, m] = p.time.split(":").map(Number);
    return h * 60 + m > nowMin;
  }) || prayers[0];
  const remaining = next
    ? (() => {
        const [h, m] = next.time.split(":").map(Number);
        let diff = h * 60 + m - nowMin;
        if (diff < 0) diff += 24 * 60;
        return `${toLocaleDigits(Math.floor(diff / 60), lang)} ${t.prayer.hours} ${toLocaleDigits(diff % 60, lang)} ${t.prayer.minutes}`;
      })()
    : "";

  const cityName = lang === "ar" ? city.ar : lang === "en" ? city.en : city.ku;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-muted-foreground">{t.prayer.nextPrayer}</p>
          <span className="flex items-center gap-1 text-xs text-primary">
            <MapPin className="h-3 w-3" /> {cityName}
          </span>
        </div>
        {isLoading ? (
          <p className="mt-2 text-muted-foreground">{t.quran.loading}</p>
        ) : next ? (
          <>
            <div className="mt-2 flex items-baseline justify-between">
              <h2 className="text-3xl font-semibold">{next.name}</h2>
              <p className="text-2xl text-primary tabular-nums">{to12(next.time)}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{remaining} {t.prayer.remaining}</p>
          </>
        ) : null}
      </Card>
      <div className="grid gap-2">
        {prayers.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded-2xl border px-5 py-4 backdrop-blur-xl"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          >
            <span className="font-medium">{p.name}</span>
            <span className="text-primary tabular-nums">{to12(p.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ DHIKR ============
function DhikrView({ t, lang }: { t: Dict; lang: Lang }) {
  const [sub, setSub] = useState<"morning" | "evening">(new Date().getHours() < 14 ? "morning" : "evening");
  const items = sub === "morning" ? MORNING_ADHKAR : EVENING_ADHKAR;

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-2 gap-1 rounded-2xl border p-1 backdrop-blur-xl"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      >
        <button
          onClick={() => setSub("morning")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
            sub === "morning" ? "text-primary-foreground" : "text-muted-foreground"
          }`}
          style={sub === "morning" ? { background: "var(--gradient-gold)" } : undefined}
        >
          <Sunrise className="h-4 w-4" /> {t.dhikr.morning}
        </button>
        <button
          onClick={() => setSub("evening")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
            sub === "evening" ? "text-primary-foreground" : "text-muted-foreground"
          }`}
          style={sub === "evening" ? { background: "var(--gradient-gold)" } : undefined}
        >
          <Moon className="h-4 w-4" /> {t.dhikr.evening}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((d, i) => (
          <DhikrCard key={`${sub}-${i}`} dhikr={d} storageKey={`ibadah:dhikr:${sub}:${i}`} t={t} lang={lang} />
        ))}
      </div>
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
      <p className="font-display text-xl leading-relaxed text-right" dir="rtl">{dhikr.ar}</p>
      <p className="mt-3 text-xs text-muted-foreground text-right" dir="rtl">{dhikr.ku}</p>
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
  const langs: Lang[] = ["ku", "ar", "en"];

  const cityLabel = (id: string) => {
    const c = findCity(id);
    return lang === "ar" ? c.ar : lang === "en" ? c.en : c.ku;
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
        <select
          value={settings.cityId}
          onChange={(e) => update({ cityId: e.target.value })}
          className="w-full rounded-xl border px-3 py-3 text-sm bg-transparent focus:outline-none focus:border-primary/50"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id} className="bg-background text-foreground">
              {cityLabel(c.id)}
            </option>
          ))}
        </select>
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
    </div>
  );
}
