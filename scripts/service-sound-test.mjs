import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const dir = await mkdtemp(join(tmpdir(), "fast-sound-"));
try {
  const mock = join(dir, "mock.mjs"),
    out = join(dir, "test.mjs");
  await writeFile(
    mock,
    `export const voices=[]; export class Howl {
 constructor(options){this.options=options;this.started=false;this.unloaded=false;this.v=options.volume;voices.push(this)}
 load(){} ready(){this.options.onload?.()} play(){this.started=true} playing(){return this.started&&!this.unloaded}
 fade(a,b){this.v=b} volume(){return this.v} unload(){this.unloaded=true;this.started=false}
 }`,
  );
  await build({
    stdin: {
      contents:
        'export * from "./src/lib/serviceSound.ts"; export {voices} from "howler";',
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: out,
    alias: { howler: mock },
    define: { "import.meta.env.BASE_URL": '"/Fast-3d/"' },
  });
  globalThis.document = { hidden: false, documentElement: { dataset: {} } };
  const { ServiceSound, voices, soundForProgress, soundNames } = await import(
    pathToFileURL(out)
  );
  const engine = new ServiceSound();
  engine.update(2);
  assert.equal(voices.length, 0, "No sound before opt-in");
  engine.setEnabled(true);
  engine.update(2);
  const late = voices.at(-1);
  engine.setEnabled(false);
  late.ready();
  assert(!late.playing(), "Late download must not play after mute");
  engine.setEnabled(true);
  engine.update(2);
  const incoming = voices.at(-1);
  engine.update(3);
  incoming.ready();
  assert(!incoming.playing(), "Stale service load must not start");
  voices.at(-1).ready();
  assert(voices.at(-1).playing());
  engine.update(4);
  voices.at(-1).ready();
  assert.equal(
    voices.filter((v) => v.playing()).length,
    2,
    "Crossfade allows two voices",
  );
  engine.update(5);
  voices.at(-1).ready();
  assert.equal(
    voices.filter((v) => v.playing()).length,
    2,
    "Rapid changes clean up older fades",
  );
  engine.setEnabled(false);
  assert.equal(
    voices.filter((v) => v.playing()).length,
    0,
    "Mute stops every voice immediately",
  );
  for (let n = 2; n <= 11; n++)
    assert.equal(soundForProgress(n), soundNames[n - 1]);
  assert.equal(soundForProgress(1), "cooling");
  assert.equal(soundForProgress(2.6), "electrical");
  assert.equal(soundForProgress(2.9), null);
  assert.equal(soundForProgress(11.7), null);
  engine.setEnabled(true);
  document.hidden = true;
  engine.update(1);
  assert.equal(
    voices.filter((v) => v.playing()).length,
    0,
    "Hidden tab stays silent",
  );
  engine.dispose();
  assert.equal(document.documentElement.dataset.soundscape, "silent");
  console.log(
    "PASS: opt-in, late loads, rapid crossfades, mute, hidden tab, all 11 sound mappings, silent travel.",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
