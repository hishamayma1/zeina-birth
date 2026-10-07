// All sound effects are synthesized with the Web Audio API, so there are no
// audio files to ship. Music uses config.songUrl when present, otherwise a
// music-box "Happy Birthday" is played.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

let songEl: HTMLAudioElement | null = null;
let boxTimer: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { ac: ctx, out: master! };
}

/** Call from a click handler to unlock audio on mobile browsers. */
export function unlockAudio() {
  audio();
}

export function setMuted(value: boolean) {
  muted = value;
  if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 0.7, ctx.currentTime, 0.05);
  if (songEl) songEl.muted = value;
}

export function isMuted() {
  return muted;
}

function tone(
  freq: number,
  {
    type = "sine" as OscillatorType,
    start = 0,
    dur = 0.3,
    vol = 0.3,
    slideTo,
    dest,
  }: {
    type?: OscillatorType;
    start?: number;
    dur?: number;
    vol?: number;
    slideTo?: number;
    dest?: AudioNode;
  } = {},
) {
  const { ac, out } = audio();
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(dest ?? out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise({
  start = 0,
  dur = 0.3,
  vol = 0.3,
  filter = "bandpass" as BiquadFilterType,
  freq = 1000,
  freqTo,
  q = 1,
}: {
  start?: number;
  dur?: number;
  vol?: number;
  filter?: BiquadFilterType;
  freq?: number;
  freqTo?: number;
  q?: number;
} = {}) {
  const { ac, out } = audio();
  const t = ac.currentTime + start;
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = filter;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(out);
  src.start(t);
}

function quackOnce(start: number, pitch: number) {
  const { ac, out } = audio();
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(pitch * 1.25, t);
  osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.05);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + 0.16);
  const formant = ac.createBiquadFilter();
  formant.type = "bandpass";
  formant.frequency.setValueAtTime(1500, t);
  formant.frequency.exponentialRampToValueAtTime(800, t + 0.16);
  formant.Q.value = 3;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.6, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(formant).connect(g).connect(out);
  osc.start(t);
  osc.stop(t + 0.22);
}

export const sfx = {
  quack() {
    const p = 380 + Math.random() * 120;
    quackOnce(0, p);
    if (Math.random() > 0.4) quackOnce(0.17, p * 1.08);
  },
  pop() {
    tone(900, { slideTo: 140, dur: 0.12, vol: 0.4 });
    noise({ dur: 0.06, vol: 0.2, filter: "highpass", freq: 2500 });
  },
  click() {
    tone(1300, { type: "square", dur: 0.03, vol: 0.05 });
  },
  type() {
    noise({ dur: 0.025, vol: 0.06, filter: "highpass", freq: 3000 + Math.random() * 2000 });
  },
  boing() {
    const { ac, out } = audio();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const lfo = ac.createOscillator();
    const lfoG = ac.createGain();
    const g = ac.createGain();
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.35);
    lfo.frequency.value = 18;
    lfoG.gain.value = 40;
    lfo.connect(lfoG).connect(osc.frequency);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(g).connect(out);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.45);
    lfo.stop(t + 0.45);
  },
  sparkle() {
    [1568, 2093, 2637, 3136].forEach((f, i) =>
      tone(f, { start: i * 0.06, dur: 0.5, vol: 0.12, type: "triangle" }),
    );
  },
  bloom() {
    tone(392, { slideTo: 784, dur: 0.5, vol: 0.18, type: "triangle" });
    tone(988, { start: 0.25, dur: 0.6, vol: 0.1 });
    tone(1319, { start: 0.32, dur: 0.6, vol: 0.08 });
  },
  whoosh() {
    noise({ dur: 0.6, vol: 0.25, freq: 300, freqTo: 3000, q: 0.8 });
  },
  blow() {
    noise({ dur: 0.5, vol: 0.35, filter: "lowpass", freq: 1400, freqTo: 300 });
  },
  shake() {
    noise({ dur: 0.18, vol: 0.25, filter: "bandpass", freq: 500, q: 2 });
    tone(110, { dur: 0.15, vol: 0.2, type: "triangle" });
  },
  tada() {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(f, { start: i * 0.09, dur: 0.8, vol: 0.18, type: "triangle" }),
    );
    tone(1568, { start: 0.38, dur: 1.2, vol: 0.12 });
  },
  firework() {
    noise({ dur: 0.9, vol: 0.3, filter: "lowpass", freq: 900, freqTo: 120 });
    tone(80, { dur: 0.4, vol: 0.25, slideTo: 40 });
  },
  message() {
    tone(880, { dur: 0.12, vol: 0.12, type: "triangle" });
    tone(1320, { start: 0.08, dur: 0.18, vol: 0.1, type: "triangle" });
  },
  heart() {
    tone(70, { dur: 0.15, vol: 0.4 });
    tone(70, { start: 0.18, dur: 0.18, vol: 0.3 });
  },
};

