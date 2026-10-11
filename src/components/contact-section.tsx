"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGame } from "@/components/game/game-provider";
import { Scene, rand, type SceneApi } from "@/components/game/scene";
import { Sprite } from "@/components/game/sprite";
import { PLANT, PLANT_PALETTE } from "@/components/game/sprites";
import { BENCH, BENCH_PALETTE, BENCH_SEAT, MAILBOX, MAILBOX_PALETTE, MAT, MAT_PALETTE } from "@/components/game/props";
import { LANTERN, LANTERN_OFF, LANTERN_ON } from "@/components/game/furniture";
import { Txt } from "@/components/game/scramble";
import { SectionTitle, steps } from "@/components/game/section-title";
import { Door, PX, RoomShell } from "@/components/rooms/shared";
import { roomContent } from "@/content/visitors";
import { makeVisitorScript, type VisitorCtx } from "@/components/rooms/visitors";
import { contactNight } from "@/components/rooms/night-acts";

const GUESTS = ["joko", "tari", "budi", "dina", "bayu"] as const;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
import { site } from "@/content/site";
import { WORKFLOW } from "@/content/collab";
import type { TestimonialItem } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full border-4 border-line bg-panel-2 px-4 py-3 text-lg text-ink placeholder:text-ink-soft/60 focus:bg-panel focus:outline-none focus:ring-4 focus:ring-coin";

