// ✏️  Everything personal lives here. Edit freely — the site rebuilds itself around it.

export const config = {
  name: "Zaina",
  /** Her birth date (YYYY-MM-DD). */
  birthDate: "2004-10-15",
  /** The birthday being celebrated. Her age is calculated from this. */
  celebrationDate: "2027-10-15",
  /** How you sign the final letter. */
  from: "Hisham",

  /**
   * Optional background song. Drop an mp3 at public/audio/song.mp3 and it plays
   * instead of the built-in music-box "Happy Birthday".
   */
  songUrl: "/audio/song.mp3",

  /** Chapter 0 — the duck at the door asks who she is. */
  noButtonReplies: [
    "Nice try 🙂",
    "The duck doesn't believe you",
    "Wrong button, birthday girl",
    "Quack. (That means 'liar')",
    "I literally have your photo",
    "Okay this button is broken now",
  ],

  /** Chapter 1 — the fake "scanner". */
  scanSteps: [
    { label: "Scanning for cuteness", result: "off the charts" },
    { label: "Checking that smile", result: "dangerously beautiful" },
    { label: "Counting ducks owned", result: "never enough" },
    { label: "Detecting elephant obsession", result: "severe. incurable. adorable 🐘" },
    { label: "Testing sense of humor", result: "funnier than Hisham (ouch)" },
    { label: "Measuring how much Hisham loves you", result: "error: number too big" },
    { label: "Calculating age", result: "classified… just kidding" },
  ],

  /** Chapter 2 — each duck in the pond carries one of these. */
  duckMessages: [
    "Quack! Translation: you're the prettiest girl in every pond.",
    "I'm just a duck, and even I can see Hisham is crazy lucky to have you.",
    "Fun fact: ducks are cute. You're cuter. The ducks have filed a complaint.",
    "Your laugh is Hisham's favorite sound. Second place: QUACK.",
    "We ducks know you secretly prefer elephants. We're not mad. We're just… smaller.",
    "Happy birthday Zaina! May your year be as smooth as a duck on a calm lake 🦆",
  ],

  /** Chapter 3 — one reason per flower. */
  reasons: [
    "The way you look at me when you think I'm not noticing.",
    "You turn ordinary days into tiny holidays.",
    "Your kindness — to people, to animals, and especially to ducks.",
    "How you get excited about the smallest, silliest things.",
    "You're my safe place. Always.",
    "You laugh at my jokes. Even the bad ones. Especially the bad ones.",
  ],

  /**
   * The comedy club — Peanut the elephant does stand-up for her.
   * Each joke: q (setup) and a (punchline).
   */
  elephant: {
    name: "Peanut",
    jokes: [
      { q: "Why do elephants never use computers?", a: "They're terrified of the mouse." },
      { q: "Why are elephants so wrinkly?", a: "Have you ever tried to iron one?" },
      { q: "How do you know an elephant was in your fridge?", a: "Footprints in the birthday cake. Sorry. I was hungry." },
      { q: "What do elephants say when they bump into each other?", a: "Small world, isn't it?" },
      { q: "Why don't elephants ever forget a birthday?", a: "Because Hisham would never hear the end of it." },
      { q: "What's huge, grey, and thinks Zaina is the funniest person alive?", a: "Me. And Hisham. We have a group chat about it." },
    ],
    /** Peanut's comebacks when she boos. */
    boos: [
      "Tough crowd. I was warned you're the funny one here.",
      "Booing an elephant? On HIS birthday… oh wait, it's yours. Carry on.",
      "That one was Hisham's joke. Boo him.",
      "I'm not crying, my trunk is just leaking.",
      "Elephants never forget. I will remember this boo forever.",
      "Okay, fine, I'll stick to my day job. (Being cute.)",
    ],
  },

  /**
   * Chapter 4 — photos. Put your images in public/photos/ with these names
   * (or change the paths). Missing images show a cute placeholder.
   */
  memories: [
    { src: "/photos/1.jpg", caption: "The day everything started ✨" },
    { src: "/photos/2.jpg", caption: "Look at that smile. Illegal." },
    { src: "/photos/3.jpg", caption: "My favorite place: next to you" },
    { src: "/photos/4.jpg", caption: "We look good together, admit it" },
    { src: "/photos/5.jpg", caption: "Proof that you're the cutest" },
    { src: "/photos/6.jpg", caption: "More of these, please. Forever." },
  ],

  /**
   * Hisham talks to her in every chapter (a little chat bubble in the corner).
   * One list per chapter, in order: door, scan, pond, garden, comedy club, memories, cake, gift, letter.
   * Put your face at public/photos/hisham.jpg for the avatar.
   */
  hisham: {
    photo: "/photos/hisham.jpg",
    lines: [
      [
        "Hi Zaina 👋 It's me, Hisham. I'll be your tour guide today.",
        "Yes, I hired a duck to deliver this. Budget was tight — he works for bread 🍞",
        "Hint: press the yellow button. The other one is… emotionally unavailable.",
      ],
      [
        "Relax, this scan is 100% scientific. I built it myself.",
        "Okay, I may have rigged the cuteness test. You broke the machine anyway.",
        "All those days of you… and the world still isn't ready 💛",
      ],
      [
        "These ducks auditioned for weeks to be here. Be nice to them.",
        "Tap them all — each one memorized a message for you.",
        "Fun fact: I'm also a duck. A duck who loves you. Quack.",
      ],
      [
        "I planted these with my own hands. (Digitally. My hands are clean.)",
        "Warning: only 6 reasons fit here. The full list needs a bigger garden… like a planet 🌍",
        "You're the prettiest flower in this garden. Don't tell the flowers 🤫",
      ],
      [
        "Tonight's special guest: Peanut the elephant 🐘 Yes, I know about your elephant obsession. I know everything.",
        "He flew in just for you. Economy class. It was very tight for him.",
        "Go easy on him. He's only the second-funniest person you know. You're first 😌",
      ],
      [
        "Every photo here is my favorite. Yes, all of them. That's how it works.",
        "You look amazing in every single one. Me? I'm… present 😅",
        "Let's fill a whole album this year. Deal?",
      ],
      [
        "Make a big wish. I'm already working on making it come true 🌠",
        "Pro tip: blow into the mic. You'll look silly. I'll love it.",
        "Zero calories in this cake. That's my gift to you.",
      ],
      [
        "I wrapped this myself. You can tell by the… perfection.",
        "It's shy. Like me the first time I talked to you.",
        "HAPPY BIRTHDAY MY LOVE 🎉🎉🎉",
      ],
      [
        "Okay… this part is serious. I wrote it from my heart.",
        "Take your time reading. I'll be right here 💛",
        "Thank you for being you, Zaina. I love you. Always.",
      ],
      [
        "Okay, your turn now 😌",
        "I need to see the face of the birthday girl RIGHT NOW. It's urgent.",
        "No filters needed. You already are the best filter 💛",
      ],
    ],
    /** Shown one by one when she taps your avatar. */
    bonus: [
      "Still here? Good. I'm not going anywhere either.",
      "Reminder: you owe me a hug. The interest is growing.",
      "Did you drink water today? Drink water. I love you.",
      "Hisham fact #1: thinks about you way too much.",
      "I'd choose you in every lifetime. Even the one where I'm a duck 🦆",
      "If you were an elephant you'd still be the cutest elephant. I've thought about this a lot 🐘",
      "You're the only person who makes me laugh until I snort. Like a tiny elephant.",
      "Stop tapping my face 😳 …okay, keep going.",
    ],
  },

  /** Chapter 8 — she sends a selfie + a reply to your WhatsApp. */
  reply: {
    /** Your WhatsApp number in international format: Egypt (+20) without the leading 0. */
    whatsapp: "201159304129",
    suggestions: [
      "I love you so much 💛",
      "Best birthday ever!!! 🎂",
      "Quack quack 🦆 (that means thank you)",
      "You're stuck with me forever, Hisham",
      "Peanut was funnier than you 🐘",
    ],
  },

  /** Chapter 7 — the letter. Each string is a paragraph. */
  letter: [
    "My dearest Zaina,",
    "Happy birthday to the girl who makes my whole world softer, brighter, and a lot more full of ducks (and, yes, elephants).",
    "Every year with you feels like a gift I didn't know I was allowed to have. You're the funniest person I know — you make me laugh when I'm tired, you make me braver when I'm scared, and you make me want to be better just by being you.",
    "I hope this year gives you everything you've been wishing for — and I promise to be right there for all of it: the big moments, the small ones, and the random 2 a.m. duck videos, and every elephant video you send me at 3 a.m.",
    "I love you. Today, tomorrow, and every 15th of October after this one.",
  ],
} as const;

export type Config = typeof config;
