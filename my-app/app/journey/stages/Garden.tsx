"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Flower, type FlowerKind } from "../art";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

const FLOWERS: { petal: string; center: string; kind: FlowerKind; count: number; height: number }[] = [
  { petal: "#FF8FAB", center: "#FFD43B", kind: "round", count: 8, height: 130 },
  { petal: "#B892FF", center: "#FFF1A8", kind: "pointy", count: 10, height: 150 },
  { petal: "#FFB547", center: "#8A4B1F", kind: "round", count: 12, height: 120 },
  { petal: "#FF5C8A", center: "#FFE066", kind: "heart", count: 6, height: 155 },
  { petal: "#7FD1F7", center: "#FFD43B", kind: "pointy", count: 8, height: 135 },
  { petal: "#FFFFFF", center: "#FFC93C", kind: "pointy", count: 14, height: 145 },
];

export function Garden({ next }: { next: () => void }) {
  const reasons = config.reasons;
  const [bloomed, setBloomed] = useState<number[]>([]);
  const last = bloomed[bloomed.length - 1];
  const done = bloomed.length === reasons.length;

  const plant = (i: number) => {
    if (bloomed.includes(i)) return;
    sfx.bloom();
    setBloomed((b) => [...b, i]);
    if (bloomed.length + 1 === reasons.length) setTimeout(() => sfx.sparkle(), 1200);
  };

  return (
    <div className="center-col">
      <Kicker>Chapter two · The garden</Kicker>
      <Title>A garden of reasons</Title>
      <Sub>Every seed here grows into one reason I love you. Tap the soil to plant them 🌱</Sub>

      <div className="reason-banner" aria-live="polite">
        <AnimatePresence mode="wait">
          {last !== undefined ? (
            <motion.p
              key={last}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.6 }}
            >
              <span className="reason-no">Reason #{bloomed.length}</span>
              {reasons[last]}
            </motion.p>
          ) : (
            <motion.p key="empty" className="opacity-60" exit={{ opacity: 0 }}>
              The soil is waiting for you…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="garden">
        {reasons.map((_, i) => {
          const isOn = bloomed.includes(i);
          const f = FLOWERS[i % FLOWERS.length];
          return (
            <button key={i} className={`plot ${isOn ? "on" : ""}`} onClick={() => plant(i)} aria-label={`Plant seed ${i + 1}`}>
              <motion.div
                className="flower-wrap"
                animate={isOn ? { rotate: [0, -3, 3, 0] } : undefined}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                <Flower {...f} bloomed={isOn} />
              </motion.div>
              {!isOn && (
                <motion.span
                  className="seed"
                  animate={{ y: [0, -5, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                >
                  🌱
                </motion.span>
              )}
              <span className="soil" />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            className="center-col mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
          >
            <p className="joke big">
              This whole garden is yours. Just like my heart. 🌷
              <br />
              <small>(Cheesy? Yes. True? Also yes.)</small>
            </p>
            <Btn onClick={next}>Take your seat at the comedy club 🎤 →</Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
