import type { Floor } from "./types";

/**
 * FAST Tower floors.
 * Company claims come only from the FAST O&M company profile 2026 (FAST_OM_2026_SA.pdf, "profile")
 * and the official site fast-arabia.com ("site"). Arabic follows the site's /ar/ pages where it exists.
 * Station ids match the hotspot ids modelled in each exhibit.
 */
export const floors: Floor[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // 01 About. Sources: profile p. 3 (introduction, sectors, credential badges),
  // p. 5 (supplier portal registrations), p. 6 (company services), pp. 25–26 (partners).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "about",
    level: "01",
    name: { en: "About FAST", ar: "عن FAST" },
    title: {
      en: "One accountable engineering partner",
      ar: "شريك هندسي واحد مسؤول",
    },
    intro: {
      en: "FAST O&M was established in 2017 and is headquartered in Dammam. We provide integrated engineering and industrial solutions across Saudi Arabia's most critical sectors.",
      ar: "تأسست FAST للتشغيل والصيانة عام 2017 ومقرها الدمام. نقدّم حلولاً هندسية وصناعية متكاملة عبر أهم القطاعات الحيوية في المملكة.",
    },
    href: "https://fast-arabia.com/",
    accent: "#2f8fd8",
    stations: [
      {
        id: "story",
        label: { en: "Our story", ar: "قصتنا" },
        title: { en: "Who FAST is", ar: "من نحن" },
        body: {
          en: "FAST Operations & Maintenance was established in 2017 and is headquartered in Dammam. We specialize in complex, multi-discipline project execution, with seamless coordination across all phases of delivery.",
          ar: "تأسست FAST للتشغيل والصيانة عام 2017 ومقرها الدمام. نتخصص في تنفيذ المشاريع المعقّدة متعددة التخصصات، مع تنسيق سلس في جميع مراحل التنفيذ.",
        },
      },
      {
        id: "credentials",
        label: { en: "Credentials", ar: "الاعتمادات" },
        title: { en: "Certified and registered", ar: "شهادات وتسجيلات" },
        body: {
          en: "ISO 9001, 14001 and 45001 certified. Commercial Registration CR 2050113965. Saudi Aramco Vendor Code 10112399. Saudi Energy Vendor Code 2017011. Local content certified by LCGPA.",
          ar: "حاصلون على شهادات ISO 9001 و14001 و45001. السجل التجاري 2050113965. رمز المورّد لدى أرامكو السعودية 10112399. رمز المورّد لدى السعودية للطاقة 2017011. وشهادة المحتوى المحلي من LCGPA.",
        },
      },
      {
        id: "registrations",
        label: { en: "Registrations", ar: "التسجيلات" },
        title: {
          en: "Supplier portal registrations",
          ar: "التسجيل في بوابات الموردين",
        },
        body: {
          en: "FAST is a registered and approved supplier with leading organizations across the Kingdom, among them Saudi Aramco, Saudi Energy (SEC), Ma'aden, Hadeed, Petro Rabigh and Siemens Energy.",
          ar: "FAST مورّد مسجّل ومعتمد لدى جهات رائدة في المملكة، منها أرامكو السعودية والسعودية للطاقة (SEC) ومعادن وحديد وبترو رابغ وسيمنس للطاقة.",
        },
      },
      {
        id: "partners",
        label: { en: "Partners", ar: "الشركاء" },
        title: {
          en: "International technology partners",
          ar: "الشركاء التقنيون الدوليون",
        },
        body: {
          en: "Our international technology partners bring global engineering to the Kingdom's industrial sector. FAST integrates their advanced technologies and delivers them locally.",
          ar: "ينقل شركاؤنا التقنيون الدوليون الهندسة العالمية إلى القطاع الصناعي في المملكة. تدمج FAST تقنياتهم المتقدمة وتنفّذها محلياً.",
        },
      },
      {
        id: "sectors",
        label: { en: "Sectors", ar: "القطاعات" },
        title: { en: "Sectors and Vision 2030", ar: "القطاعات ورؤية 2030" },
        body: {
          en: "We serve Oil & Gas, Petrochemicals, Power & Utilities, Manufacturing, Infrastructure, Marine and Government Projects. Aligned with Saudi Vision 2030, FAST supports industrial growth, localization and sustainable development.",
          ar: "نخدم قطاعات النفط والغاز والبتروكيماويات والطاقة والمرافق والتصنيع والبنية التحتية والقطاع البحري والمشاريع الحكومية. وانسجاماً مع رؤية السعودية 2030، تدعم FAST النمو الصناعي والتوطين والتنمية المستدامة.",
        },
      },
    ],
    // Profile p. 6 "Company Services"; category names as on fast-arabia.com/services.
    scope: [
      {
        title: {
          en: "General Contracting Services",
          ar: "خدمات المقاولات العامة",
        },
        items: [
          { en: "Electrical", ar: "الكهرباء" },
          { en: "Mechanical", ar: "الميكانيكا" },
          { en: "Civil", ar: "الأعمال المدنية" },
          { en: "Fabrication", ar: "التصنيع" },
          { en: "Fire Protection Systems", ar: "أنظمة الحماية من الحريق" },
        ],
      },
      {
        title: {
          en: "Technology & Digital Solutions",
          ar: "الحلول التقنية والرقمية",
        },
        items: [
          { en: "Information Technology", ar: "تقنية المعلومات" },
          { en: "Industrial Automation", ar: "الأتمتة الصناعية" },
          { en: "3D & Digital", ar: "الحلول ثلاثية الأبعاد والرقمية" },
          { en: "ERP Solutions", ar: "حلول ERP" },
        ],
      },
    ],
    photos: [
      {
        src: "photos/about-1.webp",
        alt: {
          en: "FAST-branded vehicle outside the head office building in Dammam",
          ar: "مركبة تحمل شعار FAST أمام مبنى المكتب الرئيسي في الدمام",
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 02 Electrical. Sources: profile pp. 7–8 (Electrical Contracting, 20 printed tiles),
  // fast-arabia.com/services/electrical (grouping and Arabic), profile pp. 49–50 (projects).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "electrical",
    level: "02",
    name: { en: "Electrical", ar: "الكهرباء" },
    title: { en: "Electrical Contracting", ar: "المقاولات الكهربائية" },
    intro: {
      en: "Design, installation, testing and commissioning of electrical systems for industrial facilities, from smart RMUs and transformers to LV and MV cabling, panels and lighting.",
      ar: "تصميم وتركيب واختبار وتشغيل الأنظمة الكهربائية للمنشآت الصناعية، من وحدات RMU الذكية والمحوّلات إلى كابلات الجهد المنخفض والمتوسط واللوحات والإنارة.",
    },
    href: "https://fast-arabia.com/services/electrical",
    accent: "#f2b544",
    stations: [
      {
        id: "rmu",
        label: { en: "Smart RMU", ar: "وحدة RMU ذكية" },
        title: { en: "Smart ring main unit", ar: "وحدة الحلقة الرئيسية الذكية" },
        body: {
          en: "A ring main unit switches and protects the medium-voltage ring that feeds a site. FAST installs smart RMUs, then tests and commissions them. Our completed projects include SRMU replacements.",
          ar: "تتولى وحدة الحلقة الرئيسية (RMU) فصل ووصل حلقة الجهد المتوسط المغذّية للموقع وحمايتها. تركّب FAST وحدات RMU الذكية ثم تختبرها وتشغّلها، ومن مشاريعنا المنجزة استبدال وحدات SRMU.",
        },
      },
      {
        id: "transformer",
        label: { en: "Transformer", ar: "المحوّل" },
        title: {
          en: "Transformer installation and alignment",
          ar: "تركيب المحوّلات ومحاذاتها",
        },
        body: {
          en: "The transformer steps the incoming voltage down to the level the plant uses. FAST carries out transformer installation and alignment, followed by testing and commissioning.",
          ar: "يخفض المحوّل الجهد الوارد إلى المستوى الذي تعمل به المنشأة. تنفّذ FAST تركيب المحوّلات ومحاذاتها، ثم الاختبار والتشغيل.",
        },
      },
      {
        id: "lvpanel",
        label: { en: "LV panel", ar: "لوحة الجهد المنخفض" },
        title: {
          en: "LV panels and distribution boards",
          ar: "لوحات الجهد المنخفض والتوزيع",
        },
        body: {
          en: "Low-voltage panels and distribution boards share power out to each load. FAST installs LV panels, power panels and distribution boards, and handles generator termination and connection with the DB.",
          ar: "توزّع لوحات الجهد المنخفض ولوحات التوزيع الطاقة على الأحمال. تركّب FAST لوحات الجهد المنخفض ولوحات الطاقة ولوحات التوزيع (DB)، وتنفّذ توصيل المولّدات وربطها بلوحة التوزيع.",
        },
      },
      {
        id: "cables",
        label: { en: "Cables", ar: "الكابلات" },
        title: {
          en: "Cable pulling, termination and jointing",
          ar: "سحب الكابلات وإنهاؤها ووصلها",
        },
        body: {
          en: "Cables carry power between the RMU, the transformer and the panels. FAST pulls and lays cable, then terminates and joints LV and MV cables.",
          ar: "تنقل الكابلات الطاقة بين وحدة RMU والمحوّل واللوحات. تنفّذ FAST سحب الكابلات ومدّها، ثم إنهاء ووصل كابلات الجهد المنخفض والمتوسط.",
        },
      },
      {
        id: "lighting",
        label: { en: "Lighting", ar: "الإنارة" },
        title: {
          en: "Lighting, pillars and smart meters",
          ar: "الإنارة وأعمدة التغذية والعدّادات الذكية",
        },
        body: {
          en: "FAST installs industrial, indoor and outdoor lighting, sets up feeder pillars and outdoor mini pillars, and installs and configures smart meters. Energy efficiency and power factor management belong to the same scope.",
          ar: "تركّب FAST الإنارة الصناعية والداخلية والخارجية، وتجهّز أعمدة التغذية والأعمدة الخارجية الصغيرة، وتركّب العدّادات الذكية وتهيّئها. ويشمل النطاق نفسه كفاءة الطاقة وإدارة معامل القدرة.",
        },
      },
    ],
    scope: [
      {
        title: { en: "Electrical Contracting", ar: "المقاولات الكهربائية" },
        items: [
          { en: "Smart RMU installation", ar: "تركيب وحدات RMU الذكية" },
          {
            en: "RMU testing and commissioning",
            ar: "اختبار وتشغيل وحدات RMU",
          },
          {
            en: "Transformer installation and alignment",
            ar: "تركيب المحوّلات ومحاذاتها",
          },
          { en: "LV panel installation", ar: "تركيب لوحات الجهد المنخفض" },
          { en: "Power panel installation", ar: "تركيب لوحات الطاقة" },
          {
            en: "Distribution board (DB) installation",
            ar: "تركيب لوحات التوزيع (DB)",
          },
          { en: "Cable pulling and laying", ar: "سحب ومدّ الكابلات" },
          {
            en: "Cable termination and jointing of LV & MV cables",
            ar: "إنهاء ووصل كابلات الجهد المنخفض والمتوسط",
          },
          {
            en: "Outdoor mini pillar installation",
            ar: "تركيب الأعمدة الخارجية الصغيرة",
          },
          { en: "Feeder pillar setup", ar: "تجهيز أعمدة التغذية" },
          {
            en: "Generator termination and connection with DB",
            ar: "توصيل المولّدات وربطها بلوحات التوزيع",
          },
          {
            en: "Preventive maintenance and servicing",
            ar: "الصيانة الوقائية والخدمة",
          },
        ],
      },
      {
        title: { en: "Electrical Automation", ar: "الأتمتة الكهربائية" },
        items: [
          {
            en: "Energy efficiency & power factor management",
            ar: "كفاءة الطاقة وإدارة معامل القدرة",
          },
          {
            en: "Smart meter installation & configuration",
            ar: "تركيب وتهيئة العدّادات الذكية",
          },
          { en: "Testing and commissioning", ar: "الاختبار والتشغيل" },
        ],
      },
      {
        title: {
          en: "LV & ELV Infrastructure",
          ar: "البنية التحتية للجهد المنخفض والخفيف",
        },
        items: [
          { en: "Industrial lighting systems", ar: "أنظمة الإنارة الصناعية" },
          {
            en: "Indoor and outdoor lighting installation",
            ar: "تركيب الإنارة الداخلية والخارجية",
          },
          { en: "Industrial fan installation", ar: "تركيب المراوح الصناعية" },
        ],
      },
    ],
    photos: [
      {
        src: "photos/electrical-1.webp",
        alt: {
          en: "FAST electrical crew working from a man-lift inside an industrial facility",
          ar: "فريق FAST الكهربائي يعمل من رافعة أفراد داخل منشأة صناعية",
        },
      },
      {
        src: "photos/electrical-2.webp",
        alt: {
          en: "Technicians working on cable connections at an open electrical panel",
          ar: "فنيون ينفّذون توصيلات الكابلات في لوحة كهربائية مفتوحة",
        },
      },
      {
        src: "photos/electrical-3.webp",
        alt: {
          en: "FAST technician laying cable across a facility roof",
          ar: "فني من FAST يمدّ كابلاً على سطح منشأة",
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 03 Mechanical. Sources: profile pp. 9–10 (Mechanical Contracting, 10 printed tiles),
  // fast-arabia.com/services/mechanical (grouping and Arabic), profile pp. 49–50 (projects).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "mechanical",
    level: "03",
    name: { en: "Mechanical", ar: "الميكانيكا" },
    title: { en: "Mechanical Contracting", ar: "المقاولات الميكانيكية" },
    intro: {
      en: "Supply, installation and maintenance of mechanical equipment, cooling towers and piping systems, including cooling tower retrofit. The cooling tower has its own exhibit on the roof.",
      ar: "توريد وتركيب وصيانة المعدات الميكانيكية وأبراج التبريد وأنظمة الأنابيب، بما في ذلك إعادة تأهيل أبراج التبريد. ولبرج التبريد معرضه الخاص على السطح.",
    },
    href: "https://fast-arabia.com/services/mechanical",
    accent: "#38b6a5",
    stations: [
      {
        id: "pumps",
        label: { en: "Pump skid", ar: "منصة المضخات" },
        title: {
          en: "Heavy equipment and machinery installation",
          ar: "تركيب المعدات والآلات الثقيلة",
        },
        body: {
          en: "This pump skid stands for the equipment we set in place on site. FAST carries out heavy equipment and machinery installations for industrial facilities.",
          ar: "تمثّل منصة المضخات هذه المعدات التي نثبّتها في مواقعها. تنفّذ FAST أعمال تركيب المعدات والآلات الثقيلة للمنشآت الصناعية.",
        },
      },
      {
        id: "piping",
        label: { en: "Piping", ar: "الأنابيب" },
        title: { en: "Piping and hot tapping", ar: "الأنابيب والربط الساخن" },
        body: {
          en: "Piping connects the equipment into one working system. FAST carries out piping installations and hot tapping works, where a new branch is connected to a line that stays in service.",
          ar: "تربط الأنابيب المعدات في منظومة واحدة. تنفّذ FAST تركيب الأنابيب وأعمال الربط الساخن، حيث يُوصَل فرع جديد بخط يبقى في الخدمة.",
        },
      },
      {
        id: "hvac",
        label: { en: "HVAC", ar: "التكييف" },
        title: { en: "HVAC services", ar: "خدمات التكييف" },
        body: {
          en: "The air handling unit and ductwork condition air and move it through a building. FAST provides HVAC services. Completed projects include HVAC and ducting installation for WESCOSA and fresh air duct installation for Rawabi Electric.",
          ar: "تهيّئ وحدة مناولة الهواء الهواء، وتنقله المجاري إلى أنحاء المبنى. تقدّم FAST خدمات التكييف، ومن مشاريعها المنجزة تركيب التكييف ومجاري الهواء لصالح ويسكوسا وتركيب مجاري الهواء النقي لصالح الروابي الكهربائية.",
        },
      },
      {
        id: "heater",
        label: { en: "Heater", ar: "السخّان" },
        title: {
          en: "Industrial heating equipment",
          ar: "معدات التسخين الصناعية",
        },
        body: {
          en: "Industrial heaters raise the temperature of a process fluid or gas. FAST supplies and services industrial heating equipment. Our completed projects include the supply of super heaters.",
          ar: "ترفع السخّانات الصناعية درجة حرارة سائل أو غاز في العملية. تورّد FAST معدات التسخين الصناعية وتقدّم خدماتها، ومن مشاريعنا المنجزة توريد مسخّنات فائقة.",
        },
      },
      {
        id: "compressor",
        label: { en: "Compressor", ar: "ضاغط الهواء" },
        title: { en: "Air compressor solutions", ar: "حلول ضواغط الهواء" },
        body: {
          en: "The compressor supplies compressed air to the plant. FAST provides air compressor solutions. The same mechanical scope covers steam trap surveys and water treatment plant design, supply and retrofit.",
          ar: "يزوّد الضاغط المنشأة بالهواء المضغوط. تقدّم FAST حلول ضواغط الهواء، ويشمل النطاق الميكانيكي نفسه فحوصات مصائد البخار وتصميم محطات معالجة المياه وتوريدها وإعادة تأهيلها.",
        },
      },
    ],
    scope: [
      {
        title: { en: "Cooling Towers", ar: "أبراج التبريد" },
        items: [
          { en: "Cooling tower design", ar: "تصميم أبراج التبريد" },
          {
            en: "Cooling tower supply & retrofit",
            ar: "توريد وإعادة تأهيل أبراج التبريد",
          },
        ],
      },
      {
        title: { en: "HVAC & Piping", ar: "التكييف والأنابيب" },
        items: [
          { en: "HVAC services", ar: "خدمات التكييف" },
          { en: "Piping installations", ar: "تركيب الأنابيب" },
          { en: "Hot tapping works", ar: "أعمال الربط الساخن" },
        ],
      },
      {
        title: {
          en: "Industrial Equipment & Plant",
          ar: "المعدات الصناعية والمنشآت",
        },
        items: [
          {
            en: "Heavy equipment & machinery installations",
            ar: "تركيب المعدات والآلات الثقيلة",
          },
          { en: "Air compressor solutions", ar: "حلول ضواغط الهواء" },
          {
            en: "Industrial heating equipment supply & service",
            ar: "توريد وخدمة معدات التسخين الصناعية",
          },
          {
            en: "Water treatment plant design, supply & retrofit",
            ar: "تصميم وتوريد وإعادة تأهيل محطات معالجة المياه",
          },
          { en: "Steam trap surveys", ar: "فحوصات مصائد البخار" },
        ],
      },
    ],
    photos: [
      {
        src: "photos/mechanical-1.webp",
        alt: {
          en: "Skid-mounted vessel in a steel frame loaded on a trailer",
          ar: "وعاء مثبّت على قاعدة داخل إطار فولاذي محمّل على مقطورة",
        },
      },
      {
        src: "photos/mechanical-2.webp",
        alt: {
          en: "Technicians connecting insulated ductwork to an air-conditioning unit",
          ar: "فنيون يوصّلون مجرى هواء معزولاً بوحدة تكييف",
        },
      },
      {
        src: "photos/mechanical-3.webp",
        alt: {
          en: "Mobile crane lifting equipment at an industrial plant",
          ar: "رافعة متحركة ترفع معدات في منشأة صناعية",
        },
      },
    ],
    partners: ["advance-cooling-towers"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 04 Fabrication. Sources: profile pp. 13–14 (Fabrication Services),
  // fast-arabia.com/services/fabrication (in-house yard, sandblasting & painting, site erection),
  // profile pp. 49–50 (projects).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "fabrication",
    level: "04",
    name: { en: "Fabrication", ar: "التصنيع" },
    title: { en: "Fabrication Services", ar: "خدمات التصنيع" },
    intro: {
      en: "Custom industrial fabrication from our own in-house fabrication yard, with welding and finishing capability, to meet a range of industrial needs.",
      ar: "تصنيع صناعي مخصّص من ساحة التصنيع الداخلية الخاصة بنا، بقدرات لحام وتشطيب، لتلبية مختلف الاحتياجات الصناعية.",
    },
    href: "https://fast-arabia.com/services/fabrication",
    accent: "#f28b3c",
    stations: [
      {
        id: "skid",
        label: { en: "Skid", ar: "القاعدة (Skid)" },
        title: { en: "Skid fabrication", ar: "تصنيع القواعد (Skid)" },
        body: {
          en: "A skid is a steel base frame that carries equipment as one transportable unit. FAST fabricates skids in-house. Completed work includes steel skid fabrication for Petronash Arabia and Saudi Well Technology Factory.",
          ar: "القاعدة (Skid) إطار فولاذي يحمل المعدات كوحدة واحدة قابلة للنقل. تصنّع FAST القواعد في ساحتها الداخلية، ومن أعمالها المنجزة تصنيع قواعد فولاذية لصالح بتروناش العربية ولصالح Saudi Well Technology Factory.",
        },
      },
      {
        id: "tank",
        label: { en: "Tank", ar: "الخزّان" },
        title: { en: "Tank fabrication", ar: "تصنيع الخزّانات" },
        body: {
          en: "Tanks store liquids on site. Tank fabrication is one of FAST's fabrication services, carried out at the in-house yard with its welding and finishing capability.",
          ar: "تخزّن الخزّانات السوائل في الموقع. وتصنيع الخزّانات من خدمات التصنيع لدى FAST، ويُنفَّذ في الساحة الداخلية بقدراتها في اللحام والتشطيب.",
        },
      },
      {
        id: "structure",
        label: { en: "Steel structure", ar: "الهيكل الفولاذي" },
        title: {
          en: "Heavy and light structural fabrication",
          ar: "تصنيع الهياكل الثقيلة والخفيفة",
        },
        body: {
          en: "Columns, beams and frames are prepared at the yard before they go to site. FAST delivers heavy and light structural fabrication. One completed example is the steel structure at SRACO Corniche.",
          ar: "تُجهَّز الأعمدة والجسور والإطارات في الساحة قبل نقلها إلى الموقع. تنفّذ FAST تصنيع الهياكل الثقيلة والخفيفة، ومن أعمالها المنجزة الهيكل الفولاذي في SRACO الكورنيش.",
        },
      },
      {
        id: "panel",
        label: { en: "Control panel", ar: "لوحة التحكم" },
        title: {
          en: "Stainless-steel control panel fabrication",
          ar: "تصنيع لوحات تحكم من الفولاذ المقاوم",
        },
        body: {
          en: "A stainless-steel enclosure houses and protects control equipment. FAST fabricates stainless-steel control panels. Completed work includes SS enclosures fabrication for Petronash Arabia.",
          ar: "تحتضن الحاوية المصنوعة من الفولاذ المقاوم للصدأ معدات التحكم وتحميها. تصنّع FAST لوحات تحكم من الفولاذ المقاوم للصدأ، ومن أعمالها المنجزة تصنيع حاويات من الفولاذ المقاوم لصالح بتروناش العربية.",
        },
      },
      {
        id: "kitchen",
        label: { en: "Kitchen equipment", ar: "معدات المطابخ" },
        title: {
          en: "Kitchen and ancillary fabrication",
          ar: "معدات المطابخ والتصنيع المساند",
        },
        body: {
          en: "FAST fabricates kitchen equipment and provides ancillary fabrication services. Completed work includes kitchen cabinets installation for SRACO and fabrication of skid ancillaries for Petronash Arabia.",
          ar: "تصنّع FAST معدات المطابخ وتقدّم خدمات التصنيع المساندة. ومن أعمالها المنجزة تركيب خزائن المطابخ لصالح سراكو وتصنيع ملحقات القواعد لصالح بتروناش العربية.",
        },
      },
    ],
    scope: [
      {
        title: { en: "Fabrication", ar: "التصنيع" },
        items: [
          { en: "Skid fabrication", ar: "تصنيع القواعد (Skid)" },
          { en: "Tank fabrication", ar: "تصنيع الخزّانات" },
          {
            en: "Heavy & light structural fabrication",
            ar: "تصنيع الهياكل الثقيلة والخفيفة",
          },
          {
            en: "Stainless steel control panel fabrication",
            ar: "تصنيع لوحات تحكم من الفولاذ المقاوم للصدأ",
          },
          {
            en: "Kitchen equipment fabrication",
            ar: "تصنيع معدات المطابخ",
          },
          {
            en: "Ancillary fabrication services",
            ar: "خدمات التصنيع المساندة",
          },
        ],
      },
      {
        // Listed on fast-arabia.com/services/fabrication (not on the profile page).
        title: { en: "Finishing & Site Works", ar: "التشطيب وأعمال الموقع" },
        items: [
          { en: "Sandblasting & painting", ar: "السفع الرملي والدهان" },
          { en: "Site erection & installation", ar: "التركيب في الموقع" },
        ],
      },
    ],
    photos: [
      {
        src: "photos/fabrication-1.webp",
        alt: {
          en: "Fabricators preparing a steel frame at the fabrication yard",
          ar: "عاملو تصنيع يجهّزون إطاراً فولاذياً في ساحة التصنيع",
        },
      },
      {
        src: "photos/fabrication-2.webp",
        alt: {
          en: "Fabricator grinding a structural steel frame",
          ar: "عامل تصنيع يجلخ إطاراً من الفولاذ الإنشائي",
        },
      },
      {
        src: "photos/fabrication-3.webp",
        alt: {
          en: "Steel base frame under fabrication at the yard",
          ar: "إطار قاعدة فولاذي قيد التصنيع في الساحة",
        },
      },
    ],
    partners: ["pct-group"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 05 Civil. Sources: profile pp. 11–12 (Civil Contracting; the near-duplicate tiles
  // "Fencing solutions" and "Precast installations" are folded into their full entries),
  // fast-arabia.com/services/civil (grouping and Arabic), profile pp. 49–50 (projects).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "civil",
    level: "05",
    name: { en: "Civil", ar: "الأعمال المدنية" },
    title: { en: "Civil Contracting", ar: "المقاولات المدنية" },
    intro: {
      en: "Civil and structural works supporting industrial and infrastructure projects across the Kingdom, from earthworks and foundations to roads, precast and external works.",
      ar: "الأعمال المدنية والإنشائية الداعمة للمشاريع الصناعية والبنية التحتية في المملكة، من الأعمال الترابية والأساسات إلى الطرق والخرسانة سابقة الصب والأعمال الخارجية.",
    },
    href: "https://fast-arabia.com/services/civil",
    accent: "#c9a26b",
    stations: [
      {
        id: "earthworks",
        label: { en: "Earthworks", ar: "الأعمال الترابية" },
        title: {
          en: "Earthworks, utilities and drainage",
          ar: "الأعمال الترابية والمرافق والصرف",
        },
        body: {
          en: "Every site starts in the ground. FAST carries out earthworks and excavation, and installs the utility and drainage systems that run below finished level.",
          ar: "يبدأ كل موقع من الأرض. تنفّذ FAST الأعمال الترابية والحفريات، وتركّب أنظمة المرافق والصرف التي تمتد تحت منسوب التشطيب.",
        },
      },
      {
        id: "foundation",
        label: { en: "Foundation", ar: "الأساسات" },
        title: {
          en: "Foundations and structural concrete",
          ar: "الأساسات والخرسانة الإنشائية",
        },
        body: {
          en: "Reinforced concrete foundations carry the loads of buildings and equipment. FAST delivers foundation and structural concrete works. Completed projects include concrete works for DG foundations and civil and structural works for a substation.",
          ar: "تحمل الأساسات الخرسانية المسلّحة أحمال المباني والمعدات. تنفّذ FAST أعمال الأساسات والخرسانة الإنشائية، ومن مشاريعها المنجزة أعمال خرسانية لأساسات المولدات (DG) وأعمال مدنية وإنشائية لمحطة فرعية.",
        },
      },
      {
        id: "precast",
        label: { en: "Precast", ar: "سابقة الصب" },
        title: {
          en: "Precast, fencing and boundary walls",
          ar: "الخرسانة سابقة الصب والأسوار",
        },
        body: {
          en: "Precast units arrive ready-made and are lifted into position. FAST installs precast concrete and provides fencing and boundary wall solutions. One completed project is chain link fence and gates for Saudi Amana Contracting.",
          ar: "تصل الوحدات سابقة الصب جاهزة وتُرفع إلى مواضعها. تركّب FAST الخرسانة سابقة الصب وتقدّم حلول الأسوار والجدران الحدودية، ومن مشاريعها المنجزة سياج شبكي وبوابات لصالح أمانة السعودية للمقاولات.",
        },
      },
      {
        id: "road",
        label: { en: "Roadworks", ar: "أعمال الطرق" },
        title: { en: "Roadworks and asphalt", ar: "أعمال الطرق والأسفلت" },
        body: {
          en: "Access roads and paved areas keep a facility moving. FAST carries out roadworks and asphalt works as part of its civil scope.",
          ar: "تُبقي طرق الوصول والمساحات المرصوفة حركة المنشأة مستمرة. تنفّذ FAST أعمال الطرق والأسفلت ضمن نطاقها المدني.",
        },
      },
      {
        id: "shade",
        label: { en: "Parking shade", ar: "مظلة المواقف" },
        title: {
          en: "Parking shades and external works",
          ar: "مظلات المواقف والأعمال الخارجية",
        },
        body: {
          en: "FAST designs and installs parking shades and completes landscaping and external works around them. A completed example is the parking sunshade at Aramco for High Tech Contracting.",
          ar: "تصمّم FAST مظلات المواقف وتركّبها، وتنفّذ تنسيق المواقع والأعمال الخارجية حولها. ومن أعمالها المنجزة مظلة مواقف في أرامكو لصالح هاي تك للمقاولات.",
        },
      },
    ],
    scope: [
      {
        title: { en: "Structures & Construction", ar: "الإنشاءات والمباني" },
        items: [
          {
            en: "Foundation & structural concrete works",
            ar: "أعمال الأساسات والخرسانة الإنشائية",
          },
          {
            en: "Building construction & renovation",
            ar: "إنشاء وترميم المباني",
          },
          {
            en: "Residential & non-residential infrastructure works",
            ar: "أعمال البنية التحتية السكنية وغير السكنية",
          },
          {
            en: "Precast concrete installations",
            ar: "تركيب الخرسانة سابقة الصب",
          },
          {
            en: "Waterproofing & structural repair",
            ar: "العزل والإصلاح الإنشائي",
          },
        ],
      },
      {
        title: {
          en: "Groundworks & Infrastructure",
          ar: "الأعمال الأرضية والبنية التحتية",
        },
        items: [
          { en: "Earthworks & excavation", ar: "الأعمال الترابية والحفريات" },
          { en: "Roadworks & asphalt works", ar: "أعمال الطرق والأسفلت" },
          {
            en: "Utility & drainage systems installation",
            ar: "تركيب أنظمة المرافق والصرف",
          },
          {
            en: "Fencing & boundary wall solutions",
            ar: "حلول الأسوار والجدران الحدودية",
          },
          {
            en: "Parking shade design & installation",
            ar: "تصميم وتركيب مظلات المواقف",
          },
          {
            en: "Landscaping & external works",
            ar: "تنسيق المواقع والأعمال الخارجية",
          },
        ],
      },
      {
        title: { en: "Coatings & Protection", ar: "الطلاءات والحماية" },
        items: [
          {
            en: "Industrial coatings & protective systems",
            ar: "الطلاءات الصناعية وأنظمة الحماية",
          },
          {
            en: "Epoxy flooring & protective coatings",
            ar: "أرضيات الإيبوكسي والطلاءات الواقية",
          },
          {
            en: "Cathodic protection systems",
            ar: "أنظمة الحماية الكاثودية",
          },
        ],
      },
    ],
    photos: [
      {
        src: "photos/civil-1.webp",
        alt: {
          en: "Reinforcement mesh laid for a concrete slab beside an industrial building",
          ar: "شبك تسليح ممدود لبلاطة خرسانية بجوار مبنى صناعي",
        },
      },
      {
        src: "photos/civil-2.webp",
        alt: {
          en: "Crew working on concrete foundations on site",
          ar: "فريق يعمل على أساسات خرسانية في الموقع",
        },
      },
      {
        src: "photos/civil-3.webp",
        alt: {
          en: "Block paving and chain link fencing works in progress",
          ar: "أعمال رصف بالبلاط المتداخل وتركيب سياج شبكي قيد التنفيذ",
        },
      },
    ],
    partners: ["beasy"],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 06 Fire. Sources: profile pp. 15–16 (Fire Safety Systems, 15 printed tiles),
  // fast-arabia.com/services/fire-protection (grouping, Arabic, foam systems),
  // profile pp. 49–50 (projects).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "fire",
    level: "06",
    name: { en: "Fire Protection", ar: "الحماية من الحريق" },
    title: { en: "Fire Safety Systems", ar: "أنظمة الحريق والسلامة" },
    intro: {
      en: "Fire and life-safety systems for industrial and commercial facilities, from system design and installation to testing, inspection and maintenance.",
      ar: "أنظمة كشف وإطفاء الحريق وسلامة الأرواح للمنشآت الصناعية والتجارية، من تصميم الأنظمة وتركيبها إلى الاختبار والفحص والصيانة.",
    },
    href: "https://fast-arabia.com/services/fire-protection",
    accent: "#e5483b",
    stations: [
      {
        id: "pumps",
        label: { en: "Fire pumps", ar: "مضخات الحريق" },
        title: {
          en: "Fire pump installation and testing",
          ar: "تركيب واختبار مضخات الحريق",
        },
        body: {
          en: "The fire pump set supplies the fire-water network with pressure when a system opens. FAST installs fire pumps and tests them.",
          ar: "تزوّد مجموعة مضخات الحريق شبكة مياه الإطفاء بالضغط عند تشغيل أي نظام. تركّب FAST مضخات الحريق وتختبرها.",
        },
      },
      {
        id: "riser",
        label: { en: "Valve station", ar: "محطة الصمامات" },
        title: {
          en: "Fire fighting and suppression systems",
          ar: "أنظمة مكافحة وإطفاء الحريق",
        },
        body: {
          en: "The valve station controls water flow from the pumps into each protected zone. FAST handles system design and engineering, then installs fire fighting and fire suppression systems.",
          ar: "تتحكم محطة الصمامات بتدفق المياه من المضخات إلى كل منطقة محمية. تتولى FAST تصميم الأنظمة وهندستها، ثم تركّب أنظمة مكافحة الحريق وأنظمة الإطفاء.",
        },
      },
      {
        id: "sprinklers",
        label: { en: "Sprinklers", ar: "الرشاشات" },
        title: {
          en: "Sprinkler systems installation",
          ar: "تركيب أنظمة الرشاشات",
        },
        body: {
          en: "A sprinkler head opens over a fire and discharges water directly onto it. FAST installs sprinkler systems, with the pipework run at ceiling level across the protected area.",
          ar: "ينفتح رأس الرشاش فوق الحريق ويصبّ الماء عليه مباشرة. تركّب FAST أنظمة الرشاشات، وتُمدّ أنابيبها عند مستوى السقف في المنطقة المحمية.",
        },
      },
      {
        id: "alarm",
        label: { en: "Fire alarm", ar: "إنذار الحريق" },
        title: { en: "Fire alarm systems", ar: "أنظمة إنذار الحريق" },
        body: {
          en: "Detectors and manual call points report to the fire alarm control panel. FAST installs fire alarm systems, then tests and commissions them.",
          ar: "ترسل الكواشف ونقاط النداء اليدوية إشاراتها إلى لوحة التحكم بإنذار الحريق. تركّب FAST أنظمة إنذار الحريق ثم تختبرها وتشغّلها.",
        },
      },
      {
        id: "hydrant",
        label: { en: "Hydrant", ar: "حنفية الحريق" },
        title: {
          en: "Hydrants, hose reels and maintenance",
          ar: "الحنفيات وبكرات الخراطيم والصيانة",
        },
        body: {
          en: "Hydrant and hose reel systems give responders water where it is needed. FAST also installs clean agent systems, supplies and refills fire extinguishers, and provides inspection services and annual maintenance contracts (AMC).",
          ar: "توفّر أنظمة الحنفيات وبكرات الخراطيم الماء حيث يُحتاج إليه. كما تركّب FAST أنظمة الإطفاء بالغاز النظيف، وتورّد طفايات الحريق وتعيد تعبئتها، وتقدّم خدمات الفحص وعقود الصيانة السنوية (AMC).",
        },
      },
    ],
    scope: [
      {
        title: { en: "Systems & Installation", ar: "الأنظمة والتركيب" },
        items: [
          { en: "System design & engineering", ar: "تصميم وهندسة الأنظمة" },
          {
            en: "Fire alarm systems installation",
            ar: "تركيب أنظمة إنذار الحريق",
          },
          {
            en: "Fire suppression systems installation",
            ar: "تركيب أنظمة إطفاء الحريق",
          },
          {
            en: "Fire fighting systems installation",
            ar: "تركيب أنظمة مكافحة الحريق",
          },
          {
            en: "Sprinkler systems installation",
            ar: "تركيب أنظمة الرشاشات",
          },
          {
            en: "Clean agent systems installation",
            ar: "تركيب أنظمة الإطفاء بالغاز النظيف",
          },
          {
            // Listed on fast-arabia.com/services/fire-protection (not on the profile page).
            en: "Foam systems supply and installation",
            ar: "توريد وتركيب أنظمة الرغوة",
          },
          {
            en: "Fire pump installation & testing",
            ar: "تركيب واختبار مضخات الحريق",
          },
          {
            en: "Hydrant & hose reel systems",
            ar: "أنظمة الحنفيات وبكرات الخراطيم",
          },
        ],
      },
      {
        title: {
          en: "Inspection, Testing & Maintenance",
          ar: "الفحص والاختبار والصيانة",
        },
        items: [
          {
            en: "Fire alarm testing & commissioning",
            ar: "اختبار وتشغيل أنظمة الإنذار",
          },
          { en: "Inspection services", ar: "خدمات الفحص" },
          {
            en: "Preventive & corrective maintenance",
            ar: "الصيانة الوقائية والتصحيحية",
          },
          {
            en: "Annual maintenance contracts (AMC)",
            ar: "عقود الصيانة السنوية (AMC)",
          },
          {
            en: "Emergency & breakdown support",
            ar: "دعم الطوارئ والأعطال",
          },
        ],
      },
      {
        title: { en: "Supply & Support", ar: "التوريد والدعم" },
        items: [
          {
            en: "Fire extinguisher supply & refilling",
            ar: "توريد وتعبئة طفايات الحريق",
          },
          {
            en: "Fire equipment supply & services",
            ar: "توريد وخدمات معدات الحريق",
          },
        ],
      },
    ],
    photos: [
      {
        src: "photos/fire-1.webp",
        alt: {
          en: "Installers on a mobile scaffold fitting fire-fighting pipework at ceiling level",
          ar: "فنيو تركيب على سقالة متحركة يثبّتون أنابيب مكافحة الحريق عند مستوى السقف",
        },
      },
      {
        src: "photos/fire-2.webp",
        alt: {
          en: "Fire-fighting pipework installed along a basement ceiling",
          ar: "أنابيب مكافحة الحريق مركّبة على امتداد سقف طابق سفلي",
        },
      },
      {
        src: "photos/fire-3.webp",
        alt: {
          en: "Technician checking the valve of a fire hose reel cabinet",
          ar: "فني يفحص صمام خزانة بكرة خرطوم الحريق",
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 07 Industrial ICT. Sources: profile pp. 17–20 (Information Technology: Hardware Services,
  // Software Services), fast-arabia.com/services/it-services (Arabic, structured cabling),
  // profile pp. 49–50 (projects).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "ict",
    level: "07",
    name: { en: "Industrial ICT", ar: "تقنية المعلومات الصناعية" },
    title: {
      en: "Information Technology Services",
      ar: "خدمات تقنية المعلومات",
    },
    intro: {
      en: "Hardware installation, low-current systems and digital solutions for industrial sites and offices, with software development and digital transformation services alongside.",
      ar: "تركيب الأجهزة وأنظمة التيار الخفيف والحلول الرقمية للمواقع الصناعية والمكاتب، إلى جانب خدمات تطوير البرمجيات والتحوّل الرقمي.",
    },
    href: "https://fast-arabia.com/services/it-services",
    accent: "#5aa9ff",
    stations: [
      {
        id: "servers",
        label: { en: "Server racks", ar: "خزائن الخوادم" },
        title: { en: "Server room setup", ar: "تجهيز غرف الخوادم" },
        body: {
          en: "Racks hold the servers and network equipment a site runs on. FAST sets up server rooms and provides server installation services.",
          ar: "تضم الخزائن الخوادم ومعدات الشبكة التي يعتمد عليها الموقع. تجهّز FAST غرف الخوادم وتقدّم خدمات تركيب الخوادم.",
        },
      },
      {
        id: "cctv",
        label: { en: "CCTV", ar: "كاميرات المراقبة" },
        title: { en: "CCTV and LED walls", ar: "كاميرات المراقبة وشاشات LED" },
        body: {
          en: "Cameras send live video to the monitoring screens. FAST installs and maintains CCTV security systems, and installs and integrates smart boards and LED walls. Completed projects include CCTV work for Tenaris and SLFE.",
          ar: "ترسل الكاميرات بثاً حياً إلى شاشات المراقبة. تركّب FAST أنظمة كاميرات المراقبة وتصونها، وتركّب السبورات الذكية وشاشات LED وتكاملها. ومن مشاريعها المنجزة أعمال كاميرات مراقبة لصالح تيناريس ولصالح SLFE.",
        },
      },
      {
        id: "access",
        label: { en: "Access control", ar: "التحكم بالدخول" },
        title: {
          en: "Access control, turnstiles and biometrics",
          ar: "التحكم بالدخول والبوابات الدوّارة والبصمة",
        },
        body: {
          en: "Readers, turnstiles and biometric terminals control who enters. FAST installs, tests and commissions access control systems, and provides turnstile access control and biometric installation services.",
          ar: "تتحكم القارئات والبوابات الدوّارة وأجهزة البصمة بمن يدخل. تركّب FAST أنظمة التحكم بالدخول وتختبرها وتشغّلها، وتقدّم خدمات تركيب بوابات الدخول الدوّارة وأنظمة البصمة.",
        },
      },
      {
        id: "network",
        label: { en: "Network", ar: "الشبكة" },
        title: {
          en: "System integration and AMC",
          ar: "تكامل الأنظمة وعقود الصيانة",
        },
        body: {
          en: "The network ties cameras, access control and servers into one system. FAST provides system integration services for low-current systems and supports them under annual maintenance contracts (AMC).",
          ar: "تربط الشبكة الكاميرات وأنظمة الدخول والخوادم في منظومة واحدة. تقدّم FAST خدمات تكامل الأنظمة لأنظمة التيار الخفيف وتدعمها بعقود الصيانة السنوية (AMC).",
        },
      },
      {
        id: "software",
        label: { en: "Software", ar: "البرمجيات" },
        title: { en: "Software services", ar: "الخدمات البرمجية" },
        body: {
          en: "Our software services cover website and mobile app development, business intelligence and IoT services, AI-based computer vision, cybersecurity solutions, cloud services and customized ERP systems.",
          ar: "تشمل خدماتنا البرمجية تطوير المواقع وتطبيقات الجوال، وذكاء الأعمال وخدمات إنترنت الأشياء، والرؤية الحاسوبية بالذكاء الاصطناعي، وحلول الأمن السيبراني، والخدمات السحابية، وأنظمة ERP المخصصة.",
        },
      },
    ],
    scope: [
      {
        title: { en: "Hardware Services", ar: "خدمات الأجهزة" },
        items: [
          {
            en: "CCTV security installation & maintenance",
            ar: "تركيب وصيانة كاميرات المراقبة",
          },
          {
            en: "Access control installations, testing & commissioning",
            ar: "تركيب أنظمة التحكم بالدخول واختبارها وتشغيلها",
          },
          {
            en: "Turnstile access control installation",
            ar: "تركيب بوابات الدخول الدوّارة",
          },
          {
            en: "Biometric installation services",
            ar: "خدمات تركيب أنظمة البصمة",
          },
          {
            en: "Smart board & LED wall installation & integration",
            ar: "تركيب وتكامل السبورات الذكية وشاشات LED",
          },
          { en: "Server room setup", ar: "تجهيز غرف الخوادم" },
          { en: "Server installation services", ar: "خدمات تركيب الخوادم" },
          { en: "System integration services", ar: "خدمات تكامل الأنظمة" },
          {
            en: "Annual maintenance contracts (AMC)",
            ar: "عقود الصيانة السنوية (AMC)",
          },
          {
            // Listed on fast-arabia.com/services/it-services (not on the profile page).
            en: "Structured cabling & networks",
            ar: "الكابلات المهيكلة والشبكات",
          },
        ],
      },
      {
        title: { en: "Software Services", ar: "الخدمات البرمجية" },
        items: [
          {
            en: "Website development & web hosting",
            ar: "تطوير المواقع والاستضافة",
          },
          { en: "Mobile app development", ar: "تطوير تطبيقات الجوال" },
          { en: "Customized ERP system", ar: "أنظمة ERP مخصصة" },
          {
            en: "Business intelligence & IoT services",
            ar: "ذكاء الأعمال وخدمات إنترنت الأشياء",
          },
          {
            en: "AI-based computer vision",
            ar: "الرؤية الحاسوبية بالذكاء الاصطناعي",
          },
          {
            en: "Machine learning, NLP, chatbots & testing solutions",
            ar: "تعلّم الآلة ومعالجة اللغات الطبيعية وروبوتات المحادثة وحلول الاختبار",
          },
          { en: "Cybersecurity solutions", ar: "حلول الأمن السيبراني" },
          { en: "Cloud services", ar: "الخدمات السحابية" },
          {
            en: "Digital transformation services",
            ar: "خدمات التحوّل الرقمي",
          },
          { en: "Blockchain solutions", ar: "حلول البلوك تشين" },
          { en: "FinTech solutions", ar: "حلول التقنية المالية" },
          { en: "Programming languages", ar: "لغات البرمجة" },
          { en: "Frameworks", ar: "أطر العمل البرمجية" },
          { en: "Digital marketing", ar: "التسويق الرقمي" },
          { en: "Fantasy sports projects", ar: "مشاريع الرياضات الخيالية" },
        ],
      },
    ],
    photos: [
      {
        src: "photos/ict-1.webp",
        alt: {
          en: "FAST team inspecting a network rack",
          ar: "فريق FAST يعاين خزانة شبكة",
        },
      },
      {
        src: "photos/ict-2.webp",
        alt: {
          en: "Patch cords being connected inside a network cabinet",
          ar: "توصيل كابلات الربط داخل خزانة شبكة",
        },
      },
      {
        src: "photos/ict-3.webp",
        alt: {
          en: "FAST technicians mounting a display screen on a wall",
          ar: "فنيو FAST يثبّتون شاشة عرض على جدار",
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 08 Digital Manufacturing = Industrial Automation + 3D Engineering & Digital Solutions
  // + ERP & Business Solutions. Sources: profile p. 21 (Industrial Automation & Smart
  // Manufacturing, incl. image captions), pp. 22–23 (3D Engineering & Digital Solutions),
  // p. 24 (ERP & Business Solutions), pp. 25–27 (partners, Meta Smart Factory modules),
  // fast-arabia.com/services/industrial-automation, /3d-digital, /erp-solutions
  // (delivery partners per service, Arabic).
  // Other official pages for this floor:
  //   https://fast-arabia.com/services/3d-digital
  //   https://fast-arabia.com/services/erp-solutions
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "digital",
    level: "08",
    name: { en: "Digital Manufacturing", ar: "التصنيع الرقمي" },
    title: {
      en: "Technology and digital solutions",
      ar: "الحلول التقنية والرقمية",
    },
    intro: {
      en: "Industrial Automation, 3D Engineering & Digital Solutions and ERP & Business Solutions on one floor, integrated and delivered locally with our international technology partners.",
      ar: "الأتمتة الصناعية والحلول الهندسية ثلاثية الأبعاد والرقمية وحلول ERP والأعمال في طابق واحد، تُدمج وتُنفَّذ محلياً مع شركائنا التقنيين الدوليين.",
    },
    href: "https://fast-arabia.com/services/industrial-automation",
    accent: "#8f7cf7",
    stations: [
      {
        id: "line",
        label: { en: "Robotic line", ar: "الخط الروبوتي" },
        title: {
          en: "Robotic automation and MES",
          ar: "الأتمتة الروبوتية وأنظمة MES",
        },
        body: {
          en: "A robot palletizes product while a Manufacturing Execution System tracks production in real time. FAST delivers robotic automation, palletizing systems and MES with partners Meta Smart Factory and Meta 2i.",
          ar: "يرصّ الروبوت المنتجات على المنصات بينما يتتبّع نظام تنفيذ التصنيع (MES) الإنتاج في الوقت الفعلي. تنفّذ FAST الأتمتة الروبوتية وأنظمة التستيف وأنظمة MES مع شريكيها Meta Smart Factory و Meta 2i.",
        },
      },
      {
        id: "vision",
        label: { en: "AI vision", ar: "الرؤية الحاسوبية" },
        title: {
          en: "AI monitoring and safety",
          ar: "المراقبة والسلامة بالذكاء الاصطناعي",
        },
        body: {
          en: "Cameras and AI watch machines and work areas. FAST's automation offering includes AI-powered machine monitoring and AI-based safety systems. Meta Smart Factory's computer vision module automates safety and quality checks.",
          ar: "تراقب الكاميرات والذكاء الاصطناعي الآلات ومناطق العمل. تشمل حلول الأتمتة لدى FAST مراقبة الآلات بالذكاء الاصطناعي وأنظمة السلامة المعتمدة عليه. وتؤتمت وحدة الرؤية الحاسوبية لدى Meta Smart Factory فحوص السلامة والجودة.",
        },
      },
      {
        id: "control",
        label: { en: "Control room", ar: "غرفة التحكم" },
        title: { en: "SCADA, IIoT and energy", ar: "SCADA وIIoT والطاقة" },
        body: {
          en: "One screen brings plant data together. FAST delivers SCADA integration, IIoT integration, Energy Management Systems and production visibility. Greenovative adds AI-driven energy optimization; AutomAssist connects plant documents, PLC signals and ERP records.",
          ar: "تجمع شاشة واحدة بيانات المصنع. تنفّذ FAST تكامل أنظمة SCADA وتكامل IIoT وأنظمة إدارة الطاقة (EMS) ورؤية الإنتاج. وتضيف Greenovative تحسين الطاقة بالذكاء الاصطناعي، وتربط AutomAssist وثائق المصنع وإشارات PLC وسجلات ERP.",
        },
      },
      {
        id: "twin",
        label: { en: "Digital twin", ar: "التوأم الرقمي" },
        title: {
          en: "From scan to digital twin",
          ar: "من المسح إلى التوأم الرقمي",
        },
        body: {
          en: "3D laser scanning and drone surveying capture a plant as a point cloud, which becomes a BIM model and a digital twin. FAST delivers this with Vasista Engineering Solutions, specialists in 3D scanning, BIM and digital twins.",
          ar: "يلتقط المسح الليزري ثلاثي الأبعاد والمسح بالطائرات المسيّرة المصنعَ في صورة سحابة نقاط تتحوّل إلى نموذج BIM وتوأم رقمي. تنفّذ FAST ذلك مع Vasista Engineering Solutions، المتخصصة في المسح ثلاثي الأبعاد وBIM والتوائم الرقمية.",
        },
      },
      {
        id: "erp",
        label: { en: "ERP", ar: "نظام ERP" },
        title: {
          en: "ERP and maintenance software",
          ar: "أنظمة ERP وبرمجيات الصيانة",
        },
        body: {
          en: "ERP runs the business side of a plant in one system. FAST implements Microsoft Dynamics 365, Infor CloudSuite and LN, Oracle and LS Central with Godrej Infotech. ManWinWin provides CMMS maintenance and asset management software.",
          ar: "يدير نظام ERP الجانب الإداري للمصنع في منظومة واحدة. تطبّق FAST أنظمة Microsoft Dynamics 365 وInfor CloudSuite وLN وOracle وLS Central مع Godrej Infotech. وتوفّر ManWinWin برنامج CMMS لإدارة الصيانة والأصول.",
        },
      },
    ],
    scope: [
      {
        // Profile p. 21.
        title: { en: "Industrial Automation", ar: "الأتمتة الصناعية" },
        items: [
          {
            en: "Manufacturing Execution Systems (MES)",
            ar: "أنظمة تنفيذ التصنيع (MES)",
          },
          { en: "SCADA integration", ar: "تكامل أنظمة SCADA" },
          {
            en: "IIoT integration",
            ar: "تكامل إنترنت الأشياء الصناعي (IIoT)",
          },
          {
            en: "AI operations platforms",
            ar: "منصات العمليات بالذكاء الاصطناعي",
          },
          {
            en: "Energy Management Systems (EMS)",
            ar: "أنظمة إدارة الطاقة (EMS)",
          },
          {
            en: "Robotic automation & palletizing systems",
            ar: "الأتمتة الروبوتية وأنظمة التستيف",
          },
          {
            en: "AI-driven energy optimization & Net-Zero monitoring",
            ar: "تحسين الطاقة بالذكاء الاصطناعي ومراقبة الحياد الكربوني",
          },
          { en: "Predictive maintenance", ar: "الصيانة التنبّؤية" },
        ],
      },
      {
        // Profile p. 22.
        title: {
          en: "3D Engineering & Digital",
          ar: "الهندسة ثلاثية الأبعاد والحلول الرقمية",
        },
        items: [
          { en: "3D Laser Scanning", ar: "المسح الليزري ثلاثي الأبعاد" },
          { en: "UAV / Drone Surveying", ar: "المسح بالطائرات بدون طيار" },
          { en: "BIM Modeling", ar: "نمذجة معلومات البناء (BIM)" },
          { en: "Point Cloud Processing", ar: "معالجة سحابة النقاط" },
          { en: "Digital Twin Solutions", ar: "حلول التوأم الرقمي" },
          { en: "3D Plant Modeling", ar: "نمذجة المصانع ثلاثية الأبعاد" },
          {
            en: "2D As-Built Drawings",
            ar: "رسومات ما بعد التنفيذ ثنائية الأبعاد",
          },
          { en: "Reverse Engineering", ar: "الهندسة العكسية" },
          {
            en: "Clash Detection & Coordination",
            ar: "كشف التعارضات والتنسيق",
          },
          {
            en: "Piping & Equipment Modeling",
            ar: "نمذجة الأنابيب والمعدات",
          },
          {
            en: "Engineering Visualization & VR",
            ar: "التصوير الهندسي والواقع الافتراضي",
          },
          { en: "Plant Layout Optimization", ar: "تحسين تخطيط المصانع" },
          {
            en: "Construction Progress Monitoring",
            ar: "مراقبة تقدّم الإنشاءات",
          },
          {
            en: "Asset Integrity Data Management",
            ar: "إدارة بيانات سلامة الأصول",
          },
          {
            en: "Facility Information Management (FIM)",
            ar: "إدارة معلومات المنشآت (FIM)",
          },
        ],
      },
      {
        // Profile p. 24.
        title: { en: "ERP & Business Solutions", ar: "حلول ERP والأعمال" },
        items: [
          {
            en: "ERP implementation & global rollout",
            ar: "تطبيق أنظمة ERP والنشر العالمي",
          },
          {
            en: "Microsoft Dynamics 365 (Business Central, F&O)",
            ar: "Microsoft Dynamics 365 (Business Central وF&O)",
          },
          {
            en: "Infor CloudSuite, LN & WMS",
            ar: "Infor CloudSuite وLN وWMS",
          },
          { en: "Oracle & LS Central", ar: "Oracle وLS Central" },
          {
            en: "ERP migration & cloud upgrades",
            ar: "ترحيل أنظمة ERP والترقية إلى السحابة",
          },
          {
            en: "Business consulting & digital transformation",
            ar: "الاستشارات الإدارية والتحوّل الرقمي",
          },
          {
            en: "RPA & intelligent automation",
            ar: "أتمتة العمليات الروبوتية (RPA) والأتمتة الذكية",
          },
          {
            en: "Business intelligence & data visualisation",
            ar: "ذكاء الأعمال وتصوير البيانات",
          },
          {
            en: "Managed services & support",
            ar: "الخدمات المدارة والدعم",
          },
        ],
      },
    ],
    // Field photographs from FAST's technology work (official site IT gallery); the site has
    // no FAST photographs specific to automation, 3D or ERP.
    photos: [
      {
        src: "photos/digital-1.webp",
        alt: {
          en: "FAST engineer at an operator desk with camera monitors overlooking a production hall",
          ar: "مهندس من FAST عند منصة تشغيل بشاشات كاميرات تطل على صالة إنتاج",
        },
      },
      {
        src: "photos/digital-2.webp",
        alt: {
          en: "FAST team installing equipment on a post at an industrial yard",
          ar: "فريق FAST يركّب معدات على عمود في ساحة صناعية",
        },
      },
      {
        src: "photos/digital-3.webp",
        alt: {
          en: "Technicians installing field equipment on a wall inside a plant",
          ar: "فنيون يركّبون معدات ميدانية على جدار داخل مصنع",
        },
      },
    ],
    partners: [
      "meta-smart-factory",
      "meta-2i",
      "automassist",
      "greenovative",
      "vision-lasertechnik",
      "vasista-engineering",
      "beasy",
      "godrej-infotech",
      "manwinwin",
      "ecosystem-informatics",
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // R Cooling Towers. Sources: profile pp. 9–10 (cooling tower design; supply & retrofit),
  // p. 26 (Advance Cooling Towers), pp. 49–50 (cooling tower projects),
  // fast-arabia.com/services/mechanical. Component descriptions adapted from the earlier
  // tour (src/data/cooling.ts); its SABIC Ar Razi and CTI ATC-105 statements are left out
  // because neither appears in the profile or on the site.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "roof",
    level: "R",
    name: { en: "Cooling Towers", ar: "أبراج التبريد" },
    title: {
      en: "A cooling tower, layer by layer",
      ar: "برج التبريد طبقةً بعد طبقة",
    },
    intro: {
      en: "One induced-draft cooling tower cell, opened layer by layer. FAST designs, supplies and retrofits cooling towers, and partners with Advance Cooling Towers for CTI-certified cooling tower design and engineered systems.",
      ar: "خلية برج تبريد واحدة بالسحب المستحث، تُفتح طبقةً بعد طبقة. تصمّم FAST أبراج التبريد وتورّدها وتعيد تأهيلها، وتتعاون مع شريكها Advance Cooling Towers في تصميم أبراج التبريد المعتمد من CTI والأنظمة الهندسية.",
    },
    href: "https://fast-arabia.com/services/mechanical",
    accent: "#4cc3e6",
    stations: [
      {
        id: "tower",
        label: { en: "Tower cell", ar: "خلية البرج" },
        title: { en: "The assembled cell", ar: "الخلية المجمّعة" },
        body: {
          en: "This induced-draft cell draws air up through falling water to cool it. Cooling tower design, supply and retrofit are FAST mechanical services, with retrofits completed at Dammam Airport and for Al Abdulkarim Holding.",
          ar: "تسحب هذه الخلية الهواء إلى أعلى عبر الماء الهابط لتبريده. وتصميم أبراج التبريد وتوريدها وإعادة تأهيلها من الخدمات الميكانيكية لدى FAST، وقد أنجزت إعادة تأهيل أبراج في مطار الدمام ولصالح شركة العبدالكريم القابضة.",
        },
      },
      {
        id: "fan",
        label: { en: "Fan", ar: "المروحة" },
        title: {
          en: "Fan stack and axial fan",
          ar: "فوهة المروحة والمروحة المحورية",
        },
        body: {
          en: "The axial fan sits inside the fan stack and draws air up through the cell. Fan assemblies are handled under FAST's cooling tower supply and retrofit scope.",
          ar: "تستقر المروحة المحورية داخل فوهة المروحة وتسحب الهواء إلى أعلى عبر الخلية. وتندرج مجموعات المراوح ضمن نطاق FAST لتوريد أبراج التبريد وإعادة تأهيلها.",
        },
      },
      {
        id: "drive",
        label: { en: "Drive", ar: "مجموعة الإدارة" },
        title: {
          en: "Motor, drive shaft and gearbox",
          ar: "المحرك وعمود الإدارة وعلبة التروس",
        },
        body: {
          en: "The motor turns a drive shaft into the right-angle gearbox beneath the fan, which lowers the speed and turns the blades. The drive comes under the same supply and retrofit scope.",
          ar: "يدير المحرك عمود الإدارة المتصل بعلبة التروس القائمة الزاوية أسفل المروحة، فتخفّض السرعة وتدير الريش. وتندرج مجموعة الإدارة ضمن نطاق التوريد وإعادة التأهيل نفسه.",
        },
      },
      {
        id: "distribution",
        label: { en: "Distribution", ar: "توزيع المياه" },
        title: {
          en: "Drift eliminators and spray nozzles",
          ar: "مانعات الانجراف وفوهات الرش",
        },
        body: {
          en: "Hot water enters through the distribution header and sprays from nozzles over the fill. Above them, drift eliminators catch droplets carried by the air. Internals like these are what a cooling tower retrofit renews.",
          ar: "يدخل الماء الساخن عبر مجمّع التوزيع ويُرشّ من الفوهات فوق الحشوات. وفوقها تلتقط مانعات انجراف الرذاذ القطرات التي يحملها الهواء. وهذه المكوّنات الداخلية هي ما تجدّده إعادة تأهيل برج التبريد.",
        },
      },
      {
        id: "fill",
        label: { en: "Fill", ar: "الحشوات" },
        title: { en: "Fill packs", ar: "حزم الحشوات" },
        body: {
          en: "Fill packs spread the water into thin films so it meets as much air as possible. Most of the cooling happens here. Our partner Advance Cooling Towers brings CTI-certified cooling tower design and engineered systems.",
          ar: "تنشر حزم الحشوات الماء في أغشية رقيقة ليلامس أكبر قدر ممكن من الهواء، وهنا يحدث معظم التبريد. ويقدّم شريكنا Advance Cooling Towers تصميم أبراج التبريد المعتمد من CTI والأنظمة الهندسية.",
        },
      },
      {
        id: "basin",
        label: { en: "Basin", ar: "الحوض" },
        title: { en: "Cold-water basin", ar: "حوض الماء البارد" },
        body: {
          en: "Cooled water collects in the basin and returns to the process through the outlet, while the make-up line replaces water lost to evaporation and drift. FAST's completed projects include cooling towers for Enjaz Energy in Jeddah.",
          ar: "يتجمّع الماء المبرّد في الحوض ويعود إلى العملية عبر المخرج، فيما يعوّض خط مياه التعويض الماء المفقود بالتبخّر والانجراف. ومن مشاريع FAST المنجزة أبراج تبريد لصالح إنجاز للطاقة في جدة.",
        },
      },
    ],
    scope: [
      {
        title: { en: "Cooling Towers", ar: "أبراج التبريد" },
        items: [
          { en: "Cooling tower design", ar: "تصميم أبراج التبريد" },
          {
            en: "Cooling tower supply & retrofit",
            ar: "توريد وإعادة تأهيل أبراج التبريد",
          },
        ],
      },
    ],
    photos: [
      {
        src: "photos/roof-1.webp",
        alt: {
          en: "Two FAST engineers on top of a cooling tower cell",
          ar: "مهندسان من FAST أعلى خلية برج تبريد",
        },
      },
      {
        src: "photos/roof-2.webp",
        alt: {
          en: "FAST engineer watching a crane lift a cooling tower fan",
          ar: "مهندس من FAST يتابع رفع مروحة برج تبريد بالرافعة",
        },
      },
      {
        src: "photos/roof-3.webp",
        alt: {
          en: "Cooling tower gear drive and fan hub staged on site",
          ar: "علبة تروس برج تبريد ومحور المروحة مجهّزان في الموقع",
        },
      },
    ],
    partners: ["advance-cooling-towers"],
  },
];
