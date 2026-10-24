import { Howl } from "howler";
import { assetUrl } from "./assets";
export const soundNames = [
  "cooling",
  "electrical",
  "mechanical",
  "fabrication",
  "civil",
  "fire",
  "it",
  "manufacturing",
  "industry",
  "iiot",
  "vision",
] as const;
export function soundForProgress(p: number): string | null {
  if (p >= 0.7 && p < 1.23) return soundNames[0];
  const chapter = Math.round(p);
  if (
    chapter >= 2 &&
    chapter <= 11 &&
    p >= chapter - 0.08 &&
    p < chapter + 0.35
  )
    return soundNames[chapter - 1];
  return null;
}
/** At most one incoming and one fading voice; queued loads never outlive selection. */
export class ServiceSound {
  private current: Howl | null = null;
  private fading: Howl | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private key: string | null = null;
  private enabled = false;
  setEnabled(value: boolean) {
    this.enabled = value;
    if (!value) this.stop();
  }
  update(progress: number) {
    const key =
      this.enabled && !document.hidden ? soundForProgress(progress) : null;
    if (key === this.key) return;
    this.key = key;
    clearTimeout(this.timer);
    this.fading?.unload();
    this.fading = null;
    if (this.current) {
      const old = this.current;
      this.current = null;
      if (old.playing()) {
        old.fade(old.volume(), 0, 450);
        this.fading = old;
        this.timer = setTimeout(() => {
          old.unload();
          if (this.fading === old) this.fading = null;
        }, 480);
      } else old.unload();
    }
    document.documentElement.dataset.soundscape = key || "silent";
    if (!key) return;
    const voice = new Howl({
      src: [assetUrl(`audio/${key}.ogg`)],
      loop: true,
      volume: 0,
      preload: false,
      onload: () => {
        if (
          this.enabled &&
          this.current === voice &&
          this.key === key &&
          !document.hidden
        ) {
          voice.play();
          voice.fade(0, 0.3, 650);
        }
      },
      onloaderror: () => {
        if (this.current === voice) {
          document.documentElement.dataset.soundscape = "unavailable";
        }
      },
    });
    this.current = voice;
    voice.load();
  }
  stop() {
    clearTimeout(this.timer);
    this.current?.unload();
    this.fading?.unload();
    this.current = null;
    this.fading = null;
    this.key = null;
    document.documentElement.dataset.soundscape = "silent";
  }
  dispose() {
    this.enabled = false;
    this.stop();
  }
}
