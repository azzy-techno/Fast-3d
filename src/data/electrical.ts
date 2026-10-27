/** User-confirmed scope; cross-checked against FAST's 2026 profiles.
 * Company profile p7; Electrical Pre-Qualification pp5–6. */
export const electricalScope = [
  {
    id: "contracting",
    title: "Electrical Contracting",
    ar: "المقاولات الكهربائية",
    start: 1,
    image: "contracting.webp",
    items: [
      ["LV & power panel installation", "تركيب لوحات الجهد المنخفض والقوى"],
      ["Smart RMU installation", "تركيب وحدات RMU الذكية"],
      ["RMU testing & commissioning", "اختبار وتشغيل وحدات RMU"],
      ["Transformer installation & alignment", "تركيب المحولات ومحاذاتها"],
      [
        "LV & MV cable termination & jointing",
        "إنهاء ووصل كابلات الجهد المنخفض والمتوسط",
      ],
      ["Cable pulling & laying", "سحب الكابلات ومدّها"],
      ["Distribution board (DB) installation", "تركيب لوحات التوزيع"],
      [
        "Feeder pillar & outdoor mini pillar setup",
        "تركيب خزائن التغذية وخزائن التوزيع الخارجية الصغيرة",
      ],
      [
        "Generator termination & connection with DB",
        "إنهاء توصيلات المولد وربطه بلوحة التوزيع",
      ],
      ["Preventive maintenance & servicing", "الصيانة الوقائية والخدمة"],
    ],
  },
  {
    id: "automation",
    title: "Electrical Automation",
    ar: "الأتمتة الكهربائية",
    start: 11,
    image: "automation.webp",
    items: [
      [
        "Energy efficiency & power factor management",
        "كفاءة الطاقة وإدارة معامل القدرة",
      ],
      [
        "Smart meter installation & configuration",
        "تركيب العدادات الذكية وتهيئتها",
      ],
      ["Testing & commissioning", "الاختبار والتشغيل"],
    ],
  },
  {
    id: "infrastructure",
    title: "LV & ELV Infrastructure",
    ar: "البنية التحتية للجهد المنخفض والمنخفض جداً",
    start: 14,
    image: "installation.webp",
    items: [
      ["Industrial lighting systems", "أنظمة الإنارة الصناعية"],
      [
        "Indoor & outdoor lighting installation",
        "تركيب الإنارة الداخلية والخارجية",
      ],
      ["Industrial fan installation", "تركيب المراوح الصناعية"],
    ],
  },
] as const;
