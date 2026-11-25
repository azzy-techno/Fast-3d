import { Color, DoubleSide, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Vector3 } from "three";
import { arrivalStops, tr } from "../../i18n";
import { liftPanel, liftPhase, station } from "../../state";
import { loadTexture } from "../assets";
import { patchBaked } from "../materials";
import { loadEnv, makeGlow } from "../sky";
import { TourScene } from "../scene";
import { directoryTexture, logoTexture, nameplateTexture } from "../signs";
import type { Guide } from "../guide";
import { Traffic } from "../traffic";

/** Reception state wall: sign material name -> image. Sources and licences are listed in docs/assets.md. */
const STATE_IMAGES: Record<string, string> = {
  sign_king: "brand/state/king-salman.webp",
  sign_cp: "brand/state/crown-prince.webp",
  sign_flag: "brand/state/flag-ksa.webp",
};

type Slider = { node: Object3D; x0: number; slide: number };

/** Street, plaza, tower exterior and the ground-floor reception: one continuous walk to the lift. */
export class ArrivalScene extends TourScene {
  private doors: Slider[] = [];
  private liftDoors: Slider[] = [];
  private flags: { mesh: Mesh; base: Float32Array; phase: number }[] = [];
  private doorOpen = 0;
  private liftOpen = 0;
  private entrance = new Vector3(0, 1.6, 0);
  private liftFront = new Vector3(-8, 1.6, -13.6);
  private greeted = false;
  private panelArmed = true;
  private traffic: Traffic | null = null;
  fromLift = false;

