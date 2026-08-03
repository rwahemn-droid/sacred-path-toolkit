// Offline downloads: Quran text + translation + tafsir in localStorage, audio in the Cache API.
import { useCallback, useEffect, useState } from "react";

const TEXT_PREFIX = "ibadah:offline:surah:";
const TAFSIR_PREFIX = "ibadah:offline:tafsir:";
const AUDIO_CACHE = "ibadah-audio-v1";
const INDEX_KEY = "ibadah:offline:index";

export type OfflineIndex = {
  text: number[];
  tafsir: number[];
  audio: number[];
};

const EMPTY: OfflineIndex = { text: [], tafsir: [], audio: [] };

export function readIndex(): OfflineIndex {
  if (typeof window === "undefined") return EMPTY;
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(INDEX_KEY) || "{}") };
  } catch {
    return EMPTY;
  }
}

function writeIndex(i: OfflineIndex) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(i));
  } catch {
    /* ignore */
  }
}

function add(list: number[], n: number) {
  return list.includes(n) ? list : [...list, n];
}

export function getOfflineSurah(surah: number, edition: string) {
  try {
    const raw = localStorage.getItem(`${TEXT_PREFIX}${surah}:${edition}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function downloadText(surah: number, edition: string) {
  const res = await fetch(
    `https://api.alquran.cloud/v1/surah/${surah}/editions/quran-uthmani,${edition}`,
  );
  if (!res.ok) throw new Error("download failed");
  const data = (await res.json()).data;
  localStorage.setItem(`${TEXT_PREFIX}${surah}:${edition}`, JSON.stringify(data));
  const idx = readIndex();
  writeIndex({ ...idx, text: add(idx.text, surah) });
}

export function getOfflineTafsir(surah: number) {
  try {
    const raw = localStorage.getItem(`${TAFSIR_PREFIX}${surah}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function downloadTafsir(surah: number) {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/ar.muyassar`);
  if (!res.ok) throw new Error("download failed");
  const data = (await res.json()).data;
  localStorage.setItem(`${TAFSIR_PREFIX}${surah}`, JSON.stringify(data));
  const idx = readIndex();
  writeIndex({ ...idx, tafsir: add(idx.tafsir, surah) });
}

/** Cache every ayah audio file of a surah for offline playback. */
export async function downloadAudio(
  urls: string[],
  surah: number,
  onProgress?: (done: number, total: number) => void,
) {
  if (typeof caches === "undefined") throw new Error("no cache api");
  const cache = await caches.open(AUDIO_CACHE);
  let done = 0;
  for (const url of urls) {
    try {
      const hit = await cache.match(url);
      if (!hit) await cache.add(url);
    } catch {
      /* skip failed file */
    }
    done++;
    onProgress?.(done, urls.length);
  }
  const idx = readIndex();
  writeIndex({ ...idx, audio: add(idx.audio, surah) });
}

export async function clearOffline() {
  const idx = readIndex();
  for (const s of idx.text)
    for (const ed of ["ku.asan", "en.sahih", "ar.muyassar"])
      localStorage.removeItem(`${TEXT_PREFIX}${s}:${ed}`);
  for (const s of idx.tafsir) localStorage.removeItem(`${TAFSIR_PREFIX}${s}`);
  if (typeof caches !== "undefined") await caches.delete(AUDIO_CACHE);
  writeIndex(EMPTY);
}

export function useOfflineIndex() {
  const [idx, setIdx] = useState<OfflineIndex>(EMPTY);
  useEffect(() => setIdx(readIndex()), []);
  const refresh = useCallback(() => setIdx(readIndex()), []);
  return { idx, refresh };
}
