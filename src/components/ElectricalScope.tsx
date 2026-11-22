import { galleries, type GalleryId } from "../scene/serviceGalleries";

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
                rtl
                  ? `أعمال ${gallery.ar} من مشاريع فاست`
                  : `${gallery.name} work from the FAST project portfolio`
              }
              loading="lazy"
              width="640"
              height="380"
            />
            <figcaption>
              {rtl
                ? "من محفظة مشاريع FAST O&M"
                : "From the FAST O&M project portfolio"}
            </figcaption>
          </figure>
        </section>
        <p className="scope-source">
          {service === "civil"
            ? rtl
              ? "المصدر: صفحة الخدمات المدنية وملف فاست 2026، ص 11–12 و49–50. النماذج توضيحية."
              : "Sources: FAST Civil services and the 2026 company profile, pp. 11–12 and 49–50. Sections and project models illustrate the work."
            : service === "fabrication"
            ? rtl
              ? "من صفحة خدمات التصنيع وسجل مشاريع فاست. النماذج توضيحية."
              : "Scope and project references come from FAST’s Fabrication page. Equipment models illustrate the work."
            : service === "mechanical"
              ? rtl
                ? "المصدر: صفحة الخدمات الميكانيكية وملف فاست 2026، الصفحات 9–10 و49–50. النماذج توضيحية."
                : "Project scope is drawn from FAST’s Mechanical page and 2026 company profile, pp. 9–10 and 49–50. The models illustrate the installations."
              : rtl
                ? "نطاق العمل وفق ملفات تعريف فاست لعام 2026. النماذج ثلاثية الأبعاد توضيحية."
                : "Scope informed by FAST’s 2026 company profiles. 3D equipment is illustrative."}
        </p>
        <a href={`https://fast-arabia.com/services/${service}`}>
          {rtl
            ? "عرض الخدمة الكاملة ↗"
            : `Explore the full ${service} service ↗`}
        </a>
      </div>
    </details>
  );
}
