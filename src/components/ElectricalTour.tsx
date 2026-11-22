import { galleries, type GalleryId } from "../scene/serviceGalleries";
import { useTour } from "../store";
const notes = [
  [
    "The two incoming breaker sections sit beside the stacked outgoing feeder drawers.",
    "تجاور حجرتا قواطع الدخول أدراج المغذيات الخارجة المكدّسة.",
  ],
  [
    "The front panels show the ring ways and breaker way. The remote terminal unit sits above the lineup.",
    "تُظهر الواجهات مفاتيح الحلقة ومخرج القاطع، وتعلوها وحدة التحكم الطرفية.",
  ],
  [
    "A secondary-injection set and test leads beside the RMU protection compartment.",
    "جهاز حقن ثانوي وأسلاك اختبار بجانب حجرة الحماية في وحدة الربط الحلقي.",
  ],
  [
    "The tank sits on wheels and steel rails. Fins line its sides and the insulated bushings rise above its lid.",
    "يرتكز الخزان على عجلات وقضبان فولاذية، وتحيط به زعانف التبريد وتعلوه عوازل التوصيل.",
  ],
  [
    "A stepped joint cutaway exposes the jacket, screen and conductor beside three terminated cores.",
    "يُظهر مقطع الوصلة غلاف الكابل وشاشته وموصله بجانب ثلاث نهايات معزولة.",
  ],
  [
    "The cable leaves the supported drum and runs across individual laying rollers.",
    "يمتد الكابل من البكرة المثبّتة على حامل عبر بكرات المدّ المتتابعة.",
  ],
  [
    "The open enclosure exposes three DIN rails of outgoing miniature circuit breakers.",
    "تكشف اللوحة المفتوحة ثلاثة صفوف من القواطع المصغّرة على قضبان التثبيت.",
  ],
  [
    "Vertical fuse ways and outgoing cables are visible in the open pillar beside the closed mini pillar.",
    "تظهر مخارج المصهرات الرأسية والكابلات في خزانة التغذية المفتوحة بجوار الخزانة الصغيرة المغلقة.",
  ],
  [
    "Follow the outgoing cables from the louvred generator enclosure to the separate distribution board.",
    "تتبّع الكابلات الخارجة من الغلاف ذي فتحات التهوية للمولد إلى لوحة التوزيع المنفصلة.",
  ],
  [
    "The thermal imager and its display illustrate a hot connection in the busbar inspection bay.",
    "تُظهر الكاميرا الحرارية وشاشتها مثالاً لوصلة ساخنة في محطة فحص قضبان التوزيع.",
  ],
  [
    "The controller sits beside two capacitor shelves. Each shelf has switching devices above the cans.",
    "تجاور وحدة التحكم رفّين من المكثفات، وتعلو المكثفات في كل رف أجهزة الفصل والتوصيل.",
  ],
  [
    "Each meter has a digital register and a current transformer around its insulated supply conductor.",
    "لكل عداد شاشة رقمية ومحول تيار يحيط بموصل التغذية المعزول.",
  ],
  [
    "The loop calibrator and engineering laptop accompany the PLC, I/O modules and field terminals.",
    "ترافق أداة معايرة الحلقات والحاسوب الهندسي المتحكم المبرمج ووحدات الإدخال والإخراج وأطراف التوصيل.",
  ],
  [
    "Suspended high-bays show their heat sinks. The forward-facing sample exposes the LED optics.",
    "تظهر مشتتات الحرارة في الوحدات المعلّقة، وتعرض العينة الأمامية عدسات الإنارة.",
  ],
  [
    "Compare the linear indoor fitting with the cantilevered street luminaire and its pole base.",
    "قارن وحدة الإنارة الخطية الداخلية بمصباح الشارع وذراعه وقاعدة عموده.",
  ],
  [
    "Swept blades rotate inside the flanged casing, behind a fixed guard on a welded mounting frame.",
    "تدور الريش المنحنية داخل الغلاف المزود بشفّات، خلف شبكة حماية ثابتة على إطار ملحوم.",
  ],
];
export function ElectricalTour({
  rtl,
  onSelect,
  service,
}: {
  rtl: boolean;
  service: GalleryId;
  onSelect: (at: number) => void;
}) {
  const gallery = galleries[service];
  const { stations } = gallery;
  const station = useTour((s) => gallery.stationAt(s.progress));
  if (!station) return null;
  const i = station.number - 1;
  return (
    <aside
      className="electrical-tour"
      aria-label={rtl ? `جولة ${gallery.ar}` : `Guided ${service} floor tour`}
    >
      <p className="electrical-tour-kicker">
        {rtl ? station.categoryAr : station.category}
        <span>
          {String(station.number).padStart(2, "0")} / {stations.length}
        </span>
      </p>
      <h2>{rtl ? station.ar : station.title}</h2>
      <p className="equipment-caption">
        {rtl ? station.componentAr : station.component}
      </p>
      <p>
        {"note" in station
          ? rtl
            ? station.noteAr
            : station.note
          : notes[i][rtl ? 1 : 0]}
      </p>
      <div className="electrical-tour-actions">
        <button
          disabled={i === 0}
          onClick={() => onSelect(stations[i - 1].at + 0.005)}
        >
          {rtl ? "السابق" : "Previous"}
        </button>
        <span>{rtl ? "اتبع مهندس فاست" : "Follow your FAST engineer"}</span>
        <button
          onClick={() =>
            onSelect(
              i === stations.length - 1
                ? gallery.start + 0.8
                : stations[i + 1].at + 0.005,
            )
          }
        >
          {i === stations.length - 1
            ? rtl
              ? "إلى المصعد"
              : "To the lift"
            : rtl
              ? "التالي"
              : "Next"}
        </button>
      </div>
      <nav
        aria-label={
          rtl ? `محطات جولة ${gallery.ar}` : `${gallery.name} tour stops`
        }
      >
        {stations.map((s) => (
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
