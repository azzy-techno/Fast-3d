import {
  certifications,
  credentials,
  registrations,
  partners,
  type AboutPanel,
} from "./about";
export const aboutItems: {
  title: string;
  ar: string;
  note: string;
  noteAr: string;
  panel: AboutPanel;
  image: string;
  partnerId?: string;
  document?: string;
}[] = [
  ...certifications.map((c) => ({
    title: `ISO ${c.code}:${c.edition}`,
    ar: `ISO ${c.code}:${c.edition}`,
    note: c.name,
    noteAr: c.ar,
    panel: "certifications" as const,
    image: `about/certificates/iso-${c.code}.webp`,
    document: `about/certificates/iso-${c.code}.pdf`,
  })),
  ...credentials.map((c, i) => ({
    title: c.name,
    ar: c.ar,
    note: c.detail,
    noteAr: c.arDetail,
    panel: "certifications" as const,
    image: `about/certificates/${i ? "salamah" : "lcgpa"}.webp`,
    document: c.url,
  })),
  ...registrations.map((r) => ({
    title: r.name,
    ar: r.ar,
    note: r.detail || "Supplier portal registration",
    noteAr: r.arDetail || "تسجيل في بوابة الموردين",
    panel: "approvals" as const,
    image: r.logo,
  })),
  ...partners.map((p) => ({
    title: p.name,
    ar: p.arName,
    note: p.description,
    noteAr: p.arDescription,
    panel: "partners" as const,
    image: p.logo,
    partnerId: p.id,
  })),
];
