import { useEffect, useRef, useState } from "react";
import { chapters } from "../data/chapters";
import { useTour } from "../store";

export const liftDestinations = [
  ...chapters.map((c, i) => ({
    id: c.id,
    title: c.title,
    ar: c.ar,
    floor: i === 0 ? "R" : String(12 - i).padStart(2, "0"),
    at: i + 1,
  })),
  {
    id: "reception",
    title: "Reception & exit",
    ar: "الاستقبال والخروج",
    floor: "G",
    at: 11.69,
  },
];

export function LiftNavigator({
  open,
  initialDestination,
  rtl,
  onClose,
  onArrive,
}: {
  open: boolean;
  initialDestination: string | null;
  rtl: boolean;
  onClose: () => void;
  onArrive: (at: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<
    "select" | "closing" | "travelling" | "opening"
  >("select");
  const [selected, setSelected] = useState<string | null>(null);
  const active = useTour((s) => s.active);
  const arrival = useRef(onArrive);
  arrival.current = onArrive;
  const close = useRef(onClose);
  close.current = onClose;
  const destination = liftDestinations.find((d) => d.id === selected);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      setSelected(initialDestination);
      setPhase(initialDestination ? "closing" : "select");
    } else dialog.current?.close();
  }, [open, initialDestination]);
  useEffect(() => {
    if (!open || !destination || phase === "select") return;
    if (phase === "closing") {
      const timer = setTimeout(() => {
        arrival.current(destination.at);
        setPhase("travelling");
      }, 650);
      return () => clearTimeout(timer);
    }
    if (phase === "travelling") {
      // Keep the doors opaque until the destination has actually rendered.
      const timer = setInterval(() => {
        const canvas =
          document.querySelector<HTMLCanvasElement>("canvas[data-ready]");
        if (
          Number(canvas?.dataset.jumpVersion) === useTour.getState().jumpVersion
        )
          setPhase("opening");
      }, 150);
      return () => clearInterval(timer);
    }
    const timer = setTimeout(() => close.current(), 700);
    return () => clearTimeout(timer);
  }, [open, phase, destination]);
  return (
    <dialog
      ref={dialog}
      className="lift-dialog"
      data-phase={phase}
      data-lenis-prevent
      aria-labelledby="lift-title"
      onCancel={(e) => {
        e.preventDefault();
        if (phase === "select") onClose();
      }}
    >
      <div className="lift-console" hidden={phase !== "select"}>
        <div className="lift-console-top">
          <span>FAST / TOWER LIFT</span>
          <button
            onClick={onClose}
            aria-label={rtl ? "إغلاق لوحة المصعد" : "Close lift panel"}
          >
            ×
          </button>
        </div>
        <div className="lift-led">
          <span>{rtl ? "اختر وجهتك" : "SELECT DESTINATION"}</span>
          <b>↕</b>
        </div>
        <h2 id="lift-title">
          {rtl ? "إلى أي طابق؟" : "Where would you like to go?"}
        </h2>
        <p>
          {rtl
            ? "اختر أي خدمة. سيلتقي بك مهندس فاست عند الوصول."
            : "Choose any service. Your FAST engineer will guide you on arrival."}
        </p>
        <div className="lift-floor-buttons">
          {liftDestinations.map((d) => (
            <button
              key={d.id}
              data-destination={d.id}
              aria-current={active === d.at ? "location" : undefined}
              onClick={() => {
                setSelected(d.id);
                setPhase("closing");
              }}
            >
              <span className="lift-floor-number">{d.floor}</span>
              <span>{rtl ? d.ar : d.title}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="lift-console-note">
          {rtl
            ? "يمكنك الاستمرار بالتمرير داخل كل طابق."
            : "Explore each floor by scrolling, or choose another destination at any time."}
        </p>
      </div>
      {phase !== "select" && (
        <div className="lift-journey" aria-live="polite" role="status">
          <div className="lift-door lift-door-left" />
          <div className="lift-door lift-door-right" />
          <div className="lift-trip-label">
            <span>FAST / {destination?.floor}</span>
            <h2>{rtl ? destination?.ar : destination?.title}</h2>
            <p>
              {rtl
                ? "ننتقل إلى وجهتك"
                : phase === "opening"
                  ? "Your floor. Your guide."
                  : "Taking you to your floor…"}
            </p>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function LiftPrompt({
  rtl,
  onOpen,
}: {
  rtl: boolean;
  onOpen: () => void;
}) {
  const visible = useTour((s) => {
    const p = s.progress,
      local = p % 1;
    return (
      (p > 1.27 && p < 1.94) ||
      (p > 2.77 && p < 2.94) ||
      (p >= 3 && p < 11.4 && local > 0.46 && local < 0.82) ||
      (p > 11.46 && p < 11.61)
    );
  });
  if (!visible) return null;
  return (
    <aside className="lift-prompt">
      <span>{rtl ? "المصعد جاهز" : "YOUR LIFT IS READY"}</span>
      <p>
        {rtl
          ? "اختر الطابق التالي أو تابع الجولة."
          : "Choose your next floor, or keep scrolling to continue the tour."}
      </p>
      <button onClick={onOpen}>
        {rtl ? "اختر الخدمة" : "Choose a service"}
        <span aria-hidden="true">↕</span>
      </button>
    </aside>
  );
}
