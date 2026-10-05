import { useEffect, useRef, useState } from "react";
import { Mic, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import {
  browserTajweedAnalyzer,
  type TajweedPracticeRule,
  type TajweedTimingResult,
} from "@/lib/tajweed-audio-practice";

type L = Record<"ku" | "bad" | "kmr" | "ar" | "en", string>;
const COPY = {
  correctAudio: { ku: "گوێگرتن بە خوێندنەوەی دروست", bad: "گوهداریا خواندنا دروست", kmr: "Xwendina rast bibihîze", ar: "استمع إلى التلاوة الصحيحة", en: "Correct recitation audio" },
  record: { ku: "تۆمارکردن", bad: "تۆمارکرن", kmr: "Tomar bike", ar: "سجّل", en: "Record" },
  stop: { ku: "وەستان", bad: "راوەستاندن", kmr: "Rawestîne", ar: "إيقاف", en: "Stop" },
  playback: { ku: "گوێگرتن بە تۆمارەکەم", bad: "گوهداریا تۆمارا من", kmr: "Tomara min bibihîze", ar: "تشغيل تسجيلي", en: "Play my recording" },
  tryAgain: { ku: "دووبارە هەوڵبدەوە", bad: "دیسان هەوڵ بدە", kmr: "Dîsa biceribîne", ar: "حاول مجدداً", en: "Try Again" },
  micError: { ku: "ڕێگە بە مایکرۆفۆن نەدرا.", bad: "ڕێ مایکرۆفۆنێ نەهاتە دان.", kmr: "Destûra mîkrofonê nehat dayîn.", ar: "تعذر الوصول إلى الميكروفون.", en: "Microphone access was not available." },
} satisfies Record<string, L>;

const AI_REQUIRED = "Advanced Tajweed analysis requires an audio AI model.";
const tr = (copy: L, lang: Lang) => copy[lang as keyof L] ?? copy.en;

export function TajweedAudioPractice({ rule, segmentText, lang, onListen }: {
  rule: TajweedPracticeRule;
  segmentText: string;
  lang: Lang;
  onListen: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [result, setResult] = useState<TajweedTimingResult | null>(null);
  const [error, setError] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  function clearAttempt() {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setResult(null);
    setError(false);
  }

  useEffect(() => {
    return () => {
      const media = mediaRef.current;
      if (media && media.state !== "inactive") media.stop();
      media?.stream.getTracks().forEach((track) => track.stop());
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  async function startRecording() {
    clearAttempt();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      mediaRef.current = media;
      chunksRef.current = [];
      startedAtRef.current = performance.now();
      media.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      media.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: media.mimeType || "audio/webm" });
        const durationMs = Math.max(0, performance.now() - startedAtRef.current);
        setRecordingUrl(URL.createObjectURL(blob));
        setRecording(false);
        setResult(await browserTajweedAnalyzer.analyze({ rule, segmentText, recording: blob, recordingDurationMs: durationMs }));
      };
      media.start();
      setRecording(true);
    } catch {
      setError(true);
      setRecording(false);
    }
  }

  function stopRecording() {
    const media = mediaRef.current;
    if (media?.state === "recording") media.stop();
  }

  function playRecording() {
    if (recordingUrl) new Audio(recordingUrl).play().catch(() => undefined);
  }

  return (
    <span className="mt-3 block border-t border-white/10 pt-3">
      <span className="flex gap-2">
        <button onClick={onListen} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-xs font-medium text-white/90 active:scale-95">
          <Volume2 className="h-4 w-4" />{tr(COPY.correctAudio, lang)}
        </button>
        <button onClick={recording ? stopRecording : startRecording} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-400/20 px-3 py-2.5 text-xs font-medium text-sky-100 active:scale-95">
          {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{tr(recording ? COPY.stop : COPY.record, lang)}
        </button>
      </span>
      {recordingUrl && (
        <span className="mt-2 flex gap-2">
          <button onClick={playRecording} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-xs font-medium text-white/90 active:scale-95">
            <Play className="h-4 w-4" />{tr(COPY.playback, lang)}
          </button>
          <button onClick={startRecording} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-xs font-medium text-white/90 active:scale-95">
            <RotateCcw className="h-4 w-4" />{tr(COPY.tryAgain, lang)}
          </button>
        </span>
      )}
      {result?.status === "unavailable" && <span dir="ltr" className="mt-3 block rounded-xl bg-amber-400/10 px-3 py-2 text-center text-xs leading-relaxed text-amber-100">{AI_REQUIRED}</span>}
      {error && <span className="mt-3 block text-center text-xs text-red-200">{tr(COPY.micError, lang)}</span>}
    </span>
  );
}