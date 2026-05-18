import Phaser from 'phaser';
import type { GameState } from '../core/GameState';
import type { EnemyId } from '../core/types';
import { waves } from '../data/waves';
import type { EnemySystem } from './EnemySystem';

export class WaveSystem {
  private spawning = false;
  private queue: Array<{ enemyId: EnemyId; elite?: boolean; intervalMs: number }> = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private pausedSpawnDelay?: number;

  constructor(private scene: Phaser.Scene, private state: GameState, private enemies: EnemySystem) {}

  startWave() {
    if (this.state.waveActive || this.spawning) return false;
    const wave = waves[this.state.wave - 1];
    if (!wave) return false;
    this.state.waveActive = true;
    this.spawning = true;
    this.queue = wave.entries.flatMap((entry) =>
      Array.from({ length: entry.count }, () => ({ enemyId: entry.enemyId, elite: entry.elite, intervalMs: entry.intervalMs })),
    );
    this.enemies.beginWave();
    this.spawnNext();
    return true;
  }

  update() {
    this.syncSpawnPause();
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

  private spawnNext() {
    const next = this.queue.shift();
    if (!next) {
      this.spawning = false;
      this.spawnTimer = undefined;
      this.pausedSpawnDelay = undefined;
      return;
    }
    this.enemies.spawn(next.enemyId, next.elite);
    this.spawnTimer = this.scene.time.delayedCall(next.intervalMs, () => {
      this.spawnTimer = undefined;
      this.spawnNext();
    });
    this.syncSpawnPause();
  }

  private syncSpawnPause() {
    if (!this.state.paused && this.pausedSpawnDelay !== undefined && !this.spawnTimer) {
      const delay = this.pausedSpawnDelay;
      this.pausedSpawnDelay = undefined;
      this.spawnTimer = this.scene.time.delayedCall(delay, () => {
        this.spawnTimer = undefined;
        this.spawnNext();
      });
    }
    if (!this.spawnTimer) return;
    if (this.state.paused) {
      if (this.pausedSpawnDelay === undefined) {
        this.pausedSpawnDelay = Math.max(1, this.spawnTimer.getRemaining());
        this.spawnTimer.remove(false);
        this.spawnTimer = undefined;
      }
      return;
    }
  }
}
