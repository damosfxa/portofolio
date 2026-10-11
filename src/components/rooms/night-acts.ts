import { bag, rand, type SceneApi } from "@/components/game/scene";
import type { CastId } from "@/components/game/cast";
import { SOFA_SEAT, BENCH_SEAT } from "@/components/game/props";
import { ARMCHAIR_SEAT } from "@/components/game/furniture";
import { NIGHT } from "@/content/night";
import { makeNightScript, type NightAct, type NightCtx } from "@/components/rooms/night";
import { playTalk } from "@/components/rooms/shared";
import { rizkyAsleep } from "@/components/game/rizky";

// Kegiatan malam khas tiap ruangan. Semua memakai perabot yang memang ada di ruangan itu,
// dan dilewati dengan aman bila perabotnya disembunyikan (misalnya di layar HP).

const CHAIR_SEAT = 9;
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const two = (c: NightCtx) => {
  const p = [...c.present()].sort(() => Math.random() - 0.5);
  return p.length >= 2 ? ([p[0], p[1]] as [CastId, CastId]) : null;
};
const has = (api: SceneApi, prop: string) => Number.isFinite(api.spot(prop));

/* ---------- Ruang tamu: nobar dan main konsol ---------- */

export function livingNight() {
  // Nonton bareng di sofa: film atau bola, dengan suara TV.
  const watch = (kind: "movie" | "football"): NightAct => async (api, c) => {
    const pair = two(c);
    if (!pair || !has(api, "tv")) return;
    const [a, b] = pair;
    await Promise.all([api.walk(a, api.spot("sofa", 0.3)), api.walk(b, api.spot("sofa", 0.7))]);
    api.face(a, 1);
    api.face(b, 1);
    api.pose(a, { sit: true, lift: SOFA_SEAT, acc: Math.random() < 0.5 ? "food" : null });
    api.pose(b, { sit: true, lift: SOFA_SEAT });
    api.prop("tv", "open");
    api.sfx("tv", 5000);
    await api.wait(rand(2500, 3500));
    if (kind === "football") {
      // Sorak penonton tidak dibunyikan saat Rizky tidur.
      if (!rizkyAsleep()) api.sfx("cheer");
      await Promise.all([api.emote(a, "!"), api.emote(b, "!")]);
    }
    await api.say(a, c.line(kind));
    api.sfx("tv", 4000);
    await api.wait(rand(1500, 2500));
    await api.say(b, c.line(kind));
    api.prop("tv", "closed");
    c.tick(a);
    c.tick(b);
  };

  const snack: NightAct = async (api, c) => {
    const who = pick(c.present());
    await api.walk(who, api.spot("fridge", 0.4));
    api.prop("fridge", "open");
    await api.wait(600);
    api.pose(who, { acc: "food" });
    api.prop("fridge", "closed");
    await api.say(who, c.line("snack"));
    c.tick(who);
  };

  const consoleGame: NightAct = async (api, c) => {
    const pair = two(c);
    if (!pair || !has(api, "tv")) return;
    const [a, b] = pair;
    await Promise.all([api.walk(a, api.spot("sofa", 0.3)), api.walk(b, api.spot("sofa", 0.7))]);
    api.pose(a, { sit: true, acc: "pad", lift: SOFA_SEAT });
    api.pose(b, { sit: true, acc: "pad", lift: SOFA_SEAT });
    api.prop("tv", "open");
    api.sfx("game", 4500);
    await api.wait(4500);
    const winner = Math.random() < 0.5 ? a : b;
    await api.emote(winner, "♪");
    await api.say(winner, { id: "Menang! Satu ronde lagi?", en: "I win! One more round?" });
    api.prop("tv", "closed");
    c.tick(a);
    c.tick(b);
  };

  // Salah satu ketiduran di sofa, yang lain berbisik.
  const doze: NightAct = async (api, c) => {
    const pair = two(c);
    if (!pair) return;
    const [sleeper, other] = pair;
    await api.walk(sleeper, api.spot("sofa", 0.4));
    api.pose(sleeper, { sit: true, sleep: true, lift: SOFA_SEAT });
    await api.wait(2500);
    await api.say(other, c.line("doze"));
    await api.wait(rand(3000, 5000));
    api.pose(sleeper, { sit: true, lift: SOFA_SEAT });
    await api.emote(sleeper, "!");
    c.tick(sleeper);
  };

  return makeNightScript({ room: NIGHT.living, spot: () => rand(20, 70), acts: [watch("movie"), watch("football"), snack, consoleGame, doze] });
}

