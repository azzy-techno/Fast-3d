import type { Certificate, Partner, Project, Registration } from "./types";

/**
 * International Technology Partners.
 * Source: FAST O&M company profile 2026 (FAST_OM_2026_SA.pdf) pp. 25–26, in the order printed there.
 * Arabic wording follows fast-arabia.com/ar/partners where it exists.
 * URLs follow fast-arabia.com/partners (the profile prints bare domains).
 * Logos checked against the logos printed on profile pp. 25–26.
 */
export const partners: Partner[] = [
  {
    id: "meta-smart-factory",
    name: "Meta Smart Factory",
    country: { en: "Spain", ar: "إسبانيا" },
    summary: {
      en: "Industry 4.0 and smart manufacturing: MES, APS, SCP, OEE and IIoT integration.",
      ar: "الصناعة 4.0 والتصنيع الذكي: MES وAPS وSCP وOEE وتكامل إنترنت الأشياء الصناعي (IIoT).",
    },
    url: "https://metasmartfactory.com/",
    logo: "brand/partners/meta-smart-factory.png",
  },
  {
    id: "beasy",
    name: "BEASY",
    country: { en: "United Kingdom", ar: "المملكة المتحدة" },
    summary: {
      en: "Corrosion engineering and CP digital twin, with physics-based predictive analytics.",
      ar: "هندسة التآكل والتوأم الرقمي للحماية الكاثودية، بتحليلات تنبّؤية قائمة على الفيزياء.",
    },
    url: "https://www.beasy.com/",
    logo: "brand/partners/beasy.png",
  },
  {
    id: "automassist",
    name: "AutomAssist",
    country: { en: "France", ar: "فرنسا" },
    summary: {
      en: "AI operations platform connecting plant documents, PLC signals and ERP records.",
      ar: "منصة عمليات بالذكاء الاصطناعي تربط وثائق المصنع وإشارات PLC وسجلات ERP.",
    },
    url: "https://www.automassist.ai/",
    logo: "brand/partners/automassist.png",
  },
  {
    id: "greenovative",
    name: "Greenovative",
    country: { en: "India", ar: "الهند" },
    summary: {
      en: "AI-driven energy optimization, sustainability tracking and Net-Zero monitoring.",
      ar: "تحسين الطاقة بالذكاء الاصطناعي وتتبّع الاستدامة ومراقبة الحياد الكربوني.",
    },
    url: "https://greenovative.com/",
    logo: "brand/partners/greenovative.png",
  },
  {
    id: "meta-2i",
    name: "Meta 2i",
    country: { en: "France", ar: "فرنسا" },
    summary: {
      en: "Industrial intelligence: editor and integrator of MES software solutions.",
      ar: "الذكاء الصناعي: مطوّر ومكامل لحلول برمجيات أنظمة تنفيذ التصنيع (MES).",
    },
    url: "https://meta2i.com/",
    logo: "brand/partners/meta-2i.png",
  },
  {
    id: "greenoil-standard",
    name: "GreenOil Standard",
    country: { en: "Denmark", ar: "الدنمارك" },
    summary: {
      en: "High-performance marine and industrial oil filtration systems.",
      ar: "أنظمة ترشيح زيوت بحرية وصناعية عالية الأداء.",
    },
    url: "https://greenoilstandard.com/",
    logo: "brand/partners/greenoil-standard.png",
  },
  {
    id: "advance-cooling-towers",
    name: "Advance Cooling Towers",
    country: { en: "India", ar: "الهند" },
    summary: {
      en: "CTI-certified cooling tower design and engineered systems.",
      ar: "تصميم أبراج تبريد معتمد من CTI وأنظمة هندسية.",
    },
    url: "https://advancecoolingtower.com/",
    logo: "brand/partners/advance-cooling-towers.png",
  },
  {
    id: "ecosystem-informatics",
    name: "Ecosystem Informatics",
    country: { en: "Canada", ar: "كندا" },
    summary: {
      en: "AI-enabled air monitoring and data intelligence platforms.",
      ar: "منصات مراقبة الهواء وذكاء البيانات المدعومة بالذكاء الاصطناعي.",
    },
    url: "https://www.ecosinfo.ai/",
    logo: "brand/partners/ecosystem-informatics.png",
  },
  {
    id: "manwinwin",
    name: "ManWinWin Software",
    country: { en: "Portugal", ar: "البرتغال" },
    summary: {
      en: "CMMS maintenance and asset management software: planning, work orders and reliability KPIs.",
      ar: "برنامج CMMS لإدارة الصيانة والأصول: التخطيط وأوامر العمل ومؤشرات الموثوقية.",
    },
    url: "https://www.manwinwin.com/",
    logo: "brand/partners/manwinwin.png",
  },
  {
    id: "vision-lasertechnik",
    name: "Vision Lasertechnik",
    country: { en: "Germany", ar: "ألمانيا" },
    summary: {
      en: "Industrial laser technology: laser welding, marking and robotic automation, Industry 4.0 ready.",
      ar: "تقنيات ليزر صناعية: لحام ووسم بالليزر وأتمتة روبوتية، جاهزة للصناعة 4.0.",
    },
    url: "https://www.vision-lasertechnik.de/",
    logo: "brand/partners/vision-lasertechnik.png",
  },
  {
    id: "vasista-engineering",
    name: "Vasista Engineering Solutions",
    country: { en: "India", ar: "الهند" },
    summary: {
      en: "Specialists in 3D scanning, BIM, digital twins and asset digitization.",
      ar: "متخصصون في المسح ثلاثي الأبعاد ونمذجة معلومات البناء (BIM) والتوائم الرقمية ورقمنة الأصول.",
    },
    url: "https://vasistaengineering.com/",
    logo: "brand/partners/vasista-engineering.png",
  },
  {
    id: "godrej-infotech",
    name: "Godrej Infotech",
    country: { en: "India", ar: "الهند" },
    // Profile p. 26 prints only "Delivering business value through automation";
    // the service description is the one on fast-arabia.com/partners.
    summary: {
      en: "Enterprise IT services: ERP implementation, software development and digital transformation.",
      ar: "خدمات تقنية معلومات للمؤسسات: تطبيق أنظمة ERP وتطوير البرمجيات والتحوّل الرقمي.",
    },
    url: "https://www.godrejinfotech.com/",
    logo: "brand/partners/godrej-infotech.png",
  },
  {
    id: "pct-group",
    name: "PCT Group Ltd",
    country: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
    // Profile p. 26 and the PCT Group page: FAST is "Representative & Partner for KSA and Bahrain".
    summary: {
      en: "Ex-rated hoists, cranes and winches, plus welding, cutting and power tool solutions since 1972. FAST is the representative and partner for Saudi Arabia and Bahrain.",
      ar: "مرافع ورافعات وونشات مقاومة للانفجار (Ex)، إضافة إلى حلول اللحام والقطع والأدوات الكهربائية منذ عام 1972. وتعمل FAST ممثلاً وشريكاً لها في السعودية والبحرين.",
    },
    url: "https://www.pctgroupme.com/",
    logo: "brand/partners/pct-group.png",
  },
];

