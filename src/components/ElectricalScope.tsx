import { galleries, type GalleryId } from "../scene/serviceGalleries";

import { chapters } from "../data/chapters";
import { useState } from "react";

import { assetUrl } from "../lib/assets";

export function ElectricalScope({
  rtl,
  service,
}: {
  rtl: boolean;
  service: GalleryId;
}) {
  const [selected, setSelected] = useState(0);
  const gallery = galleries[service];
  const groups = gallery.scope;
  const scope = groups[selected];
  const fieldwork = service === "it" && scope.id === "projects";
  const fieldworkCaption = rtl
    ? "تجهيز الخزائن وإشارات أندون في الموقع، من ملف فاست للتقنية الصناعية، ص 18"
    : "Rack commissioning and Andon line signalling, from FAST’s Industrial ICT profile, p. 18";

  return (
    <details className="electrical-scope" data-lenis-prevent>
      <summary>
        <span>
          {service !== "electrical"
            ? rtl
              ? "الخدمات ومشاريع مختارة"
              : "Capabilities and selected projects"
            : rtl
              ? "قدرات ننفذها بفرقنا"
              : "Capabilities we self-deliver"}
          <small>
            {rtl
              ? "اختر مجالاً ومرّر داخله لعرض النطاق الكامل"
              : "Choose a group · Scroll inside for the full scope"}
          </small>
        </span>
        <span className="scope-count">
          {groups.reduce((sum, g) => sum + g.items.length, 0)}{" "}
          <span aria-hidden="true">＋</span>
        </span>
      </summary>
      <div className="electrical-scope-body">
        <div
          className="scope-categories"
          data-service={service}
          role="group"
          aria-label={
            rtl ? `مجالات ${gallery.ar}` : `${gallery.name} scope categories`
          }
        >
          {groups.map((category, i) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected === i}
              aria-controls={`${service}-scope-content`}
              onClick={() => setSelected(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {rtl ? category.ar : category.title}
            </button>
          ))}
        </div>
        <section
          id={`${service}-scope-content`}
          aria-labelledby={`${service}-scope-heading`}
          key={scope.id}
        >
          <h3 id={`${service}-scope-heading`}>
            {rtl ? scope.ar : scope.title}
          </h3>
          <ol start={scope.start}>
            {scope.items.map(([en, ar], i) => {
              const station = gallery.stations[scope.start + i - 1];
              return (
                <li key={en}>
                  <span aria-hidden="true">
                    {String(scope.start + i).padStart(2, "0")}
                  </span>
                  <div>
                    {rtl ? ar : en}
                    {scope.id === "projects" && "note" in station && (
                      <p className="scope-source">
                        {rtl ? station.noteAr : station.note}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {scope.id === "contracting" && (
            <p className="scope-source">
              {rtl
                ? "ويتضمن ملف التأهيل أيضاً تركيب القواطع ولوحات التحكم، ونهايات الكابلات بالانكماش الحراري والبارد."
                : "The pre-qualification profile also details breaker and control-panel installation, plus heat- and cold-shrink cable terminations."}
            </p>
          )}
          <figure>
            <img
              src={assetUrl(`${service}/${scope.image}`)}
              alt={
                fieldwork
                  ? fieldworkCaption
                  : rtl
                    ? `أعمال ${gallery.ar} من مشاريع فاست`
                    : `${gallery.name} work from the FAST project portfolio`
              }
              loading="lazy"
              width="640"
              height="380"
            />
            <figcaption>
              {fieldwork
                ? fieldworkCaption
                : rtl
                  ? "من محفظة مشاريع FAST O&M"
                  : "From the FAST O&M project portfolio"}
            </figcaption>
          </figure>
        </section>
        <p className="scope-source">{gallery.scopeSource[rtl ? 1 : 0]}</p>
        <a href={chapters.find((chapter) => chapter.id === service)?.href}>
          {rtl
            ? "عرض الخدمة الكاملة ↗"
            : `Explore the full ${service} service ↗`}
        </a>
      </div>
    </details>
  );
}
