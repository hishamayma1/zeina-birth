"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

const AGE = new Date(`${config.celebrationDate}T00:00:00`).getFullYear() - new Date(`${config.birthDate}T00:00:00`).getFullYear();
const [Y, M, D] = config.celebrationDate.split("-");

type Phase = "pick" | "edit" | "sent";

export function Reply({ next }: { next: () => void }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [msg, setMsg] = useState("");
  const [card, setCard] = useState<{ file: File; url: string } | null>(null);
  const [via, setVia] = useState<"share" | "whatsapp">("share");
  const camRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const text = `${msg.trim() || "💛"}\n\n— ${config.name} 🎂`;
  const waUrl = `https://wa.me/${config.reply.whatsapp}?text=${encodeURIComponent(text)}`;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const img = new Image();
    img.src = URL.createObjectURL(f);
    try {
      await img.decode();
    } catch {
      return;
    }
    sfx.sparkle();
    setPhoto(img);
    setPhase("edit");
  };

  // Re-render the card shortly after the photo or message changes, so it's
  // ready the moment she taps "send" (sharing must happen right on the tap).
  useEffect(() => {
    if (!photo) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const file = await renderCard(photo, msg);
      if (!cancelled) setCard({ file, url: URL.createObjectURL(file) });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [photo, msg]);

  useEffect(() => {
    if (card) return () => URL.revokeObjectURL(card.url);
  }, [card]);

  const download = () => {
    if (!card) return;
    const a = document.createElement("a");
    a.href = card.url;
    a.download = card.file.name;
    a.click();
  };

  const celebrate = () => {
    sfx.tada();
    const duck = confetti.shapeFromText({ text: "🦆", scalar: 2 });
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.7 } });
    confetti({ particleCount: 30, spread: 80, origin: { y: 0.7 }, shapes: [duck], scalar: 2 });
  };

  const send = async () => {
    if (!card) return;
    sfx.whoosh();
    if (navigator.canShare?.({ files: [card.file] })) {
      try {
        await navigator.share({ files: [card.file], text, title: `${config.name}'s birthday 💛` });
        setVia("share");
        setPhase("sent");
        celebrate();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          download();
          setVia("whatsapp");
          setPhase("sent");
        }
      }
      return;
    }
    // No file sharing (e.g. most desktops): save the card and open his chat.
    download();
    window.open(waUrl, "_blank", "noopener");
    setVia("whatsapp");
    setPhase("sent");
    celebrate();
  };

  return (
    <div className="center-col">
      <input ref={camRef} type="file" accept="image/*" capture="user" hidden onChange={onFile} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onFile} />

      <AnimatePresence mode="wait">
        {phase === "pick" && (
          <motion.div key="pick" className="center-col" exit={{ opacity: 0, y: -20 }}>
            <Kicker>Bonus chapter · Your turn</Kicker>
            <Title>
              Now show me <em>that face</em> 🤳
            </Title>
            <Sub>
              Hisham wants to see the birthday girl right after the surprise. Take a selfie (or pick a photo) and send it to
              him with a little message.
            </Sub>
            <motion.div
              className="selfie-frame"
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => camRef.current?.click()}
            >
              <span className="text-6xl">📸</span>
              <span className="selfie-hint">Smile! 😁</span>
            </motion.div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Btn onClick={() => camRef.current?.click()}>📸 Take a selfie</Btn>
              <Btn variant="ghost" onClick={() => galleryRef.current?.click()}>
                🖼️ Choose a photo
              </Btn>
            </div>
            <p className="hint">Messy hair? Happy tears? Perfect. He wants exactly that.</p>
          </motion.div>
        )}

        {phase === "edit" && photo && (
          <motion.div key="edit" className="center-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Kicker>Looking gorgeous, as expected</Kicker>
            <Title>Add a message for Hisham</Title>
            <div className="reply-grid">
              <motion.div className="card-preview" initial={{ rotate: -6, scale: 0.8 }} animate={{ rotate: -2, scale: 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card?.url ?? photo.src} alt="Your birthday card" />
              </motion.div>
              <div className="reply-form">
                <textarea
                  value={msg}
                  maxLength={280}
                  rows={4}
                  placeholder="Write something to Hisham… 💌"
                  onChange={(e) => setMsg(e.target.value)}
                />
                <div className="chips">
                  {config.reply.suggestions.map((s) => (
                    <button key={s} className="chip" onClick={() => setMsg(s)}>
                      {s}
                    </button>
                  ))}
                </div>
                <Btn onClick={send} disabled={!card}>
                  Send to Hisham on WhatsApp 💬
                </Btn>
                <button className="link-btn" onClick={() => setPhase("pick")}>
                  ↺ Retake photo
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "sent" && (
          <motion.div key="sent" className="center-col" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.span
              className="text-7xl"
              initial={{ x: -200 }}
              animate={{ x: [-200, 0, 10, 0] }}
              transition={{ duration: 1.2 }}
            >
              🦆💨
            </motion.span>
            <Kicker>Delivered by Duck Express</Kicker>
            <Title>Sent with love 💛</Title>
            <Sub>
              {via === "share"
                ? "Hisham is probably screaming at his phone right now. Thank you for being the best part of his life."
                : "Your card was saved to your device. Attach it 📎 in the WhatsApp chat that just opened, and hit send!"}
            </Sub>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <a className="btn btn-primary" href={waUrl} target="_blank" rel="noopener noreferrer">
                💬 Open Hisham&apos;s WhatsApp
              </a>
              <Btn variant="ghost" onClick={download}>
                ⬇️ Save the card
              </Btn>
              <Btn variant="ghost" onClick={() => setPhase("edit")}>
                ✏️ Send another
              </Btn>
            </div>
            <Btn className="mt-6" variant="ghost" onClick={next}>
              Replay the journey ↺
            </Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Card rendering ----------

function fontVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, "")}…`;
  }
  return lines;
}

async function renderCard(photo: HTMLImageElement, message: string): Promise<File> {
  const W = 1080;
  const H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const hand = fontVar("--font-hand", "cursive");
  const display = fontVar("--font-display", "serif");
  await Promise.all([document.fonts.load(`64px ${hand}`), document.fonts.load(`700 40px ${display}`)]);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#ffe1ea");
  bg.addColorStop(0.55, "#fff1dc");
  bg.addColorStop(1, "#ffd9c4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.font = "56px serif";
  [["🦆", 70, 110], ["🌸", 960, 90], ["💛", 1000, 640], ["✨", 50, 700], ["🌷", 980, 1000], ["🦆", 60, 1060]].forEach(
    ([e, x, y]) => ctx.fillText(e as string, x as number, y as number),
  );

  // Polaroid
  ctx.save();
  ctx.translate(W / 2, 520);
  ctx.rotate((-2 * Math.PI) / 180);
  ctx.shadowColor = "rgba(80,30,40,0.3)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(-420, -430, 840, 880);
  ctx.shadowColor = "transparent";
  const pw = 780;
  const ph = 700;
  const scale = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
  const sw = pw / scale;
  const sh = ph / scale;
  ctx.drawImage(photo, (photo.naturalWidth - sw) / 2, (photo.naturalHeight - sh) / 2, sw, sh, -390, -400, pw, ph);
  ctx.fillStyle = "#2b1b3f";
  ctx.textAlign = "center";
  ctx.font = `68px ${hand}`;
  ctx.fillText(`${config.name} at ${AGE} 🎂`, 0, 390);
  ctx.fillStyle = "rgba(255, 214, 120, 0.7)";
  ctx.rotate((-4 * Math.PI) / 180);
  ctx.fillRect(-90, -455, 180, 50);
  ctx.restore();

  // Message
  ctx.textAlign = "center";
  ctx.fillStyle = "#3b2a3f";
  ctx.font = `58px ${hand}`;
  const lines = wrap(ctx, message.trim() || "💛", 900, 3);
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 1070 + i * 62));
  ctx.fillStyle = "#e2457a";
  ctx.font = `50px ${hand}`;
  ctx.fillText(`— ${config.name}, to ${config.from} 💛`, W / 2, 1090 + lines.length * 62);
  ctx.fillStyle = "rgba(43,27,63,0.45)";
  ctx.font = `700 26px ${display}`;
  ctx.fillText(`${D} · ${M} · ${Y}`, W / 2, H - 40);

  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.92));
  return new File([blob], `${config.name.toLowerCase()}-birthday.jpg`, { type: "image/jpeg" });
}
