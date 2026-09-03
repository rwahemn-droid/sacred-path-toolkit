import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  RefreshCw,
  RotateCcw,
  Shuffle,
  X,
  Loader2,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { ARABIC_FONT_CSS } from "@/lib/settings";

/* ---------------- i18n (local, 5 languages) ---------------- */

type Keys =
  | "title" | "changeVerse" | "changeAll" | "flip" | "capture" | "close"
  | "permission" | "loadingCam" | "loadingFace" | "camError" | "retry"
  | "noFace" | "privacy";

const T: Record<Lang, Record<Keys, string>> = {
  ku: {
    title: "فلتەری موسڵمان",
    changeVerse: "گۆڕینی ئایەت",
    changeAll: "گۆڕینی هەموو",
    flip: "گۆڕینی کامێرا",
    capture: "وێنەگرتن",
    close: "داخستن",
    permission: "ڕێگەپێدانی کامێرا پێویستە",
    loadingCam: "کامێرا دەکرێتەوە…",
    loadingFace: "ناسینەوەی ڕوخسار بار دەبێت…",
    camError: "نەتوانرا کامێرا بکرێتەوە",
    retry: "دووبارە هەوڵبدە",
    noFace: "ڕوخسارێک نەدۆزرایەوە",
    privacy: "پرۆسێسی ڕوخسار تەنها لە ئامێرەکەتدا ئەنجام دەدرێت",
  },
  bad: {
    title: "فلتەرێ موسڵمان",
    changeVerse: "گوهۆڕینا ئایەتێ",
    changeAll: "گوهۆڕینا هەمییان",
    flip: "گوهۆڕینا کامێرایێ",
    capture: "وێنەگرتن",
    close: "داخستن",
    permission: "دەستویا کامێرایێ پێدڤی یە",
    loadingCam: "کامێرا ڤەدبیت…",
    loadingFace: "ناسینا ڕویان بار دبیت…",
    camError: "کامێرا نەهاتە ڤەکرن",
    retry: "دیسا بجەڕبینە",
    noFace: "چ ڕوو نەهاتە دیتن",
    privacy: "کارێ ناسینا ڕویان تنێ د ئامێرێ تە دا دهێتە کرن",
  },
  kmr: {
    title: "Fîltera Misilman",
    changeVerse: "Ayetê biguhere",
    changeAll: "Hemûyan biguhere",
    flip: "Kamerayê biguhere",
    capture: "Wêne bigire",
    close: "Bigire",
    permission: "Destûra kamerayê pêwîst e",
    loadingCam: "Kamera tê vekirin…",
    loadingFace: "Naskirina rûyan tê barkirin…",
    camError: "Kamera venebû",
    retry: "Dîsa biceribîne",
    noFace: "Tu rû nehat dîtin",
    privacy: "Naskirina rûyan tenê li ser cîhaza te dimîne",
  },
  ar: {
    title: "فلتر المسلم",
    changeVerse: "تغيير الآية",
    changeAll: "تغيير الكل",
    flip: "تبديل الكاميرا",
    capture: "التقاط صورة",
    close: "إغلاق",
    permission: "مطلوب إذن الكاميرا",
    loadingCam: "جارٍ فتح الكاميرا…",
    loadingFace: "جارٍ تحميل كشف الوجوه…",
    camError: "تعذّر فتح الكاميرا",
    retry: "أعد المحاولة",
    noFace: "لم يتم العثور على وجه",
    privacy: "معالجة الوجه تتم داخل جهازك فقط",
  },
  en: {
    title: "Muslim Filter",
    changeVerse: "Change Verse",
    changeAll: "Change All",
    flip: "Flip Camera",
    capture: "Capture Photo",
    close: "Close",
    permission: "Camera permission required",
    loadingCam: "Opening camera…",
    loadingFace: "Loading face detection…",
    camError: "Could not start the camera",
    retry: "Try Again",
    noFace: "No face detected",
    privacy: "Face processing stays on your device",
  },
};

/* ---------------- Quran verses (full Quran via existing API) ---------------- */

const TOTAL_AYAHS = 6236;

type Verse = { text: string; surah: string; ayah: number; n: number };

const cache = new Map<number, Verse>();
let recent: number[] = [];

function pickIndex() {
  for (let i = 0; i < 12; i++) {
    const n = 1 + Math.floor(Math.random() * TOTAL_AYAHS);
    if (!recent.includes(n)) return n;
  }
  return 1 + Math.floor(Math.random() * TOTAL_AYAHS);
}

