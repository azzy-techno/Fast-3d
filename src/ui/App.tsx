import { useEffect, useRef } from "preact/hooks";
import { effect, useComputed, useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { floors } from "../content/floors";
import { company } from "../content/company";
import { partners, projects } from "../content/about";
import * as bridge from "../bridge";
import { arrivalStops, t, tr } from "../i18n";
import {
  anyModal,
  contactOpen,
  currentFloor,
  finale,
  floorById,
  lang,
  liftFrom,
  liftPanel,
  liftPhase,
  liftTo,
  loadProgress,
  menuOpen,
  mode,
  moved,
  noWebgl,
  ready3d,
  reducedMotion,
  scene,
  scopeOpen,
  setLang,
  setMode,
  sound,
  station,
  struggling,
  viewer,
  type SceneId,
} from "../state";
import { Lite } from "./Lite";
import { Viewer } from "./Viewer";
import { asset, Icon } from "./bits";

// ------------------------------------------------------------------------------------------------ shell
export function App() {
  useEffect(
    () =>
      effect(() => {
        document.documentElement.lang = lang.value;
        document.documentElement.dir = lang.value === "ar" ? "rtl" : "ltr";
        document.documentElement.dataset.mode = mode.value;
      }),
    [],
  );
  // 3D is mounted the first time the tour is shown and kept alive afterwards.
  const started = useSignal(mode.peek() === "tour");
  useEffect(
    () =>
      effect(() => {
        if (mode.value === "tour") {
          started.value = true;
          bridge.resumeEngine();
        } else bridge.pauseEngine();
      }),
    [],
  );
  useGlobalKeys();
  return (
    <div class="app">
      <a class="skip" href="#content">
        {t("skip")}
      </a>
      <Header />
      {started.value && <Stage />}
      {mode.value === "lite" && <Lite />}
      <Menu />
      <Contact />
      <LiftPanel />
      <Scope />
      <Viewer />
    </div>
  );
}

function useGlobalKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (mode.value !== "tour" || anyModal.value) return;
      if (e.key === "l" || e.key === "L") {
        liftPanel.value = true;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

// ------------------------------------------------------------------------------------------------ header
function Header() {
  const lite = mode.value === "lite";
  return (
    <header class="top">
      <button
        class="brand"
        onClick={() => (lite ? window.scrollTo({ top: 0 }) : bridge.restartFromStreet())}
        aria-label={`FAST Operations & Maintenance: ${lite ? t("overview") : t("restart")}`}
      >
        <img src={asset("brand/fast-logo-white.png")} alt="" width="112" height="33" />
      </button>
      <nav class="top-nav" aria-label={t("menu")}>
        <button class="btn ghost" onClick={() => (menuOpen.value = true)} aria-haspopup="dialog">
          <Icon name="grid" />
          <span>{t("services")}</span>
        </button>
        {!noWebgl.value && (
          <button class="btn ghost hide-s" onClick={() => setMode(lite ? "tour" : "lite")}>
            <Icon name={lite ? "cube" : "list"} />
            <span>{lite ? t("tour3d") : t("overview")}</span>
          </button>
        )}
        <button class="btn ghost lang" onClick={() => setLang(lang.value === "ar" ? "en" : "ar")} aria-label={t("otherLangLabel")} lang={lang.value === "ar" ? "en" : "ar"}>
          {t("otherLang")}
        </button>
        <button class="btn primary" onClick={() => (contactOpen.value = true)} aria-haspopup="dialog">
          <span>{t("talk")}</span>
          <Icon name="arrow" />
        </button>
      </nav>
    </header>
  );
}

// ------------------------------------------------------------------------------------------------ stage
function Stage() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dead = false;
    import("../engine/boot")
      .then((m) => m.boot(canvas.current!, stage.current!, labels.current!))
      .catch((e) => {
        if (dead) return;
        console.error("[fast] 3D unavailable", e);
        noWebgl.value = true;
        setMode("lite");
      });
    return () => {
      dead = true;
    };
  }, []);
  useLayoutShift(stage);
  const hidden = mode.value !== "tour";
  return (
    <div class="stage" ref={stage} id={hidden ? undefined : "content"} hidden={hidden} data-ready={ready3d.value} data-lift={liftPhase.value} data-scene={scene.value} data-finale={finale.value}>
      <canvas ref={canvas} aria-hidden="true" />
      <div class="labels" ref={labels} />
      <div class="vignette" aria-hidden="true" />
      <Poster />
      {ready3d.value && (
        <>
          <Panel />
          <Dock />
          <Finale />
          <Hint />
        </>
      )}
      <LiftDoors />
      {struggling.value && <Struggle />}
    </div>
  );
}