  protected async build() {
    await Promise.all([
      this.setSky("sunset", { env: 1.45 }),
      this.loadTextures(["asphalt", "paving", "stone", "precast", "wood"]),
      this.loadLightmaps(["lm_arrival", "lm_lobby"]),
      loadEnv(this.engine.renderer, "lobby").then((t) => (this.look.envs.lobby = t)),
    ]);
    // the engineer is always indoors in this scene: soft warm light from above, no sun
    this.guideLook = { ...this.look, env: this.look.envs.lobby, envIntensity: 0.8, sky: { value: new Color(0.95, 0.86, 0.72) }, ground: { value: new Color(0.42, 0.38, 0.33) }, sunCol: { value: new Color(0.12, 0.1, 0.08) }, sunDir: this.look.sunDir };
    this.look.exposure.value = 1.3;
    const { inst } = await this.addModel("models/arrival.glb");
    void this.addCity(0, true).catch(() => {});

    // signs: the real FAST logo, drawn to fit each plate
    const [logo, logoPlate] = await Promise.all([logoTexture("brand/fast-logo-hd.png", 3.357, 0), logoTexture("brand/fast-logo-hd.png", 3.357, 0.085, "#f6f8fa")]);
    inst.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const name = (m.material as MeshBasicMaterial).name;
      if (name === "sign_logo") {
        const onDark = /crown|totem|reception/.test(String(m.userData.group));
        m.material = new MeshBasicMaterial({ map: onDark ? logoPlate : logo, transparent: true, alphaTest: 0.04, toneMapped: false, fog: false });
      } else if (STATE_IMAGES[name]) {
        // the reception's state wall: official portraits and the national flag, shown flat and unmirrored
        void loadTexture(STATE_IMAGES[name], { mips: true, anisotropy: 8 })
          .then((tex) => (m.material = new MeshBasicMaterial({ map: tex, toneMapped: false })))
          .catch(() => (m.visible = false));
      } else if (name === "sign_v2030") {
        void logoTexture("brand/state/vision-2030.webp", 1.5, 0.07, "#ffffff")
          .then((tex) => (m.material = new MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, toneMapped: false })))
          .catch(() => (m.visible = false));
      } else if (name === "sign_cap_king") {
        m.material = new MeshBasicMaterial({
          map: nameplateTexture({ en: "Custodian of the Two Holy Mosques", ar: "خادم الحرمين الشريفين" }, { en: "King Salman bin Abdulaziz Al Saud", ar: "الملك سلمان بن عبدالعزيز آل سعود" }),
          toneMapped: false,
        });
      } else if (name === "sign_cap_cp") {
        m.material = new MeshBasicMaterial({
          map: nameplateTexture({ en: "Crown Prince and Prime Minister", ar: "ولي العهد رئيس مجلس الوزراء" }, { en: "HRH Prince Mohammed bin Salman", ar: "صاحب السمو الملكي الأمير محمد بن سلمان" }),
          toneMapped: false,
        });
      } else if (name === "sign_dir") {
        m.material = new MeshBasicMaterial({ map: directoryTexture(), toneMapped: false });
        m.userData.directory = true;
      }
    });

    for (const mk of this.markers) if (mk.kind === "glow") this.root.add(makeGlow(String(mk.data.color ?? "#ffd9a0"), Number(mk.data.size ?? 2.4), mk.pos, 0.75));

    for (const n of ["doorL", "doorR"]) {
      const node = this.pivot(n);
      if (node) this.doors.push({ node, x0: node.position.x, slide: Number(node.userData.slide) });
    }
    for (const n of ["liftDoorL", "liftDoorR"]) {
      const node = this.pivot(n);
      if (node) this.liftDoors.push({ node, x0: node.position.x, slide: Number(node.userData.slide) });
    }

    // flags: replace the static plates with cloth that moves
    inst.traverse((o) => {
      if (!o.userData.flag) return;
      o.visible = false;
      const g = new PlaneGeometry(2.4, 1.5, 14, 5);
      const mat = patchBaked(new MeshStandardMaterial({ color: 0x1f73c4, roughness: 0.8, side: DoubleSide }), "dyn", this.look);
      const mesh = new Mesh(g, mat);
      o.getWorldPosition(mesh.position);
      mesh.position.x += 1.25;
      this.root.add(mesh);
      this.flags.push({ mesh, base: (g.attributes.position.array as Float32Array).slice(), phase: Number(o.userData.phase ?? 0) });
    });

    this.buildRail([
      ["street", 560, 0],
      ["cross", 0, -1],
      ["plaza", 440, 1],
      ["doors", 0, -1],
      ["reception", 560, 2],
      ["liftwalk", 0, -1],
      ["lift", 420, 3],
    ]);
    this.stations = [this.stationFrom("tower", "tower", "-"), this.stationFrom("entrance", "entrance", "-"), this.stationFrom("desk", "desk", "reception"), this.stationFrom("lift", "lift", "lift")];

    this.traffic = new Traffic(this);
    void this.traffic.load().catch((e) => console.warn("[fast] traffic unavailable", e));
  }

  protected labelText(i: number) {
    return tr(arrivalStops[i].label);
  }

  entryPx() {
    return this.fromLift ? this.rail.length : 0;
  }

  enter() {
    this.greeted = this.fromLift;
    this.panelArmed = !this.fromLift;
    this.doorOpen = this.fromLift ? 0 : 0;
    this.liftOpen = this.fromLift ? 1 : 0;
  }

  placeGuide(guide: Guide) {
    const st = this.standFor(this.fromLift ? 3 : 2);
    guide.root.visible = true;
    if (st) guide.place(st.pos, st.face);
  }

  guidePlan(st: number, guide: Guide, _key = -1) {
    const stand = this.standFor(st >= 3 ? 3 : 2);
    if (stand) guide.walkTo(stand.pos, stand.face);
  }

  protected pointsAt(st: number) {
    return st === 3;
  }

  guideFrame(guide: Guide, st: number, settled: boolean, dt: number) {
    super.guideFrame(guide, st, settled, dt);
    if (st === 2 && settled && !this.greeted) {
      this.greeted = true;
      guide.wave();
    }
  }

  exit() {
    this.fromLift = true;
  }

  onEnd() {
    liftPanel.value = true;
  }

  update(dt: number, t: number, px: number) {
    const cam = this.engine.camera.position;
    const dDoor = cam.distanceTo(this.entrance);
    this.doorOpen = MathUtils.damp(this.doorOpen, dDoor < 8.5 ? 1 : 0, 3.2, dt);
    for (const d of this.doors) d.node.position.x = d.x0 + d.slide * this.doorOpen;
    const dLift = cam.distanceTo(this.liftFront);
    this.liftOpen = MathUtils.damp(this.liftOpen, dLift < 6.5 ? 1 : 0, 2.6, dt);
    for (const d of this.liftDoors) d.node.position.x = d.x0 + d.slide * this.liftOpen;

    for (const f of this.flags) {
      const pos = f.mesh.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < pos.count; i++) {
        const x = f.base[i * 3] + 1.2;
        const k = x / 2.4;
        arr[i * 3 + 2] = Math.sin(x * 2.4 - t * 4.2 + f.phase) * 0.13 * k + Math.sin(x * 5.1 - t * 6.3 + f.phase * 2) * 0.04 * k;
        arr[i * 3 + 1] = f.base[i * 3 + 1] - k * k * 0.12;
      }
      pos.needsUpdate = true;
    }
    this.traffic?.update(dt, t);

    // arriving in front of the lift calls it: the floor selector opens once per approach
    const atLift = station.value === 3 && px > this.rail.length - 30 && this.engine.input.settled;
    if (atLift && this.panelArmed && liftPhase.peek() === "idle") {
      this.panelArmed = false;
      liftPanel.value = true;
    } else if (station.value !== 3) this.panelArmed = true;
  }
}
