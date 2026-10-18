/* ==========================================================================
   NetFix — Modul Audio Feedback Interaktif (Web Audio API Synthesizer)
   Menerapkan Prinsip Audio Clarity & Signaling (Richard E. Mayer)
   File: audio.js
   ========================================================================== */

window.NetFixAudio = (function () {
  let ctx = null;
  let muted = false;

  function ensureContext() {
    if (muted) return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function playTone(freq, durationMs, type, gainVal) {
    const ac = ensureContext();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      gain.gain.setValueAtTime(gainVal || 0.08, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + durationMs / 1000);
    } catch (e) {}
  }

  return {
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      if (!muted) this.click();
      return muted;
    },
    click: function () {
      playTone(520, 70, "sine", 0.06);
    },
    scan: function () {
      playTone(680, 90, "triangle", 0.07);
      setTimeout(function () { playTone(880, 110, "triangle", 0.07); }, 95);
    },
    success: function () {
      playTone(523.25, 110, "sine", 0.09);
      setTimeout(function () { playTone(659.25, 110, "sine", 0.09); }, 110);
      setTimeout(function () { playTone(783.99, 180, "sine", 0.10); }, 220);
    },
    error: function () {
      playTone(240, 160, "sawtooth", 0.07);
      setTimeout(function () { playTone(190, 200, "sawtooth", 0.07); }, 150);
    }
  };
})();
