"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Duck, Heart } from "../art";
import { config } from "../config";
import { duckMusic, sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

const FULL = config.letter.join("\n\n");

export function Letter({ next }: { next: () => void }) {
  const [opened, setOpened] = useState(false);
  const [typed, setTyped] = useState(0);
  const finished = typed >= FULL.length;

  useEffect(() => {
    if (!opened) return;
    duckMusic(0.45);
    return () => duckMusic(1);
  }, [opened]);

  useEffect(() => {
    if (!opened || finished) return;
    const ch = FULL[typed];
    const delay = ch === "\n" ? 350 : /[.,!?—]/.test(ch) ? 180 : 32;
    const t = setTimeout(() => {
      if (typed % 3 === 0 && ch !== " ") sfx.type();
      setTyped((n) => n + 1);
    }, typed === 0 ? 1400 : delay);
    return () => clearTimeout(t);
  }, [opened, typed, finished]);

  useEffect(() => {
    if (finished && opened) sfx.sparkle();
  }, [finished, opened]);

  const open = () => {
    sfx.heart();
    setTimeout(() => sfx.whoosh(), 300);
    setOpened(true);
  };

  const sendLove = () => {
    sfx.quack();
    const heart = confetti.shapeFromText({ text: "💛", scalar: 2 });
    const duck = confetti.shapeFromText({ text: "🦆", scalar: 2 });
    confetti({ particleCount: 60, spread: 100, origin: { y: 0.8 }, shapes: [heart, duck], scalar: 2 });
  };

  return (
    <div className="center-col">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="env" className="center-col" exit={{ opacity: 0, y: -40 }}>
            <Kicker>Final chapter · The letter</Kicker>
            <Title>The duck finally delivers it</Title>
            <Sub>The letter it was carrying since the very beginning. Tap the seal to open.</Sub>
            <div className="env-scene">
              <motion.div className="env-duck" initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 1.2 }}>
                <Duck size={90} bow />
              </motion.div>
              <motion.button
                className="envelope"
                onClick={open}
                aria-label="Open the letter"
                animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 3, repeat: Infinity }}
                whileHover={{ scale: 1.04 }}
              >
                <span className="env-back" />
                <span className="env-flap" />
                <span className="env-front" />
                <motion.span className="seal" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Heart size={28} color="#fff" />
                </motion.span>
                <span className="env-from">From {config.from}</span>
                <span className="env-to">For {config.name}</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="paper"
            className="paper"
            initial={{ y: 200, scaleY: 0.2, opacity: 0, rotateX: 50 }}
            animate={{ y: 0, scaleY: 1, opacity: 1, rotateX: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => !finished && setTyped(FULL.length)}
          >
            <div className="paper-text">
              {FULL.slice(0, typed)}
              {!finished && <span className="caret" />}
            </div>
            <AnimatePresence>
              {finished && (
                <motion.div className="signature" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <span>Forever yours,</span>
                  <b>{config.from}</b>
                  <Heart size={22} />
                </motion.div>
              )}
            </AnimatePresence>
            {!finished && <p className="skip">tap to skip ✨</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && opened && (
          <motion.div
            className="flex flex-wrap gap-3 justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Btn variant="ghost" onClick={sendLove}>Send a quack back 🦆💛</Btn>
            <Btn onClick={next}>
              Now it&apos;s your turn 🤳
            </Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
