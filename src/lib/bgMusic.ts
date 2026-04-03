// Background ambient music generator per room using Web Audio API
let musicCtx: AudioContext | null = null;
let currentNodes: { oscillators: OscillatorNode[]; gains: GainNode[]; masterGain: GainNode } | null = null;
let currentRoomId: string | null = null;

function getMusicCtx(): AudioContext {
  if (!musicCtx) musicCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return musicCtx;
}

interface RoomAmbience {
  baseFreqs: number[];
  lfoRate: number;
  waveType: OscillatorType;
  volume: number;
}

const ROOM_AMBIENCE: Record<string, RoomAmbience> = {
  strength: {
    baseFreqs: [55, 82.41, 110],
    lfoRate: 0.15,
    waveType: 'sawtooth',
    volume: 0.06,
  },
  intelligence: {
    baseFreqs: [220, 277.18, 329.63],
    lfoRate: 0.08,
    waveType: 'sine',
    volume: 0.05,
  },
  memory: {
    baseFreqs: [196, 246.94, 293.66],
    lfoRate: 0.12,
    waveType: 'triangle',
    volume: 0.05,
  },
  strategy: {
    baseFreqs: [65.41, 98, 130.81],
    lfoRate: 0.1,
    waveType: 'square',
    volume: 0.04,
  },
  stealth: {
    baseFreqs: [146.83, 185, 220],
    lfoRate: 0.06,
    waveType: 'sine',
    volume: 0.04,
  },
  boss: {
    baseFreqs: [41.2, 61.74, 82.41],
    lfoRate: 0.2,
    waveType: 'sawtooth',
    volume: 0.07,
  },
};

export function startBgMusic(roomId: string) {
  if (currentRoomId === roomId && currentNodes) return;
  stopBgMusic();

  const ambience = ROOM_AMBIENCE[roomId];
  if (!ambience) return;

  const ctx = getMusicCtx();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(ambience.volume, ctx.currentTime + 2);
  masterGain.connect(ctx.destination);

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  ambience.baseFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = ambience.waveType;
    osc.frequency.value = freq;
    // Slight detuning for richness
    osc.detune.value = (i - 1) * 5;
    gain.gain.value = 1 / ambience.baseFreqs.length;
    osc.connect(gain);
    gain.connect(masterGain);

    // LFO for subtle movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = ambience.lfoRate + i * 0.02;
    lfo.type = 'sine';
    lfoGain.gain.value = freq * 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    osc.start();
    oscillators.push(osc, lfo);
    gains.push(gain, lfoGain);
  });

  currentNodes = { oscillators, gains, masterGain };
  currentRoomId = roomId;
}

export function stopBgMusic() {
  if (currentNodes) {
    const ctx = getMusicCtx();
    currentNodes.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    const nodes = currentNodes;
    setTimeout(() => {
      nodes.oscillators.forEach(o => { try { o.stop(); } catch {} });
      nodes.oscillators.forEach(o => { try { o.disconnect(); } catch {} });
      nodes.gains.forEach(g => { try { g.disconnect(); } catch {} });
      try { nodes.masterGain.disconnect(); } catch {}
    }, 1200);
    currentNodes = null;
    currentRoomId = null;
  }
}
