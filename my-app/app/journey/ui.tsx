"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { createPortal } from "react-dom";
import { sfx } from "./sound";

export function Btn({
  children,
  variant = "primary",
  onClick,
  className = "",
  ...rest
}: HTMLMotionProps<"button"> & { variant?: "primary" | "ghost" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        sfx.click();
        onClick?.(e);
      }}
      className={`btn btn-${variant} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="kicker"
    >
      {children}
    </motion.p>
  );
}

export function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.2, duration: 0.7 }}
      className={`title ${className}`}
    >
      {children}
    </motion.h1>
  );
}

export function Sub({ children, delay = 0.4 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="sub"
    >
      {children}
    </motion.p>
  );
}

/** Splits text into letters that bounce in one by one. */
export function BounceText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ y: 60, opacity: 0, rotate: -20 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: delay + i * 0.05, type: "spring", stiffness: 300, damping: 14 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

/** Renders children into <body> so fixed overlays escape the animated chapter wrapper. */
export function Portal({ children }: { children: React.ReactNode }) {
  return typeof document === "undefined" ? null : createPortal(children, document.body);
}
