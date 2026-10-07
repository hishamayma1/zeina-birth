"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

const TILTS = [-5, 4, -2, 6, -6, 3, -3, 5];

export function Memories({ next }: { next: () => void }) {
  const items = config.memories;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const done = index >= items.length;

  const advance = (d = 1) => {
    sfx.whoosh();
    setDir(d);
    setIndex((i) => i + 1);
  };

  return (
    <div className="center-col">
      <Kicker>Chapter three · Memory lane</Kicker>
      <Title>Us, in pictures</Title>
      <Sub>⚠️ Warning: extremely cute content ahead. Swipe (or tap) through.</Sub>

      <div className="stack">
        <AnimatePresence custom={dir}>
          {items.map((m, i) => {
            if (i < index || i > index + 2) return null;
            const depth = i - index;
            return (
              <motion.div
                key={m.src + i}
                className="polaroid"
                custom={dir}
                style={{ zIndex: items.length - i }}
                initial={{ scale: 0.85, y: 30, opacity: 0, rotate: TILTS[i % TILTS.length] }}
                animate={{
                  scale: 1 - depth * 0.05,
                  y: depth * 14,
                  opacity: 1,
                  rotate: depth === 0 ? TILTS[i % TILTS.length] / 2 : TILTS[i % TILTS.length],
                }}
                exit={{ x: dir * 500, rotate: dir * 30, opacity: 0, transition: { duration: 0.45 } }}
                drag={depth === 0 ? "x" : false}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 90) advance(Math.sign(info.offset.x));
                }}
                onTap={() => depth === 0 && advance(1)}
                whileDrag={{ scale: 1.04, cursor: "grabbing" }}
              >
                <Photo src={m.src} n={i + 1} />
                <p className="caption">{m.caption}</p>
                <span className="tape" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {done && (
          <motion.div className="center-col stack-done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="text-6xl">📸</span>
            <p className="joke big">
              Gallery complete.
              <br />
              Conclusion: we need <b>way</b> more photos together. That&apos;s an order.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Btn variant="ghost" onClick={() => setIndex(0)}>
                See them again
              </Btn>
              <Btn onClick={next}>Okay, it&apos;s cake time 🎂</Btn>
            </div>
          </motion.div>
        )}
      </div>

      {!done && (
        <p className="hint">
          {index + 1} / {items.length}
        </p>
      )}
    </div>
  );
}

function Photo({ src, n }: { src: string; n: number }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div className="photo placeholder">
        <span>🖼️</span>
        <b>Photo {n}</b>
        <small>
          Put your picture at
          <br />
          <code>public{src}</code>
        </small>
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="photo" src={src} alt={`Memory ${n}`} draggable={false} onError={() => setFailed(true)} />
  );
}
