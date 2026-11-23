import type { Language } from "../lib/language";

// The tawaf walk, in the Shafi'i school. The spec's "Text of the steps" table is the source.
// A qualified person has not yet reviewed this text (shape O1).
export type Recitation = { arabic: string; sound: string; meaning: string };
export type Step = { title: string; text: string; where: string; recitation?: Recitation; note?: string };

const BISMILLAH = "بِسْمِ اللهِ، اللهُ أَكْبَرُ";
const RABBANA = "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ";
const RABBANA_SOUND = "Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-nar";

const ms: Step[] = [
  {
    title: "Kaabah dan bahagiannya",
    text: "Tawaf ialah tujuh pusingan mengelilingi Kaabah. Kenali lima tempat ini dahulu: Hajar Aswad, pintu Kaabah, Hijr Ismail, Rukun Yamani dan Maqam Ibrahim.",
    where: "Kaabah dan mataf dari atas, dengan nama lima tempat",
  },
  {
    title: "Sebelum bermula",
    text: "Pastikan anda berwuduk dan menutup aurat. Lelaki dalam ihram memakai kain secara idtiba': bahu kanan terbuka, dan hujung kain di atas bahu kiri.",
    where: "Penanda di tepi mataf, menghadap Kaabah",
    note: "Syafi'i, Maliki dan Hanbali: wuduk ialah syarat sah tawaf. Hanafi: wuduk wajib tetapi bukan syarat. Tawaf tanpa wuduk sah, dan dam dikenakan.",
  },
  {
    title: "Tempat mula",
    text: "Berdiri sejajar dengan penjuru Hajar Aswad. Lampu hijau di dinding masjid menandakan tempatnya, dan lantai sebenar tiada garisan. Berniat tawaf, hadap Hajar Aswad, angkat tangan ke arahnya dan baca:",
    where: "Penanda di atas garisan panduan, sejajar dengan penjuru Hajar Aswad",
    recitation: { arabic: BISMILLAH, sound: "Bismillahi, Allahu Akbar", meaning: "Dengan nama Allah. Allah Maha Besar." },
  },
  {
    title: "Kaabah di sebelah kiri",
    text: "Pusing supaya Kaabah berada di sebelah kiri anda, dan mula berjalan. Anda melalui pintu Kaabah dan Maqam Ibrahim. Lelaki berjalan pantas dengan langkah pendek (raml) dalam tiga pusingan pertama.",
    where: "Penanda selepas pintu Kaabah, berhampiran Maqam Ibrahim",
  },
  {
    title: "Hijr Ismail",
    text: "Jalan di luar tembok rendah Hijr Ismail. Kawasan di dalamnya dikira sebahagian daripada Kaabah, jadi pusingan yang melalui dalamnya tidak dikira.",
    where: "Penanda di luar tembok Hijr Ismail",
    note: "Syafi'i, Maliki dan Hanbali: pusingan yang melalui dalam Hijr Ismail tidak sah. Hanafi: berjalan di luarnya wajib. Pusingan itu sah, tetapi perlu diulang atau dam dikenakan.",
  },
  {
    title: "Rukun Yamani",
    text: "Di penjuru ini, sentuh Rukun Yamani dengan tangan kanan jika mudah. Jika sesak, teruskan berjalan. Jangan menolak orang lain untuk sampai kepadanya.",
    where: "Penanda di Rukun Yamani",
  },
  {
    title: "Antara dua penjuru",
    text: "Dari Rukun Yamani ke penjuru Hajar Aswad, baca doa ini sambil berjalan:",
    where: "Penanda di antara Rukun Yamani dan penjuru Hajar Aswad",
    recitation: {
      arabic: RABBANA,
      sound: RABBANA_SOUND,
      meaning: "Wahai Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka.",
    },
  },
  {
    title: "Satu pusingan selesai",
    text: "Apabila anda sampai semula sejajar dengan Hajar Aswad, satu pusingan selesai. Angkat tangan ke arahnya, baca “Bismillahi, Allahu Akbar”, dan teruskan pusingan kedua.",
    where: "Penanda di atas garisan panduan semula",
  },
  {
    title: "Pusingan 2",
    text: "Ikut jalan yang sama: lalu pintu Kaabah, di luar Hijr Ismail, Rukun Yamani, dan kembali ke garisan Hajar Aswad. Lelaki masih berjalan pantas (raml).",
    where: "Penanda di atas garisan panduan, pusingan kedua",
  },
  {
    title: "Pusingan 3",
    text: "Ini pusingan terakhir dengan raml bagi lelaki. Wanita berjalan seperti biasa sepanjang tawaf. Anda boleh berzikir atau berdoa dalam apa-apa bahasa.",
    where: "Penanda di atas garisan panduan, pusingan ketiga",
  },
  {
    title: "Pusingan 4",
    text: "Mulai pusingan ini, semua orang berjalan seperti biasa. Pastikan Kaabah sentiasa di sebelah kiri anda, dan jangan menghadap atau membelakanginya semasa berjalan.",
    where: "Penanda di atas garisan panduan, pusingan keempat",
  },
  {
    title: "Pusingan 5",
    text: "Jika anda ragu tentang bilangan pusingan, ambil bilangan yang lebih sedikit. Contohnya, jika ragu antara empat dan lima, kira sebagai empat.",
    where: "Penanda di atas garisan panduan, pusingan kelima",
  },
  {
    title: "Pusingan 6",
    text: "Jika wuduk terbatal, keluar, ambil wuduk semula, dan sambung dari tempat anda berhenti. Pusingan yang sudah selesai tetap dikira.",
    where: "Penanda di atas garisan panduan, pusingan keenam",
    note: "Syafi'i: bersentuhan kulit dengan bukan mahram yang berlainan jantina membatalkan wuduk. Hanafi: tidak batal. Maliki dan Hanbali: batal jika dengan syahwat.",
  },
  {
    title: "Pusingan 7",
    text: "Pusingan terakhir tamat apabila anda sampai semula sejajar dengan Hajar Aswad. Lalui garisan itu sepenuhnya sebelum berhenti.",
    where: "Penanda di atas garisan panduan, pusingan ketujuh",
  },
  {
    title: "Tawaf selesai",
    text: "Anda telah melengkapkan tujuh pusingan. Selepas ini ialah solat sunat tawaf dua rakaat di belakang Maqam Ibrahim. Bahagian itu akan datang kemudian.",
    where: "Kaabah dan mataf dari atas",
  },
];

