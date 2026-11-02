export type TeacherPosition = { surah: number; ayah: number };

type PlayerOptions = {
  source: (position: TeacherPosition) => string;
  next: (position: TeacherPosition) => TeacherPosition | null;
  select: (position: TeacherPosition) => void;
  listening: (value: boolean) => void;
  progress: (value: number) => void;
  duration: (value: number) => void;
  error: (value: boolean) => void;
  complete: (value: boolean) => void;
  preload?: (source: string, signal: AbortSignal) => Promise<void>;
};

// A single audio element owns the sequence. Selection updates never create a
// second player, and obsolete play promises cannot affect a newer request.
export class TeacherAudioPlayer {
  position: TeacherPosition | null = null;
  private playing = false;
  private generation = 0;
  private disposed = false;
  private preloadRequest: AbortController | null = null;

  constructor(readonly audio: HTMLAudioElement, private options: PlayerOptions) {
    audio.onloadedmetadata = () => options.duration(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.ontimeupdate = () => options.progress(audio.currentTime);
    audio.onerror = () => { if (this.playing && audio.error) this.fail(); };
    audio.onended = () => {
      // ended is distinct from pause; ignore stale/duplicate events after src changes.
      if (!this.playing || !audio.ended || !this.position || this.disposed) return;
      this.playing = false;
      const next = options.next(this.position);
      if (!next) {
        this.cancelPreload();
        options.listening(false);
        options.progress(Number.isFinite(audio.duration) ? audio.duration : 0);
        options.complete(true);
        return;
      }
      this.start(next);
      options.select(next);
    };
  }

  matches(position: TeacherPosition) {
    return this.position?.surah === position.surah && this.position.ayah === position.ayah;
  }

  start(position: TeacherPosition, replay = false) {
    if (this.disposed) return;
    const same = this.matches(position);
    if (same && this.playing && !replay) return;
    const generation = ++this.generation;
    this.cancelPreload();
    this.playing = false;
    this.audio.pause();
    this.position = position;
    // A failed resource must be loaded again on an explicit retry, even when
    // the selected ayah has not changed. Never retry automatically on error.
    if (!same || this.audio.error) {
      this.audio.src = this.options.source(position);
      this.options.duration(0);
      this.audio.load();
    }
    if (!same || replay || this.audio.ended) this.audio.currentTime = 0;
    this.options.progress(this.audio.currentTime);
    this.options.error(false);
    this.options.complete(false);
    this.playing = true;
    this.options.listening(true);
    this.audio.play().catch(() => {
      if (generation === this.generation && !this.disposed) this.fail();
    });
    // Warm the next resource without another audio element or any delay in
    // ended handling. Failure here never skips an ayah or starts a retry loop.
    const next = this.options.next(position);
    if (next && this.options.preload) {
      const request = new AbortController();
      this.preloadRequest = request;
      this.options.preload(this.options.source(next), request.signal).catch(() => {});
    }
  }

  pause() {
    ++this.generation;
    this.playing = false;
    this.cancelPreload();
    this.audio.pause();
    this.options.listening(false);
  }

  stop() {
    this.pause();
    this.position = null;
    this.audio.removeAttribute("src");
    this.audio.load(); // abort pending media loads/play promises
    this.options.progress(0);
    this.options.duration(0);
    this.options.error(false);
    this.options.complete(false);
  }

  private cancelPreload() {
    this.preloadRequest?.abort();
    this.preloadRequest = null;
  }

  private fail() {
    if (this.disposed) return;
    this.pause();
    this.options.error(true);
  }

  dispose() {
    this.pause();
    this.disposed = true;
    this.audio.onended = null;
    this.audio.onerror = null;
    this.audio.onloadedmetadata = null;
    this.audio.ontimeupdate = null;
    this.audio.removeAttribute("src");
    this.audio.load();
  }
}

export function nextTeacherAyah(
  position: TeacherPosition,
  surahs: ReadonlyArray<{ number: number; numberOfAyahs: number }>,
): TeacherPosition | null {
  const surah = surahs.find((s) => s.number === position.surah);
  if (!surah) return null;
  if (position.ayah < surah.numberOfAyahs) return { surah: position.surah, ayah: position.ayah + 1 };
  return null;
}