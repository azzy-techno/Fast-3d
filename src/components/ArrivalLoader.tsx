import { useRef } from "react";
import { motion } from "motion/react";
import { useProgress } from "@react-three/drei";
import { assetUrl } from "../lib/assets";
import "./arrival-loader.css";
export function ArrivalLoader({
  rtl,
  ready,
  loaded,
  onSkip,
}: {
  rtl: boolean;
  ready: boolean;
  loaded: number;
  onSkip: () => void;
}) {
  const assets = useProgress((s) => s.progress),
    highest = useRef(0);
  highest.current = Math.max(
    highest.current,
    Math.min(95, assets * 0.85 + loaded * 3),
  );
  const percent = ready && loaded >= 3 ? 100 : Math.round(highest.current);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <motion.div
      className="loader arrival-loader"
      role="status"
      aria-live="polite"
      exit={{
        opacity: 0,
        transition: { duration: 0.15, delay: reduced ? 0 : 0.7 },
      }}
    >
      <motion.div
        className="arrival-door arrival-door-left"
        aria-hidden="true"
        exit={{
          x: reduced ? 0 : "-105%",
          transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
        }}
      />
      <motion.div
        className="arrival-door arrival-door-right"
        aria-hidden="true"
        exit={{
          x: reduced ? 0 : "105%",
          transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
        }}
      />
      <motion.div
        className="arrival-content"
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
      >
        <img
          src={assetUrl("fast-logo.png")}
          alt="FAST"
          width="210"
          height="70"
        />
        <span className="arrival-eyebrow">
          {rtl
            ? "الهندسة · التشغيل · الذكاء"
            : "ENGINEERING · OPERATIONS · INTELLIGENCE"}
        </span>
        <div className="arrival-drawing" aria-hidden="true">
          <svg viewBox="0 0 420 270" fill="none">
            <g stroke="currentColor" strokeWidth="1.1">
              <path
                className="arrival-outline"
                pathLength="1"
                d="M30 240H390M120 240V65L225 25L310 70V240M120 65L210 110L310 70M210 110V240M140 76V240M163 88V240M187 99V240M234 100V240M260 90V240M285 80V240M120 110L210 150L310 110M120 151L210 188L310 151M120 194L210 225L310 194M225 25V12M220 12H230"
              />
              <path
                opacity=".3"
                d="M18 251H402M105 45L225 0L325 54M100 45V250M330 54V250M75 220V130H110M320 160H355V240"
              />
            </g>
            <path d="M120 65L210 110V240L120 240Z" fill="#2e9db70b" />
            <path d="M210 110L310 70V240H210Z" fill="#39b7c912" />
          </svg>
          <div className="arrival-scan" />
        </div>
        <div className="arrival-caption">
          <h2>{rtl ? "لنفتح آفاقاً جديدة." : "Step into possibility."}</h2>
          <p>
            {rtl
              ? ready
                ? "نفتح لك الأبواب…"
                : "نهيّئ المشهد من أجلك…"
              : ready
                ? "Opening the doors…"
                : "Bringing the skyline into view…"}
          </p>
        </div>
        <div
          className="arrival-progress"
          role="progressbar"
          aria-label={rtl ? "تحميل التجربة" : "Loading experience"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
        <div className="arrival-meta">
          <span>{String(percent).padStart(2, "0")}%</span>
          <button onClick={onSkip}>
            {rtl ? "استكشف الجولة المصوّرة" : "Explore the photo tour"}{" "}
            <span className="direction-arrow" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
