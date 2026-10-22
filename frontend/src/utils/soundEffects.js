// Web Audio API Sound Synthesis for Charan Portfolio
// Pure synthesized, zero-latency tactile audio feedback (< 1 second)
// Zero external asset dependencies, works offline and across all modern browsers.

let audioCtx = null;
const listeners = new Set();

const STORAGE_KEY = 'charan_portfolio_sound_enabled';

// Initialize state from localStorage (defaults to true)
let soundEnabled = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  } catch (e) {
    return true;
  }
})();

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = !!enabled;
  try {
    localStorage.setItem(STORAGE_KEY, String(soundEnabled));
  } catch (e) {}
  listeners.forEach((fn) => fn(soundEnabled));
  if (soundEnabled) {
    playClickSound('switch');
  }
}

export function toggleSound() {
  setSoundEnabled(!soundEnabled);
  return soundEnabled;
}

export function onSoundStateChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Synthesizes ultra-short, crisp tactile sound effects (all < 0.35s)
 * @param {'click' | 'pop' | 'switch' | 'brake' | 'hologram' | 'success'} type
 */
export function playClickSound(type = 'click') {
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  switch (type) {
    case 'pop': {
      // Soft rounded acoustic bubble pop (~75ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.075);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.20, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }

    case 'switch': {
      // Tactile toggle / switch click (~50ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.055);
      break;
    }

    case 'brake': {
      // Cybernetic brake stop power-down blip (~150ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.14);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
      break;
    }

    case 'hologram': {
      // Sci-fi hologram laser warp chime (~320ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1150, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.32);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      // Shimmer frequency modulation
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      mod.frequency.setValueAtTime(24, now);
      modGain.gain.setValueAtTime(40, now);
      mod.connect(osc.frequency);
      mod.start(now);
      mod.stop(now + 0.33);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.33);
      break;
    }

    case 'success': {
      // Affirmative two-tone confirmation chime (~220ms)
      const tones = [587.33, 880]; // D5, A5
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.20, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.15);
      });
      break;
    }

    case 'click':
    default: {
      // Modern high-tech glass/mechanical micro-click (~45ms)
      // Double pulse for realistic tactile response
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.045);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
  }
}

/**
 * Initializes global click listener to automatically provide tactile sound
 * on any button, anchor link, tab, or interactive UI element across the website.
 */
export function initGlobalButtonSounds() {
  if (typeof window === 'undefined') return () => {};

  const handlePointerDown = (e) => {
    const clickable = e.target.closest(
      'button, a, select, [role="button"], input[type="submit"], input[type="button"], .nav-item-link, .filter-btn, .btn'
    );
    if (!clickable) return;
    if (clickable.dataset.noSound === 'true') return;

    // Support custom sound type specified via data-sound attribute
    const soundType = clickable.dataset.sound || 'click';
    playClickSound(soundType);
  };

  document.addEventListener('pointerdown', handlePointerDown, { passive: true });

  return () => {
    document.removeEventListener('pointerdown', handlePointerDown);
  };
}
