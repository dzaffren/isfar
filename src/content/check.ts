import type { Language } from "../lib/language";

// The tawaf check, in the Shafi'i school. The spec's "Text of the check" table is the source.
// A qualified person has not yet reviewed this text (shape O1).
// Each question shows the place from the camera of one walk step. The order of the answers is fixed (D54).
export type Question = { step: number; ask: string; answers: [string, string, string]; right: 0 | 1 | 2; why: string };

const ms: Question[] = [
  {
    step: 3,
    ask: "Di mana anda berdiri untuk memulakan tawaf?",
    answers: ["Di hadapan pintu Kaabah", "Sejajar dengan penjuru Hajar Aswad", "Di belakang Maqam Ibrahim"],
    right: 1,
    why: "Tawaf bermula sejajar dengan penjuru Hajar Aswad. Lampu hijau di dinding masjid menandakan tempatnya.",
  },
  {
    step: 3,
    ask: "Apa yang anda buat di sini sebelum pusingan pertama?",
    answers: ["Berniat, angkat tangan ke arah Hajar Aswad dan baca “Bismillahi, Allahu Akbar”", "Solat sunat dua rakaat", "Minum air zamzam"],
    right: 0,
    why: "Berniat tawaf, hadap Hajar Aswad, angkat tangan ke arahnya dan baca “Bismillahi, Allahu Akbar”. Solat dua rakaat datang selepas tawaf.",
  },
  {
    step: 4,
    ask: "Semasa anda berjalan, di sebelah mana Kaabah?",
    answers: ["Di sebelah kanan", "Di hadapan anda", "Di sebelah kiri"],
    right: 2,
    why: "Kaabah sentiasa di sebelah kiri anda sepanjang tawaf.",
  },
  {
    step: 5,
    ask: "Di mana anda berjalan di Hijr Ismail?",
    answers: ["Di luar tembok rendahnya", "Di dalam tembok, dekat Kaabah", "Di mana-mana yang tidak sesak"],
    right: 0,
    why: "Kawasan di dalam tembok dikira sebahagian daripada Kaabah, jadi pusingan yang melalui dalamnya tidak dikira.",
  },
  {
    step: 6,
    ask: "Ini Rukun Yamani, dan kawasannya sesak. Apa yang anda buat?",
    answers: ["Tolak perlahan-lahan untuk menyentuhnya", "Teruskan berjalan", "Berhenti dan tunggu sehingga lapang"],
    right: 1,
    why: "Sentuh Rukun Yamani hanya jika mudah. Jika sesak, teruskan berjalan, dan jangan menolak orang lain.",
  },
  {
    step: 7,
    ask: "Apa yang anda baca dari Rukun Yamani ke penjuru Hajar Aswad?",
    answers: ["Bismillahi, Allahu Akbar", "Labbaik Allahumma labbaik", "Rabbana atina fid-dunya hasanah"],
    right: 2,
    why: "Antara dua penjuru, baca “Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-nar”.",
  },
  {
    step: 14,
    ask: "Bilakah pusingan ketujuh tamat?",
    answers: ["Apabila anda sampai semula sejajar dengan Hajar Aswad", "Apabila anda sampai di Rukun Yamani", "Apabila anda sampai di Maqam Ibrahim"],
    right: 0,
    why: "Pusingan terakhir tamat sejajar dengan Hajar Aswad. Lalui garisan itu sepenuhnya sebelum berhenti.",
  },
];