/** Shift the 3D picture away from the text card so the subject is never behind it. */
function useLayoutShift(stage: { current: HTMLDivElement | null }) {
  useEffect(() => {
    const apply = () => {
      const el = stage.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const card = station.value >= 0 && finale.value === "none";
      if (!card) bridge.setLayout(0, 0);
      else if (w >= 900 && w > h) bridge.setLayout((lang.value === "ar" ? -1 : 1) * Math.min(0.15, 230 / w), 0);
      else bridge.setLayout(0, 0.13);
    };
    const stop = effect(() => {
      void station.value;
      void lang.value;
      void finale.value;
      void ready3d.value;
      apply();
    });
    window.addEventListener("resize", apply);
    return () => {
      stop();
      window.removeEventListener("resize", apply);
    };
  }, []);
}

function Poster() {
  const gone = useSignal(false);
  useEffect(
    () =>
      effect(() => {
        if (ready3d.value) setTimeout(() => (gone.value = true), 900);
      }),
    [],
  );
  if (gone.value) return null;
  const pct = Math.round(loadProgress.value * 100);
  return (
    <div class={`poster ${ready3d.value ? "is-out" : ""}`}>
      <img class="poster-img" src={asset("img/poster.webp")} alt="" />
      <div class="poster-copy">
        <p class="eyebrow">FAST Operations &amp; Maintenance · {tr(company.hq)}</p>
        <h1>{t("tagline")}</h1>
        <div class="poster-load" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t("loading")}>
          <span style={{ transform: `scaleX(${Math.max(0.04, loadProgress.value)})` }} />
        </div>
        <p class="poster-status">
          {t("loading")} <span class="num">{pct}%</span>
        </p>
        <div class="poster-actions">
          <button class="btn glass" onClick={() => setMode("lite")}>
            <Icon name="list" />
            <span>{t("overview")}</span>
          </button>
          <button class="btn glass" onClick={() => (contactOpen.value = true)}>
            <span>{t("contact")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Hint() {
  if (moved.value || scene.value !== "arrival" || station.value !== 0) return null;
  return (
    <div class="hint" aria-hidden="true">
      <span class="hint-mouse">
        <i />
      </span>
      {t(typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches ? "swipeHint" : "scrollHint")}
    </div>
  );
}

function Struggle() {
  return (
    <div class="toast" role="status">
      <p>{t("struggling")}</p>
      <div>
        <button class="btn primary" onClick={() => setMode("lite")}>
          {t("switchLite")}
        </button>
        <button class="btn ghost" onClick={() => (struggling.value = false)}>
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------ story card
/** About floor: which viewer tab each wall opens. */
const INSPECT: Record<string, "certificates" | "registrations" | "partners" | "projects"> = {
  credentials: "certificates",
  registrations: "registrations",
  partners: "partners",
  sectors: "projects",
};

type Card = { eyebrow: string; title: string; body: string; n: number; count: number; kind: "arrival" | "intro" | "stop" | "lift" };

export function stopCount(id: SceneId) {
  const f = floorById(id);
  return f ? f.stations.length + (f.id === "roof" ? 3 : 2) : arrivalStops.length;
}

function useCard() {
  return useComputed<Card | null>(() => {
    const s = station.value;
    if (s < 0) return null;
    const f = currentFloor.value;
    if (!f) {
      const a = arrivalStops[s];
      if (!a) return null;
      return { eyebrow: `${t("groundLevel")} · ${s >= 2 ? t("ground") : t("street")}`, title: tr(a.title), body: tr(a.body), n: s, count: arrivalStops.length, kind: "arrival" };
    }
    const head = `${f.level === "R" ? t("roof") : `${t("level")} ${f.level}`} · ${tr(f.name)}`;
    const count = f.stations.length + (f.id === "roof" ? 3 : 2);
    if (s === 0) return { eyebrow: head, title: tr(f.title), body: tr(f.intro), n: 0, count, kind: "intro" };
    const st = f.stations[s - 1];
    if (st) return { eyebrow: `${head} · ${s} / ${f.stations.length}`, title: tr(st.title), body: tr(st.body), n: s, count, kind: "stop" };
    return { eyebrow: head, title: t("liftTitle"), body: t("liftHint"), n: s, count, kind: "lift" };
  });
}

function Panel() {
  const card = useCard().value;
  const f = currentFloor.value;
  if (!card || finale.value !== "none" || liftPhase.value !== "idle") return null;
  const first = card.n === 0;
  const last = card.n === card.count - 1;
  const nextFloor = f ? floors[floors.indexOf(f) + 1] : floors[0];
  return (
    <section class="card" key={`${scene.value}-${card.n}`} aria-live="polite" style={f ? { "--accent": f.accent } : undefined}>
      <p class="eyebrow">{card.eyebrow}</p>
      <h2>{card.title}</h2>
      <p class="card-body">{card.body}</p>
      <div class="card-actions">
        {!first && (
          <button class="btn ghost icon-only" onClick={() => bridge.step(-1)} aria-label={t("prev")}>
            <Icon name="up" />
          </button>
        )}
        {!last && (
          <button class="btn solid" onClick={() => bridge.step(1)}>
            <span>{t("next")}</span>
            <Icon name="down" />
          </button>
        )}
        {last && nextFloor && card.kind !== "arrival" && (
          <button class="btn solid" onClick={() => bridge.travel(nextFloor.id)}>
            <span>
              {t("nextFloor")}: {nextFloor.level} {tr(nextFloor.name)}
            </span>
            <Icon name="arrow" />
          </button>
        )}
        {last && (
          <button class={card.kind === "arrival" ? "btn solid" : "btn ghost"} onClick={() => (liftPanel.value = true)}>
            <Icon name="lift" />
            <span>{t("chooseFloor")}</span>
          </button>
        )}
        {f && f.id === "about" && card.kind === "stop" && INSPECT[f.stations[card.n - 1]?.id] && (
          <button class="btn ghost" onClick={() => (viewer.value = { kind: INSPECT[f.stations[card.n - 1].id], index: 0 })}>
            <Icon name="zoom" />
            <span>{t("inspect")}</span>
          </button>
        )}
        {f && f.id !== "about" && card.kind !== "lift" && (
          <button class="btn ghost" onClick={() => (scopeOpen.value = true)}>
            <span>{t("fullScope")}</span>
          </button>
        )}
        {!f && first && (
          <button class="btn ghost" onClick={() => bridge.jumpTo("lift")}>
            <span>{t("skipArrival")}</span>
          </button>
        )}
      </div>
    </section>
  );
}

/** Right-hand dock: where you are in the building, the lift call button and the stops on this floor. */
function Dock() {
  const f = currentFloor.value;
  const count = stopCount(scene.value);
  const s = station.value;
  if (finale.value === "farewell") return null;
  return (
    <aside class="dock" style={f ? { "--accent": f.accent } : undefined}>
      <button class="lift-call" onClick={() => (liftPanel.value = true)} aria-haspopup="dialog" aria-label={`${t("lift")}: ${t("chooseFloor")}`} title="L">
        <span class="lift-level num">{f ? f.level : "G"}</span>
        <span class="lift-name">{f ? tr(f.name) : t("ground")}</span>
        <Icon name="lift" />
      </button>
      <button class="sound" onClick={() => (sound.value = !sound.value)} aria-pressed={sound.value} aria-label={sound.value ? t("soundOff") : t("soundOn")} title={sound.value ? t("soundOff") : t("soundOn")}>
        <Icon name={sound.value ? "sound" : "mute"} />
      </button>
      <ol class="stops" aria-label={t("stop")}>
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <button class={i === s ? "is-on" : ""} onClick={() => bridge.goStation(i)} aria-label={`${t("stop")} ${i + 1} ${t("of")} ${count}`} aria-current={i === s ? "step" : undefined} />
          </li>
        ))}
      </ol>
    </aside>
  );
}

// ------------------------------------------------------------------------------------------------ lift
const levelOf = (id: SceneId) => (id === "arrival" ? "G" : (floorById(id)?.level ?? ""));
const nameOf = (id: SceneId) => (id === "arrival" ? t("ground") : tr(floorById(id)!.name));
const order = (id: SceneId) => (id === "arrival" ? 0 : floors.findIndex((f) => f.id === id) + 1);

function LiftDoors() {
  const phase = liftPhase.value;
  const to = liftTo.value;
  const up = order(to) >= order(liftFrom.value);
  const shut = phase === "closing" || phase === "moving";
  return (
    <div class={`doors ${shut ? "is-shut" : ""} ${phase !== "idle" ? "is-live" : ""}`} aria-hidden={phase === "idle"}>
      <div class="door door-a" />
      <div class="door door-b" />
      <div class="door-ind" role="status" aria-live="assertive">
        {phase !== "idle" && (
          <>
            <span class={`door-arrow ${up ? "" : "is-down"}`}>
              <Icon name="up" />
            </span>
            <span class="door-level num">{levelOf(to)}</span>
            <span class="door-name">{nameOf(to)}</span>
            <span class="door-status">{phase === "moving" ? t("loadingFloor") : phase === "opening" ? t("arriving") : up ? t("goingUp") : t("goingDown")}</span>
          </>
        )}
      </div>
    </div>
  );
}

function LiftPanel() {
  const here = scene.value;
  const go = (id: SceneId) => {
    liftPanel.value = false;
    bridge.travel(id);
  };
  return (
    <Modal open={liftPanel} label={t("chooseFloor")} cls="lift-panel">
      <p class="eyebrow">FAST Tower · {t("lift")}</p>
      <h2>{t("liftTitle")}</h2>
      <p class="muted">{t("liftHint")}</p>
      <ol class="lift-buttons" reversed>
        {[...floors].reverse().map((f) => (
          <li key={f.id}>
            <button class={f.id === here ? "is-here" : ""} onClick={() => go(f.id)} style={{ "--accent": f.accent }} data-autofocus={f.id === here ? "" : undefined} aria-current={f.id === here ? "location" : undefined}>
              <span class="lb-level num">{f.level}</span>
              <span class="lb-name">{tr(f.name)}</span>
              <span class="lb-note">{f.id === here ? t("youAreHere") : tr(f.title)}</span>
            </button>
          </li>
        ))}
        <li>
          <button class={here === "arrival" ? "is-here" : ""} onClick={() => go("arrival")} data-autofocus={here === "arrival" ? "" : undefined} aria-current={here === "arrival" ? "location" : undefined}>
            <span class="lb-level num">G</span>
            <span class="lb-name">{t("ground")}</span>
            <span class="lb-note">{here === "arrival" ? t("youAreHere") : ""}</span>
          </button>
        </li>
      </ol>
      <div class="lift-foot">
        <button
          class="btn ghost"
          onClick={() => {
            liftPanel.value = false;
            bridge.restartFromStreet();
          }}
        >
          {t("restart")}
        </button>
        <span class="muted hide-s">{t("keys")}</span>
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------------------------------------ finale
function Finale() {
  const f = finale.value;
  if (f === "none") return null;
  if (f === "choice")
    return (
      <section class="card finale" aria-live="polite">
        <p class="eyebrow">
          {t("roof")} · {tr(floorById("roof")!.name)}
        </p>
        <h2>{t("finaleTitle")}</h2>
        <p class="card-body">{t("finaleLead")}</p>
        <div class="card-actions">
          <button class="btn solid" onClick={() => bridge.sceneCall("startFarewell")}>
            <span>{t("finaleSky")}</span>
            <Icon name="arrow" />
          </button>
          <button class="btn ghost" onClick={() => bridge.sceneCall("followToLift")}>
            <Icon name="lift" />
            <span>{t("finaleLift")}</span>
          </button>
        </div>
      </section>
    );
  return (
    <section class="farewell" aria-live="polite">
      <h2>{t("farewellTitle")}</h2>
      <p>{t("farewellLead")}</p>
      <div class="card-actions">
        <a class="btn solid" href={company.contact.rfq} target="_blank" rel="noopener">
          <span>{t("quote")}</span>
          <Icon name="arrow" />
        </a>
        <button class="btn glass" onClick={() => (contactOpen.value = true)}>
          {t("contact")}
        </button>
        <button class="btn glass" onClick={() => bridge.sceneCall("endFarewell")}>
          {t("replay")}
        </button>
        <button class="btn glass" onClick={() => bridge.restartFromStreet()}>
          {t("restart")}
        </button>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------ dialogs
export function Modal(props: { open: { value: boolean }; label: string; cls?: string; children: ComponentChildren }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = props.open.value;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      const af = d.querySelector<HTMLElement>("[data-autofocus]");
      af?.focus();
    } else if (!open && d.open) {
      d.close();
      // never leave keyboard focus parked on a closed dialog
      const a = document.activeElement as HTMLElement | null;
      if (a && (a === d || d.contains(a))) a.blur();
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      class={`modal ${props.cls ?? ""}`}
      aria-label={props.label}
      data-modal=""
      onClose={() => (props.open.value = false)}
      onClick={(e) => {
        if (e.target === ref.current) props.open.value = false;
      }}
    >
      {open && (
        <div class="modal-in" data-scroll="">
          <button class="modal-x" onClick={() => (props.open.value = false)} aria-label={t("close")}>
            <Icon name="x" />
          </button>
          {props.children}
        </div>
      )}
    </dialog>
  );
}

/** Every service one tap away: go to its floor, or straight to the official page. */
function Menu() {
  const tour = mode.value === "tour" && !noWebgl.value;
  return (
    <Modal open={menuOpen} label={t("services")} cls="menu">
      <p class="eyebrow">FAST O&amp;M</p>
      <h2>{t("services")}</h2>
      <ul class="menu-list">
        {floors.map((f) => (
          <li key={f.id} style={{ "--accent": f.accent }}>
            <button
              class="menu-go"
              onClick={() => {
                menuOpen.value = false;
                if (tour) bridge.travel(f.id);
                else location.hash = `floor-${f.id}`;
              }}
            >
              <span class="lb-level num">{f.level}</span>
              <span class="menu-name">
                <strong>{tr(f.name)}</strong>
                <small>{tr(f.title)}</small>
              </span>
            </button>
            <a class="menu-ext" href={f.href} target="_blank" rel="noopener" aria-label={`${tr(f.name)}: ${t("officialPage")}`}>
              <Icon name="ext" />
            </a>
          </li>
        ))}
      </ul>
      <div class="menu-foot">
        <button
          class="btn primary"
          onClick={() => {
            menuOpen.value = false;
            contactOpen.value = true;
          }}
        >
          {t("contact")}
        </button>
        {!noWebgl.value && (
          <button
            class="btn ghost"
            onClick={() => {
              menuOpen.value = false;
              setMode(tour ? "lite" : "tour");
            }}
          >
            {tour ? t("overview") : t("tour3d")}
          </button>
        )}
      </div>
    </Modal>
  );
}

function Contact() {
  const c = company.contact;
  return (
    <Modal open={contactOpen} label={t("contactTitle")} cls="contact">
      <p class="eyebrow">{tr(company.name)}</p>
      <h2>{t("contactTitle")}</h2>
      <p class="muted">{t("contactLead")}</p>
      <div class="contact-cta">
        <a class="btn primary" href={c.rfq} target="_blank" rel="noopener" data-autofocus="">
          <span>{t("quote")}</span>
          <Icon name="arrow" />
        </a>
        <a class="btn ghost" href={c.contactPage} target="_blank" rel="noopener">
          {t("contact")}
        </a>
      </div>
      <dl class="contact-list">
        <dt>{t("email")}</dt>
        <dd>
          <a href={`mailto:${c.email}`}>{c.email}</a>
        </dd>
        <dt>{t("phone")}</dt>
        <dd>
          <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} dir="ltr">
            {c.phone}
          </a>
        </dd>
        <dt>{t("address")}</dt>
        <dd>{tr(c.address)}</dd>
        <dt>{t("website")}</dt>
        <dd>
          <a href={c.website} target="_blank" rel="noopener" dir="ltr">
            {c.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </dd>
      </dl>
      {c.profilePdf && (
        <a class="link" href={c.profilePdf} target="_blank" rel="noopener">
          {t("profile")} <Icon name="ext" />
        </a>
      )}
    </Modal>
  );
}

function Scope() {
  const f = currentFloor.value;
  return (
    <Modal open={scopeOpen} label={t("scopeOf")} cls="scope">
      {f && (
        <div style={{ "--accent": f.accent }}>
          <p class="eyebrow">
            {f.level === "R" ? t("roof") : `${t("level")} ${f.level}`} · {t("scopeOf")}
          </p>
          <h2>{tr(f.name)}</h2>
          <p class="muted">{tr(f.intro)}</p>
          <ScopeBody floor={f} />
          <div class="contact-cta">
            <a class="btn primary" href={company.contact.rfq} target="_blank" rel="noopener">
              <span>{t("quote")}</span>
              <Icon name="arrow" />
            </a>
            <a class="btn ghost" href={f.href} target="_blank" rel="noopener">
              <span>{t("officialPage")}</span>
              <Icon name="ext" />
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function ScopeBody({ floor }: { floor: (typeof floors)[number] }) {
  return (
    <>
      {floor.photos.length > 0 && (
        <div class="photos">
          {floor.photos.map((p) => (
            <img key={p.src} src={asset(p.src)} alt={tr(p.alt)} loading="lazy" />
          ))}
        </div>
      )}
      {floor.scope.map((g) => (
        <section class="scope-group" key={g.title.en}>
          <h3>{tr(g.title)}</h3>
          <ul>
            {g.items.map((i) => (
              <li key={i.en}>{tr(i)}</li>
            ))}
          </ul>
        </section>
      ))}
      {projects.some((p) => p.discipline === floor.id) && (
        <section class="scope-group">
          <h3>{t("projects")}</h3>
          <ul class="proj">
            {projects
              .filter((p) => p.discipline === floor.id)
              .map((p, i) => (
                <li key={i}>
                  {tr(p.title)} <small>{tr(p.client)}</small>
                </li>
              ))}
          </ul>
        </section>
      )}
      {floor.partners && floor.partners.length > 0 && (
        <section class="scope-group">
          <h3>{t("partners")}</h3>
          <div class="partner-row">
            {partners
              .filter((p) => floor.partners!.includes(p.id))
              .map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener" title={p.name}>
                  <img src={asset(p.logo)} alt={p.name} loading="lazy" />
                </a>
              ))}
          </div>
        </section>
      )}
    </>
  );
}

export { reducedMotion, viewer };
