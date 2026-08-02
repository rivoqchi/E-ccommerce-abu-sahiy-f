/**
 * Soft "added to cart" chime via Web Audio (no asset file).
 * Safe to call from click handlers — browsers unlock audio after user gesture.
 */
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AC();
  }
  return sharedCtx;
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    gain = 0.08,
    type = "sine",
  }: {
    frequency: number;
    start: number;
    duration: number;
    gain?: number;
    type?: OscillatorType;
  },
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playAddToCartSound(): void {
  try {
    const ctx = getCtx();
    if (!ctx) return;

    void ctx.resume();
    const t = ctx.currentTime;

    // Soft cash / success: low thud + bright ascending ding
    tone(ctx, {
      frequency: 220,
      start: t,
      duration: 0.12,
      gain: 0.05,
      type: "triangle",
    });
    tone(ctx, {
      frequency: 880,
      start: t + 0.05,
      duration: 0.18,
      gain: 0.07,
      type: "sine",
    });
    tone(ctx, {
      frequency: 1318.5,
      start: t + 0.12,
      duration: 0.28,
      gain: 0.06,
      type: "sine",
    });
  } catch {
    // Ignore autoplay / AudioContext errors
  }
}
