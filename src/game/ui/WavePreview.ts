import Phaser from 'phaser';
import type { WaveSystem } from '../systems/WaveSystem';
import { enemyDefinitions } from '../data/enemies';

export class WavePreview extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, private waves: WaveSystem) {
    super(scene, 918, 235, '', { fontSize: '13px', color: '#f6e8ce', wordWrap: { width: 330 }, lineSpacing: 3 });
    scene.add.existing(this);
  }

  refresh() {
    const wave = this.waves.getCurrentWave();
    if (!wave) {
      this.setText('All chapters survived.');
      return;
    }
    this.setText(`Wave Preview\n${wave.entries.map((entry) => `${entry.count}x ${enemyDefinitions[entry.enemyId].name}${entry.elite ? ' elite' : ''}`).join('\n')}`);
  }
}
