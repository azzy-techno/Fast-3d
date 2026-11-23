import partners from "./partners.json";
import { exhibitBay } from "./exhibitLayout";

// FAST's partner directory supplies the partner names, logos, links and service descriptions.
const sections = [
  ["meta-2i", 1],
  ["meta-smart-factory", 3],
  ["automassist", 6],
  ["manwinwin", 8],
  ["godrej-infotech", 10],
  ["greenovative", 12],
  ["fast-vision", 15],
] as const;
const groups = sections.map(([id, start]) => {
  if (id === "fast-vision")
    return {
      id,
      start,
      title: "FAST · Computer vision",
      ar: "فاست · الرؤية الحاسوبية",
      description:
        "FAST lists safety-line detection with AI computer vision for human and forklift presence at Tenaris.",
      descriptionAr:
        "تسجّل فاست مشروعاً لتيناريس لرصد خطوط السلامة ووجود الأفراد والرافعات الشوكية بالرؤية الحاسوبية.",
      url: "https://fast-arabia.com/services/industrial-automation#projects",
      logo: null,
    };
  const partner = partners.find((p) => p.id === id);
  if (!partner) throw new Error(`Missing FAST partner record: ${id}`);
  return {
    id,
    start,
    title: partner.name,
    ar: partner.arName,
    description: partner.description,
    descriptionAr: partner.arDescription,
    url: partner.url,
    logo: partner.logo,
  };
});

