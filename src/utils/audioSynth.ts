/**
 * Web Audio API synthesizer for royalty-free, zero-network-dependency background music and sound effects.
 * Produces crisp, beautiful melodic tracks right inside the browser.
 */

// Global AudioContext singleton (lazily initialized on first user interaction)
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export interface SynthPlaybackHandle {
  stop: () => void;
  setVolume: (v: number) => void;
  gainNode: GainNode;
  destinationNode?: MediaStreamAudioDestinationNode;
}

/**
 * Play a synthesized musical loop based on style.
 * Returns a handle to adjust volume or stop playback.
 */
export function playSynthTrack(
  trackId: string,
  volume = 0.5,
  outputDestination?: AudioNode
): SynthPlaybackHandle {
  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);

  if (outputDestination) {
    masterGain.connect(outputDestination);
  } else {
    masterGain.connect(ctx.destination);
  }

  const activeOscillators: OscillatorNode[] = [];
  let isPlaying = true;
  let timerId: number | null = null;

  // Track definitions
  if (trackId === 'lofi-chill') {
    // Warm chord progression: Cmaj7 - Am7 - Dm7 - G7
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 349.23]  // G7
    ];
    let step = 0;

    const playChordStep = () => {
      if (!isPlaying) return;
      const chord = chords[step % chords.length];
      step++;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm electric piano tone
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.85);
        activeOscillators.push(osc);
      });

      // Subtle vinyl click/percussion
      const noiseOsc = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noiseOsc.type = 'sawtooth';
      noiseOsc.frequency.setValueAtTime(80, ctx.currentTime);
      noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      noiseOsc.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseOsc.start(ctx.currentTime);
      noiseOsc.stop(ctx.currentTime + 0.09);

      timerId = window.setTimeout(playChordStep, 1500);
    };

    playChordStep();
  } else if (trackId === 'upbeat-dance') {
    // Energetic bassline & synth pluck: 124 BPM
    const bassNotes = [130.81, 130.81, 146.83, 164.81, 174.61, 174.61, 164.81, 146.83];
    const leadNotes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33];
    let step = 0;

    const playDanceStep = () => {
      if (!isPlaying) return;
      const bFreq = bassNotes[step % bassNotes.length];
      const lFreq = leadNotes[(step * 2) % leadNotes.length];
      step++;

      // Bass punch
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      bOsc.type = 'sawtooth';
      bOsc.frequency.setValueAtTime(bFreq, ctx.currentTime);
      bGain.gain.setValueAtTime(0.08, ctx.currentTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      bOsc.connect(bGain);
      bGain.connect(masterGain);
      bOsc.start(ctx.currentTime);
      bOsc.stop(ctx.currentTime + 0.36);

      // Lead pluck
      const lOsc = ctx.createOscillator();
      const lGain = ctx.createGain();
      lOsc.type = 'square';
      lOsc.frequency.setValueAtTime(lFreq, ctx.currentTime);
      lGain.gain.setValueAtTime(0.02, ctx.currentTime);
      lGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      lOsc.connect(lGain);
      lGain.connect(masterGain);
      lOsc.start(ctx.currentTime);
      lOsc.stop(ctx.currentTime + 0.21);

      timerId = window.setTimeout(playDanceStep, 380);
    };

    playDanceStep();
  } else if (trackId === 'cinematic-pulse') {
    // Deep atmospheric drone with resonant sweep
    const frequencies = [65.41, 98.0, 130.81, 196.0];
    let step = 0;

    const playAtmosphere = () => {
      if (!isPlaying) return;
      const freq = frequencies[step % frequencies.length];
      step++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 2.5);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.45);

      timerId = window.setTimeout(playAtmosphere, 2200);
    };

    playAtmosphere();
  } else if (trackId === 'gentle-acoustic') {
    // Gentle Acoustic style: soothing arpeggio
    const arpeggio = [220.0, 277.18, 329.63, 440.0, 329.63, 277.18];
    let step = 0;

    const playArp = () => {
      if (!isPlaying) return;
      const freq = arpeggio[step % arpeggio.length];
      step++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.52);

      timerId = window.setTimeout(playArp, 300);
    };

    playArp();
  } else if (trackId.startsWith('tt-') || trackId) {
    // Dynamic TikTok Viral Song synthesizer
    // Determines musical pattern based on track ID
    const isPhonk = trackId.includes('murder') || trackId.includes('eyes') || trackId.includes('sahara') || trackId.includes('keraunos') || trackId.includes('phonk') || trackId.includes('metamorphosis') || trackId.includes('memphis') || trackId.includes('rave');
    const isLofi = trackId.includes('lofi') || trackId.includes('sunset') || trackId.includes('rain') || trackId.includes('study') || trackId.includes('breeze') || trackId.includes('matcha') || trackId.includes('serenade');
    const isSpeedup = trackId.includes('spedup') || trackId.includes('speed') || trackId.includes('somewhere') || trackId.includes('until') || trackId.includes('starboy') || trackId.includes('stereo');
    const isCinematic = trackId.includes('interstellar') || trackId.includes('cornfield') || trackId.includes('moment') || trackId.includes('midnight') || trackId.includes('experience') || trackId.includes('solitude') || trackId.includes('horizon');

    let step = 0;
    const intervalMs = isSpeedup ? 170 : isPhonk ? 230 : isLofi ? 420 : isCinematic ? 550 : 250;

    const playTikTokStep = () => {
      if (!isPlaying) return;

      if (isPhonk) {
        // Heavy distorted phonk sub bass & cowbell
        const bassFreq = [55, 55, 65.4, 73.4, 82.4, 55, 98][step % 7];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        activeOscillators.push(osc);

        // Phonk cowbell synth stab on alternate beats
        if (step % 2 === 0) {
          const cowbell = ctx.createOscillator();
          const cbGain = ctx.createGain();
          cowbell.type = 'square';
          cowbell.frequency.setValueAtTime(587.33, ctx.currentTime);
          cbGain.gain.setValueAtTime(0.06, ctx.currentTime);
          cbGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
          cowbell.connect(cbGain);
          cbGain.connect(masterGain);
          cowbell.start(ctx.currentTime);
          cowbell.stop(ctx.currentTime + 0.2);
          activeOscillators.push(cowbell);
        }
      } else if (isLofi) {
        // Dreamy lofi e-piano chords
        const lofiChords = [
          [261.63, 329.63, 392.0, 493.88],
          [220.0, 261.63, 329.63, 392.0],
          [293.66, 349.23, 440.0, 523.25],
        ];
        const chord = lofiChords[step % lofiChords.length];
        chord.forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          g.gain.setValueAtTime(0.001, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 1.25);
          activeOscillators.push(osc);
        });
      } else if (isCinematic) {
        // Grand orchestral synth swells
        const droneFreq = [110, 130.81, 146.83, 164.81][step % 4];
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(droneFreq, ctx.currentTime);
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.2);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.85);
        activeOscillators.push(osc);
      } else {
        // Upbeat viral pop synth & bass
        const popNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
        const note = popNotes[(step * 2) % popNotes.length];
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = step % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        g.gain.setValueAtTime(0.05, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.24);
        activeOscillators.push(osc);
      }

      step++;
      timerId = window.setTimeout(playTikTokStep, intervalMs);
    };

    playTikTokStep();
  }

  return {
    stop: () => {
      isPlaying = false;
      if (timerId !== null) clearTimeout(timerId);
      activeOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore already stopped
        }
      });
      masterGain.disconnect();
    },
    setVolume: (v: number) => {
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime);
    },
    gainNode: masterGain,
  };
}

