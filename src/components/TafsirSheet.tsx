import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Dict, Lang } from "@/lib/i18n";

type TafsirSheetProps = {
  surahNum: number;
  ayahNum: number;
  arabicText: string;
  lang: Lang;
  t: Dict;
  onClose: () => void;
};

// Use API: tafsir editions vary; we fetch a Kurdish-friendly tafsir (ar.muyassar) for clarity,
// plus a fallback simplified meaning.
export function TafsirSheet({ surahNum, ayahNum, arabicText, lang, t, onClose }: TafsirSheetProps) {
  const [tafsir, setTafsir] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const key = `${surahNum}:${ayahNum}`;
    fetch(`https://api.alquran.cloud/v1/ayah/${key}/ar.muyassar`)
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        if (j?.data?.text) setTafsir(j.data.text);
        else setError(true);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => { active = false; };
  }, [surahNum, ayahNum]);

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] rounded-3xl border overflow-hidden flex flex-col"
        style={{ background: "var(--background)", borderColor: "var(--glass-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/5"
            aria-label={t.prayer.close}
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm font-medium">
            {t.quran.tafsir} — {surahNum}:{ayahNum}
          </p>
          <div className="w-9" />
        </div>

        <div className="overflow-auto p-5 space-y-4">
          <p
            className="font-display text-2xl leading-loose text-right"
            dir="rtl"
            style={{ lineHeight: 2.1 }}
          >
            {arabicText}
          </p>
          <div className="border-t pt-4" style={{ borderColor: "var(--glass-border)" }}>
            {loading && <p className="text-center text-muted-foreground py-6">{t.quran.loading}</p>}
            {error && <p className="text-center text-destructive py-6">{t.quran.error}</p>}
            {!loading && !error && (
              <>
                <p className="text-xs text-primary mb-2">{t.quran.tafsir} (التفسير الميسر)</p>
                <p
                  className="text-sm leading-relaxed text-right"
                  dir="rtl"
                  style={{ lineHeight: 1.9 }}
                >
                  {tafsir}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
