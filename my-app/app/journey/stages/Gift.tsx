"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Duck, seeded } from "../art";
import { config } from "../config";
import { sfx } from "../sound";
import { BounceText, Btn, Kicker, Portal, Sub, Title } from "../ui";

const AGE = new Date(`${config.celebrationDate}T00:00:00`).getFullYear() - new Date(`${config.birthDate}T00:00:00`).getFullYear();
const TEASES = ["Hmm… it's heavy 🤔", "Something is moving inside 👀", "Did it just… quack?", "Okay okay, one more tap!"];
const COLORS = ["#FFD43B", "#FF8FAB", "#B892FF", "#7FD1F7", "#9BE59B", "#FF5C8A"];

export function Gift({ next }: { next: () => void }) {
  const [taps, setTaps] = useState(0);
  const open = taps > TEASES.length;

  const tap = () => {
    if (open) return;
    if (taps === TEASES.length) {
      sfx.whoosh();
      setTimeout(() => sfx.tada(), 250);
    } else sfx.shake();
    setTaps((t) => t + 1);
  };

  return (
    <div className="center-col">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div key="closed" className="center-col" exit={{ opacity: 0, scale: 1.3 }}>
            <Kicker>Chapter five · The gift</Kicker>
            <Title>A present, just for you</Title>
            <Sub>Tap the box to open it. (It might take a few tries. It&apos;s shy.)</Sub>
            <motion.button
              key={taps}
              className="gift"
              onClick={tap}
              aria-label="Open the present"
              animate={taps ? { rotate: [0, -12, 10, -8, 6, 0], scale: [1, 1.08, 0.96, 1.04, 1] } : { y: [0, -10, 0] }}
              transition={taps ? { duration: 0.6 } : { duration: 2, repeat: Infinity }}
            >
              <span className="gift-lid">
                <span className="gift-bow" />
              </span>
              <span className="gift-box" />
            </motion.button>
            <div className="h-8">
              <AnimatePresence mode="wait">
                {taps > 0 && (
                  <motion.p key={taps} className="joke" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {TEASES[taps - 1]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <Party key="party" next={next} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Party({ next }: { next: () => void }) {
  const [showNext, setShowNext] = useState(false);
  const [popped, setPopped] = useState<number[]>([]);

  const balloons = useMemo(() => {
    const rnd = seeded(7);
    return Array.from({ length: 14 }, (_, i) => ({
      left: 3 + rnd() * 90,
      dur: 9 + rnd() * 8,
      delay: rnd() * 6,
      color: COLORS[i % COLORS.length],
      size: 46 + rnd() * 30,
      sway: 10 + rnd() * 25,
    }));
  }, []);

  useEffect(() => {
    const duck = confetti.shapeFromText({ text: "🦆", scalar: 2 });
    const flower = confetti.shapeFromText({ text: "🌸", scalar: 2 });
    confetti({ particleCount: 180, spread: 120, startVelocity: 55, origin: { y: 0.65 }, colors: COLORS });
    confetti({ particleCount: 40, spread: 100, origin: { y: 0.6 }, shapes: [duck, flower], scalar: 2 });

    let n = 0;
    const id = setInterval(() => {
      n++;
      sfx.firework();
      const x = 0.15 + Math.random() * 0.7;
      confetti({
        particleCount: 90,
        startVelocity: 32,
        spread: 360,
        ticks: 80,
        gravity: 0.8,
        origin: { x, y: 0.15 + Math.random() * 0.3 },
        colors: [COLORS[n % COLORS.length], "#ffffff", COLORS[(n + 2) % COLORS.length]],
      });
      if (n % 3 === 0) confetti({ particleCount: 12, spread: 80, origin: { x, y: 0.3 }, shapes: [duck], scalar: 2.2 });
      if (n >= 10) clearInterval(id);
    }, 900);
    const t = setTimeout(() => setShowNext(true), 4500);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

  const pop = (i: number, e: React.MouseEvent) => {
    sfx.pop();
    setPopped((p) => [...p, i]);
    confetti({
      particleCount: 30,
      spread: 70,
      startVelocity: 20,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: [balloons[i].color, "#fff"],
    });
  };

  return (
    <motion.div className="center-col party" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Portal>
      <div className="balloons" aria-hidden>
        {balloons.map((b, i) =>
          popped.includes(i) ? null : (
            <motion.button
              key={i}
              tabIndex={-1}
              className="balloon"
              style={{ left: `${b.left}%`, width: b.size, height: b.size * 1.2, "--b": b.color } as React.CSSProperties}
              initial={{ y: "110vh" }}
              animate={{ y: "-130vh", x: [0, b.sway, -b.sway, 0] }}
              transition={{
                y: { duration: b.dur, delay: b.delay, repeat: Infinity, ease: "linear" },
                x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              onClick={(e) => pop(i, e)}
            />
          ),
        )}
      </div>
      </Portal>

      <motion.div
        initial={{ y: 120, scale: 0, rotate: -30 }}
        animate={{ y: 0, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 10 }}
        onClick={() => sfx.quack()}
        className="cursor-pointer"
      >
        <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 1 }}>
          <Duck size={150} hat />
        </motion.div>
      </motion.div>

      <h1 className="title mega">
        <BounceText text="Happy Birthday," delay={0.3} />
        <br />
        <BounceText text={`${config.name}!`} className="name-glow" delay={1.1} />
      </h1>
      <Sub delay={1.8}>{AGE} looks absolutely beautiful on you. 💛</Sub>
      <p className="hint">psst… the balloons pop 🎈</p>

      <div className="h-16 mt-2">
        <AnimatePresence>
          {showNext && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Btn onClick={next}>One more thing… 💌</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Portal>
      <div className="parade" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="parade-duck"
            initial={{ x: "-20vw" }}
            animate={{ x: "120vw" }}
            transition={{ duration: 14, delay: i * 0.9, repeat: Infinity, ease: "linear" }}
          >
            <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 0.5, repeat: Infinity }}>
              <Duck size={i === 0 ? 70 : 46} hat={i === 0} bow={i % 2 === 1} blink={false} />
            </motion.div>
          </motion.div>
        ))}
      </div>
      </Portal>
    </motion.div>
  );
}
