/**
 * Web Audio API synthesizer for Adhan prayer calls and Dhikr feedback
 * Works 100% offline with zero external audio assets
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTasbeehTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  playCompletionChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 1.3);
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 80]);
      }
    } catch {
      // ignore
    }
  }

  playAdhanSample(): () => void {
    const ctx = this.getContext();
    if (!ctx) return () => {};

    let isCancelled = false;
    const melody: Array<{ freq: number; dur: number; pause: number }> = [
      { freq: 293.66, dur: 0.6, pause: 0.1 }, // D4
      { freq: 329.63, dur: 0.7, pause: 0.1 }, // E4
      { freq: 349.23, dur: 1.2, pause: 0.3 }, // F4
      { freq: 440.00, dur: 1.4, pause: 0.4 }, // A4
      { freq: 392.00, dur: 1.8, pause: 0.8 }, // G4
      { freq: 293.66, dur: 0.6, pause: 0.1 }, // D4
      { freq: 349.23, dur: 0.8, pause: 0.1 }, // F4
      { freq: 440.00, dur: 1.5, pause: 0.4 }, // A4
      { freq: 392.00, dur: 2.2, pause: 0.5 }, // G4
    ];

    let startTime = ctx.currentTime + 0.05;

    melody.forEach((note) => {
      if (isCancelled) return;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(note.freq, startTime);
      osc2.frequency.setValueAtTime(note.freq * 2, startTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + note.dur + 0.1);
      osc2.stop(startTime + note.dur + 0.1);

      startTime += note.dur + note.pause;
    });

    return () => {
      isCancelled = true;
    };
  }
}

export const soundEngine = new SoundEngine();

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

export function sendPrayerNotification(prayerName: string, locationName: string) {
  if (typeof window === 'undefined') return;

  soundEngine.playAdhanSample();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`Time for ${prayerName} Prayer`, {
        body: `Adhan has arrived for ${prayerName} in ${locationName}. Hayya 'alas-Salah!`,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `prayer-${prayerName}-${Date.now()}`
      });
    } catch {
      // Fallback
    }
  }
}
