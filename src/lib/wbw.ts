// Word-by-word Quran data from api.quran.com (free, no auth).
export type WbwWord = {
  position: number;
  arabic: string;
  transliteration: string;
  translation: string;
  audio: string | null;
};

export type WbwVerse = { ayah: number; words: WbwWord[] };

const AUDIO_BASE = "https://verses.quran.com/";

type ApiWord = {
  position: number;
  char_type_name: string;
  text_uthmani?: string;
  text?: string;
  audio_url?: string | null;
  transliteration?: { text: string | null };
  translation?: { text: string | null };
};

/** Fetch word-by-word data for a whole surah, keyed by ayah number. */
export async function fetchWordByWord(
  surah: number,
  language = "en",
): Promise<Record<number, WbwWord[]>> {
  const url =
    `https://api.quran.com/api/v4/verses/by_chapter/${surah}` +
    `?words=true&per_page=300&word_translation_language=${language}` +
    `&word_fields=text_uthmani,transliteration,audio_url`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("wbw failed");
  const json = (await res.json()) as {
    verses: { verse_key: string; words: ApiWord[] }[];
  };
  const out: Record<number, WbwWord[]> = {};
  for (const v of json.verses ?? []) {
    const ayah = parseInt(v.verse_key.split(":")[1] ?? "0", 10);
    if (!ayah) continue;
    out[ayah] = (v.words ?? [])
      .filter((w) => w.char_type_name === "word")
      .map((w) => ({
        position: w.position,
        arabic: w.text_uthmani ?? w.text ?? "",
        transliteration: w.transliteration?.text ?? "",
        translation: w.translation?.text ?? "",
        audio: w.audio_url ? AUDIO_BASE + w.audio_url : null,
      }));
  }
  return out;
}

let wordAudio: HTMLAudioElement | null = null;

/** Play a single word's pronunciation. */
export function playWordAudio(url: string | null) {
  if (!url) return;
  wordAudio?.pause();
  wordAudio = new Audio(url);
  void wordAudio.play().catch(() => undefined);
}