/**
 * Selected supplier portal registrations.
 * Source: profile p. 5 ("Registered and approved supplier with leading organizations across the Kingdom"),
 * in the order printed there. Logos checked against the logos printed on that page.
 */
export const registrations: Registration[] = [
  {
    id: "aramco",
    name: { en: "Saudi Aramco", ar: "أرامكو السعودية" },
    logo: "brand/registrations/aramco.png",
  },
  {
    id: "saudi-energy",
    name: { en: "Saudi Energy (SEC)", ar: "السعودية للطاقة (SEC)" },
    logo: "brand/registrations/saudi-energy.png",
  },
  {
    id: "maaden",
    name: { en: "Ma'aden", ar: "معادن" },
    logo: "brand/registrations/maaden.png",
  },
  {
    id: "lt",
    name: {
      en: "L&T Hydrocarbon Saudi",
      ar: "لارسن آند توبرو للهيدروكربونات السعودية",
    },
    logo: "brand/registrations/lt.png",
  },
  {
    id: "sap",
    name: { en: "SAP Ariba Network", ar: "شبكة SAP Ariba" },
    logo: "brand/registrations/sap.png",
  },
  {
    id: "energytech",
    name: { en: "EnergyTech", ar: "معهد الطاقة (EnergyTech)" },
    logo: "brand/registrations/energytech.png",
  },
  {
    id: "kfupm",
    name: {
      en: "King Fahd University of Petroleum & Minerals",
      ar: "جامعة الملك فهد للبترول والمعادن",
    },
    logo: "brand/registrations/kfupm.png",
  },
  {
    id: "savola",
    name: { en: "Savola Group", ar: "مجموعة صافولا" },
    logo: "brand/registrations/savola.png",
  },
  {
    id: "amana",
    name: { en: "Saudi AMANA Contracting", ar: "أمانة السعودية للمقاولات" },
    logo: "brand/registrations/amana.png",
  },
  {
    id: "aujan",
    name: { en: "Aujan Beverages Company", ar: "شركة العوجان للمشروبات" },
    logo: "brand/registrations/aujan.png",
  },
  {
    id: "tenaris",
    name: { en: "Tenaris", ar: "تيناريس" },
    logo: "brand/registrations/tenaris.png",
  },
  {
    id: "petronash",
    name: {
      en: "Petronash Arabia Co. Ltd",
      ar: "شركة بتروناش العربية المحدودة",
    },
    logo: "brand/registrations/petronash.png",
  },
  {
    id: "hadeed",
    name: {
      en: "Saudi Iron and Steel Company (Hadeed)",
      ar: "الشركة السعودية للحديد والصلب (حديد)",
    },
    logo: "brand/registrations/hadeed.png",
  },
  {
    id: "siemens-energy",
    name: { en: "Siemens Energy", ar: "سيمنس للطاقة" },
    logo: "brand/registrations/siemens-energy.png",
  },
  {
    id: "petro-rabigh",
    name: { en: "Petro Rabigh", ar: "بترو رابغ" },
    logo: "brand/registrations/petro-rabigh.png",
  },
];

