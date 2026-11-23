import { useState } from "react";
import { floors, type Floor } from "../lib/journeyScroll";
export function JourneyGuide({
  rtl,
  jump,
  cinematic,
  setCinematic,
  openLift,
  floor,
  locationLabel,
}: {
  rtl: boolean;
  jump: (id: string) => void;
  cinematic: boolean;
  setCinematic: (value: boolean) => void;
  openLift: () => void;
  floor: Floor;
  locationLabel: string;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const row = floors.length - 1 - floors.indexOf(floor);
  const pitch = 165 / (floors.length - 1);
  return (
    <div className="journey-guide">
      <div className="journey-toolbar">
        <button
          className="lift-toggle"
          onClick={openLift}
          aria-haspopup="dialog"
        >
          {rtl ? "اختر الطابق" : "Choose floor"}
          <span aria-hidden="true">↕</span>
        </button>
        <span className="floor-indicator">
          <i />
          {floor.floor} / {locationLabel}
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
      <aside
        id="journey-floor-plan"
        className="floor-plan"
        data-lenis-prevent
        hidden={!mapOpen}
        aria-label={rtl ? "مخطط رحلة المبنى" : "Building journey floor plan"}
      >
        <div className="plan-title">
          <span>{rtl ? "أنت هنا" : "YOU ARE HERE"}</span>
          <span>FAST / TOWER</span>
        </div>
        <div className="plan-drawing">
          <svg
            viewBox="0 0 160 210"
            role="img"
            aria-label={
              rtl
                ? "طوابق الخدمات المتصلة بالمصعد"
                : "Service floors connected by an enclosed lift"
            }
          >
            <path
              d="M16 16H144V196H16Z M118 16V196"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
            />
            {Array.from({ length: floors.length }, (_, row) => (
              <g key={row}>
                <path
                  d={`M16 ${29 + row * pitch}H118`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth=".7"
                />
                <rect
                  x="21"
                  y={17 + row * pitch}
                  width="92"
                  height="10"
                  rx="1"
                  fill={floors.length - 1 - row === floors.indexOf(floor) ? "#91d8da" : "#789ca41c"}
                />
              </g>
            ))}
            <path
              d="M130 22V187"
              fill="none"
              stroke="#96d8d8"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <circle cx="130" cy={22 + row * pitch} r="3.5" fill="#e1c69b" />
          </svg>
          <ol>
            {floors.map((d) => (
              <li key={d.id}>
                <button
                  aria-current={d.id === floor.id ? "location" : undefined}
                  onClick={() => {
                    setMapOpen(false);
                    jump(d.id);
                  }}
                >
                  <span>{d.floor}</span>
                  {rtl ? d.ar : d.title}
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
