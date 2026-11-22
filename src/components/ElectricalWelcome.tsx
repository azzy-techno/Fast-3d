import { useTour } from "../store";
import { ElectricalScope } from "./ElectricalScope";
export function ElectricalWelcome({
  rtl,
  onEnter,
  mechanical = false,
  onLift,
  onProjects,
}: {
  rtl: boolean;
  mechanical?: boolean;
  onEnter: () => void;
  onLift: () => void;
  onProjects?: () => void;
}) {
  const visible = useTour((s) =>
    mechanical
      ? s.progress >= 3 && s.progress < 3.012
      : s.progress >= 1.96 && s.progress < 2.012,
  );
  if (!visible) return null;
  return (
    <aside
      className="electrical-welcome"
      data-lenis-prevent
      aria-label={
        mechanical
          ? rtl
            ? "مقدمة الخدمات الميكانيكية"
            : "Mechanical service introduction"
          : rtl
            ? "مقدمة الخدمات الكهربائية"
            : "Electrical service introduction"
      }
    >
      <span>
        {mechanical ? "02 / FAST MECHANICAL" : "01 / FAST ELECTRICAL"}
      </span>
      <h2>
        {mechanical
          ? rtl
            ? "هندسة الأنظمة الميكانيكية"
            : "Inside the mechanical plant"
          : rtl
            ? "الطاقة. التحكم. الربط."
            : "Power. Control. Connection."}
      </h2>
      <p>
        {mechanical
          ? rtl
            ? "رافق مهندس فاست في 16 محطة تشمل عشر خدمات ميكانيكية وستة تطبيقات من مشاريع الشركة."
            : "Explore ten core services and six project installations with your FAST engineer, from cooling towers to furnace exhausts and electric superheaters."
          : rtl
            ? "16 محطة في المقاولات الكهربائية والأتمتة والبنية التحتية. اختر جولتك مع مهندس فاست."
            : "16 stations across electrical contracting, automation and LV / ELV infrastructure. Explore with your FAST engineer."}
      </p>
      <div>
        <button onClick={onEnter}>
          {rtl ? "ابدأ من المحطة 01" : "Start at station 01"} →
        </button>
        {mechanical && onProjects && (
          <button onClick={onProjects}>
            {rtl
              ? "انتقل إلى مشاريع فاست · 11–16"
              : "Go to FAST projects · 11–16"}
          </button>
        )}
        <button onClick={onLift}>
          {rtl ? "اختر خدمة أخرى" : "Choose another service"}
        </button>
      </div>
      <ElectricalScope mechanical={mechanical} rtl={rtl} />
    </aside>
  );
}
