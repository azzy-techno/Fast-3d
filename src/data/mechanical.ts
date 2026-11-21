// Capabilities and portfolio photographs from FAST O&M 2026 Saudi Arabia, pp. 9–10.
const groups = [
  ["thermal", "Thermal systems", "الأنظمة الحرارية", "cooling.webp"],
  ["machinery", "Plant & machinery", "معدات المصانع", "machinery.webp"],
  [
    "process",
    "Piping & water treatment",
    "الأنابيب ومعالجة المياه",
    "pipework.webp",
  ],
] as const;

const exhibits = [
  [
    "Cooling tower design",
    "تصميم أبراج التبريد",
    "Counterflow tower cutaway",
    "مقطع في برج تبريد معاكس التدفق",
    "Look beneath the fan stacks. The open bay reveals spray nozzles above the fill and the collection basin below.",
    "تُظهر الحجرة المفتوحة فوهات الرش فوق الحشوات وحوض التجميع أسفلها.",
    [-1.05, 1.62, 0.9],
  ],
  [
    "Cooling tower supply & retrofit",
    "توريد أبراج التبريد وتحديثها",
    "Fan rotor & replacement packs",
    "دوّار المروحة وحزم الاستبدال",
    "The exposed fan rotor stands beside removable fill and drift-eliminator packs.",
    "بجوار دوّار المروحة حزم الحشوات وفواصل الرذاذ القابلة للاستبدال.",
    [-1.23, 1.79, 0.45],
  ],
  [
    "HVAC services",
    "خدمات التدفئة والتهوية والتكييف",
    "Air handling unit",
    "وحدة مناولة الهواء",
    "Follow the air path from the filter bank through the finned coil to the supply fan.",
    "تتبّع مسار الهواء من المرشحات عبر الملف ذي الزعانف إلى مروحة الإمداد.",
    [-0.36, 1.68, 0.72],
  ],
  [
    "Industrial heating equipment supply & service",
    "توريد معدات التسخين الصناعي وصيانتها",
    "Shell & tube heat exchanger",
    "مبادل حراري بغلاف وأنابيب",
    "The tube bundle is partially withdrawn from the shell so you can see its return bends.",
    "تظهر انحناءات الرجوع في حزمة الأنابيب المسحوبة جزئياً من غلاف المبادل.",
    [2.47, 1.66, 0.4],
  ],
  [
    "Air compressor solutions",
    "حلول ضواغط الهواء",
    "Compressor & air receiver",
    "ضاغط وخزان هواء",
    "The motor and compressor sit over the horizontal receiver. A discharge line connects the compressor to the tank.",
    "يرتكز المحرك والضاغط فوق الخزان الأفقي ويصل خط الطرد الضاغط بالخزان.",
    [0.84, 1.77, 0.71],
  ],
  [
    "Heavy equipment & machinery installation",
    "تركيب المعدات والآلات الثقيلة",
    "Pump alignment skid",
    "قاعدة محاذاة المضخة",
    "A dial indicator spans the shaft coupling between the motor and pump to illustrate alignment during installation.",
    "يمتد مؤشر قياس فوق وصلة عمود الدوران بين المحرك والمضخة لتوضيح المحاذاة أثناء التركيب.",
    [0.2, 1.79, 0.26],
  ],
  [
    "Piping installations",
    "تركيب الأنابيب",
    "Flanged offset pipe spool",
    "مقطع أنبوب مزاح بشفّات",
    "Follow the change in elevation between the supported pipe runs. Bolted flanges mark the spool connections.",
    "تتبّع تغير المنسوب بين مقاطع الأنبوب على الحوامل. تحدّد الشفّات المثبتة بالمسامير نقاط الربط.",
    [0.19, 2.42, 0.4],
  ],
  [
    "Hot tapping works",
    "أعمال الثقب تحت الضغط",
    "Branch saddle & tapping machine",
    "سرج تفريع وماكينة ثقب",
    "The cut-in assembly rises from the split saddle through the isolation valve to the tapping machine.",
    "تعلو مجموعة التفريع السرج المنقسم، وتمر بصمام العزل وصولاً إلى ماكينة الثقب.",
    [0, 2.62, 0.25],
  ],
  [
    "Steam trap surveys",
    "فحص مصائد البخار",
    "Steam trap & ultrasonic probe",
    "مصيدة بخار ومسبار فوق صوتي",
    "The probe contacts the trap body. Its lead runs to the handheld inspection instrument.",
    "يلامس المسبار جسم المصيدة ويتصل بسلك بجهاز الفحص المحمول.",
    [0.18, 1.65, 0.25],
  ],
  [
    "Water treatment plant design, supply & retrofit",
    "تصميم محطات معالجة المياه وتوريدها وتحديثها",
    "Reverse osmosis skid",
    "وحدة تناضح عكسي",
    "The two upright prefilters sit beside three membrane pressure vessels and their common pipe manifold.",
    "تجاور المرشّحات الأولية الرأسية ثلاثة أوعية ضغط للأغشية ومجمّع الأنابيب المشترك.",
    [0.84, 2.45, 0.26],
  ],
] as const;

const positions = [
  [-21, 8],
  [0, 8],
  [21, 8],
  [21, 20],
  [-21, 20],
  [-21, 32],
  [21, 32],
  [21, 44],
  [0, 44],
  [-21, 44],
] as const;
export const mechanicalStations = exhibits.map(
  ([title, ar, component, componentAr, note, noteAr, focus], i) => {
    const group = groups[i < 4 ? 0 : i < 6 ? 1 : 2];
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
      x: positions[i][0],
      z: positions[i][1],
      at: 3.05 + i * 0.072,
      end: 3.071 + i * 0.072,
    };
  },
);
export const mechanicalScope = groups.map(([id, title, ar, image]) => {
  const stations = mechanicalStations.filter((s) => s.category === title);
  return {
    id,
    title,
    ar,
    image,
    start: stations[0].number,
    items: stations.map((s) => [s.title, s.ar] as const),
  };
});
