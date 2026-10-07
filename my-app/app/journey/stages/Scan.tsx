"use client";

import { animate, AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Duck } from "../art";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

const birth = new Date(`${config.birthDate}T00:00:00`);
const celebration = new Date(`${config.celebrationDate}T00:00:00`);
const AGE = celebration.getFullYear() - birth.getFullYear();

export function Scan({ next }: { next: () => void }) {
  const steps = config.scanSteps;
  const [done, setDone] = useState(0);
  const finished = done >= steps.length;

  useEffect(() => {
    if (finished) {
      sfx.sparkle();
      return;
    }
    const t = setTimeout(() => {
      sfx.click();
      setDone((d) => d + 1);
    }, done === 0 ? 900 : 1100);
    return () => clearTimeout(t);
  }, [done, finished]);

  return (
    <div className="center-col">
      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div key="scan" exit={{ opacity: 0, scale: 0.95 }} className="center-col w-full">
            <Kicker>Security check · Duck HQ</Kicker>
            <Title>Verifying the birthday girl…</Title>
            <div className="scanner">
              <motion.div
                className="scanner-duck"
                animate={{ x: ["-10%", "80%", "-10%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Duck size={56} />
              </motion.div>
              <div className="bar">
                <motion.div className="bar-fill" animate={{ width: `${(done / steps.length) * 100}%` }} />
              </div>
              <ul className="scan-list">
                {steps.map((s, i) => (
                  <li key={s.label} className={i < done ? "ok" : i === done ? "busy" : ""}>
                    <span className="dot">{i < done ? "✓" : i === done ? "◌" : "·"}</span>
                    <span>{s.label}…</span>
                    {i < done && (
                      <motion.b initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                        {s.result}
                      </motion.b>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <Reveal key="reveal" next={next} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Reveal({ next }: { next: () => void }) {
  // Only rendered after user interaction, so reading the clock here is safe.
  const [now, setNow] = useState(() => new Date());
  const [age, setAge] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    let last = 0;
    const ctrl = animate(0, AGE, {
      duration: 2.2,
      delay: 1.4,
      ease: "easeOut",
      onUpdate: (v) => {
        const r = Math.round(v);
        if (r === last) return;
        last = r;
        sfx.click();
        setAge(r);
      },
      onComplete: () => sfx.tada(),
    });
    return () => {
      clearInterval(id);
      ctrl.stop();
    };
  }, []);

  const diff = Math.max(0, now.getTime() - birth.getTime());
  const units = [
    { v: Math.floor(diff / 86_400_000), l: "days" },
    { v: Math.floor(diff / 3_600_000) % 24, l: "hours" },
    { v: Math.floor(diff / 60_000) % 60, l: "minutes" },
    { v: Math.floor(diff / 1000) % 60, l: "seconds" },
  ];

  return (
    <motion.div className="center-col" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <Kicker>✓ Identity confirmed</Kicker>
      <Title>
        It&apos;s really you, <em>{config.name}</em>.
      </Title>
      <Sub>You&apos;ve been making this world prettier for</Sub>
      <div className="counter">
        {units.map((u) => (
          <div key={u.l}>
            <motion.b key={u.v} initial={{ y: -6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}>
              {u.v.toLocaleString("en-US")}
            </motion.b>
            <span>{u.l}</span>
          </div>
        ))}
      </div>
      <motion.div
        className="age"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
      >
        <span>and today you turn</span>
        <strong>{age}</strong>
        <small>(don&apos;t worry, you don&apos;t look a day over 18 😉)</small>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }}>
        <Btn onClick={next}>Start the journey →</Btn>
      </motion.div>
    </motion.div>
  );
}
