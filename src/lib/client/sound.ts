"use client";

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.12,
) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

export function playPop() {
  tone(440, 0, 0.06, "triangle", 0.1);
  tone(660, 0.05, 0.07, "triangle", 0.09);
}

export function playSelect() {
  tone(520, 0, 0.06, "sine", 0.1);
  tone(780, 0.06, 0.08, "sine", 0.1);
}

export function playCorrect() {
  tone(660, 0, 0.09, "triangle", 0.14);
  tone(880, 0.09, 0.12, "triangle", 0.13);
}

export function playError() {
  tone(220, 0, 0.12, "square", 0.07);
  tone(174, 0.13, 0.18, "square", 0.07);
}

export function playStamp() {
  tone(523.25, 0, 0.08, "sine", 0.12);
  tone(392, 0.08, 0.14, "sine", 0.1);
}

export function playLevelUp() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((f, i) => tone(f, i * 0.1, 0.18, "triangle", 0.16));
  tone(1567.98, 0.55, 0.32, "triangle", 0.12);
}

export function playWin() {
  const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  notes.forEach((f, i) => tone(f, i * 0.11, 0.2, "triangle", 0.15));
  tone(1318.5, 0.7, 0.4, "triangle", 0.13);
}

export function playTicket() {
  tone(880, 0, 0.05, "square", 0.11);
  tone(1174.66, 0.06, 0.09, "square", 0.1);
}

export function playBadge() {
  tone(880, 0, 0.12, "sine", 0.13);
  tone(1108.73, 0.12, 0.18, "sine", 0.12);
  tone(1318.5, 0.3, 0.22, "sine", 0.11);
}

let warnedTtsUnavailable = false;

export function speakNative(name: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const ss = window.speechSynthesis;
  const voices = ss.getVoices();
  if (voices.length === 0) {
    if (!warnedTtsUnavailable) {
      warnedTtsUnavailable = true;
      console.warn(
        "Atlas: la síntesis de voz no está disponible en este navegador " +
          "(falta Speech Dispatcher / espeak-ng en el sistema).",
      );
    }
    return;
  }
  try {
    ss.cancel();
    const u = new SpeechSynthesisUtterance(name);
    u.lang = lang;
    u.rate = 0.92;
    const v =
      voices.find((x) => x.lang.toLowerCase() === lang.toLowerCase()) ??
      voices.find((x) => x.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (v) u.voice = v;
    u.onerror = () => {};
    ss.speak(u);
  } catch {}
}