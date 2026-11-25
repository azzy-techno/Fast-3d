import { effect } from "@preact/signals";
import { arrived, finale, lang, liftPanel, liftPhase, mode, scene, sound, station } from "./state";

/**
 * The guide's voice. He speaks at the thresholds of the visit and stays quiet in between:
 *
 *   reception desk   one welcome, the only one in the whole visit
 *   lift selector    a short prompt, worded differently each time
 *   a floor          one line the first time the doors open on it, nothing on later visits
 *   leaving the roof the goodbye, timed to the closing title rather than to lift-off
 *
 * Direction for the read (and for a recorded voice-over, should one replace the browser voice):
 * warm and unhurried, a colleague showing a visitor round rather than an announcer. Short sentences,
 * a smile in the voice, no sales pitch. He never talks over himself: a line that belongs to a place
 * the visitor has left is dropped, not finished.
 *
 * It uses the browser's own speech voices, so nothing is downloaded, and only while sound is on.
 */
type L = { en: string; ar: string };
const LINES: Record<string, L> = {
  reception: {
    en: "Welcome to FAST. I'm your guide today. Whenever you're ready, the lifts are just ahead.",
    ar: "أهلاً بك في فاست. أنا مرشدك اليوم. متى ما كنت جاهزاً، المصاعد أمامك.",
  },
  lift0: { en: "Where would you like to start? Pick any floor, and I'll take you there.", ar: "من أين تحب أن نبدأ؟ اختر أي طابق وسآخذك إليه." },
  lift1: { en: "Where to next?", ar: "إلى أين الآن؟" },
  lift2: { en: "Which floor shall we see next?", ar: "أي طابق نزور بعد ذلك؟" },
  lift3: { en: "Take your pick. I'll meet you there.", ar: "اختر ما تشاء، وسألقاك هناك." },
  about: { en: "Level one. This is who we are, and who trusts us with their work.", ar: "الطابق الأول. هنا تتعرّف علينا وعلى من يثق بأعمالنا." },
  electrical: {
    en: "Here's our electrical floor. Switchgear, transformers and cabling, installed and tested by our own team.",
    ar: "هذا طابق الأعمال الكهربائية. لوحات ومحولات وكابلات يركّبها فريقنا ويختبرها.",
  },
  mechanical: {
    en: "This floor is mechanical. Pumps, piping and heavy equipment, set in place and aligned.",
    ar: "هذا طابق الأعمال الميكانيكية. مضخات وأنابيب ومعدات ثقيلة نركّبها ونضبطها بدقة.",
  },
  fabrication: { en: "Our fabrication shop. This is where steel is cut, welded and finished to drawing.", ar: "ورشة التصنيع. هنا يُقطع الفولاذ ويُلحم ويُجهّز وفق المخططات." },
  civil: {
    en: "Civil works. Everything a plant stands on starts here: foundations, concrete and structures.",
    ar: "الأعمال المدنية. كل ما تقوم عليه المنشأة يبدأ من هنا: الأساسات والخرسانة والهياكل.",
  },
  fire: {
    en: "Fire protection. Detection, sprinklers and pumps, there to keep people and plant safe.",
    ar: "الحماية من الحريق. أنظمة إنذار ورشاشات ومضخات تحمي الأرواح والمنشآت.",
  },
  ict: {
    en: "Industrial I C T. The networks, cameras and control links that keep a site connected.",
    ar: "تقنية المعلومات والاتصالات الصناعية. شبكات وكاميرات وأنظمة تحكم تُبقي الموقع متصلاً.",
  },
  digital: { en: "Digital manufacturing. This is where the shop floor meets its data.", ar: "التصنيع الرقمي. هنا تلتقي أرض المصنع ببياناتها." },
  roof: {
    en: "And here's the rooftop. Let me open up a cooling tower and show you what's inside.",
    ar: "وهذا هو السطح. دعني أفتح لك برج تبريد لترى ما بداخله.",
  },
  farewell: {
    en: "That's FAST, from the street to the rooftop. Thank you for your time. We'd be glad to hear about your next project.",
    ar: "هذه هي فاست، من الشارع إلى السطح. شكراً لوقتك، ويسعدنا أن نسمع عن مشروعك القادم.",
  },
};

