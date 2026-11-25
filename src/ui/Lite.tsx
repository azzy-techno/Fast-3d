import { useEffect } from "preact/hooks";
import { certificates, partners, projects, registrations } from "../content/about";
import { company } from "../content/company";
import { floors } from "../content/floors";
import type { Floor } from "../content/types";
import * as bridge from "../bridge";
import { t, tr } from "../i18n";
import { contactOpen, noWebgl, reducedMotion, setMode, viewer } from "../state";
import { asset, Icon } from "./bits";

/**
 * The fast route: every service, credential and contact on one ordinary page. No WebGL, no animation.
 * It is what reduced-motion visitors and devices without (or struggling with) 3D get, and it is the
 * thirty-second answer for anyone who just wants the facts.
 */
export function Lite() {
  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id.startsWith("floor-")) document.getElementById(id)?.scrollIntoView();
  }, []);
  const enter3d = (f?: Floor) => {
    setMode("tour");
    if (f) {
      if (bridge.hasEngine()) bridge.travel(f.id);
      else history.replaceState(null, "", `#${f.id}`);
    }
  };
  return (
    <main class="lite" id="content">
      <section class="lite-hero">
        <img class="lite-hero-img" src={asset("img/poster.webp")} alt="" />
        <div class="lite-hero-in">
          <p class="eyebrow">
            {tr(company.legalName)} · {tr(company.hq)}
          </p>
          <h1>{t("tagline")}</h1>
          <p class="lead">{tr(company.intro)}</p>
          <div class="row">
            <button class="btn primary" onClick={() => (contactOpen.value = true)}>
              <span>{t("talk")}</span>
              <Icon name="arrow" />
            </button>
            <a class="btn glass" href={company.contact.rfq} target="_blank" rel="noopener">
              {t("quote")}
            </a>
            {!noWebgl.value && (
              <button class="btn glass" onClick={() => enter3d()}>
                <Icon name="cube" />
                <span>{t("enterTour")}</span>
              </button>
            )}
          </div>
          {(noWebgl.value || reducedMotion) && <p class="note">{noWebgl.value ? t("noWebgl") : t("reduced")}</p>}
        </div>
      </section>

      <nav class="lite-jump" aria-label={t("services")}>
        {floors.map((f) => (
          <a key={f.id} href={`#floor-${f.id}`} style={{ "--accent": f.accent }}>
            <span class="num">{f.level}</span>
            {tr(f.name)}
          </a>
        ))}
      </nav>

      <section class="lite-sec">
        <h2>{t("whatWeDo")}</h2>
        <div class="lite-floors">
          {floors
            .filter((f) => f.id !== "about")
            .map((f) => (
              <article class="lite-floor" id={`floor-${f.id}`} key={f.id} style={{ "--accent": f.accent }}>
                <div class="lite-floor-art">
                  <img src={asset(`img/floor-${f.id}.webp`)} alt="" loading="lazy" onError={(e) => ((e.currentTarget as HTMLImageElement).src = asset(f.photos[0]?.src ?? "img/poster.webp"))} />
                  <span class="lite-level num">{f.level}</span>
                </div>
                <div class="lite-floor-text">
                  <h3>{tr(f.name)}</h3>
                  <p class="lead">{tr(f.title)}</p>
                  <p>{tr(f.intro)}</p>
                  <ul class="chips">
                    {f.stations.map((s) => (
                      <li key={s.id}>{tr(s.label)}</li>
                    ))}
                  </ul>
                  <details>
                    <summary>
                      {t("fullScope")} <span class="num">{f.scope.reduce((a, g) => a + g.items.length, 0)}</span>
                    </summary>
                    {f.scope.map((g) => (
                      <div class="scope-group" key={g.title.en}>
                        <h4>{tr(g.title)}</h4>
                        <ul>
                          {g.items.map((i) => (
                            <li key={i.en}>{tr(i)}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </details>
                  {f.photos.length > 0 && (
                    <div class="photos">
                      {f.photos.map((p) => (
                        <img key={p.src} src={asset(p.src)} alt={tr(p.alt)} loading="lazy" />
                      ))}
                    </div>
                  )}
                  <div class="row">
                    <a class="btn ghost" href={f.href} target="_blank" rel="noopener">
                      <span>{t("officialPage")}</span>
                      <Icon name="ext" />
                    </a>
                    {!noWebgl.value && (
                      <button class="btn ghost" onClick={() => enter3d(f)}>
                        <Icon name="cube" />
                        <span>{t("seeIn3d")}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section class="lite-sec" id="floor-about">
        <h2>{t("whoWeAre")}</h2>
        <div class="lite-about">
          <div>
            <h3>{t("vision")}</h3>
            <p>{tr(company.vision)}</p>
            <h3>{t("mission")}</h3>
            <p>{tr(company.mission)}</p>
            <ul class="ticks">
              {company.missionPoints.map((p) => (
                <li key={p.en}>{tr(p)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t("credentials")}</h3>
            <dl class="facts">
              {company.facts.map((f) => (
                <div key={f.label.en}>
                  <dt>{tr(f.label)}</dt>
                  <dd>{tr(f.value)}</dd>
                </div>
              ))}
            </dl>
            <h3>{t("sectors")}</h3>
            <ul class="chips">
              {company.sectors.map((s) => (
                <li key={s.en}>{tr(s)}</li>
              ))}
            </ul>
          </div>
        </div>
        <div class="lite-proof">
          <button class="proof" onClick={() => (viewer.value = { kind: "certificates", index: 0 })}>
            <strong class="num">{certificates.length}</strong>
            <span>{t("certificates")}</span>
          </button>
          <button class="proof" onClick={() => (viewer.value = { kind: "registrations", index: 0 })}>
            <strong class="num">{registrations.length}</strong>
            <span>{t("registrations")}</span>
          </button>
          <button class="proof" onClick={() => (viewer.value = { kind: "partners", index: 0 })}>
            <strong class="num">{partners.length}</strong>
            <span>{t("partners")}</span>
          </button>
          <button class="proof" onClick={() => (viewer.value = { kind: "projects", index: 0 })}>
            <strong class="num">{projects.length}</strong>
            <span>{t("projects")}</span>
          </button>
        </div>
        <ul class="logo-row" aria-label={t("registrations")}>
          {registrations.map((r) => (
            <li key={r.id}>
              <img src={asset(r.logo)} alt={tr(r.name)} loading="lazy" />
            </li>
          ))}
        </ul>
      </section>

      <section class="lite-sec lite-contact">
        <h2>{t("contactTitle")}</h2>
        <p class="lead">{t("contactLead")}</p>
        <div class="row">
          <a class="btn primary" href={company.contact.rfq} target="_blank" rel="noopener">
            <span>{t("quote")}</span>
            <Icon name="arrow" />
          </a>
          <a class="btn ghost" href={`mailto:${company.contact.email}`}>
            {company.contact.email}
          </a>
          <a class="btn ghost" href={`tel:${company.contact.phone.replace(/[^+\d]/g, "")}`} dir="ltr">
            {company.contact.phone}
          </a>
        </div>
        <p class="muted">{tr(company.contact.address)}</p>
        {company.group.length > 0 && (
          <>
            <h3>{t("group")}</h3>
            <ul class="group">
              {company.group.map((g) => (
                <li key={g.name.en}>
                  {g.url ? (
                    <a href={g.url} target="_blank" rel="noopener">
                      {tr(g.name)}
                    </a>
                  ) : (
                    <strong>{tr(g.name)}</strong>
                  )}
                  <span>{tr(g.summary)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <footer class="lite-foot">
        <img src={asset("brand/fast-logo-white.png")} alt="FAST O&M" width="120" height="36" />
        <p>
          {t("concept")} {t("imageCredits")}
        </p>
      </footer>
    </main>
  );
}
