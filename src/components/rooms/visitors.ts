import { bag, rand, type SceneApi } from "@/components/game/scene";
import type { RoomContent, VisitorScript } from "@/content/visitors";
import { enter, leave, playTalk } from "@/components/rooms/shared";
import { ANSWER_ASLEEP, ANSWER_AWAY, ASK_WHERE, WAIT_ALONE } from "@/content/dialogue";
import { ROOM_NAME, rizky, rizkyAsleep } from "@/components/game/rizky";

export type VisitorCtx = {
  /** Tamu yang sedang ada di ruangan. */
  present: () => string[];
  /** Tambah hitungan giliran tamu (makin tinggi, makin dekat waktunya pulang). */
  tick: (id: string) => void;
};

type Options = {
  content: RoomContent;
  /** Pintu masuk dan keluar tamu. */
  door: string;
  maxGuests?: number;
  /** Posisi berdiri acak (persen lebar panggung). */
  spot?: () => number;
  /** Aktivitas khusus ruangan, memakai tamu yang sedang ada. */
  extras?: ((api: SceneApi, ctx: VisitorCtx) => Promise<void>)[];
};

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/**
 * Naskah tamu: tamu datang bergantian lewat pintu, bertanya, mengobrol, beraktivitas,
 * lalu pulang dan digantikan tamu lain. Dipanggil berulang oleh mesin adegan.
 */
export function makeVisitorScript({ content, door, maxGuests = 2, spot = () => rand(22, 72), extras = [] }: Options) {
  const byId = new Map<string, VisitorScript>(content.visitors.map((v) => [v.id, v]));
  const roster = content.visitors.map((v) => v.id as string);
  const turns = new Map<string, number>();
  const stayFor = new Map<string, number>();
  const pairs = bag(content.pair);
  // Tamu yang baru pulang tidak langsung datang lagi, supaya wajahnya bergantian.
  const recent: string[] = [];
  let lastPresent: string[] = [];
  const gone = (id: string) => {
    if (recent.includes(id)) recent.splice(recent.indexOf(id), 1);
    recent.push(id);
    if (recent.length > Math.max(1, roster.length - 2)) recent.shift();
  };
  const fresh = (absent: string[]) => {
    const pool = absent.filter((id) => !recent.includes(id));
    return pick(pool.length ? pool : absent);
  };
  // Saat Rizky tidur siang, tamu tidak berlama-lama.
  const stayLength = () => Math.round(rizkyAsleep() ? rand(2, 3) : rand(3, 6));

  const ctx = (api: SceneApi): VisitorCtx => ({
    present: () => roster.filter((id) => api.shown(id)),
    tick: (id) => turns.set(id, (turns.get(id) ?? 0) + 1),
  });

  const arrive = async (api: SceneApi, id: string) => {
    const v = byId.get(id)!;
    turns.set(id, 0);
    stayFor.set(id, stayLength());
    if (!(await enter(api, id, door, spot()))) return;
    await api.emote(id, "!");
    await api.say(id, pick(v.arrive));
  };

  const depart = async (api: SceneApi, id: string) => {
    const v = byId.get(id)!;
    await api.say(id, pick(v.leave));
    await leave(api, id, door);
    gone(id);
  };

  // Rizky tidak ada di ruangan ini: tamu mencarinya, tamu lain (bila ada) menjawab di mana Rizky.
  const askWhere = async (api: SceneApi, c: VisitorCtx, guest: string) => {
    await api.say(guest, pick(ASK_WHERE));
    const other = c.present().find((id) => id !== guest);
    const answer = rizkyAsleep() ? ANSWER_ASLEEP : ANSWER_AWAY(ROOM_NAME[rizky.room()]);
    if (other) {
      api.faceTo(other, guest);
      await api.say(other, pick(answer));
    } else {
      await api.say(guest, pick(WAIT_ALONE));
    }
    c.tick(guest);
  };

  const ask = async (api: SceneApi, c: VisitorCtx) => {
    const guest = pick(c.present());
    const v = byId.get(guest)!;
    if (!v.ask.length) return;
    if (!api.shown("me")) return askWhere(api, c, guest);
    const meX = api.x("me");
    // Tamu mendekat ke Rizky, berdiri di sisi yang lebih lapang.
    await api.walk(guest, meX > 50 ? meX - 9 : meX + 9);
    await playTalk(api, pick(v.ask), { a: guest, me: "me" });
    c.tick(guest);
  };

  const pair = async (api: SceneApi, c: VisitorCtx) => {
    const present = c.present();
    if (present.length < 2) return solo(api, c);
    const [a, b] = present.sort(() => Math.random() - 0.5);
    const meet = spot();
    await Promise.all([api.walk(a, meet - 5), api.walk(b, meet + 5)]);
    await playTalk(api, pairs(), { a, b });
    c.tick(a);
    c.tick(b);
  };

  const solo = async (api: SceneApi, c: VisitorCtx) => {
    const guest = pick(c.present());
    const v = byId.get(guest)!;
    await api.walk(guest, spot());
    if (Math.random() < 0.4) api.pose(guest, { acc: "phone" });
    if (Math.random() < 0.35) await api.emote(guest, pick(["♪", "?", "!"]));
    await api.say(guest, pick(v.solo));
    c.tick(guest);
  };

  const actions = bag<(api: SceneApi, c: VisitorCtx) => Promise<void>>([ask, ask, pair, solo, ...extras]);

  return async (api: SceneApi) => {
    const c = ctx(api);
    const present = c.present();
    // Tamu yang bisa datang: tidak sedang di ruangan ini dan tidak sedang berada di ruangan lain.
    const absent = roster.filter((id) => !present.includes(id) && api.available(id));
    // Tamu yang pulang karena malam juga dicatat.
    lastPresent.filter((id) => !present.includes(id)).forEach(gone);
    lastPresent = present;

    // Ruangan kosong: tamu baru segera datang.
    if (present.length === 0 && absent.length) {
      await api.wait(rand(600, 1500));
      return arrive(api, fresh(absent));
    }
    // Semua calon tamu sedang di ruangan lain: ruangan ini sepi dulu.
    if (!present.length) return api.wait(rand(2500, 4000));
    // Tamu yang sudah cukup lama pamit pulang.
    const done = present.find((id) => (turns.get(id) ?? 0) >= (stayFor.get(id) ?? 4));
    if (done) return depart(api, done);
    // Kadang tamu kedua ikut datang supaya ruangan ramai.
    if (present.length < maxGuests && absent.length && Math.random() < 0.3) return arrive(api, fresh(absent));

    await actions()(api, c);
    await api.wait(rand(400, 1200));
  };
}
