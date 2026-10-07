"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Duck } from "../art";
import { config } from "../config";
import { sfx, startMusic, unlockAudio } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

export function Door({ next }: { next: () => void }) {
  const [noCount, setNoCount] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const replies = config.noButtonReplies;
  const gaveUp = noCount >= replies.length;

  const yes = () => {
    unlockAudio();
    startMusic(config.songUrl);
    sfx.quack();
    setTimeout(next, 350);
  };

  const dodge = () => {
    if (gaveUp) return;
    unlockAudio();
    sfx.boing();
    setNoCount((c) => c + 1);
    const ang = Math.random() * Math.PI * 2;
    setPos({ x: Math.cos(ang) * (90 + Math.random() * 60), y: Math.sin(ang) * (50 + Math.random() * 40) });
  };

  return (
    <div className="center-col">
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: [-6, 6, -6], y: [0, -6, 0] }}
          transition={{ duration: 0.55, repeat: 4, ease: "easeInOut" }}
          onClick={() => sfx.quack()}
          className="cursor-pointer"
        >
          <Duck size={170} letter bow />
        </motion.div>
        <motion.div
          className="bubble"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.3, type: "spring" }}
        >
          Special delivery! 📬
        </motion.div>
      </motion.div>

      <Kicker>A tiny duck sent by {config.from} is knocking</Kicker>
      <Title>
        Psst… is this <em>{config.name}</em>?
      </Title>
      <Sub>The duck was told to only hand this letter to one very specific, very pretty girl.</Sub>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-4 mt-8 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Btn onClick={yes}>Yes, it&apos;s me 💛</Btn>
        <motion.div animate={pos} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
          <Btn
            variant="ghost"
            onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
            onClick={gaveUp ? yes : dodge}
          >
            {gaveUp ? "Okay fine, it's me 🙈" : "No"}
          </Btn>
        </motion.div>
      </motion.div>

      <div className="h-8 mt-4">
        <AnimatePresence mode="wait">
          {noCount > 0 && (
            <motion.p
              key={noCount}
              className="joke"
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {replies[Math.min(noCount, replies.length) - 1]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="hint">🔊 Turn your sound on — this journey quacks.</p>
    </div>
  );
}
