"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Elephant } from "../art";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

type Phase = "setup" | "punch" | "laughed" | "booed";

export function Comedy({ next }: { next: () => void }) {
  const { name, jokes, boos } = config.elephant;
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [laughs, setLaughs] = useState(0);
  const [boosGiven, setBoosGiven] = useState(0);
  const [flyers, setFlyers] = useState<{ id: number; glyph: string; x: number }[]>([]);
  const flyerId = useRef(0);
  const done = i >= jokes.length;
  const joke = jokes[Math.min(i, jokes.length - 1)];

  // After she reacts, Peanut moves on to the next joke by himself.
  useEffect(() => {
    if (phase !== "laughed" && phase !== "booed") return;
    const t = setTimeout(() => {
      setI((n) => n + 1);
      setPhase("setup");
    }, 2600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (done) {
      sfx.trumpet();
      setTimeout(() => sfx.tada(), 500);
    }
  }, [done]);

  const throwThings = (glyph: string, count: number) => {
    const batch = Array.from({ length: count }, () => ({ id: ++flyerId.current, glyph, x: 10 + Math.random() * 80 }));
    setFlyers((f) => [...f, ...batch]);
    setTimeout(() => setFlyers((f) => f.filter((x) => !batch.includes(x))), 1600);
  };

  const punchline = () => {
    setPhase("punch");
    sfx.rimshot();
  };
  const laugh = () => {
    setLaughs((n) => n + 1);
    setPhase("laughed");
    sfx.trumpet();
    throwThings("😂", 6);
  };
  const boo = () => {
    setBoosGiven((n) => n + 1);
    setPhase("booed");
    sfx.boing();
    throwThings("🍅", 3);
  };

  const bubble = done
    ? "Thank you, thank you! I'll be here all week. (I can't fit through the door.)"
    : phase === "setup"
      ? joke.q
      : phase === "booed"
        ? boos[(boosGiven - 1) % boos.length]
        : phase === "laughed"
          ? "SHE LAUGHED! Mom, I made it! 🎉"
          : joke.a;

  return (
    <div className="center-col">
      <Kicker>Chapter three · The comedy club</Kicker>
      <Title>
        Live tonight: <em>{name}</em> the elephant
      </Title>
      <Sub>
        A stand-up special, performed for an audience of exactly one. Rumor says you&apos;re the funniest person in the
        room, so… no pressure, {name}.
      </Sub>

      <div className="laughmeter" aria-label={`Laugh meter: ${laughs} of ${jokes.length}`}>
        <span>Laugh-o-meter</span>
        <div className="laughmeter-bar">
          <motion.i animate={{ width: `${(laughs / jokes.length) * 100}%` }} transition={{ type: "spring", stiffness: 120 }} />
        </div>
        <b>
          {laughs}/{jokes.length}
        </b>
      </div>

      <div className="club">
        <div className="curtain left" />
        <div className="curtain right" />
        <div className="spotlight" />
        <div className="club-stage" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${i}-${phase}`}
            className="club-bubble"
            initial={{ scale: 0.6, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            aria-live="polite"
          >
            {!done && phase === "setup" && <small>Joke {i + 1} of {jokes.length}</small>}
            {bubble}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="club-elephant"
          animate={
            done
              ? { rotate: [0, 18, 0], y: [0, 12, 0] }
              : phase === "laughed"
                ? { y: [0, -24, 0, -14, 0] }
                : phase === "booed"
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : { y: [0, -4, 0] }
          }
          transition={
            phase === "setup" && !done ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: done ? 1.2 : 0.7 }
          }
          onClick={() => sfx.trumpet()}
        >
          <Elephant size={190} mic={!done} bowtie hat={done} sweat={phase === "booed"} />
        </motion.div>

        {flyers.map((f) => (
          <motion.span
            key={f.id}
            className="flyer"
            style={{ left: `${f.x}%` }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: -260, opacity: 0, rotate: 360 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {f.glyph}
          </motion.span>
        ))}
      </div>

      <div className="club-controls">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="end" className="center-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="joke big">
                🐘 {name} is officially retiring from comedy.
                <br />
                Reason: the funniest person in the room was in the audience. (Hi {config.name} 👋)
                <br />
                <small>
                  {laughs === jokes.length
                    ? `${laughs}/${jokes.length} laughs. A perfect show. Elephants never forget, so he'll remember this forever.`
                    : laughs === 0
                      ? `0 laughs. ${name} is fine. ${name} is totally fine. (He's eating peanuts and crying.)`
                      : `${laughs} laughs, ${boosGiven} boos. Elephants never forget — he'll remember every single one.`}
                </small>
              </p>
              <Btn onClick={next}>Walk down memory lane →</Btn>
            </motion.div>
          ) : phase === "setup" ? (
            <motion.div key="why" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Btn onClick={punchline}>I don&apos;t know… why? 🤔</Btn>
            </motion.div>
          ) : phase === "punch" ? (
            <motion.div
              key="react"
              className="flex flex-wrap items-center justify-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Btn onClick={laugh}>😂 HAHAHA</Btn>
              <Btn variant="ghost" onClick={boo}>
                🍅 Boo
              </Btn>
            </motion.div>
          ) : (
            <motion.p key="wait" className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {name} is drinking some water with his trunk…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
