import type { Company } from "./types";

/**
 * Company record.
 * Sources: FAST O&M company profile 2026 (FAST_OM_2026_SA.pdf):
 *   p. 3  Introduction, key sectors, credential badges (ISO, CR, Saudi Aramco, Saudi Energy, LCGPA)
 *   p. 4  Vision & Mission
 *   p. 6  Company services strapline
 *   p. 53 Group of Companies
 *   p. 54 Contact
 * Arabic wording follows fast-arabia.com/ar (home and contact pages) where it exists.
 * Group company one-liners come from fast-arabia.com/fast-trading and fast-arabia.com/fast-link.
 * The Arabic legal name is the one printed on the LCGPA certificate and the Civil Defense licence.
 */
export const company: Company = {
  name: { en: "FAST O&M", ar: "FAST للتشغيل والصيانة" },
  legalName: {
    en: "FAST Operations and Maintenance Company",
    ar: "شركة فاست أوبريشنز آند مينتينانس",
  },
  tagline: {
    en: "Integrated solutions. Expert execution. Reliable results.",
    ar: "حلول متكاملة. تنفيذ متقن. نتائج موثوقة.",
  },
  founded: "2017",
  hq: { en: "Dammam, Saudi Arabia", ar: "الدمام، المملكة العربية السعودية" },
  intro: {
    en: "FAST Operations & Maintenance (FAST O&M), established in 2017 and headquartered in Dammam, provides integrated engineering and industrial solutions across Saudi Arabia's most critical sectors. The company specializes in complex, multi-discipline project execution, ensuring seamless coordination across all phases of delivery.",
    ar: "تأسست FAST للتشغيل والصيانة عام 2017 ومقرها الدمام، وتقدّم حلولاً هندسية وصناعية متكاملة عبر أهم القطاعات الحيوية في المملكة العربية السعودية. تتخصص الشركة في تنفيذ المشاريع المعقّدة متعددة التخصصات، مع تنسيق سلس في جميع مراحل التنفيذ.",
  },
  vision: {
    en: "To be a leading Saudi-based provider of integrated engineering and Operations & Maintenance solutions, recognized for operational excellence, strategic global collaborations, and the seamless integration of advanced technologies that enhance industrial reliability, efficiency, and sustainability. We aspire to contribute meaningfully to the Kingdom's industrial advancement by delivering innovative, future-ready solutions aligned with Saudi Vision 2030.",
    ar: "أن نكون مزوّداً سعودياً رائداً لحلول الهندسة والتشغيل والصيانة المتكاملة، معروفين بالتميّز التشغيلي والشراكات العالمية الاستراتيجية والدمج السلس للتقنيات المتقدمة التي تعزّز موثوقية الصناعة وكفاءتها واستدامتها. ونطمح إلى الإسهام الفاعل في التقدّم الصناعي للمملكة عبر تقديم حلول مبتكرة وجاهزة للمستقبل تنسجم مع رؤية السعودية 2030.",
  },
  mission: {
    en: "To deliver high-performance, end-to-end engineering and operational solutions that support critical infrastructure and industrial assets throughout their lifecycle.",
    ar: "تقديم حلول هندسية وتشغيلية متكاملة عالية الأداء تدعم البنية التحتية الحيوية والأصول الصناعية طوال دورة حياتها.",
  },
  missionPoints: [
    {
      en: "Uphold the highest standards of quality, safety, and regulatory compliance.",
      ar: "الالتزام بأعلى معايير الجودة والسلامة والامتثال التنظيمي.",
    },
    {
      en: "Enhance asset integrity, operational performance, and lifecycle value.",
      ar: "تعزيز سلامة الأصول والأداء التشغيلي والقيمة على مدى دورة الحياة.",
    },
    {
      en: "Integrate advanced international technologies through strategic global partners.",
      ar: "دمج التقنيات الدولية المتقدمة عبر شركاء عالميين استراتيجيين.",
    },
    {
      en: "Drive sustainable growth through energy efficiency, innovation, and continuous improvement.",
      ar: "تحقيق نمو مستدام عبر كفاءة الطاقة والابتكار والتحسين المستمر.",
    },
    {
      en: "Build long-term partnerships founded on trust, professionalism, and measurable results.",
      ar: "بناء شراكات طويلة الأمد قائمة على الثقة والاحترافية والنتائج الملموسة.",
    },
  ],
  // Profile p. 3: "key sectors such as Oil & Gas, Petrochemicals, Power & Utilities,
  // Manufacturing, Infrastructure, Marine, and Government Projects".
  sectors: [
    { en: "Oil & Gas", ar: "النفط والغاز" },
    { en: "Petrochemicals", ar: "البتروكيماويات" },
    { en: "Power & Utilities", ar: "الطاقة والمرافق" },
    { en: "Manufacturing", ar: "التصنيع" },
    { en: "Infrastructure", ar: "البنية التحتية" },
    { en: "Marine", ar: "القطاع البحري" },
    { en: "Government Projects", ar: "المشاريع الحكومية" },
  ],
  // Profile p. 3: opening sentence and the five credential badges, values exactly as printed.
  facts: [
    {
      label: { en: "Established", ar: "سنة التأسيس" },
      value: { en: "2017", ar: "2017" },
    },
    {
      label: { en: "Headquarters", ar: "المقر الرئيسي" },
      value: { en: "Dammam", ar: "الدمام" },
    },
    {
      label: { en: "ISO certified", ar: "شهادات ISO" },
      value: { en: "9001 / 14001 / 45001", ar: "9001 / 14001 / 45001" },
    },
    {
      label: { en: "Commercial Registration", ar: "السجل التجاري" },
      value: { en: "CR 2050113965", ar: "2050113965" },
    },
    {
      label: { en: "Saudi Aramco", ar: "أرامكو السعودية" },
      value: { en: "Vendor Code 10112399", ar: "رمز المورّد 10112399" },
    },
    {
      label: { en: "Saudi Energy", ar: "السعودية للطاقة" },
      value: { en: "Vendor Code 2017011", ar: "رمز المورّد 2017011" },
    },
    {
      label: { en: "Local Content", ar: "المحتوى المحلي" },
      value: { en: "LCGPA", ar: "LCGPA" },
    },
  ],
  contact: {
    email: "info@fast-arabia.com",
    phone: "+966 13 831 1137",
    address: {
      en: "Office 308, 3rd Floor, Balhamer Business Gate, Ash Shati Ash Sharqi, Dammam 32414, Kingdom of Saudi Arabia",
      ar: "مكتب 308، الطابق الثالث، بوابة بالحمر للأعمال، الشاطئ الشرقي، الدمام 32414، المملكة العربية السعودية",
    },
    website: "https://fast-arabia.com/",
    rfq: "https://fast-arabia.com/contact?type=rfq",
    contactPage: "https://fast-arabia.com/contact",
    profilePdf:
      "https://fast-arabia.com/assets/downloads/FAST-OandM-Company-Profile.pdf",
  },
  // Profile p. 53: FAST Group of Companies (FAST O&M, FAST Trading, FAST Immigration, FAST Link).
  group: [
    {
      name: { en: "FAST O&M", ar: "FAST O&M" },
      summary: {
        en: "Integrated engineering, industrial contracting and Operations & Maintenance solutions, headquartered in Dammam.",
        ar: "حلول متكاملة في الهندسة والمقاولات الصناعية والتشغيل والصيانة، ومقرها الدمام.",
      },
      url: "https://fast-arabia.com/",
    },
    {
      name: { en: "FAST Trading", ar: "FAST Trading" },
      summary: {
        en: "FAST Trading Establishment, Dammam, since 2020. Industrial supplies and chemicals across five trading divisions.",
        ar: "مؤسسة فاست التجارية، الدمام، منذ 2020. توريدات صناعية وكيماويات عبر خمسة أقسام تجارية.",
      },
      url: "https://fast-arabia.com/fast-trading/",
    },
    {
      name: { en: "FAST Immigration", ar: "FAST Immigration" },
      summary: {
        en: "Member of the FAST Group of Companies.",
        ar: "إحدى شركات مجموعة FAST.",
      },
      url: "https://fast-immigration.com/",
    },
    {
      name: { en: "FAST Link", ar: "FAST Link" },
      summary: {
        en: "FAST Link General Trading LLC, Sharjah, UAE, since 2023. Industrial supplies and water-treatment chemicals.",
        ar: "فاست لينك للتجارة العامة ذ.م.م، الشارقة، الإمارات، منذ 2023. توريدات صناعية وكيماويات لمعالجة المياه.",
      },
      url: "https://fast-arabia.com/fast-link/",
    },
  ],
};
