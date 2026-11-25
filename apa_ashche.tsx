// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Settings,
  HelpCircle,
  Info,
  Trophy,
  Award,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Home,
  X,
  Check,
  Trash2,
  Sparkles,
  Flame,
  MapPin,
  Lock,
  Unlock,
  Download,
} from "lucide-react";

// ============================================================================
// 1. LOCALSTORAGE PERSISTENCE LAYER (apa_ashche_save_v1)
// ============================================================================
const STORAGE_KEY = "apa_ashche_save_v1";

const DEFAULT_SAVE_DATA = {
  version: 1,
  highScore: 0,
  bestDistance: 0,
  totalGamesPlayed: 0,
  totalCrossings: 0,
  unlockedLevels: [1],
  masterVolume: 0.8,
  musicVolume: 0.55,
  sfxVolume: 0.85,
  musicEnabled: true,
  sfxEnabled: true,
  textOnlyDialogue: false,
};

function loadSaveData() {
  if (typeof window === "undefined") return { ...DEFAULT_SAVE_DATA };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE_DATA };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_SAVE_DATA };

    return {
      version: 1,
      highScore:
        typeof parsed.highScore === "number" && parsed.highScore >= 0
          ? Math.floor(parsed.highScore)
          : 0,
      bestDistance:
        typeof parsed.bestDistance === "number" && parsed.bestDistance >= 0
          ? Math.floor(parsed.bestDistance)
          : 0,
      totalGamesPlayed:
        typeof parsed.totalGamesPlayed === "number" &&
        parsed.totalGamesPlayed >= 0
          ? Math.floor(parsed.totalGamesPlayed)
          : 0,
      totalCrossings:
        typeof parsed.totalCrossings === "number" && parsed.totalCrossings >= 0
          ? Math.floor(parsed.totalCrossings)
          : 0,
      unlockedLevels: Array.isArray(parsed.unlockedLevels)
        ? Array.from(
            new Set([
              1,
              ...parsed.unlockedLevels.filter(
                (n) => typeof n === "number" && n >= 1 && n <= 4,
              ),
            ]),
          )
        : [1],
      masterVolume:
        typeof parsed.masterVolume === "number"
          ? Math.min(1, Math.max(0, parsed.masterVolume))
          : 0.8,
      musicVolume:
        typeof parsed.musicVolume === "number"
          ? Math.min(1, Math.max(0, parsed.musicVolume))
          : 0.55,
      sfxVolume:
        typeof parsed.sfxVolume === "number"
          ? Math.min(1, Math.max(0, parsed.sfxVolume))
          : 0.85,
      musicEnabled:
        typeof parsed.musicEnabled === "boolean" ? parsed.musicEnabled : true,
      sfxEnabled:
        typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : true,
      textOnlyDialogue:
        typeof parsed.textOnlyDialogue === "boolean"
          ? parsed.textOnlyDialogue
          : false,
    };
  } catch {
    return { ...DEFAULT_SAVE_DATA };
  }
}

function persistSaveData(data) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, version: 1 }),
    );
  } catch {
    // Gracefully ignore storage quota or privacy mode restrictions
  }
}

// ============================================================================
// 2. LEVEL DEFINITIONS & BENGALI MEME DIALOGUE SYSTEM
// ============================================================================
const LEVELS = [
  {
    id: 1,
    bnTitle: "বেনাপোল – পেট্রাপোল জিরো লাইন",
    enTitle: "Benapole Border Checkpost",
    subtitle: "BGB Sentries, Customs Booms & Barbed Wire",
    locationTag: "INDIA → BANGLADESH ZERO LINE",
    targetDistance: 1000,
    baseSpeed: 335,
    maxSpeed: 545,
    skyTop: "#1D4ED8",
    skyBottom: "#93C5FD",
    groundTop: "#475569",
    groundDirt: "#78350F",
    hillColor: "#15803D",
    accentColor: "#FACC15",
    spawnRate: 1.0,
    guardSensitivity: 1.0,
    waterFrequency: 0.14,
    hasSearchlights: false,
    hasProjectiles: false,
    weather: "clear",
  },
  {
    id: 2,
    bnTitle: "ইছামতী – পদ্মা নদীপথ",
    enTitle: "Monsoon River Embankment",
    subtitle: "Flooded Canals, Boat Masts & River BGB",
    locationTag: "MONSOON RIVER BORDER",
    targetDistance: 1200,
    baseSpeed: 365,
    maxSpeed: 590,
    skyTop: "#0F172A",
    skyBottom: "#0284C7",
    groundTop: "#059669",
    groundDirt: "#5C3A21",
    hillColor: "#064E3B",
    accentColor: "#22D3EE",
    spawnRate: 1.14,
    guardSensitivity: 1.15,
    waterFrequency: 0.36,
    hasSearchlights: false,
    hasProjectiles: false,
    weather: "rain",
  },
  {
    id: 3,
    bnTitle: "সুন্দরবন রাতের টহল",
    enTitle: "Night Watchtower Trail",
    subtitle: "Sweeping Searchlights, Night Commandos & Branches",
    locationTag: "MIDNIGHT FOREST PATROL",
    targetDistance: 1400,
    baseSpeed: 375,
    maxSpeed: 575,
    skyTop: "#020617",
    skyBottom: "#1E293B",
    groundTop: "#14532D",
    groundDirt: "#27170A",
    hillColor: "#052E16",
    accentColor: "#A855F7",
    spawnRate: 1.26,
    guardSensitivity: 1.32,
    waterFrequency: 0.16,
    hasSearchlights: true,
    hasProjectiles: false,
    weather: "night",
  },
  {
    id: 4,
    bnTitle: "জনতার ব্যারিকেড ও সেনা প্রহরা",
    enTitle: "Army & People’s Uprising",
    subtitle: "BD Army, Protesting Crowds, CNGs & Flying Chappals!",
    locationTag: "FINAL BANGLADESH BORDER FORTRESS",
    targetDistance: 1650,
    baseSpeed: 400,
    maxSpeed: 605,
    skyTop: "#7C2D12",
    skyBottom: "#F59E0B",
    groundTop: "#334155",
    groundDirt: "#1E293B",
    hillColor: "#14532D",
    accentColor: "#EF4444",
    spawnRate: 1.4,
    guardSensitivity: 1.42,
    waterFrequency: 0.12,
    hasSearchlights: true,
    hasProjectiles: true,
    weather: "sunset",
  },
];

const DIALOGUES = {
  start: [
    "আমি আসতেছি!",
    "রাস্তা ছাড়ো!",
    "এবার ঢুকতেই হবে!",
    "কেউ আটকাতে পারবে না!",
  ],
  hit: [
    "আহারে! কী হইলো!",
    "এটা আবার কী!",
    "উফফ! ব্যথা পাইছি!",
    "কারা রাখছে এগুলা?!",
  ],
  obstacle: [
    "আহারে! কী হইলো!",
    "এটা আবার কী!",
    "উফফ! ব্যথা পাইছি!",
    "কারা রাখছে এগুলা?!",
  ],
  detect: [
    "ওই! কে ওখানে?",
    "আমারে চিনো না?",
    "ধুর! আবার ঝামেলা!",
    "চোখ বন্ধ রাখো!",
  ],
  detection: [
    "ওই! কে ওখানে?",
    "আমারে চিনো না?",
    "ধুর! আবার ঝামেলা!",
    "চোখ বন্ধ রাখো!",
  ],
  caught: [
    "সবগুলা রাজাকারের বাচ্চা!",
    "আবার ধরা খাইলাম!",
    "এইটা কী হইলো!",
    "আমার সাথে এমন কেন!",
  ],
  water: [
    "বাঁচাও!",
    "আমারে উঠাও!",
    "আমি সাঁতার জানি না!",
    "পানি এত ঠান্ডা কেন!",
  ],
  victory: ["জয় বাংলা!", "পৌঁছে গেছি!", "শেষ পর্যন্ত পারলাম!"],
  bonus: ["আহা! পদ্মার ইলিশ!", "এক কাপ চা হইলো!", "উন্নয়ন হচ্ছে!"],
  collectible: ["আহা! পদ্মার ইলিশ!", "এক কাপ চা হইলো!", "উন্নয়ন হচ্ছে!"],
};

const AUDIO_FILES_MAP: Record<string, string> = {
  // 1. Game Start (start)
  "আমি আসতেছি!": "Sheikh-Hasina-2026-11-24-22-56-আমি-আসতেছি!.mp3",
  "রাস্তা ছাড়ো!": "Sheikh-Hasina-2026-11-24-22-57-রাস্তা-ছাড়ো!.mp3",
  "এবার ঢুকতেই হবে!": "Sheikh-Hasina-2026-11-24-22-57-এবার-ঢুকতেই-হবে!.mp3",
  "কেউ আটকাতে পারবে না!":
    "Sheikh-Hasina-2026-11-24-22-58-কেউ-আটকাতে-পারবে-না!.mp3",

  // 2. Obstacle Collision (hit)
  "আহারে! কী হইলো!": "Sheikh-Hasina-2026-11-25-08-41-আহারে!-কী-হইলো!.mp3",
  "এটা আবার কী!": "Sheikh-Hasina-2026-11-25-08-41-এটা-আবার-কী!.mp3",
  "উফফ! ব্যথা পাইছি!": "Sheikh-Hasina-2026-11-25-08-42-উফফ!-ব্যথা-পাইছি!.mp3",
  "কারা রাখছে এগুলা?!": "Sheikh-Hasina-2026-11-25-08-42-কারা-রাখছে-এগুলা!.mp3",
  "কারা রাখছে এগুলা!": "Sheikh-Hasina-2026-11-25-08-42-কারা-রাখছে-এগুলা!.mp3",

  // 3. Guard Detection / Spotted (detect)
  "ওই! কে ওখানে?": "Sheikh-Hasina-2026-11-25-08-43-ওই!-কে-ওখানে.mp3",
  "আমারে চিনো না?": "Sheikh-Hasina-2026-11-25-08-43-আমারে-চিনো-না.mp3",
  "ধুর! আবার ঝামেলা!": "Sheikh-Hasina-2026-11-25-08-43-ধুর!-আবার-ঝামেলা!.mp3",
  "চোখ বন্ধ রাখো!": "Sheikh-Hasina-2026-11-25-08-44-চোখ-বন্ধ-রাখো!.mp3",

  // 4. Water / Canal Fall (water)
  "বাঁচাও!": "Sheikh-Hasina-2026-11-25-08-44-বাঁচাও!.mp3",
  "আমারে উঠাও!": "Sheikh-Hasina-2026-11-25-08-45-আমারে-উঠাও!.mp3",
  "আমি সাঁতার জানি না!":
    "Sheikh-Hasina-2026-11-25-08-45-আমি-সাঁতার-জানি-না!.mp3",
  "পানি এত ঠান্ডা কেন!":
    "Sheikh-Hasina-2026-11-25-08-46-পানি-এত-ঠান্ডা-কেন!.mp3",

  // 5. Bonus / Collectible Pickups (bonus)
  "আহা! পদ্মার ইলিশ!": "Sheikh-Hasina-2026-11-25-08-47-আহা!-পদ্দার-ইলিশ!.mp3",
  "আহা! পদ্দার ইলিশ!": "Sheikh-Hasina-2026-11-25-08-47-আহা!-পদ্দার-ইলিশ!.mp3",
  "এক কাপ চা হইলো!": "Sheikh-Hasina-2026-11-25-08-47-এক-কাপ-চা-হইলো!.mp3",
  "উন্নয়ন হচ্ছে!": "Sheikh-Hasina-2026-11-25-08-48-উন্নয়ন-হচ্ছে!.mp3",

  // 6. Getting Caught / Game Over (caught)
  "সবগুলা রাজাকারের বাচ্চা!":
    "Sheikh-Hasina-2026-11-25-08-48-সবগুলা-রাজাকারের-বাচ্চা!.mp3",
  "আবার ধরা খাইলাম!": "Sheikh-Hasina-2026-11-25-08-48-আবার-ধরা-খাইলাম!.mp3",
  "এইটা কী হইলো!": "Sheikh-Hasina-2026-11-25-08-49-এইটা-কী-হইলো!.mp3",
  "আমার সাথে এমন কেন!": "Sheikh-Hasina-2026-11-25-08-49-আমার-সাথে-এমন-কেন!.mp3",

  // 7. Victory / Border Crossed (victory)
  "জয় বাংলা!": "Sheikh-Hasina-2026-11-25-08-49-জয়-বাংলা!.mp3",
  "পৌঁছে গেছি!": "Sheikh-Hasina-2026-11-25-08-50-পৌঁছে-গেছি!.mp3",
  "শেষ পর্যন্ত পারলাম!":
    "Sheikh-Hasina-2026-11-25-08-50-শেষ-পর্যন্ত-পারলাম!.mp3",
};

const APA_AUDIO_BASE_PATHS = ["/apa-audio/", "apa-audio/", "/audio/", "audio/"];

// ============================================================================
// 3. PROCEDURAL WEB AUDIO ENGINE (AudioManager)
// ============================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.musicTimer = null;
    this.stepIndex = 0;
    this.settings = {
      masterVolume: 0.8,
      musicVolume: 0.55,
      sfxVolume: 0.85,
      musicEnabled: true,
      sfxEnabled: true,
    };
    this.isPlayingMusic = false;
    this.currentVoice = null;
    this.pendingVoice = null;
    this.voiceCache = {};
    this.resolvedBasePath = "/apa-audio/";
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.settings.musicEnabled && this.isPlayingMusic) {
      this.stopMusic();
    }
  }

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  getSfxGain() {
    if (!this.settings.sfxEnabled) return 0;
    return this.settings.masterVolume * this.settings.sfxVolume;
  }

  getMusicGain() {
    if (!this.settings.musicEnabled) return 0;
    return this.settings.masterVolume * this.settings.musicVolume;
  }

  playTone(
    freq,
    duration,
    type = "square",
    gainMult = 0.25,
    slideTo = null,
    delay = 0,
  ) {
    const vol = this.getSfxGain() * gainMult;
    if (vol <= 0.001) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, slideTo),
        now + duration,
      );
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playJump() {
    this.playTone(230, 0.18, "square", 0.22, 620);
  }

  playLand() {
    this.playTone(135, 0.09, "triangle", 0.24, 55);
  }

  playSlide() {
    this.playTone(320, 0.14, "sawtooth", 0.14, 120);
  }

  playStep() {
    this.playTone(110 + Math.random() * 25, 0.045, "triangle", 0.09, 65);
  }

  playCoin() {
    this.playTone(880, 0.08, "sine", 0.25, null, 0);
    this.playTone(1318.5, 0.14, "sine", 0.25, null, 0.06);
  }

  playStar() {
    this.playTone(587.33, 0.08, "triangle", 0.28, null, 0);
    this.playTone(880, 0.09, "triangle", 0.28, null, 0.07);
    this.playTone(1174.66, 0.18, "triangle", 0.3, null, 0.14);
  }

  playBonusMeme() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.1, "square", 0.2, null, i * 0.06);
    });
  }

  playBonk() {
    this.playTone(170, 0.22, "sawtooth", 0.35, 48);
    this.playTone(110, 0.25, "square", 0.25, 40, 0.03);
  }

  playSplash() {
    this.playTone(420, 0.18, "sawtooth", 0.25, 95, 0);
    this.playTone(260, 0.25, "triangle", 0.28, 60, 0.08);
    this.playTone(510, 0.15, "sine", 0.2, 180, 0.14);
  }

  playRadarBeep() {
    this.playTone(980, 0.07, "sine", 0.18, 1120);
  }

  playCapture() {
    const siren = [740, 520, 740, 520, 390, 260];
    siren.forEach((freq, i) => {
      this.playTone(freq, 0.14, "sawtooth", 0.28, freq * 0.85, i * 0.12);
    });
  }

  playVictory() {
    const fanfare = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.5, d: 0.28, t: 0.36 },
      { f: 783.99, d: 0.12, t: 0.66 },
      { f: 1046.5, d: 0.45, t: 0.8 },
    ];
    fanfare.forEach((n) => {
      this.playTone(n.f, n.d, "triangle", 0.32, null, n.t);
      this.playTone(n.f * 0.5, n.d, "square", 0.14, null, n.t);
    });
  }

  startMusic() {
    if (this.isPlayingMusic) return;
    this.unlock();
    this.isPlayingMusic = true;
    this.stepIndex = 0;

    // Upbeat Bangladeshi folk-arcade chiptune bass & lead groove
    const melody = [
      523.25, 0, 659.25, 783.99, 659.25, 523.25, 587.33, 0, 659.25, 587.33,
      523.25, 440.0, 523.25, 0, 392.0, 0, 523.25, 659.25, 783.99, 880.0, 783.99,
      659.25, 587.33, 659.25, 783.99, 0, 659.25, 587.33, 523.25, 0, 523.25, 0,
    ];
    const bass = [
      130.81, 130.81, 196.0, 196.0, 146.83, 146.83, 196.0, 196.0, 164.81,
      164.81, 220.0, 220.0, 130.81, 130.81, 196.0, 196.0,
    ];

    this.musicTimer = window.setInterval(() => {
      const mVol = this.getMusicGain();
      if (
        !this.isPlayingMusic ||
        mVol <= 0.001 ||
        !this.ctx ||
        this.ctx.state !== "running"
      ) {
        return;
      }

      const now = this.ctx.currentTime;
      const note = melody[this.stepIndex % melody.length];
      const bassNote = bass[this.stepIndex % bass.length];

      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(note, now);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(mVol * 0.14, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }

      if (bassNote > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = "sine";
        bOsc.frequency.setValueAtTime(bassNote, now);
        bGain.gain.setValueAtTime(0.001, now);
        bGain.gain.linearRampToValueAtTime(mVol * 0.18, now + 0.01);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.15);
      }

      this.stepIndex += 1;
    }, 175);
  }

  isVoicePlaying() {
    return Boolean(
      this.currentVoice &&
      !this.currentVoice.paused &&
      !this.currentVoice.ended,
    );
  }

  stopVoice() {
    this.pendingVoice = null;
    if (this.currentVoice) {
      try {
        this.currentVoice.pause();
        this.currentVoice.currentTime = 0;
      } catch {}
      this.currentVoice = null;
    }
  }

  queueOrPlayVoice(text: string, interrupt = false, onPlay?: () => void) {
    if (typeof window === "undefined") return;
    if (!this.settings.sfxEnabled || this.getSfxGain() <= 0.01) return;
    if (!AUDIO_FILES_MAP[text]) return;

    if (interrupt || !this.isVoicePlaying()) {
      this.pendingVoice = null;
      if (onPlay) onPlay();
      this.playParodyVoice(text);
    } else {
      // Let current voice finish naturally, then play the next category line
      this.pendingVoice = { text, onPlay };
    }
  }

  playParodyVoice(text: string) {
    if (typeof window === "undefined") return;
    if (!this.settings.sfxEnabled) return;
    const vol = this.getSfxGain();
    if (vol <= 0.01) return;
    const filename = AUDIO_FILES_MAP[text];
    if (!filename) return;

    try {
      const queued = this.pendingVoice;
      this.stopVoice();
      this.pendingVoice = queued;

      const candidateBases = [
        this.resolvedBasePath,
        ...APA_AUDIO_BASE_PATHS.filter((b) => b !== this.resolvedBasePath),
      ];

      const tryAttempt = (idx: number) => {
        if (idx >= candidateBases.length) return;
        const base = candidateBases[idx];
        const url = `${base}${encodeURIComponent(filename)}`;

        let audioObj = this.voiceCache[url];
        if (!audioObj) {
          audioObj = new Audio(url);
          audioObj.preload = "auto";
          this.voiceCache[url] = audioObj;
        } else {
          audioObj.currentTime = 0;
        }

        audioObj.volume = Math.min(1, Math.max(0, vol * 1.25));
        this.currentVoice = audioObj;

        audioObj.onended = () => {
          if (this.currentVoice === audioObj) {
            this.currentVoice = null;
            const next = this.pendingVoice;
            this.pendingVoice = null;
            if (next) {
              if (next.onPlay) next.onPlay();
              this.playParodyVoice(next.text);
            }
          }
        };

        const playPromise = audioObj.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.resolvedBasePath = base;
            })
            .catch(() => {
              if (this.currentVoice === audioObj) {
                this.currentVoice = null;
              }
              tryAttempt(idx + 1);
            });
        }
      };

      tryAttempt(0);
    } catch {}
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

