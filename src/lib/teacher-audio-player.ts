export type TeacherPosition = { surah: number; ayah: number };

type PlayerOptions = {
  source: (position: TeacherPosition) => string;
  next: (position: TeacherPosition) => TeacherPosition | null;
  select: (position: TeacherPosition) => void;
  listening: (value: boolean) => void;
  progress: (value: number) => void;
  duration: (value: number) => void;
  error: (value: boolean) => void;
};

// A single audio element owns the sequence. Selection updates never create a
// second player, and obsolete play promises cannot affect a newer request.
export class TeacherAudioPlayer {
  position: TeacherPosition | null = null;
  private playing = false;
  private generation = 0;
  private disposed = false;

  constructor(readonly audio: HTMLAudioElement, private options: PlayerOptions) {
    audio.onloadedmetadata = () => options.duration(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.ontimeupdate = () => options.progress(audio.currentTime);
    audio.onerror = () => this.fail();
    audio.onended = () => {
      // ended is distinct from pause; ignore stale/duplicate events after src changes.
      if (!this.playing || !audio.ended || !this.position || this.disposed) return;
      this.playing = false;
      const next = options.next(this.position);
      if (!next) {
        options.listening(false);
        options.progress(Number.isFinite(audio.duration) ? audio.duration : 0);
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
    this.audio.pause();
    this.position = position;
    if (!same) {
      this.audio.src = this.options.source(position);
      this.options.duration(0);
    }
    if (!same || replay || this.audio.ended) this.audio.currentTime = 0;
    this.options.progress(this.audio.currentTime);
    this.options.error(false);
    this.playing = true;
    this.options.listening(true);
    this.audio.play().catch(() => {
      if (generation === this.generation && !this.disposed) this.fail();
    });
  }

  pause() {
    ++this.generation;
    this.playing = false;
    this.audio.pause();
    this.options.listening(false);
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
  continuous: boolean,
): TeacherPosition | null {
  const surah = surahs.find((s) => s.number === position.surah);
  if (!surah) return null;
  if (position.ayah < surah.numberOfAyahs) return { surah: position.surah, ayah: position.ayah + 1 };
  if (!continuous) return null;
  const next = surahs.find((s) => s.number === position.surah + 1);
  return next ? { surah: next.number, ayah: 1 } : null;
}