/**
 * Approved vendor registrations, profile p. 51, as printed (the duplicate "Future Pipes Industries"
 * cell is listed once). Proper names only; the profile prints no logos for this list, so it is
 * kept apart from `registrations`.
 */
export const approvedVendors: string[] = [
  "Saudi Aramco",
  "SABIC",
  "Red Sea Global",
  "Petronash Arabia",
  "L&T Hydrocarbon Saudi Co",
  "Saudi Wells Technology Factory",
  "BRC",
  "Generic Engineering Technologies",
  "King Fahd University of Petroleum & Minerals",
  "Solutions Leader Fayez Engineering (SLFE)",
  "Reda Hazard Control",
  "SPIG",
  "Masdar Technical Supplies",
  "Al Arabi Steel Factory",
  "Oil Field Services Company",
  "China Saudi Communications Service Ltd",
  "Baxter Olayan",
  "Midal Cables",
  "Saudi Arabian Engineering Company",
  "SRACO",
  "Obekan",
  "National Company for Sulphur Products",
  "Douglas OHI (Majan Construction Company)",
  "Ittefaq Steel",
  "Al Gihaz Contracting Co",
  "Exact Fabrication",
  "Kaefer Saudi Arabia",
  "Techno Rubber",
  "Yusuf Bin Ahmad Kanoo",
  "Al Tuwairqi Holding Company",
  "Advanced Polyolefins Company",
  "Future Pipes Industries",
  "GS Engineering & Construction Corp",
  "Delmon – IFFCO",
  "Savola Foods",
  "Reliance Industries Limited",
  "Cladtek Arabia",
  "East Pipes Integrated Company",
  "Saudi Tabreed Operations & Maintenance Co.",
  "Al Bawani",
  "Al Jabr Motors",
  "Arabian Maize",
  "Al Khorayef Petroleum",
  "Gulf Chemical & Industrial Oils Co.",
  "Abdul Mohsen Al Tamimi Contracting Co",
  "DAMAC",
  "Mastoura Contracting Company",
  "Delmon Refinery",
  "NAFFCO Saudi Arabia",
  "Dammam Airport Company (DACO)",
  "Kanoo Elite",
  "Amana Contracting",
  "SISCO",
  "Basic Chemical Industries",
  "Atkins Realis",
];

