// Web Audio API Synthesizer for "Flappy Disc: Wood Flight"
// Zero external files, ultra-responsive, works offline!

class FlappySoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private init() {
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

  // Air lift / flap whoosh
  public playFlap() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // safe fallback
    }
  }

  // Tree wood clunk / thud
  public playWoodHit() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // safe fallback
    }
  }

  // Metallic chain splash for basket ace!
  public playChains() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [1350, 1820, 2300, 2850, 3400, 4200, 4900];

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq + (Math.random() * 60 - 30), now);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, now);
        filter.Q.setValueAtTime(14, now);

        const stagger = idx * 0.02;
        const duration = 0.4 + Math.random() * 0.3;

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.14, now + stagger);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + stagger + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + stagger);
        osc.stop(now + stagger + duration + 0.05);
      });
    } catch {
      // safe fallback
    }
  }

  // Victory fanfare on sinking the ace
  public playVictory() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.1 }, // C5
        { f: 659.25, d: 0.1 }, // E5
        { f: 783.99, d: 0.1 }, // G5
        { f: 1046.5, d: 0.35 } // C6
      ];

      let t = now;
      melody.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + note.d);

        t += note.d * 0.9;
      });
    } catch {
      // safe fallback
    }
  }
}

export const flappyAudio = new FlappySoundEngine();
