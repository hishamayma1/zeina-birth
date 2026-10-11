"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

type Phase = "pick" | "edit" | "sent";

/** How long send waits for the photo upload before going to WhatsApp without the link. */
const UPLOAD_TIMEOUT_MS = 12000;

export function Reply({ next }: { next: () => void }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [msg, setMsg] = useState("");
  // Her photo uploads in the background while she types, so "send" can jump
  // straight into Hisham's WhatsApp chat with the photo link already in the message.
  // undefined = still uploading, null = upload failed.
  const [link, setLink] = useState<string | null | undefined>(undefined);
  const uploadRef = useRef<Promise<string | null> | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const text = (photoLink?: string | null) =>
    [msg.trim() || "💛", photoLink && `📸 ${photoLink}`, `— ${config.name} 🎂`].filter(Boolean).join("\n\n");
  const waUrl = (photoLink?: string | null) => whatsappLink(text(photoLink));
  const uploading = photo !== null && link === undefined;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    if (photo) return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    // Re-encode to a reasonably sized JPEG so the upload is quick.
    const file = await toJpeg(f).catch(() => null);
    if (!file) return;
    sfx.sparkle();
    setPhoto({ file, url: URL.createObjectURL(file) });
    setLink(undefined);
    const upload = uploadSelfie(file);
    uploadRef.current = upload;
    upload.then((l) => uploadRef.current === upload && setLink(l));
    setPhase("edit");
  };

  const celebrate = () => {
    sfx.tada();
    const duck = confetti.shapeFromText({ text: "🦆", scalar: 2 });
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.7 } });
    confetti({ particleCount: 30, spread: 80, origin: { y: 0.7 }, shapes: [duck], scalar: 2 });
  };

  // The send button is a real link to Hisham's chat, so the tap itself opens
  // WhatsApp (phones only open apps straight from a tap, not after waiting).
  const onSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    sfx.whoosh();
    setPhase("sent");
    celebrate();
    if (!uploading) return;
    // Photo still uploading: wait for it, then go (with or without the link).
    e.preventDefault();
    const upload = uploadRef.current ?? Promise.resolve(null);
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), UPLOAD_TIMEOUT_MS));
    Promise.race([upload, timeout]).then((l) => {
      window.location.href = waUrl(l);
    });
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
              him on WhatsApp with a little message.
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
            <Title>Send it to Hisham 💬</Title>

            <div className="wa">
              <div className="wa-head">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.hisham.photo} alt="" />
                <div>
                  <b>{config.from} 💛</b>
                  <small>online</small>
                </div>
              </div>

              <div className="wa-body">
                <motion.div className="wa-bubble" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="Your photo" />
                  <p>{msg.trim() || "💛"}</p>
                  <span className="wa-meta">
                    {link === undefined ? "uploading… 🕓" : `${time} ✓✓`}
                  </span>
                </motion.div>
              </div>

              <div className="wa-chips">
                {config.reply.suggestions.map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => setMsg(s)}>
                    {s}
                  </button>
                ))}
              </div>

              <div className="wa-bar">
                <textarea
                  value={msg}
                  maxLength={280}
                  rows={1}
                  placeholder="Message"
                  onChange={(e) => setMsg(e.target.value)}
                />
                <a className="wa-send" href={waUrl(link)} onClick={onSend} aria-label="Send to Hisham on WhatsApp">
                  {uploading ? (
                    <span className="wa-spin" aria-hidden />
                  ) : (
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2z" />
                    </svg>
                  )}
                </a>
              </div>
            </div>
            <p className="hint">Tap ➤ and WhatsApp opens in Hisham&apos;s chat with your photo and message. Just hit send there.</p>

            <button className="link-btn" onClick={() => setPhase("pick")}>
              ↺ Change photo
            </button>
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
              {link === null
                ? "Your photo couldn't upload, so save it below and attach it 📎 in Hisham's chat."
                : "Hit send in WhatsApp and Hisham is probably screaming at his phone a second later 💛"}
            </Sub>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <a className="btn btn-primary" href={waUrl(link)}>
                💬 Open Hisham&apos;s WhatsApp
              </a>
              {link === null && photo && (
                <a className="btn btn-ghost" href={photo.url} download={photo.file.name}>
                  ⬇️ Save photo
                </a>
              )}
              <Btn variant="ghost" onClick={() => setPhase("edit")}>
                ✏️ Send another
              </Btn>
              <Btn variant="ghost" onClick={next}>
                Replay the journey ↺
              </Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * A link that opens WhatsApp straight in Hisham's chat with the text typed in.
 * Phones use the app's own whatsapp:// link (opens the app directly, no web page
 * in between); computers use api.whatsapp.com. (Not wa.me: its redirect turns emoji into "�".)
 */
function whatsappLink(text: string) {
  const query = `phone=${config.reply.whatsapp}&text=${encodeURIComponent(text)}`;
  const mobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return mobile ? `whatsapp://send?${query}` : `https://api.whatsapp.com/send?${query}`;
}

/** Uploads the photo to UploadThing and resolves to its preview link, or null if it fails. */
async function uploadSelfie(file: File): Promise<string | null> {
  try {
    const res = await fetch("/api/selfie", { method: "POST", headers: { "content-type": "image/jpeg" }, body: file });
    if (!res.ok) return null;
    const { url } = (await res.json()) as { url?: string };
    return url ?? null;
  } catch {
    return null;
  }
}

/** Downscales any picked image to a JPEG WhatsApp and every share sheet accept. */
async function toJpeg(f: File, max = 1600): Promise<File> {
  const img = new Image();
  const src = URL.createObjectURL(f);
  try {
    img.src = src;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej()), "image/jpeg", 0.9));
    return new File([blob], `${config.name.toLowerCase()}-birthday.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(src);
  }
}
