import partners from "./partners.json";
export { partners };
export type AboutPanel = "story" | "certifications" | "approvals" | "partners";
export const aboutTabs: {
  id: AboutPanel;
  en: string;
  ar: string;
  number: string;
}[] = [
  { id: "story", en: "About FAST", ar: "عن فاست", number: "01" },
  { id: "certifications", en: "Certifications", ar: "الشهادات", number: "02" },
  {
    id: "approvals",
    en: "Approvals & registrations",
    ar: "الاعتمادات والتسجيلات",
    number: "03",
  },
  {
    id: "partners",
    en: "Technology partners",
    ar: "شركاء التقنية",
    number: "04",
  },
];
export const certifications = [
  {
    code: "9001",
    edition: "2015",
    name: "Quality management",
    ar: "إدارة الجودة",
    number: "CN-QMS-15252924",
  },
  {
    code: "14001",
    edition: "2015",
    name: "Environmental management",
    ar: "الإدارة البيئية",
    number: "CN-EMS-15252925",
  },
  {
    code: "45001",
    edition: "2018",
    name: "Occupational health & safety",
    ar: "الصحة والسلامة المهنية",
    number: "CN-OH&SMS-15252926",
  },
];
export const registrations = [
  {
    name: "Saudi Aramco",
    logo: "about/registrations/aramco.png",
    ar: "أرامكو السعودية",
    detail: "Approved vendor · 10112399",
    arDetail: "مورّد معتمد · 10112399",
  },
  {
    name: "Saudi Energy (SEC)",
    logo: "about/registrations/saudi-energy.png",
    ar: "السعودية للطاقة",
    detail: "Supplier registration · 2017011",
    arDetail: "تسجيل مورّد · 2017011",
  },
  { name: "Ma’aden", logo: "about/registrations/maaden.png", ar: "معادن" },
  { name: "Hadeed", logo: "about/registrations/hadeed.png", ar: "حديد" },
  {
    name: "Petro Rabigh",
    logo: "about/registrations/petro-rabigh.png",
    ar: "بترو رابغ",
  },
  {
    name: "Siemens Energy",
    logo: "about/registrations/siemens-energy.png",
    ar: "سيمنس للطاقة",
  },
  {
    name: "SAP Ariba Network",
    logo: "about/registrations/sap.png",
    ar: "شبكة SAP Ariba",
    detail: "Supplier network registration",
    arDetail: "تسجيل في شبكة الموردين",
  },
  {
    name: "L&T Hydrocarbon Saudi",
    logo: "about/registrations/lt.png",
    ar: "لارسن وتوبرو للهيدروكربونات السعودية",
  },
  {
    name: "EnergyTech",
    logo: "about/registrations/energytech.png",
    ar: "إنرجي تك",
  },
  {
    name: "King Fahd University of Petroleum & Minerals",
    logo: "about/registrations/kfupm.png",
    ar: "جامعة الملك فهد للبترول والمعادن",
  },
  {
    name: "Savola Group",
    logo: "about/registrations/savola.png",
    ar: "مجموعة صافولا",
  },
  {
    name: "Saudi AMANA Contracting",
    logo: "about/registrations/amana.png",
    ar: "أمانة للمقاولات السعودية",
  },
  {
    name: "Aujan Beverages Company",
    logo: "about/registrations/aujan.png",
    ar: "شركة العوجان للمشروبات",
  },
  { name: "Tenaris", logo: "about/registrations/tenaris.png", ar: "تيناريس" },
  {
    name: "Petronash Arabia",
    logo: "about/registrations/petronash.png",
    ar: "بتروناش العربية",
  },
];
export const additionalVendors = [
  "SABIC",
  "Red Sea Global",
  "Saudi Wells Technology Factory",
  "BRC",
  "Generic Engineering Technologies",
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
  "Abdul Mohsen Al Tamimi Contracting Co.",
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
export const credentials = [
  {
    name: "Local Content Certificate",
    ar: "شهادة المحتوى المحلي",
    detail: "LCGPA · Valid to July 2027",
    arDetail: "هيئة المحتوى المحلي · حتى يوليو 2027",
    url: "https://fast-arabia.com/assets/downloads/FAST-OandM-LCGPA-Local-Content-Certificate.pdf?v=20261101",
  },
  {
    name: "Civil Defense License",
    ar: "ترخيص الدفاع المدني",
    detail: "Salamah · 100001481 · Valid to August 2028",
    arDetail: "سلامة · 100001481 · حتى أغسطس 2028",
    url: "https://fast-arabia.com/assets/downloads/FAST-OandM-Civil-Defense-Activity-License.pdf?v=20261101",
  },
];
