export type Point = [number, number, number];
export type Chapter = {
  id: string;
  title: string;
  ar: string;
  place: string;
  placeAr: string;
  description: string;
  descriptionAr: string;
  capabilities: string[];
  image: string;
  imageAlt: string;
  href: string;
  color: string;
  origin: Point;
};
const site = "https://fast-arabia.com";
export const chapters: Chapter[] = [
  {
    id: "cooling",
    title: "Cooling towers",
    ar: "أبراج التبريد",
    place: "On the rooftop",
    placeAr: "على السطح",
    description:
      "Keeping the entire facility in balance. Cooling tower design, supply and retrofit, backed by the mechanical expertise to keep your operations running.",
    descriptionAr:
      "تصميم وتوريد وإعادة تأهيل أبراج التبريد، بخبرات ميكانيكية تدعم استمرارية تشغيل منشآتك.",
    capabilities: ["Design & supply", "Retrofit", "Maintenance"],
    image: "cooling.webp",
    imageAlt: "Industrial mechanical and cooling systems from FAST",
    href: `${site}/services/mechanical#scope`,
    color: "#64c8e0",
    origin: [0, 83, 0],
  },
  {
    id: "electrical",
    title: "Electrical",
    ar: "المقاولات الكهربائية",
    place: "Level 01 / 16 guided stations",
    placeAr: "الطابق 01 / 16 محطة إرشادية",
    description:
      "Step into a 62 × 64 m electrical exhibition. Follow your FAST engineer through all 16 capabilities, from power installations to automation, lighting and industrial fans.",
    descriptionAr:
      "ادخل معرضاً كهربائياً بمساحة 62 × 64 متراً. اتبع مهندس فاست عبر 16 محطة، من تركيبات الطاقة إلى الأتمتة والإنارة والمراوح الصناعية.",
    capabilities: [
      "Electrical contracting",
      "Electrical automation",
      "LV & ELV infrastructure",
    ],
    image: "electrical.webp",
    imageAlt: "FAST electrical installation and engineering",
    href: `${site}/services/electrical`,
    color: "#e4b45d",
    origin: [-6.6, 66, -4],
  },
  {
    id: "mechanical",
    title: "Mechanical",
    ar: "المقاولات الميكانيكية",
    place: "Level 02 / 16 guided stations",
    placeAr: "الطابق 02 / 16 محطة إرشادية",
    description:
      "Explore ten core mechanical services and six installations from FAST’s project portfolio. Follow the engineer from cooling towers and pipework to shelter air conditioning and furnace linings.",
    descriptionAr:
      "استكشف عشر خدمات ميكانيكية وستة تطبيقات من مشاريع فاست. رافق المهندس من أبراج التبريد والأنابيب إلى تكييف المآوي الصناعية وبطانات الأفران.",
    capabilities: [
      "Piping & HVAC",
      "Pumps & equipment",
      "Operations & maintenance",
    ],
    image: "mechanical.webp",
    imageAlt: "Mechanical equipment and piping systems supplied by FAST",
    href: `${site}/services/mechanical`,
    color: "#68b5dc",
    origin: [6.6, 60, -4],
  },
  {
    id: "fabrication",
    title: "Fabrication",
    ar: "خدمات التصنيع",
    place: "Level 03 / 16 guided stations",
    placeAr: "الطابق 03 / 16 محطة إرشادية",
    description:
      "Walk through eight capabilities from FAST’s Dammam-area fabrication yard, then see how the work is used in eight selected client projects.",
    descriptionAr:
      "استكشف ثماني خدمات من ورشة فاست للتصنيع في منطقة الدمام، ثم شاهد تطبيقاتها في ثمانية مشاريع مختارة للعملاء.",
    capabilities: ["Structural steel", "Skids & tanks", "Welding & finishing"],
    image: "fabrication.webp",
    imageAlt: "Steel fabrication work from the FAST fabrication yard",
    href: `${site}/services/fabrication`,
    color: "#e6a06b",
    origin: [-6.6, 54, -4],
  },
  {
    id: "civil",
    title: "Civil & structural",
    ar: "المقاولات المدنية",
    place: "Where everything begins",
    placeAr: "حيث يبدأ كل شيء",
    description:
      "Explore thirteen civil capabilities in section, then see project studies of a DACO generator foundation, a TESA-1 roof repair and an Amaala precast bench.",
    descriptionAr:
      "استكشف ثلاث عشرة خدمة مدنية عبر مقاطع تفصيلية، ثم شاهد نماذج لأساس مولد في داكو وإصلاح سطح في تيسا 1 ومقعد مسبق الصب في أمالا.",
    capabilities: ["Foundations", "Concrete structures", "Infrastructure"],
    image: "civil.webp",
    imageAlt: "FAST civil and structural construction work",
    href: `${site}/services/civil`,
    color: "#60c4b2",
    origin: [6.6, 48, -4],
  },
  {
    id: "fire",
    title: "Fire & protection",
    ar: "الحريق والسلامة",
    place: "Protection built in",
    placeAr: "الحماية جزء من البناء",
    description:
      "Explore alarm, suppression and water-supply equipment with the FAST engineer, then visit the Amiral fire detection exhibit.",
    descriptionAr:
      "استكشف معدات الإنذار والإطفاء وإمداد المياه مع مهندس فاست، ثم زُر مجسّم كشف الحريق في مشروع أميرال.",
    capabilities: ["Fire detection", "Suppression systems", "Fire pumps"],
    image: "fire.webp",
    imageAlt: "Fire protection systems installed by FAST",
    href: `${site}/services/fire-protection`,
    color: "#e97566",
    origin: [-6.6, 42, -4],
  },
  {
    id: "it",
    title: "IT services",
    ar: "تقنية المعلومات",
    place: "The connected core",
    placeAr: "في قلب الاتصال",
    description:
      "Explore field devices, server rooms and software with a FAST engineer, then visit the LED video-wall and UPS monitoring project exhibits.",
    descriptionAr:
      "استكشف أجهزة الموقع وغرف الخوادم والبرمجيات مع مهندس فاست ثم زُر مجسّمَي جدار العرض ومراقبة الطاقة الاحتياطية.",
    capabilities: [
      "Networks & servers",
      "CCTV & access control",
      "Software solutions",
    ],
    image: "it.webp",
    imageAlt: "FAST IT and low-current infrastructure",
    href: `${site}/services/it-services`,
    color: "#8da9ef",
    origin: [6.6, 36, -4],
  },
  {
    id: "manufacturing",
    title: "Digitalization & smart manufacturing",
    ar: "الرقمنة والتصنيع الذكي",
    place: "Industry 4.0 / Floor 07",
    placeAr: "الصناعة 4.0 / الطابق 07",
    description: "One floor connects manufacturing execution, industrial IoT, plant operations, maintenance, enterprise software, energy and computer vision. Explore six partner sections and FAST’s Tenaris safety-line example.",
    descriptionAr: "يجمع طابق واحد تنفيذ التصنيع وإنترنت الأشياء الصناعي والتشغيل والصيانة وبرمجيات المؤسسات والطاقة والرؤية الحاسوبية. استكشف أقسام الشركاء الستة ومثال فاست لرصد خطوط السلامة لدى تيناريس.",
    capabilities: ["Smart manufacturing & Industry 4.0", "Industrial IoT", "Computer vision"],
    image: "manufacturing.webp",
    imageAlt: "Industrial automation and production capabilities from FAST",
    href: `${site}/partners`,
    color: "#5ec5dc",
    origin: [-6.6, 30, -4],
  },
];
