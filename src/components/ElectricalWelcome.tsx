import { useTour } from "../store";
import { ElectricalScope } from "./ElectricalScope";
export function ElectricalWelcome({
  rtl,
  onEnter,
  onLift,
}: {
  rtl: boolean;
  onEnter: () => void;
  onLift: () => void;
}) {
  const visible = useTour((s) => s.progress >= 1.96 && s.progress < 2.012);
  if (!visible) return null;
  return (
    <aside
      className="electrical-welcome"
      data-lenis-prevent
      aria-label={
        rtl ? "مقدمة الخدمات الكهربائية" : "Electrical service introduction"
      }
    >
      <span>11 / FAST ELECTRICAL</span>
      <h2>{rtl ? "الطاقة. التحكم. الربط." : "Power. Control. Connection."}</h2>
      <p>
        {rtl
          ? "16 محطة في المقاولات الكهربائية والأتمتة والبنية التحتية. اختر جولتك مع مهندس فاست."
          : "16 stations across electrical contracting, automation and LV / ELV infrastructure. Explore with your FAST engineer."}
      </p>
      <div>
        <button onClick={onEnter}>
          {rtl ? "ابدأ من المحطة 01" : "Start at station 01"} →
        </button>
        <button onClick={onLift}>
          {rtl ? "اختر خدمة أخرى" : "Choose another service"}
        </button>
      </div>
      <ElectricalScope rtl={rtl} />
    </aside>
  );
}