/* ---------- Ruang kerja: lembur sprint ---------- */

export function projectsNight() {
  const code: NightAct = async (api, c) => {
    const who = pick(c.present());
    if (!has(api, "chair")) return;
    await api.walk(who, api.spot("chair", 0.5));
    api.face(who, 1);
    api.pose(who, { sit: true, lift: CHAIR_SEAT });
    api.prop("laptop", "open");
    api.sfx("type", 3500);
    await api.wait(2000);
    await api.say(who, c.line("code"));
    await api.wait(1500);
    c.tick(who);
  };

  const coffee: NightAct = async (api, c) => {
    const who = pick(c.present());
    if (!has(api, "coffee")) return;
    await api.walk(who, api.spot("coffee"));
    await api.wait(1200);
    api.pose(who, { acc: "mug" });
    await api.say(who, c.line("coffee"));
    c.tick(who);
  };

  const deploy: NightAct = async (api, c) => {
    const pair = two(c);
    if (!pair || !has(api, "chair")) return;
    const [dev, other] = pair;
    await api.walk(dev, api.spot("chair", 0.5));
    api.face(dev, 1);
    api.pose(dev, { sit: true, lift: CHAIR_SEAT });
    await api.walk(other, api.spot("chair", 0.5) + 8);
    api.faceTo(other, dev);
    api.sfx("type", 2500);
    await api.wait(2600);
    await api.emote(dev, "♥");
    await api.say(dev, c.line("deploy"));
    await api.emote(other, "!");
    c.tick(dev);
    c.tick(other);
  };

  const doze: NightAct = async (api, c) => {
    const who = pick(c.present());
    if (!has(api, "chair")) return;
    await api.walk(who, api.spot("chair", 0.5));
    api.face(who, 1);
    api.pose(who, { sit: true, sleep: true, lift: CHAIR_SEAT });
    await api.wait(2500);
    await api.say(who, c.line("doze"));
    await api.wait(2500);
    api.pose(who, { sit: true, lift: CHAIR_SEAT });
    await api.emote(who, "!");
    c.tick(who);
  };

  return makeNightScript({ room: NIGHT.projects, spot: () => rand(30, 75), acts: [code, code, coffee, deploy, doze] });
}

/* ---------- Galeri: foto-foto dan curhat ---------- */

export function skillsNight() {
  const talks = bag(NIGHT.skills.pairs);

  const photo: NightAct = async (api, c) => {
    const pair = two(c);
    if (!pair) return;
    const [model, shooter] = pair;
    const x = rand(25, 65);
    await Promise.all([api.walk(model, x), api.walk(shooter, x + 12)]);
    api.faceTo(shooter, model);
    api.pose(shooter, { acc: "phone" });
    await api.say(shooter, c.line("photo"));
    api.sfx("camera");
    await api.emote(model, "♥");
    c.tick(model);
    c.tick(shooter);
  };

  const trophy: NightAct = async (api, c) => {
    const who = pick(c.present());
    if (!has(api, "pedestal")) return;
    await api.walk(who, api.spot("pedestal"));
    await api.emote(who, "!");
    await api.say(who, c.line("trophy"));
    api.sfx("camera");
    c.tick(who);
  };

  // Duduk berdua di bangku sambil curhat.
  const bench: NightAct = async (api, c) => {
    const pair = two(c);
    if (!pair || !has(api, "bench")) return;
    const [a, b] = pair;
    await Promise.all([api.walk(a, api.spot("bench", 0.3)), api.walk(b, api.spot("bench", 0.7))]);
    api.pose(a, { sit: true, lift: BENCH_SEAT });
    api.pose(b, { sit: true, lift: BENCH_SEAT });
    await playTalk(api, talks(), { a, b });
    c.tick(a);
    c.tick(b);
  };

  return makeNightScript({ room: NIGHT.skills, acts: [photo, photo, trophy, bench] });
}

