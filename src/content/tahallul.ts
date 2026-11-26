import type { Language } from "../lib/language";
import type { Step } from "./tawaf";

// Tahallul, past the Marwah exit of the mas'a, in the Shafi'i school. This file is the source of the text, and the spec holds the outline (D24).
// A qualified person has not yet reviewed this text (shape O1).
const ms: Step[] = [
  {
    title: "Bercukur atau bergunting",
    text: "Selepas keluar melalui pintu Marwah, lelaki mencukur seluruh kepala, dan ini yang terbaik, atau menggunting rambut. Wanita menggunting rambut sepanjang satu ruas jari dari hujungnya.",
    where: "Penanda di luar pintu Marwah",
    note: "Syafi'i: sekurang-kurangnya tiga helai rambut. Hanafi: suku kepala. Maliki dan Hanbali: seluruh kepala, atau sebahagian besarnya.",
  },
  {
    title: "Umrah selesai",
    text: "Dengan tahallul, larangan ihram tamat, dan anda boleh memakai pakaian biasa semula. Umrah anda selesai. Semoga Allah menerimanya.",
    where: "Mas'a dari atas, dengan penanda di luar pintu Marwah",
  },
];

const en: Step[] = [
  {
    title: "Shave or cut",
    text: "Past the Marwah exit, men shave the whole head, which is best, or cut the hair. Women cut the length of a fingertip from the ends of the hair.",
    where: "The marker outside the Marwah exit",
    note: "Shafi'i: at least three hairs. Hanafi: a quarter of the head. Maliki and Hanbali: the whole head, or most of it.",
  },
  {
    title: "Umrah is complete",
    text: "With tahallul, the rules of ihram end, and you may wear your usual clothes again. Your umrah is complete. May Allah accept it.",
    where: "The mas'a from above, with the marker outside the Marwah exit",
  },
];

export const TAHALLUL: Record<Language, Step[]> = { ms, en };