// ---------- Music ----------

const NOTE: Record<string, number> = {
  C3: 130.81, F3: 174.61, G3: 196.0, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

// [note, beats, bass]
const HAPPY_BIRTHDAY: [string, number, string?][] = [
  ["G4", 0.75, "C3"], ["G4", 0.25], ["A4", 1, "F3"], ["G4", 1], ["C5", 1, "C3"], ["B4", 2, "G3"],
  ["G4", 0.75, "G3"], ["G4", 0.25], ["A4", 1, "G3"], ["G4", 1], ["D5", 1, "G3"], ["C5", 2, "C3"],
  ["G4", 0.75, "C3"], ["G4", 0.25], ["G5", 1, "C3"], ["E5", 1], ["C5", 1, "F3"], ["B4", 1], ["A4", 2, "F3"],
  ["F5", 0.75, "F3"], ["F5", 0.25], ["E5", 1, "C3"], ["C5", 1], ["D5", 1, "G3"], ["C5", 3, "C3"],
  ["", 2],
];

function musicBoxNote(freq: number, when: number, dur: number, vol: number, dest: AudioNode) {
  const ac = ctx!;
  [1, 2, 4].forEach((h, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * h;
    const v = vol / (i * 2.5 + 1);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(v, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(dur, 0.6) * 1.6);
    osc.connect(g).connect(dest);
    osc.start(when);
    osc.stop(when + Math.max(dur, 0.6) * 1.7);
  });
}

function startMusicBox() {
  if (boxTimer) return;
  const { ac, out } = audio();
  musicGain = ac.createGain();
  musicGain.gain.value = 0.35;
  musicGain.connect(out);
  const beat = 0.48;
  let idx = 0;
  let next = ac.currentTime + 0.1;
  const schedule = () => {
    while (next < ac.currentTime + 1.2) {
      const [n, beats, bass] = HAPPY_BIRTHDAY[idx];
      if (n) musicBoxNote(NOTE[n], next, beats * beat, 0.22, musicGain!);
      if (bass) musicBoxNote(NOTE[bass], next, 3 * beat, 0.12, musicGain!);
      next += beats * beat;
      idx = (idx + 1) % HAPPY_BIRTHDAY.length;
    }
  };
  schedule();
  boxTimer = setInterval(schedule, 300);
}

export function startMusic(url: string) {
  if (songEl || boxTimer) return;
  audio();
  const el = new Audio(url);
  el.loop = true;
  el.volume = 0.45;
  el.muted = muted;
  songEl = el;
  el.play().catch(() => {
    songEl = null;
    startMusicBox();
  });
  el.addEventListener("error", () => {
    if (songEl === el) {
      songEl = null;
      startMusicBox();
    }
  });
}

/** Softly lowers the music (e.g. while reading the letter). */
export function duckMusic(level: number) {
  if (songEl) songEl.volume = 0.45 * level;
  if (musicGain && ctx) musicGain.gain.setTargetAtTime(0.35 * level, ctx.currentTime, 0.4);
}