/* ---------- Ruang sertifikat: klub baca ---------- */

export function certsNight() {
  const read: NightAct = async (api, c) => {
    const who = pick(c.present());
    if (!has(api, "armchair")) return;
    await api.walk(who, api.spot("armchair"));
    api.face(who, 1);
    api.pose(who, { sit: true, acc: "book", lift: ARMCHAIR_SEAT });
    for (let i = 0; i < 2; i++) {
      await api.wait(rand(1500, 2500));
      api.sfx("page");
    }
    await api.say(who, c.line("read"));
    c.tick(who);
  };

  const browse: NightAct = async (api, c) => {
    const who = pick(c.present());
    const shelf = api.spot("bookshelf");
    await api.walk(who, Number.isFinite(shelf) ? shelf : rand(20, 40));
    await api.wait(900);
    api.pose(who, { acc: "book" });
    api.sfx("page");
    await api.say(who, pick(NIGHT.certs.solo));
    c.tick(who);
  };

  const tea: NightAct = async (api, c) => {
    const who = pick(c.present());
    const table = api.spot("sidetable");
    await api.walk(who, Number.isFinite(table) ? table : rand(30, 50));
    api.pose(who, { acc: "mug" });
    await api.say(who, c.line("tea"));
    c.tick(who);
  };

  const doze: NightAct = async (api, c) => {
    const who = pick(c.present());
    if (!has(api, "armchair")) return;
    await api.walk(who, api.spot("armchair"));
    api.pose(who, { sit: true, sleep: true, acc: "book", lift: ARMCHAIR_SEAT });
    await api.wait(2500);
    await api.say(who, c.line("doze"));
    await api.wait(2500);
    api.pose(who, { sit: true, acc: "book", lift: ARMCHAIR_SEAT });
    await api.emote(who, "!");
    c.tick(who);
  };

  return makeNightScript({ room: NIGHT.certs, acts: [read, read, browse, tea, doze] });
}

/* ---------- Teras: ronda, ngopi, martabak ---------- */

export function contactNight() {
  const ronda: NightAct = async (api, c) => {
    const who = pick(c.present());
    await api.walk(who, rand(70, 80));
    api.sfx("kentongan");
    await api.say(who, c.line("ronda"));
    await api.walk(who, rand(25, 40));
    api.sfx("kentongan");
    c.tick(who);
  };

  const coffee: NightAct = async (api, c) => {
    const who = pick(c.present());
    if (!has(api, "bench")) return;
    await api.walk(who, api.spot("bench", rand(0.3, 0.7)));
    api.pose(who, { sit: true, acc: "mug", lift: BENCH_SEAT });
    await api.wait(rand(1500, 2500));
    await api.say(who, c.line("coffee"));
    c.tick(who);
  };

  // Pesanan martabak datang lewat pintu depan.
  const delivery: NightAct = async (api, c) => {
    const pair = two(c);
    if (!pair) return;
    const [courier, buyer] = pair;
    await api.walk(courier, api.spot("door-l", 0.8));
    await api.wait(800);
    api.pose(courier, { acc: "food" });
    await api.say(courier, c.line("delivery"));
    await api.walk(buyer, api.x(courier) + 8);
    api.faceTo(buyer, courier);
    await api.emote(buyer, "♥");
    api.pose(courier, {});
    api.pose(buyer, { acc: "food" });
    c.tick(courier);
    c.tick(buyer);
  };

  const mosquito: NightAct = async (api, c) => {
    const who = pick(c.present());
    await api.emote(who, "!");
    api.sfx("slap");
    await api.say(who, { id: "Plak! Nyamuknya gede banget.", en: "Slap! Huge mosquito." });
    c.tick(who);
  };

  return makeNightScript({ room: NIGHT.contact, acts: [ronda, coffee, coffee, delivery, mosquito] });
}
