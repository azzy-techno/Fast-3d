import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import Lenis from "lenis";
import { Howl } from "howler";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { chapters, destinations } from "./data/chapters";
import { useTour } from "./store";
import { assetUrl } from "./lib/assets";
import { JourneyGuide } from "./components/JourneyGuide";

gsap.registerPlugin(useGSAP, ScrollTrigger);
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
  const [sound, setSound] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const audio = useRef<Howl | null>(null);
  const active = useTour((s) => s.active);
  const lastSoundChapter = useRef(active);
  const [percent, setPercent] = useState(0);
  const t = (en: string, ar: string) => (rtl ? ar : en);
  const sceneReady = useCallback(() => setReady(true), []);
  const sceneFailure = useCallback(() => {
    setFailed(true);
    setList(true);
    setReady(true);
  }, []);
  const loading = !list && (!ready || loaded < 3);

  useEffect(() => {
    let cancelled = false;
    const complete = () => {
      if (!cancelled) setLoaded((n) => n + 1);
    };
    document.fonts.ready.then(complete);
    [assetUrl("fast-logo.png"), assetUrl("cooling.webp")].forEach((src) => {
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
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    lenis.current = scroller;
    // Keep scroll duration tied to elapsed time even when rendering drops frames.
    // GSAP's lag-smoothed ticker time otherwise stretches Lenis navigation.
    const update = () => scroller.raf(performance.now());
    scroller.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
      scroller.destroy();
      lenis.current = null;
    };
  }, [list, reduced]);
  useEffect(() => {
    if (menu || loading) lenis.current?.stop();
    else lenis.current?.start();
    const previous = document.body.style.overflow;
    if (menu || loading) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menu, loading, list]);
  useEffect(() => {
    if (menu && !dialog.current?.open) dialog.current?.showModal();
    if (!menu && dialog.current?.open) dialog.current?.close();
  }, [menu]);

  useGSAP(
    () => {
      let stops: number[] = [];
      const copies = Array.from(
        document.querySelectorAll<HTMLElement>(".chapter-copy"),
      );
      const measure = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        stops = destinations.map((id, i) =>
          i === 12
            ? max
            : Math.max(0, document.getElementById(id)?.offsetTop ?? 0),
        );
      };
      const update = () => {
        if (!stops.length) return;
        const y = window.scrollY;
        let i = 0;
        while (i < stops.length - 2 && y >= stops[i + 1]) i++;
        const fraction = Math.max(
          0,
          Math.min(1, (y - stops[i]) / Math.max(1, stops[i + 1] - stops[i])),
        );
        useTour.getState().setProgress(Math.min(12, i + fraction));
        if (!list)
          copies.forEach((copy, index) => {
            const local = i + fraction - (index + 1);
            const opacity =
              local < 0 ? 1 : Math.max(0, Math.min(1, (0.3 - local) / 0.1));
            copy.style.opacity = String(opacity);
            copy.style.visibility = opacity < 0.01 ? "hidden" : "visible";
          });
        else
          copies.forEach((copy) => {
            copy.style.opacity = "";
            copy.style.visibility = "";
          });
        setPercent(
          Math.round(
            (y /
              Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight,
              )) *
              100,
          ),
        );
      };
      measure();
      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: update,
        onRefresh: () => {
          measure();
          update();
        },
      });
      const resize = new ResizeObserver(() => ScrollTrigger.refresh());
      if (main.current) resize.observe(main.current);
      ScrollTrigger.refresh();
      update();
      return () => {
        trigger.kill();
        resize.disconnect();
      };
    },
    { dependencies: [list, rtl], scope: main, revertOnUpdate: true },
  );

  useEffect(() => {
    const chapterChanged = lastSoundChapter.current !== active;
    lastSoundChapter.current = active;
    if (sound && chapterChanged && active > 0) {
      audio.current?.stop();
      audio.current?.play();
    }
  }, [active, sound]);
  useEffect(
    () => () => {
      audio.current?.unload();
    },
    [],
  );
  const toggleSound = () => {
    if (!audio.current)
      audio.current = new Howl({
        src: [assetUrl("chime.wav")],
        volume: 0.12,
        preload: true,
      });
    if (!sound) audio.current.play();
    else audio.current.stop();
    setSound(!sound);
  };
  const jump = (id: string) => {
    setMenu(false);
    const target = document.getElementById(id);
    if (!target) return;
    const y = Math.max(0, target.offsetTop);
    if (lenis.current) {
      lenis.current.start();
      lenis.current.scrollTo(y, { duration: 2.2, force: true });
    } else
      window.scrollTo({ top: y, behavior: reduced ? "instant" : "smooth" });
  };
  const toggleView = () => {
    if (list) setReady(false);
    setList((v) => !v);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      document
        .getElementById(destinations[active])
        ?.scrollIntoView({ block: "start" });
    });
  };

  return (
    <div
      className={`app ${list ? "list-view" : "tour-view"} ${rtl ? "rtl" : ""} ${active === 0 ? "at-arrival" : ""} ${cinematic && !list ? "cinematic" : ""}`}
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
      <div className="scene-scrim" aria-hidden="true" />
      {!list && !loading && (
        <JourneyGuide
          rtl={rtl}
          jump={jump}
          cinematic={cinematic}
          setCinematic={setCinematic}
        />
      )}
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
          <a className="partner-link" href={`${source}/partners`}>
            {t("Our partners", "شركاؤنا")}
          </a>
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

      <main id="main" ref={main}>
        <section
          className="hero"
          id="arrival"
          aria-labelledby="hero-title"
          data-chapter="0"
        >
          {list && (
            <img
              className="hero-photo"
              src={assetUrl("cooling.webp")}
              alt="Industrial engineering and equipment from FAST"
            />
          )}
          <div className="hero-topline">
            <p>
              {t(
                "One facility. Every possibility.",
                "منشأة واحدة. إمكانات متكاملة.",
              )}
            </p>
            <span>
              {t("Dammam, Saudi Arabia", "الدمام، المملكة العربية السعودية")}
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
                  "Engineering. Operations. Intelligence.\nConnected from the ground up.",
                  "الهندسة والتشغيل والذكاء.\nمترابطة من الأساس.",
                )}
              </p>
              <button className="enter-button" onClick={() => jump("cooling")}>
                {t(
                  list ? "Explore our capabilities" : "Scroll to step inside",
                  "استكشف إمكاناتنا",
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

        {chapters.map((chapter, i) => (
          <section
            className="chapter"
            id={chapter.id}
            key={chapter.id}
            aria-labelledby={`${chapter.id}-title`}
            data-chapter={i + 1}
            style={{ "--chapter-color": chapter.color } as React.CSSProperties}
          >
            <div className="chapter-copy">
              <p className="chapter-kicker">
                {t("THE CONNECTED BUILDING", "المبنى المترابط")}
                <span>{String(i + 1).padStart(2, "0")} / 11</span>
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
              <span>{i + 1} / 11</span>
              <span>{t("Explore the building", "استكشف المبنى")}</span>
            </div>
          </section>
        ))}

        <section
          className="closing"
          id="together"
          aria-labelledby="closing-title"
          data-chapter="12"
        >
          <div className="closing-content">
            <h2 id="closing-title">
              {t("Let’s engineer", "لنصنع")}
              <br />
              {t("what’s next.", "المستقبل معاً.")}
            </h2>
            <p>
              {t(
                "From the foundations to the intelligence within. Bring your next project to FAST Operations & Maintenance.",
                "من الأساسات إلى التقنيات الذكية. شارك مشروعك القادم مع FAST للتشغيل والصيانة.",
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
        </section>
      </main>

      <div
        className="tour-controls"
        aria-label={t("Experience controls", "أدوات التجربة")}
      >
        <div className="journey-label">
          <span className="live-dot" />
          <button onClick={() => setMenu(true)} aria-haspopup="dialog">
            {active === 0
              ? t("The arrival", "الوصول")
              : active === 12
                ? t("What’s next", "الخطوة التالية")
                : rtl
                  ? chapters[active - 1].ar
                  : chapters[active - 1].title}
          </button>
        </div>
        <nav
          className="chapter-track"
          aria-label={t("Jump to a chapter", "انتقل إلى فصل")}
        >
          {destinations.map((id, i) => (
            <button
              key={id}
              className={active === i ? "selected" : ""}
              aria-label={
                i === 0
                  ? t("Arrival", "الوصول")
                  : i === 12
                    ? t("Contact", "تواصل معنا")
                    : rtl
                      ? chapters[i - 1].ar
                      : chapters[i - 1].title
              }
              aria-current={active === i ? "step" : undefined}
              onClick={() => jump(id)}
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
            {t("Start at the entrance", "ابدأ من المدخل")}
            {arrow}
          </button>
          <div className="dialog-services">
            {chapters.map((chapter, i) => (
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

      <AnimatePresence>
        {loading && (
          <motion.div
            className="loader"
            key="loader"
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
            role="status"
            aria-live="polite"
          >
            <div className="loader-inner">
              <img
                src={assetUrl("fast-logo.png")}
                alt="FAST"
                width="180"
                height="52"
              />
              <p>
                {t(
                  "A world of engineering awaits.",
                  "عالم من الهندسة بانتظارك.",
                )}
              </p>
              <div className="loader-line">
                <motion.span
                  animate={{ scaleX: (loaded + (ready ? 1 : 0)) / 4 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="loader-label">
                {t(
                  ready
                    ? "Preparing your journey…"
                    : "Building your experience…",
                  "نجهّز تجربتك…",
                )}{" "}
                {Math.round(((loaded + (ready ? 1 : 0)) / 4) * 100)}%
              </span>
              <button onClick={() => setList(true)}>
                {t("Continue with the photo tour", "تابع الجولة المصوّرة")}
              </button>
            </div>
            <span className="loader-bottom">FAST Operations & Maintenance</span>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">
        {active > 0 && active < 12
          ? rtl
            ? chapters[active - 1].ar
            : chapters[active - 1].title
          : ""}
      </span>
    </div>
  );
}