const en: Question[] = [
  {
    step: 3,
    ask: "Where do you stand to start tawaf?",
    answers: ["In front of the door of the Kaabah", "In line with the Hajar Aswad corner", "Behind Maqam Ibrahim"],
    right: 1,
    why: "Tawaf starts in line with the Hajar Aswad corner. A green light on the mosque wall marks the place.",
  },
  {
    step: 3,
    ask: "What do you do here before the first circuit?",
    answers: ["Make the niat, raise a hand towards Hajar Aswad and say “Bismillahi, Allahu Akbar”", "Pray two rakaat", "Drink zamzam water"],
    right: 0,
    why: "Make the niat of tawaf, face Hajar Aswad, raise your hand towards it and say “Bismillahi, Allahu Akbar”. The two rakaat come after tawaf.",
  },
  {
    step: 4,
    ask: "As you walk, on which side is the Kaabah?",
    answers: ["On your right", "In front of you", "On your left"],
    right: 2,
    why: "The Kaabah stays on your left for the whole tawaf.",
  },
  {
    step: 5,
    ask: "Where do you walk at Hijr Ismail?",
    answers: ["Outside its low wall", "Inside the wall, near the Kaabah", "Wherever it is less crowded"],
    right: 0,
    why: "The area inside the wall counts as part of the Kaabah, so a circuit that goes through it does not count.",
  },
  {
    step: 6,
    ask: "This is Rukun Yamani, and it is crowded. What do you do?",
    answers: ["Push gently to touch it", "Keep walking", "Stop and wait until there is space"],
    right: 1,
    why: "Touch Rukun Yamani only if it is easy. If it is crowded, keep walking, and do not push other people.",
  },
  {
    step: 7,
    ask: "What do you say from Rukun Yamani to the Hajar Aswad corner?",
    answers: ["Bismillahi, Allahu Akbar", "Labbaik Allahumma labbaik", "Rabbana atina fid-dunya hasanah"],
    right: 2,
    why: "Between the two corners, say “Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-nar”.",
  },
  {
    step: 14,
    ask: "When does the seventh circuit end?",
    answers: ["When you are in line with Hajar Aswad again", "When you reach Rukun Yamani", "When you reach Maqam Ibrahim"],
    right: 0,
    why: "The last circuit ends in line with Hajar Aswad. Pass the line fully before you stop.",
  },
];

export const CHECK: Record<Language, Question[]> = { ms, en };

// The sa'i check, in the Shafi'i school. The sai-check spec's "Text of the check" table is the source.
// No question names the side of a lane, because nobody has checked it yet (sai-walk O20).
const saiMs: Question[] = [
  {
    step: 3,
    ask: "Di mana sa'i bermula?",
    answers: ["Bukit Marwah", "Bukit Safa", "Lampu hijau pertama"],
    right: 1,
    why: "Sa'i bermula di Bukit Safa, dan perjalanan pertama menuju ke Marwah.",
  },
  {
    step: 3,
    ask: "Apa yang anda buat di Safa sebelum perjalanan pertama?",
    answers: ["Berniat sa'i, hadap ke arah Kaabah, angkat tangan, bertakbir dan berdoa", "Solat sunat dua rakaat", "Terus berjalan ke Marwah"],
    right: 0,
    why: "Di Safa, berniat sa'i, hadap ke arah Kaabah, angkat kedua-dua tangan, bertakbir dan berdoa. Solat dua rakaat datang selepas tawaf, sebelum sa'i.",
  },
  {
    step: 4,
    ask: "Anda turun dari Safa. Lorong mana yang anda ikut?",
    answers: ["Mana-mana lorong yang kurang sesak", "Lorong orang yang kembali ke Safa", "Lorong ke Marwah"],
    right: 2,
    why: "Mas'a ada satu lorong untuk setiap arah. Ikut lorong ke Marwah, supaya anda tidak berjalan melawan orang yang kembali ke Safa.",
  },
  {
    step: 5,
    ask: "Apa yang lelaki buat di antara dua lampu hijau?",
    answers: ["Berjalan cepat dengan langkah pendek", "Berhenti dan berdoa", "Berjalan seperti biasa"],
    right: 0,
    why: "Di antara dua lampu hijau, lelaki berjalan cepat dengan langkah pendek. Wanita berjalan seperti biasa.",
  },
  {
    step: 5,
    ask: "Apa yang anda baca di antara dua lampu hijau?",
    answers: ["Labbaik Allahumma labbaik", "Rabbighfir warham", "Bismillahi, Allahu Akbar"],
    right: 1,
    why: "Di antara dua lampu hijau, baca “Rabbighfir warham, innaka antal a'azzul akram”.",
  },
  {
    step: 7,
    ask: "Anda berjalan dari Marwah dan sampai di Safa buat kali pertama. Berapa perjalanan sudah selesai?",
    answers: ["Satu", "Setengah", "Dua"],
    right: 2,
    why: "Safa ke Marwah ialah satu perjalanan, dan Marwah kembali ke Safa ialah perjalanan kedua.",
  },
  {
    step: 12,
    ask: "Di mana sa'i tamat?",
    answers: ["Di Bukit Marwah, selepas perjalanan ketujuh", "Di Bukit Safa, tempat anda bermula", "Di antara dua lampu hijau"],
    right: 0,
    why: "Perjalanan ketujuh bermula di Safa dan tamat di Marwah, jadi sa'i tamat di Bukit Marwah.",
  },
];

