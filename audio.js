/**
 * Audio Engine: Romantic Ballad Music Player + Sound Effects
 * Supports:
 * 1. High-fidelity Romantic Piano MP3 ("romantic_piano.mp3")
 * 2. Romantic Acoustic Guitar MP3 ("romantic_guitar.mp3")
 * 3. Built-in Web Audio API Synthesizer (Nàng Thơ / Ánh Nắng Của Anh emotional chord progression)
 */

class RomanticAudioManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentTrack = 'gymnopedie'; // 'gymnopedie', 'canon', 'guitar', 'piano', 'synth'
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.preload = 'auto';

    this.tracks = {
      gymnopedie: {
        name: "Gymnopédie No. 1 (Piano Dịu Êm) 🎹",
        src: "assets/gymnopedie.mp3"
      },
      canon: {
        name: "Canon in D (Lãng Mạn) 🎼",
        src: "assets/canon_in_d.mp3"
      },
      guitar: {
        name: "Acoustic Love Guitar 🎸",
        src: "assets/romantic_guitar.mp3"
      },
      piano: {
        name: "Romantic Cinematic Piano 🎹",
        src: "assets/romantic_piano.mp3"
      },
      synth: {
        name: "Nàng Thơ (Lofi Synth) 🎵",
        src: null
      }
    };

    // Emotional Chord Progression for Web Audio fallback
    // (D - A/C# - Bm7 - G - F#m7 - Em7 - Asus4 - A) - Classic Romantic V-pop Ballad
    this.chords = [
      { root: 146.83, notes: [146.83, 220.00, 293.66, 369.99, 440.00, 587.33] }, // D
      { root: 138.59, notes: [138.59, 220.00, 277.18, 329.63, 440.00, 554.37] }, // A/C#
      { root: 123.47, notes: [123.47, 185.00, 220.00, 293.66, 369.99, 440.00] }, // Bm7
      { root: 98.00,  notes: [196.00, 246.94, 293.66, 392.00, 440.00, 587.33] }, // G
      { root: 92.50,  notes: [185.00, 220.00, 277.18, 369.99, 440.00, 554.37] }, // F#m7
      { root: 82.41,  notes: [164.81, 196.00, 246.94, 329.63, 392.00, 493.88] }, // Em7
      { root: 110.00, notes: [220.00, 293.66, 329.63, 440.00, 554.37, 587.33] }, // Asus4
      { root: 110.00, notes: [220.00, 277.18, 329.63, 440.00, 554.37, 659.25] }  // A
    ];

    this.arpeggioPatterns = [
      [0, 1, 2, 3, 4, 3, 2, 1],
      [0, 2, 1, 3, 2, 4, 3, 5],
      [0, 1, 3, 4, 2, 3, 1, 2]
    ];

    this.currentStep = 0;
    this.synthTimer = null;
  }

  initWebAudio() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(1600, this.ctx.currentTime);

    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  playSparkle(pitchShift = 1.0) {
    if (!this.ctx) this.initWebAudio();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98];

    for (let i = 0; i < 3; i++) {
      const freq = notes[Math.floor(Math.random() * notes.length)] * pitchShift;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.0001, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.07, now + i * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    }
  }

  playNote(freq, time, duration = 1.8, velocity = 0.22) {
    if (!this.ctx || !this.isPlaying || this.currentTrack !== 'synth') return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, time);

    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(velocity, time + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(velocity * 0.4, time + 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.filter);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  scheduleSynthLoop() {
    if (!this.isPlaying || this.currentTrack !== 'synth') return;

    const tempoBpm = 68;
    const beatSec = 60 / tempoBpm;
    const stepSec = beatSec / 2;

    let chordIdx = Math.floor(this.currentStep / 8) % this.chords.length;
    let stepInChord = this.currentStep % 8;
    let chord = this.chords[chordIdx];
    let pattern = this.arpeggioPatterns[chordIdx % this.arpeggioPatterns.length];

    let noteIdx = pattern[stepInChord % pattern.length];
    let freq = chord.notes[noteIdx % chord.notes.length];

    const now = this.ctx.currentTime;
    if (stepInChord === 0) {
      this.playNote(chord.root, now, beatSec * 3.5, 0.35);
    }

    const vel = stepInChord === 0 ? 0.28 : 0.18;
    this.playNote(freq, now, beatSec * 1.5, vel);

    this.currentStep++;

    this.synthTimer = setTimeout(() => {
      this.scheduleSynthLoop();
    }, stepSec * 1000);
  }

  setTrack(trackKey) {
    if (!this.tracks[trackKey]) return;
    this.currentTrack = trackKey;
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  nextTrack() {
    const keys = Object.keys(this.tracks);
    const nextIdx = (keys.indexOf(this.currentTrack) + 1) % keys.length;
    this.setTrack(keys[nextIdx]);
    return this.tracks[this.currentTrack].name;
  }

  start() {
    this.initWebAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;

    if (this.currentTrack === 'synth') {
      this.audioElement.pause();
      this.scheduleSynthLoop();
    } else {
      if (this.synthTimer) clearTimeout(this.synthTimer);
      const track = this.tracks[this.currentTrack];
      if (this.audioElement.src !== location.origin + '/' + track.src && !this.audioElement.src.endsWith(track.src)) {
        this.audioElement.src = track.src;
      }
      this.audioElement.volume = 0.40;
      this.audioElement.play().catch(e => {
        console.log('Audio autoplay prevented, falling back to Web Audio synth:', e);
        this.currentTrack = 'synth';
        this.scheduleSynthLoop();
      });
    }
  }

  stop() {
    this.isPlaying = false;
    this.audioElement.pause();
    if (this.synthTimer) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

window.romanticAudio = new RomanticAudioManager();
