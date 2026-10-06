export type TajweedPracticeRule = "madd" | "ghunnah";

export type TajweedPracticeInput = {
  rule: TajweedPracticeRule;
  segmentText: string;
  /** Expected length in harakat (counts) for this exact highlighted rule. */
  counts: { min: number; max: number };
  recording: Blob;
  recordingDurationMs: number;
};

export type TajweedVerdict = "short" | "good" | "long";

export type TajweedTimingResult =
  | { status: "measured"; durationMs: number; expected: { minMs: number; maxMs: number }; verdict: TajweedVerdict }
  | { status: "unreliable" };

export interface TajweedAudioAnalyzer {
  analyze(input: TajweedPracticeInput): Promise<TajweedTimingResult>;
}

/** Practice pace: one haraka is 400–600 ms at a moderate (tadweer) reading speed. */
const HARAKA_MIN_MS = 400;
const HARAKA_MAX_MS = 600;
export function expectedRange(counts: { min: number; max: number }) {
  return { minMs: counts.min * HARAKA_MIN_MS, maxMs: counts.max * HARAKA_MAX_MS };
}

/** Expected counts per alquran.cloud tajweed code. */
export function countsFor(rule: TajweedPracticeRule, code?: string) {
  if (rule === "ghunnah") return { min: 2, max: 2 };
  switch (code) {
    case "p": return { min: 2, max: 6 }; // madd ja'iz (permissible)
    case "o": return { min: 4, max: 5 }; // madd wajib (obligatory)
    case "m": return { min: 6, max: 6 }; // madd lazim (necessary)
    default: return { min: 2, max: 2 }; // madd tabi'i (natural)
  }
}

const FRAME_MS = 10;

type Frame = { db: number; lowRatio: number; zcr: number };

function frames(samples: Float32Array, rate: number): Frame[] {
  const size = Math.round((rate * FRAME_MS) / 1000);
  const out: Frame[] = [];
  // one-pole low-pass (~400 Hz) to estimate low-band share of energy (nasal murmur cue)
  const a = Math.exp((-2 * Math.PI * 400) / rate);
  let lp = 0;
  for (let i = 0; i + size <= samples.length; i += size) {
    let e = 0, eLow = 0, zc = 0;
    for (let j = i; j < i + size; j++) {
      const s = samples[j];
      lp = (1 - a) * s + a * lp;
      e += s * s;
      eLow += lp * lp;
      if (j > i && (s >= 0) !== (samples[j - 1] >= 0)) zc++;
    }
    out.push({ db: 10 * Math.log10(e / size + 1e-12), lowRatio: e ? eLow / e : 0, zcr: zc / size });
  }
  return out;
}

function longestRun(mask: boolean[], gapFrames: number) {
  let best = { start: 0, len: 0 }, start = -1, gap = 0;
  for (let i = 0; i <= mask.length; i++) {
    if (i < mask.length && mask[i]) {
      if (start < 0) start = i;
      gap = 0;
    } else if (start >= 0) {
      gap++;
      if (gap > gapFrames || i === mask.length) {
        const len = i - gap + 1 - start;
        if (len > best.len) best = { start, len };
        start = -1;
        gap = 0;
      }
    }
  }
  return best;
}

/**
 * Measures the longest sustained voiced (Madd) or nasal-murmur (Ghunnah) segment
 * in a short isolated attempt using signal energy, zero-crossing rate and low-band
 * energy share. Returns "unreliable" whenever the signal is too quiet, noisy,
 * clipped, or has no clearly dominant sustained segment — it never guesses.
 */
export const browserTajweedAnalyzer: TajweedAudioAnalyzer = {
  async analyze(input) {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const buf = await ctx.decodeAudioData(await input.recording.arrayBuffer());
      ctx.close().catch(() => undefined);
      const data = buf.getChannelData(0);
      const fr = frames(data, buf.sampleRate);
      if (fr.length < 30) return { status: "unreliable" };

      const sorted = fr.map((f) => f.db).sort((x, y) => x - y);
      const noise = sorted[Math.floor(sorted.length * 0.1)];
      const peak = sorted[Math.floor(sorted.length * 0.98)];
      if (peak - noise < 15 || peak < -50) return { status: "unreliable" };
      let clipped = 0;
      for (let i = 0; i < data.length; i++) if (Math.abs(data[i]) > 0.99) clipped++;
      if (clipped / data.length > 0.01) return { status: "unreliable" };

      const thr = Math.max(noise + 10, peak - 25);
      // voiced = loud and periodic-ish (low zero-crossing rate rules out hiss/fricatives)
      const voiced = fr.map((f) => f.db > thr && f.zcr < 0.15);
      const mask = input.rule === "ghunnah" ? fr.map((f, i) => voiced[i] && f.lowRatio > 0.8) : voiced;
      const run = longestRun(mask, 5);
      const durationMs = run.len * FRAME_MS;
      if (durationMs < 150) return { status: "unreliable" };

      // the measured segment must clearly dominate: no rival run of similar length
      const rest = mask.slice();
      for (let i = run.start; i < run.start + run.len; i++) rest[i] = false;
      if (longestRun(rest, 5).len * FRAME_MS > durationMs * 0.7) return { status: "unreliable" };

      const expected = expectedRange(input.counts);
      const verdict: TajweedVerdict = durationMs < expected.minMs ? "short" : durationMs > expected.maxMs ? "long" : "good";
      return { status: "measured", durationMs, expected, verdict };
    } catch {
      return { status: "unreliable" };
    }
  },
};
