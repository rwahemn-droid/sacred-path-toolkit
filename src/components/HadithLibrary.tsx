import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Search, Loader2 } from "lucide-react";
import type { Dict, Lang } from "@/lib/i18n";

type Collection = { id: string; name: string; arabic: string; slug: string };

// fawazahmed0/hadith-api on jsDelivr (free, no auth)
const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

const COLLECTIONS: Collection[] = [
  { id: "bukhari",   name: "Sahih al-Bukhari",  arabic: "صحيح البخاري",  slug: "ara-bukhari" },
  { id: "muslim",    name: "Sahih Muslim",      arabic: "صحيح مسلم",     slug: "ara-muslim" },
  { id: "abudawud",  name: "Sunan Abu Dawood",  arabic: "سنن أبي داود",  slug: "ara-abudawud" },
  { id: "tirmidhi",  name: "Jami' at-Tirmidhi", arabic: "جامع الترمذي",  slug: "ara-tirmidhi" },
  { id: "nasai",     name: "Sunan an-Nasa'i",   arabic: "سنن النسائي",   slug: "ara-nasai" },
  { id: "ibnmajah",  name: "Sunan Ibn Majah",   arabic: "سنن ابن ماجه",  slug: "ara-ibnmajah" },
  { id: "malik",     name: "Muwatta Malik",     arabic: "موطأ مالك",     slug: "ara-malik" },
  { id: "nawawi",    name: "40 Hadith Nawawi",  arabic: "الأربعين النووية", slug: "ara-nawawi" },
  { id: "qudsi",     name: "40 Hadith Qudsi",   arabic: "الأحاديث القدسية", slug: "ara-qudsi" },
];

type Section = { title?: string; hadithnumber: number; arabicnumber?: number; text: string };

export function HadithLibrary({ lang, t, onBack }: { lang: Lang; t: Dict; onBack: () => void }) {
  const [active, setActive] = useState<Collection | null>(null);
  const [hadiths, setHadiths] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const PAGE = 25;

  useEffect(() => {
    if (!active) return;
    setLoading(true); setErr(false); setPage(0);
    fetch(`${BASE}/${active.slug}.min.json`)
      .then((r) => r.json())
      .then((j) => setHadiths(j.hadiths ?? []))
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, [active]);

  if (!active) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold">
            {lang === "ar" ? "مكتبة الحديث" : lang === "en" ? "Hadith Library" : "کتێبخانەی حەدیس"}
          </h2>
        </div>
        <div className="grid gap-2">
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className="text-start flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl hover:border-primary/40"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
            >
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-teal)" }}>
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg truncate" dir="rtl">{c.arabic}</p>
                <p className="text-[11px] text-muted-foreground truncate">{c.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const q = query.trim();
  const filtered = q
    ? hadiths.filter((h) => h.text.includes(q) || String(h.hadithnumber).includes(q))
    : hadiths;
  const slice = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const total = filtered.length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setActive(null)} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg truncate" dir="rtl">{active.arabic}</p>
          <p className="text-[11px] text-muted-foreground truncate">{active.name} · {total}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder={lang === "ar" ? "بحث..." : lang === "en" ? "Search..." : "گەڕان..."}
          className="w-full rounded-2xl border bg-transparent backdrop-blur-xl pe-11 ps-4 py-3 text-sm focus:outline-none focus:border-primary/50"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        />
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
      {err && <div className="text-center py-12 text-destructive">{t.quran.error}</div>}

      {!loading && !err && slice.map((h) => (
        <div key={h.hadithnumber} className="rounded-2xl border p-4 backdrop-blur-xl space-y-2"
          style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
          <p className="text-[10px] text-primary">#{h.hadithnumber}</p>
          <p className="font-display text-xl leading-loose text-right" dir="rtl" style={{ lineHeight: 2.1 }}>{h.text}</p>
        </div>
      ))}

      {!loading && total > PAGE && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40"
            style={{ borderColor: "var(--glass-border)" }}
          >‹</button>
          <p className="text-xs text-muted-foreground">{page + 1} / {Math.ceil(total / PAGE)}</p>
          <button
            onClick={() => setPage((p) => Math.min(Math.ceil(total / PAGE) - 1, p + 1))}
            disabled={(page + 1) * PAGE >= total}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40"
            style={{ borderColor: "var(--glass-border)" }}
          >›</button>
        </div>
      )}
    </div>
  );
}
