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
