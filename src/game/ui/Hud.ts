import Phaser from 'phaser';
import type { GameState } from '../core/GameState';
import type { WaveSystem } from '../systems/WaveSystem';

export class Hud extends Phaser.GameObjects.Container {
  private stats: Phaser.GameObjects.Text;
  private combos: Phaser.GameObjects.Text;
  private mutations: Phaser.GameObjects.Text;
  readonly startButton: Phaser.GameObjects.Text;
  readonly pauseButton: Phaser.GameObjects.Text;
  readonly speedButton: Phaser.GameObjects.Text;
  readonly restartButton: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private state: GameState, private waves: WaveSystem) {
    super(scene, 0, 0);
    scene.add.rectangle(0, 0, 1280, 54, 0x120b19, 0.94).setOrigin(0).setStrokeStyle(1, 0x6e557b);
    scene.add.text(18, 14, 'THE LIVING SPIRE', { fontSize: '20px', color: '#ffe59d', fontStyle: 'bold' });
    this.stats = scene.add.text(245, 12, '', { fontSize: '15px', color: '#f8ecd5' });
    this.startButton = this.button(840, 12, 'Start Wave');
    this.speedButton = this.button(962, 12, '1x');
    this.pauseButton = this.button(1030, 12, 'Pause');
    this.restartButton = this.button(1122, 12, 'Restart');
    this.combos = scene.add.text(918, 66, '', { fontSize: '13px', color: '#bdf4ff', wordWrap: { width: 330 } });
    this.mutations = scene.add.text(18, 588, '', { fontSize: '13px', color: '#d8c0ff', wordWrap: { width: 280 } });
    scene.add.existing(this);
  }

  refresh() {
    const wave = this.waves.getCurrentWave();
    this.stats.setText(`Mana ${this.state.mana}   Essence ${this.state.essence}   Heart ${this.state.heartHp}   Wave ${this.state.wave}/${this.waves.totalWaves()}   Remaining ${this.state.enemiesRemaining}`);
    this.startButton.setAlpha(this.state.waveActive ? 0.45 : 1);
    this.speedButton.setText(`${this.state.speed}x`);
    this.pauseButton.setText(this.state.paused ? 'Resume' : 'Pause');
    this.combos.setText(`Active Combos\n${this.state.activeCombos.map((combo) => combo.name).join('\n') || 'None yet'}\n\nPreview\n${wave?.title ?? 'Complete'}`);
    this.mutations.setText(`Tower Moods\n${this.state.activeMutations.map((mutation) => mutation.name).join('\n') || 'The tower is listening.'}`);
  }

  private button(x: number, y: number, label: string) {
    return this.scene.add.text(x, y, label, { fontSize: '15px', color: '#120b19', backgroundColor: '#f0cf83', padding: { x: 12, y: 6 } }).setInteractive({ useHandCursor: true });
  }
}
