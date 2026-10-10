"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

const AGE = new Date(`${config.celebrationDate}T00:00:00`).getFullYear() - new Date(`${config.birthDate}T00:00:00`).getFullYear();
const DIGITS = String(AGE).split("");
const CANDLES = [
  { kind: "thin", color: "#7FD1F7" },
  { kind: "thin", color: "#FF8FAB" },
  ...DIGITS.map((d) => ({ kind: "digit", digit: d, color: "#FFD43B" })),
  { kind: "thin", color: "#B892FF" },
  { kind: "thin", color: "#9BE59B" },
] as { kind: "thin" | "digit"; digit?: string; color: string }[];

export function Cake({ next }: { next: () => void }) {
  const [lit, setLit] = useState(() => CANDLES.map(() => true));
  const [mic, setMic] = useState<"off" | "on" | "denied">("off");
  const stopMic = useRef<() => void>(() => {});
  const allOut = lit.every((l) => !l);

  const litRef = useRef(lit);

  const blowOut = (i: number) => {
    if (!litRef.current[i]) return;
    sfx.blow();
    const copy = [...litRef.current];
    copy[i] = false;
    litRef.current = copy;
    setLit(copy);
  };

  useEffect(() => {
    if (!allOut) return;
    stopMic.current();
    const t = setTimeout(() => {
      sfx.tada();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ["#FFD43B", "#FF8FAB", "#B892FF", "#7FD1F7"] });
    }, 600);
    return () => clearTimeout(t);
  }, [allOut]);

  useEffect(() => () => stopMic.current(), []);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new AudioContext();
      const src = ac.createMediaStreamSource(stream);
      const an = ac.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      let raf = 0;
      let loud = 0;
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / buf.length);
        loud = rms > 0.18 ? loud + 1 : Math.max(0, loud - 1);
        if (loud > 4) {
          loud = 0;
          const on = litRef.current.map((l, i) => (l ? i : -1)).filter((i) => i >= 0);
          if (on.length) blowOut(on[Math.floor(Math.random() * on.length)]);
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
      setMic("on");
      stopMic.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ac.close();
        setMic("off");
        stopMic.current = () => {};
      };
    } catch {
      setMic("denied");
    }
  };

  return (
    <div className="center-col">
      <Kicker>Chapter five · The wish</Kicker>
      <Title>Close your eyes &amp; make a wish 🌠</Title>
      <Sub>Then blow out the candles — tap each flame, or actually blow into your mic!</Sub>

      <div className={`cake-scene ${allOut ? "dim" : ""}`}>
        <div className="candles">
          {CANDLES.map((c, i) => (
            <button
              key={i}
              className={`candle ${c.kind}`}
              onClick={() => blowOut(i)}
              aria-label={lit[i] ? "Blow out candle" : "Candle out"}
              style={{ "--c": c.color } as React.CSSProperties}
            >
              <AnimatePresence>
                {lit[i] ? (
                  <motion.span key="flame" className="flame" exit={{ scaleY: 0, opacity: 0, transition: { duration: 0.25 } }}>
                    <span className="glow" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="smoke"
                    className="smoke"
                    initial={{ opacity: 0.8, y: 0, scale: 0.5 }}
                    animate={{ opacity: 0, y: -60, scale: 1.8 }}
                    transition={{ duration: 1.8 }}
                  />
                )}
              </AnimatePresence>
              <span className="wick" />
              <span className="wax">{c.digit}</span>
            </button>
          ))}
        </div>
        <div className="cake">
          <div className="tier top">
            <span className="drip" />
          </div>
          <div className="tier mid">
            <span className="drip" />
            <span className="cake-name">{config.name}</span>
          </div>
          <div className="tier bottom">
            <span className="drip" />
          </div>
          <div className="plate" />
        </div>
      </div>

      {!allOut && (
        <>
          <div className="mt-6">
            {mic === "off" && (
              <Btn variant="ghost" onClick={startMic}>
                🎤 Use my microphone
              </Btn>
            )}
            {mic === "on" && <p className="joke">🎤 Listening… blow!! 💨</p>}
            {mic === "denied" && <p className="joke">No mic? No problem — tapping works too 🙂</p>}
          </div>
          <p className="hint">We wanted {AGE} candles, but the fire department said no 🚒</p>
        </>
      )}

      <AnimatePresence>
        {allOut && (
          <motion.div className="center-col mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <p className="joke big">
              Wish received! ✨
              <br />
              It has been forwarded to Duck HQ for processing 🦆📬
              <br />
              <small>Estimated delivery: this year.</small>
            </p>
            <Btn onClick={next}>I think there&apos;s a present… 🎁</Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
