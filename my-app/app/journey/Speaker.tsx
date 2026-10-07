"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { config } from "./config";
import { sfx } from "./sound";

const FIRST_DELAY = 2600;
const GAP = 6500;
const TYPING = 1300;

let bonusIndex = 0;
const NO_LINES: readonly string[] = [];

/** Hisham's chat bubble. Remount (key by chapter) to play a chapter's lines. */
export function Speaker({ step }: { step: number }) {
  const lines: readonly string[] = config.hisham.lines[step] ?? NO_LINES;
  const [idx, setIdx] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [dismissed, setDismissed] = useState(-1);
  const [bonus, setBonus] = useState<string | null>(null);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      const at = FIRST_DELAY + i * GAP;
      timers.push(setTimeout(() => setTyping(true), at));
      timers.push(
        setTimeout(() => {
          setTyping(false);
          setIdx(i);
          sfx.message();
        }, at + TYPING),
      );
    });
    // Collapse to just the avatar after the last line has been read.
    timers.push(setTimeout(() => setIdx(lines.length), FIRST_DELAY + lines.length * GAP + 2500));
    return () => timers.forEach(clearTimeout);
  }, [lines]);

  useEffect(() => {
    if (!bonus) return;
    const t = setTimeout(() => setBonus(null), 6000);
    return () => clearTimeout(t);
  }, [bonus]);

  const tapAvatar = () => {
    const pool = config.hisham.bonus;
    setBonus(pool[bonusIndex++ % pool.length]);
    sfx.message();
  };

  const current = idx >= 0 && idx < lines.length && dismissed !== idx ? lines[idx] : null;
  const text = bonus ?? current;

  return (
    <motion.aside
      className="speaker"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, type: "spring" }}
      aria-live="polite"
    >
      <motion.button
        className="avatar"
        onClick={tapAvatar}
        aria-label={`Tap ${config.from}`}
        whileHover={{ scale: 1.08, rotate: -4 }}
        whileTap={{ scale: 0.9 }}
        animate={text || typing ? { y: [0, -4, 0] } : { y: 0 }}
        transition={{ duration: 0.6, repeat: text || typing ? Infinity : 0 }}
      >
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.hisham.photo} alt={config.from} onError={() => setImgOk(false)} />
        ) : (
          <span>{config.from[0]}</span>
        )}
        <i className="avatar-badge">💛</i>
      </motion.button>

      <AnimatePresence mode="wait">
        {typing && !bonus ? (
          <motion.div
            key="typing"
            className="speaker-bubble typing"
            initial={{ opacity: 0, scale: 0.6, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <span />
            <span />
            <span />
          </motion.div>
        ) : text ? (
          <motion.div
            key={text}
            className="speaker-bubble"
            initial={{ opacity: 0, scale: 0.6, x: -10, originX: 0, originY: 1 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            <b className="speaker-name">{config.from}</b>
            {text}
            <button
              className="speaker-close"
              aria-label="Close message"
              onClick={() => (bonus ? setBonus(null) : setDismissed(idx))}
            >
              ×
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.aside>
  );
}
