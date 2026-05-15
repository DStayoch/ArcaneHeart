import Phaser from 'phaser';

export type AudioCue = 'build' | 'sell' | 'hit' | 'death' | 'combo' | 'wave' | 'boss' | 'win' | 'loss';

export class AudioSystem {
  constructor(private scene: Phaser.Scene) {}

  play(cue: AudioCue) {
    // Placeholder hook for future assets. The tiny visual pulse keeps feedback silent but visible.
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
}
