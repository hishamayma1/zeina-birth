"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { config } from "../config";
import { sfx } from "../sound";
import { Btn, Kicker, Sub, Title } from "../ui";

type Phase = "pick" | "edit" | "sent" | "manual";

export function Reply({ next }: { next: () => void }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [msg, setMsg] = useState("");
  // Her photo uploads in the background while she types, so "send" can jump
  // straight into Hisham's WhatsApp chat with the photo link already in the message.
  const [link, setLink] = useState<string | null | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const uploadRef = useRef<Promise<string | null> | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const text = (photoLink?: string | null) =>
    [msg.trim() || "💛", photoLink && `📸 ${photoLink}`, `— ${config.name} 🎂`].filter(Boolean).join("\n\n");
  // api.whatsapp.com rather than wa.me: wa.me's redirect turns emoji into "�".
  const waUrl = (photoLink?: string | null) =>
    `https://api.whatsapp.com/send?phone=${config.reply.whatsapp}&text=${encodeURIComponent(text(photoLink))}`;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    if (photo) return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    // Re-encode to a reasonably sized JPEG up front, so the share on "send"
    // happens instantly (phones only allow sharing right on the tap).
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

  const send = async () => {
    if (!photo || sending) return;
    sfx.whoosh();
    setSending(true);
    const photoLink = await uploadRef.current;
    setSending(false);
    if (photoLink) {
      // Same-tab navigation isn't stopped by pop-up blockers or in-app browsers,
      // and opens WhatsApp right in Hisham's chat with her message + photo ready.
      setPhase("sent");
      celebrate();
      window.location.href = waUrl(photoLink);
      return;
    }
    // The upload didn't work: hand the photo to the phone's share sheet instead.
    const data: ShareData = { files: [photo.file], text: text() };
    if (navigator.canShare?.(data)) {
      try {
        await navigator.share(data);
        setPhase("sent");
        celebrate();
      } catch (err) {
        if ((err as Error).name !== "AbortError") setPhase("manual");
      }
      return;
    }
    // This browser can't share files (in-app browsers, most desktops).
    setPhase("manual");
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
                <button type="button" className="wa-send" onClick={send} aria-label="Send on WhatsApp" aria-busy={sending}>
                  {sending ? (
                    <span className="wa-spin" aria-hidden />
                  ) : (
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="hint">Tap ➤ and WhatsApp opens in Hisham&apos;s chat with your photo and message. Just hit send there.</p>

            <button className="link-btn" onClick={() => setPhase("pick")}>
              ↺ Change photo
            </button>
          </motion.div>
        )}

        {phase === "manual" && photo && (
          <motion.div key="manual" className="center-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Kicker>Almost there</Kicker>
            <Title>Two quick taps 💛</Title>
            <Sub>This browser can&apos;t attach photos to WhatsApp by itself, so let&apos;s do it together:</Sub>
            <ol className="wa-steps">
              <li>
                <b>1.</b> Save your photo: press and hold it below, then <i>Save image</i> (or use the button).
              </li>
              <li>
                <b>2.</b> Open Hisham&apos;s chat: your message is already typed. Tap 📎 to attach the photo, then send.
              </li>
            </ol>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wa-save" src={photo.url} alt="Your photo" />
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <a className="btn btn-ghost" href={photo.url} download={photo.file.name}>
                ⬇️ Save photo
              </a>
              <a className="btn btn-primary" href={waUrl()} target="_blank" rel="noopener noreferrer" onClick={celebrate}>
                💬 Open Hisham&apos;s WhatsApp
              </a>
            </div>
            <button className="link-btn mt-6" onClick={() => setPhase("edit")}>
              ← Back
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
            <Sub>Hisham is probably screaming at his phone right now. Thank you for being the best part of his life.</Sub>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              {link && (
                <a className="btn btn-primary" href={waUrl(link)}>
                  💬 Open Hisham&apos;s WhatsApp again
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

/** Uploads the photo and resolves to its public link, or null if it fails (she then gets the share sheet). */
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
