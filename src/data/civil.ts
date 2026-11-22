import { exhibitBay } from "./exhibitLayout";

// FAST Civil service page (capabilities 01–13) and 2026 company profile, pp. 11–12 and 49–50.
// Focus coordinates are metres above the bay floor, including the 0.16 m display plinth.
const exhibits = [
  [
    "Foundation & structural concrete works",
    "الأساسات والأعمال الخرسانية الإنشائية",
    "Footing mesh & column starters",
    "شبكة تسليح القاعدة وأشاير العمود",
    "At the cut end of the footing, two layers of crossing bars emerge from the pour. Follow the vertical starter bars up through the closed column ties.",
    "يظهر عند طرف القاعدة تسليح متعامد في اتجاهين. تتبّع أشاير العمود الرأسية داخل الكانات المغلقة.",
    [-0.25, 2.45, 0.28],
  ],
  [
    "Building construction & renovation",
    "إنشاء المباني وترميمها",
    "Propped lintel in a masonry opening",
    "عتب مدعّم فوق فتحة في جدار مبني",
    "The opening interrupts the courses of blockwork. Two adjustable props carry the timber head beneath the lintel during this stage of renovation.",
    "تقطع الفتحة مداميك البلوك. تحمل دعامتان قابلتان للضبط العارضة الخشبية أسفل العتب في هذه المرحلة من الترميم.",
    [0.78, 1.62, 0.25],
  ],
  [
    "Precast concrete installations",
    "تركيب الخرسانة مسبقة الصب",
    "Precast panel, sockets & lifting eyes",
    "لوح مسبق الصب ومجرى تثبيت وعُرى رفع",
    "One panel sits in the receiving channel. Its neighbour hangs clear of the channel so you can see the lifting inserts and the joint between panels.",
    "يستقر أحد اللوحين في مجرى التثبيت، بينما يعلّق الآخر فوق مجراه لتظهر عُرى الرفع والفاصل بين اللوحين.",
    [1.87, 3.12, 0],
  ],
  [
    "Waterproofing & structural repair",
    "العزل المائي والإصلاح الإنشائي",
    "Membrane upstand & crack injection ports",
    "رفعة غشاء العزل ومنافذ حقن الشق",
    "Trace the membrane from the slab up the wall. The exposed end reveals a crack with injection ports beside the stepped-back waterproofing layers.",
    "تتبّع غشاء العزل من البلاطة إلى الجدار. عند الطرف المكشوف يظهر شق مع منافذ حقن بجوار طبقات العزل المتدرجة.",
    [1.54, 1.39, 0.02],
  ],
  [
    "Earthworks & excavation",
    "الأعمال الترابية والحفر",
    "Benched excavation in section",
    "مقطع في حفر ذي مصاطب",
    "The cut face shows the formation level at the bottom, benches midway up the sides and survey stakes at the crest.",
    "يظهر المقطع منسوب التأسيس في القاع والمصاطب على الجانبين وأوتاد المساحة عند الحافة العلوية.",
    [1.13, 1.48, 1.02],
  ],
  [
    "Roadworks & asphalt works",
    "أعمال الطرق والأسفلت",
    "Asphalt pavement course cutbacks",
    "مقطع متدرج في طبقات الطريق",
    "Start at the marked wearing course and follow the steps down through the binder, aggregate base and subbase to the prepared ground.",
    "ابدأ بطبقة السطح ذات التخطيط ثم تتبّع الطبقة الرابطة والأساس الركامي وتحت الأساس وصولاً إلى التربة المجهزة.",
    [1.85, 1.3, 1.17],
  ],
  [
    "Utility & drainage systems installation",
    "تركيب شبكات المرافق والصرف",
    "Socketed drain & grated catch basin",
    "أنبوب صرف بوصلة جرسية وحوض تجميع شبكي",
    "Look into the open pipe socket, then across to the cutaway inlet. The grate spans the chamber above the sump where sediment can collect.",
    "انظر داخل الوصلة الجرسية للأنبوب ثم إلى مقطع حوض التجميع. تغطي الشبكة الحوض فوق القاع الذي تتجمع فيه الرواسب.",
    [-0.98, 1.84, 1.13],
  ],
  [
    "Fencing & boundary wall solutions",
    "الأسوار والجدران الحدودية",
    "Chain-link gate, hinges & diagonal brace",
    "بوابة شبكية بمفصلات ودعامة قطرية",
    "FAST records chain-link fencing and gates for Saudi Amana. The gate leaf has its own braced frame and two hinges on the post beside the fixed mesh.",
    "نفّذت فاست أسواراً وبوابات شبكية لأمانة السعودية. للبوابة إطار مدعّم ومفصلتان على القائم المجاور للشبك الثابت.",
    [-0.5, 2.42, 0.1],
  ],
  [
    "Parking shade design & installation",
    "تصميم مظلات المواقف وتركيبها",
    "Tensile parking canopy",
    "مظلة مواقف بغشاء مشدود",
    "FAST lists a parking sunshade at Aramco Abqaiq for High Tech Contracting. This study shows the span between the high and low membrane corners above the parking lines.",
    "تذكر فاست مشروع مظلة مواقف في بقيق أرامكو لصالح هاي تك للمقاولات. يوضح النموذج امتداد الغشاء بين زواياه المرتفعة والمنخفضة فوق خطوط المواقف.",
    [2.55, 3.1, 1.09],
  ],
  [
    "Landscaping & external works",
    "تنسيق المواقع والأعمال الخارجية",
    "Paving edge, dripline & planting bed",
    "حافة رصف وخط ري وحوض زراعة",
    "The kerb separates individual paving units from the raised planting bed. Follow the dark irrigation line around the rosettes.",
    "يفصل البردور بلاطات الرصف عن حوض الزراعة المرتفع. تتبّع خط الري الداكن حول النباتات.",
    [0.2, 0.87, 0.26],
  ],
  [
    "Industrial coatings & protective systems",
    "الطلاءات الصناعية وأنظمة الحماية",
    "Protective coating stages on a steel beam",
    "مراحل الطلاء الواقي على جائز فولاذي",
    "The same I-section shows bare steel, primer, intermediate coat and topcoat side by side. Follow the colour change across the web and its two flanges.",
    "يظهر المقطع الفولاذي نفسه بمراحل متجاورة من المعدن المكشوف إلى البطانة والطبقة الوسطى والطبقة النهائية. تتبّع تغير اللون على الجسم والجناحين.",
    [1.36, 1.52, 0.08],
  ],
  [
    "Epoxy flooring & protective coatings",
    "أرضيات الإيبوكسي والطلاءات الواقية",
    "Resin floor layers & coved skirting",
    "طبقات أرضية راتنجية ووزرة مقوّسة",
    "The exposed edge separates the concrete substrate from the resin layers. At the back, the floor finish curves into a continuous wall skirting.",
    "تكشف الحافة القاعدة الخرسانية وطبقات الراتنج فوقها. في الخلف ينحني التشطيب عند التقاء الأرضية بالجدار ليشكّل وزرة متصلة.",
    [0, 1.41, -0.87],
  ],
  [
    "Cathodic protection systems",
    "أنظمة الحماية الكاثودية",
    "Buried pipe, galvanic anode & test post",
    "أنبوب مدفون وأنود تضحية ونقطة قياس",
    "This above-ground cutaway exposes what is usually buried. The separate galvanic anode is bonded to the steel pipe, with a test post above the connection.",
    "يكشف المقطع أجزاء تكون مدفونة عادةً. يتصل أنود التضحية المنفصل بالأنبوب الفولاذي، وتعلو الوصلة نقطة قياس.",
    [1.62, 0.88, 0.51],
  ],
  [
    "DACO generator foundations",
    "أساسات مولدات منشأة داكو",
    "Generator plinth & anchor bolts",
    "قاعدة مولد ومسامير تثبيت",
    "Energia Model General Contracting · DACO Facility. FAST records concrete works for diesel-generator foundations. This section illustrates the bearing strips and projecting anchor bolts on a generator plinth.",
    "إنرجيا للمقاولات العامة · منشأة داكو. نفّذت فاست أعمالاً خرسانية لأساسات مولدات الديزل. يوضح المقطع شرائط الارتكاز ومسامير التثبيت البارزة فوق القاعدة.",
    [1.94, 1.8, 0.59],
  ],
  [
    "TESA-1 electrical room roof repair",
    "إصلاح سقف غرفة الكهرباء في تيسا 1",
    "Roof membrane & parapet termination",
    "غشاء عزل السطح وتثبيته عند الدروة",
    "Tenaris Saudi Arabia · TESA-1. FAST records an electrical room roof repair. This detail illustrates a replacement sheet turning up a parapet, with a termination bar above the roll.",
    "تيناريس السعودية · تيسا 1. يسجل ملف فاست إصلاح سقف غرفة الكهرباء. يوضح التفصيل غشاءً بديلاً يرتفع على الدروة ويثبّت بشريط فوق اللفافة.",
    [0.53, 2.05, -0.566],
  ],
  [
    "Amaala precast bench",
    "مقعد خرساني مسبق الصب في أمالا",
    "Precast seat & recessed supports",
    "مقعد مسبق الصب وركائز مرتدّة",
    "Generic Engineering Technologies · Amaala. FAST’s profile lists a precast bench. This study exposes the bearing interface between the rounded seat and the two recessed supports.",
    "جينيريك إنجينيرنغ تكنولوجيز · أمالا. يذكر ملف فاست مقعداً مسبق الصب. يُظهر النموذج موضع الارتكاز بين المقعد مستدير الحواف والركيزتين المرتدّتين.",
    [1.46, 1.28, 0.5],
  ],
] as const;

const groups = [
  [
    "structures",
    "Structures & construction",
    "الهياكل والإنشاءات",
    "structures.webp",
  ],
  [
    "groundworks",
    "Groundworks & infrastructure",
    "الأعمال الأرضية والبنية التحتية",
    "groundworks.webp",
  ],
  [
    "protection",
    "Coatings & protection",
    "الطلاءات والحماية",
    "protection.webp",
  ],
  [
    "projects",
    "Selected civil projects",
    "مشاريع مدنية مختارة",
    "projects.webp",
  ],
] as const;

export const civilStations = exhibits.map(
  ([title, ar, component, componentAr, note, noteAr, focus], i) => {
    const group = groups[i < 4 ? 0 : i < 10 ? 1 : i < 13 ? 2 : 3];
    return {
      title,
      ar,
      component,
      componentAr,
      note,
      noteAr,
      focus,
      category: group[1],
      categoryAr: group[2],
      number: i + 1,
      ...exhibitBay(5, i),
    };
  },
);
export const civilScope = groups.map(([id, title, ar, image]) => {
  const stations = civilStations.filter((s) => s.category === title);
  return {
    id,
    title,
    ar,
    image,
    start: stations[0].number,
    items: stations.map((s) => [s.title, s.ar] as const),
  };
});
