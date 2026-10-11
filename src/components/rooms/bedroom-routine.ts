import { bag, rand, type Line, type SceneApi, type SpecialLegs, type SleepStyle } from "@/components/game/scene";
import { CAST_INFO, type CastId } from "@/components/game/cast";
import { BED_TOP } from "@/components/game/bedroom";
import { DAILY_OUTFITS, OUTFITS, getOutfit, setOutfit, type OutfitId } from "@/components/game/outfit";
import { INSTRUMENTAL, SONG_LINE_MS } from "@/lib/foley";
import { SONGS } from "@/content/songs";
import { enter, leave } from "@/components/rooms/shared";
import { ROOM_NAME, hasPrayed, markPrayed, rizky } from "@/components/game/rizky";
import { LEAVE_TO } from "@/content/dialogue";
import {
  BED_GO,
  DOZE_WAKE,
  DZIKIR,
  EAT_GO,
  EAT_LINES,
  FRIEND_AFTER,
  FRIEND_ARRIVE,
  FRIEND_INVITE,
  GAME_LINES,
  GOOGLE_LINES,
  GUITAR_GO,
  LATE_LINES,
  MANDI_BACK,
  MANDI_GO,
  NAP_GO,
  OUTFIT_LINE,
  PHONE_LINES,
  PRAY_DONE,
  PRAY_GO,
  SONG_ENCORE,
  SONG_INTRO,
  PROJECT_LINES,
  WAKE_UP,
  WORKOUT_LINES,
  dayKey,
  duePrayer,
  isNapTime,
  isSleepTime,
  isyaPassed,
  slotOf,
  type PrayerId,
  type Slot,
} from "@/content/routine";

export const BEDROOM_FRIENDS = ["bayu", "dina", "raka", "lala", "nadia", "kevin", "sari", "tari"] as const satisfies readonly CastId[];
const FEMALE_CAST = new Set<CastId>(["dina", "lala", "nadia", "sari", "tari", "rina"]);

const CHAIR_SEAT = 9;
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const night = () => document.documentElement.classList.contains("dark");

// Posisi tidur: telentang biasa, terbalik, miring hampir jatuh, tengkurap, atau kaki ke mana-mana.
const SLEEP_POSES: { legs?: SpecialLegs; style: SleepStyle }[] = [
  { style: "" },
  { style: "flip" },
  { style: "tilt" },
  { style: "face" },
  { legs: "spread", style: "" },
  { legs: "spread", style: "flip" },
];

/**
 * Rutinitas Rizky di kamarnya: bangun, sholat lima waktu, mandi, makan, main gim, cek proyek,
 * googling, ganti baju, main gitar sambil bernyanyi (kadang mengajak teman), lalu tidur di jam
 * yang berbeda-beda (sholat Isya dulu). Aktivitas dipilih sesuai jam pengunjung.
 */
let forcedName: string | null = null;
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __bedroom: (n: string) => void }).__bedroom = (n) => (forcedName = n);
  void import("@/lib/foley").then((m) => Object.assign(window, { __foley: m }));
}

