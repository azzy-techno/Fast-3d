import { useEffect, useRef, useState } from "react";
import { useTour } from "../store";
import { aboutItems } from "../data/observatory";
import { partners, type AboutPanel } from "../data/about";
import { assetUrl } from "../lib/assets";
import { lookThroughObservatory } from "../lib/observatoryView";
import "./observatory.css";

type Item = (typeof aboutItems)[number];
const categories: { id: AboutPanel; en: string; ar: string; count: string }[] =
  [
    { id: "story", en: "About FAST", ar: "عن فاست", count: "01" },
    { id: "certifications", en: "Certifications", ar: "الشهادات", count: "05" },
    {
      id: "approvals",
      en: "Industry registrations",
      ar: "التسجيلات الصناعية",
      count: "15",
    },
    {
      id: "partners",
      en: "Technology partners",
      ar: "شركاء التقنية",
      count: "13",
    },
  ];
export function Observatory({
  rtl,
  onClose,
  onLanguage,
}: {
  rtl: boolean;
  onClose: () => void;
  onLanguage: () => void;
}) {
  const open = useTour((s) => s.observatoryOpen);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef<number | undefined>(undefined);
  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    reset();
    exitTimer.current = window.setTimeout(
      onClose,
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
    );
  };
  useEffect(() => () => window.clearTimeout(exitTimer.current), []);
  const dialog = useRef<HTMLDialogElement>(null),
    world = useRef<HTMLDivElement>(null),
    detail = useRef<HTMLDivElement>(null),
    opener = useRef<HTMLElement | null>(null),
    cardOpener = useRef<HTMLElement | null>(null);
  const [category, setCategory] = useState<AboutPanel>("story"),
    [selected, setSelected] = useState<Item | null>(null);
  const [grid, setGrid] = useState(
    () =>
      matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const adapt = () => {
      if (innerWidth < 700 || query.matches) setGrid(true);
    };
    adapt();
    window.addEventListener("resize", adapt);
    query.addEventListener("change", adapt);
    return () => {
      window.removeEventListener("resize", adapt);
      query.removeEventListener("change", adapt);
    };
  }, []);
  const motion = useRef({ x: 0, y: 0, tx: 0, ty: 0, last: 0 });
  const t = (en: string, ar: string) => (rtl ? ar : en);
  const reset = () => {
    motion.current.tx = 0;
    motion.current.ty = 0;
  };
  const change = (id: AboutPanel) => {
    setCategory(id);
    setSelected(null);
    reset();
  };
  useEffect(() => {
    if (open) {
      setLeaving(false);
      setSelected(null);
      setCategory("story");
      opener.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      reset();
    } else if (dialog.current?.open) {
      dialog.current.close();
      lookThroughObservatory(0, 0);
      opener.current?.isConnected && opener.current.focus();
    }
  }, [open]);
  useEffect(() => {
    if (selected) detail.current?.focus();
  }, [selected]);
  useEffect(() => {
    if (!open || ((grid || selected) && !leaving)) return;
    let frame = 0;
    const tick = (now: number) => {
      const m = motion.current,
        dt = Math.min(0.05, (now - (m.last || now)) / 1000);
      m.last = now;
      const a = 1 - Math.exp(-6 * dt);
      m.x += (m.tx - m.x) * a;
      m.y += (m.ty - m.y) * a;
      lookThroughObservatory(m.x, m.y);
      if (world.current)
        world.current.style.transform = `translate3d(${-m.x * 430}px,${-m.y * 230}px,0) rotateX(${m.y * 4}deg) rotateY(${-m.x * 7}deg)`;
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      motion.current.last = 0;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [open, grid, selected, leaving]);
  const choose = (item: Item, button: HTMLElement) => {
    cardOpener.current = button;
    setSelected(item);
  };
  const dismissDetail = () => {
    setSelected(null);
    requestAnimationFrame(() => cardOpener.current?.focus());
  };
  const items = aboutItems.filter((i) => i.panel === category);
  const partner = selected?.partnerId
    ? partners.find((p) => p.id === selected.partnerId)
    : null;
  const documentUrl = selected?.document
    ? selected.document.startsWith("https:")
      ? selected.document
      : assetUrl(selected.document)
    : null;
  return (
    <dialog
      ref={dialog}
      className={`observatory ${leaving ? "is-leaving" : ""} ${grid ? "is-grid" : "is-spatial"}`}
      aria-labelledby="observatory-title"
      onCancel={(e) => {
        e.preventDefault();
        selected ? dismissDetail() : leave();
      }}
    >
      {open && (
        <div className="observatory-shell" dir={rtl ? "rtl" : "ltr"}>
          <div className="observatory-lens" aria-hidden="true">
            <span className="lens-corner corner-left" />
            <span className="lens-corner corner-right" />
            <span className="lens-calibration">
              FAST / SPATIAL VIEW <i /> LIVE
            </span>
          </div>
          <header className="observatory-header">
            <img
              className="observatory-brand"
              src={assetUrl("fast-logo.png")}
              alt="FAST"
              width="150"
              height="50"
            />
            <div>
              <span className="observatory-eyebrow">
                {t("Your hall. A new layer.", "قاعتك. منظور جديد.")}
              </span>
              <h2 id="observatory-title">
                {t("The FAST Observatory", "مرصد فاست")}
              </h2>
            </div>
            <button className="observatory-language" onClick={onLanguage}>
              {rtl ? "English" : "عربي"}
            </button>
            <button
              className="observatory-exit"
              onClick={leave}
              disabled={leaving}
            >
              {t("Step away", "ابتعد عن المنظار")}{" "}
              <span className="direction-arrow" aria-hidden="true" />
            </button>
          </header>
          <nav
            className="observatory-nav"
            aria-label={t("Explore FAST", "استكشف فاست")}
            inert={selected ? true : undefined}
          >
            {categories.map((c) => (
              <button
                key={c.id}
                aria-pressed={category === c.id}
                onClick={() => change(c.id)}
              >
                <span>{c.count}</span>
                {rtl ? c.ar : c.en}
              </button>
            ))}
          </nav>
          <div
            className="observatory-viewport"
            tabIndex={grid ? -1 : 0}
            aria-label={t(
              "Move your pointer or use arrow keys to look around",
              "حرّك المؤشر أو استخدم الأسهم للنظر حولك",
            )}
            inert={selected ? true : undefined}
            onPointerMove={(e) => {
              if (grid || selected) return;
              if (e.pointerType === "touch" && e.buttons === 0) return;
              const r = e.currentTarget.getBoundingClientRect();
              motion.current.tx = Math.max(
                -1,
                Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1),
              );
              motion.current.ty = Math.max(
                -1,
                Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1),
              );
            }}
            onKeyDown={(e) => {
              if (grid) return;
              const m = motion.current;
              if (
                [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "Home",
                ].includes(e.key)
              ) {
                e.preventDefault();
                if (e.key === "Home") reset();
                else {
                  m.tx = Math.max(
                    -1,
                    Math.min(
                      1,
                      m.tx +
                        (e.key === "ArrowRight"
                          ? 0.25
                          : e.key === "ArrowLeft"
                            ? -0.25
                            : 0),
                    ),
                  );
                  m.ty = Math.max(
                    -1,
                    Math.min(
                      1,
                      m.ty +
                        (e.key === "ArrowDown"
                          ? 0.25
                          : e.key === "ArrowUp"
                            ? -0.25
                            : 0),
                    ),
                  );
                }
              }
            }}
          >
            {category === "story" ? (
              <section className="observatory-introduction">
                <span className="observatory-eyebrow">
                  {t(
                    "Dammam, Saudi Arabia · Since 2017",
                    "الدمام، المملكة العربية السعودية · منذ ٢٠١٧",
                  )}
                </span>
                <h3>
                  {t("Built on trust.", "مبنيّة على الثقة.")}
                  <br />
                  <em>{t("Connected by possibility.", "متصلة بالإمكانات.")}</em>
                </h3>
                <p>
                  {t(
                    "Engineering, operations and digital intelligence. Explore the credentials, industry relationships and global expertise behind FAST.",
                    "الهندسة والتشغيل والذكاء الرقمي. استكشف شهادات فاست وعلاقاتها الصناعية وخبراتها العالمية.",
                  )}
                </p>
                <div className="observatory-portals">
                  {categories.slice(1).map((c, i) => (
                    <button key={c.id} onClick={() => change(c.id)}>
                      <span
                        className={`portal-symbol symbol-${i}`}
                        aria-hidden="true"
                      >
                        {["◎", "⌘", "◌"][i]}
                      </span>
                      <strong>{rtl ? c.ar : c.en}</strong>
                      <span>
                        {c.count} {t("displays to explore", "عرضاً للاستكشاف")}{" "}
                        <span className="direction-arrow" aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <div
                ref={world}
                className="observatory-world"
                key={`${category}-${grid}`}
                style={grid ? { transform: "none" } : undefined}
              >
                {items.map((item, i) => {
                  const columns = items.length > 6 ? 5 : 3,
                    col = i % columns,
                    row = Math.floor(i / columns),
                    rows = Math.ceil(items.length / columns),
                    x = (col - (columns - 1) / 2) * 335,
                    y = (row - (rows - 1) / 2) * 245,
                    z = -80 - Math.abs(col - (columns - 1) / 2) * 70;
                  return (
                    <button
                      key={item.title}
                      className="observatory-card"
                      style={
                        grid
                          ? undefined
                          : {
                              transform: `translate3d(${x}px,${y}px,${z}px) translate(-50%,-50%)`,
                            }
                      }
                      onClick={(e) => choose(item, e.currentTarget)}
                      onFocus={() => {
                        if (!grid) {
                          motion.current.tx = Math.max(
                            -1,
                            Math.min(1, x / 600),
                          );
                          motion.current.ty = Math.max(
                            -1,
                            Math.min(1, y / 300),
                          );
                        }
                      }}
                    >
                      <span className="observatory-card-index">
                        {String(i + 1).padStart(2, "0")} /{" "}
                        {String(items.length).padStart(2, "0")}
                      </span>
                      <img
                        src={assetUrl(item.image)}
                        alt=""
                        loading="eager"
                        draggable={false}
                      />
                      <strong>{rtl ? item.ar : item.title}</strong>
                      <span className="observatory-card-action">
                        {t("Explore", "استكشف")}{" "}
                        <span className="direction-arrow" aria-hidden="true" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {selected && (
            <div className="observatory-detail-wrap">
              <section
                ref={detail}
                tabIndex={-1}
                className="observatory-detail"
                aria-labelledby="observatory-detail-title"
              >
                <button
                  className="observatory-detail-close"
                  onClick={dismissDetail}
                >
                  {t("Back to exploration", "العودة للاستكشاف")}{" "}
                  <span aria-hidden="true">×</span>
                </button>
                <img src={assetUrl(selected.image)} alt="" />
                <span className="observatory-eyebrow">
                  {rtl
                    ? categories.find((c) => c.id === category)?.ar
                    : categories.find((c) => c.id === category)?.en}
                </span>
                <h3 id="observatory-detail-title">
                  {rtl ? selected.ar : selected.title}
                </h3>
                <p>{rtl ? selected.noteAr : selected.note}</p>
                {selected.panel === "certifications" &&
                  selected.title.startsWith("ISO") && (
                    <p>
                      {t(
                        "Issued 27 October 2026. Current certificate expiry: 26 October 2027.",
                        "صادرة في ٢٧ أكتوبر ٢٠٢٦. انتهاء صلاحية الشهادة الحالية: ٢٦ أكتوبر ٢٠٢٧.",
                      )}
                    </p>
                  )}
                {documentUrl && (
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Open original certificate", "افتح الشهادة الأصلية")}{" "}
                    <span className="direction-arrow" aria-hidden="true" />
                  </a>
                )}
                {partner && (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Visit partner website", "زيارة موقع الشريك")}{" "}
                    <span className="direction-arrow" aria-hidden="true" />
                  </a>
                )}
                {selected.title === "Saudi Aramco" && (
                  <a
                    href="https://fast-arabia.com/assets/downloads/FAST-OandM-Saudi-Aramco-Vendor-Approval.pdf?v=20261101"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("View approval letter", "عرض خطاب الاعتماد")}{" "}
                    <span className="direction-arrow" aria-hidden="true" />
                  </a>
                )}
              </section>
            </div>
          )}
          <footer
            className="observatory-footer"
            inert={selected ? true : undefined}
          >
            <p>
              <i />
              {t(
                grid
                  ? "Select a display to explore."
                  : "Move your pointer to look around. Select a display to explore.",
                grid
                  ? "اختر عرضاً للاستكشاف."
                  : "حرّك المؤشر للنظر حولك. اختر عرضاً للاستكشاف.",
              )}
            </p>
            <div>
              <button onClick={reset}>{t("Center view", "توسيط العرض")}</button>
              <button
                aria-pressed={grid}
                onClick={() => {
                  setGrid(!grid);
                  reset();
                }}
              >
                {t(
                  grid ? "Explore in space" : "View as grid",
                  grid ? "استكشف في الفضاء" : "عرض كشبكة",
                )}
              </button>
            </div>
          </footer>
        </div>
      )}
    </dialog>
  );
}
