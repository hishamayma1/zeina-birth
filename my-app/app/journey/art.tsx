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
