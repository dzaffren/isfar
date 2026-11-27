import type { Language } from "../lib/language";
import type { Step } from "./tawaf";

// The sa'i walk, in the Shafi'i school. The spec's "Text of the steps" table is the source.
// A qualified person has not yet reviewed this text (shape O1).
const INNAS_SAFA = "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ";
const INNAS_SAFA_SOUND = "Innas-safa wal-marwata min sha'a'irillah";
const RABBIGHFIR = "رَبِّ اغْفِرْ وَارْحَمْ، إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ";
const RABBIGHFIR_SOUND = "Rabbighfir warham, innaka antal a'azzul akram";

const ms: Step[] = [
  {
    title: "Mas'a dan bahagiannya",
    text: "Sa'i ialah tujuh perjalanan antara Bukit Safa dan Bukit Marwah, selepas tawaf. Kenali tiga tempat ini dahulu: Bukit Safa, Bukit Marwah, dan dua lampu hijau di antaranya.",
    where: "Mas'a dari atas, dengan nama tiga tempat",
  },
  {
    title: "Sebelum bermula",
    text: "Sa'i dilakukan selepas tawaf. Wuduk tidak wajib untuk sa'i, tetapi sunat. Selepas solat sunat tawaf dan minum zamzam, pergi ke Bukit Safa di hujung mas'a.",
    where: "Penanda di kaki Bukit Safa",
    note: "Syafi'i, Maliki dan Hanbali: sa'i ialah rukun umrah, dan umrah tidak sah tanpanya. Hanafi: sa'i wajib tetapi bukan rukun. Jika ditinggalkan, umrah sah dan dam dikenakan.",
  },
  {
    title: "Bukit Safa",
    text: "Naik sedikit ke Bukit Safa dan berniat sa'i. Hadap ke arah Kaabah, di sebelah masjid, angkat kedua-dua tangan, bertakbir dan berdoa. Pada perjalanan pertama, baca:",
    where: "Penanda di lereng Bukit Safa",
    recitation: { arabic: INNAS_SAFA, sound: INNAS_SAFA_SOUND, meaning: "Sesungguhnya Safa dan Marwah ialah sebahagian daripada syiar Allah." },
  },
  {
    title: "Ke arah Marwah",
    text: "Turun dari Safa dan berjalan ke arah Marwah seperti biasa. Ikut lorong ke Marwah, bukan lorong orang yang kembali ke Safa. Anda boleh berzikir atau berdoa dalam apa-apa bahasa sepanjang sa'i.",
    where: "Penanda di lorong ke Marwah, antara Safa dan lampu hijau pertama",
  },
  {
    title: "Antara lampu hijau",
    text: "Di antara dua lampu hijau, lelaki berjalan cepat dengan langkah pendek. Wanita berjalan seperti biasa. Baca doa ini:",
    where: "Penanda di lorong ke Marwah, antara dua lampu hijau",
    recitation: {
      arabic: RABBIGHFIR,
      sound: RABBIGHFIR_SOUND,
      meaning: "Wahai Tuhanku, ampunilah dan rahmatilah. Sesungguhnya Engkau Maha Perkasa lagi Maha Pemurah.",
    },
  },
  {
    title: "Bukit Marwah",
    text: "Apabila anda sampai di Bukit Marwah, satu perjalanan selesai. Naik sedikit, hadap ke arah Kaabah, dan berdoa seperti di Safa.",
    where: "Penanda di lereng Bukit Marwah",
  },
  {
    title: "Perjalanan 2",
    text: "Di Marwah, pusing masuk ke lorong ke Safa, dan berjalan kembali ke Safa. Perjalanan ini dikira sebagai perjalanan kedua. Lelaki berjalan cepat lagi di antara lampu hijau.",
    where: "Penanda di Bukit Safa, perjalanan kedua",
  },
  {
    title: "Perjalanan 3",
    text: "Dari Safa ke Marwah sekali lagi. Pada setiap perjalanan, lelaki berjalan cepat di antara dua lampu hijau, dan semua orang berjalan seperti biasa di bahagian lain.",
    where: "Penanda di Bukit Marwah, perjalanan ketiga",
  },
  {
    title: "Perjalanan 4",
    text: "Kembali ke Safa. Setiap kali anda sampai di Safa atau Marwah, hadap ke arah Kaabah dan berdoa sebelum meneruskan perjalanan.",
    where: "Penanda di Bukit Safa, perjalanan keempat",
  },
  {
    title: "Perjalanan 5",
    text: "Ke Marwah. Jika anda ragu tentang bilangan perjalanan, ambil bilangan yang lebih sedikit. Contohnya, jika ragu antara lima dan enam, kira sebagai lima.",
    where: "Penanda di Bukit Marwah, perjalanan kelima",
  },
  {
    title: "Perjalanan 6",
    text: "Kembali ke Safa. Jika penat, anda boleh berhenti rehat sebentar dan menyambung semula. Jika wuduk terbatal, sa'i anda tetap sah.",
    where: "Penanda di Bukit Safa, perjalanan keenam",
  },
  {
    title: "Perjalanan 7",
    text: "Perjalanan terakhir, dari Safa ke Marwah. Sa'i tamat apabila anda sampai di Bukit Marwah.",
    where: "Penanda di Bukit Marwah, perjalanan ketujuh",
  },
  {
    title: "Sa'i selesai",
    text: "Anda telah melengkapkan tujuh perjalanan, dan sa'i tamat di Marwah. Selepas ini ialah tahallul: keluar melalui pintu Marwah, kemudian bercukur atau menggunting rambut.",
    where: "Mas'a dari atas, dengan penanda di Bukit Marwah",
  },
];

