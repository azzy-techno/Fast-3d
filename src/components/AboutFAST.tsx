import { useEffect, useRef, useState } from "react";
import {
  aboutTabs,
  certifications,
  credentials,
  registrations,
  additionalVendors,
  partners,
  type AboutPanel,
} from "../data/about";
import { useTour } from "../store";
import { assetUrl } from "../lib/assets";
import "./about.css";

function ProjectionArrow() {
  return (
    <svg
      className="projection-arrow"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function AboutWelcome({
  rtl,
  onContinue,
  onLift,
}: {
  rtl: boolean;
  onContinue: () => void;
  onLift: () => void;
}) {
  const visible = useTour((s) => s.progress >= 1.51 && s.progress < 1.735);
  const pending = useTour((s) => s.observatoryPending);
  if (!visible) return null;
  return (
    <aside
      className="about-welcome"
      aria-label={rtl ? "مرصد فاست" : "FAST Observatory"}
    >
      <span className="about-eyebrow">
        12 / {rtl ? "مرصد فاست" : "THE FAST OBSERVATORY"}
      </span>
      <h2>{rtl ? "اقترب. واكتشف المزيد." : "Look closer. Discover more."}</h2>
      <p>
        {rtl
          ? "رافق مهندس فاست إلى المنظار في وسط القاعة. استكشف شهاداتنا وعلاقاتنا الصناعية وشركاءنا من منظورك الخاص."
          : "Follow your FAST engineer to the binoculars at the heart of the hall. Step into a new perspective on our credentials, industry relationships and partners."}
      </p>
      <button
        className="about-continue"
        disabled={pending}
        onClick={onContinue}
      >
        {rtl
          ? pending
            ? "نقترب من المنظار…"
            : "انظر عبر المنظار"
          : pending
            ? "Approaching the binoculars…"
            : "Look through the binoculars"}{" "}
        <span aria-hidden="true">◎</span>
      </button>
      <button className="observatory-skip" onClick={onLift}>
        {rtl ? "اختر طابق الخدمات" : "Choose a service floor"}{" "}
        <span className="direction-arrow" aria-hidden="true" />
      </button>
    </aside>
  );
}

export function AboutProjection({ rtl }: { rtl: boolean }) {
  const panel = useTour((s) => s.aboutPanel),
    setPanel = useTour((s) => s.setAboutPanel);
  const dialog = useRef<HTMLDialogElement>(null),
    body = useRef<HTMLDivElement>(null),
    opener = useRef<HTMLElement | null>(null);
  const selected = useTour((s) => s.aboutPartner),
    setSelected = useTour((s) => s.setAboutPartner);
  const [filter, setFilter] = useState("");
  const t = (en: string, ar: string) => (rtl ? ar : en);
  useEffect(() => {
    if (panel && !dialog.current?.open) {
      opener.current = document.activeElement as HTMLElement;
      if (
        opener.current === document.body ||
        opener.current.closest(".lift-dialog")
      )
        opener.current =
          document.querySelector(`[data-about-open="${panel}"]`) ||
          document.querySelector(".partner-link");
      dialog.current?.showModal();
    } else if (!panel && dialog.current?.open) {
      dialog.current.close();
      opener.current?.focus();
    }
  }, [panel]);
  useEffect(() => {
    body.current?.scrollTo(0, 0);
  }, [panel]);
  const partner = partners.find((p) => p.id === selected)!;
  const visiblePartners = partners.filter((p) =>
    [p.name, p.country, p.description, p.arName, p.arCountry, p.arDescription]
      .join(" ")
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  return (
    <dialog
      ref={dialog}
      className="about-projection"
      data-lenis-prevent
      aria-labelledby="projection-title"
      onCancel={(e) => {
        e.preventDefault();
        setPanel(null);
      }}
      onClick={(e) => {
        if (e.target === dialog.current) setPanel(null);
      }}
    >
      {panel && (
        <div className="projection-shell">
          <div className="projection-beam" aria-hidden="true" />
          <div className="projection-orbit" aria-hidden="true" />
          <header className="projection-header">
            <div>
              <span className="about-eyebrow">
                FAST / {t("KNOWLEDGE GALLERY", "معرض المعرفة")}
              </span>
              <h2 id="projection-title">
                {t("Engineering the backbone", "هندسة الركيزة الأساسية")}
                <em>{t("of Saudi industry.", "للصناعة السعودية.")}</em>
              </h2>
            </div>
            <button
              className="projection-close"
              aria-label={t("Close projection", "إغلاق العرض")}
              onClick={() => setPanel(null)}
            >
              ×
            </button>
          </header>
          <div
            className="projection-tabs"
            role="tablist"
            aria-label={t("Explore FAST", "استكشف فاست")}
            onKeyDown={(e) => {
              const index = aboutTabs.findIndex((x) => x.id === panel);
              let next = index;
              if (e.key === "Home") next = 0;
              else if (e.key === "End") next = 3;
              else if (e.key === "ArrowRight")
                next = (index + (rtl ? 3 : 1)) % 4;
              else if (e.key === "ArrowLeft")
                next = (index + (rtl ? 1 : 3)) % 4;
              else return;
              e.preventDefault();
              setPanel(aboutTabs[next].id);
              dialog.current
                ?.querySelector<HTMLButtonElement>(
                  `#about-tab-${aboutTabs[next].id}`,
                )
                ?.focus();
            }}
          >
            {aboutTabs.map((tab) => (
              <button
                key={tab.id}
                id={`about-tab-${tab.id}`}
                role="tab"
                aria-selected={panel === tab.id}
                aria-controls="about-panel"
                tabIndex={panel === tab.id ? 0 : -1}
                onClick={() => setPanel(tab.id)}
              >
                <span>{tab.number}</span>
                {rtl ? tab.ar : tab.en}
              </button>
            ))}
          </div>
          <div
            className="projection-content"
            id="about-panel"
            ref={body}
            role="tabpanel"
            aria-labelledby={`about-tab-${panel}`}
            tabIndex={0}
          >
            {panel === "story" && (
              <div className="about-story">
                <div className="story-statement">
                  <span className="about-eyebrow">
                    {t(
                      "EST. 2017 / DAMMAM, SAUDI ARABIA",
                      "تأسست عام 2017 / الدمام، السعودية",
                    )}
                  </span>
                  <h3>
                    {t("One connected capability.", "قدرات مترابطة.")}
                    <em>
                      {t(
                        "From engineering to intelligence.",
                        "من الهندسة إلى الذكاء.",
                      )}
                    </em>
                  </h3>
                  <p>
                    {t(
                      "FAST Operations & Maintenance delivers integrated engineering and industrial solutions across Saudi Arabia. We bring contracting, operations, maintenance and digital technology together throughout the asset lifecycle.",
                      "تقدم فاست للتشغيل والصيانة حلولاً هندسية وصناعية متكاملة في المملكة العربية السعودية. نجمع المقاولات والتشغيل والصيانة والتقنيات الرقمية على امتداد دورة حياة الأصول.",
                    )}
                  </p>
                  <div className="story-facts">
                    <div>
                      <b>2017</b>
                      <span>{t("Established", "سنة التأسيس")}</span>
                    </div>
                    <div>
                      <b>13</b>
                      <span>{t("Technology partners", "شركاء التقنية")}</span>
                    </div>
                    <div>
                      <b>3</b>
                      <span>
                        {t("ISO management systems", "أنظمة إدارة ISO")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="story-pillars">
                  {[
                    [
                      "01",
                      "Engineering & O&M",
                      "الهندسة والتشغيل والصيانة",
                      "Electrical, mechanical, civil, fabrication, fire protection and IT contracting.",
                      "المقاولات الكهربائية والميكانيكية والمدنية والتصنيع والحماية من الحرائق وتقنية المعلومات.",
                    ],
                    [
                      "02",
                      "Technology & digital",
                      "التقنية والحلول الرقمية",
                      "Industrial automation, 3D scanning, digital twins and ERP solutions.",
                      "الأتمتة الصناعية والمسح ثلاثي الأبعاد والتوائم الرقمية وحلول تخطيط موارد المؤسسات.",
                    ],
                    [
                      "03",
                      "Built for the Kingdom",
                      "من أجل المملكة",
                      "Supporting industrial growth, localisation and sustainable development, aligned with Saudi Vision 2030.",
                      "دعم النمو الصناعي والتوطين والتنمية المستدامة بما يتماشى مع رؤية السعودية 2030.",
                    ],
                  ].map(([n, en, ar, desc, arDesc]) => (
                    <article key={n}>
                      <span>{n}</span>
                      <div>
                        <h4>{t(en, ar)}</h4>
                        <p>{t(desc, arDesc)}</p>
                      </div>
                    </article>
                  ))}
                  <a
                    href="https://fast-arabia.com/assets/downloads/FAST-OandM-Company-Profile.pdf?v=20261101"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Explore the company profile", "استعرض ملف الشركة")}{" "}
                    <ProjectionArrow />
                  </a>
                </div>
              </div>
            )}
            {panel === "certifications" && (
              <>
                <div className="projection-section-title">
                  <div>
                    <span className="about-eyebrow">
                      {t(
                        "ASSURANCE / MANAGEMENT SYSTEMS",
                        "الضمان / أنظمة الإدارة",
                      )}
                    </span>
                    <h3>
                      {t(
                        "Standards behind every project.",
                        "معايير تدعم كل مشروع.",
                      )}
                    </h3>
                  </div>
                  <p>
                    {t(
                      "Issued by ANS System Certification · 27 October 2026",
                      "صادرة عن ANS System Certification · 27 أكتوبر 2026",
                    )}
                  </p>
                </div>
                <div className="certificate-grid">
                  {certifications.map((c) => (
                    <a
                      className="certificate-card"
                      key={c.code}
                      href={assetUrl(`about/certificates/iso-${c.code}.pdf`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="certificate-preview">
                        <img
                          src={assetUrl(
                            `about/certificates/iso-${c.code}.webp`,
                          )}
                          alt={t(
                            `FAST ISO ${c.code}:${c.edition} certificate`,
                            `شهادة فاست ISO ${c.code}:${c.edition}`,
                          )}
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <span className="about-eyebrow">
                          ISO {c.code}:{c.edition}
                        </span>
                        <h4>{rtl ? c.ar : c.name}</h4>
                        <p className="certificate-number" dir="ltr">
                          {c.number}
                        </p>
                        <p>
                          {t(
                            "Valid until 26 October 2027",
                            "سارية حتى 26 أكتوبر 2027",
                          )}
                        </p>
                        <b>
                          {t("Open certificate PDF", "فتح الشهادة PDF")}{" "}
                          <ProjectionArrow />
                        </b>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="credential-links">
                  {credentials.map((c) => (
                    <a
                      key={c.name}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <strong>{rtl ? c.ar : c.name}</strong>
                        <small>{rtl ? c.arDetail : c.detail}</small>
                      </span>
                      <ProjectionArrow />
                    </a>
                  ))}
                </div>
                <p className="projection-note">
                  {t(
                    "Commercial Registration, CCC, GOSI and ZATCA credentials are available on request.",
                    "شهادات السجل التجاري وCCC والتأمينات الاجتماعية وهيئة الزكاة والضريبة والجمارك متاحة عند الطلب.",
                  )}{" "}
                  <a
                    href="https://fast-arabia.com/downloads"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("All company documents", "جميع مستندات الشركة")}{" "}
                    <ProjectionArrow />
                  </a>
                </p>
              </>
            )}
            {panel === "approvals" && (
              <>
                <div className="projection-section-title">
                  <div>
                    <span className="about-eyebrow">
                      {t(
                        "QUALIFICATIONS / SUPPLIER NETWORK",
                        "المؤهلات / شبكة الموردين",
                      )}
                    </span>
                    <h3>
                      {t(
                        "Connected to Saudi industry.",
                        "متصلون بالصناعة السعودية.",
                      )}
                    </h3>
                  </div>
                  <p>
                    {t(
                      "Selected approvals and supplier portal registrations from the FAST company profile.",
                      "اعتمادات وتسجيلات مختارة في بوابات الموردين من ملف شركة فاست.",
                    )}
                  </p>
                </div>
                <div className="registration-grid">
                  {registrations.map((r, i) => (
                    <article key={r.name}>
                      <span className="registration-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <img
                        className="registration-logo"
                        src={assetUrl(r.logo)}
                        alt=""
                        width="160"
                        height="72"
                        loading="lazy"
                      />
                      <h4>{rtl ? r.ar : r.name}</h4>
                      <p>
                        {rtl
                          ? r.arDetail || "تسجيل في بوابة الموردين"
                          : r.detail || "Supplier portal registration"}
                      </p>
                      {i === 0 && (
                        <a
                          href="https://fast-arabia.com/assets/downloads/FAST-OandM-Saudi-Aramco-Vendor-Approval.pdf?v=20261101"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("View approval letter", "عرض خطاب الاعتماد")}{" "}
                          <ProjectionArrow />
                        </a>
                      )}
                    </article>
                  ))}
                </div>
                <details className="other-vendors">
                  <summary>
                    {t(
                      "More vendor registrations in our company profile",
                      "تسجيلات إضافية للموردين في ملف الشركة",
                    )}{" "}
                    <span>+</span>
                  </summary>
                  <ul>
                    {additionalVendors.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </details>
              </>
            )}
            {panel === "partners" && (
              <>
                <div className="projection-section-title">
                  <div>
                    <span className="about-eyebrow">
                      {t(
                        "13 PARTNERS / ONE LOCAL DELIVERY PLATFORM",
                        "13 شريكاً / منصة تنفيذ محلية واحدة",
                      )}
                    </span>
                    <h3>
                      {t(
                        "Global technology. Delivered locally.",
                        "خبرات عالمية أمامك.",
                      )}
                    </h3>
                  </div>
                  <label className="partner-search">
                    <span>{t("Find a partner", "ابحث عن شريك")}</span>
                    <input
                      type="search"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder={t(
                        "Name, country or capability",
                        "الاسم أو الدولة أو التخصص",
                      )}
                    />
                  </label>
                </div>
                <div className="partner-network">
                  <div className="partner-grid">
                    {visiblePartners.map((p) => (
                      <button
                        className="partner-tile"
                        key={p.id}
                        onClick={() => {
                          setSelected(p.id);
                          if (window.innerWidth <= 600)
                            requestAnimationFrame(() =>
                              dialog.current
                                ?.querySelector(".partner-detail")
                                ?.scrollIntoView({
                                  block: "start",
                                  behavior: window.matchMedia(
                                    "(prefers-reduced-motion: reduce)",
                                  ).matches
                                    ? "instant"
                                    : "smooth",
                                }),
                            );
                        }}
                        aria-pressed={selected === p.id}
                      >
                        <span className="partner-logo">
                          <img src={assetUrl(p.logo)} alt="" loading="lazy" />
                        </span>
                        <strong>{rtl ? p.arName : p.name}</strong>
                        <small>{rtl ? p.arCountry : p.country}</small>
                      </button>
                    ))}
                    {!visiblePartners.length && (
                      <p role="status">
                        {t(
                          "No partners match this search.",
                          "لا يوجد شركاء مطابقون للبحث.",
                        )}
                      </p>
                    )}
                  </div>
                  <aside className="partner-detail" aria-live="polite">
                    <div className="holo-globe" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <b>FAST</b>
                    </div>
                    <span className="about-eyebrow">
                      {rtl ? partner.arCountry : partner.country}
                    </span>
                    <h4>{rtl ? partner.arName : partner.name}</h4>
                    <p>{rtl ? partner.arDescription : partner.description}</p>
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("Visit partner website", "زيارة موقع الشريك")}{" "}
                      <ProjectionArrow />
                    </a>
                    <span className="partner-detail-caption">
                      {t("INTERNATIONAL TECHNOLOGY PARTNER", "شريك تقنية دولي")}
                    </span>
                  </aside>
                </div>
              </>
            )}
          </div>
          <footer className="projection-footer">
            <span>
              <i />
              {t(
                "FAST / ENGINEERING · OPERATIONS · INTELLIGENCE",
                "فاست / الهندسة · التشغيل · الذكاء",
              )}
            </span>
            <button onClick={() => setPanel(null)}>
              {t("Return to gallery", "العودة إلى المعرض")} <ProjectionArrow />
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}

export function AboutList({
  rtl,
  onOpen,
}: {
  rtl: boolean;
  onOpen: (panel: AboutPanel) => void;
}) {
  return (
    <section
      id="about-fast"
      className="about-list"
      aria-labelledby="about-list-title"
    >
      <span className="about-eyebrow">
        FAST / {rtl ? "عن الشركة" : "ABOUT THE COMPANY"}
      </span>
      <h2 id="about-list-title">
        {rtl
          ? "خبرة عالمية. تنفيذ سعودي."
          : "Global expertise. Saudi delivery."}
      </h2>
      <p>
        {rtl
          ? "من الدمام منذ عام 2017. استكشف شهاداتنا وتسجيلاتنا وشركاء التقنية الدوليين."
          : "Based in Dammam since 2017. Explore our certifications, supplier registrations and international technology partners."}
      </p>
      <div className="about-launchers">
        {aboutTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onOpen(tab.id)}
            aria-haspopup="dialog"
            data-about-open={tab.id}
          >
            <span>{tab.number}</span>
            {rtl ? tab.ar : tab.en}
            <b aria-hidden="true">
              <ProjectionArrow />
            </b>
          </button>
        ))}
      </div>
    </section>
  );
}