export function ContactSection({ index, testimonials }: { index: number; testimonials: TestimonialItem[] }) {
  const { t, locale } = useLanguage();
  const { play } = useGame();
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("submitting");
    play("select");

    const data = Object.fromEntries(new FormData(form));
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "6e025e64-3551-48da-8bfe-90f88860d2ff";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          name: data.name,
          email: data.email,
          message: data.message,
          subject: `Pesan portofolio dari ${data.name}`,
          from_name: "Portofolio",
        }),
      });
      const result = await response.json();
      if (result.success) {
        form.reset();
        play("powerup");
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // Kurir dan calon klien datang dari jalan (pintu kiri); pemilik rumah keluar dari pintu rumah (kanan).
  const [run] = useState(() => {
    const knock = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      await api.walk(who, api.spot("door-r", 0.2));
      api.face(who, 1);
      await api.say(who, { id: "Tok tok! Ada orang?", en: "Knock knock! Anyone home?" });
      c.tick(who);
    };

    const mail = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      const box = api.spot("mailbox");
      if (!Number.isFinite(box)) return;
      await api.walk(who, box);
      await api.emote(who, "?");
      await api.say(who, { id: "Kotak suratnya kosong. Kirim pesan aja deh.", en: "The mailbox is empty. I'll just send a message." });
      c.tick(who);
    };

    const sitDown = async (api: SceneApi, c: VisitorCtx) => {
      const who = pick(c.present());
      await api.walk(who, api.spot("bench", rand(0.3, 0.7)));
      api.pose(who, { sit: true, acc: "phone", lift: BENCH_SEAT });
      await api.wait(rand(2500, 4000));
      c.tick(who);
    };

    return makeVisitorScript({
      content: roomContent("contact", { projects: [], skills: [], certs: [] }),
      door: "door-l",
      extras: [knock, mail, sitDown],
    });
  });

  // Malam: ronda, ngopi, dan pesanan martabak di teras.
  const [night] = useState(contactNight);

  return (
    <RoomShell
      id="contact"
      className="pb-0"
      wall={
        <>
          <SectionTitle index={index} titleKey="contact.title" />

          {/* Cara kerja sama: langkah dari konsultasi sampai serah terima, seperti papan petunjuk di teras */}
          <div className="mb-14">
            <h3 className="mb-6 font-pixel text-2xl font-bold text-on-sky text-pixel-shadow">
              <Txt k="contact.flow" />
            </h3>
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WORKFLOW.map((step, i) => (
                <motion.li
                  key={step.title.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.35, delay: i * 0.06, ease: steps(4) }}
                  className="pixel-box flex gap-4 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-coin font-pixel text-lg font-bold text-[#2B1E16] shadow-[3px_3px_0_0_var(--g-shadow)]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-pixel text-lg font-bold">{step.title[locale]}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.desc[locale]}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Testimoni asli (tersembunyi selama belum ada) */}
          {testimonials.length > 0 && (
            <div className="mb-14">
              <h3 className="mb-6 font-pixel text-2xl font-bold text-on-sky text-pixel-shadow">
                <Txt k="contact.testi" />
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                {testimonials.map((item, i) => (
                  <motion.figure
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.35, delay: i * 0.08, ease: steps(4) }}
                    className="pixel-box flex flex-col gap-4 p-6"
                  >
                    <blockquote className="text-lg leading-relaxed">&ldquo;{(locale === "en" && item.quote_en) || item.quote}&rdquo;</blockquote>
                    <figcaption className="text-sm">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-coin decoration-2 underline-offset-4">
                          {item.name}
                        </a>
                      ) : (
                        <span className="font-bold">{item.name}</span>
                      )}
                      {item.role && <span className="text-ink-soft"> · {(locale === "en" && item.role_en) || item.role}</span>}
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: steps(5) }}
              className="pixel-box flex flex-col gap-6 self-start p-6 md:p-8"
            >
              <p className="font-pixel text-xl text-cherry">
                <Txt k="contact.end" />
              </p>
              <p className="text-lg leading-relaxed text-ink-soft">
                <Txt k="contact.lead" />
              </p>
              <a href={`mailto:${site.email}`} onClick={() => play("select")} className="group flex items-center gap-4 self-start">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-line bg-coin text-[#2B1E16] transition-transform group-hover:-translate-y-1">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="break-all text-xl font-extrabold underline decoration-4 decoration-coin underline-offset-4 md:text-2xl">
                  {site.email}
                </span>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: 0.1, ease: steps(5) }}
              className="pixel-box p-6 md:p-8"
            >
              {status === "success" ? (
                <div className="flex min-h-[22rem] flex-col items-center justify-center gap-5 text-center" role="status">
                  <p className="font-pixel text-2xl text-grass-dark dark:text-grass">
                    <Txt k="contact.sent" />
                  </p>
                  <p className="text-lg text-ink-soft">
                    <Txt k="contact.sentDesc" />
                  </p>
                  <button onClick={() => setStatus("idle")} className="pixel-btn mt-4 bg-panel-2">
                    <Txt k="contact.sendAnother" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <label className="flex flex-col gap-2 text-lg font-bold">
                    <Txt k="contact.name" />
                    <input type="text" name="name" required autoComplete="name" className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-2 text-lg font-bold">
                    <Txt k="contact.email" />
                    <input type="email" name="email" required autoComplete="email" className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-2 text-lg font-bold">
                    <Txt k="contact.message" />
                    <textarea name="message" required rows={5} className={`${inputClass} resize-y`} />
                  </label>

                  {status === "error" && (
                    <p className="border-4 border-cherry bg-cherry/10 px-4 py-3 font-semibold text-cherry" role="alert">
                      {t("contact.error")}
                    </p>
                  )}

                  <button type="submit" disabled={status === "submitting"} className="pixel-btn self-start bg-coin text-[#2B1E16] disabled:opacity-60">
                    {status === "submitting" ? (
                      <span className="animate-blink">
                        <Txt k="contact.sending" />
                      </span>
                    ) : (
                      <>
                        ▶ <Txt k="contact.send" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </>
      }
      stage={
        <Scene
          className="h-[150px] sm:h-[170px] md:h-[190px]"
          actors={[
            { id: "me", cast: "me", x: 90, hidden: true },
            ...GUESTS.map((id) => ({ id, cast: id, x: 5, hidden: true })),
          ]}
          script={run}
          exit="door-l"
          roomId="contact"
          hostDoor="door-r"
          nightScript={night}
        >
          <Door id="door-l" className="left-0" />
          {/* Satu lampu teras di samping pintu depan, menyala saat malam */}
          <div className="absolute right-[8%] top-6 hidden sm:block" aria-hidden>
            <Sprite art={LANTERN} palette={LANTERN_OFF} px={PX} className="dark:hidden" />
            <Sprite art={LANTERN} palette={LANTERN_ON} px={PX} className="hidden dark:block" />
          </div>
          <div className="absolute bottom-0 left-[14%] hidden sm:block" aria-hidden>
            <Sprite art={PLANT} palette={PLANT_PALETTE} px={PX} />
          </div>
          <div data-prop="bench" className="absolute bottom-0 left-[36%]" aria-hidden>
            <Sprite art={BENCH} palette={BENCH_PALETTE} px={PX} />
          </div>

          <div data-prop="mailbox" className="absolute bottom-0 left-[70%]" aria-hidden>
            <Sprite art={MAILBOX} palette={MAILBOX_PALETTE} px={PX} />
          </div>
          <div className="absolute bottom-0 right-[2%] translate-x-[10%]" aria-hidden>
            <Sprite art={MAT} palette={MAT_PALETTE} px={PX} />
          </div>
          <Door id="door-r" to="top" label={t("door.home")} className="right-0" />
        </Scene>
      }
    />
  );
}
