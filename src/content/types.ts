/** Shared content schema for the FAST Tower experience. Every visitor-facing string is bilingual. */
export type L = { en: string; ar: string };

export type FloorId =
  | "about"
  | "electrical"
  | "mechanical"
  | "fabrication"
  | "civil"
  | "fire"
  | "ict"
  | "digital"
  | "roof";

/** One guided stop: the engineer points at a named component of the floor's exhibit. */
export type Station = {
  /** Must match the hotspot id modelled in the exhibit (see the brief). */
  id: string;
  /** 1–3 word component label shown next to the component in 3D. */
  label: L;
  /** Panel heading, at most ~6 words. */
  title: L;
  /** 1–2 sentences, max ~38 words in English. What it is + what FAST does with it. */
  body: L;
};

export type ScopeGroup = { title: L; items: L[] };

export type Photo = { src: string; alt: L };

export type Floor = {
  id: FloorId;
  /** "01".."08" or "R". */
  level: string;
  /** Short lift-button name, e.g. "Electrical". */
  name: L;
  /** Headline, at most ~6 words. */
  title: L;
  /** 1–2 sentences, max ~40 words in English. */
  intro: L;
  /** Official fast-arabia.com page for this service. */
  href: string;
  /** Accent colour for this floor (hex). */
  accent: string;
  stations: Station[];
  /** Complete official scope for the service, grouped. */
  scope: ScopeGroup[];
  /** Real FAST photographs (public/photos/...). */
  photos: Photo[];
  /** Partner ids (see about.ts) relevant to this floor. */
  partners?: string[];
};

export type Partner = {
  id: string;
  name: string;
  country: L;
  summary: L;
  url: string;
  /** public/brand/partners/<file> */
  logo: string;
};

export type Registration = { id: string; name: L; logo: string };

export type Certificate = {
  id: string;
  title: L;
  detail: L;
  /** public/brand/certificates/<file> image */
  image?: string;
  /** optional PDF */
  pdf?: string;
};

export type Fact = { label: L; value: L };

export type Project = { title: L; client: L; discipline: FloorId | "general" };

export type Company = {
  name: L;
  legalName: L;
  tagline: L;
  founded: string;
  hq: L;
  intro: L;
  vision: L;
  mission: L;
  missionPoints: L[];
  sectors: L[];
  facts: Fact[];
  contact: {
    email: string;
    phone: string;
    address: L;
    website: string;
    rfq: string;
    contactPage: string;
    profilePdf?: string;
  };
  group: { name: L; summary: L; url?: string }[];
};
