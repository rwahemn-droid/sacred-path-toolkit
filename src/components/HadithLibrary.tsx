import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Search, Loader2, Bookmark, BookmarkCheck, LayoutGrid } from "lucide-react";
import type { Dict, Lang } from "@/lib/i18n";
import { CATEGORIES, hadithsByCategory, toggleHadithBookmark, useHadithBookmarks, type CatId } from "@/lib/hadith-extra";
import { ShareButton } from "./ShareButton";

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
type Tab = "collections" | "categories" | "saved";

export function HadithLibrary({ lang, t, onBack }: { lang: Lang; t: Dict; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("collections");
  const [cat, setCat] = useState<CatId | null>(null);
  const [active, setActive] = useState<Collection | null>(null);
  const [hadiths, setHadiths] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const PAGE = 25;
  const bookmarks = useHadithBookmarks();
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);

  useEffect(() => {
    if (!active) return;
    setLoading(true); setErr(false); setPage(0);
    fetch(`${BASE}/${active.slug}.min.json`)
      .then((r) => r.json())
      .then((j) => setHadiths(j.hadiths ?? []))
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, [active]);

  const Header = ({ title, onBackClick }: { title: string; onBackClick: () => void }) => (
    <div className="flex items-center gap-2">
      <button onClick={onBackClick} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );

  const saved = (key: string) => bookmarks.some((b) => b.key === key);

  const HadithCard = ({ bkey, ar, ku, ref_ }: { bkey: string; ar: string; ku?: string; ref_: string }) => (
    <div className="rounded-2xl border p-4 backdrop-blur-xl space-y-2" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-primary truncate">{ref_}</p>
        <div className="flex items-center gap-1.5">
          <ShareButton kind="hadith" arabic={ar} translation={ku} reference={ref_} />
          <button
            onClick={() => toggleHadithBookmark({ key: bkey, ar, ku, ref: ref_ })}
            className="h-9 w-9 rounded-full grid place-items-center border hover:border-primary/60 transition"
            style={{ borderColor: "var(--glass-border)" }}
            aria-label="bookmark"
          >
            {saved(bkey) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
      </div>
      <p className="font-display text-xl leading-loose text-right" dir="rtl" style={{ lineHeight: 2.1 }}>{ar}</p>
      {ku && lang !== "ar" && <p className="text-sm text-muted-foreground pt-2 border-t border-white/10" dir="rtl">{ku}</p>}
    </div>
  );

  // ---- Category detail ----
  if (tab === "categories" && cat) {
    const meta = CATEGORIES.find((c) => c.id === cat)!;
    const list = hadithsByCategory(cat).filter((h) => !query.trim() || h.ar.includes(query.trim()) || h.ku.includes(query.trim()));
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
        <Header title={`${meta.icon} ${lang === "ar" ? meta.ar : lang === "en" ? meta.en : meta.ku}`} onBackClick={() => setCat(null)} />
        <SearchBox value={query} onChange={setQuery} placeholder={L("گەڕان...", "بحث...", "Search...")} />
        {list.length === 0 && <p className="text-center py-10 text-sm text-muted-foreground">—</p>}
        {list.map((h) => (
          <HadithCard key={h.id} bkey={`curated-${h.id}`} ar={h.ar} ku={h.ku} ref_={`${h.narrator} · ${h.source}`} />
        ))}
      </div>
    );
  }

  // ---- Collection detail ----
  if (active) {
    const q = query.trim();
    const filtered = q ? hadiths.filter((h) => h.text.includes(q) || String(h.hadithnumber).includes(q)) : hadiths;
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

        <SearchBox value={query} onChange={(v) => { setQuery(v); setPage(0); }} placeholder={L("بحث...", "بحث...", "Search...")} />

        {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
        {err && <div className="text-center py-12 text-destructive">{t.quran.error}</div>}

        {!loading && !err && slice.map((h) => (
          <HadithCard key={h.hadithnumber} bkey={`${active.id}-${h.hadithnumber}`} ar={h.text} ref_={`${active.name} #${h.hadithnumber}`} />
        ))}

        {!loading && total > PAGE && (
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40" style={{ borderColor: "var(--glass-border)" }}>‹</button>
            <p className="text-xs text-muted-foreground">{page + 1} / {Math.ceil(total / PAGE)}</p>
            <button onClick={() => setPage((p) => Math.min(Math.ceil(total / PAGE) - 1, p + 1))} disabled={(page + 1) * PAGE >= total} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40" style={{ borderColor: "var(--glass-border)" }}>›</button>
          </div>
        )}
      </div>
    );
  }

  // ---- Hub ----
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <Header title={L("کتێبخانەی حەدیس", "مكتبة الحديث", "Hadith Library")} onBackClick={onBack} />

      <div className="grid grid-cols-3 gap-1.5">
        {([
          ["collections", L("کۆمەڵەکان", "المجموعات", "Collections")],
          ["categories", L("بەشەکان", "التصنيفات", "Categories")],
          ["saved", L("پاشەکەوت", "المحفوظة", "Saved")],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setQuery(""); }}
            className="rounded-xl border py-2 text-[12px] font-medium transition"
            style={{
              background: tab === id ? "var(--gradient-teal)" : "transparent",
              color: tab === id ? "var(--primary-foreground)" : undefined,
              borderColor: tab === id ? "transparent" : "var(--glass-border)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "collections" && (
        <div className="grid gap-2">
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActive(c); setQuery(""); }}
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
      )}

      {tab === "categories" && (
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCat(c.id); setQuery(""); }}
              className="rounded-2xl border p-4 text-center backdrop-blur-xl hover:border-primary/40 transition"
              style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
            >
              <p className="text-3xl">{c.icon}</p>
              <p className="mt-1 text-sm font-medium">{lang === "ar" ? c.ar : lang === "en" ? c.en : c.ku}</p>
              <p className="text-[10px] text-muted-foreground">{hadithsByCategory(c.id).length}</p>
            </button>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="space-y-3">
          {bookmarks.length === 0 && (
            <div className="rounded-2xl border p-10 text-center backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
              <LayoutGrid className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{L("هیچ حەدیسێک پاشەکەوت نەکراوە", "لا توجد أحاديث محفوظة", "No saved hadiths yet")}</p>
            </div>
          )}
          {bookmarks.map((b) => (
            <HadithCard key={b.key} bkey={b.key} ar={b.ar} ku={b.ku} ref_={b.ref} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border bg-transparent backdrop-blur-xl pe-11 ps-4 py-3 text-sm focus:outline-none focus:border-primary/50"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      />
    </div>
  );
}