const audio = new SoundEngine();

// ============================================================================
// 4. CUSTOM CARTOON CARICATURE RENDERER (SHEIKH HASINA - 11 STATES)
// ============================================================================
const APA_PALETTE = {
  outline: "#1a1a2e",
  skin: "#f0c090",
  skinShade: "#d4a070",
  sareeGreen: "#2eab4b",
  sareeGreenDark: "#1e8c3a",
  sareeBorder: "#e8611a",
  sareeBorderDark: "#c24e14",
  hairGray: "#b0b8c8",
  hairStreak: "#808898",
  bangleRed: "#cc2222",
  slipperPurple: "#6b4fa0",
  white: "#ffffff",
  pupil: "#111827",
  sweatCyan: "#22d3ee",
  waterBlue: "rgba(14, 165, 233, 0.78)",
  shieldGold: "#facc15",
};

function drawCaricatureSlipper(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Purple slipper — reference shows pointed-toe simple flat slipper
  ctx.fillStyle = APA_PALETTE.slipperPurple;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.quadraticCurveTo(2, -5, 14, -1);
  ctx.quadraticCurveTo(16, 2, 12, 5);
  ctx.lineTo(-5, 5);
  ctx.quadraticCurveTo(-8, 3, -6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawCaricatureArm(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  angle: number,
  isBackArm: boolean,
) {
  ctx.save();
  ctx.translate(shoulderX, shoulderY);
  ctx.rotate(angle);

  // Bare forearm — reference shows skin-toned thin arms
  ctx.fillStyle = isBackArm ? APA_PALETTE.skinShade : APA_PALETTE.skin;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(5, 16);
  ctx.lineTo(-3, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red bangle on wrist (prominent in reference)
  ctx.fillStyle = APA_PALETTE.bangleRed;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-3.5, 13, 9, 5, 2);
  ctx.fill();
  ctx.stroke();

  // Cartoon hand with splayed fingers (reference style: open hand with visible fingers)
  ctx.fillStyle = isBackArm ? APA_PALETTE.skinShade : APA_PALETTE.skin;
  ctx.lineWidth = 2;
  // Palm
  ctx.beginPath();
  ctx.arc(1, 22, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Three finger nubs fanning out
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-2, 19);
  ctx.lineTo(-5, 15); // thumb
  ctx.moveTo(4, 19);
  ctx.lineTo(8, 16);
  ctx.moveTo(5, 21);
  ctx.lineTo(9, 20);
  ctx.stroke();

  ctx.restore();
}

function drawCaricatureEyesAndGlasses(
  ctx: CanvasRenderingContext2D,
  state: string,
) {
  // In the reference, the character has very small squinting eyes behind thin glasses
  if (state === "caught") {
    // Dizzy X-eyes
    ctx.strokeStyle = APA_PALETTE.outline;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(7, -16);
    ctx.lineTo(12, -11);
    ctx.moveTo(12, -16);
    ctx.lineTo(7, -11);
    ctx.stroke();
  } else if (state === "shocked") {
    // Wide open eye
    ctx.fillStyle = APA_PALETTE.white;
    ctx.strokeStyle = APA_PALETTE.outline;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(10, -13.5, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = APA_PALETTE.pupil;
    ctx.beginPath();
    ctx.arc(11, -13.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Reference style: very squinty, almost closed slit-eye
    ctx.strokeStyle = APA_PALETTE.outline;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(6, -13);
    ctx.quadraticCurveTo(10, -15.5, 14, -13);
    ctx.stroke();
    // Tiny pupil dot below the slit
    ctx.fillStyle = APA_PALETTE.pupil;
    ctx.beginPath();
    ctx.arc(10.5, -12.8, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyebrow — reference shows a thick angled brow
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  if (state === "angry") {
    ctx.moveTo(5, -20);
    ctx.lineTo(14, -16);
  } else if (state === "shocked" || state === "caught") {
    ctx.moveTo(5, -20);
    ctx.quadraticCurveTo(10, -22.5, 15, -19);
  } else {
    ctx.moveTo(5, -18.5);
    ctx.quadraticCurveTo(10, -20, 14, -17.5);
  }
  ctx.stroke();

  // Thin-rimmed rectangular glasses (reference: small, sitting on nose bridge)
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(5, -17, 10, 6.5, 1.5);
  ctx.stroke();
  // Temple arm going back toward ear
  ctx.beginPath();
  ctx.moveTo(5, -14);
  ctx.lineTo(-8, -11);
  ctx.stroke();
}

function drawCaricatureMouth(ctx: CanvasRenderingContext2D, state: string) {
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2.2;

  if (state === "celebrating") {
    // Wide grin showing teeth
    ctx.fillStyle = APA_PALETTE.white;
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.quadraticCurveTo(14, 1, 16, 2);
    ctx.quadraticCurveTo(14, 8, 8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (
    state === "shocked" ||
    state === "caught" ||
    state === "swimming"
  ) {
    // Open yelling mouth
    ctx.fillStyle = "#882222";
    ctx.beginPath();
    ctx.ellipse(12, 5, 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (state === "angry") {
    // Gritted teeth
    ctx.fillStyle = APA_PALETTE.white;
    ctx.beginPath();
    ctx.roundRect(8, 2, 7, 4, 1.5);
    ctx.fill();
    ctx.stroke();
  } else {
    // Reference shows a small curved open slit — the character has a subtle grin
    ctx.fillStyle = APA_PALETTE.white;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.quadraticCurveTo(12, 1.5, 15, 3);
    ctx.quadraticCurveTo(13, 6, 8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

/**
 * Renders the cartoon caricature of Sheikh Hasina matching the reference image:
 * - Very round pot-belly torso silhouette
 * - Green saree with thick orange-red diagonal border stripes wrapping the belly
 * - Green hood (ghomta) with orange-red trim and gray hair peeking out
 * - Very large drooping rounded nose in side-profile
 * - Small squinting eyes behind tiny rectangular glasses
 * - Short stubby legs with purple pointed slippers
 * - Thin bare arms with red bangles
 */
function drawHasinaCaricature(ctx, x, y, time, state = "idle", options = {}) {
  const { scale = 1, facing = 1, hasShield = false, invuln = false } = options;

  ctx.save();
  if (invuln && Math.floor(time * 18) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);

  const isCrouched = state === "ducking" || state === "sliding";
  const isSwimming = state === "swimming";
  const isCaught = state === "caught";
  const isCelebrating = state === "celebrating";

  // Ground shadow
  if (!isSwimming) {
    ctx.fillStyle = "rgba(17, 24, 39, 0.25)";
    const shadowW =
      state === "sliding"
        ? 34
        : state === "jumping" || state === "falling"
          ? 16
          : 26;
    ctx.beginPath();
    ctx.ellipse(0, 0, shadowW, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const runCycle = time * 14;
  const bobY =
    state === "running"
      ? Math.abs(Math.sin(runCycle)) * -4
      : state === "idle"
        ? Math.sin(time * 3.5) * 1.5
        : isCelebrating
          ? Math.abs(Math.sin(time * 10)) * -10
          : isSwimming
            ? Math.sin(time * 8) * 3
            : 0;

  const torsoTilt =
    state === "sliding"
      ? -0.28
      : state === "ducking"
        ? 0.18
        : state === "running"
          ? 0.06
          : isCaught
            ? -0.12
            : 0;

  const crouchScaleY = isCrouched ? 0.68 : 1;
  const bodyBaseY = isCrouched ? -2 : bobY;

  // 1. Optional Cha Shield Aura
  if (hasShield) {
    const pulse = 1 + Math.sin(time * 8) * 0.06;
    ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
    ctx.lineWidth = 3;
    ctx.fillStyle = "rgba(250, 204, 21, 0.14)";
    ctx.beginPath();
    ctx.arc(0, -44 * crouchScaleY, 48 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 2. Purple Slippers (hidden when swimming)
  if (!isSwimming) {
    const leftStride =
      state === "running"
        ? Math.sin(runCycle) * 10
        : state === "jumping"
          ? -6
          : state === "sliding"
            ? 10
            : -3;
    const rightStride =
      state === "running"
        ? -Math.sin(runCycle) * 10
        : state === "jumping"
          ? 7
          : state === "sliding"
            ? 14
            : 4;
    const leftLift =
      state === "running" ? Math.max(0, -Math.sin(runCycle)) * 5 : 0;
    const rightLift =
      state === "running" ? Math.max(0, Math.sin(runCycle)) * 5 : 0;

    drawCaricatureSlipper(
      ctx,
      leftStride - 3,
      -3 - leftLift,
      state === "sliding" ? -0.3 : 0,
    );
    drawCaricatureSlipper(
      ctx,
      rightStride + 3,
      -2 - rightLift,
      state === "sliding" ? -0.2 : 0,
    );
  }

  // Apply posture transform around hip pivot
  ctx.save();
  ctx.translate(0, bodyBaseY);
  ctx.rotate(torsoTilt);
  ctx.scale(1, crouchScaleY);

  // === SHORT STUBBY LEGS visible under saree ===
  if (!isSwimming) {
    const legRun = state === "running" ? Math.sin(runCycle) * 0.5 : 0;
    // Left leg
    ctx.save();
    ctx.translate(-6, -10);
    ctx.rotate(legRun);
    ctx.fillStyle = APA_PALETTE.skin;
    ctx.strokeStyle = APA_PALETTE.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 14, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // Right leg
    ctx.save();
    ctx.translate(6, -10);
    ctx.rotate(-legRun);
    ctx.fillStyle = APA_PALETTE.skin;
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 14, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // === 3. BACK ARM ===
  const backArmAngle = isCelebrating
    ? -1.4 + Math.sin(time * 14) * 0.25
    : isCaught
      ? -1.2
      : isSwimming
        ? Math.sin(time * 12) * 0.6 - 0.5
        : state === "running"
          ? Math.sin(runCycle + Math.PI) * 0.35 - 0.4
          : -0.5;
  drawCaricatureArm(ctx, 12, -42, backArmAngle, true);

  // === 4. TORSO — Very Round Pot-Belly Silhouette (matching reference) ===
  // The reference shows an almost circular body with the belly bulging far forward
  ctx.lineWidth = 3;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.fillStyle = APA_PALETTE.sareeGreen;
  ctx.beginPath();
  ctx.moveTo(-16, -52);
  ctx.quadraticCurveTo(-24, -34, -22, -15); // left side curving out
  ctx.quadraticCurveTo(-18, -6, 0, -8); // bottom belly curve
  ctx.quadraticCurveTo(20, -8, 26, -18); // bottom right belly curve
  ctx.quadraticCurveTo(32, -28, 28, -38); // right side — big belly bulge forward
  ctx.quadraticCurveTo(24, -50, 10, -54); // top right shoulder
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Thick orange-red border stripe wrapping diagonally across upper torso/shoulder
  ctx.fillStyle = APA_PALETTE.sareeBorder;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-16, -48);
  ctx.quadraticCurveTo(-2, -52, 10, -54);
  ctx.lineTo(13, -50);
  ctx.quadraticCurveTo(-1, -47, -17, -43);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Thick orange-red border stripe wrapping diagonally across belly (lower)
  ctx.fillStyle = APA_PALETTE.sareeBorder;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-20, -26);
  ctx.quadraticCurveTo(5, -20, 28, -30);
  ctx.lineTo(29, -25);
  ctx.quadraticCurveTo(6, -15, -21, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom hem orange-red border stripe
  ctx.fillStyle = APA_PALETTE.sareeBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-21, -16);
  ctx.quadraticCurveTo(2, -9, 24, -16);
  ctx.lineTo(23, -11);
  ctx.quadraticCurveTo(2, -5, -20, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === 5. HEAD, GHOMTA, HAIR & FACE ===
  const headPitch =
    state === "shocked" || isCaught
      ? -0.14
      : state === "angry"
        ? 0.08
        : -0.04 + Math.sin(time * 7) * 0.03;

  ctx.save();
  ctx.translate(2, -60);
  ctx.scale(1.12, 1.12);
  ctx.rotate(headPitch);

  // --- Saree hood (ghomta) wrapping back/top of head ---
  ctx.fillStyle = APA_PALETTE.sareeGreen;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.quadraticCurveTo(-18, -26, -22, -8);
  ctx.quadraticCurveTo(-24, 4, -26, 12);
  ctx.quadraticCurveTo(-18, 15, -8, 12);
  ctx.quadraticCurveTo(-4, 4, 0, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- Thick orange-red hood border trim ---
  ctx.fillStyle = APA_PALETTE.sareeBorder;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -23);
  ctx.quadraticCurveTo(-6, -6, -4, 10);
  ctx.lineTo(-8, 11);
  ctx.quadraticCurveTo(-10, -5, -6, -22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- Gray hair visible inside hood ---
  ctx.fillStyle = APA_PALETTE.hairGray;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-2, -22);
  ctx.quadraticCurveTo(4, -24, 6, -18);
  ctx.quadraticCurveTo(2, -4, -1, 8);
  ctx.lineTo(-5, 9);
  ctx.quadraticCurveTo(-8, -4, -2, -22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hair streaks
  ctx.strokeStyle = APA_PALETTE.hairStreak;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-2, -18);
  ctx.quadraticCurveTo(-4, -6, -2, 4);
  ctx.moveTo(1, -20);
  ctx.quadraticCurveTo(-2, -8, 0, 3);
  ctx.stroke();

  // --- Caricature Face Profile ---
  // Reference: very flat forehead, HUGE drooping rounded nose, weak rounded chin
  ctx.fillStyle = APA_PALETTE.skin;
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, -22); // top of forehead
  ctx.quadraticCurveTo(10, -24, 14, -16); // brow ridge
  ctx.quadraticCurveTo(18, -14, 24, -13); // nose bridge start
  ctx.quadraticCurveTo(32, -12, 34, -6); // nose hump/bulge
  ctx.quadraticCurveTo(35, -2, 30, 0); // big rounded nose tip drooping DOWN
  ctx.quadraticCurveTo(26, 2, 20, 0); // under nose
  ctx.lineTo(16, -2); // philtrum
  ctx.quadraticCurveTo(17, 3, 15, 6); // upper lip / mouth area
  ctx.quadraticCurveTo(16, 11, 12, 13); // chin (weak, rounded)
  ctx.quadraticCurveTo(2, 16, -6, 10); // jawline
  ctx.quadraticCurveTo(-10, 2, -6, -12); // back cheek
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nostril bump
  ctx.fillStyle = APA_PALETTE.skinShade;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(28, -1, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Nasolabial crease line (from nose to mouth)
  ctx.strokeStyle = APA_PALETTE.outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(18, -1);
  ctx.quadraticCurveTo(14, 2, 12, 6);
  ctx.stroke();

  // Cheek crease
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.quadraticCurveTo(5, 5, 4, 9);
  ctx.stroke();

  drawCaricatureMouth(ctx, state);
  drawCaricatureEyesAndGlasses(ctx, state);

  ctx.restore(); // End head

  // === 6. FRONT ARM (resting on belly in idle/running) ===
  const frontArmAngle = isCelebrating
    ? -1.4 - Math.sin(time * 14) * 0.25
    : isCaught
      ? -0.9
      : isSwimming
        ? -Math.sin(time * 12) * 0.6 - 0.5
        : state === "running"
          ? Math.sin(runCycle) * 0.35 + 0.1
          : 0.15;
  drawCaricatureArm(ctx, -4, -40, frontArmAngle, false);

  ctx.restore(); // End hip pivot

  // 7. Swimming Water Splash Overlay
  if (isSwimming) {
    const wave = Math.sin(time * 12) * 3;
    ctx.fillStyle = APA_PALETTE.waterBlue;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-30, -14);
    ctx.quadraticCurveTo(-15, -20 + wave, 0, -14);
    ctx.quadraticCurveTo(15, -8 - wave, 30, -14);
    ctx.lineTo(30, 2);
    ctx.lineTo(-30, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 8. Sweat Drops when Shocked / Caught
  if (state === "shocked" || isCaught) {
    const dropY = (time * 28) % 12;
    ctx.fillStyle = APA_PALETTE.sweatCyan;
    ctx.strokeStyle = APA_PALETTE.outline;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-24, -76 + dropY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22, -82 + dropY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================================
// 5. ENVIRONMENT, OBSTACLE & COLLECTIBLE RENDERERS
// ============================================================================
function drawBackground(ctx, width, height, groundY, cameraX, level, time) {
  // Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, level.skyTop);
  skyGrad.addColorStop(1, level.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  // Level-specific Celestial Body & Sky Atmosphere
  ctx.save();
  if (level.id === 3) {
    // Starry midnight sky & glowing moon
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    for (let s = 0; s < 36; s++) {
      const sx = (((s * 173 - cameraX * 0.03) % width) + width) % width;
      const sy = 18 + ((s * 89) % Math.max(80, groundY * 0.55));
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * 2.5 + s));
      ctx.globalAlpha = twinkle;
      ctx.fillRect(sx, sy, s % 3 === 0 ? 2.5 : 1.5, s % 3 === 0 ? 2.5 : 1.5);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.17, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(248,250,252,0.14)";
    ctx.beginPath();
    ctx.arc(
      width * 0.82,
      height * 0.17,
      48 + Math.sin(time * 2) * 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else {
    // Sun (warm gold for L1, pale storm glow for L2, fiery red-orange for L4)
    const sunColor =
      level.id === 4 ? "#FB923C" : level.id === 2 ? "#BAE6FD" : "#FACC15";
    const glowColor =
      level.id === 4
        ? "rgba(239, 68, 68, 0.28)"
        : level.id === 2
          ? "rgba(186, 230, 253, 0.16)"
          : "rgba(250, 204, 21, 0.24)";
    ctx.fillStyle = sunColor;
    ctx.beginPath();
    ctx.arc(
      width * 0.82,
      height * (level.id === 4 ? 0.28 : 0.18),
      level.id === 4 ? 44 : 34,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(
      width * 0.82,
      height * (level.id === 4 ? 0.28 : 0.18),
      60 + Math.sin(time * 2) * 5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Parallax Layer 1: Drifting Clouds
  ctx.fillStyle =
    level.id === 3
      ? "rgba(148, 163, 184, 0.16)"
      : level.id === 2
        ? "rgba(148, 163, 184, 0.45)"
        : level.id === 4
          ? "rgba(254, 215, 170, 0.4)"
          : "rgba(255, 255, 255, 0.85)";
  for (let i = 0; i < 6; i++) {
    const cx =
      ((((i * 290 - cameraX * 0.12 - time * 14) % (width + 260)) +
        (width + 260)) %
        (width + 260)) -
      130;
    const cy = 50 + (i % 3) * 36;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.arc(cx + 20, cy - 6, 26, 0, Math.PI * 2);
    ctx.arc(cx + 44, cy, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant Landmark Silhouette per Level
  ctx.save();
  if (level.id === 2) {
    // Distant Padma-style Truss Bridge on the horizon!
    ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
    ctx.lineWidth = 3;
    const bridgeY = groundY - 54;
    ctx.beginPath();
    ctx.moveTo(0, bridgeY);
    ctx.lineTo(width, bridgeY);
    ctx.stroke();
    const span = 140;
    const bOffset = -(cameraX * 0.18) % span;
    for (let bx = bOffset - span; bx < width + span; bx += span) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
      ctx.fillRect(bx - 4, bridgeY, 8, 54);
      ctx.beginPath();
      ctx.moveTo(bx, bridgeY);
      ctx.lineTo(bx + span * 0.5, bridgeY - 24);
      ctx.lineTo(bx + span, bridgeY);
      ctx.stroke();
    }
  } else if (level.id === 4) {
    // Distant City / Flyover Skyline
    const bSpan = 95;
    const bOff = -(cameraX * 0.2) % bSpan;
    for (let i = -1; i < Math.ceil(width / bSpan) + 2; i++) {
      const bx = i * bSpan + bOff;
      const bh =
        46 + ((Math.abs(i + Math.floor((cameraX * 0.2) / bSpan)) * 37) % 68);
      ctx.fillStyle = "rgba(30, 41, 59, 0.55)";
      ctx.fillRect(bx, groundY - bh, bSpan - 10, bh);
    }
  }
  ctx.restore();

  // Parallax Layer 2: Hills / Mangrove / Distant Trees
  ctx.fillStyle = level.hillColor;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= width + 80; x += 80) {
    const worldSample = x + cameraX * 0.14;
    const hillH =
      (level.id === 3 ? 52 : 36) +
      Math.sin(worldSample * 0.0045) * 22 +
      Math.cos(worldSample * 0.009) * 14;
    ctx.lineTo(x, groundY - hillH);
  }
  ctx.lineTo(width, groundY);
  ctx.closePath();
  ctx.fill();

  // Mid-Background Scenery Specific to Each Location
  const spacing = 340;
  const startIdx = Math.floor((cameraX * 0.26) / spacing) - 1;
  const endIdx = startIdx + Math.ceil(width / spacing) + 3;

  for (let idx = startIdx; idx <= endIdx; idx++) {
    const hx = idx * spacing - cameraX * 0.26;

    if (level.id === 1) {
      // Benapole-Petrapole: Border Fence Line + Customs Checkpost Sheds + Banyan/Palm
      ctx.strokeStyle = "rgba(51, 65, 85, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, groundY - 26);
      ctx.lineTo(hx + spacing, groundY - 26);
      ctx.moveTo(hx, groundY - 18);
      ctx.lineTo(hx + spacing, groundY - 18);
      ctx.stroke();
      ctx.fillStyle = "#475569";
      ctx.fillRect(hx + 10, groundY - 32, 4, 32);

      if (Math.abs(idx) % 2 === 0) {
        // Customs Shed
        ctx.fillStyle = "#E2E8F0";
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 2;
        ctx.fillRect(hx + 60, groundY - 52, 74, 38);
        ctx.strokeRect(hx + 60, groundY - 52, 74, 38);
        ctx.fillStyle = "#16A34A";
        ctx.fillRect(hx + 56, groundY - 62, 82, 12);
        ctx.strokeRect(hx + 56, groundY - 62, 82, 12);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CUSTOMS", hx + 97, groundY - 53);
      } else {
        // Border Pillar in background
        ctx.fillStyle = "#F8FAFC";
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 2;
        ctx.fillRect(hx + 140, groundY - 36, 14, 24);
        ctx.strokeRect(hx + 140, groundY - 36, 14, 24);
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(hx + 140, groundY - 36, 14, 6);
      }
    } else if (level.id === 2) {
      // River Route: Country Boats with Lanterns & Coconut Trees
      ctx.strokeStyle = "#78350F";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(hx + 30, groundY - 12);
      ctx.quadraticCurveTo(hx + 40, groundY - 65, hx + 24, groundY - 112);
      ctx.stroke();
      ctx.strokeStyle = "#065F46";
      ctx.lineWidth = 3.5;
      for (let f = -2; f <= 2; f++) {
        ctx.beginPath();
        ctx.moveTo(hx + 24, groundY - 112);
        ctx.quadraticCurveTo(
          hx + 24 + f * 18,
          groundY - 126,
          hx + 24 + f * 28,
          groundY - 96,
        );
        ctx.stroke();
      }
      if (Math.abs(idx) % 2 === 0) {
        const boatY = groundY - 18 + Math.sin(time * 2.5 + idx) * 2.5;
        ctx.fillStyle = "#78350F";
        ctx.beginPath();
        ctx.moveTo(hx + 110, boatY);
        ctx.quadraticCurveTo(hx + 145, boatY + 12, hx + 185, boatY);
        ctx.lineTo(hx + 172, boatY - 8);
        ctx.lineTo(hx + 122, boatY - 8);
        ctx.closePath();
        ctx.fill();
        // Lantern glow
        ctx.fillStyle = "#FACC15";
        ctx.beginPath();
        ctx.arc(hx + 148, boatY - 14, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (level.id === 3) {
      // Night Forest: Tall BGB Watchtowers & Dense Trees
      ctx.fillStyle = "#052E16";
      ctx.beginPath();
      ctx.arc(hx + 40, groundY - 52, 34, 0, Math.PI * 2);
      ctx.arc(hx + 68, groundY - 46, 28, 0, Math.PI * 2);
      ctx.fill();

      if (Math.abs(idx) % 2 === 0) {
        // Watchtower Silhouette
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(hx + 150, groundY - 14);
        ctx.lineTo(hx + 162, groundY - 128);
        ctx.moveTo(hx + 188, groundY - 14);
        ctx.lineTo(hx + 176, groundY - 128);
        ctx.stroke();
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(hx + 152, groundY - 150, 34, 22);
        // Glowing red beacon
        ctx.fillStyle = Math.sin(time * 6 + idx) > 0 ? "#EF4444" : "#7F1D1D";
        ctx.beginPath();
        ctx.arc(hx + 169, groundY - 156, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (level.id === 4) {
      // People's Uprising: Protest Banners, BD Flags & Street Lamps
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(hx + 30, groundY - 110, 5, 98);
      // Waving BD Flag
      const fWave = Math.sin(time * 7 + idx) * 3;
      ctx.fillStyle = "#006A4E";
      ctx.fillRect(hx + 35, groundY - 108, 36, 22 + fWave * 0.2);
      ctx.fillStyle = "#F42A41";
      ctx.beginPath();
      ctx.arc(hx + 51, groundY - 97, 6.5, 0, Math.PI * 2);
      ctx.fill();

      if (Math.abs(idx) % 2 === 0) {
        // Background Protest Banner
        ctx.fillStyle = "#FEF08A";
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 2;
        ctx.fillRect(hx + 115, groundY - 64, 96, 26);
        ctx.strokeRect(hx + 115, groundY - 64, 96, 26);
        ctx.fillStyle = "#DC2626";
        ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText("সীমান্তে পাহারা!", hx + 163, groundY - 47);
      }
    }
  }

  // Horizon Grass / Wall Strip
  ctx.fillStyle =
    level.id === 4 ? "#475569" : level.id === 3 ? "#064E3B" : "#22C55E";
  ctx.fillRect(0, groundY - 12, width, 12);

  // Weather Overlays (Rain for L2, Fireflies for L3, Embers for L4)
  if (level.weather === "rain") {
    ctx.save();
    ctx.strokeStyle = "rgba(186, 230, 253, 0.22)";
    ctx.lineWidth = 1.3;
    for (let r = 0; r < 30; r++) {
      const rx =
        (((r * 113 - time * 110 - cameraX * 0.25) % width) + width) % width;
      const ry = (r * 73 + time * 340) % groundY;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 5, ry + 14);
      ctx.stroke();
    }
    ctx.restore();
  } else if (level.weather === "night") {
    ctx.save();
    for (let f = 0; f < 16; f++) {
      const fx =
        (((f * 139 + Math.sin(time * 1.5 + f) * 30 - cameraX * 0.4) % width) +
          width) %
        width;
      const fy = groundY - 25 - ((f * 47) % 120) + Math.cos(time * 2 + f) * 10;
      ctx.fillStyle = `rgba(163, 230, 53, ${0.35 + 0.55 * Math.abs(Math.sin(time * 4 + f))})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (level.weather === "sunset") {
    ctx.save();
    for (let e = 0; e < 18; e++) {
      const ex =
        (((e * 127 - time * 75 - cameraX * 0.35) % width) + width) % width;
      const ey = groundY - ((e * 53 + time * 45) % 160);
      ctx.fillStyle = "rgba(251, 146, 60, 0.55)";
      ctx.beginPath();
      ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawGroundWithGaps(
  ctx,
  width,
  height,
  groundY,
  cameraX,
  level,
  waterGaps,
  time,
) {
  // Base dirt / road layer
  ctx.fillStyle = level.groundDirt;
  ctx.fillRect(0, groundY, width, height - groundY);

  // Top surface strip
  ctx.fillStyle = level.groundTop;
  ctx.fillRect(0, groundY, width, 15);

  if (level.id === 1 || level.id === 4) {
    // Border Highway / Asphalt markings (wide, low-contrast to avoid strobing)
    ctx.fillStyle =
      level.id === 1 ? "rgba(255, 255, 255, 0.42)" : "rgba(250, 204, 21, 0.48)";
    const dashW = 72;
    const gapW = 78;
    const period = dashW + gapW;
    const offset = -(cameraX % period);
    for (let x = offset; x < width; x += period) {
      ctx.fillRect(x, groundY + 26, dashW, 4);
    }
    if (level.id === 1) {
      // Soft wide Border Kerb Stripes
      const kerbW = 72;
      const kOff = -(cameraX % (kerbW * 2));
      for (let x = kOff; x < width; x += kerbW * 2) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.72)";
        ctx.fillRect(x, groundY, kerbW, 4);
        ctx.fillStyle = "rgba(226, 232, 240, 0.72)";
        ctx.fillRect(x + kerbW, groundY, kerbW, 4);
      }
    }
  } else if (level.id === 2) {
    // Muddy Embankment with Wooden Planks
    const plankPeriod = 90;
    const offset = -(cameraX % plankPeriod);
    ctx.fillStyle = "#92400E";
    for (let x = offset; x < width; x += plankPeriod) {
      ctx.fillRect(x, groundY + 4, 34, 8);
    }
  } else if (level.id === 3) {
    // Forest dirt trail with pebbles/roots
    const rootPeriod = 110;
    const offset = -(cameraX % rootPeriod);
    ctx.fillStyle = "#451A03";
    for (let x = offset; x < width; x += rootPeriod) {
      ctx.fillRect(x, groundY + 18, 28, 5);
    }
  }

  // Render Water Canal Gaps
  waterGaps.forEach((gap) => {
    const sx = gap.x - cameraX;
    if (sx + gap.width < -50 || sx > width + 50) return;

    ctx.fillStyle = level.id === 3 ? "#0F172A" : "#0284C7";
    ctx.fillRect(sx, groundY - 2, gap.width, height - groundY + 4);

    const wGrad = ctx.createLinearGradient(0, groundY + 8, 0, height);
    wGrad.addColorStop(0, level.id === 3 ? "#1E293B" : "#22D3EE");
    wGrad.addColorStop(1, "#0F172A");
    ctx.fillStyle = wGrad;
    ctx.fillRect(sx, groundY + 10, gap.width, height - groundY);

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let wx = 0; wx <= gap.width; wx += 12) {
      const wy = groundY + 12 + Math.sin(time * 8 + wx * 0.15) * 3;
      if (wx === 0) ctx.moveTo(sx + wx, wy);
      else ctx.lineTo(sx + wx, wy);
    }
    ctx.stroke();

    ctx.fillStyle = "#78350F";
    ctx.fillRect(sx - 6, groundY, 8, height - groundY);
    ctx.fillRect(sx + gap.width - 2, groundY, 8, height - groundY);
  });
}

function drawIndiaStartGate(ctx, startX, cameraX, groundY) {
  const sx = startX - cameraX;
  if (sx < -220 || sx > 600) return;
  ctx.save();
  ctx.fillStyle = "#F97316";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.5;
  ctx.fillRect(sx - 6, groundY - 125, 8, 125);
  ctx.strokeRect(sx - 6, groundY - 125, 8, 125);

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(sx - 56, groundY - 160, 114, 38, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#EA580C";
  ctx.fillRect(sx - 54, groundY - 158, 110, 8);
  ctx.fillStyle = "#16A34A";
  ctx.fillRect(sx - 54, groundY - 132, 110, 8);

  ctx.fillStyle = "#111827";
  ctx.font = "900 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("INDIA BORDER", sx + 1, groundY - 137);
  ctx.restore();
}

function drawObstacle(ctx, obs, cameraX, groundY, time) {
  const sx = obs.x - cameraX;
  ctx.save();

  if (obs.type === "fence") {
    const w = obs.width;
    const h = obs.height;
    const topY = groundY - h;

    ctx.fillStyle = "#475569";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.fillRect(sx + 4, topY, 6, h);
    ctx.strokeRect(sx + 4, topY, 6, h);
    ctx.fillRect(sx + w - 10, topY, 6, h);
    ctx.strokeRect(sx + w - 10, topY, 6, h);

    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 2;
    for (let wy = topY + 8; wy < groundY - 4; wy += 12) {
      ctx.beginPath();
      ctx.moveTo(sx, wy);
      ctx.lineTo(sx + w, wy);
      ctx.stroke();
    }
    ctx.strokeStyle = "#EF4444";
    ctx.beginPath();
    for (let bx = sx; bx <= sx + w; bx += 10) {
      ctx.moveTo(bx - 3, topY - 4);
      ctx.lineTo(bx + 3, topY + 4);
      ctx.moveTo(bx + 3, topY - 4);
      ctx.lineTo(bx - 3, topY + 4);
    }
    ctx.stroke();
  } else if (obs.type === "high_beam") {
    const w = obs.width;
    const beamBottom = groundY - obs.clearance;
    const beamTop = beamBottom - obs.height;

    ctx.fillStyle = "#334155";
    ctx.fillRect(sx - 6, beamTop - 20, 8, groundY - (beamTop - 20));
    ctx.fillRect(sx + w - 2, beamTop - 20, 8, groundY - (beamTop - 20));

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.fillRect(sx, beamTop, w, obs.height);
    ctx.strokeRect(sx, beamTop, w, obs.height);

    ctx.fillStyle = "#EF4444";
    for (let bx = sx + 6; bx < sx + w - 10; bx += 22) {
      ctx.fillRect(bx, beamTop + 2, 11, obs.height - 4);
    }

    ctx.fillStyle = "#FACC15";
    ctx.fillRect(sx + w / 2 - 24, beamTop - 16, 48, 15);
    ctx.strokeRect(sx + w / 2 - 24, beamTop - 16, 48, 15);
    ctx.fillStyle = "#111827";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DUCK ↓", sx + w / 2, beamTop - 5);
  } else if (obs.type === "barricade") {
    const w = obs.width;
    const h = obs.height;
    const topY = groundY - h;

    ctx.fillStyle = "#FACC15";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sx, topY, w, h - 8, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#111827";
    for (let bx = sx + 8; bx < sx + w - 12; bx += 18) {
      ctx.fillRect(bx, topY + 6, 8, h - 20);
    }

    ctx.fillStyle = "#475569";
    ctx.fillRect(sx + 6, groundY - 10, 6, 10);
    ctx.fillRect(sx + w - 12, groundY - 10, 6, 10);
  } else if (obs.type === "tea_cart") {
    const w = obs.width;
    const h = obs.height;
    const topY = groundY - h;

    ctx.fillStyle = "#2563EB";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(sx, topY + 12, w, h - 22, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#EF4444";
    ctx.fillRect(sx - 4, topY, w + 8, 12);
    ctx.strokeRect(sx - 4, topY, w + 8, 12);

    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(sx + 14, groundY - 7, 7, 0, Math.PI * 2);
    ctx.arc(sx + w - 14, groundY - 7, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (obs.type === "cng_cart") {
    // Bangladeshi Green CNG Auto-Rickshaw!
    const w = obs.width;
    const h = obs.height;
    const topY = groundY - h;

    ctx.fillStyle = "#16A34A";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sx, topY + 14, w, h - 22, 8);
    ctx.fill();
    ctx.stroke();

    // Black/Green Canopy Top
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.roundRect(sx + 6, topY, w - 12, 18, [8, 8, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Windshield & Headlight
    ctx.fillStyle = "#BAE6FD";
    ctx.fillRect(sx + 4, topY + 16, 12, 12);
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.arc(sx + 2, topY + 30, 4, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(sx + 13, groundY - 7, 7, 0, Math.PI * 2);
    ctx.arc(sx + w - 13, groundY - 7, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (obs.type === "crowd_barricade") {
    // Protesting Bangladeshi Citizens Human-Chain Barricade!
    const w = obs.width;
    const h = obs.height;
    const count = 2;
    const spacing = w / count;

    for (let i = 0; i < count; i++) {
      const px = sx + spacing * 0.5 + i * spacing;
      const bounce = Math.abs(Math.sin(time * 9 + i * 1.4)) * -4;

      ctx.save();
      ctx.translate(px, groundY + bounce);

      // Legs
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(-7, -20, 6, 20);
      ctx.fillRect(1, -20, 6, 20);

      // Shirt (Red / Green / White)
      ctx.fillStyle = i % 2 === 0 ? "#DC2626" : "#059669";
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-10, -44, 20, 26, 4);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = "#FDBA74";
      ctx.beginPath();
      ctx.arc(0, -53, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Raised Fist / Placard
      ctx.fillStyle = "#FEF08A";
      ctx.fillRect(-16, -80, 32, 16);
      ctx.strokeRect(-16, -80, 32, 16);
      ctx.fillStyle = "#DC2626";
      ctx.font = "bold 8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(i === 0 ? "NO ENTRY" : "ফিরে যাও!", 0, -69);

      ctx.restore();
    }
  }

  ctx.restore();
}

function drawGuard(ctx, guard, cameraX, groundY, time) {
  const sx = guard.x - cameraX;
  ctx.save();

  const isArmy = guard.role === "army";
  const isProtester = guard.role === "protester";

  // Sweeping Vision Cone
  const coneLength = guard.visionRange;
  const coneDir = guard.facing;
  const sweepAngle = Math.sin(time * (isArmy ? 3.2 : 2.6) + guard.phase) * 0.16;

  ctx.save();
  ctx.translate(sx, groundY - 56);
  ctx.rotate(sweepAngle);

  const grad = ctx.createLinearGradient(0, 0, coneDir * coneLength, 0);
  if (guard.alerted) {
    grad.addColorStop(0, "rgba(239, 68, 68, 0.56)");
    grad.addColorStop(1, "rgba(239, 68, 68, 0.03)");
  } else if (isArmy) {
    grad.addColorStop(0, "rgba(249, 115, 22, 0.45)");
    grad.addColorStop(1, "rgba(249, 115, 22, 0.02)");
  } else {
    grad.addColorStop(0, "rgba(250, 204, 21, 0.42)");
    grad.addColorStop(1, "rgba(250, 204, 21, 0.02)");
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(coneDir * coneLength, -42);
  ctx.lineTo(coneDir * coneLength, 48);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Defender Body (BGB / Bangladesh Army / Protester)
  ctx.translate(sx, groundY);
  ctx.scale(guard.facing, 1);

  const walkBob = Math.abs(Math.sin(time * 8 + guard.phase)) * -3;
  ctx.translate(0, walkBob);

  // Legs
  ctx.fillStyle = isArmy ? "#365314" : isProtester ? "#1E293B" : "#14532D";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.fillRect(-10, -24, 8, 24);
  ctx.strokeRect(-10, -24, 8, 24);
  ctx.fillRect(2, -24, 8, 24);
  ctx.strokeRect(2, -24, 8, 24);

  // Uniform / Shirt
  ctx.fillStyle = isArmy ? "#4D7C0F" : isProtester ? "#DC2626" : "#15803D";
  ctx.beginPath();
  ctx.roundRect(-14, -56, 28, 34, 5);
  ctx.fill();
  ctx.stroke();

  if (isArmy) {
    // Camo patches + Tactical Vest
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(-11, -54, 22, 18);
  }

  // Belt
  ctx.fillStyle = "#111827";
  ctx.fillRect(-14, -34, 28, 5);

  // Head
  ctx.fillStyle = "#FDBA74";
  ctx.beginPath();
  ctx.arc(0, -68, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mustache
  ctx.fillStyle = "#111827";
  ctx.fillRect(2, -65, 9, 3);

  if (isArmy) {
    // Army Combat Helmet
    ctx.fillStyle = "#365314";
    ctx.beginPath();
    ctx.arc(0, -72, 13, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } else if (isProtester) {
    // Red-Green Headband
    ctx.fillStyle = "#006A4E";
    ctx.fillRect(-12, -76, 24, 5);
    ctx.fillStyle = "#F42A41";
    ctx.beginPath();
    ctx.arc(0, -73.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // BGB Maroon Beret / Cap
    ctx.fillStyle = "#881337";
    ctx.beginPath();
    ctx.arc(0, -73, 12, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, -74, 15, 3.5);
  }

  // Role Label Tag above defender
  ctx.save();
  ctx.scale(guard.facing, 1);
  ctx.fillStyle = isArmy ? "#F97316" : isProtester ? "#EF4444" : "#22C55E";
  ctx.font = "900 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isArmy ? "ARMY" : isProtester ? "জনতা" : "BGB", 0, -86);
  ctx.restore();

  // Flashlight / Megaphone
  ctx.fillStyle = "#334155";
  ctx.fillRect(10, -48, 14, 6);

  if (guard.alerted) {
    ctx.scale(guard.facing, 1);
    ctx.fillStyle = "#EF4444";
    ctx.font = "900 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", 0, -100 + Math.sin(time * 20) * 3);
  }

  ctx.restore();
}

function drawSearchlights(ctx, searchlights, cameraX, groundY, time) {
  searchlights.forEach((sl) => {
    const sx = sl.x - cameraX;
    if (sx < -260 || sx > 1600) return;

    const beamX = sx + Math.sin(time * sl.speed + sl.phase) * sl.sweepRange;
    ctx.save();
    const grad = ctx.createLinearGradient(sx, 0, beamX, groundY);
    grad.addColorStop(
      0,
      sl.alerted ? "rgba(239, 68, 68, 0.34)" : "rgba(250, 204, 21, 0.24)",
    );
    grad.addColorStop(
      1,
      sl.alerted ? "rgba(239, 68, 68, 0.12)" : "rgba(250, 204, 21, 0.05)",
    );
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sx - 12, 0);
    ctx.lineTo(sx + 12, 0);
    ctx.lineTo(beamX + 46, groundY);
    ctx.lineTo(beamX - 46, groundY);
    ctx.closePath();
    ctx.fill();

    // Ground hotspot oval
    ctx.fillStyle = sl.alerted
      ? "rgba(239, 68, 68, 0.38)"
      : "rgba(250, 204, 21, 0.25)";
    ctx.beginPath();
    ctx.ellipse(beamX, groundY + 2, 46, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawProjectile(ctx, proj, cameraX, groundY, time) {
  const sx = proj.x - cameraX;
  const sy = groundY - proj.yOffset;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(time * 12);

  // Flying Chappal / Slipper!
  ctx.fillStyle = "#DC2626";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#FACC15";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, -3);
  ctx.lineTo(4, 0);
  ctx.lineTo(-6, 3);
  ctx.stroke();
  ctx.restore();
}

function drawFloatingTexts(ctx, floatingTexts, cameraX, groundY) {
  floatingTexts.forEach((ft) => {
    const sx = ft.x - cameraX;
    const sy = groundY - ft.yOffset;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
    ctx.font = '900 15px "Rubik", "Hind Siliguri", sans-serif';
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#111827";
    ctx.strokeText(ft.text, sx, sy);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, sx, sy);
    ctx.restore();
  });
}

function drawCollectible(ctx, item, cameraX, time) {
  if (item.collected) return;
  const sx = item.x - cameraX;
  const floatY = item.y + Math.sin(time * 6 + item.x * 0.05) * 6;

  ctx.save();
  ctx.translate(sx, floatY);

  if (item.type === "coin") {
    // Golden Taka Coin
    const spinW = Math.max(
      5,
      Math.abs(Math.cos(time * 5 + item.x * 0.02)) * 14,
    );
    ctx.fillStyle = "#FACC15";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, spinW, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (spinW > 8) {
      ctx.fillStyle = "#92400E";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("৳", 0, 1);
    }
  } else if (item.type === "star") {
    // Bonus Star
    ctx.rotate(Math.sin(time * 4) * 0.2);
    ctx.fillStyle = "#22D3EE";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const a2 = a1 + Math.PI / 5;
      const r1 = 16;
      const r2 = 7;
      if (i === 0) ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
      else ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
      ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (item.type === "hilsa") {
    // Hilsa Fish (ইলিশ) - Reduces Detection!
    ctx.fillStyle = "#E2E8F0";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 9, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-18, 2);
    ctx.lineTo(-27, -6);
    ctx.lineTo(-25, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Eye
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(12, -2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === "cha") {
    // Cup of Cha (চা) - Speed & Shield Boost!
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-10, -8, 20, 18, [2, 2, 8, 8]);
    ctx.fill();
    ctx.stroke();
    // Tea liquid
    ctx.fillStyle = "#D97706";
    ctx.fillRect(-8, -6, 16, 4);
    // Steam
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.quadraticCurveTo(-7, -17, -3, -22);
    ctx.moveTo(4, -12);
    ctx.quadraticCurveTo(7, -17, 3, -22);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBorderGate(ctx, gateX, cameraX, groundY, level, time) {
  const sx = gateX - cameraX;
  ctx.save();

  // Checkered Finish Line on ground
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#FFFFFF" : "#111827";
      ctx.fillRect(sx - 20 + col * 10, groundY + row * 8, 10, 8);
    }
  }

  // Grand Border Archway Pillars
  ctx.fillStyle = "#16A34A";
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.fillRect(sx - 16, groundY - 175, 22, 175);
  ctx.strokeRect(sx - 16, groundY - 175, 22, 175);

  ctx.fillRect(sx + 54, groundY - 175, 22, 175);
  ctx.strokeRect(sx + 54, groundY - 175, 22, 175);

  // Top Banner
  ctx.fillStyle = "#EF4444";
  ctx.beginPath();
  ctx.roundRect(sx - 36, groundY - 215, 132, 46, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FACC15";
  ctx.font = '900 15px "Hind Siliguri", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("বাংলাদেশ সীমান্ত", sx + 30, groundY - 194);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("FINISH GATE", sx + 30, groundY - 178);

  // Waving Bangladeshi Flag on Top
  const wave = Math.sin(time * 8) * 4;
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx + 30, groundY - 215);
  ctx.lineTo(sx + 30, groundY - 268);
  ctx.stroke();

  ctx.fillStyle = "#006A4E";
  ctx.fillRect(sx + 31, groundY - 266, 46, 28 + wave * 0.3);
  ctx.fillStyle = "#F42A41";
  ctx.beginPath();
  ctx.arc(sx + 51, groundY - 252 + wave * 0.15, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// 6. MAIN MENU LIVE ANIMATED PREVIEW CANVAS
// ============================================================================
function MenuBackdropCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let startTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = (now) => {
      const t = (now - startTime) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const isMobile = w < 768;
      const groundY = isMobile ? h * 0.42 : h * 0.78;

      ctx.clearRect(0, 0, w, h);
      drawBackground(ctx, w, h, groundY, t * 75, LEVELS[0], t);
      drawGroundWithGaps(ctx, w, h, groundY, t * 75, LEVELS[0], [], t);

      // Draw animated Sheikh Hasina waving/idling clearly visible on both mobile and desktop
      const charX = isMobile ? w * 0.46 : w * 0.22;
      const pose = Math.sin(t * 1.4) > 0.45 ? "celebrating" : "idle";
      drawHasinaCaricature(ctx, charX, groundY, t, pose, {
        scale: isMobile ? 1.08 : 1.45,
        facing: 1,
      });

      // Floating meme coins decoration
      drawCollectible(
        ctx,
        {
          x: charX + (isMobile ? 75 : 95),
          y: groundY - (isMobile ? 72 : 95),
          type: "coin",
          collected: false,
        },
        0,
        t,
      );
      drawCollectible(
        ctx,
        {
          x: charX + (isMobile ? 115 : 145),
          y: groundY - (isMobile ? 96 : 125),
          type: "hilsa",
          collected: false,
        },
        0,
        t + 1,
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none"
    />
  );
}

function PwaInstallToast() {
  const deferredPromptRef = useRef(null);
  const dismissedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [canPromptInstall, setCanPromptInstall] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;
    if (isStandalone) return;

    const showTimer = window.setTimeout(() => {
      if (!dismissedRef.current) setIsVisible(true);
    }, 900);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setCanPromptInstall(true);
      if (!dismissedRef.current) setIsVisible(true);
    };

    const handleAppInstalled = () => {
      dismissedRef.current = true;
      deferredPromptRef.current = null;
      setCanPromptInstall(false);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    dismissedRef.current = true;
    setIsVisible(false);
  };

  const handleInstallClick = async () => {
    if (showInstructions) {
      dismiss();
      return;
    }

    const installPrompt = deferredPromptRef.current;
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    deferredPromptRef.current = null;
    setCanPromptInstall(false);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        dismiss();
      } else {
        setShowInstructions(true);
      }
    } catch (error) {
      console.error("Unable to open the PWA install prompt.", error);
      setShowInstructions(true);
    }
  };

  if (!isVisible) return null;

  const isAppleMobile =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-40 sm:w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-2 border-[#FACC15] bg-[#111827]/95 p-4 text-white shadow-2xl backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#FACC15] p-2 text-[#111827]">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[#FACC15]">Install Apa Ashche</div>
          <p className="mt-1 text-sm text-slate-200">
            {showInstructions
              ? isAppleMobile
                ? "Tap Share, then choose “Add to Home Screen.”"
                : "Open your browser menu and choose “Install app” or “Add to Home Screen.”"
              : "Add the game to your home screen for quick access."}
          </p>
          <button
            type="button"
            onClick={handleInstallClick}
            className="mt-3 rounded-lg bg-[#FACC15] px-3 py-1.5 text-xs font-black text-[#111827] transition hover:bg-yellow-300"
          >
            {showInstructions
              ? "GOT IT"
              : canPromptInstall
                ? "INSTALL"
                : "HOW TO INSTALL"}
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="-mr-1 -mt-1 rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 7. MAIN APPLICATION & GAME CONTROLLER
// ============================================================================
export default function App() {
  // Persistent Save State
  const [saveData, setSaveData] = useState(() => loadSaveData());
  const [selectedLevelId, setSelectedLevelId] = useState(1);

  // Screen & Modal States
  const [screen, setScreen] = useState("menu"); // 'menu' | 'playing' | 'paused' | 'victory' | 'gameover'
  const [activeModal, setActiveModal] = useState(null); // null | 'howto' | 'settings' | 'about'
  const [confirmReset, setConfirmReset] = useState(false);
  const orientationLockRequestedRef = useRef(false);

  const lockToLandscape = useCallback(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const orientation = window.screen.orientation;
    if (typeof orientation?.lock !== "function") return;

    orientationLockRequestedRef.current = true;
    orientation.lock("landscape").catch((error) => {
      orientationLockRequestedRef.current = false;
      console.warn(
        "Unable to lock the device to landscape orientation.",
        error,
      );
    });
  }, []);

  useEffect(() => {
    if (
      screen === "playing" ||
      screen === "paused" ||
      !orientationLockRequestedRef.current
    )
      return;

    window.screen.orientation.unlock();
    orientationLockRequestedRef.current = false;
  }, [screen]);

  // HUD State (throttled updates from game loop to avoid React overhead)
  const [hudState, setHudState] = useState({
    score: 0,
    distance: 0,
    targetDistance: 1000,
    detection: 0,
    collectibles: 0,
    shieldActive: false,
    combo: 1,
    levelBn: "",
    levelEn: "",
    dialogue: "",
  });

  // End-of-Run Summary
  const [runResult, setRunResult] = useState({
    score: 0,
    distance: 0,
    collectibles: 0,
    isNewHigh: false,
    reason: "caught", // 'caught' | 'water' | 'victory'
    finalQuote: "",
  });

  // Sync audio settings whenever saveData updates
  useEffect(() => {
    audio.updateSettings({
      masterVolume: saveData.masterVolume,
      musicVolume: saveData.musicVolume,
      sfxVolume: saveData.sfxVolume,
      musicEnabled: saveData.musicEnabled,
      sfxEnabled: saveData.sfxEnabled,
    });
  }, [saveData]);

  const updateSave = useCallback((updater) => {
    setSaveData((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      persistSaveData(next);
      return next;
    });
  }, []);

  // Input State Ref (shared directly with 60 FPS canvas loop)
  const inputRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Mutable Game Engine Ref
  const gameRef = useRef(null);
  const canvasRef = useRef(null);

  const triggerDialogue = useCallback(
    (category: string, force = false, context = "") => {
      const g = gameRef.current;
      if (!g) return;
      const now = performance.now();

      // Normalize aliases so per-category cooldowns & shuffle bags stay consistent
      const normCat =
        category === "hit"
          ? "obstacle"
          : category === "detect"
            ? "detection"
            : category === "collectible"
              ? "bonus"
              : category;

      if (!g.lastCategoryTime) g.lastCategoryTime = {};
      if (!g.dialogueBags) g.dialogueBags = {};

      const lastCatTime = g.lastCategoryTime[normCat] || 0;
      const catCooldown = normCat === "detection" ? 2400 : 1800;
      if (!force && now - lastCatTime < catCooldown) return;

      const pool = DIALOGUES[normCat] || DIALOGUES.start;
      let chosen = "";

      if (context === "hilsa") {
        chosen = pool.find((t) => t.includes("ইলিশ")) || pool[0];
      } else if (context === "cha") {
        chosen = pool.find((t) => t.includes("চা")) || pool[0];
      } else {
        // Shuffle-bag rotation so all lines in each category are heard before repeating
        let bag = g.dialogueBags[normCat];
        if (!bag || bag.length === 0) {
          bag = [...pool].filter((t) => t !== g.lastDialogueText);
          if (bag.length === 0) bag = [...pool];
        }
        const pickIdx = Math.floor(Math.random() * bag.length);
        chosen = bag.splice(pickIdx, 1)[0] || pool[0];
        g.dialogueBags[normCat] = bag;
      }

      g.lastCategoryTime[normCat] = now;
      g.lastDialogueText = chosen;
      g.lastDialogueTime = now;

      const showBubble = () => {
        const cur = gameRef.current;
        if (!cur) return;
        cur.dialogueText = chosen;
        cur.dialogueExpire = performance.now() + 2800;
      };

      if (!saveData.textOnlyDialogue && saveData.sfxEnabled) {
        audio.queueOrPlayVoice(chosen, force, showBubble);
      } else {
        showBubble();
      }
    },
    [saveData.textOnlyDialogue, saveData.sfxEnabled],
  );

  // Initialize / Start a Level Run
  const startNewRun = useCallback(
    (levelId = selectedLevelId) => {
      lockToLandscape();
      audio.unlock();
      if (saveData.musicEnabled) {
        audio.startMusic();
      }

      const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
      const worldWidthMeters = level.targetDistance;
      const pixelsPerMeter = 16;
      const finishX = worldWidthMeters * pixelsPerMeter;

      // Procedurally generate balanced obstacles, water gaps, guards, searchlights, and collectibles
      const waterGaps = [];
      const obstacles = [];
      const guards = [];
      const searchlights = [];
      const collectibles = [];

      let cursorX = 720;
      let segmentIdx = 0;

      while (cursorX < finishX - 550) {
        const progress = cursorX / finishX;
        const gapSpacing = Math.max(
          320,
          (510 - progress * 145) / level.spawnRate,
        );

        const roll = Math.random();
        if (roll < level.waterFrequency && segmentIdx > 0) {
          // Water Canal Gap (wider in Level 2 Monsoon River!)
          const baseGap = level.id === 2 ? 132 : 112;
          const gapW = baseGap + Math.min(60, progress * 60);
          waterGaps.push({ x: cursorX, width: gapW });

          // Arc of coins over the water jump
          for (let c = 0; c < 3; c++) {
            collectibles.push({
              x: cursorX + gapW / 2 - 35 + c * 35,
              yOffset: 108 + (c === 1 ? 26 : 0),
              type: c === 1 && Math.random() < 0.38 ? "star" : "coin",
              collected: false,
            });
          }
          cursorX += gapW + gapSpacing;
        } else if (roll < level.waterFrequency + 0.24) {
          // High Hanging Beam (Duck / Slide under)
          const beamW = 95 + Math.random() * 48;
          obstacles.push({
            type: "high_beam",
            x: cursorX,
            width: beamW,
            height: 44,
            clearance: 45,
            hitCooldown: 0,
            rewarded: false,
          });
          collectibles.push({
            x: cursorX + beamW * 0.3,
            yOffset: 24,
            type: "coin",
            collected: false,
          });
          collectibles.push({
            x: cursorX + beamW * 0.7,
            yOffset: 24,
            type: "coin",
            collected: false,
          });
          cursorX += beamW + gapSpacing;
        } else if (roll < level.waterFrequency + 0.5) {
          if (level.id === 4 && Math.random() < 0.55) {
            // Protesting Crowd Human Chain Barricade (Level 4!)
            const obsW = 76;
            const obsH = 62;
            obstacles.push({
              type: "crowd_barricade",
              x: cursorX,
              width: obsW,
              height: obsH,
              hitCooldown: 0,
              rewarded: false,
            });
            collectibles.push({
              x: cursorX + obsW / 2,
              yOffset: obsH + 64,
              type: Math.random() < 0.35 ? "star" : "coin",
              collected: false,
            });
            cursorX += obsW + gapSpacing;
          } else {
            // Border Fence or Road Barricade
            const isFence = Math.random() < 0.55;
            const obsW = isFence ? 46 : 54;
            const obsH = isFence ? 54 : 46;
            obstacles.push({
              type: isFence ? "fence" : "barricade",
              x: cursorX,
              width: obsW,
              height: obsH,
              hitCooldown: 0,
              rewarded: false,
            });
            collectibles.push({
              x: cursorX + obsW / 2,
              yOffset: obsH + 58,
              type: Math.random() < 0.28 ? "star" : "coin",
              collected: false,
            });
            cursorX += obsW + gapSpacing;
          }
        } else if (roll < level.waterFrequency + 0.78) {
          // Border Defender Patrol (BGB, Bangladesh Army, or Protester)
          let role = "bgb";
          if (level.id === 4) {
            role = Math.random() < 0.52 ? "army" : "protester";
          }
          guards.push({
            x: cursorX + 90,
            baseX: cursorX + 90,
            patrolRange: level.id >= 3 ? 78 : 65,
            visionRange: level.id >= 3 ? 205 : 185,
            facing: -1,
            phase: Math.random() * Math.PI * 2,
            alerted: false,
            role,
            rewarded: false,
          });
          collectibles.push({
            x: cursorX + 40,
            yOffset: 120,
            type: Math.random() < 0.32 ? "hilsa" : "coin",
            collected: false,
          });
          cursorX += 205 + gapSpacing;
        } else {
          // Moving Tea-Stall Cart or CNG Auto-Rickshaw (Level 4)
          const isCng = level.id === 4;
          obstacles.push({
            type: isCng ? "cng_cart" : "tea_cart",
            x: cursorX,
            baseX: cursorX,
            width: isCng ? 72 : 64,
            height: isCng ? 54 : 52,
            moveSpeed: 55 + progress * 45,
            moveRange: isCng ? 85 : 70,
            phase: Math.random() * Math.PI * 2,
            hitCooldown: 0,
            rewarded: false,
          });
          cursorX += 85 + gapSpacing;
        }

        // Overhead Watchtower Searchlights in Levels 3 & 4
        if (level.hasSearchlights && segmentIdx % 2 === 1) {
          searchlights.push({
            x: cursorX - gapSpacing * 0.5,
            sweepRange: 85,
            speed: level.id === 4 ? 1.45 : 1.15,
            phase: Math.random() * Math.PI * 2,
            alerted: false,
          });
        }

        // Occasional special meme item (Hilsa Fish or Cup of Cha) between obstacles
        if (segmentIdx % 3 === 1) {
          collectibles.push({
            x: cursorX - gapSpacing * 0.45,
            yOffset: 46 + (segmentIdx % 2) * 45,
            type: segmentIdx % 6 === 1 ? "hilsa" : "cha",
            collected: false,
          });
        }

        segmentIdx += 1;
      }

      gameRef.current = {
        level,
        pixelsPerMeter,
        finishX,
        cameraX: 0,
        player: {
          x: 160, // world X
          y: 0, // offset above ground (0 = on ground, > 0 = in air, < 0 = in water pit)
          vy: 0,
          isGrounded: true,
          jumpsUsed: 0,
          prevUp: false,
          isDucking: false,
          slideTimer: 0,
          state: "running",
          invulnTimer: 0,
          shieldTimer: 0,
          stepSoundTimer: 0,
          expressionTimer: 0,
          overrideExpression: null,
        },
        waterGaps,
        obstacles,
        guards,
        searchlights,
        projectiles: [],
        nextProjectileTimer: 2.6,
        floatingTexts: [],
        combo: 1,
        comboTimer: 0,
        collectibles,
        particles: [],
        score: 0,
        collectiblesCount: 0,
        detection: 0,
        shakeTimer: 0,
        shakeIntensity: 0,
        radarBeepCooldown: 0,
        dialogueText: "",
        dialogueExpire: 0,
        lastDialogueTime: 0,
        lastCategoryTime: {},
        dialogueBags: {},
        lastDialogueText: "",
        hudSyncTimer: 0,
        ended: false,
      };

      inputRef.current = { left: false, right: false, up: false, down: false };
      triggerDialogue("start", true);

      setHudState({
        score: 0,
        distance: 0,
        targetDistance: level.targetDistance,
        detection: 0,
        collectibles: 0,
        shieldActive: false,
        combo: 1,
        levelBn: level.bnTitle,
        levelEn: level.enTitle,
        dialogue: gameRef.current.dialogueText,
      });

      setActiveModal(null);
      setScreen("playing");
    },
    [selectedLevelId, saveData.musicEnabled, triggerDialogue, lockToLandscape],
  );

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code,
        )
      ) {
        if (screen === "playing") e.preventDefault();
      }

      if (e.code === "Escape" || e.code === "KeyP") {
        if (screen === "playing") {
          setScreen("paused");
        } else if (screen === "paused") {
          setScreen("playing");
        }
        return;
      }

      if (e.code === "ArrowLeft" || e.code === "KeyA")
        inputRef.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD")
        inputRef.current.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space")
        inputRef.current.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS")
        inputRef.current.down = true;
    };

    const handleKeyUp = (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA")
        inputRef.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD")
        inputRef.current.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space")
        inputRef.current.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS")
        inputRef.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [screen]);

  // Canvas Touch Gesture Controls (swipe/tap zones for natural mobile play)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let activeTouchId: number | null = null;
    // Track which gesture-driven inputs are active so we release them properly
    let gestureUp = false;
    let gestureDown = false;
    let gestureLeft = false;
    let gestureRight = false;

    const SWIPE_THRESHOLD = 30; // px minimum for a swipe
    const TAP_MAX_DURATION = 200; // ms – quick tap = jump

    const handleTouchStart = (e: TouchEvent) => {
      if (screen !== "playing") return;
      // Only track the first finger on the canvas
      if (activeTouchId !== null) return;
      const touch = e.changedTouches[0];
      activeTouchId = touch.identifier;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (screen !== "playing" || activeTouchId === null) return;
      let touch: Touch | null = null;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          touch = e.changedTouches[i];
          break;
        }
      }
      if (!touch) return;

      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      // Horizontal swipe detection (continuous while dragging)
      if (dx < -SWIPE_THRESHOLD && !gestureLeft) {
        inputRef.current.left = true;
        gestureLeft = true;
        if (gestureRight) {
          inputRef.current.right = false;
          gestureRight = false;
        }
      } else if (dx > SWIPE_THRESHOLD && !gestureRight) {
        inputRef.current.right = true;
        gestureRight = true;
        if (gestureLeft) {
          inputRef.current.left = false;
          gestureLeft = false;
        }
      }

      // Downward swipe = duck/fast-fall
      if (dy > SWIPE_THRESHOLD && !gestureDown) {
        inputRef.current.down = true;
        gestureDown = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      let found = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          found = true;
          break;
        }
      }
      if (!found) return;

      const elapsed = Date.now() - touchStartTime;

      // Quick tap on canvas = jump (only if no significant swipe happened)
      if (
        elapsed < TAP_MAX_DURATION &&
        !gestureLeft &&
        !gestureRight &&
        !gestureDown
      ) {
        // Trigger a brief up press for edge-detected jump
        inputRef.current.up = true;
        gestureUp = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (gestureUp) {
              inputRef.current.up = false;
              gestureUp = false;
            }
          });
        });
      }

      // Release all gesture-driven inputs
      if (gestureLeft) {
        inputRef.current.left = false;
        gestureLeft = false;
      }
      if (gestureRight) {
        inputRef.current.right = false;
        gestureRight = false;
      }
      if (gestureDown) {
        inputRef.current.down = false;
        gestureDown = false;
      }
      activeTouchId = null;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [screen]);

  // Helper to spawn particle bursts
  const spawnParticles = (
    g,
    worldX,
    yAboveGround,
    color,
    count = 12,
    speedScale = 1,
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (40 + Math.random() * 140) * speedScale;
      g.particles.push({
        x: worldX,
        yOffset: yAboveGround,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd + 60,
        size: 3 + Math.random() * 4.5,
        color,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
      });
    }
  };

  // Finish Game Handler (Victory or Game Over)
  const finishRun = useCallback(
    (reason) => {
      const g = gameRef.current;
      if (!g || g.ended) return;
      g.ended = true;

      const distMeters = Math.min(
        g.level.targetDistance,
        Math.max(0, Math.floor((g.player.x - 160) / g.pixelsPerMeter)),
      );

      let finalScore = Math.floor(g.score + distMeters * 2);
      if (reason === "victory") {
        finalScore += 1000;
        audio.playVictory();
        triggerDialogue("victory", true);
      } else if (reason === "water") {
        audio.playSplash();
        triggerDialogue("water", true);
      } else {
        audio.playCapture();
        triggerDialogue("caught", true);
      }

      const finalQuote =
        g.dialogueText ||
        (reason === "victory" ? "জয় বাংলা!" : "আবার ধরা খাইলাম!");
      const isNewHigh = finalScore > saveData.highScore;

      updateSave((prev) => {
        const nextUnlocked = [...prev.unlockedLevels];
        if (
          reason === "victory" &&
          g.level.id < 4 &&
          !nextUnlocked.includes(g.level.id + 1)
        ) {
          nextUnlocked.push(g.level.id + 1);
        }
        return {
          ...prev,
          highScore: Math.max(prev.highScore, finalScore),
          bestDistance: Math.max(prev.bestDistance, distMeters),
          totalGamesPlayed: prev.totalGamesPlayed + 1,
          totalCrossings: prev.totalCrossings + (reason === "victory" ? 1 : 0),
          unlockedLevels: nextUnlocked,
        };
      });

      setRunResult({
        score: finalScore,
        distance: distMeters,
        collectibles: g.collectiblesCount,
        isNewHigh,
        reason,
        finalQuote,
      });

      setTimeout(() => {
        setScreen(reason === "victory" ? "victory" : "gameover");
      }, 650);
    },
    [saveData.highScore, triggerDialogue, updateSave],
  );

  // ============================================================================
  // 8. 60 FPS GAME SIMULATION & CANVAS RENDERING LOOP
  // ============================================================================
  useEffect(() => {
    if (screen !== "playing" && screen !== "paused") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let lastTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = (now) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // Cap dt for stability

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const groundY = Math.round(h * 0.76);
      const g = gameRef.current;

      if (!g) return;

      // Update simulation only when actively playing
      if (screen === "playing" && !g.ended) {
        const p = g.player;
        const inp = inputRef.current;
        const progress = Math.min(
          1,
          Math.max(0, (p.x - 160) / (g.finishX - 160)),
        );

        // Progressive speed scaling
        const baseAutoSpeed =
          g.level.baseSpeed + (g.level.maxSpeed - g.level.baseSpeed) * progress;
        const boostMult = p.shieldTimer > 0 ? 1.25 : 1.0;
        let moveSpeed = baseAutoSpeed * boostMult;

        if (inp.left) moveSpeed *= 0.45;
        if (inp.right) moveSpeed *= 1.32;

        p.x += moveSpeed * dt;

        // Timers
        if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
        if (p.shieldTimer > 0) p.shieldTimer = Math.max(0, p.shieldTimer - dt);
        if (p.expressionTimer > 0) {
          p.expressionTimer -= dt;
          if (p.expressionTimer <= 0) p.overrideExpression = null;
        }
        if (g.shakeTimer > 0) g.shakeTimer = Math.max(0, g.shakeTimer - dt);
        if (g.radarBeepCooldown > 0)
          g.radarBeepCooldown = Math.max(0, g.radarBeepCooldown - dt);

        // Jump & Double-Jump Physics (edge-triggered so holding Jump doesn't burn double jump)
        const jumpJustPressed = inp.up && !p.prevUp;
        p.prevUp = inp.up;

        if (jumpJustPressed && (p.isGrounded || p.jumpsUsed < 2)) {
          const isDouble = !p.isGrounded;
          p.vy = isDouble ? 630 : 700;
          p.isGrounded = false;
          p.jumpsUsed += 1;
          p.isDucking = false;
          p.slideTimer = 0;
          audio.playJump();
          if (isDouble) {
            audio.playTone(460, 0.12, "triangle", 0.18, 780);
            spawnParticles(g, p.x, p.y + 8, "#22D3EE", 10, 0.75);
          } else {
            spawnParticles(g, p.x, 4, "#FDE68A", 7, 0.6);
          }
        }

        // Fast-Fall when pressing Down in mid-air!
        if (inp.down && !p.isGrounded && p.vy > -520) {
          p.vy = -580;
        }

        // Duck & Slide Physics
        if (inp.down && p.isGrounded) {
          if (!p.isDucking && p.slideTimer <= 0) {
            p.slideTimer = 0.45;
            audio.playSlide();
            spawnParticles(g, p.x - 10, 4, "#CBD5E1", 6, 0.5);
          }
          p.isDucking = true;
        } else {
          p.isDucking = false;
        }
        if (p.slideTimer > 0) p.slideTimer = Math.max(0, p.slideTimer - dt);

        // Combo decay
        if (g.comboTimer > 0) {
          g.comboTimer = Math.max(0, g.comboTimer - dt);
          if (g.comboTimer <= 0) g.combo = 1;
        }

        // Vertical gravity integration
        if (!p.isGrounded) {
          p.y += p.vy * dt;
          p.vy -= 1850 * dt;

          // Check if over a water gap
          const overWater = g.waterGaps.some(
            (gap) => p.x > gap.x + 14 && p.x < gap.x + gap.width - 14,
          );

          if (!overWater && p.y <= 0) {
            p.y = 0;
            p.vy = 0;
            p.isGrounded = true;
            p.jumpsUsed = 0;
            audio.playLand();
            spawnParticles(g, p.x, 2, "#A3E635", 6, 0.45);
          } else if (overWater && p.y <= -18) {
            p.state = "swimming";
            spawnParticles(g, p.x, 0, "#22D3EE", 18, 1.2);
            finishRun("water");
          }
        } else {
          // Check if walked off edge into water gap
          const overWater = g.waterGaps.some(
            (gap) => p.x > gap.x + 16 && p.x < gap.x + gap.width - 16,
          );
          if (overWater) {
            p.isGrounded = false;
            p.vy = -120;
          } else {
            // Running footsteps SFX & dust
            p.stepSoundTimer -= dt * (moveSpeed / 330);
            if (p.stepSoundTimer <= 0) {
              p.stepSoundTimer = 0.26;
              audio.playStep();
              spawnParticles(g, p.x - 12, 2, "rgba(255,255,255,0.55)", 2, 0.3);
            }
          }
        }

        // Determine Character Animation State
        if (!g.ended) {
          if (!p.isGrounded) {
            p.state = p.vy > 40 ? "jumping" : "falling";
          } else if (p.slideTimer > 0) {
            p.state = "sliding";
          } else if (p.isDucking) {
            p.state = "ducking";
          } else if (p.overrideExpression) {
            p.state = p.overrideExpression;
          } else {
            p.state = "running";
          }
        }

        // Player AABB Hitbox (world coordinates, y=0 at ground)
        const playerHalfW = 15;
        const playerH = p.isDucking || p.slideTimer > 0 ? 42 : 84;
        const pLeft = p.x - playerHalfW;
        const pRight = p.x + playerHalfW;
        const pBottom = p.y;
        const pTop = p.y + playerH;

        // Update & Check Obstacles
        g.obstacles.forEach((obs) => {
          if (obs.hitCooldown > 0)
            obs.hitCooldown = Math.max(0, obs.hitCooldown - dt);

          if (obs.type === "tea_cart" || obs.type === "cng_cart") {
            obs.x =
              obs.baseX + Math.sin(now * 0.003 + obs.phase) * obs.moveRange;
          }

          let oLeft = obs.x + 4;
          let oRight = obs.x + obs.width - 4;
          let oBottom = 0;
          let oTop = obs.height;

          if (obs.type === "high_beam") {
            oBottom = obs.clearance;
            oTop = obs.clearance + obs.height;
          }

          const overlaps =
            pRight > oLeft &&
            pLeft < oRight &&
            pTop > oBottom &&
            pBottom < oTop;

          if (overlaps && obs.hitCooldown <= 0) {
            obs.hitCooldown = 0.9;
            if (p.shieldTimer > 0) {
              // Cha shield smashes right through!
              p.shieldTimer = Math.max(0, p.shieldTimer - 1.0);
              g.score += 75;
              g.floatingTexts.push({
                x: p.x,
                yOffset: p.y + 88,
                text: "SMASH! +75",
                color: "#22D3EE",
                life: 0.9,
                maxLife: 0.9,
              });
              audio.playStar();
              spawnParticles(g, obs.x + obs.width / 2, 30, "#22D3EE", 14, 1);
            } else if (p.invulnTimer <= 0) {
              p.invulnTimer = 1.0;
              p.overrideExpression = "angry";
              p.expressionTimer = 0.85;
              g.detection = Math.min(100, g.detection + 26);
              g.combo = 1;
              g.comboTimer = 0;
              g.shakeTimer = 0.28;
              g.shakeIntensity = 8;
              g.floatingTexts.push({
                x: p.x,
                yOffset: p.y + 92,
                text: "BONK! +26% ALERT",
                color: "#EF4444",
                life: 0.95,
                maxLife: 0.95,
              });
              audio.playBonk();
              triggerDialogue("obstacle");
              spawnParticles(g, p.x, p.y + 40, "#EF4444", 14, 1);

              if (g.detection >= 100) {
                p.state = "caught";
                finishRun("caught");
              }
            }
          } else if (!obs.rewarded && pLeft > oRight && obs.hitCooldown <= 0) {
            obs.rewarded = true;
            if (obs.type === "high_beam" && (p.isDucking || p.slideTimer > 0)) {
              g.score += 40;
              g.floatingTexts.push({
                x: p.x,
                yOffset: p.y + 72,
                text: "SLIDE! +40",
                color: "#A3E635",
                life: 0.8,
                maxLife: 0.8,
              });
            }
          }
        });

        // Update & Check Guards + Vision Cones
        g.guards.forEach((guard) => {
          guard.x =
            guard.baseX +
            Math.sin(now * 0.0022 + guard.phase) * guard.patrolRange;
          const distToPlayer = guard.x - p.x;
          const inConeX = distToPlayer > 0 && distToPlayer < guard.visionRange;
          const inConeY = p.y < 76; // Jumping high avoids vision cone!

          if (inConeX && inConeY && p.shieldTimer <= 0) {
            guard.alerted = true;
            const rate = 42 * g.level.guardSensitivity;
            g.detection = Math.min(100, g.detection + rate * dt);
            if (!p.overrideExpression) {
              p.overrideExpression = "shocked";
              p.expressionTimer = 0.35;
            }
            if (g.radarBeepCooldown <= 0) {
              g.radarBeepCooldown = 0.34;
              audio.playRadarBeep();
              triggerDialogue("detection");
            }
            if (g.detection >= 100) {
              p.state = "caught";
              finishRun("caught");
            }
          } else {
            guard.alerted = false;
            if (!guard.rewarded && p.x > guard.x + 20 && p.y > 40) {
              guard.rewarded = true;
              g.score += 60;
              g.floatingTexts.push({
                x: p.x,
                yOffset: p.y + 85,
                text: "DODGED! +60",
                color: "#FACC15",
                life: 0.8,
                maxLife: 0.8,
              });
            }
          }
        });

        // Update & Check Overhead Watchtower Searchlights (Levels 3 & 4)
        g.searchlights.forEach((sl) => {
          const beamX =
            sl.x + Math.sin((now / 1000) * sl.speed + sl.phase) * sl.sweepRange;
          const inBeam = Math.abs(p.x - beamX) < 42 && p.shieldTimer <= 0;
          if (inBeam) {
            sl.alerted = true;
            g.detection = Math.min(100, g.detection + 34 * dt);
            if (g.radarBeepCooldown <= 0) {
              g.radarBeepCooldown = 0.38;
              audio.playRadarBeep();
              triggerDialogue("detection");
            }
            if (g.detection >= 100) {
              p.state = "caught";
              finishRun("caught");
            }
          } else {
            sl.alerted = false;
          }
        });

        // Level 4: Flying Chappal Projectiles tossed by Protesters!
        if (g.level.hasProjectiles && progress < 0.94) {
          g.nextProjectileTimer -= dt;
          if (g.nextProjectileTimer <= 0) {
            g.nextProjectileTimer = 2.1 + Math.random() * 1.6;
            const highThrow = Math.random() < 0.5;
            g.projectiles.push({
              x: p.x + w * 0.72,
              yOffset: highThrow ? 66 : 26, // high = duck under, low = jump over!
              vx: -(240 + progress * 110),
              hit: false,
            });
          }
        }
        for (let i = g.projectiles.length - 1; i >= 0; i--) {
          const proj = g.projectiles[i];
          proj.x += proj.vx * dt;
          const overlaps =
            !proj.hit &&
            Math.abs(proj.x - p.x) < 22 &&
            proj.yOffset > pBottom &&
            proj.yOffset < pTop;

          if (overlaps) {
            proj.hit = true;
            if (p.shieldTimer > 0) {
              g.floatingTexts.push({
                x: p.x,
                yOffset: p.y + 85,
                text: "BLOCKED!",
                color: "#22D3EE",
                life: 0.75,
                maxLife: 0.75,
              });
              spawnParticles(g, proj.x, proj.yOffset, "#22D3EE", 10, 0.8);
            } else if (p.invulnTimer <= 0) {
              p.invulnTimer = 0.7;
              p.overrideExpression = "angry";
              p.expressionTimer = 0.65;
              g.detection = Math.min(100, g.detection + 20);
              g.shakeTimer = 0.2;
              g.shakeIntensity = 6;
              g.floatingTexts.push({
                x: p.x,
                yOffset: p.y + 92,
                text: "CHAPPAL HIT! +20%",
                color: "#EF4444",
                life: 0.9,
                maxLife: 0.9,
              });
              audio.playBonk();
              triggerDialogue("obstacle");
              spawnParticles(g, proj.x, proj.yOffset, "#EF4444", 12, 0.9);
              if (g.detection >= 100) {
                p.state = "caught";
                finishRun("caught");
              }
            }
            g.projectiles.splice(i, 1);
          } else if (proj.x < g.cameraX - 80) {
            g.projectiles.splice(i, 1);
          }
        }

        // Passive slow detection cool-down when clear of guards & searchlights
        if (
          !g.guards.some((gd) => gd.alerted) &&
          !g.searchlights.some((sl) => sl.alerted) &&
          g.detection > 0 &&
          !g.ended
        ) {
          g.detection = Math.max(0, g.detection - 4.0 * dt);
        }

        // Check Collectibles (with Combo Multiplier!)
        g.collectibles.forEach((item) => {
          if (item.collected) return;
          const dx = Math.abs(p.x - item.x);
          const dy = Math.abs(p.y + playerH * 0.5 - item.yOffset);
          if (dx < 34 && dy < 40) {
            item.collected = true;
            g.collectiblesCount += 1;
            g.combo = Math.min(5, g.comboTimer > 0 ? g.combo + 1 : 1);
            g.comboTimer = 2.6;

            if (item.type === "coin") {
              const pts = 50 * g.combo;
              g.score += pts;
              g.floatingTexts.push({
                x: item.x,
                yOffset: item.yOffset + 16,
                text: `+${pts}৳`,
                color: "#FACC15",
                life: 0.75,
                maxLife: 0.75,
              });
              audio.playCoin();
              spawnParticles(g, item.x, item.yOffset, "#FACC15", 8, 0.7);
            } else if (item.type === "star") {
              const pts = 150 * g.combo;
              g.score += pts;
              g.floatingTexts.push({
                x: item.x,
                yOffset: item.yOffset + 18,
                text: `★ +${pts}`,
                color: "#22D3EE",
                life: 0.85,
                maxLife: 0.85,
              });
              audio.playStar();
              spawnParticles(g, item.x, item.yOffset, "#22D3EE", 12, 0.9);
            } else if (item.type === "hilsa") {
              g.score += 300;
              g.detection = Math.max(0, g.detection - 25);
              g.floatingTexts.push({
                x: item.x,
                yOffset: item.yOffset + 20,
                text: "ইলিশ BRIBE! -25%",
                color: "#38BDF8",
                life: 1.0,
                maxLife: 1.0,
              });
              audio.playBonusMeme();
              triggerDialogue("bonus", false, "hilsa");
              spawnParticles(g, item.x, item.yOffset, "#38BDF8", 15, 1);
            } else if (item.type === "cha") {
              g.score += 200;
              p.shieldTimer = 4.5;
              g.floatingTexts.push({
                x: item.x,
                yOffset: item.yOffset + 20,
                text: "CHA SHIELD! ☕",
                color: "#FB923C",
                life: 1.0,
                maxLife: 1.0,
              });
              audio.playBonusMeme();
              triggerDialogue("bonus", false, "cha");
              spawnParticles(g, item.x, item.yOffset, "#F97316", 15, 1);
            }
          }
        });

        // Update Floating Texts
        for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
          const ft = g.floatingTexts[i];
          ft.yOffset += 42 * dt;
          ft.life -= dt;
          if (ft.life <= 0) g.floatingTexts.splice(i, 1);
        }

        // Update Particles
        for (let i = g.particles.length - 1; i >= 0; i--) {
          const pt = g.particles[i];
          pt.x += pt.vx * dt;
          pt.yOffset += pt.vy * dt;
          pt.vy -= 420 * dt;
          pt.life -= dt;
          if (pt.life <= 0) g.particles.splice(i, 1);
        }

        // Check Victory Gate
        if (p.x >= g.finishX && !g.ended) {
          p.state = "celebrating";
          spawnParticles(g, p.x, 70, "#FACC15", 24, 1.3);
          spawnParticles(g, p.x, 70, "#22D3EE", 24, 1.3);
          finishRun("victory");
        }

        // Smooth Camera Follow (cushioned lerp to prevent speed-change snap)
        const leadOffset = w < 640 ? w * 0.22 : w * 0.25;
        const targetCamX = Math.max(0, p.x - leadOffset);
        g.cameraX += (targetCamX - g.cameraX) * Math.min(1, dt * 14);

        // Clear expired dialogue
        if (g.dialogueText && now > g.dialogueExpire) {
          g.dialogueText = "";
        }

        // Throttled HUD State Sync (~15 fps)
        g.hudSyncTimer += dt;
        if (g.hudSyncTimer >= 0.065) {
          g.hudSyncTimer = 0;
          const distMeters = Math.min(
            g.level.targetDistance,
            Math.max(0, Math.floor((p.x - 160) / g.pixelsPerMeter)),
          );
          setHudState({
            score: Math.floor(g.score + distMeters * 2),
            distance: distMeters,
            targetDistance: g.level.targetDistance,
            detection: Math.round(g.detection),
            collectibles: g.collectiblesCount,
            shieldActive: p.shieldTimer > 0,
            combo: g.combo,
            levelBn: g.level.bnTitle,
            levelEn: g.level.enTitle,
            dialogue: g.dialogueText,
          });
        }
      }

      // ---- RENDER SCENE ----
      const timeSec = now / 1000;
      ctx.save();

      if (g.shakeTimer > 0) {
        const decay = Math.min(1, g.shakeTimer / 0.28);
        const gentleMag = Math.min(3.5, g.shakeIntensity * 0.4) * decay;
        const sx = Math.sin(timeSec * 42) * gentleMag;
        const sy = Math.cos(timeSec * 36) * gentleMag * 0.6;
        ctx.translate(sx, sy);
      }

      drawBackground(ctx, w, h, groundY, g.cameraX, g.level, timeSec);
      drawGroundWithGaps(
        ctx,
        w,
        h,
        groundY,
        g.cameraX,
        g.level,
        g.waterGaps,
        timeSec,
      );
      drawIndiaStartGate(ctx, 90, g.cameraX, groundY);
      drawSearchlights(ctx, g.searchlights, g.cameraX, groundY, timeSec);

      // Milestone signposts every 250m
      for (let m = 250; m < g.level.targetDistance; m += 250) {
        const mx = 160 + m * g.pixelsPerMeter - g.cameraX;
        if (mx > -60 && mx < w + 60) {
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(mx - 2, groundY - 36, 4, 36);
          ctx.fillStyle = "#FFFFFF";
          ctx.strokeStyle = "#111827";
          ctx.lineWidth = 2;
          ctx.fillRect(mx - 24, groundY - 54, 48, 20);
          ctx.strokeRect(mx - 24, groundY - 54, 48, 20);
          ctx.fillStyle = "#111827";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${m}m`, mx, groundY - 40);
        }
      }

      // Border Finish Gate
      drawBorderGate(ctx, g.finishX, g.cameraX, groundY, g.level, timeSec);

      // Obstacles
      g.obstacles.forEach((obs) => {
        if (obs.x - g.cameraX > -150 && obs.x - g.cameraX < w + 150) {
          drawObstacle(ctx, obs, g.cameraX, groundY, timeSec);
        }
      });

      // Guards
      g.guards.forEach((guard) => {
        if (guard.x - g.cameraX > -260 && guard.x - g.cameraX < w + 260) {
          drawGuard(ctx, guard, g.cameraX, groundY, timeSec);
        }
      });

      // Collectibles
      g.collectibles.forEach((item) => {
        if (
          !item.collected &&
          item.x - g.cameraX > -80 &&
          item.x - g.cameraX < w + 80
        ) {
          drawCollectible(
            ctx,
            { ...item, y: groundY - item.yOffset },
            g.cameraX,
            timeSec,
          );
        }
      });

      // Main Playable Character: Sheikh Hasina Caricature
      const screenPlayerX = g.player.x - g.cameraX;
      const screenPlayerY = groundY - g.player.y;
      drawHasinaCaricature(
        ctx,
        screenPlayerX,
        screenPlayerY,
        timeSec,
        g.player.state,
        {
          scale: 1.05,
          facing: 1,
          hasShield: g.player.shieldTimer > 0,
          invuln: g.player.invulnTimer > 0,
        },
      );

      // Cartoon Speech Bubble following character
      if (g.dialogueText) {
        const bubbleX = Math.min(w - 115, Math.max(105, screenPlayerX + 26));
        const bubbleY = Math.max(68, screenPlayerY - 122);

        ctx.save();
        ctx.font = '700 15px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
        const textW = ctx.measureText(g.dialogueText).width;
        const padX = 14;
        const boxW = Math.max(96, textW + padX * 2);
        const boxH = 34;

        // Bubble shadow
        ctx.fillStyle = "#111827";
        ctx.beginPath();
        ctx.roundRect(
          bubbleX - boxW / 2 + 3,
          bubbleY - boxH / 2 + 3,
          boxW,
          boxH,
          12,
        );
        ctx.fill();

        // Bubble body
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bubbleX - boxW / 2, bubbleY - boxH / 2, boxW, boxH, 12);
        ctx.fill();
        ctx.stroke();

        // Pointer triangle
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(bubbleX - 10, bubbleY + boxH / 2 - 1);
        ctx.lineTo(bubbleX - 18, bubbleY + boxH / 2 + 10);
        ctx.lineTo(bubbleX + 2, bubbleY + boxH / 2 - 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bengali Text
        ctx.fillStyle = "#111827";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(g.dialogueText, bubbleX, bubbleY + 1);
        ctx.restore();
      }

      // Particles & Projectiles & Floating Score Popups
      g.projectiles.forEach((proj) => {
        drawProjectile(ctx, proj, g.cameraX, groundY, timeSec);
      });

      g.particles.forEach((pt) => {
        const px = pt.x - g.cameraX;
        const py = groundY - pt.yOffset;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(px, py, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      drawFloatingTexts(ctx, g.floatingTexts, g.cameraX, groundY);

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [screen, finishRun, triggerDialogue]);

  // Stop music and voice when returning to main menu
  const goToMainMenu = () => {
    audio.stopMusic();
    audio.stopVoice();
    setActiveModal(null);
    setScreen("menu");
  };

  // Detection bar color helper
  const getDetectionColor = (val) => {
    if (val >= 75) return "bg-red-500";
    if (val >= 45) return "bg-yellow-400";
    return "bg-cyan-400";
  };

  const progressPct = Math.min(
    100,
    Math.round((hudState.distance / hudState.targetDistance) * 100),
  );

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#111827] text-white select-none font-sans">
      {/* Load Google Font for crisp Bengali Unicode & Arcade Display */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@600;700&family=Rubik:wght@700;800;900&display=swap');
        .font-bn { font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif; }
        .font-arcade { font-family: 'Rubik', sans-serif; }
        .arcade-shadow { box-shadow: 0 5px 0 #111827; }
        .arcade-shadow:active { transform: translateY(3px); box-shadow: 0 2px 0 #111827; }
      `}</style>

      {/* ====================================================================
          SCREEN 1: ANIMATED MAIN MENU
      ==================================================================== */}
      {screen === "menu" && (
        <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
          <MenuBackdropCanvas />

          {/* Top Bar: Stats & Quick Audio Toggles */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-[#111827]/90 border-2 border-[#FACC15] rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <Trophy className="w-4 h-4 text-[#FACC15]" />
                <span className="text-xs sm:text-sm font-bold text-slate-300">
                  BEST:
                </span>
                <span className="text-sm sm:text-base font-black text-[#FACC15]">
                  {saveData.highScore}
                </span>
              </div>
              <div className="bg-[#111827]/90 border-2 border-[#22D3EE] rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <Award className="w-4 h-4 text-[#22D3EE]" />
                <span className="text-xs sm:text-sm font-bold text-slate-300">
                  CROSSINGS:
                </span>
                <span className="text-sm sm:text-base font-black text-[#22D3EE]">
                  {saveData.totalCrossings}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audio.unlock();
                  updateSave((s) => ({ ...s, musicEnabled: !s.musicEnabled }));
                }}
                aria-label="Toggle Music"
                className={`p-2.5 rounded-xl border-2 border-[#111827] arcade-shadow transition ${
                  saveData.musicEnabled
                    ? "bg-[#2563EB] text-white"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                <Music className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  audio.unlock();
                  updateSave((s) => ({ ...s, sfxEnabled: !s.sfxEnabled }));
                }}
                aria-label="Toggle Sound Effects"
                className={`p-2.5 rounded-xl border-2 border-[#111827] arcade-shadow transition ${
                  saveData.sfxEnabled
                    ? "bg-[#22D3EE] text-[#111827]"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {saveData.sfxEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Center Hero Title & Level Selector */}
          <div className="relative z-10 mt-auto md:my-auto flex flex-col items-center md:items-end md:pr-8 lg:pr-16 text-center md:text-right">
            <div className="max-w-lg w-full flex flex-col items-center">
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#EF4444] text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-[#111827] shadow mb-2">
                <Flame className="w-3.5 h-3.5 text-[#FACC15]" /> Bangladesh
                Satire Arcade
              </span>

              <Image
                src="/apa-ashce-brand.png"
                alt="আপা আসছে! logo"
                width={72}
                height={72}
                className="mb-1 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-[#FACC15] object-contain shadow-lg"
              />

              <h1
                className="font-arcade text-3xl sm:text-6xl font-black tracking-tight text-[#FACC15] drop-shadow-[0_4px_0_#111827]"
                style={{ WebkitTextStroke: "2px #111827" }}
              >
                APA ASHCHE!
              </h1>
              <div
                className="font-bn text-2xl sm:text-5xl font-bold text-white -mt-1 drop-shadow-[0_3px_0_#111827]"
                style={{ WebkitTextStroke: "1.5px #111827" }}
              >
                আপা আসছে!
              </div>
              <p className="hidden sm:block mt-1.5 text-sm sm:text-base font-bold text-white bg-[#111827]/80 px-4 py-1 rounded-full border border-white/20">
                A Ridiculous Border-Crossing Adventure
              </p>

              {/* Route / Level Selector (Compact strip on mobile, detailed 2x2 grid on desktop) */}
              <div className="mt-2.5 sm:mt-4 w-full bg-[#111827]/90 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-2 sm:p-3 shadow-xl">
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#22D3EE] mb-1.5 sm:mb-2 flex items-center justify-center gap-1.5">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Select Border
                  Route
                </div>

                {/* Mobile Compact 4-Pill Selector */}
                <div className="md:hidden">
                  <div className="grid grid-cols-4 gap-1.5">
                    {LEVELS.map((lvl) => {
                      const unlocked = saveData.unlockedLevels.includes(lvl.id);
                      const selected = selectedLevelId === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => {
                            if (unlocked) setSelectedLevelId(lvl.id);
                          }}
                          className={`py-1.5 px-1 rounded-xl border-2 flex items-center justify-center gap-1 transition ${
                            selected
                              ? "bg-[#2563EB] border-[#FACC15] text-white shadow-md"
                              : unlocked
                                ? "bg-slate-800/90 border-slate-600 text-slate-200"
                                : "bg-slate-900/70 border-slate-800 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          <span className="text-xs font-black">R{lvl.id}</span>
                          {unlocked ? (
                            <Unlock className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {(() => {
                    const activeLvl =
                      LEVELS.find((l) => l.id === selectedLevelId) || LEVELS[0];
                    return (
                      <div className="mt-1.5 px-1 flex items-center justify-between gap-2 text-left">
                        <div className="font-bn text-xs font-bold text-[#FACC15] truncate">
                          {activeLvl.bnTitle}
                        </div>
                        <div className="text-[10px] font-semibold text-sky-300 shrink-0">
                          {activeLvl.targetDistance}m
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Desktop 2x2 Detailed Cards */}
                <div className="hidden md:grid grid-cols-2 gap-2">
                  {LEVELS.map((lvl) => {
                    const unlocked = saveData.unlockedLevels.includes(lvl.id);
                    const selected = selectedLevelId === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => {
                          if (unlocked) setSelectedLevelId(lvl.id);
                        }}
                        className={`p-2 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                          selected
                            ? "bg-[#2563EB] border-[#FACC15] text-white shadow-md"
                            : unlocked
                              ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:border-slate-400"
                              : "bg-slate-900/70 border-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase text-[#FACC15]">
                            Route {lvl.id}
                          </span>
                          {unlocked ? (
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                        <div className="font-bn text-sm font-bold leading-tight mt-0.5">
                          {lvl.bnTitle}
                        </div>
                        <div className="text-[10px] font-semibold text-sky-300 truncate">
                          {lvl.enTitle}
                        </div>
                        <div className="text-[9px] opacity-75 truncate mt-0.5">
                          {lvl.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Play Button */}
              <button
                onClick={() => startNewRun(selectedLevelId)}
                className="mt-2.5 sm:mt-4 w-full py-2.5 sm:py-3.5 px-6 bg-[#FACC15] hover:bg-yellow-300 text-[#111827] font-arcade font-black text-lg sm:text-2xl rounded-2xl border-4 border-[#111827] arcade-shadow flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-[#111827]" />
                PLAY GAME
              </button>

              {/* Secondary Menu Buttons */}
              <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-2 w-full">
                <button
                  onClick={() => setActiveModal("howto")}
                  className="py-2 sm:py-2.5 px-2 sm:px-3 bg-[#2563EB] hover:bg-blue-500 text-white font-bold text-[11px] sm:text-sm rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  HOW TO PLAY
                </button>
                <button
                  onClick={() => setActiveModal("settings")}
                  className="py-2 sm:py-2.5 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] sm:text-sm rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#22D3EE]" />
                  SETTINGS
                </button>
                <button
                  onClick={() => setActiveModal("about")}
                  className="py-2 sm:py-2.5 px-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] sm:text-sm rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15]" />
                  ABOUT
                </button>
              </div>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="relative z-10 text-center">
            <p className="inline-block bg-[#111827]/85 text-slate-300 text-[11px] sm:text-xs px-3.5 py-1 rounded-full border border-white/15">
              An unofficial fictional political satire game. Created for
              entertainment.
            </p>
          </div>

          <PwaInstallToast />
        </div>
      )}

      {/* ====================================================================
          SCREEN 2: ACTIVE GAMEPLAY CANVAS & HUD
      ==================================================================== */}
      {(screen === "playing" || screen === "paused") && (
        <div className="relative w-full h-full touch-manipulation select-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full block touch-manipulation"
          />

          {/* Top Arcade HUD */}
          <div className="absolute top-0 left-0 right-0 z-20 p-2.5 sm:p-4 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-start justify-between gap-2">
              {/* Left: Score & Distance */}
              <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
                <div className="bg-[#111827]/90 border-2 border-[#FACC15] rounded-xl px-3 py-1.5 shadow-md">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    SCORE
                  </div>
                  <div className="font-arcade text-base sm:text-xl font-black text-[#FACC15] leading-none">
                    {hudState.score}
                  </div>
                </div>

                <div className="bg-[#111827]/90 border-2 border-[#22D3EE] rounded-xl px-3 py-1.5 shadow-md">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    BORDER GATE
                  </div>
                  <div className="font-arcade text-sm sm:text-lg font-black text-white leading-none">
                    {hudState.distance}m{" "}
                    <span className="text-xs text-slate-400">
                      / {hudState.targetDistance}m
                    </span>
                  </div>
                </div>

                {hudState.shieldActive && (
                  <div className="bg-orange-500/95 border-2 border-white rounded-xl px-2.5 py-1 text-xs font-black text-white flex items-center gap-1 animate-bounce">
                    <Sparkles className="w-3.5 h-3.5" /> CHA BOOST!
                  </div>
                )}

                {hudState.combo > 1 && (
                  <div className="bg-[#FACC15] border-2 border-[#111827] rounded-xl px-2.5 py-1 text-xs font-black text-[#111827] shadow">
                    COMBO x{hudState.combo}!
                  </div>
                )}
              </div>

              {/* Center: Detection Meter */}
              <div className="flex-1 max-w-xs mx-auto bg-[#111827]/90 border-2 border-white/25 rounded-xl px-3 py-1.5 shadow-md">
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-extrabold mb-1">
                  <span className="flex items-center gap-1 text-white">
                    <ShieldAlert
                      className={`w-3.5 h-3.5 ${
                        hudState.detection >= 75
                          ? "text-[#EF4444]"
                          : "text-[#FACC15]"
                      }`}
                    />
                    DETECTION LEVEL
                  </span>
                  <span
                    className={
                      hudState.detection >= 75
                        ? "text-[#EF4444]"
                        : "text-[#22D3EE]"
                    }
                  >
                    {hudState.detection}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-150 ${getDetectionColor(hudState.detection)}`}
                    style={{ width: `${hudState.detection}%` }}
                  />
                </div>
              </div>

              {/* Right: Quick Mute & Pause */}
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  onClick={() =>
                    updateSave((s) => ({
                      ...s,
                      sfxEnabled: !s.sfxEnabled,
                      musicEnabled: !s.sfxEnabled,
                    }))
                  }
                  aria-label="Toggle Sound"
                  className="p-2.5 bg-[#111827]/90 hover:bg-slate-800 text-white rounded-xl border-2 border-white/25 shadow-md cursor-pointer"
                >
                  {saveData.sfxEnabled ? (
                    <Volume2 className="w-5 h-5 text-[#22D3EE]" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <button
                  onClick={() => setScreen("paused")}
                  aria-label="Pause Game"
                  className="p-2.5 bg-[#FACC15] hover:bg-yellow-300 text-[#111827] rounded-xl border-2 border-[#111827] arcade-shadow cursor-pointer"
                >
                  <Pause className="w-5 h-5 fill-[#111827]" />
                </button>
              </div>
            </div>

            {/* Distance Progress Mini-Bar & Location Tag */}
            <div className="w-full max-w-md mx-auto flex flex-col items-center gap-1">
              <div className="w-full bg-[#111827]/75 h-2 rounded-full overflow-hidden border border-white/15">
                <div
                  className="h-full bg-gradient-to-r from-[#22D3EE] via-[#FACC15] to-emerald-400 transition-all duration-150"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {hudState.levelEn && (
                <div className="text-[10px] font-bold tracking-wider uppercase text-white/85 bg-[#111827]/70 px-2.5 py-0.5 rounded-full border border-white/10">
                  {hudState.levelEn} • {progressPct}%
                </div>
              )}
            </div>

            {/* Text-Only Dialogue Accessibility Banner if enabled */}
            {saveData.textOnlyDialogue && hudState.dialogue && (
              <div className="mx-auto bg-[#111827]/95 border-2 border-[#FACC15] px-4 py-1 rounded-full font-bn text-base font-bold text-[#FACC15]">
                “{hudState.dialogue}”
              </div>
            )}
          </div>

          {/* Mobile & Touch Controls Overlay */}
          <div
            className="absolute bottom-12 sm:bottom-4 left-2.5 right-2.5 sm:left-4 sm:right-4 z-20 flex items-end justify-between gap-2 pointer-events-none"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Left / Right Speed Steering */}
            <div className="flex items-center gap-1.5 sm:gap-3 pointer-events-auto shrink-0">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  inputRef.current.left = true;
                }}
                onPointerUp={() => (inputRef.current.left = false)}
                onPointerLeave={() => (inputRef.current.left = false)}
                onPointerCancel={() => (inputRef.current.left = false)}
                aria-label="Slow Down / Left"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#111827]/85 active:bg-[#2563EB] border-2 border-white/40 text-white flex flex-col items-center justify-center shadow-xl touch-manipulation"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none">
                  SLOW
                </span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  inputRef.current.right = true;
                }}
                onPointerUp={() => (inputRef.current.right = false)}
                onPointerLeave={() => (inputRef.current.right = false)}
                onPointerCancel={() => (inputRef.current.right = false)}
                aria-label="Dash / Right"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#111827]/85 active:bg-[#2563EB] border-2 border-white/40 text-white flex flex-col items-center justify-center shadow-xl touch-manipulation"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none">
                  DASH
                </span>
              </button>
            </div>

            {/* Duck / Slide & Jump Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3 pointer-events-auto shrink-0">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  inputRef.current.down = true;
                }}
                onPointerUp={() => (inputRef.current.down = false)}
                onPointerLeave={() => (inputRef.current.down = false)}
                onPointerCancel={() => (inputRef.current.down = false)}
                aria-label="Duck or Slide"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#2563EB]/90 active:bg-blue-400 border-2 border-[#111827] text-white flex flex-col items-center justify-center shadow-xl touch-manipulation"
              >
                <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase leading-none">
                  DUCK
                </span>
              </button>

              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  inputRef.current.up = true;
                }}
                onPointerUp={() => (inputRef.current.up = false)}
                onPointerLeave={() => (inputRef.current.up = false)}
                onPointerCancel={() => (inputRef.current.up = false)}
                aria-label="Jump"
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#FACC15]/95 active:bg-yellow-300 border-2 border-[#111827] text-[#111827] flex flex-col items-center justify-center shadow-xl touch-manipulation"
              >
                <ChevronUp className="w-7 h-7 sm:w-9 sm:h-9 stroke-[3]" />
                <span className="text-[10px] sm:text-xs font-black uppercase leading-none">
                  JUMP
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 3: PAUSE MENU OVERLAY
      ==================================================================== */}
      {screen === "paused" && (
        <div className="absolute inset-0 z-30 bg-[#111827]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-4 border-[#FACC15] rounded-3xl p-6 text-center shadow-2xl">
            <h2 className="font-arcade text-3xl font-black text-[#FACC15]">
              GAME PAUSED
            </h2>
            <p className="font-bn text-lg text-slate-300 mt-0.5">
              একটু জিরিয়ে নিচ্ছি!
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setScreen("playing")}
                className="w-full py-3 bg-[#FACC15] hover:bg-yellow-300 text-[#111827] font-arcade font-black text-lg rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-[#111827]" /> RESUME
              </button>
              <button
                onClick={() => startNewRun(selectedLevelId)}
                className="w-full py-3 bg-[#2563EB] hover:bg-blue-500 text-white font-bold text-base rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" /> RESTART
              </button>
              <button
                onClick={() => setActiveModal("settings")}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-5 h-5 text-[#22D3EE]" /> SOUND SETTINGS
              </button>
              <button
                onClick={goToMainMenu}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" /> MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 4: VICTORY SCREEN
      ==================================================================== */}
      {screen === "victory" && (
        <div className="absolute inset-0 z-30 bg-gradient-to-b from-[#1E3A8A] via-[#111827] to-[#064E3B] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900/95 border-4 border-[#FACC15] rounded-3xl p-6 text-center shadow-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-[#111827] font-black text-xs uppercase px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-4 h-4" /> Border Crossed!
            </div>

            <h2 className="font-bn text-4xl sm:text-5xl font-bold text-[#FACC15] drop-shadow">
              জয় বাংলা!
            </h2>
            <div className="font-arcade text-xl sm:text-2xl font-black text-white mt-1">
              MISSION COMPLETED!
            </div>

            <div className="mt-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-2 font-bn text-lg text-[#22D3EE]">
              “{runResult.finalQuote}”
            </div>

            {runResult.isNewHigh && (
              <div className="mt-2 inline-block bg-[#EF4444] text-white text-xs font-black px-3 py-1 rounded-full animate-bounce">
                ★ NEW HIGH SCORE! ★
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] font-bold text-slate-400">
                  FINAL SCORE
                </div>
                <div className="font-arcade text-2xl font-black text-[#FACC15]">
                  {runResult.score}
                </div>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] font-bold text-slate-400">
                  BEST SCORE
                </div>
                <div className="font-arcade text-2xl font-black text-[#22D3EE]">
                  {saveData.highScore}
                </div>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] font-bold text-slate-400">
                  DISTANCE
                </div>
                <div className="font-arcade text-lg font-black text-white">
                  {runResult.distance}m
                </div>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] font-bold text-slate-400">
                  COLLECTIBLES
                </div>
                <div className="font-arcade text-lg font-black text-emerald-400">
                  {runResult.collectibles}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              {selectedLevelId < 4 && (
                <button
                  onClick={() => {
                    const nextId = selectedLevelId + 1;
                    setSelectedLevelId(nextId);
                    startNewRun(nextId);
                  }}
                  className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-[#111827] font-arcade font-black text-lg rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-[#111827]" /> NEXT ROUTE
                </button>
              )}
              <button
                onClick={() => startNewRun(selectedLevelId)}
                className="flex-1 py-3.5 bg-[#FACC15] hover:bg-yellow-300 text-[#111827] font-arcade font-black text-lg rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" /> PLAY AGAIN
              </button>
              <button
                onClick={goToMainMenu}
                className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" /> MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 5: GAME OVER SCREEN
      ==================================================================== */}
      {screen === "gameover" && (
        <div className="absolute inset-0 z-30 bg-gradient-to-b from-[#7F1D1D] via-[#111827] to-[#111827] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900/95 border-4 border-[#EF4444] rounded-3xl p-6 text-center shadow-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#EF4444] text-white font-black text-xs uppercase px-3 py-1 rounded-full mb-2">
              <ShieldAlert className="w-4 h-4" />
              {runResult.reason === "water"
                ? "Fell in the Canal!"
                : "Detected at the Border!"}
            </div>

            <h2 className="font-bn text-4xl sm:text-5xl font-bold text-[#EF4444] drop-shadow">
              আবার ধরা!
            </h2>
            <div className="font-arcade text-xl sm:text-2xl font-black text-white mt-1">
              GAME OVER!
            </div>

            <div className="mt-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 font-bn text-lg text-[#FACC15]">
              “{runResult.finalQuote}”
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                <div className="text-[10px] font-bold text-slate-400">
                  SCORE
                </div>
                <div className="font-arcade text-xl font-black text-[#FACC15]">
                  {runResult.score}
                </div>
              </div>
              <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                <div className="text-[10px] font-bold text-slate-400">BEST</div>
                <div className="font-arcade text-xl font-black text-[#22D3EE]">
                  {saveData.highScore}
                </div>
              </div>
              <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                <div className="text-[10px] font-bold text-slate-400">
                  DISTANCE
                </div>
                <div className="font-arcade text-xl font-black text-white">
                  {runResult.distance}m
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              {selectedLevelId < 4 && (
                <button
                  onClick={() => {
                    const nextId = selectedLevelId + 1;
                    setSelectedLevelId(nextId);
                    startNewRun(nextId);
                  }}
                  className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-[#111827] font-arcade font-black text-lg rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-[#111827]" /> NEXT ROUTE
                </button>
              )}
              <button
                onClick={() => startNewRun(selectedLevelId)}
                className="flex-1 py-3.5 bg-[#FACC15] hover:bg-yellow-300 text-[#111827] font-arcade font-black text-lg rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" /> PLAY AGAIN
              </button>
              <button
                onClick={goToMainMenu}
                className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-xl border-2 border-[#111827] arcade-shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" /> MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALS: HOW TO PLAY / SETTINGS / ABOUT
      ==================================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-40 bg-[#111827]/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border-4 border-[#22D3EE] rounded-3xl p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setActiveModal(null);
                setConfirmReset(false);
              }}
              aria-label="Close Modal"
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HOW TO PLAY MODAL */}
            {activeModal === "howto" && (
              <div>
                <h3 className="font-arcade text-2xl font-black text-[#FACC15] flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-[#22D3EE]" /> HOW TO PLAY
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  Guide Apa safely across the border gate while keeping your
                  Detection Level below 100%!
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
                    <div className="font-bold text-[#22D3EE] mb-1.5">
                      Desktop Controls
                    </div>
                    <ul className="space-y-1 text-slate-200 text-xs">
                      <li>
                        <strong className="text-[#FACC15]">
                          Space / W / ↑ :
                        </strong>{" "}
                        Jump & Double-Jump!
                      </li>
                      <li>
                        <strong className="text-[#FACC15]">S / ↓ :</strong>{" "}
                        Fast-Fall in air, Slide under beams
                      </li>
                      <li>
                        <strong className="text-[#FACC15]">A / ← :</strong> Slow
                        down to time BGB/Army cones
                      </li>
                      <li>
                        <strong className="text-[#FACC15]">D / → :</strong> Dash
                        through searchlights
                      </li>
                      <li>
                        <strong className="text-[#FACC15]">ESC / P :</strong>{" "}
                        Pause game
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
                    <div className="font-bold text-[#22D3EE] mb-1.5">
                      Items & Hazards
                    </div>
                    <ul className="space-y-1 text-slate-200 text-xs">
                      <li>
                        <strong className="text-[#FACC15]">৳ Taka Coin:</strong>{" "}
                        +50 Points
                      </li>
                      <li>
                        <strong className="text-[#22D3EE]">
                          ★ Bonus Star:
                        </strong>{" "}
                        +150 Points
                      </li>
                      <li>
                        <strong className="text-sky-300">
                          🐟 Hilsa (ইলিশ):
                        </strong>{" "}
                        +300 Pts & -18% Detection
                      </li>
                      <li>
                        <strong className="text-orange-400">
                          ☕ Hot Cha (চা):
                        </strong>{" "}
                        +200 Pts & Barrier Shield!
                      </li>
                      <li>
                        <strong className="text-[#EF4444]">
                          🔦 Guard Cones:
                        </strong>{" "}
                        Jump over or wait!
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="mt-5 w-full py-3 bg-[#FACC15] text-[#111827] font-arcade font-black rounded-xl border-2 border-[#111827] arcade-shadow cursor-pointer"
                >
                  GOT IT!
                </button>
              </div>
            )}

            {/* SETTINGS MODAL */}
            {activeModal === "settings" && (
              <div>
                <h3 className="font-arcade text-2xl font-black text-[#FACC15] flex items-center gap-2">
                  <Settings className="w-6 h-6 text-[#22D3EE]" /> SETTINGS
                </h3>

                <div className="mt-4 space-y-4">
                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() =>
                        updateSave((s) => ({
                          ...s,
                          musicEnabled: !s.musicEnabled,
                        }))
                      }
                      className={`p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-between cursor-pointer ${
                        saveData.musicEnabled
                          ? "bg-[#2563EB] border-[#22D3EE] text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      <span>Music</span>
                      <span>{saveData.musicEnabled ? "ON" : "OFF"}</span>
                    </button>

                    <button
                      onClick={() =>
                        updateSave((s) => ({ ...s, sfxEnabled: !s.sfxEnabled }))
                      }
                      className={`p-3 rounded-xl border-2 font-bold text-sm flex items-center justify-between cursor-pointer ${
                        saveData.sfxEnabled
                          ? "bg-[#2563EB] border-[#22D3EE] text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      <span>Sound FX</span>
                      <span>{saveData.sfxEnabled ? "ON" : "OFF"}</span>
                    </button>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Master Volume</span>
                        <span className="text-[#FACC15]">
                          {Math.round(saveData.masterVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={saveData.masterVolume}
                        onChange={(e) =>
                          updateSave({
                            masterVolume: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-[#FACC15]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Music Volume</span>
                        <span className="text-[#22D3EE]">
                          {Math.round(saveData.musicVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={saveData.musicVolume}
                        onChange={(e) =>
                          updateSave({
                            musicVolume: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-[#22D3EE]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>SFX Volume</span>
                        <span className="text-emerald-400">
                          {Math.round(saveData.sfxVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={saveData.sfxVolume}
                        onChange={(e) =>
                          updateSave({ sfxVolume: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Text-only Dialogue Banner Toggle */}
                  <button
                    onClick={() =>
                      updateSave((s) => ({
                        ...s,
                        textOnlyDialogue: !s.textOnlyDialogue,
                      }))
                    }
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    <span>Top HUD Dialogue Subtitles</span>
                    <span
                      className={
                        saveData.textOnlyDialogue
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }
                    >
                      {saveData.textOnlyDialogue ? "ENABLED" : "BUBBLE ONLY"}
                    </span>
                  </button>

                  {/* Reset LocalStorage Data with Confirmation */}
                  <div className="pt-2 border-t border-slate-800">
                    {!confirmReset ? (
                      <button
                        onClick={() => setConfirmReset(true)}
                        className="w-full py-2.5 bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> RESET LOCAL SAVE DATA
                      </button>
                    ) : (
                      <div className="bg-red-950 border-2 border-[#EF4444] p-3 rounded-xl text-center">
                        <p className="text-xs font-bold text-white mb-2">
                          Erase all high scores, unlocked routes, and settings
                          from this browser?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              updateSave({ ...DEFAULT_SAVE_DATA });
                              setSelectedLevelId(1);
                              setConfirmReset(false);
                            }}
                            className="flex-1 py-2 bg-[#EF4444] text-white font-black text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> YES, RESET
                          </button>
                          <button
                            onClick={() => setConfirmReset(false)}
                            className="flex-1 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-lg cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT MODAL */}
            {activeModal === "about" && (
              <div className="font-bn">
                <h3 className="text-2xl font-bold text-[#FACC15] flex items-center gap-2">
                  <Info className="w-6 h-6 text-[#22D3EE]" /> গেম সম্পর্কে
                </h3>
                <p className="text-xl font-bold text-white mt-2">
                  APA ASHCHE! — আপা আসছে! 🇧🇩
                </p>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                  বাংলাদেশের অদম্য{" "}
                  <strong className="text-[#FACC15]">জেন-জি (Gen Z)</strong>{" "}
                  প্রজন্মের প্রতি শ্রদ্ধা ও ভালোবাসা থেকে তৈরি এই মজার
                  পলিটিক্যাল স্যাটায়ার আর্কেড গেমটি। বাংলাদেশের সীমান্ত,
                  ইন্টারনেট মিম আর ক্লাসিক সাইড-স্ক্রলিং গেমের অনুপ্রেরণায় এটি
                  বানানো হয়েছে।
                </p>
                <div className="mt-3 bg-[#2563EB]/20 border border-[#22D3EE]/50 p-3 rounded-xl text-sm text-slate-100 leading-relaxed">
                  নির্মাতা: <strong className="text-[#FACC15]">RIZMEC</strong> —{" "}
                  <a
                    href="https://rizmec.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#22D3EE] underline font-bold hover:text-white"
                  >
                    rizmec.com
                  </a>
                </div>
                <div className="mt-3 bg-slate-800/90 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                  <div>
                    <strong>আপনার পরিসংখ্যান:</strong> মোট খেলা হয়েছে{" "}
                    {saveData.totalGamesPlayed} বার • সর্বোচ্চ দূরত্ব:{" "}
                    {saveData.bestDistance} মিটার
                  </div>
                  <div>
                    <strong>প্রাইভেসি:</strong> সম্পূর্ণ ব্রাউজার-ভিত্তিক। আপনার
                    সব স্কোর ও অগ্রগতি শুধুমাত্র আপনার ডিভাইসের LocalStorage-এ
                    সংরক্ষিত থাকে।
                  </div>
                  <div>
                    <strong>সতর্কতা:</strong> এটি একটি কাল্পনিক স্যাটায়ার ও
                    প্যারোডি গেম, শুধুমাত্র বিনোদনের উদ্দেশ্যে তৈরি।
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="mt-5 w-full py-3 bg-[#2563EB] text-white font-bold text-base rounded-xl border-2 border-[#111827] arcade-shadow cursor-pointer"
                >
                  মেনুতে ফিরে যান
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
