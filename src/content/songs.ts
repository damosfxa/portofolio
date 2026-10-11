// Lagu-lagu ciptaan sendiri yang dinyanyikan Rizky sambil main gitar.
// Liriknya tetap dalam bahasa aslinya (Indonesia, Inggris, Spanyol), tidak ikut diterjemahkan.
// Setiap lagu: 4 baris bait lalu 4 baris reff. Setiap baris dibuat pendek (maksimal sekitar 12 suku kata)
// supaya muat dalam 2 birama.

export type SongLang = "id" | "en" | "es";
export type Song = { title: string; lang: SongLang; lines: string[]; chords: [string, string, string, string] };

/** Jumlah baris lirik per lagu (bait + reff). */
export const SONG_LINES = 8;

export const SONGS: Song[] = [
  {
    title: "Kopi Pagi",
    lang: "id",
    chords: ["C", "G", "Am", "F"],
    lines: [
      "Kopi pagi di meja kerja",
      "Kode jalan, hati pun lega",
      "Bug datang, ku tak menyerah",
      "Deploy malam, besok cerah",
      "Pelan-pelan semua jadi",
      "Satu baris demi satu hari",
      "Kalau lelah, petik gitar",
      "Besok pagi kita mulai lagi",
    ],
  },
  {
    title: "Late Night Build",
    lang: "en",
    chords: ["Am", "F", "C", "G"],
    lines: [
      "Coffee cold, the screen is bright",
      "One more bug before the night",
      "Push the code and hold on tight",
      "Morning comes, it works just right",
      "Oh, we build it line by line",
      "Every error, one more sign",
      "Sing it loud, the tests are green",
      "Best release you've ever seen",
    ],
  },
  {
    title: "Café y Código",
    lang: "es",
    chords: ["F", "G", "C", "Am"],
    lines: [
      "Café caliente en la mañana",
      "Código limpio, buena semana",
      "Si hay un error, no pasa nada",
      "Lo arreglamos con alegría",
      "Canta conmigo esta canción",
      "Línea por línea, con el corazón",
      "Mañana sale el sol otra vez",
      "Y todo funciona, ya lo ves",
    ],
  },
  {
    title: "Rumah Kecil",
    lang: "id",
    chords: ["F", "C", "G", "Am"],
    lines: [
      "Rumah kecil penuh cerita",
      "Teman datang bawa tawa",
      "Satu lagu buat kita",
      "Besok kerja sama-sama",
      "Lampu kamar menyala",
      "Gitar tua tetap setia",
      "Nyanyikan dengan suara",
      "Hari ini milik kita",
    ],
  },
  {
    title: "Little Room",
    lang: "en",
    chords: ["C", "Am", "F", "G"],
    lines: [
      "In my little pixel room",
      "Guitar strings and quiet tunes",
      "Friends drop by this afternoon",
      "Singing softly to the moon",
      "Stay a while, the night is long",
      "Clap your hands and sing along",
      "Every friend becomes a song",
      "Here is where we all belong",
    ],
  },
  {
    title: "Noche Tranquila",
    lang: "es",
    chords: ["Am", "G", "F", "C"],
    lines: [
      "Noche tranquila en mi cuarto",
      "Una guitarra y un canto",
      "Mis amigos a mi lado",
      "Y el sueño llega despacio",
      "Duerme la ciudad",
      "Brilla la luna en paz",
      "Una canción más",
      "Y mañana volverás",
    ],
  },
];
