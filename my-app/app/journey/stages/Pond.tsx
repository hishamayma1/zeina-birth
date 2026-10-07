"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Duck, seeded } from "../art";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Portal, Sub, Title } from "../ui";

const DUCK_STYLES = [
  { body: "#FFD43B", hat: true },
  { body: "#FFE066", bow: true },
  { body: "#FFC9DE" },
  { body: "#FFD43B", bow: true },
  { body: "#C7F0FF", hat: true },
];

export function Pond({ next }: { next: () => void }) {
  const msgs = config.duckMessages;
  const [caught, setCaught] = useState<number[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const allCaught = caught.length === msgs.length;
  const rippleId = useRef(0);

  const ducks = useMemo(() => {
    const rnd = seeded(42);
    return msgs.map((_, i) => ({
      left: 3 + ((i * 17 + rnd() * 6) % 64),
      top: 10 + rnd() * 55,
      drift: 15 + rnd() * 25,
      dur: 5 + rnd() * 4,
      flip: rnd() > 0.5,
      ...DUCK_STYLES[i % DUCK_STYLES.length],
    }));
  }, [msgs]);

  const catchDuck = (i: number, e: React.MouseEvent) => {
    if (caught.includes(i)) return;
    sfx.quack();
    const rect = (e.currentTarget.closest(".pond") as HTMLElement).getBoundingClientRect();
    const id = ++rippleId.current;
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 1200);
    setCaught((c) => [...c, i]);
    setTimeout(() => setOpen(i), 450);
  };

  return (
    <div className="center-col">
      <Kicker>Chapter one · The pond</Kicker>
      <Title>The ducks heard it&apos;s your birthday</Title>
      <Sub>Each one swam here with a message for you. Tap them all to collect them!</Sub>

      <div className="tally">
        {msgs.map((_, i) => (
          <motion.span key={i} animate={{ scale: caught.includes(i) ? [1, 1.5, 1] : 1, opacity: caught.includes(i) ? 1 : 0.3 }}>
            🦆
          </motion.span>
        ))}
      </div>

      <div className="pond">
        <div className="pond-shine" />
        {[0, 1, 2].map((w) => (
          <div key={w} className="wave" style={{ top: `${25 + w * 25}%`, animationDuration: `${7 + w * 3}s` }} />
        ))}
        <span className="lily" style={{ left: "8%", top: "70%" }}>🪷</span>
        <span className="lily" style={{ left: "84%", top: "22%" }}>🪷</span>
        <span className="lily pad" style={{ left: "70%", top: "78%" }} />
        <span className="lily pad" style={{ left: "22%", top: "12%" }} />

        {ducks.map((d, i) => {
          const got = caught.includes(i);
          return (
            <motion.button
              key={i}
              aria-label={`Duck ${i + 1}`}
              className="pond-duck"
              style={{ left: `${d.left}%`, top: `${d.top}%` }}
              animate={
                got
                  ? { y: [-0, -80, -40], scale: [1, 1.2, 0], rotate: [0, 20, 360], opacity: [1, 1, 0] }
                  : { x: [0, d.drift, 0], y: [0, -6, 0, -4, 0] }
              }
              transition={
                got
                  ? { duration: 0.8 }
                  : { duration: d.dur, repeat: Infinity, ease: "easeInOut" }
              }
              onClick={(e) => catchDuck(i, e)}
              disabled={got}
            >
              <Duck size={86} flip={d.flip} body={d.body} hat={d.hat} bow={d.bow} />
            </motion.button>
          );
        })}

        {ripples.map((r) => (
          <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
        ))}
      </div>

      <Portal>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="modal-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="card note"
              initial={{ scale: 0.5, rotate: -8, y: 40 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="note-duck">
                <Duck size={80} {...DUCK_STYLES[open % DUCK_STYLES.length]} />
              </div>
              <p className="note-from">Duck #{open + 1} says:</p>
              <p className="note-text">{msgs[open]}</p>
              <Btn onClick={() => setOpen(null)}>{allCaught ? "Aww 🥹" : "Aww, next duck →"}</Btn>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      <AnimatePresence>
        {allCaught && open === null && (
          <motion.div className="center-col mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="joke big">🏆 The Duck Council has voted unanimously: you are the best human.</p>
            <Btn onClick={next}>Follow the ducks to the garden →</Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