const saiEn: Question[] = [
  {
    step: 3,
    ask: "Where does sa'i start?",
    answers: ["Marwah", "Safa", "The first green light"],
    right: 1,
    why: "Sa'i starts at Safa, and the first walk goes towards Marwah.",
  },
  {
    step: 3,
    ask: "What do you do on Safa before the first walk?",
    answers: ["Make the niat of sa'i, face the Kaabah, raise your hands, say takbir and make doa", "Pray two rakaat", "Walk straight on to Marwah"],
    right: 0,
    why: "On Safa, make the niat of sa'i, face the Kaabah, raise both hands, say takbir and make doa. The two rakaat come after tawaf, before sa'i.",
  },
  {
    step: 4,
    ask: "You come down from Safa. Which lane do you keep to?",
    answers: ["Any lane that is less crowded", "The lane of the people going back to Safa", "The lane to Marwah"],
    right: 2,
    why: "The mas'a has one lane for each way. Keep to the lane to Marwah, so you do not walk against the people going back to Safa.",
  },
  {
    step: 5,
    ask: "What do men do between the two green lights?",
    answers: ["Walk quickly with short steps", "Stop and make doa", "Walk at a usual pace"],
    right: 0,
    why: "Between the two green lights, men walk quickly with short steps. Women walk at a usual pace.",
  },
  {
    step: 5,
    ask: "What do you say between the two green lights?",
    answers: ["Labbaik Allahumma labbaik", "Rabbighfir warham", "Bismillahi, Allahu Akbar"],
    right: 1,
    why: "Between the two green lights, say “Rabbighfir warham, innaka antal a'azzul akram”.",
  },
  {
    step: 7,
    ask: "You walk from Marwah and reach Safa for the first time. How many walks are done?",
    answers: ["One", "Half of one", "Two"],
    right: 2,
    why: "Safa to Marwah is one walk, and Marwah back to Safa is the second walk.",
  },
  {
    step: 12,
    ask: "Where does sa'i end?",
    answers: ["At Marwah, after the seventh walk", "At Safa, where you started", "Between the two green lights"],
    right: 0,
    why: "The seventh walk goes from Safa to Marwah, so sa'i ends at Marwah.",
  },
];

export const SAI_CHECK: Record<Language, Question[]> = { ms: saiMs, en: saiEn };

// The ihram check, in the Shafi'i school. The ihram-check spec's "Text of the check" table is the source.
// One question for each of ihram steps 1 to 7. The plane and the end of the talbiyah happen at no place in Bir Ali, so they have no question (D104).
const ihramMs: Question[] = [
  {
    step: 1,
    ask: "Siapakah yang berihram di Bir Ali?",
    answers: ["Jemaah yang terbang terus ke Jeddah", "Jemaah yang datang dari Madinah", "Jemaah yang sudah tinggal di Makkah"],
    right: 1,
    why: "Bir Ali, atau Zulhulaifah, ialah miqat bagi jemaah yang datang dari Madinah. Jemaah yang terbang terus ke Jeddah berniat dalam kapal terbang sebelum miqat.",
  },
  {
    step: 2,
    ask: "Selepas mandi sunat ihram, di mana anda sapu wangian?",
    answers: ["Pada badan sahaja", "Pada kain ihram", "Pada badan dan kain ihram"],
    right: 0,
    why: "Sapu wangian pada badan sebelum niat, dan jangan sekali-kali pada kain ihram. Selepas niat, jangan memakai wangian lagi.",
  },
  {
    step: 3,
    ask: "Apa yang lelaki pakai dalam ihram?",
    answers: ["Jubah putih yang berjahit dan kopiah", "Pakaian biasa yang menutup aurat", "Dua helai kain putih tidak berjahit, dan kepala tidak ditutup"],
    right: 2,
    why: "Lelaki memakai dua helai kain putih tidak berjahit: satu di pinggang, satu di atas bahu, dan kepala tidak ditutup. Wanita memakai pakaian biasa yang menutup aurat.",
  },
  {
    step: 4,
    ask: "Apa yang anda buat di dewan solat sebelum niat?",
    answers: ["Solat sunat ihram dua rakaat", "Solat sunat tawaf dua rakaat", "Mula bertalbiyah dengan suara kuat"],
    right: 0,
    why: "Solat sunat ihram dua rakaat, kemudian berniat. Solat sunat tawaf datang di Makkah, selepas tawaf. Talbiyah bermula selepas niat.",
  },
  {
    step: 5,
    ask: "Bilakah ihram anda bermula?",
    answers: ["Apabila anda memakai kain ihram", "Apabila anda berniat umrah", "Apabila bas bertolak dari Bir Ali"],
    right: 1,
    why: "Ihram bermula dengan niat umrah, bukan dengan pakaian. Jadi berniat sebelum bas meninggalkan miqat.",
  },
  {
    step: 6,
    ask: "Dari sini hingga ke Makkah, apa yang anda baca dengan kerap?",
    answers: ["Rabbighfir warham", "Bismillahi, Allahu Akbar", "Labbaik Allahumma labbaik"],
    right: 2,
    why: "Baca talbiyah, “Labbaik Allahumma labbaik”, dengan kerap. Lelaki membacanya dengan suara kuat, dan wanita dengan suara perlahan.",
  },
  {
    step: 7,
    ask: "Anda sudah berihram. Yang mana tidak dibenarkan?",
    answers: ["Memotong rambut atau kuku", "Mandi dengan air biasa", "Memakai selipar"],
    right: 0,
    why: "Selagi dalam ihram, jangan memotong rambut atau kuku, dan jangan memakai wangian. Mandi dengan air biasa dan memakai selipar dibenarkan. Larangan ini tamat selepas tahallul.",
  },
];

