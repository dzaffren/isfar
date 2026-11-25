import type { Language } from "../lib/language";
import type { Step } from "./tawaf";

// The ihram walk at Bir Ali, in the Shafi'i school. This file is the source of the text, and the spec holds the outline (D24).
// A qualified person has not yet reviewed this text (shape O1).
const NIAT = "نَوَيْتُ الْعُمْرَةَ وَأَحْرَمْتُ بِهَا لِلَّهِ تَعَالَى";
const NIAT_SOUND = "Nawaitul 'umrata wa ahramtu biha lillahi ta'ala";
const TALBIYAH = "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ";
const TALBIYAH_SOUND = "Labbaik Allahumma labbaik, labbaika la sharika laka labbaik, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak";

const ms: Step[] = [
  {
    title: "Bir Ali dan bahagiannya",
    text: "Bir Ali, atau Zulhulaifah, ialah miqat bagi jemaah yang datang dari Madinah. Di sini anda masuk ihram sebelum bas bertolak ke Makkah. Kenali empat tempat ini dahulu: dewan solat, menara, bilik mandi dan tempat letak bas.",
    where: "Bir Ali dari atas, dengan nama empat tempat",
  },
  {
    title: "Sebelum ihram",
    text: "Di bilik mandi, potong kuku dan rapikan rambut dahulu. Kemudian mandi sunat ihram. Selepas mandi, sapu wangian pada badan sahaja, bukan pada kain ihram.",
    where: "Penanda di bilik mandi",
    note: "Syafi'i, Hanafi dan Hanbali: wangian pada badan sebelum niat adalah sunat, dan baunya yang kekal selepas niat tidak mengapa. Maliki: wangian yang kekal baunya adalah makruh.",
  },
  {
    title: "Pakaian ihram",
    text: "Lelaki memakai dua helai kain putih tidak berjahit: satu di pinggang, satu di atas bahu, dan kepala tidak ditutup. Wanita memakai pakaian biasa yang menutup aurat, dengan muka dan tapak tangan terbuka.",
    where: "Penanda di bilik mandi, selepas mandi",
    note: "Syafi'i, Maliki dan Hanbali: wanita tidak memakai sarung tangan dalam ihram. Hanafi: sarung tangan dibolehkan bagi wanita.",
  },
  {
    title: "Solat sunat ihram",
    text: "Masuk ke dewan solat dan solat sunat ihram dua rakaat. Jangan solat pada waktu yang dilarang, seperti selepas solat Asar hingga matahari terbenam.",
    where: "Penanda di dewan solat",
  },
  {
    title: "Niat umrah",
    text: "Selepas solat, berniat umrah dalam hati dan lafazkan niat ini. Ihram anda bermula di sini. Jika anda terbang terus ke Jeddah, berniat dalam kapal terbang sebelum miqat, apabila kru mengumumkannya.",
    where: "Penanda di halaman masjid",
    recitation: { arabic: NIAT, sound: NIAT_SOUND, meaning: "Aku berniat umrah dan berihram dengannya kerana Allah Taala." },
  },
  {
    title: "Talbiyah",
    text: "Mulai sekarang, baca talbiyah ini dengan kerap. Lelaki membacanya dengan suara kuat, dan wanita dengan suara perlahan. Naik bas ke Makkah sambil bertalbiyah.",
    where: "Penanda di tempat letak bas",
    recitation: {
      arabic: TALBIYAH,
      sound: TALBIYAH_SOUND,
      meaning: "Aku datang menyahut panggilan-Mu, ya Allah. Tiada sekutu bagi-Mu. Sesungguhnya segala puji, nikmat dan kerajaan adalah milik-Mu. Tiada sekutu bagi-Mu.",
    },
    note: "Syafi'i dan Hanbali: ihram bermula dengan niat, dan talbiyah adalah sunat. Hanafi: ihram bermula dengan niat bersama talbiyah. Maliki: talbiyah wajib, dan dam dikenakan jika ditinggalkan.",
  },
  {
    title: "Larangan ihram",
    text: "Selagi dalam ihram, jangan memakai wangian, memotong rambut atau kuku, memburu, bernikah atau bersetubuh. Lelaki tidak memakai pakaian berjahit dan tidak menutup kepala. Wanita tidak menutup muka. Larangan ini tamat selepas tahallul.",
    where: "Penanda di tempat letak bas",
  },
  {
    title: "Ke Makkah",
    text: "Ihram anda sudah bermula. Teruskan bertalbiyah sepanjang perjalanan ke Makkah, dan berhenti apabila anda mula tawaf. Langkah seterusnya ialah tawaf.",
    where: "Bir Ali dari atas, dengan penanda di tempat letak bas",
    note: "Syafi'i, Hanafi dan Hanbali: talbiyah umrah berhenti apabila tawaf bermula. Maliki: talbiyah berhenti apabila anda sampai di sempadan Tanah Haram.",
  },
];

