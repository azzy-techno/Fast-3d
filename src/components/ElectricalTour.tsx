import { useTour } from "../store";
import {
  electricalStationAt,
  electricalStations,
} from "../scene/electricalTour";
const notes = [
  [
    "LV and power panels, presented as a complete installation bay.",
    "لوحات الجهد المنخفض والقوى ضمن منطقة تركيب متكاملة.",
  ],
  [
    "Smart ring main units and their switching assemblies.",
    "وحدات الربط الحلقي الذكية وتجهيزات الفصل والتوصيل.",
  ],
  [
    "A dedicated test bench beside the RMU installation.",
    "منضدة فحص مخصصة بجانب وحدات الربط الحلقي.",
  ],
  [
    "Transformer installation, mounting and alignment.",
    "تركيب المحولات وتثبيتها ومحاذاتها.",
  ],
  [
    "LV/MV joints and heat- and cold-shrink termination samples.",
    "وصلات الجهد المنخفض والمتوسط ونماذج نهايات الانكماش الحراري والبارد.",
  ],
  [
    "Cable drums, supported routes, pulling and laying.",
    "بكرات الكابلات ومساراتها وسحبها ومدّها.",
  ],
  [
    "Distribution boards and outgoing circuits.",
    "لوحات التوزيع والدوائر الخارجة.",
  ],
  [
    "Feeder pillars and smaller outdoor distribution enclosures.",
    "خزائن التغذية وخزائن التوزيع الخارجية الصغيرة.",
  ],
  [
    "The connection from the generator to the distribution board.",
    "توصيل المولد بلوحة التوزيع.",
  ],
  [
    "Inspection access and instruments for preventive servicing.",
    "مناطق الفحص وأجهزة الصيانة الوقائية.",
  ],
  [
    "Energy efficiency and a power-factor management demonstrator.",
    "كفاءة الطاقة ونموذج توضيحي لإدارة معامل القدرة.",
  ],
  [
    "Smart meter installation and configuration.",
    "تركيب العدادات الذكية وتهيئتها.",
  ],
  [
    "Test instruments and commissioning checks.",
    "أجهزة الفحص والتحقق أثناء الاختبار والتشغيل.",
  ],
  [
    "Industrial high-bay fixtures and their installation.",
    "تركيب وحدات الإنارة الصناعية للمساحات المرتفعة.",
  ],
  [
    "Indoor linear fittings and outdoor lighting assemblies.",
    "وحدات الإنارة الداخلية وتجهيزات الإنارة الخارجية.",
  ],
  [
    "A guarded industrial fan installation display.",
    "نموذج لتركيب مروحة صناعية مزودة بحماية.",
  ],
];
export function ElectricalTour({
  rtl,
  onSelect,
}: {
  rtl: boolean;
  onSelect: (at: number) => void;
}) {
  const station = useTour((s) => electricalStationAt(s.progress));
  if (!station) return null;
  const i = station.number - 1;
  return (
    <aside
      className="electrical-tour"
      aria-label={
        rtl ? "جولة الأعمال الكهربائية" : "Guided electrical floor tour"
      }
    >
      <p className="electrical-tour-kicker">
        {rtl ? station.categoryAr : station.category}
        <span>{String(station.number).padStart(2, "0")} / 16</span>
      </p>
      <h2>{rtl ? station.ar : station.title}</h2>
      <p>{notes[i][rtl ? 1 : 0]}</p>
      <div className="electrical-tour-actions">
        <button
          disabled={i === 0}
          onClick={() => onSelect(electricalStations[i - 1].at + 0.005)}
        >
          {rtl ? "السابق" : "Previous"}
        </button>
        <span>{rtl ? "اتبع مهندس فاست" : "Follow your FAST engineer"}</span>
        <button
          onClick={() =>
            onSelect(i === 15 ? 2.85 : electricalStations[i + 1].at + 0.005)
          }
        >
          {i === 15
            ? rtl
              ? "إلى المصعد"
              : "To the lift"
            : rtl
              ? "التالي"
              : "Next"}
        </button>
      </div>
      <nav
        aria-label={rtl ? "محطات الجولة الكهربائية" : "Electrical tour stops"}
      >
        {electricalStations.map((s) => (
          <button
            key={s.number}
            aria-label={rtl ? s.ar : s.title}
            aria-current={s.number === station.number ? "step" : undefined}
            onClick={() => onSelect(s.at + 0.005)}
          >
            {String(s.number).padStart(2, "0")}
          </button>
        ))}
      </nav>
    </aside>
  );
}
