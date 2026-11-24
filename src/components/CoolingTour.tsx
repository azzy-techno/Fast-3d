import { coolingIndex, coolingStops } from "../data/cooling";
import { useTour } from "../store";

export function CoolingTour({
  rtl,
  onSelect,
}: {
  rtl: boolean;
  onSelect: (at: number) => void;
}) {
  const i = useTour((s) => coolingIndex(s.progress));
  if (i < 0) return null;
  const lang = rtl ? 1 : 0;
  const stop = coolingStops[i];
  return (
    <>
      <span id="cooling-callout" aria-hidden="true" />
      <aside
        className="electrical-tour cooling-tour"
        aria-label={rtl ? "جولة برج التبريد" : "Cooling tower component tour"}
      >
        <p className="electrical-tour-kicker">
          {rtl ? "سطح البرج" : "Roof"} / CT–01{" "}
          <span>{String(i + 1).padStart(2, "0")} / 08</span>
        </p>
        <h2>{stop.title[lang]}</h2>
        <p className="equipment-caption">{stop.service[lang]}</p>
        <p>{stop.note[lang]}</p>
        {i === 0 && (
          <a
            className="cooling-service-link"
            href="https://fast-arabia.com/services/mechanical"
          >
            {rtl
              ? "الخدمات الميكانيكية والمشاريع ↗"
              : "Mechanical services & projects ↗"}
          </a>
        )}
        <div className="electrical-tour-actions">
          <button
            disabled={i === 0}
            onClick={() => onSelect(coolingStops[i - 1].at)}
          >
            {rtl ? "السابق" : "Previous"}
          </button>
          <button onClick={() => onSelect(coolingStops[i + 1]?.at ?? 0.55)}>
            {i === 0
              ? rtl
                ? "افتح البرج"
                : "Open the tower"
              : i === 7
                ? rtl
                  ? "أعِد التجميع وتابع"
                  : "Reassemble & continue"
                : rtl
                  ? "التالي"
                  : "Next"}
          </button>
        </div>
        <nav
          aria-label={rtl ? "مكوّنات برج التبريد" : "Cooling tower components"}
        >
          {coolingStops.map((s, n) => (
            <button
              key={s.at}
              aria-label={s.title[lang]}
              aria-current={i === n ? "step" : undefined}
              onClick={() => onSelect(s.at)}
            >
              {String(n + 1).padStart(2, "0")}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

export function CoolingScope({ rtl }: { rtl: boolean }) {
  const lang = rtl ? 1 : 0;
  return (
    <details className="roof-scope">
      <summary>
        {rtl ? "المكوّنات وخدمات فاست" : "Tower components & FAST services"}
      </summary>
      <ol>
        {coolingStops.map((s) => (
          <li key={s.at}>
            <strong>{s.title[lang]}</strong>
            <p>{s.note[lang]}</p>
          </li>
        ))}
      </ol>
      <p>
        {rtl
          ? "تشمل المراجع مشروعي إعادة التأهيل في مطار الدمام وبرج عبدالكريم. يعتمد النموذج التوضيحي على ملف فاست لخدمات أبراج التبريد والملف التعريفي للشركة."
          : "Project references include the Dammam Airport and AK Tower retrofits. This illustrative assembly draws on FAST’s Cooling Tower Engineering & Industrial Services brochure and company profile."}
      </p>
      <a href="https://fast-arabia.com/services/mechanical">
        {rtl
          ? "نطاق الخدمات الميكانيكية والمشاريع ↗"
          : "Mechanical scope and project references ↗"}
      </a>
    </details>
  );
}
