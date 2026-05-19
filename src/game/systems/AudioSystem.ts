import Phaser from 'phaser';
import type { RoomId } from '../core/types';

export type AudioCue = 'build' | 'sell' | 'hit' | 'damage' | 'death' | 'combo' | 'wave' | 'boss' | 'win' | 'loss';
export type VolumeLevel = 'Muted' | 'Half' | 'Full';

export class AudioSystem {
  private ctx?: AudioContext;
  private masterGain?: GainNode;
  private lastRoomSound = new Map<string, number>();
  private volume: VolumeLevel = 'Full';

  constructor(private scene: Phaser.Scene) {}

  unlock() {
    this.ensureContext();
    if (!this.ctx) return;
    void this.ctx.resume();
    this.magicSweep(this.ctx.currentTime, 420, 820, 0.18, 0.025);
  }

  cycleVolume() {
    this.volume = this.volume === 'Full' ? 'Half' : this.volume === 'Half' ? 'Muted' : 'Full';
    this.applyVolume();
    return this.volume;
  }

  volumeLabel() {
    return this.volume;
  }

  play(cue: AudioCue) {
    this.ensureContext();
    const now = this.ctx?.currentTime ?? 0;
    if (cue === 'build') this.magicSweep(now, 260, 760, 0.32, 0.045);
    if (cue === 'sell') this.magicSweep(now, 520, 180, 0.22, 0.035);
    if (cue === 'hit') this.thump(now, 150, 0.035);
    if (cue === 'damage') this.crackle(now, 0.035, 1300);
    if (cue === 'death') {
      this.thump(now, 90, 0.055);
      this.crackle(now, 0.045, 900);
    }
    if (cue === 'combo') {
      this.magicSweep(now, 240, 1180, 0.42, 0.055);
      this.crackle(now + 0.05, 0.03, 2200);
    }
    if (cue === 'wave') this.magicSweep(now, 110, 520, 0.55, 0.04);
    if (cue === 'boss') {
      this.thump(now, 65, 0.08);
      this.magicSweep(now, 180, 72, 0.7, 0.045);
    }
    if (cue === 'win') this.magicSweep(now, 330, 1320, 0.8, 0.05);
    if (cue === 'loss') this.magicSweep(now, 260, 55, 0.8, 0.05);
    const colors: Record<AudioCue, number> = {
      build: 0x95ffbd,
      sell: 0xffd27a,
      hit: 0xff9b74,
      damage: 0xff9b74,
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
        this.magicSweep(now, 150, 310, 0.16, 0.028);
        this.crackle(now, 0.02, 520);
        break;
      case 'fire_imp_kitchen':
        this.crackle(now, 0.06, 1200);
        this.thump(now, 120, 0.03);
        break;
      case 'moon_bell':
        this.chime([392, 587, 880], now, 'sine', 0.035, 0.16);
        this.magicSweep(now, 720, 1180, 0.5, 0.018);
        break;
      case 'mirror_hatchery':
        this.magicSweep(now, 880, 1440, 0.18, 0.025);
        this.chime([1320, 990], now + 0.02, 'triangle', 0.022, 0.06);
        break;
      case 'grave_moth_chapel':
        this.magicSweep(now, 260, 140, 0.46, 0.028);
        this.noiseBurst(now, 0.018, 700);
        break;
      case 'clockwork_orrery':
        this.chime([330, 420, 330, 520], now, 'triangle', 0.018, 0.055);
        break;
      case 'storm_harp':
        this.crackle(now, 0.05, 2400);
        this.magicSweep(now, 620, 1500, 0.16, 0.028);
        break;
      case 'cauldron_nursery':
        this.bubble(now);
        break;
      default:
        break;
    }
  }

  private ensureContext() {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    if (!this.ctx) {
      this.ctx = new AudioContextCtor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.applyVolume();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private applyVolume() {
    if (!this.ctx || !this.masterGain) return;
    const gain = this.volume === 'Full' ? 1 : this.volume === 'Half' ? 0.5 : 0.0001;
    this.masterGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.015);
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
      osc.connect(gain).connect(this.masterGain ?? this.ctx!.destination);
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
    source.connect(filter).connect(gain).connect(this.masterGain ?? this.ctx.destination);
    source.start(start);
  }

  private crackle(start: number, gainValue: number, lowpass: number) {
    this.noiseBurst(start, gainValue, lowpass);
    this.noiseBurst(start + 0.055, gainValue * 0.65, lowpass * 1.35);
  }

  private magicSweep(start: number, from: number, to: number, duration: number, gainValue: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), start + duration);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter).connect(gain).connect(this.masterGain ?? this.ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  private thump(start: number, frequency: number, gainValue: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(35, frequency * 0.45), start + 0.18);
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    osc.connect(gain).connect(this.masterGain ?? this.ctx.destination);
    osc.start(start);
    osc.stop(start + 0.22);
  }

  private bubble(start: number) {
    this.magicSweep(start, 180, 420, 0.12, 0.02);
    this.magicSweep(start + 0.08, 220, 520, 0.1, 0.018);
  }
}
