import { bag, rand, type Line, type SceneApi } from "@/components/game/scene";
import type { CastId } from "@/components/game/cast";
import type { NightRoom } from "@/content/night";
import { enter, leave, playTalk } from "@/components/rooms/shared";
import { rizkyAsleep } from "@/components/game/rizky";
import { SHUSH } from "@/content/dialogue";

export type NightCtx = {
  /** Anggota rombongan yang sedang ada di ruangan. */
  present: () => CastId[];
  tick: (id: CastId) => void;
  /** Kalimat kegiatan tertentu (tanpa pengulangan berturut-turut). */
  line: (act: string) => Line;
};

export type NightAct = (api: SceneApi, c: NightCtx) => Promise<void>;

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

/**
 * Naskah malam: rombongan datang satu per satu (2 sampai 3 orang), mengobrol dan melakukan kegiatan
 * khas ruangan, lalu bergantian pulang dan digantikan yang lain sampai pagi.
 */
export function makeNightScript({
  room,
  door = "door-l",
  spot = () => rand(25, 70),
  acts = [],
}: {
  room: NightRoom;
  door?: string;
  spot?: () => number;
  acts?: NightAct[];
}) {
  const turns = new Map<CastId, number>();
  const stayFor = new Map<CastId, number>();
  const pairs = bag(room.pairs);
  const solos = bag(room.solo);
  const actLines = Object.fromEntries(Object.entries(room.acts).map(([k, v]) => [k, bag(v)]));

  const ctx = (api: SceneApi): NightCtx => ({
    present: () => room.cast.filter((id) => api.shown(id)),
    tick: (id) => turns.set(id, (turns.get(id) ?? 0) + 1),
    line: (act) => actLines[act](),
  });

  const arrive = async (api: SceneApi, id: CastId) => {
    turns.set(id, 0);
    // Saat Rizky sudah tidur, rombongan tidak berlama-lama.
    stayFor.set(id, Math.round(rizkyAsleep() ? rand(2, 4) : rand(4, 7)));
    if (!(await enter(api, id, door, spot()))) return;
    await api.say(id, pick(room.arrive));
  };

  const pair: NightAct = async (api, c) => {
    const present = c.present();
    if (present.length < 2) return solo(api, c);
    const [a, b] = shuffle(present);
    const meet = spot();
    await Promise.all([api.walk(a, meet - 5), api.walk(b, meet + 5)]);
    await playTalk(api, pairs(), { a, b });
    c.tick(a);
    c.tick(b);
  };

  const solo: NightAct = async (api, c) => {
    const who = pick(c.present());
    await api.walk(who, spot());
    if (Math.random() < 0.3) await api.emote(who, pick(["♪", "!", "?"]));
    await api.say(who, solos());
    c.tick(who);
  };

  // Saling mengingatkan untuk pelan-pelan karena Rizky sedang tidur.
  const shush: NightAct = async (api, c) => {
    const who = pick(c.present());
    await api.say(who, pick(SHUSH));
    c.tick(who);
  };

  const actions = bag<NightAct>([pair, pair, solo, ...acts, ...acts]);

  return async (api: SceneApi) => {
    const c = ctx(api);
    const present = c.present();
    // Hanya yang tidak sedang berada di ruangan lain yang bisa datang.
    const absent = room.cast.filter((id) => !present.includes(id) && api.available(id));
    // Ruangan malam tidak pernah sepi: minimal dua orang.
    if (present.length < 2 && absent.length) {
      await api.wait(rand(400, 1200));
      return arrive(api, pick(absent));
    }
    // Semua anggota rombongan sedang di ruangan lain: ruangan ini sepi dulu.
    if (!present.length) return api.wait(rand(2500, 4000));
    const done = present.find((id) => (turns.get(id) ?? 0) >= (stayFor.get(id) ?? 5));
    if (done) {
      await api.say(done, pick(room.bye));
      return leave(api, done, door);
    }
    if (present.length < 3 && absent.length && Math.random() < 0.25) return arrive(api, pick(absent));
    await (rizkyAsleep() && Math.random() < 0.2 ? shush : actions())(api, c);
    await api.wait(rand(500, 1300));
  };
}
