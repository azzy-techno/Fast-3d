import { useEffect, useRef, useState } from "react";
import { floors, type Floor } from "../lib/journeyScroll";
import { useTour } from "../store";

export function LiftNavigator({
  open,
  initialDestination,
  currentFloor,
  rtl,
  onClose,
  onArrive,
}: {
  open: boolean;
  currentFloor: string;
  initialDestination: string | null;
  rtl: boolean;
  onClose: () => void;
  onArrive: (floor: Floor) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<
    "select" | "closing" | "travelling" | "opening"
  >("select");
  const [selected, setSelected] = useState<string | null>(null);
  const frameReady = useTour((s) => s.liftFrameReady);
  const arrival = useRef(onArrive);
  arrival.current = onArrive;
  const close = useRef(onClose);
  close.current = onClose;
  const destination = floors.find((d) => d.id === selected);
  useEffect(() => {
    useTour.getState().setLiftPhase(open ? phase : "idle");
  }, [open, phase]);
  useEffect(() => () => useTour.getState().setLiftPhase("idle"), []);
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
        arrival.current(destination);
        setPhase("travelling");
      }, 450);
      return () => clearTimeout(timer);
    }
    if (phase === "travelling") {
      if (frameReady === useTour.getState().jumpVersion) setPhase("opening");
      return;
    }
    const timer = setTimeout(() => close.current(), 520);
    return () => clearTimeout(timer);
  }, [open, phase, destination, frameReady]);
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
          {floors.map((d) => (
            <button
              key={d.id}
              data-destination={d.id}
              aria-current={currentFloor === d.id ? "location" : undefined}
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