const ihramEn: Question[] = [
  {
    step: 1,
    ask: "Who enters ihram at Bir Ali?",
    answers: ["Pilgrims who fly straight to Jeddah", "Pilgrims who come from Madinah", "Pilgrims who already stay in Makkah"],
    right: 1,
    why: "Bir Ali, or Dhul Hulaifah, is the miqat for pilgrims who come from Madinah. Pilgrims who fly straight to Jeddah make the niat on the plane before the miqat.",
  },
  {
    step: 2,
    ask: "After the sunnah bath of ihram, where do you put scent?",
    answers: ["On your body only", "On the ihram cloth", "On your body and the ihram cloth"],
    right: 0,
    why: "Put scent on your body before the niat, and never on the ihram cloth. After the niat, use no more scent.",
  },
  {
    step: 3,
    ask: "What do men wear in ihram?",
    answers: ["A sewn white robe and a cap", "Their usual clothes that cover the aurat", "Two white cloths with no seams, and the head bare"],
    right: 2,
    why: "Men wear two white cloths with no seams: one round the waist, one over the shoulder, and the head stays bare. Women wear their usual clothes that cover the aurat.",
  },
  {
    step: 4,
    ask: "What do you do in the prayer hall before the niat?",
    answers: ["Pray two rakaat of solat sunat ihram", "Pray two rakaat of solat sunat tawaf", "Start the talbiyah aloud"],
    right: 0,
    why: "Pray two rakaat of solat sunat ihram, then make the niat. Solat sunat tawaf comes in Makkah, after tawaf. The talbiyah starts after the niat.",
  },
  {
    step: 5,
    ask: "When does your ihram start?",
    answers: ["When you put on the ihram cloths", "When you make the niat of umrah", "When the bus leaves Bir Ali"],
    right: 1,
    why: "Ihram starts with the niat of umrah, not with the clothes. So make the niat before the bus leaves the miqat.",
  },
  {
    step: 6,
    ask: "From here to Makkah, what do you say often?",
    answers: ["Rabbighfir warham", "Bismillahi, Allahu Akbar", "Labbaik Allahumma labbaik"],
    right: 2,
    why: "Say the talbiyah, “Labbaik Allahumma labbaik”, often. Men say it aloud, and women say it quietly.",
  },
  {
    step: 7,
    ask: "You are in ihram now. Which act is not allowed?",
    answers: ["Cut your hair or nails", "Take a bath with plain water", "Wear sandals"],
    right: 0,
    why: "While in ihram, do not cut your hair or nails, and do not use scent. A bath with plain water and sandals are allowed. These rules end after tahallul.",
  },
];

export const IHRAM_CHECK: Record<Language, Question[]> = { ms: ihramMs, en: ihramEn };