/** Pauses before he speaks, in milliseconds. */
const AFTER_DOORS = 900; // the lift doors are opening on a floor
const AT_DESK = 500; // the camera has come to rest at the reception desk
const AT_SELECTOR = 500; // the floor selector has appeared
const FAREWELL = 6800; // the drone shot has pulled clear and the closing title is on screen

const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
const heard = new Set<string>(); // places already introduced in this visit
let timers: number[] = [];
let liftPrompts = 0;
let prevPanel = false;
let prevFinale = "none";

/** Natural-sounding voices first, then a man's voice, since the guide is a young man. */
function pickVoice(l: "en" | "ar") {
  const pool = (synth?.getVoices() ?? []).filter((v) => v.lang.toLowerCase().startsWith(l));
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online/i.test(v.name) ? 8 : 0) +
    (/google/i.test(v.name) ? 5 : 0) +
    (/\bmale\b|ryan|guy|thomas|christopher|eric|andrew|brian|william|george|daniel|james|hamed|shakir|naayf|maged|tarik/i.test(v.name) && !/female/i.test(v.name) ? 3 : 0) +
    (/en-gb|ar-sa/i.test(v.lang) ? 1 : 0);
  return pool.sort((a, b) => score(b) - score(a))[0] ?? null;
}

function speak(key: string) {
  if (!synth || !LINES[key] || !sound.peek()) return;
  const l = lang.peek();
  const voice = pickVoice(l);
  if (l === "ar" && !voice) return; // no Arabic voice on this device: stay silent rather than mispronounce
  const u = new SpeechSynthesisUtterance(LINES[key][l]);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? (l === "ar" ? "ar-SA" : "en-GB");
  u.rate = 0.94;
  u.pitch = 1.04;
  synth.speak(u);
}

/** Drop whatever he was saying or about to say. */
function hush() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
  synth?.cancel();
}

/** A line for a new place replaces anything still being said; `after` lets a short prompt wait its turn. */
function cue(key: string, delay: number, after = false) {
  if (!after) hush();
  timers.push(window.setTimeout(() => speak(key), delay));
}

export function initVoice() {
  if (!synth) return;
  synth.getVoices(); // some browsers only fill the list after the first request
  effect(() => {
    const on = sound.value && mode.value === "tour";
    const sc = scene.value;
    const phase = liftPhase.value;
    const st = station.value;
    const panel = liftPanel.value;
    const fin = finale.value;
    const here = arrived.value;
    const panelOpened = panel && !prevPanel;
    const panelClosed = !panel && prevPanel;
    const fareStarted = fin === "farewell" && prevFinale !== "farewell";
    const fareEnded = fin !== "farewell" && prevFinale === "farewell";
    prevPanel = panel;
    prevFinale = fin;
    if (!on) {
      hush();
      return;
    }
    // the goodbye belongs to the end of the pull-out, not to the moment the camera leaves the roof
    if (fin === "farewell") {
      if (fareStarted) cue("farewell", FAREWELL);
      return;
    }
    if (fareEnded) hush();
    // the lift: a prompt when the selector appears; once a floor is chosen he stops talking
    if (panelOpened) cue("lift" + (liftPrompts === 0 ? 0 : 1 + ((liftPrompts - 1) % 3)), AT_SELECTOR, true);
    if (panelOpened) liftPrompts++;
    if (panelClosed || (phase !== "idle" && phase !== "opening")) hush();
    if (panel || (phase !== "idle" && phase !== "opening")) return;
    // reception: the one welcome, at the desk
    if (sc === "arrival") {
      if (st === 2 && here && phase === "idle" && !heard.has("reception")) {
        heard.add("reception");
        cue("reception", AT_DESK);
      }
      return;
    }
    // a floor is introduced once, as its doors open
    if (!heard.has(sc)) {
      heard.add(sc);
      cue(sc, AFTER_DOORS);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hush();
  });
}