async function randomVerse(): Promise<Verse | null> {
  const n = pickIndex();
  recent = [n, ...recent].slice(0, 25);
  if (cache.has(n)) return cache.get(n)!;
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${n}/quran-uthmani`);
    if (!res.ok) return null;
    const d = (await res.json()).data;
    const v: Verse = {
      text: String(d.text ?? "").trim(),
      surah: String(d.surah?.name ?? "").replace(/^سُورَةُ\s*/, ""),
      ayah: Number(d.numberInSurah),
      n,
    };
    if (!v.text) return null;
    cache.set(n, v);
    return v;
  } catch {
    return null;
  }
}

/* ---------------- Face detection ---------------- */

type Box = { x: number; y: number; w: number; h: number };
type Detector = { detect: (v: HTMLVideoElement, ts: number) => Box[]; close: () => void };

async function createDetector(): Promise<Detector> {
  const AnyWin = window as unknown as { FaceDetector?: new (o: unknown) => { detect: (s: unknown) => Promise<{ boundingBox: DOMRectReadOnly }[]> } };
  if (AnyWin.FaceDetector) {
    const native = new AnyWin.FaceDetector({ maxDetectedFaces: 5, fastMode: true });
    let boxes: Box[] = [];
    let busy = false;
    return {
      detect: (v) => {
        if (!busy) {
          busy = true;
          native
            .detect(v)
            .then((r) => {
              boxes = r.map((f) => ({
                x: f.boundingBox.x,
                y: f.boundingBox.y,
                w: f.boundingBox.width,
                h: f.boundingBox.height,
              }));
            })
            .catch(() => { boxes = []; })
            .finally(() => { busy = false; });
        }
        return boxes;
      },
      close: () => {},
    };
  }

  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
  );
  const det = await vision.FaceDetector.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.5,
  });
  return {
    detect: (v, ts) => {
      const r = det.detectForVideo(v, ts);
      return (r.detections ?? []).map((d) => ({
        x: d.boundingBox?.originX ?? 0,
        y: d.boundingBox?.originY ?? 0,
        w: d.boundingBox?.width ?? 0,
        h: d.boundingBox?.height ?? 0,
      }));
    },
    close: () => det.close(),
  };
}

/* ---------------- Tracked faces ---------------- */

type Tracked = Box & { id: number; verse: Verse | null; miss: number; alive: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function MuslimFilter({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = T[lang] ?? T.en;
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const detectorRef = useRef<Detector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tracksRef = useRef<Tracked[]>([]);
  const rafRef = useRef<number>(0);
  const idRef = useRef(1);

  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [phase, setPhase] = useState<"cam" | "face" | "ready" | "error">("cam");
  const [errMsg, setErrMsg] = useState("");
  const [faces, setFaces] = useState<Tracked[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [shot, setShot] = useState<string | null>(null);

  const assignVerse = useCallback((id: number) => {
    randomVerse().then((v) => {
      if (!v) return;
      const tr = tracksRef.current.find((f) => f.id === id);
      if (tr) {
        tr.verse = v;
        setFaces([...tracksRef.current]);
      }
    });
  }, []);

  /* start camera + detector */
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      setPhase("cam");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((s) => s.stop()); return; }
        streamRef.current = stream;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play().catch(() => {});
        setPhase("face");
        if (!detectorRef.current) detectorRef.current = await createDetector();
        if (cancelled) return;
        setPhase("ready");
        loop();
      } catch (e) {
        if (cancelled) return;
        setErrMsg(e instanceof Error ? e.message : "");
        setPhase("error");
      }
    };

    const loop = () => {
      const v = videoRef.current;
      const det = detectorRef.current;
      if (!v || !det || v.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      let boxes: Box[] = [];
      try {
        boxes = det.detect(v, performance.now());
      } catch {
        boxes = [];
      }
      const vw = v.videoWidth || 1;
      const vh = v.videoHeight || 1;
      const norm = boxes
        .filter((b) => b.w > 8 && b.h > 8)
        .map((b) => ({ x: b.x / vw, y: b.y / vh, w: b.w / vw, h: b.h / vh }))
        .slice(0, 5);

      const cur = tracksRef.current;
      const used = new Set<number>();
      norm.forEach((b) => {
        let best: Tracked | null = null;
        let bestD = 0.18;
        for (const tr of cur) {
          if (used.has(tr.id)) continue;
          const d = Math.hypot(tr.x + tr.w / 2 - (b.x + b.w / 2), tr.y + tr.h / 2 - (b.y + b.h / 2));
          if (d < bestD) { bestD = d; best = tr; }
        }
        if (best) {
          used.add(best.id);
          best.x = lerp(best.x, b.x, 0.35);
          best.y = lerp(best.y, b.y, 0.35);
          best.w = lerp(best.w, b.w, 0.35);
          best.h = lerp(best.h, b.h, 0.35);
          best.miss = 0;
          best.alive = Math.min(1, best.alive + 0.12);
        } else {
          const id = idRef.current++;
          const nt: Tracked = { ...b, id, verse: null, miss: 0, alive: 0 };
          cur.push(nt);
          used.add(id);
          assignVerse(id);
        }
      });
      for (const tr of cur) {
        if (!used.has(tr.id)) {
          tr.miss++;
          tr.alive = Math.max(0, tr.alive - 0.1);
        }
      }
      tracksRef.current = cur.filter((tr) => tr.miss < 30);
      setFaces([...tracksRef.current]);
      rafRef.current = requestAnimationFrame(loop);
    };

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((s) => s.stop());
      streamRef.current = null;
      tracksRef.current = [];
    };
  }, [facing, attempt, assignVerse]);

  /* release detector on unmount */
  useEffect(() => () => {
    detectorRef.current?.close();
    detectorRef.current = null;
  }, []);

  const changeAll = () => tracksRef.current.forEach((f) => assignVerse(f.id));

  const capture = () => {
    const v = videoRef.current;
    const wrap = wrapRef.current;
    if (!v || !wrap) return;
    const W = v.videoWidth || 720;
    const H = v.videoHeight || 1280;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.save();
    if (facing === "user") { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0, W, H);
    ctx.restore();

    ctx.direction = "rtl";
    ctx.textAlign = "center";
    for (const f of tracksRef.current) {
      if (!f.verse || f.alive < 0.3) continue;
      const cx = (facing === "user" ? 1 - (f.x + f.w / 2) : f.x + f.w / 2) * W;
      const cardW = Math.min(W * 0.8, 620);
      const size = Math.max(20, Math.round(W * 0.033));
      ctx.font = `600 ${size}px ${ARABIC_FONT_CSS}`;
      const text = f.verse.text.length > 90 ? f.verse.text.slice(0, 90) + "…" : f.verse.text;
      const boxH = size * 3.2;
      const top = Math.max(8, f.y * H - boxH - 14);
      const left = Math.max(8, Math.min(W - cardW - 8, cx - cardW / 2));
      ctx.fillStyle = "rgba(10,25,41,0.62)";
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      const r = 22;
      ctx.beginPath();
      ctx.roundRect(left, top, cardW, boxH, r);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillText(text, left + cardW / 2, top + size * 1.5, cardW - 30);
      ctx.font = `500 ${Math.round(size * 0.62)}px system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(`${f.verse.surah} • ${f.verse.ayah}`, left + cardW / 2, top + size * 2.6, cardW - 30);
    }
    setShot(c.toDataURL("image/png"));
  };

  const loading = phase === "cam" || phase === "face";

  return (
    <div className="fixed inset-0 z-[60] h-dvh bg-black" dir="ltr">
      <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
        />

        {/* verse cards */}
        {phase === "ready" &&
          faces.map((f) => {
            if (!f.verse) return null;
            const cx = (facing === "user" ? 1 - (f.x + f.w / 2) : f.x + f.w / 2) * 100;
            const top = Math.max(6, f.y * 100 - 2);
            return (
              <div
                key={f.id}
                className="pointer-events-none absolute w-[70vw] max-w-[320px] -translate-x-1/2 -translate-y-full rounded-2xl border p-3 text-center backdrop-blur-xl transition-opacity duration-300"
                style={{
                  left: `${cx}%`,
                  top: `${top}%`,
                  opacity: f.alive,
                  background: "rgba(10,25,41,0.45)",
                  borderColor: "rgba(255,255,255,0.22)",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.6)",
                }}
                dir="rtl"
              >
                <p
                  className="text-[15px] leading-[1.9] text-white line-clamp-3"
                  style={{ fontFamily: ARABIC_FONT_CSS }}
                >
                  {f.verse.text}
                </p>
                <p className="mt-1 text-[11px] text-white/75">
                  {f.verse.surah} • {f.verse.ayah}
                </p>
              </div>
            );
          })}

        {/* header */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md"
            aria-label={t.close}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
            {t.title}
          </div>
          <button
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* states */}
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">{phase === "cam" ? t.loadingCam : t.loadingFace}</p>
              <p className="text-xs text-white/60">{t.permission}</p>
            </div>
          </div>
        )}
        {phase === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-black/75 p-6 text-center text-white">
            <div className="space-y-3">
              <p className="font-semibold">{t.camError}</p>
              {errMsg && <p className="text-xs text-white/60">{errMsg}</p>}
              <button
                onClick={() => setAttempt((a) => a + 1)}
                className="mx-auto flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm"
              >
                <RotateCcw className="h-4 w-4" /> {t.retry}
              </button>
            </div>
          </div>
        )}
        {phase === "ready" && faces.length === 0 && (
          <div className="absolute inset-x-0 top-1/2 text-center text-sm text-white/70">{t.noFace}</div>
        )}

        {/* controls */}
        <div className="absolute inset-x-0 bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="mb-2 text-center text-[10px] text-white/50">{t.privacy}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Ctl icon={Shuffle} label={t.changeVerse} onClick={() => {
              const f = tracksRef.current[0];
              if (f) assignVerse(f.id);
            }} />
            {faces.length > 1 && <Ctl icon={RefreshCw} label={t.changeAll} onClick={changeAll} />}
            <Ctl icon={RotateCcw} label={t.flip} onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} />
            <Ctl icon={Camera} label={t.capture} onClick={capture} primary />
          </div>
        </div>

        {/* captured photo */}
        {shot && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-black/85 p-4">
            <div className="w-full max-w-sm space-y-3">
              <img src={shot} alt={t.capture} className="w-full rounded-2xl border border-white/20" />
              <div className="flex justify-center gap-2">
                <a
                  href={shot}
                  download="muslim-filter.png"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  {t.capture}
                </a>
                <button
                  onClick={() => setShot(null)}
                  className="rounded-full border border-white/25 px-5 py-2 text-sm text-white"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Ctl({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-md transition active:scale-95 ${
        primary
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-white/20 bg-black/40 text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