const exhibits = [
  [
    "Shop-floor data capture",
    "التقاط بيانات الإنتاج",
    "Counting sensor & roller conveyor",
    "حساس عدّ وناقل ببكرات",
    "Meta 2i integrates manufacturing execution systems (MES). The sensor over this conveyor illustrates a production count captured at the line.",
    "تدمج ميتا 2i أنظمة تنفيذ التصنيع. ويوضّح الحساس فوق الناقل التقاط عدد القطع عند خط الإنتاج.",
    [0.51, 2.28, 0.18],
  ],
  [
    "MES and ERP integration",
    "تكامل نظامَي التصنيع والموارد",
    "Production order & label printer",
    "أمر إنتاج وطابعة ملصقات",
    "A production order on the terminal corresponds to a labelled batch. This illustrates Meta 2i’s integration of shop-floor data with enterprise resource planning and production performance reporting.",
    "يرتبط أمر الإنتاج على الشاشة بدفعة تحمل ملصقاً. يوضّح ذلك ربط بيانات الورشة بتخطيط الموارد ومتابعة أداء الإنتاج ضمن نطاق ميتا 2i.",
    [1.05, 1.34, 0.512],
  ],
  [
    "Production and supply chain planning",
    "تخطيط الإنتاج وسلسلة الإمداد",
    "APS schedule & batch queue",
    "جدول تخطيط متقدم وطابور دفعات",
    "Meta Smart Factory lists advanced planning and scheduling (APS) and supply chain planning (SCP). The coloured batches correspond to jobs occupying different slots in the schedule.",
    "تشمل خدمات ميتا سمارت فاكتوري التخطيط والجدولة المتقدمين وتخطيط سلسلة الإمداد. تمثّل الدفعات الملونة وظائف تشغل فترات مختلفة في الجدول.",
    [0, 2.15, -0.036],
  ],
  [
    "MES and equipment effectiveness",
    "تنفيذ التصنيع وفعالية المعدات",
    "Rotary filling cell & OEE display",
    "خلية تعبئة دوّارة وشاشة فعالية المعدات",
    "The filling cell makes the production cycle visible. The adjacent display illustrates overall equipment effectiveness (OEE), one of Meta Smart Factory’s smart manufacturing services.",
    "توضّح خلية التعبئة دورة الإنتاج. وتعرض الشاشة مثالاً على الفعالية الإجمالية للمعدات، وهي من خدمات التصنيع الذكي لدى ميتا سمارت فاكتوري.",
    [-0.73, 2.21, 0.08],
  ],
  [
    "Industrial IoT integration",
    "تكامل إنترنت الأشياء الصناعي",
    "Motor sensor & industrial gateway",
    "حساس محرك وبوابة صناعية",
    "Trace the sensor lead from the motor to the gateway. The adjacent display represents a machine signal becoming available to a connected production system.",
    "تتبّع سلك الحساس من المحرك إلى البوابة. وتمثّل الشاشة إتاحة إشارة الآلة داخل نظام إنتاج متصل.",
    [-1.04, 1.77, 0.25],
  ],
  [
    "Plant document intelligence",
    "استخراج المعرفة من وثائق المصنع",
    "Equipment manuals & AI workspace",
    "أدلة المعدّات ومساحة عمل بالذكاء الاصطناعي",
    "AutomAssist connects plant documentation to its AI operations platform. The manuals beside the terminal represent the equipment knowledge available to an operator.",
    "تربط أوتوم أسيست وثائق المصنع بمنصتها التشغيلية للذكاء الاصطناعي. تمثّل الأدلة بجانب الشاشة المعرفة المتاحة للمشغّل عن المعدّات.",
    [-1.22, 1.85, 0.281],
  ],
  [
    "PLC signals and ERP context",
    "إشارات المتحكم وبيانات الموارد",
    "PLC input rack & operations console",
    "وحدات دخل للمتحكم ومنصّة تشغيل",
    "The I/O modules represent PLC signals. AutomAssist brings these signals together with plant documents and ERP records so an operations team can review them in context.",
    "تمثّل وحدات الإدخال والإخراج إشارات المتحكم. تجمع أوتوم أسيست تلك الإشارات مع وثائق المصنع وسجلات تخطيط الموارد لتراجعها فرق التشغيل ضمن سياقها.",
    [-1.61, 1.77, 0.308],
  ],
  [
    "Asset register and equipment history",
    "سجل الأصول وتاريخ المعدّات",
    "Tagged pump & CMMS register",
    "مضخة معرّفة وسجل إدارة صيانة",
    "The pump carries an equipment tag that corresponds to an asset record. ManWinWin’s computerized maintenance management system (CMMS) includes asset registers and preventive maintenance.",
    "تحمل المضخة بطاقة تعريف تقابل سجلاً للأصل. يشمل نظام مان وين وين المحوسب لإدارة الصيانة سجلات الأصول والصيانة الوقائية.",
    [-1.03, 1.63, 0.292],
  ],
  [
    "Work orders and reliability KPIs",
    "أوامر العمل ومؤشرات الموثوقية",
    "Maintenance cart & work-order board",
    "عربة صيانة ولوحة أوامر عمل",
    "The parts cart sits beside a planned work order. ManWinWin links maintenance planning and work orders with reliability indicators for the equipment fleet.",
    "توضع قطع الصيانة بجوار أمر عمل مخطّط له. يربط مان وين وين خطط الصيانة وأوامر العمل بمؤشرات موثوقية المعدّات.",
    [1.46, 1.9, 0.064],
  ],
  [
    "ERP implementation",
    "تطبيق أنظمة تخطيط الموارد",
    "Receiving pallet & ERP stock receipt",
    "منصة استلام وقيد مخزون",
    "Godrej Infotech provides enterprise ERP implementation. The barcode identifies incoming stock and the receipt screen illustrates its entry in an inventory workflow.",
    "تقدم جودريج إنفوتك خدمات تطبيق تخطيط موارد المؤسسات. يعرّف الرمز الشريطي البضاعة الواردة وتوضّح الشاشة تسجيل الاستلام ضمن سير عمل المخزون.",
    [-0.65, 1.48, 0.55],
  ],
  [
    "Custom software and digital transformation",
    "البرمجيات المخصصة والتحول الرقمي",
    "Field approval & enterprise workstation",
    "اعتماد ميداني ومحطة عمل مؤسسية",
    "The tablet and workstation show the same illustrative approval record. This represents Godrej Infotech’s software development and enterprise digital transformation services.",
    "يعرض الجهاز اللوحي ومحطة العمل سجل الاعتماد التوضيحي نفسه. يمثّل ذلك خدمات جودريج إنفوتك لتطوير البرمجيات والتحول الرقمي للمؤسسات.",
    [1.17, 1.85, 0.124],
  ],
  [
    "Energy monitoring",
    "مراقبة الطاقة",
    "Three-phase metering assembly",
    "مجموعة قياس ثلاثية الأطوار",
    "The three current transformers surround the phase conductors. Their measurements illustrate the inputs to Greenovative’s energy optimisation and monitoring services.",
    "تحيط محوّلات التيار الثلاثة بموصلات الأطوار. تمثّل قياساتها بيانات تدخل في خدمات غرينوفيتيف لمراقبة الطاقة وتحسين استخدامها.",
    [-0.82, 1.86, 0.16],
  ],
  [
    "AI-driven energy optimisation",
    "تحسين استهلاك الطاقة بالذكاء الاصطناعي",
    "Fan load & energy comparison",
    "حمل مروحة ومقارنة للطاقة",
    "Use the fan as an example of an industrial load. The display compares demand by shift to illustrate Greenovative’s AI-driven energy optimisation work.",
    "تمثّل المروحة حملاً صناعياً. تقارن الشاشة الطلب بين الورديات لتوضيح نطاق غرينوفيتيف في تحسين استخدام الطاقة بالذكاء الاصطناعي.",
    [-0.76, 1.38, 0.54],
  ],
  [
    "Sustainability and net-zero monitoring",
    "تتبّع الاستدامة ومراقبة الحياد الكربوني",
    "Plant energy model & trend monitor",
    "نموذج طاقة المنشأة وشاشة الاتجاهات",
    "The plant model represents energy use and on-site generation. Greenovative tracks sustainability and progress toward net zero. The trend shown here is illustrative.",
    "يمثّل النموذج استهلاك الطاقة وتوليدها في الموقع. تتتبّع غرينوفيتيف الاستدامة والتقدم نحو الحياد الكربوني. الاتجاه المعروض توضيحي.",
    [-1.27, 1.377, 0.1],
  ],
  [
    "Safety-line detection",
    "رصد خطوط السلامة",
    "Camera & pedestrian safety lane",
    "كاميرا وممر سلامة للمشاة",
    "FAST’s automation portfolio lists a Tenaris AI vision project for safety-line detection. This demonstration shows a camera observing a marked lane and a pedestrian.",
    "يسجّل ملف الأتمتة لدى فاست مشروع رؤية حاسوبية لتيناريس لرصد خطوط السلامة. توضح المحطة كاميرا تراقب ممراً محدداً وأحد المشاة.",
    [-0.53, 1.29, 0.3],
  ],
  [
    "Human and forklift presence",
    "رصد وجود الأفراد والرافعات الشوكية",
    "Forklift presence & marked crossing",
    "رصد رافعة شوكية عند معبر محدد",
    "The second view of the FAST example shows a forklift beside the marked lane. The screen represents a presence observation, with an illustrative layout and sample data.",
    "يعرض المنظور الثاني من مثال فاست رافعة شوكية بجوار الممر المحدد. تمثّل الشاشة رصد الوجود في تخطيط توضيحي وببيانات تجريبية.",
    [0.67, 0.67, 0.335],
  ],
] as const;
export const manufacturingStations = exhibits.map(
  ([title, ar, component, componentAr, note, noteAr, focus], i) => {
    const number = i + 1;
    const section = groups.find(
      (_, index) => number < (groups[index + 1]?.start ?? Infinity),
    )!;
    return {
      number,
      title,
      ar,
      component,
      componentAr,
      note,
      noteAr,
      focus,
      category: section.title,
      categoryAr: section.ar,
      ...exhibitBay(8, i),
    };
  },
);
export const manufacturingScope = groups.map((group) => ({
  ...group,
  image: "scope-1.webp",
  items: manufacturingStations
    .filter((s) => s.category === group.title)
    .map((s) => [s.title, s.ar] as const),
}));
