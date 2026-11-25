import { useEffect } from "preact/hooks";
import { certificates, partners, projects, registrations } from "../content/about";
import { t, tr } from "../i18n";
import { viewer } from "../state";
import { Modal } from "./App";
import { asset, Icon } from "./bits";

type Kind = NonNullable<typeof viewer.value>["kind"];
const KINDS: Kind[] = ["certificates", "registrations", "partners", "projects"];
const sizeOf = (k: Kind) => (k === "certificates" ? certificates.length : k === "registrations" ? registrations.length : k === "partners" ? partners.length : projects.length);

/**
 * The About viewer: step up to any wall on Level 01 and inspect what hangs on it at full size:
 * the actual certificates, the real logos of the organisations FAST is registered with, and each partner.
 */
export function Viewer() {
  const v = viewer.value;
  const open = {
    get value() {
      return !!viewer.value;
    },
    set value(x: boolean) {
      if (!x) viewer.value = null;
    },
  };
  useEffect(() => {
    if (!v) return;
    const onKey = (e: KeyboardEvent) => {
      const cur = viewer.value;
      if (!cur || cur.kind === "projects" || cur.kind === "registrations") return;
      const n = sizeOf(cur.kind);
      const rtl = document.documentElement.dir === "rtl";
      const fwd = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key === fwd) viewer.value = { kind: cur.kind, index: (cur.index + 1) % n };
      else if (e.key === back) viewer.value = { kind: cur.kind, index: (cur.index - 1 + n) % n };
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [!!v]);

  return (
    <Modal open={open} label={t("viewer")} cls="viewer">
      {v && (
        <>
          <p class="eyebrow">
            {t("level")} 01 · {t("viewer")}
          </p>
          <div class="tabs" role="tablist">
            {KINDS.map((k) => (
              <button key={k} role="tab" aria-selected={v.kind === k} class={v.kind === k ? "is-on" : ""} onClick={() => (viewer.value = { kind: k, index: 0 })} data-autofocus={v.kind === k ? "" : undefined}>
                {t(k)} <span class="num">{sizeOf(k)}</span>
              </button>
            ))}
          </div>
          {v.kind === "certificates" && <Certs index={v.index} />}
          {v.kind === "partners" && <Partners index={v.index} />}
          {v.kind === "registrations" && (
            <ul class="logo-grid">
              {registrations.map((r) => (
                <li key={r.id}>
                  <img src={asset(r.logo)} alt="" loading="lazy" />
                  <span>{tr(r.name)}</span>
                </li>
              ))}
            </ul>
          )}
          {v.kind === "projects" && (
            <ul class="project-list">
              {projects.map((p, i) => (
                <li key={i}>
                  <strong>{tr(p.title)}</strong>
                  <span>{tr(p.client)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}

function Pager({ kind, index, n }: { kind: Kind; index: number; n: number }) {
  return (
    <div class="pager">
      <button class="btn ghost icon-only flip" onClick={() => (viewer.value = { kind, index: (index - 1 + n) % n })} aria-label={t("prev")}>
        <Icon name="arrow" />
      </button>
      <span class="num">
        {index + 1} / {n}
      </span>
      <button class="btn ghost icon-only" onClick={() => (viewer.value = { kind, index: (index + 1) % n })} aria-label={t("next")}>
        <Icon name="arrow" />
      </button>
    </div>
  );
}

function Certs({ index }: { index: number }) {
  const c = certificates[index] ?? certificates[0];
  return (
    <div class="inspect">
      <div class="inspect-art">{c.image ? <img src={asset(c.image)} alt={tr(c.title)} /> : <div class="inspect-blank">{tr(c.title)}</div>}</div>
      <div class="inspect-text">
        <h2>{tr(c.title)}</h2>
        <p>{tr(c.detail)}</p>
        {c.pdf && (
          <a class="btn ghost" href={asset(c.pdf)} target="_blank" rel="noopener">
            <span>{t("openPdf")}</span>
            <Icon name="ext" />
          </a>
        )}
        <Pager kind="certificates" index={index} n={certificates.length} />
        <ul class="thumbs">
          {certificates.map((x, i) => (
            <li key={x.id}>
              <button class={i === index ? "is-on" : ""} onClick={() => (viewer.value = { kind: "certificates", index: i })} aria-label={tr(x.title)}>
                {x.image ? <img src={asset(x.image)} alt="" loading="lazy" /> : <span>{i + 1}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Partners({ index }: { index: number }) {
  const p = partners[index] ?? partners[0];
  return (
    <div class="inspect">
      <div class="inspect-art is-logo">
        <img src={asset(p.logo)} alt={p.name} />
      </div>
      <div class="inspect-text">
        <h2>{p.name}</h2>
        <p class="eyebrow">{tr(p.country)}</p>
        <p>{tr(p.summary)}</p>
        <a class="btn ghost" href={p.url} target="_blank" rel="noopener">
          <span>{t("visitSite")}</span>
          <Icon name="ext" />
        </a>
        <Pager kind="partners" index={index} n={partners.length} />
        <ul class="thumbs is-logos">
          {partners.map((x, i) => (
            <li key={x.id}>
              <button class={i === index ? "is-on" : ""} onClick={() => (viewer.value = { kind: "partners", index: i })} aria-label={x.name}>
                <img src={asset(x.logo)} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
