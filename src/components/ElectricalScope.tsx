import { useState } from "react";
import { electricalScope } from "../data/electrical";
import { assetUrl } from "../lib/assets";

export function ElectricalScope({ rtl }: { rtl: boolean }) {
  const [selected, setSelected] = useState(0);
  const scope = electricalScope[selected];
  return (
    <details className="electrical-scope" data-lenis-prevent>
      <summary>
        <span>
          {rtl ? "قدرات ننفذها بفرقنا" : "Capabilities we self-deliver"}
          <small>
            {rtl
              ? "اختر مجالاً ومرّر داخله لعرض النطاق الكامل"
              : "Choose a group · Scroll inside for the full scope"}
          </small>
        </span>
        <span className="scope-count">
          16 <span aria-hidden="true">＋</span>
        </span>
      </summary>
      <div className="electrical-scope-body">
        <div
          className="scope-categories"
          role="group"
          aria-label={
            rtl ? "مجالات الأعمال الكهربائية" : "Electrical scope categories"
          }
        >
          {electricalScope.map((category, i) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected === i}
              aria-controls="electrical-scope-content"
              onClick={() => setSelected(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {rtl ? category.ar : category.title}
            </button>
          ))}
        </div>
        <section
          id="electrical-scope-content"
          aria-labelledby="electrical-scope-heading"
          key={scope.id}
        >
          <h3 id="electrical-scope-heading">{rtl ? scope.ar : scope.title}</h3>
          <ol start={scope.start}>
            {scope.items.map(([en, ar], i) => (
              <li key={en}>
                <span aria-hidden="true">
                  {String(scope.start + i).padStart(2, "0")}
                </span>
                {rtl ? ar : en}
              </li>
            ))}
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
              src={assetUrl(`electrical/${scope.image}`)}
              alt={
                rtl
                  ? "أعمال كهربائية من محفظة مشاريع فاست"
                  : "Electrical work from the FAST project portfolio"
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
          {rtl
            ? "نطاق العمل وفق ملفات تعريف فاست لعام 2026. النماذج ثلاثية الأبعاد توضيحية."
            : "Scope informed by FAST’s 2026 company profiles. 3D equipment is illustrative."}
        </p>
        <a href="https://fast-arabia.com/services/electrical">
          {rtl
            ? "عرض الخدمة الكاملة ↗"
            : "Explore the full electrical service ↗"}
        </a>
      </div>
    </details>
  );
}