export function makeBedroomRoutine() {
  const lines = {
    game: bag(GAME_LINES),
    google: bag(GOOGLE_LINES),
    project: bag(PROJECT_LINES),
    late: bag(LATE_LINES),
    phone: bag(PHONE_LINES),
    workout: bag(WORKOUT_LINES),
    eat: bag(EAT_LINES),
  };
  const done = new Set<string>();
  let asleep = false;
  let first = true;
  // Lagu dan teman diambil bergiliran tanpa pengulangan berturut-turut.
  const nextSong = bag(SONGS.map((_, i) => i));
  const nextFriend = bag<CastId>([...BEDROOM_FRIENDS]);

  const once = (name: string) => {
    const key = `${dayKey(new Date())}:${name}`;
    if (done.has(key)) return false;
    done.add(key);
    return true;
  };

  const sitAtDesk = async (api: SceneApi, acc?: "food" | "mug") => {
    await api.walk("me", api.spot("chair"));
    api.face("me", 1);
    api.pose("me", { sit: true, lift: CHAIR_SEAT, acc });
  };

  // Tertidur di meja saat begadang, lalu kaget bangun.
  const doze = async (api: SceneApi) => {
    api.pose("me", { sit: true, sleep: true, lift: CHAIR_SEAT });
    await api.wait(rand(5000, 9000));
    api.pose("me", { sit: true, lift: CHAIR_SEAT });
    await api.emote("me", "!");
    await api.say("me", pick(DOZE_WAKE));
  };

  const atPc = (screen: string, sound: "game" | "type", ms: number, say: () => Line) => async (api: SceneApi) => {
    await sitAtDesk(api);
    api.prop("pc", screen);
    api.sfx("type", ms);
    if (sound === "game") api.sfx("game", ms);
    await api.wait(ms * 0.5);
    await api.say("me", say());
    await api.wait(ms * 0.5);
    const late = slotOf(new Date()) === "begadang";
    if (late && Math.random() < 0.35) await doze(api);
  };

  const lateOr = (normal: () => Line) => () => (slotOf(new Date()) === "begadang" && Math.random() < 0.6 ? lines.late() : normal());
  const game = atPc("game", "game", 5000, lateOr(lines.game));
  const google = atPc("google", "type", 3500, lines.google);
  const project = atPc("project", "type", 4500, lateOr(lines.project));
  const code = atPc("code", "type", 4500, lateOr(lines.project));

  const changeOutfit = async (api: SceneApi, to?: OutfitId) => {
    const spot = api.spot("wardrobe");
    if (Number.isFinite(spot)) await api.walk("me", spot);
    api.prop("wardrobe", "open");
    await api.wait(900);
    const next = to ?? pick(DAILY_OUTFITS.filter((o) => o !== getOutfit()));
    setOutfit(next);
    await api.wait(700);
    api.prop("wardrobe", "closed");
    await api.say("me", OUTFIT_LINE(OUTFITS[next].name));
  };

  // Sholat: pakai koko dan peci, bentangkan sajadah, rukuk dan sujud, lalu dzikir sebentar.
  const pray = async (api: SceneApi, id: PrayerId) => {
    api.prop("pc", "off");
    await api.say("me", PRAY_GO[id]);
    if (getOutfit() !== "koko") await changeOutfit(api, "koko");
    // Sajadah dibentangkan dulu supaya posisinya bisa diukur, lalu berdiri di atasnya menghadap kiblat (kanan).
    api.prop("sajadah", "open");
    const mat = api.spot("sajadah", 0.3);
    await api.walk("me", Number.isFinite(mat) ? mat : 50);
    api.face("me", 1);
    const hold = async (legs: "qiyam" | "ruku" | "sujud" | "duduk", ms: number) => {
      api.pose("me", { legs });
      await api.wait(ms);
    };
    const rakaat = { subuh: 2, dzuhur: 4, ashar: 4, maghrib: 3, isya: 4 }[id];
    for (let i = 0; i < rakaat; i++) {
      await hold("qiyam", i === 0 ? 2600 : 2000); // berdiri (takbir, membaca)
      await hold("ruku", 1600); // rukuk
      await hold("qiyam", 900); // i'tidal
      await hold("sujud", 1600); // sujud pertama
      await hold("duduk", 900); // duduk di antara dua sujud
      await hold("sujud", 1600); // sujud kedua
      // Tasyahud awal di rakaat kedua (selain Subuh), tasyahud akhir di rakaat terakhir.
      if (i === 1 && rakaat > 2) await hold("duduk", 1800);
    }
    await hold("duduk", 2200);
    // Salam: menoleh ke kanan lalu ke kiri.
    api.face("me", 1);
    await api.wait(500);
    api.face("me", -1);
    await api.wait(500);
    api.face("me", 1);
    await api.say("me", pick(DZIKIR));
    markPrayed(id);
    api.pose("me", {});
    api.prop("sajadah", "closed");
    await api.say("me", pick(PRAY_DONE));
  };
  const prayed = hasPrayed;

  // Keluar kamar sebentar (mandi, ambil makan, ke ruang kerja), lalu kembali.
  const away = async (api: SceneApi, ms: number) => {
    api.prop("pc", "off");
    await leave(api, "me", "door-l");
    await api.wait(ms);
  };

  const mandi = async (api: SceneApi) => {
    await api.say("me", pick(MANDI_GO));
    await away(api, rand(7000, 11000));
    setOutfit("handuk");
    await enter(api, "me", "door-l", api.spot("wardrobe", 1.3));
    await api.emote("me", "!");
    await api.say("me", pick(MANDI_BACK));
    await changeOutfit(api);
  };

  const makan = async (api: SceneApi) => {
    await api.say("me", EAT_GO[slotOf(new Date())]);
    await away(api, rand(4000, 7000));
    await enter(api, "me", "door-l", 30);
    await sitAtDesk(api, "food");
    for (let i = 0; i < 3; i++) {
      api.sfx("eat");
      await api.wait(1300);
    }
    await api.emote("me", "♥");
    await api.say("me", lines.eat());
    api.pose("me", { sit: true, lift: CHAIR_SEAT });
  };

  const workout = async (api: SceneApi) => {
    if (getOutfit() !== "olahraga" && Math.random() < 0.6) await changeOutfit(api, "olahraga");
    const spot = api.spot("dumbbell");
    await api.walk("me", Number.isFinite(spot) ? spot - 3 : 60);
    await api.say("me", lines.workout());
    // Push up: naik turun beberapa kali.
    api.face("me", 1);
    for (let i = 0; i < 5; i++) {
      api.pose("me", { legs: "pushup" });
      await api.wait(450);
      api.pose("me", { legs: "pushdown" });
      await api.wait(450);
    }
    api.pose("me", {});
    await api.emote("me", "!");
  };

  const phone = async (api: SceneApi) => {
    await api.walk("me", api.spot("bed", 0.7));
    api.face("me", -1);
    api.pose("me", { sit: true, acc: "phone", lift: BED_TOP - 3 });
    await api.wait(rand(2500, 4000));
    await api.say("me", lines.phone());
  };

  // Main gitar di tepi kasur sambil bernyanyi; teman (bila ada) ikut bernyanyi dan bertepuk tangan.
  // Main gitar di tepi kasur sambil bernyanyi (lagu Indonesia, Inggris, atau Spanyol bergantian).
  // Teman yang diajak duduk di kasur atau di kursi, lalu ikut bernyanyi di dua baris terakhir.
  const guitar = async (api: SceneApi, friends: CastId[] = []) => {
    if (!friends.length) await api.say("me", pick(GUITAR_GO));
    await api.walk("me", api.spot("guitar", 0.5) - 3);
    api.prop("guitar", "open");
    await api.wait(400);
    await api.walk("me", api.spot("bed", friends.length ? 0.85 : 0.72));
    api.face("me", -1);
    api.pose("me", { sit: true, acc: "guitar", lift: BED_TOP - 3 });
    // Suara teman yang ikut bernyanyi: 1 = laki-laki, 2 = perempuan.
    const voices = friends.reduce((mask, f) => mask | (FEMALE_CAST.has(f) ? 2 : 1), 0);
    // Satu lagu utuh (intro, bait, reff, outro); kadang langsung lanjut lagu kedua.
    const songs = Math.random() < 0.35 ? 2 : 1;
    for (let n = 0; n < songs; n++) {
      const index = nextSong();
      const song = SONGS[index];
      const intro = n === 0 ? SONG_INTRO(song.title) : SONG_ENCORE(song.title);
      await api.say("me", intro);
      // Intro gitar dua birama sebelum mulai bernyanyi.
      api.sfx("songLine", index * 10 + INSTRUMENTAL);
      await api.emote("me", "♪");
      await api.wait(SONG_LINE_MS - 900);
      for (let i = 0; i < song.lines.length; i++) {
        // Teman ikut bernyanyi di bagian reff.
        const joins = friends.length > 0 && i >= 4;
        api.sfx("songLine", index * 10 + i, joins ? voices : 0);
        await Promise.all([
          api.sing("me", song.lines[i], SONG_LINE_MS),
          // Teman cukup menampilkan "♪" supaya gelembungnya tidak menutupi lirik.
          ...friends.map((f) => (joins ? api.emote(f, "♪") : Promise.resolve())),
        ]);
      }
      // Outro: petikan penutup.
      api.sfx("songLine", index * 10 + INSTRUMENTAL);
      await api.wait(SONG_LINE_MS);
    }
    await Promise.all(friends.map((f) => api.emote(f, "♥")));
    api.pose("me", {});
    await api.walk("me", api.spot("guitar", 0.5) - 3);
    api.prop("guitar", "closed");
  };

  const friendJam = async (api: SceneApi) => {
    // Kadang satu teman, kadang dua; teman yang diajak bergiliran supaya tidak orang yang sama terus.
    const free: CastId[] = BEDROOM_FRIENDS.filter((f) => api.available(f));
    if (!free.length) return guitar(api);
    let lead = nextFriend();
    for (let i = 0; i < BEDROOM_FRIENDS.length && !free.includes(lead); i++) lead = nextFriend();
    if (!free.includes(lead)) lead = pick(free);
    const friends: CastId[] = [lead];
    const extra = free.find((f) => f !== lead);
    if (extra && Math.random() < 0.4) friends.push(extra);
    const names = friends.map((f) => CAST_INFO[f].name).join(" & ");
    const invite = pick(FRIEND_INVITE);
    api.pose("me", { acc: "phone" });
    // Nama teman tampil di gelembung; yang dibacakan cukup ajakannya.
    await api.say("me", { id: `${names}! ${invite.id}`, en: `${names}! ${invite.en}` }, invite);
    await api.wait(rand(1500, 2500));
    const [first, second] = friends;
    // Bila temannya keburu ke ruangan lain, Rizky main gitar sendiri saja.
    if (!(await enter(api, first, "door-l", api.spot("bed", 0.2)))) return guitar(api);
    await api.say(first, pick(FRIEND_ARRIVE));
    api.face(first, 1);
    api.pose(first, { sit: true, lift: BED_TOP - 3 });
    if (second && !(await enter(api, second, "door-l", api.spot("chair")))) friends.pop();
    else if (second) {
      api.face(second, -1);
      api.pose(second, { sit: true, lift: CHAIR_SEAT });
      await api.emote(second, "!");
    }
    await guitar(api, friends);
    await api.say(first, pick(FRIEND_AFTER));
    for (const f of friends) await leave(api, f, "door-l");
  };

  type Act = (api: SceneApi) => Promise<void>;
  const onceThen = (name: string, act: Act, fallback: Act): Act => (api) => (once(name) ? act(api) : fallback(api));

  const plans: Record<Slot, Act[]> = {
    pagi: [onceThen("mandi-pagi", mandi, phone), onceThen("sarapan", makan, code), (api) => changeOutfit(api), workout, phone, code, google],
    siang: [project, project, code, google, google, game, onceThen("makan-siang", makan, project), guitar, phone, (api) => changeOutfit(api)],
    sore: [game, game, guitar, friendJam, friendJam, onceThen("mandi-sore", mandi, game), workout, project, phone],
    malam: [game, game, project, code, google, guitar, friendJam, onceThen("makan-malam", makan, game), phone, (api) => changeOutfit(api)],
    begadang: [project, code, game, game, google, onceThen("mie-malam", makan, project)],
  };
  const bags = Object.fromEntries(Object.entries(plans).map(([slot, acts]) => [slot, bag(acts)])) as Record<Slot, () => Act>;

  const lieDown = async (api: SceneApi) => {
    const pose = pick(SLEEP_POSES);
    api.place("me", api.spot("bed", rand(0.08, 0.28)));
    api.face("me", 1);
    api.pose("me", { sleep: true, lift: BED_TOP, legs: pose.legs, style: pose.style });
  };

  const goToBed = async (api: SceneApi, nap: boolean) => {
    api.prop("pc", "off");
    if (!nap && isyaPassed(new Date()) && !prayed("isya")) await pray(api, "isya");
    if (!nap && getOutfit() !== "piyama") await changeOutfit(api, "piyama");
    if (night()) api.prop("lamp", "open");
    await api.walk("me", api.spot("bed", 0.5));
    await api.say("me", pick(nap ? NAP_GO : BED_GO));
    await lieDown(api);
    await api.wait(1500);
    api.prop("lamp", "closed");
    asleep = true;
  };

  const wakeUp = async (api: SceneApi) => {
    api.pose("me", { sit: true, lift: BED_TOP - 3 });
    await api.wait(1000);
    await api.emote("me", "!");
    await api.say("me", pick(WAKE_UP));
    api.pose("me", {});
    asleep = false;
  };

  const named: Record<string, Act> = {
    game, google, project, code, mandi, makan, workout, phone, guitar: (api) => guitar(api), friendJam,
    outfit: (api) => changeOutfit(api),
    sleep: (api) => goToBed(api, true),
  };

  return async (api: SceneApi) => {
    // Khusus pengembangan: window.__bedroom("guitar") menjalankan satu aktivitas berikutnya.
    if (forcedName && named[forcedName]) {
      const act = named[forcedName];
      forcedName = null;
      if (asleep) await wakeUp(api);
      return act(api);
    }
    const now = new Date();
    const sleepy = isSleepTime(now) || isNapTime(now);
    // Rizky cuma satu: kalau jadwalnya bilang ia di ruangan lain, ia pamit lalu keluar kamar.
    const recent = rizky.sinceMs() < 8000;
    if (rizky.room() !== "bedroom") {
      first = false;
      asleep = false;
      if (api.shown("me")) {
        api.prop("pc", "off");
        if (recent) {
          api.pose("me", {});
          await api.say("me", pick(LEAVE_TO(ROOM_NAME[rizky.room()])));
          await leave(api, "me", "door-l");
        } else {
          api.show("me", false);
        }
      }
      return api.wait(2500);
    }
    // Sudah lama di kamar (misalnya pengunjung baru membuka halaman): langsung tampil tanpa adegan masuk.
    if (!recent && !api.shown("me") && !sleepy) first = true;

    if (sleepy) {
      if (first) {
        // Halaman dibuka saat jam tidur: Rizky sudah terlelap.
        first = false;
        if (isSleepTime(now)) setOutfit("piyama");
        api.show("me", true);
        await lieDown(api);
        asleep = true;
        return;
      }
      if (!api.shown("me")) await enter(api, "me", "door-l", api.spot("bed", 0.6));
      if (!asleep) return goToBed(api, !isSleepTime(now));
      // Sesekali berguling ganti posisi tidur.
      await api.wait(rand(5000, 9000));
      if (Math.random() < 0.3) await lieDown(api);
      return;
    }

    if (asleep) return wakeUp(api);

    if (!api.shown("me")) {
      if (first) {
        first = false;
        api.place("me", api.spot("chair"));
        api.show("me", true);
        api.face("me", 1);
        api.pose("me", { sit: true, lift: CHAIR_SEAT });
        api.prop("pc", "code");
        return;
      }
      await enter(api, "me", "door-l", rand(35, 55));
      return;
    }
    first = false;

    const due = duePrayer(now);
    if (due && !prayed(due.id)) return pray(api, due.id);

    await bags[slotOf(now)]()(api);
    await api.wait(rand(700, 1600));
  };
}