/**
 * Certificates and licences.
 * Sources: profile p. 45 (ISO certificates), pp. 40–43 (company documents: LCGPA, Salamah).
 * Numbers and dates are read from the certificate documents themselves (public/brand/certificates).
 */
export const certificates: Certificate[] = [
  {
    id: "iso-9001",
    title: {
      en: "ISO 9001:2015 Quality Management System",
      ar: "ISO 9001:2015 نظام إدارة الجودة",
    },
    detail: {
      en: "Certificate CN-QMS-15252924, issued 27 October 2026 by ANS System Certification.",
      ar: "الشهادة رقم CN-QMS-15252924، صادرة في 27 أكتوبر 2026 عن ANS System Certification.",
    },
    image: "brand/certificates/iso-9001.webp",
    pdf: "brand/certificates/iso-9001.pdf",
  },
  {
    id: "iso-14001",
    title: {
      en: "ISO 14001:2015 Environmental Management System",
      ar: "ISO 14001:2015 نظام الإدارة البيئية",
    },
    detail: {
      en: "Certificate CN-EMS-15252925, issued 27 October 2026 by ANS System Certification.",
      ar: "الشهادة رقم CN-EMS-15252925، صادرة في 27 أكتوبر 2026 عن ANS System Certification.",
    },
    image: "brand/certificates/iso-14001.webp",
    pdf: "brand/certificates/iso-14001.pdf",
  },
  {
    id: "iso-45001",
    title: {
      en: "ISO 45001:2018 Occupational Health & Safety Management System",
      ar: "ISO 45001:2018 نظام إدارة الصحة والسلامة المهنية",
    },
    detail: {
      en: "Certificate CN-OH&SMS-15252926, issued 27 October 2026 by ANS System Certification.",
      ar: "الشهادة رقم CN-OH&SMS-15252926، صادرة في 27 أكتوبر 2026 عن ANS System Certification.",
    },
    image: "brand/certificates/iso-45001.webp",
    pdf: "brand/certificates/iso-45001.pdf",
  },
  {
    id: "lcgpa",
    title: {
      en: "Local Content Certificate",
      ar: "شهادة المحتوى المحلي",
    },
    detail: {
      en: "Issued by the Local Content & Government Procurement Authority (LCGPA). Valid to 23 July 2027.",
      ar: "صادرة عن هيئة المحتوى المحلي والمشتريات الحكومية (LCGPA). سارية حتى 23 يوليو 2027.",
    },
    image: "brand/certificates/lcgpa.webp",
    pdf: "brand/certificates/lcgpa.pdf",
  },
  {
    id: "salamah",
    title: {
      en: "Civil Defense Activity Licence (Salamah)",
      ar: "ترخيص مزاولة نشاط من الدفاع المدني (سلامة)",
    },
    detail: {
      en: "Licence no. 100001481, issued 27 August 2026 and valid to 27 August 2028.",
      ar: "ترخيص رقم 100001481، صادر في 27 أغسطس 2026 وسارٍ حتى 27 أغسطس 2028.",
    },
    image: "brand/certificates/salamah.webp",
  },
];

/**
 * Selected Completed Projects.
 * Source: profile pp. 49–50, every row, in the order printed (left table then right table, p. 49 then p. 50).
 * Project names are as listed in the profile. Two client spellings follow fast-arabia.com
 * ("Jeraisy Electronic Services", "Mobark Al Salomi & Partner"; the profile prints "Jercisy" and "Al Aslomi").
 * `discipline` follows the assignment used on the fast-arabia.com service pages; cooling tower jobs
 * are tagged "roof" and rows with no clear discipline are "general".
 * Client names stay in Latin script in Arabic where no established Arabic name was found in the sources.
 */
