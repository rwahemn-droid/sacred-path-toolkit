/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { TeacherAudioPlayer, nextTeacherAyah } from "./teacher-audio-player";

class TestAudio {
  src = "";
  currentTime = 0;
  duration = 4;
  ended = false;
  error: object | null = null;
  plays = 0;
  loads = 0;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onloadedmetadata: (() => void) | null = null;
  ontimeupdate: (() => void) | null = null;
  rejections: Array<() => void> = [];
  play() {
    this.ended = false;
    this.plays++;
    return new Promise<void>((_, reject) => this.rejections.push(() => reject(new Error("load failure"))));
  }
  pause() {}
  load() { this.loads++; this.error = null; this.ended = false; }
  removeAttribute() { this.src = ""; }
  finish() { this.ended = true; this.onended?.(); }
}

const surahs = [{ number: 1, numberOfAyahs: 7 }, { number: 2, numberOfAyahs: 286 }, { number: 114, numberOfAyahs: 6 }];
function setup(continuous = true) {
  const audio = new TestAudio();
  const selections: Array<{ surah: number; ayah: number }> = [];
  const errors: boolean[] = [];
  const player = new TeacherAudioPlayer(audio as unknown as HTMLAudioElement, {
    source: p => `${p.surah}:${p.ayah}`, next: p => nextTeacherAyah(p, surahs, continuous),
    select: p => selections.push(p), listening: () => {}, progress: () => {}, duration: () => {}, error: e => errors.push(e),
  });
  return { audio, player, selections, errors };
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
  test("continuous playback rolls surah 1 ayah 7 into surah 2 ayah 1", () => {
    const { audio, player, selections } = setup();
    player.start({ surah: 1, ayah: 7 }); audio.finish();
    expect(selections).toEqual([{ surah: 2, ayah: 1 }]);
  });
  test("disabled continuous playback stops at the surah boundary", () => {
    const { audio, player, selections } = setup(false);
    player.start({ surah: 1, ayah: 7 }); audio.finish();
    expect(selections).toEqual([]);
    expect(audio.plays).toBe(1);
  });
  test("the last ayah of surah 114 never wraps around", () => {
    expect(nextTeacherAyah({ surah: 114, ayah: 6 }, surahs, true)).toBeNull();
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