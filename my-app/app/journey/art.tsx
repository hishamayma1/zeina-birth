"use client";

import { motion } from "motion/react";
import { useId } from "react";

/** Deterministic PRNG so server and client render the same "random" layout. */
export function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type DuckProps = {
  size?: number;
  flip?: boolean;
  hat?: boolean;
  bow?: boolean;
  letter?: boolean;
  body?: string;
  className?: string;
  blink?: boolean;
};

export function Duck({
  size = 120,
  flip,
  hat,
  bow,
  letter,
  body = "#FFD43B",
  className,
  blink = true,
}: DuckProps) {
  const gid = `duck${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <radialGradient id={gid} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="55%" stopColor={body} />
          <stop offset="100%" stopColor="#F2A900" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="182" rx="62" ry="8" fill="#000" opacity="0.12" />
      {/* tail */}
      <path d="M38 118 Q18 92 34 84 Q44 104 58 108 Z" fill={`url(#${gid})`} />
      {/* body */}
      <ellipse cx="96" cy="136" rx="66" ry="44" fill={`url(#${gid})`} />
      {/* wing */}
      <motion.path
        d="M70 128 Q92 108 122 124 Q112 152 80 150 Q64 144 70 128 Z"
        fill="#F7B500"
        opacity="0.85"
        style={{ originX: 0.1, originY: 0.3 }}
        animate={{ rotate: [0, -8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* head */}
      <circle cx="136" cy="74" r="40" fill={`url(#${gid})`} />
      {/* beak */}
      <path d="M168 78 Q196 76 194 88 Q186 98 164 92 Z" fill="#FF8A3D" />
      <path d="M166 90 Q184 94 190 90" stroke="#E0661E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* cheek */}
      <ellipse cx="148" cy="92" rx="9" ry="6" fill="#FF8FAB" opacity="0.65" />
      {/* eye */}
      <motion.g
        style={{ originX: 0.5, originY: 0.5 }}
        animate={blink ? { scaleY: [1, 1, 0.1, 1, 1] } : undefined}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
      >
        <ellipse cx="150" cy="68" rx="7" ry="9" fill="#2B1B3F" />
        <circle cx="152.5" cy="64.5" r="2.6" fill="#fff" />
      </motion.g>
      {hat && (
        <g transform="rotate(-14 130 30)">
          <path d="M108 44 L132 -10 L156 44 Z" fill="#FF5C8A" />
          <path d="M114 30 L150 30 M120 16 L144 16" stroke="#FFE066" strokeWidth="5" />
          <circle cx="132" cy="-12" r="8" fill="#7AE7C7" />
        </g>
      )}
      {bow && (
        <g transform="translate(118 36) rotate(-10)">
          <path d="M0 0 L-18 -12 L-18 12 Z M0 0 L18 -12 L18 12 Z" fill="#FF5C8A" />
          <circle r="5" fill="#E63E6D" />
        </g>
      )}
      {letter && (
        <g transform="translate(176 92) rotate(12)">
          <rect x="-4" y="-2" width="44" height="30" rx="4" fill="#FFF7EC" stroke="#E8CFC0" strokeWidth="2" />
          <path d="M-4 0 L18 16 L40 0" stroke="#E8CFC0" strokeWidth="2" fill="none" />
          <path d="M18 20 c-4 -6 -10 -2 -6 3 l6 5 l6 -5 c4 -5 -2 -9 -6 -3z" fill="#FF5C8A" />
        </g>
      )}
    </svg>
  );
}

/** A small grey elephant, front-facing. `mic` curls the trunk around a microphone. */
export function Elephant({
  size = 160,
  mic,
  bowtie,
  hat,
  sweat,
  className,
}: {
  size?: number;
  mic?: boolean;
  bowtie?: boolean;
  hat?: boolean;
  sweat?: boolean;
  className?: string;
}) {
  const gid = `ele${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <radialGradient id={gid} cx="42%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#E4E9F3" />
          <stop offset="55%" stopColor="#B4BED0" />
          <stop offset="100%" stopColor="#8794AD" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="192" rx="62" ry="7" fill="#000" opacity="0.14" />
      {/* body + legs */}
      <ellipse cx="100" cy="150" rx="52" ry="38" fill={`url(#${gid})`} />
      {[66, 88, 112, 134].map((x) => (
        <g key={x}>
          <rect x={x - 11} y="160" width="22" height="30" rx="10" fill={`url(#${gid})`} />
          <path d={`M${x - 7} 188 h4 M${x - 2} 188 h4 M${x + 3} 188 h4`} stroke="#F4F1EA" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      {/* ears */}
      {[
        { cx: 52, o: 0.9 },
        { cx: 148, o: 0.1 },
      ].map((e, i) => (
        <motion.g
          key={i}
          style={{ originX: e.o, originY: 0.4 }}
          animate={{ rotate: i ? [0, 10, 0] : [0, -10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx={e.cx} cy="82" rx="38" ry="44" fill={`url(#${gid})`} />
          <ellipse cx={e.cx + (i ? 4 : -4)} cy="84" rx="25" ry="31" fill="#FFB8C9" opacity="0.8" />
        </motion.g>
      ))}
      {/* head */}
      <circle cx="100" cy="80" r="46" fill={`url(#${gid})`} />
      {/* smile */}
      <path d="M78 102 Q84 112 92 106" stroke="#5B4A6E" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx="72" cy="94" rx="8" ry="5" fill="#FF8FAB" opacity="0.6" />
      <ellipse cx="128" cy="94" rx="8" ry="5" fill="#FF8FAB" opacity="0.6" />
      {/* eyes */}
      <motion.g
        style={{ originX: 0.5, originY: 0.5 }}
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
      >
        <ellipse cx="84" cy="74" rx="6" ry="8" fill="#2B1B3F" />
        <ellipse cx="116" cy="74" rx="6" ry="8" fill="#2B1B3F" />
        <circle cx="86" cy="71" r="2.3" fill="#fff" />
        <circle cx="118" cy="71" r="2.3" fill="#fff" />
      </motion.g>
      {/* trunk */}
      <motion.g
        style={{ originX: 0.5, originY: 0 }}
        animate={{ rotate: mic ? [0, -3, 0] : [0, 6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d={mic ? "M100 92 C100 118 112 130 128 124 C138 120 142 110 138 100" : "M100 92 C98 120 104 138 120 140 C130 141 134 132 128 126"}
          stroke="#A3AEC4"
          strokeWidth="17"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M94 104 h11 M95 113 h11 M98 122 h10" stroke="#8794AD" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        {mic && (
          <g transform="translate(140 92) rotate(18)">
            <rect x="-3.5" y="0" width="7" height="22" rx="3" fill="#2B2B3A" />
            <circle r="10" fill="#4A4A5E" />
            <path d="M-7 -4 h14 M-8 1 h16 M-6 6 h12" stroke="#7B7B92" strokeWidth="1.6" />
          </g>
        )}
      </motion.g>
      {bowtie && (
        <g transform="translate(100 128)">
          <path d="M0 0 L-16 -10 L-16 10 Z M0 0 L16 -10 L16 10 Z" fill="#FF5C8A" />
          <circle r="5" fill="#E63E6D" />
        </g>
      )}
      {hat && (
        <g transform="rotate(12 120 30)">
          <path d="M98 42 L122 -10 L146 42 Z" fill="#7AE7C7" />
          <path d="M104 28 L140 28 M110 14 L134 14" stroke="#FF5C8A" strokeWidth="5" />
          <circle cx="122" cy="-12" r="8" fill="#FFD43B" />
        </g>
      )}
      {sweat && (
        <motion.path
          d="M140 50 C136 58 136 64 140 64 C144 64 144 58 140 50 Z"
          fill="#7FD1F7"
          animate={{ y: [0, 14], opacity: [1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </svg>
  );
}

const PETAL_SHAPES = {
  round: "M0 0 C-14 -14 -14 -40 0 -46 C14 -40 14 -14 0 0 Z",
  pointy: "M0 0 C-10 -18 -8 -38 0 -52 C8 -38 10 -18 0 0 Z",
  heart: "M0 0 C-22 -18 -20 -44 -6 -46 C-2 -46 0 -42 0 -40 C0 -42 2 -46 6 -46 C20 -44 22 -18 0 0 Z",
};

export type FlowerKind = keyof typeof PETAL_SHAPES;

export function Flower({
  petal = "#FF8FAB",
  center = "#FFD43B",
  kind = "round",
  count = 8,
  height = 140,
  bloomed,
}: {
  petal?: string;
  center?: string;
  kind?: FlowerKind;
  count?: number;
  height?: number;
  bloomed: boolean;
}) {
  const stemTop = 200 - height;
  return (
    <svg viewBox="0 0 160 220" width="100%" height="100%" style={{ overflow: "visible" }} aria-hidden>
      <motion.path
        d={`M80 210 C 70 ${170 - height / 4}, 92 ${stemTop + 40}, 80 ${stemTop}`}
        stroke="#5FA35A"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: bloomed ? 1 : 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {[
        { x: 78, y: 175, r: -35 },
        { x: 82, y: 150, r: 35 },
      ].map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r + (i ? 180 : 0)})`}>
          <motion.path
            d="M0 0 C 10 -14, 34 -14, 40 0 C 34 10, 10 10, 0 0 Z"
            fill="#79C26F"
            style={{ originX: 0, originY: 0.5 }}
            initial={{ scale: 0 }}
            animate={{ scale: bloomed ? 1 : 0 }}
            transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200 }}
          />
        </g>
      ))}
      <g transform={`translate(80 ${stemTop})`}>
        {Array.from({ length: count }, (_, i) => (
          <g key={i} transform={`rotate(${(360 / count) * i})`}>
            <motion.path
              d={PETAL_SHAPES[kind]}
              style={{ originX: 0.5, originY: 1 }}
              fill={petal}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              initial={{ scale: 0 }}
              animate={{ scale: bloomed ? 1 : 0 }}
              transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 180, damping: 11 }}
            />
          </g>
        ))}
        <motion.circle
          r="14"
          fill={center}
          initial={{ scale: 0 }}
          animate={{ scale: bloomed ? 1 : 0 }}
          transition={{ delay: 1.1, type: "spring" }}
        />
        <motion.circle r="5" cx="-4" cy="-4" fill="#fff" opacity="0.5" animate={{ scale: bloomed ? 1 : 0 }} />
      </g>
    </svg>
  );
}

export function Heart({ size = 24, color = "#FF5C8A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4 6.4 4c2.3 0 3.9 1.3 5.6 3.3C13.7 5.3 15.3 4 17.6 4c4.1 0 6 4.4 4.4 7.7C19.5 16.4 12 21 12 21z"
        fill={color}
      />
    </svg>
  );
}
