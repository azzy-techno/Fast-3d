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
    origin: [0, 23, 0],
  },
  {
    id: "electrical",
    title: "Electrical",
    ar: "المقاولات الكهربائية",
    place: "The power behind it all",
    placeAr: "الطاقة وراء كل شيء",
    description:
      "From the first connection to final commissioning. Electrical systems designed, installed and tested for the demands of industrial facilities.",
    descriptionAr:
      "تصميم وتركيب واختبار وتشغيل الأنظمة الكهربائية للمنشآت الصناعية.",
    capabilities: [
      "LV / MV systems",
      "Transformers",
      "Testing & commissioning",
    ],
    image: "electrical.webp",
    imageAlt: "FAST electrical installation and engineering",
    href: `${site}/services/electrical`,
    color: "#e4b45d",
    origin: [-8, 15, 0],
  },
  {
    id: "mechanical",
    title: "Mechanical",
    ar: "المقاولات الميكانيكية",
    place: "Inside the plant room",
    placeAr: "داخل غرفة المعدات",
    description:
      "Every pipe, pump and connection has a purpose. Integrated mechanical equipment, piping and HVAC systems, from installation through long-term maintenance.",
    descriptionAr:
      "توريد وتركيب وصيانة المعدات الميكانيكية وأنظمة الأنابيب والتكييف لدعم تشغيل المنشآت بكفاءة.",
    capabilities: [
      "Piping & HVAC",
      "Pumps & equipment",
      "Operations & maintenance",
    ],
    image: "mechanical.webp",
    imageAlt: "Mechanical equipment and piping systems supplied by FAST",
    href: `${site}/services/mechanical`,
    color: "#68b5dc",
    origin: [8, 8, 0],
  },
  {
    id: "fabrication",
    title: "Fabrication",
    ar: "خدمات التصنيع",
    place: "Made in our own yard",
    placeAr: "من ساحة التصنيع لدينا",
    description:
      "The detail is in the making. Custom structures, skids and tanks fabricated in our own yard, with in-house welding, finishing and erection capability.",
    descriptionAr:
      "تصنيع الهياكل والمنصات والخزانات حسب الطلب في ساحة التصنيع الداخلية، بقدرات لحام وتشطيب وتركيب.",
    capabilities: ["Structural steel", "Skids & tanks", "Welding & finishing"],
    image: "fabrication.webp",
    imageAlt: "Steel fabrication work from the FAST fabrication yard",
    href: `${site}/services/fabrication`,
    color: "#e6a06b",
    origin: [-8, 3, -14],
  },
  {
    id: "civil",
    title: "Civil & structural",
    ar: "المقاولات المدنية",
    place: "Where everything begins",
    placeAr: "حيث يبدأ كل شيء",
    description:
      "Strong operations start with strong foundations. Civil and structural works supporting industrial and infrastructure projects across the Kingdom.",
    descriptionAr:
      "الأعمال المدنية والإنشائية الداعمة للمشاريع الصناعية والبنية التحتية في المملكة.",
    capabilities: ["Foundations", "Concrete structures", "Infrastructure"],
    image: "civil.webp",
    imageAlt: "FAST civil and structural construction work",
    href: `${site}/services/civil`,
    color: "#60c4b2",
    origin: [0, -5, 0],
  },
  {
    id: "fire",
    title: "Fire & protection",
    ar: "الحريق والسلامة",
    place: "Protection built in",
    placeAr: "الحماية جزء من البناء",
    description:
      "Ready when it matters most. Integrated detection, suppression and fire-pump systems that protect people, facilities and the work inside them.",
    descriptionAr:
      "أنظمة كشف وإطفاء الحريق ومضخات الحريق لحماية الأفراد والمنشآت الصناعية والتجارية.",
    capabilities: ["Fire detection", "Suppression systems", "Fire pumps"],
    image: "fire.webp",
    imageAlt: "Fire protection systems installed by FAST",
    href: `${site}/services/fire-protection`,
    color: "#e97566",
    origin: [10, 3, 1],
  },
  {
    id: "it",
    title: "IT services",
    ar: "تقنية المعلومات",
    place: "The connected core",
    placeAr: "في قلب الاتصال",
    description:
      "A dependable digital foundation. Networks, server rooms, security systems and software solutions connecting your people, processes and facilities.",
    descriptionAr:
      "شبكات وغرف خوادم وأنظمة أمن وحلول برمجية تربط الأفراد والعمليات والمنشآت.",
    capabilities: [
      "Networks & servers",
      "CCTV & access control",
      "Software solutions",
    ],
    image: "it.webp",
    imageAlt: "FAST IT and low-current infrastructure",
    href: `${site}/services/it-services`,
    color: "#8da9ef",
    origin: [-8, 15, -14],
  },
  {
    id: "manufacturing",
    title: "Smart manufacturing",
    ar: "التصنيع الذكي",
    place: "The factory in motion",
    placeAr: "المصنع في حركة",
    description:
      "Precision, connected. Robotic automation, production systems and local engineering expertise come together to make manufacturing work smarter.",
    descriptionAr:
      "الأتمتة الروبوتية وأنظمة الإنتاج والخبرات الهندسية المحلية تعمل معاً لتصنيع أكثر ذكاءً.",
    capabilities: [
      "Robotic automation",
      "MES integration",
      "Production systems",
    ],
    image: "manufacturing.webp",
    imageAlt: "Industrial automation and production capabilities from FAST",
    href: `${site}/services/industrial-automation`,
    color: "#5ec5dc",
    origin: [2, 3, -29],
  },
  {
    id: "industry",
    title: "Industry 4.0",
    ar: "الصناعة 4.0",
    place: "A clearer view of operations",
    placeAr: "رؤية أوضح للعمليات",
    description:
      "See the bigger picture. MES, EMS, SCADA and digital-twin capabilities turn disconnected systems into a more informed industrial operation.",
    descriptionAr:
      "أنظمة إدارة التصنيع والطاقة والتحكم والتوائم الرقمية تمنحك رؤية متكاملة للعمليات الصناعية.",
    capabilities: ["SCADA & MES", "Energy management", "Digital twins"],
    image: "digital.webp",
    imageAlt: "Digital engineering and industrial systems from FAST",
    href: `${site}/services/industrial-automation#scope`,
    color: "#79d2d5",
    origin: [0, 14, -29],
  },
  {
    id: "iiot",
    title: "Industrial IoT",
    ar: "إنترنت الأشياء الصناعي",
    place: "Every asset has a voice",
    placeAr: "لكل أصل صوت",
    description:
      "Connect the equipment to the insight. IIoT integration and predictive maintenance help industrial teams understand their assets and act with confidence.",
    descriptionAr:
      "تكامل إنترنت الأشياء الصناعي والصيانة التنبؤية يساعد فرق التشغيل على فهم حالة الأصول واتخاذ قرارات مدروسة.",
    capabilities: [
      "IIoT integration",
      "Asset monitoring",
      "Predictive maintenance",
    ],
    image: "digital.webp",
    imageAlt: "FAST digital engineering and asset information capabilities",
    href: `${site}/services/industrial-automation#scope`,
    color: "#6ed6bf",
    origin: [10, 7, -29],
  },
  {
    id: "vision",
    title: "Computer vision",
    ar: "الرؤية الحاسوبية",
    place: "Intelligence that sees",
    placeAr: "ذكاء يرى",
    description:
      "Make the invisible visible. AI computer vision supports safety-line detection, identifying human and forklift presence in industrial environments.",
    descriptionAr:
      "تدعم الرؤية الحاسوبية بالذكاء الاصطناعي رصد خطوط السلامة واكتشاف تواجد الأفراد والرافعات الشوكية في البيئات الصناعية.",
    capabilities: [
      "AI vision",
      "Safety-line detection",
      "Human & forklift detection",
    ],
    image: "manufacturing.webp",
    imageAlt:
      "Industrial automation environment representing FAST computer vision services",
    href: `${site}/services/industrial-automation#projects`,
    color: "#95d9a9",
    origin: [-9, 3, -29],
  },
];
export const destinations = [
  "arrival",
  ...chapters.map((c) => c.id),
  "together",
];
