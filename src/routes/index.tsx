import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Sun, Target, Search, Bookmark, BookmarkCheck, Play, Pause, ChevronDown, MapPin, Sunrise, Moon } from "lucide-react";
import { SplashScreen } from "@/components/SplashScreen";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl, type Reciter } from "@/lib/reciters";
import { MORNING_ADHKAR, EVENING_ADHKAR, type Dhikr } from "@/lib/adhkar";

export const Route = createFileRoute("/")({
  component: AppRoot,
  head: () => ({
    meta: [
      { title: "IbadahPro — قورئان و عیبادە" },
      { name: "description", content: "قورئان، کاتەکانی نوێژ، ویردی بەیانی و ئێوارە، تەسبیح" },
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
      <header className="px-6 pt-8 pb-4 text-center">
        <p className="text-xs tracking-[0.3em] text-primary/80 uppercase">IbadahPro</p>
        <h1 className="mt-2 text-2xl font-semibold font-display">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h1>
      </header>

      <main className="flex-1 px-4">
        {active === "quran" && <QuranView />}
        {active === "prayer" && <PrayerView />}
        {active === "dhikr" && <DhikrView />}
        {active === "tasbih" && <TasbihView />}
      </main>

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[min(94%,30rem)] z-50">
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

function QuranView() {
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
    staleTime: 1000 * 60 * 60,
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

  if (selected) return <SurahDetail surah={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="گەڕان لە سوورەتەکان..."
          className="w-full rounded-2xl border bg-transparent backdrop-blur-xl pr-11 pl-4 py-3 text-sm text-right focus:outline-none focus:border-primary/50"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        />
      </div>

      {bookmarked.length > 0 && !query && (
        <div className="space-y-2">
          <h3 className="text-xs text-primary px-1 flex items-center gap-1.5">
            <BookmarkCheck className="h-3.5 w-3.5" /> سوورەتە بوکمارککراوەکان
          </h3>
          <div className="grid gap-2">
            {bookmarked.map((s) => (
              <SurahItem key={s.number} s={s} onOpen={() => setSelected(s)} isBookmarked onToggleBookmark={() => toggle(s.number)} />
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xs text-muted-foreground px-1">هەموو سوورەتەکان ({filtered.length})</h3>
      {isLoading && <div className="text-center py-12 text-muted-foreground">بارکردن...</div>}
      {isError && <div className="text-center py-12 text-destructive">هەڵە لە هێنانی داتا</div>}
      <div className="grid gap-2">
        {filtered.map((s) => (
          <SurahItem
            key={s.number}
            s={s}
            onOpen={() => setSelected(s)}
            isBookmarked={bookmarks.includes(s.number)}
            onToggleBookmark={() => toggle(s.number)}
          />
        ))}
      </div>
    </div>
  );
}

function SurahItem({
  s,
  onOpen,
  isBookmarked,
  onToggleBookmark,
}: {
  s: Surah;
  onOpen: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-2xl border p-3 backdrop-blur-xl transition hover:border-primary/40"
      style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
    >
      <button onClick={onOpen} className="flex-1 flex items-center gap-3 text-right min-w-0">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
        >
          {s.number}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate text-sm">{s.englishName}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {s.englishNameTranslation} · {s.numberOfAyahs} ئایەت
          </p>
        </div>
        <p className="font-display text-xl shrink-0">{s.name}</p>
      </button>
      <button
        onClick={onToggleBookmark}
        className="p-2 rounded-lg hover:bg-white/5 transition"
        aria-label="bookmark"
      >
        {isBookmarked ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

// ============ SURAH DETAIL with audio + sync ============
type WordTiming = [number, number, number]; // [wordIndex, startMs, endMs]
type AyahTiming = { verse_key: string; timestamp_from: number; timestamp_to: number; segments: WordTiming[] };
type QCAudioFile = { audio_url: string; verse_timings: AyahTiming[] };

function SurahDetail({ surah, onBack }: { surah: Surah; onBack: () => void }) {
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["surah", surah.number],
    queryFn: async (): Promise<EditionData[]> => {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,ku.asan`,
      );
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const arabic = data?.[0]?.ayahs ?? [];
  const kurdish = data?.[1]?.ayahs ?? [];

  // Fetch word timings (only for reciters with quranComId)
  const { data: timings } = useQuery({
    enabled: !!reciter.quranComId && arabic.length > 0,
    queryKey: ["timings", reciter.quranComId, surah.number],
    queryFn: async (): Promise<Record<number, AyahTiming>> => {
      // Single chapter fetch
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
    staleTime: 1000 * 60 * 60,
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

    // Scroll to ayah
    setTimeout(() => {
      ayahRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    // Word timing
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} className="text-sm text-primary hover:underline shrink-0">
          ← گەڕانەوە
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="font-display text-lg truncate">{surah.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {surah.englishName} · {surah.numberOfAyahs} ئایەت
          </p>
        </div>
      </div>

      {/* Reciter picker + play all */}
      <Card className="!p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex-1 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-right hover:border-primary/40 transition"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
          >
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${pickerOpen ? "rotate-180" : ""}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">قاری</p>
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
          <div className="mt-3 max-h-72 overflow-y-auto grid gap-1 pr-1">
            {RECITERS.map((r) => (
              <button
                key={r.id}
                onClick={() => chooseReciter(r.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-right text-sm transition ${
                  r.id === reciterId ? "text-primary-foreground" : "hover:bg-white/5"
                }`}
                style={r.id === reciterId ? { background: "var(--gradient-gold)" } : undefined}
              >
                <span className="text-[10px] opacity-70">
                  {r.quranComId ? "✦ سینکی وشە" : ""}
                </span>
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {isLoading && <div className="text-center py-12 text-muted-foreground">بارکردن...</div>}
      {isError && <div className="text-center py-12 text-destructive">هەڵە لە هێنانی داتا</div>}

      <div className="space-y-3">
        {arabic.map((a, i) => {
          const isActive = playingIdx === i;
          const words = a.text.split(/\s+/);
          return (
            <div
              key={a.number}
              ref={(el) => {
                ayahRefs.current[i] = el;
              }}
              className={`rounded-3xl border p-5 backdrop-blur-xl transition-all ${
                isActive ? "border-primary/60 shadow-lg" : ""
              }`}
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
                  {a.numberInSurah}
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
                      key={wi}
                      className="transition-colors"
                      style={highlight ? { color: "oklch(0.92 0.18 95)", textShadow: "0 0 12px oklch(0.92 0.18 95 / 0.5)" } : undefined}
                    >
                      {w}{" "}
                    </span>
                  );
                })}
              </p>

              {kurdish[i] && (
                <p className="mt-4 pt-4 border-t border-white/10 text-sm leading-relaxed text-muted-foreground text-right">
                  {kurdish[i].text}
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
type PrayerTimings = {
  Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string;
};

function PrayerView() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = localStorage.getItem("ibadah:coords");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [locError, setLocError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError("ئامێرەکەت پشتیوانی Geolocation ناکات");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        localStorage.setItem("ibadah:coords", JSON.stringify(c));
        setLocError(null);
      },
      () => setLocError("ڕێگەی پێ نەدا بۆ شوێن"),
    );
  };

  useEffect(() => {
    if (!coords) requestLocation();
  }, []);

  const { data, isLoading } = useQuery({
    enabled: !!coords,
    queryKey: ["prayer", coords?.lat, coords?.lon],
    queryFn: async (): Promise<{ timings: PrayerTimings; city: string }> => {
      const res = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${coords!.lat}&longitude=${coords!.lon}&method=2`,
      );
      const json = await res.json();
      return { timings: json.data.timings, city: json.data.meta?.timezone || "" };
    },
    staleTime: 1000 * 60 * 30,
  });

  const prayers = data
    ? [
        { name: "بەیانی", time: data.timings.Fajr.slice(0, 5) },
        { name: "خۆرهەڵات", time: data.timings.Sunrise.slice(0, 5) },
        { name: "نیوەڕۆ", time: data.timings.Dhuhr.slice(0, 5) },
        { name: "عەسر", time: data.timings.Asr.slice(0, 5) },
        { name: "ئێوارە", time: data.timings.Maghrib.slice(0, 5) },
        { name: "خەفتنەوە", time: data.timings.Isha.slice(0, 5) },
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
        return `${Math.floor(diff / 60)} کاتژمێر و ${diff % 60} خولەک`;
      })()
    : "";

  if (!coords) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <MapPin className="h-10 w-10 text-primary" />
            <p className="font-medium">شوێنەکەت پێویستە بۆ کاتە ڕاستەقینەکانی نوێژ</p>
            {locError && <p className="text-xs text-destructive">{locError}</p>}
            <button
              onClick={requestLocation}
              className="px-5 py-2.5 rounded-xl font-medium"
              style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
            >
              ڕێگە بدە بە شوێن
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-muted-foreground">نوێژی داهاتوو</p>
        {isLoading ? (
          <p className="mt-2 text-muted-foreground">بارکردن...</p>
        ) : next ? (
          <>
            <div className="mt-2 flex items-baseline justify-between">
              <h2 className="text-3xl font-semibold">{next.name}</h2>
              <p className="text-2xl text-primary tabular-nums">{next.time}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{remaining} ماوە</p>
          </>
        ) : null}
      </Card>
      <div className="grid gap-2">
        {prayers.map((t) => (
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

// ============ DHIKR (Morning/Evening Adhkar) ============
function DhikrView() {
  const [sub, setSub] = useState<"morning" | "evening">(
    new Date().getHours() < 14 ? "morning" : "evening",
  );
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
          <Sunrise className="h-4 w-4" /> ویردی بەیانی
        </button>
        <button
          onClick={() => setSub("evening")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
            sub === "evening" ? "text-primary-foreground" : "text-muted-foreground"
          }`}
          style={sub === "evening" ? { background: "var(--gradient-gold)" } : undefined}
        >
          <Moon className="h-4 w-4" /> ویردی ئێوارە
        </button>
      </div>

      <div className="space-y-3">
        {items.map((d, i) => (
          <DhikrCard key={i} dhikr={d} />
        ))}
      </div>
    </div>
  );
}

function DhikrCard({ dhikr }: { dhikr: Dhikr }) {
  const [count, setCount] = useState(0);
  const done = count >= dhikr.count;
  return (
    <Card>
      <p className="font-display text-xl leading-relaxed text-right" dir="rtl">
        {dhikr.ar}
      </p>
      <p className="mt-3 text-xs text-muted-foreground text-right">{dhikr.ku}</p>
      <button
        onClick={() => setCount((c) => (c >= dhikr.count ? 0 : c + 1))}
        className={`mt-4 w-full flex items-center justify-between rounded-xl border px-4 py-3 transition ${
          done ? "border-primary/60" : ""
        }`}
        style={{
          background: done ? "color-mix(in oklch, var(--primary) 12%, transparent)" : "var(--glass-bg)",
          borderColor: done ? "var(--primary)" : "var(--glass-border)",
        }}
      >
        <span className="text-xs text-muted-foreground">{done ? "تەواوبوو ✓" : "کلیک بکە"}</span>
        <span className="font-semibold tabular-nums">
          <span className="text-primary">{count}</span> / {dhikr.count}
        </span>
      </button>
    </Card>
  );
}

// ============ TASBIH ============
function TasbihView() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <Card>
        <p className="font-display text-3xl text-center">سُبْحَانَ اللَّهِ</p>
      </Card>
      <div
        className="text-7xl font-bold tabular-nums"
        style={{ background: "var(--gradient-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        {count}
      </div>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="h-40 w-40 rounded-full text-xl font-semibold transition-all active:scale-95"
        style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}
      >
        تەسبیح
      </button>
      <button onClick={() => setCount(0)} className="text-sm text-muted-foreground hover:text-foreground">
        سفر کردنەوە
      </button>
    </div>
  );
}