export const projects: Project[] = [
  // Profile p. 49, left table
  {
    title: { en: "Steel Skid Fabrication", ar: "تصنيع قواعد فولاذية (Skid)" },
    client: { en: "Petronash Arabia", ar: "بتروناش العربية" },
    discipline: "fabrication",
  },
  {
    title: {
      en: "SS Enclosures Fabrication",
      ar: "تصنيع حاويات من الفولاذ المقاوم للصدأ",
    },
    client: { en: "Petronash Arabia", ar: "بتروناش العربية" },
    discipline: "fabrication",
  },
  {
    title: {
      en: "WCH Shelter AC Installations",
      ar: "تركيب أجهزة التكييف لمآوي WCH",
    },
    client: { en: "Petronash Arabia", ar: "بتروناش العربية" },
    discipline: "mechanical",
  },
  {
    title: { en: "Steel Skid Fabrication", ar: "تصنيع قواعد فولاذية (Skid)" },
    client: {
      en: "Saudi Well Technology Factory",
      ar: "Saudi Well Technology Factory",
    },
    discipline: "fabrication",
  },
  {
    title: {
      en: "Cooling Tower Retrofit – Dammam Airport",
      ar: "إعادة تأهيل برج التبريد – مطار الدمام",
    },
    client: { en: "SPIG / DACO", ar: "SPIG / DACO" },
    discipline: "roof",
  },
  {
    title: {
      en: "Main Building CCTV Replacement",
      ar: "استبدال كاميرات المراقبة في المبنى الرئيسي",
    },
    client: { en: "SLFE", ar: "SLFE" },
    discipline: "ict",
  },
  {
    title: { en: "Fire Protection Systems", ar: "أنظمة الحماية من الحريق" },
    client: { en: "SLFE", ar: "SLFE" },
    discipline: "fire",
  },
  {
    title: { en: "SRMU Replacements", ar: "استبدال وحدات SRMU" },
    client: { en: "CCS / SGCC", ar: "CCS / SGCC" },
    discipline: "electrical",
  },
  {
    title: {
      en: "Aluminum Doors (Supply & Installation)",
      ar: "أبواب ألمنيوم (توريد وتركيب)",
    },
    client: { en: "ERAM SPC", ar: "ERAM SPC" },
    discipline: "fabrication",
  },
  {
    title: { en: "Supply of Steel Rails", ar: "توريد قضبان فولاذية" },
    client: {
      en: "Majan Construction Company",
      ar: "شركة ماجان للإنشاءات",
    },
    discipline: "fabrication",
  },
  {
    title: {
      en: "Aluminum Doors & Windows – Zuluf WTP",
      ar: "أبواب ونوافذ ألمنيوم – Zuluf WTP",
    },
    client: {
      en: "Majan Construction Company",
      ar: "شركة ماجان للإنشاءات",
    },
    discipline: "fabrication",
  },
  {
    title: { en: "Sika Coating – RIYAS NGL", ar: "طلاء Sika – RIYAS NGL" },
    client: {
      en: "Majan Construction Company",
      ar: "شركة ماجان للإنشاءات",
    },
    discipline: "civil",
  },
  {
    title: { en: "Supply of Super Heaters", ar: "توريد مسخّنات فائقة" },
    client: { en: "Byrne Rentals", ar: "Byrne Rentals" },
    discipline: "mechanical",
  },
  // Profile p. 49, right table
  {
    title: { en: "Grouting Works at SSP", ar: "أعمال الحقن بالملاط في SSP" },
    client: { en: "Tenaris Saudi Arabia LTD", ar: "تيناريس السعودية" },
    discipline: "civil",
  },
  {
    title: { en: "Signage – GPC Plant", ar: "لوحات إرشادية – مصنع GPC" },
    client: { en: "Tenaris Saudi Arabia LTD", ar: "تيناريس السعودية" },
    discipline: "general",
  },
  {
    title: { en: "Fire Protection System", ar: "نظام الحماية من الحريق" },
    client: {
      en: "Red Sea International Airport",
      ar: "مطار البحر الأحمر الدولي",
    },
    discipline: "fire",
  },
  {
    title: { en: "Head Office Signage", ar: "لوحات المكتب الرئيسي" },
    client: { en: "SLFE", ar: "SLFE" },
    discipline: "general",
  },
  {
    title: {
      en: "Steel Bollards – Chalhoub Riyadh",
      ar: "حواجز فولاذية – Chalhoub الرياض",
    },
    client: { en: "AMANA Contracting Co", ar: "أمانة للمقاولات" },
    discipline: "fabrication",
  },
  {
    title: { en: "Supply of SmartNet", ar: "توريد SmartNet" },
    client: {
      en: "Tasheel Information Technology",
      ar: "تسهيل لتقنية المعلومات",
    },
    discipline: "ict",
  },
  {
    title: {
      en: "Glass Railing – Coffee Shops",
      ar: "درابزين زجاجي – مقاهٍ",
    },
    client: {
      en: "Designs & Construction Est.",
      ar: "مؤسسة التصاميم والإنشاءات",
    },
    discipline: "fabrication",
  },
  {
    title: {
      en: "Red Sea International Airport",
      ar: "مطار البحر الأحمر الدولي",
    },
    client: { en: "NAFFCO", ar: "نافكو" },
    discipline: "fire",
  },
  {
    title: {
      en: "LED Video Wall Installation",
      ar: "تركيب جدار فيديو LED",
    },
    client: {
      en: "Mobark Al Salomi & Partner",
      ar: "مبارك السالمي وشريكه",
    },
    discipline: "ict",
  },
  {
    title: { en: "Bench Precast – Amaala", ar: "مقاعد سابقة الصب – أمالا" },
    client: {
      en: "Generic Engineering Technologies",
      ar: "Generic Engineering Technologies",
    },
    discipline: "civil",
  },
  {
    title: {
      en: "Steel Structure – SRACO Corniche",
      ar: "هيكل فولاذي – SRACO الكورنيش",
    },
    client: {
      en: "Designs & Construction Est.",
      ar: "مؤسسة التصاميم والإنشاءات",
    },
    discipline: "fabrication",
  },
  {
    title: { en: "Heat Exchanger Installation", ar: "تركيب مبادل حراري" },
    client: { en: "Smart Products Pipes Co", ar: "Smart Products Pipes Co" },
    discipline: "mechanical",
  },
  {
    title: {
      en: "Quality Building Construction",
      ar: "إنشاء مبنى الجودة (Quality Building)",
    },
    client: {
      en: "Faisal Steel – Al Tuwairqi Group",
      ar: "فيصل ستيل – مجموعة الطويرقي",
    },
    discipline: "civil",
  },
  // Profile p. 50, left table
  {
    title: {
      en: "Fabrication of Skid Ancillaries",
      ar: "تصنيع ملحقات القواعد (Skid)",
    },
    client: { en: "Petronash Arabia", ar: "بتروناش العربية" },
    discipline: "fabrication",
  },
  {
    title: {
      en: "Civil & Structural Works – Substation",
      ar: "أعمال مدنية وإنشائية – محطة فرعية",
    },
    client: { en: "Energia", ar: "Energia" },
    discipline: "civil",
  },
  {
    title: { en: "RMU Replacement – DACO", ar: "استبدال وحدة RMU – DACO" },
    client: { en: "Energia", ar: "Energia" },
    discipline: "electrical",
  },
  {
    title: {
      en: "Concrete Works – DG Foundations",
      ar: "أعمال خرسانية – أساسات المولدات (DG)",
    },
    client: { en: "Energia", ar: "Energia" },
    discipline: "civil",
  },
  {
    title: {
      en: "Amiral Project Civil / Fire Detection Works",
      ar: "مشروع أميرال – أعمال مدنية وكشف الحريق",
    },
    client: { en: "Sedres Contracting Co.", ar: "Sedres Contracting Co." },
    discipline: "fire",
  },
  {
    title: {
      en: "HVAC & Ducting Installation",
      ar: "تركيب التكييف ومجاري الهواء",
    },
    client: { en: "WESCOSA", ar: "ويسكوسا" },
    discipline: "mechanical",
  },
  {
    title: {
      en: "Kitchen Cabinets Installation",
      ar: "تركيب خزائن المطابخ",
    },
    client: { en: "SRACO", ar: "سراكو" },
    discipline: "fabrication",
  },
  {
    title: {
      en: "Ceiling Mount Brackets Installation",
      ar: "تركيب حوامل التثبيت السقفية",
    },
    client: {
      en: "Jeraisy Electronic Services",
      ar: "الجريسي للخدمات الإلكترونية",
    },
    discipline: "fabrication",
  },
  {
    title: { en: "Cable Pulling & Testing", ar: "سحب الكابلات واختبارها" },
    client: {
      en: "Al Hajry Overseas Co Ltd",
      ar: "Al Hajry Overseas Co Ltd",
    },
    discipline: "electrical",
  },
  {
    title: {
      en: "Chain Link Fence & Gates",
      ar: "سياج شبكي وبوابات",
    },
    client: {
      en: "Saudi Amana Contracting Co",
      ar: "أمانة السعودية للمقاولات",
    },
    discipline: "civil",
  },
  {
    title: {
      en: "Fulfillment Hub – SILZ Riyadh",
      ar: "مركز تجهيز الطلبات – SILZ الرياض",
    },
    client: {
      en: "Saudi Amana Contracting Co",
      ar: "أمانة السعودية للمقاولات",
    },
    discipline: "civil",
  },
  // Profile p. 50, right table
  {
    title: { en: "Cooling Tower Retrofit", ar: "إعادة تأهيل برج التبريد" },
    client: {
      en: "Al Abdulkarim Holding Co.",
      ar: "شركة العبدالكريم القابضة",
    },
    discipline: "roof",
  },
  {
    title: {
      en: "Schneider M340 Logic – Jafurah",
      ar: "منطق Schneider M340 – الجافورة",
    },
    client: { en: "ATCO", ar: "ATCO" },
    discipline: "digital",
  },
  {
    title: {
      en: "Fresh Air Duct Installation",
      ar: "تركيب مجاري الهواء النقي",
    },
    client: { en: "Rawabi Electric Co Ltd", ar: "الروابي الكهربائية" },
    discipline: "mechanical",
  },
  {
    title: { en: "Roof Repair (TESA-1)", ar: "إصلاح السقف (TESA-1)" },
    client: { en: "Tenaris Saudi Arabia LTD", ar: "تيناريس السعودية" },
    discipline: "civil",
  },
  {
    title: {
      en: "CCTV Hardware & Services",
      ar: "أجهزة وخدمات كاميرات المراقبة",
    },
    client: { en: "Tenaris Saudi Arabia LTD", ar: "تيناريس السعودية" },
    discipline: "ict",
  },
  {
    title: {
      en: "Furnace Exhaust Refurbishment",
      ar: "تجديد عادم الفرن",
    },
    client: { en: "Tenaris Saudi Arabia LTD", ar: "تيناريس السعودية" },
    discipline: "mechanical",
  },
  {
    title: {
      en: "CCTV Expansion – TSSP",
      ar: "توسعة كاميرات المراقبة – TSSP",
    },
    client: { en: "Tenaris Saudi Arabia LTD", ar: "تيناريس السعودية" },
    discipline: "ict",
  },
  {
    title: {
      en: "Electrical / Firefighting Installation – Avenues Mall",
      ar: "أعمال كهربائية ومكافحة حريق – الأفنيوز مول",
    },
    client: { en: "Gulf Advanced Cont Co", ar: "Gulf Advanced Cont Co" },
    discipline: "electrical",
  },
  {
    title: { en: "UPS & Network SNMP", ar: "UPS ومراقبة الشبكة SNMP" },
    client: { en: "Ingenia Polymers Co Ltd", ar: "إنجينيا بوليمرز" },
    discipline: "ict",
  },
  {
    title: { en: "Cooling Towers – Jeddah", ar: "أبراج تبريد – جدة" },
    client: { en: "Enjaz Energy", ar: "إنجاز للطاقة" },
    discipline: "roof",
  },
  {
    title: {
      en: "Parking Sunshade – Aramco",
      ar: "مظلة مواقف – أرامكو",
    },
    client: { en: "High Tech Contracting Co", ar: "هاي تك للمقاولات" },
    discipline: "civil",
  },
  {
    title: {
      en: "TAQA Well Services Phase 2",
      ar: "TAQA Well Services – المرحلة الثانية",
    },
    client: { en: "High Tech Contracting Co", ar: "هاي تك للمقاولات" },
    discipline: "civil",
  },
];
