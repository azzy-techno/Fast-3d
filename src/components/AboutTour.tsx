import { useTour } from "../store";
import { aboutStations, aboutStationAt } from "../scene/aboutTour";
import type { AboutPanel } from "../data/about";
export function AboutTour({
  rtl,
  onSelect,
  onOpen,
}: {
  rtl: boolean;
  onSelect: (p: number) => void;
  onOpen: (p: AboutPanel) => void;
}) {
  const station = useTour((s) => aboutStationAt(s.progress));
  if (!station) return null;
  const i = station.number - 1;
  const labels = rtl
    ? ["الشهادات والتراخيص", "الاعتمادات والتسجيلات", "شركاء التقنية"]
    : [
        "Certifications & licenses",
        "Approvals & registrations",
        "Technology partners",
      ];
  const groups = ["certifications", "approvals", "partners"];
  return (
    <aside
      className="about-guided-tour"
      data-lenis-prevent
      aria-label={rtl ? "جولة معرض فاست" : "Guided About FAST presentation"}
    >
      <p className="about-tour-kicker">
        {labels[groups.indexOf(station.panel)]}
        <span>
          {station.number} / {aboutStations.length}
        </span>
      </p>
      <h2>{rtl ? station.ar : station.title}</h2>
      <p className="about-tour-note">{rtl ? station.noteAr : station.note}</p>
      <button
        className="about-display-detail"
        onClick={() => {
          if (station.partnerId)
            useTour.getState().setAboutPartner(station.partnerId);
          onOpen(station.panel);
        }}
        data-about-open={station.panel}
        aria-haspopup="dialog"
      >
        {rtl ? "افتح العرض التفصيلي" : "Open presentation details"}{" "}
        <span aria-hidden="true">+</span>
      </button>
      <div className="about-tour-actions">
        <button
          disabled={i === 0}
          onClick={() => onSelect(aboutStations[i - 1].at + 0.0009)}
        >
          {rtl ? "السابق" : "Previous"}
        </button>
        <span>{rtl ? "مع مهندس فاست" : "With your FAST engineer"}</span>
        <button
          onClick={() =>
            onSelect(
              i === aboutStations.length - 1
                ? 1.741
                : aboutStations[i + 1].at + 0.0009,
            )
          }
        >
          {i === aboutStations.length - 1
            ? rtl
              ? "إلى المصعد"
              : "To the lift"
            : rtl
              ? "التالي"
              : "Next"}
        </button>
      </div>
      <label className="about-stop-select">
        {rtl ? "اختر أي عرض" : "Choose any display"}
        <select
          value={station.number}
          onChange={(e) =>
            onSelect(aboutStations[Number(e.target.value) - 1].at + 0.0009)
          }
        >
          {groups.map((group, j) => (
            <optgroup key={group} label={labels[j]}>
              {aboutStations
                .filter((s) => s.panel === group)
                .map((s) => (
                  <option key={s.number} value={s.number}>
                    {String(s.number).padStart(2, "0")} / {rtl ? s.ar : s.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="about-section-shortcuts">
        {groups.map((g, j) => (
          <button
            key={g}
            aria-pressed={station.panel === g}
            onClick={() =>
              onSelect(aboutStations.find((s) => s.panel === g)!.at + 0.0009)
            }
          >
            {rtl
              ? ["الشهادات", "الاعتمادات", "الشركاء"][j]
              : ["Certificates", "Registrations", "Partners"][j]}
          </button>
        ))}
      </div>
    </aside>
  );
}
