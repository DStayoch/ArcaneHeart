import Phaser from 'phaser';
import type { RoomId } from '../core/types';

export type AudioCue = 'build' | 'sell' | 'hit' | 'death' | 'combo' | 'wave' | 'boss' | 'win' | 'loss';

export class AudioSystem {
  private ctx?: AudioContext;
  private lastRoomSound = new Map<string, number>();

  constructor(private scene: Phaser.Scene) {}

  play(cue: AudioCue) {
    this.ensureContext();
    const now = this.ctx?.currentTime ?? 0;
    const cueNotes: Record<AudioCue, number[]> = {
      build: [440, 660, 880],
      sell: [390, 260],
      hit: [180],
      death: [520, 390, 260],
      combo: [392, 587, 784, 1046],
      wave: [196, 262, 330],
      boss: [90, 75, 110],
      win: [523, 659, 784, 1046],
      loss: [220, 165, 110],
    };
    this.chime(cueNotes[cue], now, cue === 'boss' || cue === 'loss' ? 'sawtooth' : 'sine', 0.045);
    const colors: Record<AudioCue, number> = {
      build: 0x95ffbd,
      sell: 0xffd27a,
      hit: 0xff9b74,
      death: 0xcaa8ff,
      combo: 0xa8f4ff,
      wave: 0xffe28a,
      boss: 0xff5da5,
      win: 0xbfffb8,
      loss: 0xff809e,
    };
    const pulse = this.scene.add.circle(1228, 28, 8, colors[cue], 0.55).setDepth(700);
    this.scene.tweens.add({ targets: pulse, scale: 2.4, alpha: 0, duration: 260, onComplete: () => pulse.destroy() });
  }

  playRoom(roomId: RoomId) {
    const nowMs = this.scene.time.now;
    const last = this.lastRoomSound.get(roomId) ?? 0;
    if (nowMs - last < 140) return;
    this.lastRoomSound.set(roomId, nowMs);
    this.ensureContext();
    const now = this.ctx?.currentTime ?? 0;
    switch (roomId) {
      case 'root_library':
        this.chime([164, 220, 247], now, 'triangle', 0.035);
        this.noiseBurst(now, 0.035, 500);
        break;
      case 'fire_imp_kitchen':
        this.chime([180, 120], now, 'sawtooth', 0.04);
        this.noiseBurst(now, 0.055, 900);
        break;
      case 'moon_bell':
        this.chime([523, 784, 1046], now, 'sine', 0.05, 0.28);
        break;
      case 'mirror_hatchery':
        this.chime([740, 988, 1318], now, 'triangle', 0.035, 0.11);
        break;
      case 'grave_moth_chapel':
        this.chime([196, 233, 294], now, 'sine', 0.034, 0.22);
        break;
      case 'clockwork_orrery':
        this.chime([330, 330, 440], now, 'square', 0.024, 0.07);
        break;
      case 'storm_harp':
        this.chime([392, 587, 880], now, 'sawtooth', 0.035, 0.1);
        this.noiseBurst(now, 0.025, 1800);
        break;
      case 'cauldron_nursery':
        this.chime([262, 330, 392], now, 'sine', 0.032, 0.09);
        break;
      default:
        break;
    }
  }

  private ensureContext() {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    this.ctx ??= new AudioContextCtor();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private chime(frequencies: number[], start: number, type: OscillatorType, gainValue: number, step = 0.075) {
    if (!this.ctx) return;
    frequencies.forEach((frequency, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = start + index * step;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(gain).connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  private noiseBurst(start: number, gainValue: number, lowpass: number) {
    if (!this.ctx) return;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.12, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpass, start);
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(this.ctx.destination);
    source.start(start);
  }
}
