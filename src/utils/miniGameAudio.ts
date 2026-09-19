// Web Audio API Sound Synthesizer for Disc Golf Mini-Game
// Zero external sound files needed, ultra-low latency, works offline!

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playWhoosh() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      filter.type = 'lowpass';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(800, now + 0.1);
      filter.frequency.linearRampToValueAtTime(200, now + 0.28);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // AudioContext failure safe guard
    }
  }

  // Realistic chain rattle sound synthesis
  public playChainRattle() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Cluster of metallic frequencies simulating multiple metal links hitting each other
      const freqs = [1250, 1680, 2150, 2600, 3100, 3850, 4400, 5200];
      
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq + (Math.random() * 80 - 40), now);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, now);
        filter.Q.setValueAtTime(12, now);

        const stagger = idx * 0.025 + Math.random() * 0.02;
        const duration = 0.35 + Math.random() * 0.35;

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.12, now + stagger);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + stagger + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + stagger);
        osc.stop(now + stagger + duration + 0.05);
      });

      // Low basket pole impact 'thump'
      const poleOsc = this.ctx.createOscillator();
      const poleGain = this.ctx.createGain();
      poleOsc.type = 'sine';
      poleOsc.frequency.setValueAtTime(180, now);
      poleOsc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
      poleGain.gain.setValueAtTime(0.25, now);
      poleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      poleOsc.connect(poleGain);
      poleGain.connect(this.ctx.destination);
      poleOsc.start(now);
      poleOsc.stop(now + 0.2);

    } catch {
      // AudioContext safe guard
    }
  }

  // Metallic cage or band clink
  public playCageClink() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext safe guard
    }
  }

  // Cheer / success chime for streaks
  public playCheerChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch {
      // AudioContext safe guard
    }
  }

  // Miss / buzzer sound
  public playMiss() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // AudioContext safe guard
    }
  }
}

export const gameAudio = new SoundEngine();
