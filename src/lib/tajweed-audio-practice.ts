export type TajweedPracticeRule = "madd" | "ghunnah";

export type TajweedPracticeInput = {
  rule: TajweedPracticeRule;
  segmentText: string;
  recording: Blob;
  recordingDurationMs: number;
};

export type TajweedTimingResult =
  | { status: "measured"; durationMs: number; confidence: number }
  | { status: "unavailable"; reason: "audio-ai-required" };

export interface TajweedAudioAnalyzer {
  analyze(input: TajweedPracticeInput): Promise<TajweedTimingResult>;
}

/**
 * Standard browser audio APIs cannot reliably isolate a selected Madd vowel or
 * nasal Ghunnah from a full spoken attempt. This adapter deliberately returns
 * no score until a purpose-built Tajweed audio model is connected.
 */
export const browserTajweedAnalyzer: TajweedAudioAnalyzer = {
  async analyze(_input) {
    return { status: "unavailable", reason: "audio-ai-required" };
  },
};