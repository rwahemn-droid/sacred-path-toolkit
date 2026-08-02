import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "./i18n";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => SpeechRecognitionLike)
    | null;
}

const LOCALE: Record<Lang, string> = {
  ku: "ar-IQ",
  ar: "ar-SA",
  en: "en-US",
  kmr: "ar-IQ",
  bad: "ar-IQ",
} as Record<Lang, string>;

/** Voice input hook built on the browser Speech Recognition API. */
export function useVoiceSearch(lang: Lang, onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const cbRef = useRef(onResult);
  cbRef.current = onResult;

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
    return () => recRef.current?.abort();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = LOCALE[lang] ?? "ar-IQ";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) cbRef.current(text.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

/** Strips Arabic diacritics and normalises letters for fuzzy matching. */
export function normalizeAr(s: string) {
  return s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[إأآٱا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const COMMAND_WORDS = [
  "سورة", "سوره", "سووره", "افتح", "اقرا", "اقرأ", "بکەرەوە", "بکەوە",
  "open", "surah", "sura", "read", "go", "to", "chapter",
];

/** Removes voice-command filler words so only the surah name remains. */
export function extractSurahQuery(spoken: string) {
  const words = normalizeAr(spoken).split(" ");
  const kept = words.filter((w) => !COMMAND_WORDS.includes(w));
  return (kept.length ? kept : words).join(" ").trim();
}

type NamedSurah = { number: number; name: string; englishName: string; englishNameTranslation: string };

/** Finds the best surah match for a spoken phrase. */
export function matchSurah<T extends NamedSurah>(spoken: string, surahs: T[]): T | null {
  const q = extractSurahQuery(spoken);
  if (!q || !surahs.length) return null;

  const digits = q.match(/\d+/)?.[0];
  if (digits) {
    const n = Number(digits);
    const byNum = surahs.find((s) => s.number === n);
    if (byNum) return byNum;
  }

  const cands = surahs.map((s) => ({
    s,
    keys: [normalizeAr(s.name), s.englishName.toLowerCase(), s.englishNameTranslation.toLowerCase()],
  }));

  for (const c of cands) if (c.keys.some((k) => k === q)) return c.s;
  for (const c of cands) if (c.keys.some((k) => k.includes(q) || q.includes(k))) return c.s;

  // token overlap fallback
  const qt = q.split(" ").filter(Boolean);
  let best: { s: T; score: number } | null = null;
  for (const c of cands) {
    const score = qt.reduce(
      (acc, tok) => acc + (c.keys.some((k) => k.includes(tok)) && tok.length > 2 ? 1 : 0),
      0,
    );
    if (score > 0 && (!best || score > best.score)) best = { s: c.s, score };
  }
  return best?.s ?? null;
}
