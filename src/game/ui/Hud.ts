import Phaser from 'phaser';
import type { GameState } from '../core/GameState';
import type { WaveSystem } from '../systems/WaveSystem';
import type { Tooltip } from './Tooltip';
import { roomDefinitions } from '../data/rooms';

export class Hud extends Phaser.GameObjects.Container {
  private manaBadge: Phaser.GameObjects.Text;
  private essenceText: Phaser.GameObjects.Text;
  private heartText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private remainingText: Phaser.GameObjects.Text;
  private comboTitle: Phaser.GameObjects.Text;
  private comboRows: Phaser.GameObjects.GameObject[] = [];
  private comboSignature = '__unrendered__';
  private currentWaveText: Phaser.GameObjects.Text;
  private mutations: Phaser.GameObjects.Text;
  readonly tutorialButton: Phaser.GameObjects.Text;
  readonly startButton: Phaser.GameObjects.Text;
  readonly pauseButton: Phaser.GameObjects.Text;
  readonly speedButton: Phaser.GameObjects.Text;
  readonly restartButton: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private gameState: GameState, private waves: WaveSystem, private tooltip?: Tooltip) {
    super(scene, 0, 0);
    scene.add.rectangle(0, 0, 1280, 54, 0x120b19, 0.94).setOrigin(0).setStrokeStyle(1, 0x6e557b);
    scene.add.text(14, 15, 'LIVING SPIRE', { fontSize: '16px', color: '#ffe59d', fontStyle: 'bold' });
    this.manaBadge = scene.add.text(154, 9, '', { fontSize: '22px', color: '#120b19', backgroundColor: '#77f0c2', padding: { x: 12, y: 4 }, fontStyle: 'bold' });
    this.essenceText = scene.add.text(300, 16, '', { fontSize: '13px', color: '#f8ecd5' });
    this.heartText = scene.add.text(405, 16, '', { fontSize: '13px', color: '#ffd1df' });
    this.waveText = scene.add.text(500, 16, '', { fontSize: '13px', color: '#f8ecd5' });
    this.remainingText = scene.add.text(590, 16, '', { fontSize: '13px', color: '#f8ecd5' });
    this.startButton = this.button(720, 10, 'Start');
    this.tutorialButton = this.button(798, 10, '?');
    this.speedButton = this.button(842, 10, '1x');
    this.pauseButton = this.button(895, 10, 'Pause');
    this.restartButton = this.button(970, 10, 'Restart');
    this.comboTitle = scene.add.text(930, 90, 'Active Fusions', { fontSize: '13px', color: '#bdf4ff', fontStyle: 'bold' });
    this.currentWaveText = scene.add.text(930, 174, '', { fontSize: '13px', color: '#f6e8ce', wordWrap: { width: 300 }, lineSpacing: 6 });
    this.mutations = scene.add.text(930, 586, '', { fontSize: '12px', color: '#d8c0ff', wordWrap: { width: 300 }, lineSpacing: 4 });
    scene.add.existing(this);
  }

  refresh() {
    const wave = this.waves.getCurrentWave();
    this.manaBadge.setText(`Mana ${this.gameState.mana}`);
    this.essenceText.setText(`Essence ${this.gameState.essence}`);
    this.heartText.setText(`Heart ${this.gameState.heartHp}`);
    this.waveText.setText(`Wave ${this.gameState.wave}/${this.waves.totalWaves()}`);
    this.remainingText.setText(`Left ${this.waves.enemiesLeftInWave()}`);
    this.startButton.setAlpha(this.gameState.waveActive ? 0.45 : 1);
    this.speedButton.setText(`${this.gameState.speed}x`);
    this.pauseButton.setText(this.gameState.paused ? 'Resume' : 'Pause');
    this.refreshComboRows();
    this.currentWaveText.setText(`Current Wave\n${wave?.title ?? 'Complete'}`);
    const moods = this.gameState.activeMutations.map((mutation) => mutation.name);
    const visibleMoods = moods.slice(-5);
    const hiddenMoodCount = moods.length - visibleMoods.length;
    this.mutations.setText(`Tower Moods\n${visibleMoods.join('\n') || 'The tower is listening.'}${hiddenMoodCount > 0 ? `\n+${hiddenMoodCount} older moods` : ''}`);
  }

  private refreshComboRows() {
    const signature = this.gameState.activeCombos.map((combo) => combo.id).join('|');
    if (signature === this.comboSignature) return;
    this.comboSignature = signature;
    this.comboRows.forEach((row) => row.destroy());
    this.comboRows = [];
    const combos = this.gameState.activeCombos;
    if (!combos.length) {
      this.comboRows.push(this.scene.add.text(930, 112, 'None yet', { fontSize: '13px', color: '#7f748f' }));
      return;
    }
    combos.slice(0, 3).forEach((combo, index) => {
      const row = this.scene.add.container(930, 112 + index * 26);
      const bg = this.scene.add.rectangle(0, 0, 292, 22, 0x21162d, 0.92).setOrigin(0).setStrokeStyle(1, 0xe7c982, 0.62);
      const label = this.scene.add.text(8, 4, `* ${combo.name}`, { fontSize: '13px', color: '#fff0bd', wordWrap: { width: 274, useAdvancedWrap: true } });
      const hit = this.scene.add.zone(0, 0, 292, 22).setOrigin(0).setInteractive({ useHandCursor: true });
      row.add([bg, label, hit]);
      const roomNames = combo.roomIds.map((id) => roomDefinitions[id].name).join(' + ');
      hit.on('pointerover', () => {
        bg.setStrokeStyle(2, 0xffe28a, 1);
        this.tooltip?.show(925, 118 + index * 26, `${combo.name}\nRooms: ${roomNames}\nEffect: ${combo.description}\nVisual: ${combo.visual}`);
      });
      hit.on('pointerout', () => {
        bg.setStrokeStyle(1, 0xe7c982, 0.62);
        this.tooltip?.hide();
      });
      this.comboRows.push(row);
    });
  }

  private button(x: number, y: number, label: string) {
    return this.scene.add.text(x, y, label, { fontSize: '13px', color: '#120b19', backgroundColor: '#f0cf83', padding: { x: 10, y: 6 } }).setInteractive({ useHandCursor: true });
  }
}
