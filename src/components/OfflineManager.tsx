import { ArrowLeft, Download, Trash2, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { downloadText, downloadTafsir, downloadAudio, clearOffline, useOfflineIndex } from "@/lib/offline";
import { RECITERS, DEFAULT_RECITER_ID, ayahAudioUrl } from "@/lib/reciters";
import type { Lang } from "@/lib/i18n";

type Surah = { number: number; name: string; englishName: string; numberOfAyahs: number };

export function OfflineManager({ lang, surahs, onBack }: { lang: Lang; surahs: Surah[]; onBack: () => void }) {
  const { idx, refresh } = useOfflineIndex();
  const [busy, setBusy] = useState<number | null>(null);
  const [progress, setProgress] = useState("");
  const [query, setQuery] = useState("");
  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);
  const edition = lang === "en" ? "en.sahih" : lang === "ar" ? "ar.muyassar" : "ku.asan";
  const reciter = RECITERS.find((r) => r.id === (localStorage.getItem("ibadah:reciter") || DEFAULT_RECITER_ID)) || RECITERS[0]!;

  const download = async (s: Surah) => {
    setBusy(s.number);
    try {
      setProgress(L("دەقی قورئان...", "النص...", "Text..."));
      await downloadText(s.number, edition);
      setProgress(L("تەفسیر...", "التفسير...", "Tafsir..."));
      await downloadTafsir(s.number);
      const urls = Array.from({ length: s.numberOfAyahs }, (_, i) => ayahAudioUrl(reciter, s.number, i + 1));
      await downloadAudio(urls, s.number, (d, tt) => setProgress(`${L("دەنگ", "الصوت", "Audio")} ${d}/${tt}`));
      refresh();
    } catch {
      setProgress(L("هەڵە", "خطأ", "Error"));
    }
    setBusy(null);
    setProgress("");
  };

  const filtered = query
    ? surahs.filter((s) => s.name.includes(query) || s.englishName.toLowerCase().includes(query.toLowerCase()) || String(s.number) === query)
    : surahs;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="flex-1 text-lg font-semibold">{L("داگرتنی ئۆفلاین", "التحميل دون اتصال", "Offline Downloads")}</h2>
        <button
          onClick={async () => { await clearOffline(); refresh(); }}
          className="h-9 w-9 rounded-full grid place-items-center hover:bg-white/5"
          aria-label="clear"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {L("دەق، وەرگێڕان، تەفسیر و دەنگ بۆ بەکارهێنان بەبێ ئینتەرنێت.", "النص والترجمة والتفسير والصوت للاستخدام دون اتصال.", "Text, translation, tafsir and audio saved for offline use.")}
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={L("گەڕان...", "بحث...", "Search...")}
        className="w-full rounded-2xl border bg-transparent backdrop-blur-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
      />

      <div className="grid gap-2">
        {filtered.map((s) => {
          const done = idx.text.includes(s.number) && idx.audio.includes(s.number);
          const isBusy = busy === s.number;
          return (
            <div key={s.number} className="flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg truncate" dir="rtl">{s.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {isBusy ? progress : `${s.englishName} · ${s.numberOfAyahs}`}
                </p>
              </div>
              <button
                onClick={() => download(s)}
                disabled={isBusy || done}
                className="h-9 w-9 rounded-full grid place-items-center border disabled:opacity-60"
                style={{ borderColor: "var(--glass-border)" }}
                aria-label="download"
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : done ? <Check className="h-4 w-4 text-primary" /> : <Download className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
