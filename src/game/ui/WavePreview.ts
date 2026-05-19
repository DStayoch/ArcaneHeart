import Phaser from 'phaser';
import type { WaveSystem } from '../systems/WaveSystem';
import { enemyDefinitions } from '../data/enemies';
import type { Tooltip } from './Tooltip';
import type { EnemyDefinition } from '../core/types';

export class WavePreview extends Phaser.GameObjects.Container {
  private signature = '__unrendered__';
  private rows: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, private waves: WaveSystem, private tooltip?: Tooltip) {
    super(scene, 930, 226);
    scene.add.existing(this);
  }

  refresh() {
    const wave = this.waves.getCurrentWave();
    const signature = wave ? `${wave.wave}:${wave.entries.map((entry) => `${entry.enemyId}-${entry.count}-${entry.elite ? 1 : 0}`).join('|')}` : 'complete';
    if (signature === this.signature) return;
    this.signature = signature;
    this.rows.forEach((row) => row.destroy());
    this.rows = [];
    if (!wave) {
      this.rows.push(this.scene.add.text(0, 0, 'All chapters survived.', { fontSize: '13px', color: '#f6e8ce' }));
      this.add(this.rows);
      return;
    }
    const title = this.scene.add.text(0, 0, 'Wave Preview', { fontSize: '13px', color: '#f6e8ce', fontStyle: 'bold' });
    this.rows.push(title);
    wave.entries.forEach((entry, index) => {
      const def = enemyDefinitions[entry.enemyId];
      const y = 24 + index * 25;
      const row = this.scene.add.container(0, y);
      const bg = this.scene.add.rectangle(0, 0, 292, 21, def.boss ? 0x3a1730 : 0x21162d, 0.8).setOrigin(0).setStrokeStyle(1, def.boss ? 0xff9bb9 : 0x6e557b, 0.72);
      const text = this.scene.add.text(8, 4, `${entry.count}x ${def.name}${entry.elite ? ' elite' : ''}`, { fontSize: '12px', color: def.boss ? '#ffd1df' : '#fff0bd' });
      const hit = this.scene.add.zone(0, 0, 292, 21).setOrigin(0).setInteractive({ useHandCursor: true });
      row.add([bg, text, hit]);
      hit.on('pointerover', () => {
        bg.setStrokeStyle(2, 0xffdf8f, 1);
        this.tooltip?.show(914, 242 + index * 25, this.enemyCopy(def));
      });
      hit.on('pointerout', () => {
        bg.setStrokeStyle(1, def.boss ? 0xff9bb9 : 0x6e557b, 0.72);
        this.tooltip?.hide();
      });
      this.rows.push(row);
    });
    this.add(this.rows);
  }

  private enemyCopy(def: EnemyDefinition) {
    const resistances: string[] = [];
    if (def.fireResist) resistances.push(`Fire x${def.fireResist}`);
    if (def.rootResist) resistances.push(`Root x${def.rootResist}`);
    if (def.stormResist) resistances.push(`Storm x${def.stormResist}`);
    if (def.timeResist) resistances.push(`Time x${def.timeResist}`);
    if (def.moonResist) resistances.push(`Moon x${def.moonResist}`);
    if (def.alchemyResist) resistances.push(`Alchemy x${def.alchemyResist}`);
    if (def.shadowWeak) resistances.push(`Shadow x${def.shadowWeak}`);
    if (def.slowResist) resistances.push(`Slow -${Math.round(def.slowResist * 100)}%`);
    if (def.rewindResist) resistances.push(`Rewind -${Math.round(def.rewindResist * 100)}%`);
    const resistanceText = resistances.join('\n');
    return `${def.name}\nHP ${def.hp} | Speed ${def.speed} | Heart damage ${def.damageToHeart ?? (def.boss ? 7 : 1)}\n${def.trait}\n${resistanceText || 'No special resistances.'}`;
  }
}
