"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { seeded } from "./art";
import { isMuted, setMuted, sfx } from "./sound";
import { Door } from "./stages/Door";
import { Scan } from "./stages/Scan";
import { Pond } from "./stages/Pond";
import { Garden } from "./stages/Garden";
import { Comedy } from "./stages/Comedy";
import { Memories } from "./stages/Memories";
import { Cake } from "./stages/Cake";
import { Gift } from "./stages/Gift";
import { Letter } from "./stages/Letter";
import { Reply } from "./stages/Reply";
import { Speaker } from "./Speaker";

type Ambient = "stars" | "clouds" | "petals" | "bokeh" | "fireflies" | "hearts";

const CHAPTERS: {
  icon: string;
  label: string;
  sky: string;
  dark: boolean;
  ambient: Ambient;
  Stage: React.ComponentType<{ next: () => void }>;
}[] = [
  { icon: "🌙", label: "The door", sky: "linear-gradient(180deg,#0d0826 0%,#251451 55%,#4a2672 100%)", dark: true, ambient: "stars", Stage: Door },
  { icon: "🔍", label: "Verification", sky: "linear-gradient(180deg,#150d36 0%,#3a1d63 60%,#7a3a83 100%)", dark: true, ambient: "stars", Stage: Scan },
  { icon: "🦆", label: "The pond", sky: "linear-gradient(180deg,#ffd9c4 0%,#ffc2b4 35%,#b8dcf0 100%)", dark: false, ambient: "clouds", Stage: Pond },
  { icon: "🌷", label: "The garden", sky: "linear-gradient(180deg,#e6f6ff 0%,#f4fbe9 55%,#fff1d8 100%)", dark: false, ambient: "petals", Stage: Garden },
  { icon: "🐘", label: "Comedy club", sky: "linear-gradient(180deg,#2a0b2e 0%,#4a1340 55%,#7a2a4f 100%)", dark: true, ambient: "bokeh", Stage: Comedy },
  { icon: "📸", label: "Memories", sky: "linear-gradient(180deg,#ffe7c2 0%,#ffc9a3 50%,#ff9f95 100%)", dark: false, ambient: "bokeh", Stage: Memories },
  { icon: "🎂", label: "The wish", sky: "linear-gradient(180deg,#ff9f8f 0%,#c46bd2 50%,#341a5c 100%)", dark: true, ambient: "fireflies", Stage: Cake },
  { icon: "🎁", label: "The gift", sky: "linear-gradient(180deg,#12062a 0%,#35115a 60%,#5a1a6b 100%)", dark: true, ambient: "stars", Stage: Gift },
  { icon: "💌", label: "The letter", sky: "linear-gradient(180deg,#0a0f2e 0%,#1c2358 60%,#3b2b6e 100%)", dark: true, ambient: "hearts", Stage: Letter },
  { icon: "🤳", label: "Your turn", sky: "linear-gradient(180deg,#ffd1dc 0%,#ffe6d6 50%,#fff3df 100%)", dark: false, ambient: "petals", Stage: Reply },
];

export function Journey() {
  const [step, setStep] = useState(0);
  const [muted, setMutedState] = useState(false);
  const ch = CHAPTERS[step];

  // Preview shortcut: /?chapter=4 jumps straight to a chapter.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("chapter"));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (n > 0 && n < CHAPTERS.length) setStep(n);
  }, []);

  const goTo = (i: number) => {
    sfx.whoosh();
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => goTo((step + 1) % CHAPTERS.length);

  return (
    <div className={`journey ${ch.dark ? "is-dark" : "is-light"}`}>
      <AnimatePresence>
        <motion.div
          key={step}
          className="sky"
          style={{ background: ch.sky }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
        />
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          key={ch.ambient}
          className="ambient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
        >
          <AmbientLayer kind={ch.ambient} />
        </motion.div>
      </AnimatePresence>
      <div className="grain" aria-hidden />

      <header className="topbar">
        <ol className="chapters" aria-label="Journey progress">
          {CHAPTERS.map((c, i) => (
            <li key={c.label} className={i === step ? "on" : i < step ? "done" : ""}>
              <button
                type="button"
                title={c.label}
                aria-label={`Go to ${c.label}`}
                aria-current={i === step ? "step" : undefined}
                onClick={() => i !== step && goTo(i)}
              >
                {c.icon}
              </button>
            </li>
          ))}
        </ol>
        <button
          className="mute"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => {
            setMuted(!isMuted());
            setMutedState(isMuted());
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      <main className="stage">
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            className="chapter"
            initial={{ opacity: 0, y: 40, scale: 0.97, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, scale: 1.02, filter: "blur(10px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ch.Stage next={next} />
          </motion.section>
        </AnimatePresence>
      </main>

      <Speaker key={step} step={step} />
    </div>
  );
}

function AmbientLayer({ kind }: { kind: Ambient }) {
  const items = useMemo(() => {
    const rnd = seeded(kind.length * 97 + 13);
    const n = { stars: 90, clouds: 6, petals: 22, bokeh: 18, fireflies: 30, hearts: 20 }[kind];
    return Array.from({ length: n }, () => ({
      x: rnd() * 100,
      y: rnd() * 100,
      s: rnd(),
      d: rnd() * 10,
      t: 6 + rnd() * 10,
    }));
  }, [kind]);

  if (kind === "stars")
    return (
      <>
        {items.map((p, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${p.x}%`,
              top: `${p.y * 0.85}%`,
              width: 1 + p.s * 2.5,
              height: 1 + p.s * 2.5,
              animationDelay: `${p.d}s`,
              animationDuration: `${2 + p.s * 4}s`,
            }}
          />
        ))}
        <span className="shooting" />
      </>
    );

  if (kind === "clouds")
    return (
      <>
        <div className="sun" />
        {items.map((p, i) => (
          <span
            key={i}
            className="cloud"
            style={{
              top: `${4 + p.y * 30}%`,
              width: 120 + p.s * 160,
              animationDuration: `${40 + p.t * 4}s`,
              animationDelay: `-${p.d * 6}s`,
            }}
          />
        ))}
      </>
    );

  const glyph = { petals: "🌸", bokeh: "", fireflies: "", hearts: "♥" }[kind];
  return (
    <>
      {items.map((p, i) => (
        <span
          key={i}
          className={`float float-${kind}`}
          style={{
            left: `${p.x}%`,
            fontSize: 10 + p.s * 18,
            width: kind === "bokeh" ? 30 + p.s * 90 : undefined,
            height: kind === "bokeh" ? 30 + p.s * 90 : undefined,
            top: kind === "bokeh" || kind === "fireflies" ? `${p.y}%` : undefined,
            animationDuration: `${p.t}s`,
            animationDelay: `-${p.d}s`,
          }}
        >
          {glyph}
        </span>
      ))}
    </>
  );
}
