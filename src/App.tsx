import { galleries,isGallery } from "./scene/serviceGalleries";
import { OBSERVATORY_AT, OBSERVATORY_EXIT } from "./lib/observatoryView";
import { flushSync } from "react-dom";
import {
  EXTERIOR_ARRIVAL,
  floors,
  floorNumber,
  floorProgress,
  floorFraction,
  scrollRange,
  type Floor,
} from "./lib/journeyScroll";
import { Observatory } from "./components/Observatory";
import { ArrivalLoader } from "./components/ArrivalLoader";
import {
  AboutWelcome,
  AboutProjection,
  AboutList,
} from "./components/AboutFAST";
import type { AboutPanel } from "./data/about";
import { CoolingScope, CoolingTour } from "./components/CoolingTour";
import { ElectricalTour } from "./components/ElectricalTour";
import { ElectricalWelcome } from "./components/ElectricalWelcome";
import { LiftNavigator } from "./components/LiftNavigator";
import { ElectricalScope } from "./components/ElectricalScope";
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import Lenis from "lenis";
import { Howl } from "howler";
import { gsap } from "gsap";
import { chapters } from "./data/chapters";
import { useTour } from "./store";
import { assetUrl } from "./lib/assets";
import { ServiceSound } from "./lib/serviceSound";
import { JourneyGuide } from "./components/JourneyGuide";

const Experience = lazy(() => import("./scene/Experience"));
const source = "https://fast-arabia.com";
const arrow = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const down = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 4v16m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}

