import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { TeacherAudioPlayer, nextTeacherAyah } from "./teacher-audio-player";

function expect(actual: unknown) {
  return {
    toEqual: (expected: unknown) => assert.deepEqual(actual, expected),
    toBe: (expected: unknown) => assert.equal(actual, expected),
    toBeNull: () => assert.equal(actual, null),
  };
}

class TestAudio {
  src = "";
  currentTime = 0;
  duration = 4;
  ended = false;
  error: object | null = null;
  plays = 0;
  paused = true;
  loads = 0;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onloadedmetadata: (() => void) | null = null;
  ontimeupdate: (() => void) | null = null;
  rejections: Array<() => void> = [];
  play() {
    this.ended = false;
    this.paused = false;
    this.plays++;
    return new Promise<void>((_, reject) => this.rejections.push(() => reject(new Error("load failure"))));
  }
  pause() { this.paused = true; }
  load() { this.loads++; this.error = null; this.ended = false; }
  removeAttribute() { this.src = ""; }
  finish() { this.ended = true; this.onended?.(); }
}

const surahs = [{ number: 1, numberOfAyahs: 7 }, { number: 2, numberOfAyahs: 286 }, { number: 114, numberOfAyahs: 6 }];
function setup() {
  const audio = new TestAudio();
  const selections: Array<{ surah: number; ayah: number }> = [];
  const errors: boolean[] = [];
  const completions: boolean[] = [];
  const preloads: AbortSignal[] = [];
  const player = new TeacherAudioPlayer(audio as unknown as HTMLAudioElement, {
    source: p => `${p.surah}:${p.ayah}`, next: p => nextTeacherAyah(p, surahs),
    select: p => selections.push(p), listening: () => {}, progress: () => {}, duration: () => {}, error: e => errors.push(e),
    complete: c => completions.push(c),
    preload: async (_, signal) => { preloads.push(signal); },
  });
  return { audio, player, selections, errors, completions, preloads };
}

describe("Quran Teacher event-owned navigation", () => {
  test("natural ended selects and plays the correct next ayah exactly once", () => {
    const { audio, player, selections } = setup();
    player.start({ surah: 2, ayah: 19 });
    audio.finish();
    audio.onended?.();
    expect(selections).toEqual([{ surah: 2, ayah: 20 }]);
    expect(audio.src).toBe("2:20");
    expect(audio.plays).toBe(2);
  });
  test("pause cannot advance even if an ended event arrives", () => {
    const { audio, player, selections } = setup();
    player.start({ surah: 1, ayah: 1 });
    player.pause(); audio.finish();
    expect(selections).toEqual([]);
    expect(audio.plays).toBe(1);
  });
  test("surah 1 ayah 7 stops with completion and never starts surah 2", () => {
    const { audio, player, selections, completions } = setup();
    player.start({ surah: 1, ayah: 7 }); audio.finish();
    audio.onended?.();
    expect(selections).toEqual([]);
    expect(audio.plays).toBe(1);
    expect(completions).toEqual([false, true]);
  });
  test("pause and explicit play resume the current ayah at its existing position", () => {
    const { audio, player } = setup();
    player.start({ surah: 1, ayah: 1 }); audio.currentTime = 2;
    player.pause(); expect(audio.paused).toBe(true);
    player.start({ surah: 1, ayah: 1 });
    expect(audio.currentTime).toBe(2); expect(audio.plays).toBe(2);
  });
  test("the last ayah of surah 114 never wraps around", () => {
    expect(nextTeacherAyah({ surah: 114, ayah: 6 }, surahs)).toBeNull();
  });
  test("stop aborts preload and pending playback; only explicit play restarts", async () => {
    const { audio, player, selections, errors, preloads } = setup();
    player.start({ surah: 1, ayah: 1 }); audio.currentTime = 2;
    player.stop();
    expect(audio.paused).toBe(true); expect(audio.src).toBe("");
    expect(preloads[0]?.aborted).toBe(true);
    audio.finish(); audio.rejections[0]?.(); await Promise.resolve();
    expect(selections).toEqual([]); expect(audio.plays).toBe(1);
    expect(errors.at(-1)).toBe(false);
    player.start({ surah: 1, ayah: 1 });
    expect(audio.currentTime).toBe(0); expect(audio.plays).toBe(2);
  });
  test("manual next stays paused until explicit play selects its exact ayah", () => {
    const { audio, player } = setup();
    player.start({ surah: 2, ayah: 19 }); player.pause();
    expect(audio.plays).toBe(1);
    player.start({ surah: 2, ayah: 20 });
    expect(audio.src).toBe("2:20"); expect(audio.plays).toBe(2);
  });
  test("all seven ayahs advance synchronously from ended without delay", () => {
    const { audio, player, selections, completions } = setup();
    player.start({ surah: 1, ayah: 1 });
    for (let ayah = 1; ayah < 7; ayah++) {
      audio.finish();
      expect(audio.src).toBe(`1:${ayah + 1}`);
      expect(audio.plays).toBe(ayah + 1);
    }
    audio.finish();
    expect(selections.length).toBe(6); expect(audio.plays).toBe(7);
    expect(completions.at(-1)).toBe(true);
  });
  test("failed next audio stops without skipping and explicit retry reloads", () => {
    const { audio, player, selections, errors } = setup();
    player.start({ surah: 1, ayah: 1 }); audio.finish();
    audio.error = {}; audio.onerror?.(); audio.finish();
    expect(errors.at(-1)).toBe(true);
    expect(selections).toEqual([{ surah: 1, ayah: 2 }]);
    expect(audio.plays).toBe(2);
    const loads = audio.loads;
    player.start({ surah: 1, ayah: 2 });
    expect(audio.loads).toBe(loads + 1);
    expect(audio.plays).toBe(3);
  });
  test("obsolete play rejection cannot cancel the newer track", async () => {
    const { audio, player, errors } = setup();
    player.start({ surah: 1, ayah: 1 });
    player.start({ surah: 1, ayah: 2 });
    audio.rejections[0]?.(); await Promise.resolve();
    expect(errors.at(-1)).toBe(false);
    audio.finish(); expect(player.position).toEqual({ surah: 1, ayah: 3 });
  });
  test("play is deduplicated, replay restarts, and disposal removes handlers", () => {
    const { audio, player } = setup();
    player.start({ surah: 1, ayah: 1 }); player.start({ surah: 1, ayah: 1 });
    expect(audio.plays).toBe(1);
    audio.currentTime = 2; player.start({ surah: 1, ayah: 1 }, true);
    expect(audio.currentTime).toBe(0); expect(audio.plays).toBe(2);
    player.dispose(); expect(audio.onended).toBeNull(); expect(audio.onerror).toBeNull();
  });
});