import type { Language } from "../lib/language";

// Each text on the page, in the two languages. The spec's "Text in this slice" table is the source.
const ms = {
  siteName: "Isfar",
  languageSwitch: "Bahasa",
  scene: "Kaabah di atas mataf, dari satu sudut pandang",
  title: "Kaabah",
  text: "Inilah Kaabah, di tengah-tengah Masjidil Haram. Lantai marmar yang lapang di sekelilingnya dipanggil mataf.",
  noticeReview: "Kandungan ini belum disemak oleh orang yang bertauliah.",
  noticeLayout: "Susun atur pada hari sebenar mungkin berbeza. Ikut mutawwif anda dan papan tanda.",
  loadingTitle: "Memuatkan Kaabah",
  loadingHint: "Ini mungkin mengambil sedikit masa dengan data mudah alih.",
  no3d: "Peranti ini tidak dapat memaparkan tempat 3D.",
  failed: "Tempat 3D tidak dapat dimuatkan.",
  retry: "Cuba lagi",
};

export type Words = Record<keyof typeof ms, string>;

const en: Words = {
  siteName: "Isfar",
  languageSwitch: "Language",
  scene: "The Kaabah on the mataf, from one fixed view",
  title: "The Kaabah",
  text: "This is the Kaabah, in the centre of Masjidil Haram. The open marble floor around it is the mataf.",
  noticeReview: "A qualified person has not yet reviewed this content.",
  noticeLayout: "The layout on the day may differ. Follow your mutawwif and the signs.",
  loadingTitle: "Loading the Kaabah",
  loadingHint: "This can take a moment on mobile data.",
  no3d: "This device cannot show the 3D place.",
  failed: "The 3D place did not load.",
  retry: "Try again",
};

export const TEXT: Record<Language, Words> = { ms, en };
