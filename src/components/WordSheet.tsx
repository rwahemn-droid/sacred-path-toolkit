import { useEffect, useState } from "react";
import { X, Volume2 } from "lucide-react";
import { playWordAudio, type WbwWord } from "@/lib/wbw";
import type { Lang } from "@/lib/i18n";

/** Bottom sheet showing a tapped word's meaning, transliteration and audio. */
export function WordSheet({ word, lang, onClose }: { word: WbwWord; lang: Lang; onClose: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const L = (ku: string, ar: string, en: string) => (lang === "ar" ? ar : lang === "en" ? en : ku);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full sm:max-w-md rounded-t-3xl border p-6 pb-8 transition-transform duration-200 ${show ? "translate-y-0" : "translate-y-full"}`}
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(24px)" }}
      >
        <button onClick={onClose} className="absolute end-4 top-4 h-8 w-8 rounded-full grid place-items-center hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>

        <p className="font-display text-4xl text-center leading-loose" dir="rtl">{word.arabic}</p>

        {word.transliteration && (
          <p className="mt-2 text-center text-sm text-primary italic">{word.transliteration}</p>
        )}

        <div className="mt-4 rounded-2xl border p-4 text-center" style={{ borderColor: "var(--glass-border)" }}>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {L("واتا", "المعنى", "Meaning")}
          </p>
          <p className="mt-1 text-base">{word.translation || "—"}</p>
        </div>

        <button
          onClick={() => playWordAudio(word.audio)}
          disabled={!word.audio}
          className="mt-4 w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
          style={{ background: "var(--gradient-teal)" }}
        >
          <Volume2 className="h-4 w-4" />
          {L("گوێ لێبگرە", "استمع", "Pronounce")}
        </button>
      </div>
    </div>
  );
}