export default function App() {
  const [rtl, setRtl] = useState(false);
  const [cinematic, setCinematic] = useState(false);
  const [list, setList] = useState(
    () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      new URLSearchParams(window.location.search).get("view") === "list",
  );
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [menu, setMenu] = useState(false);
  const roofWalk = useTour(s => s.roofWalk);
  const walkingOnRoof = roofWalk !== "idle" && !list;
  const [liftOpen, setLiftOpen] = useState(false);
  const [pendingAbout, setPendingAbout] = useState<AboutPanel | null>(null);
  const aboutPanel = useTour((s) => s.aboutPanel);
  const observatoryOpen = useTour((s) => s.observatoryOpen);
  const observatoryPending = useTour((s) => s.observatoryPending);
  const beginObservatory = useTour((s) => s.beginObservatory);
  const setAboutPanel = useTour((s) => s.setAboutPanel);
  const replayFromOutside = useRef(false);
  const [liftDestination, setLiftDestination] = useState<string | null>(null);
  const liftRequest = useTour((s) => s.liftRequest);
  const [sound, setSound] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const audio = useRef<Howl | null>(null);
  const soundscapes = useRef<ServiceSound | null>(null);
  const [floor, setFloor] = useState(floors[0]);
  const galleryId=isGallery(floor.id) ? floor.id : null;
  const [listFloor, setListFloor] = useState(floors[0]);
  const currentFloor = list ? listFloor : floor;
  const orderedChapters = [...chapters.slice(1), chapters[0]];
  const floorScroll = (pose: number) =>
    floorFraction(floor, pose) * scrollRange();
  const [percent, setPercent] = useState(0);
  const t = (en: string, ar: string) => (rtl ? ar : en);
  let locationLabel = rtl ? currentFloor.ar : currentFloor.title;
  if (!list && floor.id === "reception") {
    if (percent < 28) locationLabel = t("Tower grounds", "ساحة البرج");
    else if (percent < 67) locationLabel = t("Visitor entrance", "مدخل الزوار");
  }
  const sceneReady = useCallback(() => setReady(true), []);
  const sceneFailure = useCallback(() => {
    setFailed(true);
    setList(true);
    setReady(true);
  }, []);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!ready || loaded < 3) {
      setRevealed(false);
      return;
    }
    const timer = window.setTimeout(() => setRevealed(true), 350);
    return () => window.clearTimeout(timer);
  }, [ready, loaded]);
  const loading = !list && !revealed;
  const visitLift = (destination: string | null) => {
    setMenu(false);
    setLiftDestination(destination);
    useTour.getState().setObservatory(false);
    if (!list && floor.id === "cooling") useTour.getState().setRoofWalk("toLift");
    else setLiftOpen(true);
  };
  const openLift = () => visitLift(null);
  useEffect(() => {
    if (roofWalk === "landed" && !list) setLiftOpen(true);
    if (list && roofWalk !== "idle") useTour.getState().setRoofWalk("idle");
  }, [roofWalk, list]);
  useEffect(() => {
    if (liftRequest) openLift();
  }, [liftRequest]);
  useEffect(() => {
    if (list) setLiftOpen(false);
  }, [list]);

  useEffect(() => {
    let cancelled = false;
    const complete = () => {
      if (!cancelled) setLoaded((n) => n + 1);
    };
    document.fonts.ready.then(complete);
    [assetUrl("fast-logo.png"), assetUrl("exterior/tower-arrival.webp")].forEach((src) => {
      const image = new Image();
      image.onload = complete;
      image.onerror = complete;
      image.src = src;
    });
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(query.matches);
      if (query.matches) setList(true);
    };
    query.addEventListener("change", change);
    return () => {
      cancelled = true;
      query.removeEventListener("change", change);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = rtl ? "ar" : "en";
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [rtl]);
  useEffect(() => {
    if (reduced || list) return;
    const scroller = new Lenis({
      lerp: 0.065,
      wheelMultiplier: 0.52,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    lenis.current = scroller;
    // Keep scroll duration tied to elapsed time even when rendering drops frames.
    // GSAP's lag-smoothed ticker time otherwise stretches Lenis navigation.
    const update = () => scroller.raf(performance.now());
    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
      scroller.destroy();
      lenis.current = null;
    };
  }, [list, reduced]);
  useEffect(() => {
    if (menu || loading || liftOpen || walkingOnRoof || aboutPanel || observatoryOpen)
      lenis.current?.stop();
    else lenis.current?.start();
    const previous = document.body.style.overflow;
    if (menu || loading || liftOpen || walkingOnRoof || aboutPanel || observatoryOpen)
      document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menu, loading, list, liftOpen, walkingOnRoof, aboutPanel, observatoryOpen]);
  useEffect(() => {
    if (menu && !dialog.current?.open) dialog.current?.showModal();
    if (!menu && dialog.current?.open) dialog.current?.close();
  }, [menu]);

  useLayoutEffect(
    () => {
      const copies = Array.from(
        document.querySelectorAll<HTMLElement>(".chapter-copy"),
      );
      let previousRange = scrollRange();
      let previousY = window.scrollY;
      const update = () => {
        const range = scrollRange();
        if (!list && range !== previousRange) {
          // Anchor the tour pose when rotation or browser chrome resizes a floor.
          const limit = document.documentElement.scrollHeight - innerHeight;
          // A visitor may also scroll during the resize. Preserve that input.
          if (Math.abs(window.scrollY - Math.min(previousY, limit)) <= 1) {
            const y = (Math.min(previousY, previousRange) / previousRange) * range
              + Math.max(0, previousY - previousRange);
            if (lenis.current) {
              lenis.current.resize();
              lenis.current.scrollTo(y, { immediate: true, force: true });
            } else window.scrollTo({ top: y, behavior: "instant" });
          }
          previousRange = range;
        }
        const fraction = Math.max(0, Math.min(1, window.scrollY / range));
        previousY = window.scrollY;
        if (list) {
          const current = [...floors].reverse().find((d) => {
            const el = document.getElementById(
              d.id === "reception" ? "arrival" : d.id,
            );
            return el && el.getBoundingClientRect().top <= innerHeight * 0.45;
          });
          setListFloor(current ?? floors[0]);
          copies.forEach((copy) => {
            copy.style.opacity = "";
            copy.style.visibility = "";
          });
        } else {
          const progress = floorProgress(floor, fraction);
          useTour.getState().setProgress(progress);
          const opacity =
            isGallery(floor.id)
              ? 0
              : Math.min(
                  1,
                  Math.max(
                    0,
                    (floor.id === "cooling"
                      ? 0.56 - fraction
                      : 0.78 - fraction) / 0.14,
                  ),
                );
          copies.forEach((copy) => {
            copy.style.opacity = String(opacity);
            copy.style.visibility = opacity < 0.01 ? "hidden" : "visible";
          });
        }
        setPercent(Math.round(fraction * 100));
      };
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      const resize = new ResizeObserver(update);
      if (main.current) resize.observe(main.current);
      update();
      return () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        resize.disconnect();
      };
    },
    [list, rtl, floor],
  );

  useEffect(() => {
    const engine = new ServiceSound();
    soundscapes.current = engine;
    const update = () => engine.update(useTour.getState().progress);
    const off = useTour.subscribe(update);
    const visibility = () => {
      if (document.hidden) engine.stop();
      else update();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      off();
      document.removeEventListener("visibilitychange", visibility);
      engine.dispose();
      audio.current?.unload();
    };
  }, []);
  useEffect(() => {
    soundscapes.current?.setEnabled(sound && !list && !observatoryOpen);
    soundscapes.current?.update(useTour.getState().progress);
  }, [sound, list, observatoryOpen]);
  const toggleSound = () => {
    if (!audio.current)
      audio.current = new Howl({
        src: [assetUrl("chime.wav")],
        volume: 0.12,
        preload: true,
      });
    if (!sound) audio.current.play();
    else {
      audio.current.stop();
      soundscapes.current?.setEnabled(false);
    }
    setSound(!sound);
  };
  const jump = (id: string) => {
    replayFromOutside.current = id === "arrival";
    if (id === "arrival") id = "reception";
    setMenu(false);
    if (!list && !loading && floors.some((d) => d.id === id)) {
      visitLift(id);
      return;
    }
    const target = document.getElementById(id === "reception" ? "arrival" : id);
    if (!target) return;
    const y = Math.max(0, target.offsetTop);
    if (lenis.current) {
      lenis.current.start();
      lenis.current.scrollTo(y, { duration: 2.2, force: true });
    } else
      window.scrollTo({ top: y, behavior: reduced ? "instant" : "smooth" });
  };
  const scrollToProgress = (at: number, immediate = false, duration = 1.8) => {
    const y = floorScroll(at);
    if (lenis.current)
      lenis.current.scrollTo(y, { immediate, force: true, duration });
    else window.scrollTo({ top: y, behavior: "instant" });
    if (immediate) useTour.getState().teleport(at);
  };
  useEffect(() => {
    if (observatoryPending) {
      if (lenis.current)
        lenis.current.scrollTo(floorScroll(OBSERVATORY_AT), {
          duration: useTour.getState().progress >= 1.588 ? 3.2 : 9,
          force: true,
          lock: true,
        });
      else scrollToProgress(OBSERVATORY_AT, true);
    }
  }, [observatoryPending]);
  const closeObservatory = () => {
    useTour.getState().setObservatory(false);
    if (lenis.current) {
      // Resume before starting the return: Lenis.start() resets its animation.
      lenis.current.start();
      lenis.current.scrollTo(floorScroll(OBSERVATORY_EXIT), {
        duration: 2.2,
        force: true,
        lock: true,
      });
    } else scrollToProgress(OBSERVATORY_EXIT, true);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>(".lift-toggle")
        ?.focus({ preventScroll: true }),
    );
  };
  const showAbout = (panel: AboutPanel) => {
    setMenu(false);
    const p = useTour.getState().progress;
    if (list || (p >= 1.51 && p < 1.735)) {
      setAboutPanel(panel);
      return;
    }
    setPendingAbout(panel);
    visitLift("about");
  };
  const toggleView = () => {
    const dest = currentFloor;
    if (list) {
      setReady(false);
      flushSync(() => {
        setFloor(dest);
        setList(false);
      });
      window.scrollTo({ top: 0, behavior: "instant" });
      useTour.getState().teleport(dest.id === "reception" ? EXTERIOR_ARRIVAL : dest.start);
    } else {
      flushSync(() => setList(true));
      document
        .getElementById(dest.id === "reception" ? "arrival" : dest.id)
        ?.scrollIntoView({ block: "start" });
    }
  };

  return (
    <div
      className={`app ${walkingOnRoof ? "roof-lift-walk" : ""} ${observatoryOpen ? "observatory-active" : ""} ${list ? "list-view" : "tour-view"} ${rtl ? "rtl" : ""} ${currentFloor.id === "reception" ? "at-arrival" : ""} ${cinematic && !list ? "cinematic" : ""}`}
    >
      <a className="skip-link" href="#main">
        {t("Skip to content", "انتقل إلى المحتوى")}
      </a>
      {!list && (
        <SceneBoundary onFailure={sceneFailure}>
          <Suspense fallback={null}>
            <Experience
              onReady={sceneReady}
              onFailure={sceneFailure}
              rtl={rtl}
            />
          </Suspense>
        </SceneBoundary>
      )}
      <Observatory
        rtl={rtl}
        onClose={closeObservatory}
        onLanguage={() => setRtl(!rtl)}
      />
      <div
        id="optical-transition"
        className="optical-transition"
        aria-hidden="true"
      >
        <span />
        <span />
      </div>
      <div
        className="scene-scrim"
        aria-hidden="true"
        style={!list && floor.id === "reception" && percent > 16 ? { opacity: 0.25 } : undefined}
      />
      {!list && !loading && (
        <>
          <AboutWelcome
            rtl={rtl}
            onContinue={beginObservatory}
            onLift={openLift}
          />

          {floor.id === "cooling" && !walkingOnRoof && <CoolingTour rtl={rtl} onLift={openLift} onSelect={(at) => scrollToProgress(at, false, at === 0.55 ? 5 : 2.4)} />}
          {galleryId && <>
            <ElectricalWelcome key={galleryId} service={galleryId} rtl={rtl}
              onProjects={galleries[galleryId].projectStart ? () => scrollToProgress(galleries[galleryId].stations[galleries[galleryId].projectStart-1].at+.005,true) : undefined}
              onVisit={(at) => scrollToProgress(at,true)}
              onEnter={() => scrollToProgress(galleries[galleryId].stations[0].at+.005)} onLift={openLift}/>
            <ElectricalTour service={galleryId} rtl={rtl} onSelect={scrollToProgress}/>
          </>}
          <JourneyGuide
            key={floor.id}
            floor={floor}
            locationLabel={locationLabel}
            rtl={rtl}
            jump={jump}
            cinematic={cinematic}
            setCinematic={setCinematic}
            openLift={openLift}
          />
        </>
      )}
      {walkingOnRoof && !liftOpen && <div className="roof-walk-status" role="status">
        {roofWalk === "toExhibit" ? t("Returning to the rooftop tour", "العودة إلى جولة السطح") : t("Following your guide to the lift", "رافق المرشد إلى المصعد")}
      </div>}
      <header className="header">
        <a
          className="brand"
          href="#arrival"
          onClick={(e) => {
            e.preventDefault();
            jump("arrival");
          }}
          aria-label="FAST home"
        >
          <img
            src={assetUrl("fast-logo.png")}
            alt="FAST Operations & Maintenance"
            width="145"
            height="42"
          />
        </a>
        <nav
          className="header-nav"
          aria-label={t("Main navigation", "القائمة الرئيسية")}
        >
          <button onClick={() => setMenu(true)} aria-haspopup="dialog">
            {t("Explore services", "استكشف الخدمات")}
            <span className="menu-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
          <button
            className="partner-link"
            onClick={() => showAbout("partners")}
            aria-haspopup="dialog"
          >
            {t("Our partners", "شركاؤنا")}
          </button>
        </nav>
        <div className="header-actions">
          <button
            className="language"
            lang={rtl ? "en" : "ar"}
            onClick={() => setRtl(!rtl)}
            aria-label={rtl ? "Switch to English" : "التبديل إلى العربية"}
          >
            {rtl ? "EN" : "عربي"}
          </button>
          <a className="contact-link" href={`${source}/contact?type=rfq`}>
            {t("Let’s talk", "لنتحدث")}
            {arrow}
          </a>
        </div>
      </header>

      <main id="main" ref={main} data-floor={currentFloor.id}>
        {(list || floor.id === "reception") && (
          <div className="reception-approach">
            <section
              className="hero"
              id="arrival"
              aria-labelledby="hero-title"
              data-chapter="0"
            >
              {list && (
                <img
                  className="hero-photo"
                  src={assetUrl("exterior/tower-arrival.webp")}
                  alt={t("FAST Tower and its visitor entrance", "برج فاست ومدخل الزوار")}
                />
              )}
              <div className="hero-topline">
                <p>
                  {t("FAST Tower · Visitor entrance", "برج فاست · مدخل الزوار")}
                </p>
                <span>
                  {t(
                    "Dammam, Saudi Arabia",
                    "الدمام، المملكة العربية السعودية",
                  )}
                </span>
              </div>
              <div className="hero-content">
                <h1 id="hero-title">
                  {rtl ? (
                    <>
                      <span>هندسة تدعم ركائز</span>
                      <span>الصناعة السعودية.</span>
                    </>
                  ) : (
                    <>
                      <span>Engineering the backbone</span>
                      <span>of Saudi industry.</span>
                    </>
                  )}
                </h1>
                <div className="hero-bottom">
                  <p>
                    {t(
                      list ? "Explore the services engineered inside FAST Tower." : "Scroll through the main gate to reception. Your engineer will guide you to the lifts.",
                      list ? "استكشف الخدمات الهندسية داخل برج فاست." : "مرّ عبر البوابة الرئيسية إلى الاستقبال، ثم رافق مهندس فاست إلى المصاعد.",
                    )}
                  </p>
                  <button
                    className="enter-button"
                    onClick={() => (list ? jump("about") : scrollToProgress(11.89))}
                  >
                    {t(
                      list ? "Discover FAST" : "Approach the gate",
                      list ? "اكتشف فاست" : "توجّه إلى البوابة",
                    )}
                    <span>{down}</span>
                  </button>
                </div>
              </div>
              <p className="scene-note">
                {t(
                  "An architectural vision of our capabilities",
                  "تصوّر معماري لإمكاناتنا",
                )}
              </p>
            </section>
          </div>
        )}
        {list && (
          <div id="about">
            <AboutList rtl={rtl} onOpen={showAbout} />
          </div>
        )}
        {orderedChapters
          .filter((c) => list || c.id === floor.id)
          .map((chapter) => (
              <section
                className="chapter"
                id={chapter.id}
                key={chapter.id}
                aria-labelledby={`${chapter.id}-title`}
                data-chapter={chapters.indexOf(chapter) + 1}
                style={
                  { "--chapter-color": chapter.color } as React.CSSProperties
                }
              >
                <div className="chapter-copy">
                  <p className="chapter-kicker">
                    {t("THE CONNECTED BUILDING", "المبنى المترابط")}
                    <span>
                      {chapter.id === "cooling" ? t("Roof", "السطح") : t("Floor", "الطابق") + " " + floorNumber(chapter.id)}
                    </span>
                  </p>
                  <h2 id={`${chapter.id}-title`}>
                    <a href={chapter.href}>
                      {rtl ? chapter.ar : chapter.title}
                      <span className="heading-arrow">{arrow}</span>
                    </a>
                  </h2>
                  <p className="chapter-place">
                    <span />
                    {rtl ? chapter.placeAr : chapter.place}
                  </p>
                  <p className="chapter-description">
                    {rtl ? chapter.descriptionAr : chapter.description}
                  </p>
                  {!rtl && (
                    <ul
                      className="capabilities"
                      aria-label={`${chapter.title} capabilities`}
                    >
                      {chapter.capabilities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {chapter.id === "cooling" && list && <CoolingScope rtl={rtl} />}
                  {isGallery(chapter.id) && list && (
                    <ElectricalScope service={chapter.id} rtl={rtl} />
                  )}
                  <a className="service-link" href={chapter.href}>
                    {t("Explore this service", "استكشف هذه الخدمة")}
                    {arrow}
                  </a>
                  <figure className="source-photo">
                    <img
                      src={assetUrl(chapter.image)}
                      alt={chapter.imageAlt}
                      loading="lazy"
                      width="640"
                      height="380"
                    />
                    <figcaption>
                      {t("From the FAST service portfolio.", "من خدمات FAST.")}
                    </figcaption>
                  </figure>
                </div>
                <div className="chapter-location" aria-hidden="true">
                  <span>{floorNumber(chapter.id)}</span>
                  <span>{t("Explore the building", "استكشف المبنى")}</span>
                </div>
              </section>
          ))}

        {!list && floor.id === "about" && (
          <section
            id="about-hall"
            className="about-hall-scroll"
            aria-label={t("About FAST", "عن فاست")}
          />
        )}
        {(list || floor.id === "cooling") && (
          <section
            className="closing"
            id="together"
            aria-labelledby="closing-title"
            data-chapter={orderedChapters.length + 1}
          >
            <div className="closing-content">
              <h2 id="closing-title">
                {t("Let’s engineer", "لنصنع")}
                <br />
                {t("what’s next.", "المستقبل معاً.")}
              </h2>
              <p>
                {t(
                  "Bring your next project to FAST Operations & Maintenance.",
                  "شارك مشروعك القادم مع فاست للتشغيل والصيانة.",
                )}
              </p>
              <a className="primary-link" href={`${source}/contact?type=rfq`}>
                {t("Discuss your project", "ناقش مشروعك")}
                {arrow}
              </a>
              <button className="replay-tour" onClick={() => jump("arrival")}>
                {t("Replay the journey", "إعادة الجولة")}{" "}
                <span aria-hidden="true">↺</span>
              </button>
            </div>
            <details className="closing-contacts" open={list || undefined}>
              <summary>
                {t("Contact & company details", "التواصل وبيانات الشركة")}
              </summary>
              <div className="credentials">
                <span>
                  {t("ISO 9001 · 14001 · 45001", "ISO 9001 · 14001 · 45001")}
                </span>
                <span>
                  {t(
                    "Saudi Aramco registered vendor",
                    "مورد مسجل لدى أرامكو السعودية",
                  )}
                </span>
              </div>
              <footer>
                <div>
                  <img
                    src={assetUrl("fast-logo.png")}
                    alt="FAST"
                    width="110"
                    height="32"
                  />
                  <p>{t("Operations & Maintenance", "التشغيل والصيانة")}</p>
                </div>
                <div>
                  <a href="mailto:info@fast-arabia.com">info@fast-arabia.com</a>
                  <a href="tel:+966138311137" dir="ltr">
                    +966 13 831 1137
                  </a>
                </div>
                <div>
                  <a href={`${source}/contact`}>
                    {t("Find us in Dammam", "موقعنا في الدمام")}
                    {arrow}
                  </a>
                  <p>© {new Date().getFullYear()} FAST</p>
                  <a
                    className="asset-credit"
                    href={assetUrl("interior/ATTRIBUTION.txt")}
                  >
                    {t("3D asset credits", "حقوق النماذج ثلاثية الأبعاد")}
                  </a>
                </div>
              </footer>
            </details>
          </section>
        )}
      </main>

      <div
        className="tour-controls"
        aria-label={t("Experience controls", "أدوات التجربة")}
      >
        <div className="journey-label">
          <span className="live-dot" />
          <button onClick={() => setMenu(true)} aria-haspopup="dialog">
            {locationLabel}
          </button>
        </div>
        <nav
          className="chapter-track"
          aria-label={t("Jump to a chapter", "انتقل إلى فصل")}
        >
          {floors.map((d) => (
            <button
              key={d.id}
              className={currentFloor.id === d.id ? "selected" : ""}
              aria-label={rtl ? d.ar : d.title}
              aria-current={currentFloor.id === d.id ? "step" : undefined}
              onClick={() => jump(d.id)}
            >
              <span />
            </button>
          ))}
        </nav>
        <div className="control-actions">
          <span
            className="progress-label"
            aria-label={`${percent}% ${t("through the page", "من الصفحة")}`}
          >
            {percent}%
          </span>
          <button
            className="sound-button"
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={t(
              sound ? "Turn sound off" : "Turn sound on",
              sound ? "إيقاف الصوت" : "تشغيل الصوت",
            )}
          >
            <span
              className={`sound-wave ${sound ? "playing" : ""}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              {t(
                sound ? "Sound on" : "Sound off",
                sound ? "الصوت يعمل" : "الصوت مغلق",
              )}
            </span>
          </button>
          <button
            className="view-button"
            onClick={toggleView}
            disabled={failed}
          >
            {t(
              list ? "3D view" : "List view",
              list ? "عرض ثلاثي الأبعاد" : "عرض القائمة",
            )}
          </button>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
      </div>
      {failed && (
        <p className="fallback-message" role="status">
          {t(
            "Showing the photo tour. All services are available below.",
            "نعرض الجولة المصورة. جميع الخدمات متاحة أدناه.",
          )}
        </p>
      )}

      <dialog
        ref={dialog}
        className="chapter-dialog"
        onCancel={() => setMenu(false)}
        onClose={() => setMenu(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenu(false);
        }}
        aria-labelledby="menu-title"
        data-lenis-prevent
      >
        <div className="dialog-inner">
          <div className="dialog-top">
            <p id="menu-title">{t("Explore the building", "استكشف المبنى")}</p>
            <button
              onClick={() => setMenu(false)}
              className="close-menu"
              aria-label={t("Close services menu", "أغلق قائمة الخدمات")}
            >
              ×
            </button>
          </div>
          <button className="dialog-arrival" onClick={() => jump("arrival")}>
            {t("Start outside the tower", "ابدأ من خارج البرج")}
            {arrow}
          </button>
          <div className="dialog-services">
            {floors.slice(1).map((chapter, i) => (
              <button key={chapter.id} onClick={() => jump(chapter.id)}>
                <span className="dialog-number">{i + 1}</span>
                <span>{rtl ? chapter.ar : chapter.title}</span>
                {arrow}
              </button>
            ))}
          </div>
          <a className="dialog-contact" href={`${source}/contact?type=rfq`}>
            {t("Have a project? Let’s talk.", "لديك مشروع؟ لنتحدث.")}
            {arrow}
          </a>
        </div>
      </dialog>
      <AboutProjection rtl={rtl} />
      <LiftNavigator
        open={liftOpen}
        currentFloor={floor.id}
        initialDestination={liftDestination}
        rtl={rtl}
        onClose={() => {
          setLiftOpen(false);
          setLiftDestination(null);
          if (useTour.getState().roofWalk === "landed") useTour.getState().setRoofWalk("toExhibit");
          if (pendingAbout) {
            setAboutPanel(pendingAbout);
            setPendingAbout(null);
          }
        }}
        onArrive={(dest) => {
          flushSync(() => setFloor(dest));
          const at = dest.id === "reception" && replayFromOutside.current ? EXTERIOR_ARRIVAL : dest.start;
          replayFromOutside.current = false;
          const top = floorFraction(dest, at) * scrollRange();
          lenis.current?.resize();
          if (lenis.current)
            lenis.current.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo({ top, behavior: "instant" });
          useTour.getState().teleport(at);
        }}
      />

      <AnimatePresence>
        {loading && (
          <ArrivalLoader
            key="loader"
            rtl={rtl}
            ready={ready}
            loaded={loaded}
            onSkip={() => setList(true)}
          />
        )}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">
        {locationLabel}
      </span>
    </div>
  );
}