const en: Step[] = [
  {
    title: "The Kaabah and its parts",
    text: "Tawaf is seven circuits around the Kaabah. First learn these five places: Hajar Aswad, the door of the Kaabah, Hijr Ismail, Rukun Yamani and Maqam Ibrahim.",
    where: "The Kaabah and the mataf from above, with the names of five places",
  },
  {
    title: "Before you start",
    text: "Make sure that you have wuduk and that your aurat is covered. A man in ihram wears the cloth in idtiba': the right shoulder bare, and the end of the cloth over the left shoulder.",
    where: "The marker at the edge of the mataf, facing the Kaabah",
    note: "Shafi'i, Maliki and Hanbali: wuduk is a condition of a valid tawaf. Hanafi: wuduk is required but is not a condition. A tawaf without wuduk is valid, and a dam is due.",
  },
  {
    title: "The start",
    text: "Stand in line with the Hajar Aswad corner. A green light on the mosque wall marks the place, and the real floor has no line. Make the niat of tawaf, face Hajar Aswad, raise your hand towards it and say:",
    where: "The marker on the guide line, in line with the Hajar Aswad corner",
    recitation: { arabic: BISMILLAH, sound: "Bismillahi, Allahu Akbar", meaning: "In the name of Allah. Allah is the Greatest." },
  },
  {
    title: "The Kaabah on your left",
    text: "Turn so that the Kaabah is on your left, and start to walk. You pass the door of the Kaabah and Maqam Ibrahim. Men walk briskly with short steps (raml) in the first three circuits.",
    where: "The marker past the door of the Kaabah, near Maqam Ibrahim",
  },
  {
    title: "Hijr Ismail",
    text: "Walk outside the low wall of Hijr Ismail. The area inside it counts as part of the Kaabah, so a circuit that goes through it does not count.",
    where: "The marker outside the wall of Hijr Ismail",
    note: "Shafi'i, Maliki and Hanbali: a circuit that goes through Hijr Ismail is not valid. Hanafi: the walk outside it is required. The circuit is valid, but you repeat it or a dam is due.",
  },
  {
    title: "Rukun Yamani",
    text: "At this corner, touch Rukun Yamani with your right hand if it is easy. If it is crowded, keep walking. Do not push other people to reach it.",
    where: "The marker at Rukun Yamani",
  },
  {
    title: "Between the two corners",
    text: "From Rukun Yamani to the Hajar Aswad corner, say this doa as you walk:",
    where: "The marker between Rukun Yamani and the Hajar Aswad corner",
    recitation: {
      arabic: RABBANA,
      sound: RABBANA_SOUND,
      meaning: "Our Lord, give us good in this world and good in the hereafter, and protect us from the punishment of the Fire.",
    },
  },
  {
    title: "One circuit is done",
    text: "When you are in line with Hajar Aswad again, one circuit is done. Raise your hand towards it, say “Bismillahi, Allahu Akbar”, and go on to the second circuit.",
    where: "The marker on the guide line again",
  },
  {
    title: "Circuit 2",
    text: "Follow the same path: past the door of the Kaabah, outside Hijr Ismail, Rukun Yamani, and back to the line of Hajar Aswad. Men still walk briskly (raml).",
    where: "The marker on the guide line, second circuit",
  },
  {
    title: "Circuit 3",
    text: "This is the last circuit with raml for men. Women walk at a usual pace for the whole tawaf. You can make zikir or doa in any language.",
    where: "The marker on the guide line, third circuit",
  },
  {
    title: "Circuit 4",
    text: "From this circuit, everyone walks at a usual pace. Keep the Kaabah on your left at all times, and do not face it or turn your back to it as you walk.",
    where: "The marker on the guide line, fourth circuit",
  },
  {
    title: "Circuit 5",
    text: "If you are not sure of the count, take the lower number. For example, if you are not sure between four and five, count four.",
    where: "The marker on the guide line, fifth circuit",
  },
  {
    title: "Circuit 6",
    text: "If your wuduk breaks, leave, renew it, and go on from the place where you stopped. The circuits that you finished still count.",
    where: "The marker on the guide line, sixth circuit",
    note: "Shafi'i: skin contact with a non-mahram of the other sex breaks wuduk. Hanafi: it does not. Maliki and Hanbali: only if there is desire.",
  },
  {
    title: "Circuit 7",
    text: "The last circuit ends when you are in line with Hajar Aswad again. Pass the line fully before you stop.",
    where: "The marker on the guide line, seventh circuit",
  },
  {
    title: "Tawaf is complete",
    text: "You have completed seven circuits. Next come the two rakaat of solat sunat tawaf behind Maqam Ibrahim. That part of the site comes later.",
    where: "The Kaabah and the mataf from above",
  },
];

export const TAWAF: Record<Language, Step[]> = { ms, en };

// The seven beads count the circuits. Steps 1 to 3 come before circuit 1, and step 15 comes after circuit 7.
export function beadsAt(step: number): { done: number; now: number | null } {
  if (step <= 3) return { done: 0, now: null };
  if (step >= 15) return { done: 7, now: null };
  const circuit = step <= 8 ? 1 : step - 7;
  return { done: circuit - 1, now: circuit };
}
