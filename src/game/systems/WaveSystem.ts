import Phaser from 'phaser';
import type { GameState } from '../core/GameState';
import { waves } from '../data/waves';
import type { EnemySystem } from './EnemySystem';

export class WaveSystem {
  private spawning = false;
  private queued = 0;

  constructor(private scene: Phaser.Scene, private state: GameState, private enemies: EnemySystem) {}

  startWave() {
    if (this.state.waveActive || this.spawning) return false;
    const wave = waves[this.state.wave - 1];
    if (!wave) return false;
    this.state.waveActive = true;
    this.spawning = true;
    this.queued = wave.entries.reduce((sum, entry) => sum + entry.count, 0);
    this.enemies.beginWave();
    let delay = 0;
    for (const entry of wave.entries) {
      for (let i = 0; i < entry.count; i += 1) {
        delay += entry.intervalMs;
        this.scene.time.delayedCall(delay, () => {
          this.enemies.spawn(entry.enemyId, entry.elite);
          this.queued -= 1;
          if (this.queued <= 0) this.spawning = false;
        });
      }
      delay += 420;
    }
    return true;
  }

  update() {
    if (this.state.waveActive && !this.spawning && this.state.enemiesRemaining <= 0) {
      this.state.waveActive = false;
      return true;
    }
    return false;
  }

  getCurrentWave() {
    return waves[this.state.wave - 1];
  }

  totalWaves() {
    return waves.length;
  }
}
