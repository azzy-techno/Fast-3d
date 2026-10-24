import { useEffect, useRef, useState } from "react";
import { chapters } from "../data/chapters";
import { useTour } from "../store";
import { journeyBeat } from "../scene/journey";

export function JourneyGuide({
  rtl,
  jump,
  cinematic,
  setCinematic,
}: {
  rtl: boolean;
  jump: (id: string) => void;
  cinematic: boolean;
  setCinematic: (value: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null),
    copy = useRef<HTMLDivElement>(null),
    marker = useRef<SVGCircleElement>(null);
  const [hostCue, setHostCue] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [beat, setBeat] = useState(journeyBeat(0));
  const [floor, setFloor] = useState("CITY / ARRIVAL");
  const active = useTour((s) => s.active);
  useEffect(() => {
    const update = () => {
      const p = useTour.getState().progress;
      const beat = journeyBeat(p);
      setHostCue(p > 0.4 && p < 0.74 ? "welcome" : p > 11.84 ? "farewell" : "");
      setBeat((previous) => (previous[0] === beat[0] ? previous : beat));
      const floor =
        p < 0.7
          ? "CITY / ARRIVAL"
          : p < 1.43
            ? "03 / ROOF"
            : p < 1.85
              ? "02 / WORKPLACE"
              : p < 11.6
                ? "01 / SYSTEMS"
                : p < 11.83
                  ? "G / RECEPTION"
                  : "CITY / FAREWELL";
      setFloor((previous) => (previous === floor ? previous : floor));
      if (root.current)
        root.current.dataset.phase =
          p > 1.22 && p < 1.96 ? "interlude" : "service";
      const local = p % 1;
      const visible =
        (p > 1.22 && p < 1.96) ||
        (p > 11.4 && p < 11.94) ||
        (p > 2 && p < 11.5 && local > 0.38 && local < 0.84);
      if (copy.current) copy.current.style.opacity = visible ? "1" : "0";
      if (marker.current)
        marker.current.setAttribute(
          "cy",
          String(28 + Math.min(1, Math.max(0, (p - 2) / 9)) * 156),
        );
    };
    update();
    return useTour.subscribe(update);
  }, []);
  const arabicBeat = beat[0].startsWith("04")
    ? [
        "داخل المبنى",
        "مساحات صممت للناس.",
        "مكاتب وقاعات اجتماعات ومساحات عمل مترابطة.",
      ]
    : [
        "رحلة داخل المبنى",
        "اتبع الأنظمة المترابطة.",
        "من السطح إلى مساحات العمل والبنية التحتية الذكية.",
      ];
  return (
    <div className="journey-guide" ref={root}>
      {hostCue && (
        <div className="host-cue">
          <span>{rtl ? "مرشدك في فاست" : "YOUR FAST GUIDE"}</span>
          <p>
            {rtl
              ? hostCue === "welcome"
                ? "أهلاً بك. هيا نبدأ الجولة."
                : "إلى اللقاء. شكراً لزيارتك."
              : hostCue === "welcome"
                ? "Hi. Let me show you around."
                : "Until next time. Thanks for joining me."}
          </p>
        </div>
      )}
      <div className="journey-toolbar">
        <span className="floor-indicator">
          <i />
          {rtl ? "جولة داخل المبنى" : floor}
        </span>
        <button
          className="cinema-toggle"
          aria-pressed={cinematic}
          onClick={() => setCinematic(!cinematic)}
        >
          {rtl
            ? cinematic
              ? "إظهار التفاصيل"
              : "وضع سينمائي"
            : cinematic
              ? "Show details"
              : "Cinema view"}
          <span aria-hidden="true">⌗</span>
        </button>
        <button
          className="plan-toggle"
          aria-expanded={mapOpen}
          aria-controls="journey-floor-plan"
          onClick={() => setMapOpen(!mapOpen)}
        >
          {rtl ? "مخطط المبنى" : "Floor plan"}
          <span aria-hidden="true">{mapOpen ? "−" : "+"}</span>
        </button>
      </div>
      <div className="journey-interlude" ref={copy} aria-hidden="true">
        <p className="journey-eyebrow">{rtl ? arabicBeat[0] : beat[0]}</p>
        <p className="journey-headline">{rtl ? arabicBeat[1] : beat[1]}</p>
        <p className="journey-description">{rtl ? arabicBeat[2] : beat[2]}</p>
        <span className="journey-scroll-cue">
          {rtl ? "تابع التمرير للاستكشاف" : "Continue scrolling to explore"}
          <span>↓</span>
        </span>
      </div>
      <aside
        id="journey-floor-plan"
        className="floor-plan"
        hidden={!mapOpen}
        aria-label={rtl ? "مخطط رحلة المبنى" : "Building journey floor plan"}
      >
        <div className="plan-title">
          <span>{rtl ? "أنت هنا" : "YOU ARE HERE"}</span>
          <span>FAST / 01</span>
        </div>
        <div className="plan-drawing">
          <svg
            viewBox="0 0 160 210"
            role="img"
            aria-label={
              rtl
                ? "غرف الخدمات على جانبي الممر"
                : "Service rooms connected by a central corridor"
            }
          >
            <path
              d="M16 16H144V196H16Z M70 16V196 M90 16V196"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
            />
            {[0, 1, 2, 3, 4].map((row) => (
              <g key={row}>
                <path
                  d={`M16 ${52 + row * 36}H70 M90 ${52 + row * 36}H144`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.7"
                />
                {[0, 1].map((side) => (
                  <rect
                    key={side}
                    x={side ? 95 : 21}
                    y={21 + row * 36}
                    width="44"
                    height="25"
                    rx="1"
                    fill={
                      active === row * 2 + side + 2 ? "#91d8da" : "#789ca41c"
                    }
                  />
                ))}
              </g>
            ))}
            <path
              d="M80 26V184"
              fill="none"
              stroke="#96d8d8"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <circle ref={marker} cx="80" cy="28" r="3.5" fill="#e1c69b" />
          </svg>
          <ol>
            {chapters.slice(1).map((chapter, i) => (
              <li key={chapter.id}>
                <button
                  onClick={() => {
                    jump(chapter.id);
                    setMapOpen(false);
                  }}
                  aria-current={active === i + 2 ? "location" : undefined}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {rtl ? chapter.ar : chapter.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <p>
          {rtl
            ? "تصور معماري للخدمات"
            : "A conceptual plan of connected capabilities."}
        </p>
      </aside>
    </div>
  );
}