const en: Step[] = [
  {
    title: "Bir Ali and its parts",
    text: "Bir Ali, or Dhul Hulaifah, is the miqat for pilgrims who come from Madinah. Here you enter ihram before the bus leaves for Makkah. First, know these four places: the prayer hall, the minaret, the washrooms and the bus park.",
    where: "Bir Ali from above, with the names of four places",
  },
  {
    title: "Before ihram",
    text: "In the washrooms, cut your nails and trim your hair first. Then take the sunnah bath of ihram. After the bath, put scent on your body only, not on the ihram cloth.",
    where: "The marker at the washrooms",
    note: "Shafi'i, Hanafi and Hanbali: scent on the body before the niat is sunnah, and a smell that stays after the niat does no harm. Maliki: a scent whose smell stays is makruh.",
  },
  {
    title: "The ihram clothes",
    text: "Men wear two white cloths with no seams: one round the waist, one over the shoulder, and the head stays bare. Women wear their usual clothes that cover the aurat, with the face and the hands open.",
    where: "The marker at the washrooms, after the bath",
    note: "Shafi'i, Maliki and Hanbali: a woman wears no gloves in ihram. Hanafi: gloves are allowed for a woman.",
  },
  {
    title: "Solat sunat ihram",
    text: "Go into the prayer hall and pray two rakaat of solat sunat ihram. Do not pray it at a time when prayer is not allowed, such as after Asar until sunset.",
    where: "The marker in the prayer hall",
  },
  {
    title: "The niat of umrah",
    text: "After the prayer, make the niat of umrah in your heart and say these words. Your ihram starts here. If you fly straight to Jeddah, make the niat on the plane before the miqat, when the crew announces it.",
    where: "The marker in the courtyard of the mosque",
    recitation: { arabic: NIAT, sound: NIAT_SOUND, meaning: "I intend umrah, and I enter ihram for it, for the sake of Allah the Most High." },
  },
  {
    title: "Talbiyah",
    text: "From now on, say this talbiyah often. Men say it aloud, and women say it quietly. Get on the bus to Makkah, and keep saying the talbiyah.",
    where: "The marker at the bus park",
    recitation: {
      arabic: TALBIYAH,
      sound: TALBIYAH_SOUND,
      meaning: "Here I am, O Allah, here I am. You have no partner. All praise, all blessing and all dominion are Yours. You have no partner.",
    },
    note: "Shafi'i and Hanbali: ihram starts with the niat, and the talbiyah is sunnah. Hanafi: ihram starts with the niat together with the talbiyah. Maliki: the talbiyah is wajib, and leaving it needs a dam.",
  },
  {
    title: "The rules of ihram",
    text: "While in ihram, do not use scent, cut your hair or nails, hunt, marry, or have marital relations. Men wear no sewn clothes and do not cover the head. Women do not cover the face. These rules end after tahallul.",
    where: "The marker at the bus park",
  },
  {
    title: "On to Makkah",
    text: "Your ihram has started. Keep saying the talbiyah on the way to Makkah, and stop when you start tawaf. Tawaf comes next.",
    where: "Bir Ali from above, with the marker at the bus park",
    note: "Shafi'i, Hanafi and Hanbali: the talbiyah of umrah stops when tawaf starts. Maliki: the talbiyah stops when you reach the edge of the Haram.",
  },
];

export const IHRAM: Record<Language, Step[]> = { ms, en };