const en: Step[] = [
  {
    title: "The mas'a and its parts",
    text: "Sa'i is seven walks between the hills of Safa and Marwah, after a tawaf. First learn these three places: Safa, Marwah, and the two green lights between them.",
    where: "The mas'a from above, with the names of three places",
  },
  {
    title: "Before you start",
    text: "Sa'i comes after a tawaf. Wuduk is not required for sa'i, but it is sunat. After the two rakaat and the zamzam, go to Safa at one end of the mas'a.",
    where: "The marker at the foot of Safa",
    note: "Shafi'i, Maliki and Hanbali: sa'i is a rukun of umrah, and the umrah is not valid without it. Hanafi: sa'i is required but is not a rukun. If you leave it, the umrah is valid and a dam is due.",
  },
  {
    title: "Safa",
    text: "Go a little way up Safa and make the niat of sa'i. Face the Kaabah, on the side of the mosque, raise both hands, say takbir and make doa. On the first walk, say:",
    where: "The marker on the slope of Safa",
    recitation: { arabic: INNAS_SAFA, sound: INNAS_SAFA_SOUND, meaning: "Safa and Marwah are among the signs of Allah." },
  },
  {
    title: "Towards Marwah",
    text: "Come down from Safa and walk towards Marwah at a usual pace. Keep to the lane to Marwah, not the lane back to Safa. You can make zikir or doa in any language for the whole sa'i.",
    where: "The marker in the lane to Marwah, between Safa and the first green light",
  },
  {
    title: "Between the green lights",
    text: "Between the two green lights, men walk quickly with short steps. Women walk at a usual pace. Say this doa:",
    where: "The marker in the lane to Marwah, between the two green lights",
    recitation: { arabic: RABBIGHFIR, sound: RABBIGHFIR_SOUND, meaning: "My Lord, forgive and have mercy. You are the Most Mighty, the Most Generous." },
  },
  {
    title: "Marwah",
    text: "When you reach Marwah, one walk is done. Go a little way up, face the Kaabah, and make doa as at Safa.",
    where: "The marker on the slope of Marwah",
  },
  {
    title: "Walk 2",
    text: "At Marwah, turn into the lane to Safa, and walk back to Safa. This counts as the second walk. Men walk quickly again between the green lights.",
    where: "The marker at Safa, second walk",
  },
  {
    title: "Walk 3",
    text: "From Safa to Marwah again. On each walk, men walk quickly between the two green lights, and everyone walks at a usual pace elsewhere.",
    where: "The marker at Marwah, third walk",
  },
  {
    title: "Walk 4",
    text: "Back to Safa. Each time you reach Safa or Marwah, face the Kaabah and make doa before you go on.",
    where: "The marker at Safa, fourth walk",
  },
  {
    title: "Walk 5",
    text: "To Marwah. If you are not sure of the count, take the lower number. For example, if you are not sure between five and six, count five.",
    where: "The marker at Marwah, fifth walk",
  },
  {
    title: "Walk 6",
    text: "Back to Safa. If you are tired, you can stop to rest a little, and then go on. If your wuduk breaks, your sa'i is still valid.",
    where: "The marker at Safa, sixth walk",
  },
  {
    title: "Walk 7",
    text: "The last walk, from Safa to Marwah. Sa'i ends when you reach Marwah.",
    where: "The marker at Marwah, seventh walk",
  },
  {
    title: "Sa'i is complete",
    text: "You have completed seven walks, and sa'i ends at Marwah. Next comes tahallul: leave by the Marwah exit, then shave or cut the hair.",
    where: "The mas'a from above, with the marker at Marwah",
  },
];

export const SAI: Record<Language, Step[]> = { ms, en };

// The seven beads count the walks. Steps 1 to 3 come before walk 1, and step 13 comes after walk 7.
export function saiBeadsAt(step: number): { done: number; now: number | null } {
  if (step <= 3) return { done: 0, now: null };
  if (step >= 13) return { done: 7, now: null };
  const walk = step <= 6 ? 1 : step - 5;
  return { done: walk - 1, now: walk };
}
