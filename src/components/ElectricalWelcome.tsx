import { floorNumber } from "../lib/journeyScroll";
import { galleries, type GalleryId } from "../scene/serviceGalleries";
import { useTour } from "../store";
import { ElectricalScope } from "./ElectricalScope";
export function ElectricalWelcome({
  rtl,
  onEnter,
  service,
  onLift,
  onProjects,
  onVisit,
}: {
  rtl: boolean;
  service: GalleryId;
  onEnter: () => void;
  onLift: () => void;
  onProjects?: () => void;
  onVisit: (at: number) => void;
}) {
  const gallery = galleries[service];
  const visible = useTour(
    (s) =>
      s.progress >= (service === "electrical" ? 1.96 : gallery.start) &&
      s.progress < gallery.start + 0.012,
  );
  if (!visible) return null;
  return (
    <aside
      className="electrical-welcome"
      data-lenis-prevent
      aria-label={
        rtl
          ? `مقدمة خدمات ${gallery.ar}`
          : `${gallery.name} service introduction`
      }
    >
      <span>
        {floorNumber(service)} / FAST {service.toUpperCase()}
      </span>
      <h2>{gallery.headline[rtl ? 1 : 0]}</h2>
      <p>{gallery.intro[rtl ? 1 : 0]}</p>
      <div>
        <button onClick={onEnter}>
          {rtl ? "ابدأ من المحطة 01" : "Start at station 01"} →
        </button>
        {gallery.projectStart > 0 && onProjects && (
          <button onClick={onProjects}>
            {"projectLabel" in gallery
              ? gallery.projectLabel[rtl ? 1 : 0]
              : rtl
                ? `انتقل إلى مشاريع فاست · ${String(gallery.projectStart).padStart(2, "0")}–${gallery.stations.length}`
                : `Go to FAST projects · ${String(gallery.projectStart).padStart(2, "0")}–${gallery.stations.length}`}
          </button>
        )}
        <button onClick={onLift}>
          {rtl ? "اختر خدمة أخرى" : "Choose another service"}
        </button>
      </div>
      <ElectricalScope service={service} rtl={rtl} onVisit={onVisit} />
    </aside>
  );
}