/**
 * Creates an audio stream destination connected to synthesized background music
 * for recording into MediaRecorder.
 */
export function createSynthStream(
  trackId: string,
  volume = 0.5
): { stream: MediaStream; handle: SynthPlaybackHandle } {
  const ctx = getAudioContext();
  const dest = ctx.createMediaStreamDestination();
  const handle = playSynthTrack(trackId, volume, dest);
  return { stream: dest.stream, handle };
}

/**
 * Convert AudioBuffer to downloadable WAV blob with proper 44-byte RIFF header.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  out.setUint8(pos++, 0x52); out.setUint8(pos++, 0x49); out.setUint8(pos++, 0x46); out.setUint8(pos++, 0x46); // "RIFF"
  setUint32(length - 8);
  out.setUint8(pos++, 0x57); out.setUint8(pos++, 0x41); out.setUint8(pos++, 0x56); out.setUint8(pos++, 0x45); // "WAVE"
  out.setUint8(pos++, 0x66); out.setUint8(pos++, 0x6d); out.setUint8(pos++, 0x74); out.setUint8(pos++, 0x20); // "fmt "
  setUint32(16); // subchunk1size (16 for PCM)
  setUint16(1); // audio format (1 is PCM)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample
  out.setUint8(pos++, 0x64); out.setUint8(pos++, 0x61); out.setUint8(pos++, 0x74); out.setUint8(pos++, 0x61); // "data"
  setUint32(length - pos - 4);

  // write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
