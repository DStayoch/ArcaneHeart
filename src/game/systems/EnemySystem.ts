import Phaser from 'phaser';
import type { GameState } from '../core/GameState';
import type { EnemyId } from '../core/types';
import { Enemy } from '../entities/Enemy';
import type { PathPoint } from '../utils/path';
import type { EconomySystem } from './EconomySystem';
import type { MutationSystem } from './MutationSystem';
import type { VisualEffectsSystem } from './VisualEffectsSystem';

export class EnemySystem {
  readonly enemies: Enemy[] = [];
  private spawnedThisWave = 0;

  constructor(private scene: Phaser.Scene, private state: GameState, private economy: EconomySystem, private mutations: MutationSystem, private path: PathPoint[], private fx?: VisualEffectsSystem) {}

  beginWave() {
    this.spawnedThisWave = 0;
  }

  spawn(enemyId: EnemyId, elite = false) {
    const healthScale = 1 + Math.max(0, this.state.wave - 1) * 0.13;
    const speedScale = 1 + Math.max(0, this.state.wave - 1) * 0.024;
    const armorScale = Math.max(0, this.state.wave - 1) * 0.35;
    const enemy = new Enemy(this.scene, enemyId, this.path, elite, healthScale, speedScale, armorScale);
    if (this.spawnedThisWave === 0 && this.mutations.has('cellar_teeth')) enemy.applyStatus('snared', 2200, 0.32);
    if (this.mutations.has('stairs_rearrange')) enemy.applyStatus('dazed', 1200, 0.08);
    this.enemies.push(enemy);
    this.spawnedThisWave += 1;
    this.state.enemiesRemaining += 1;
    return enemy;
  }

  update(deltaMs: number) {
    const speedMultiplier = this.state.paused ? 0 : this.state.speed;
    for (const enemy of [...this.enemies]) {
      enemy.updateEnemy(deltaMs, speedMultiplier);
      if (!enemy.alive) this.kill(enemy);
      if (enemy.alive && enemy.hasReachedHeart()) this.leak(enemy);
    }
    this.scene.registry.set('enemies', this.enemies);
  }

  private kill(enemy: Enemy) {
    enemy.alive = false;
    const manaReward = enemy.def.rewardMana + (this.mutations.has('gets_hungry') && enemy.currentFloor() >= 7 ? 1 : 0);
    this.economy.addMana(manaReward);
    this.economy.addEssence(enemy.def.rewardEssence ?? 0);
    this.fx?.enemyKilled(enemy, manaReward);
    this.state.enemiesRemaining = Math.max(0, this.state.enemiesRemaining - 1);
    this.scene.tweens.add({ targets: enemy, alpha: 0, scale: 1.6, duration: 200, onComplete: () => enemy.destroy() });
    this.enemies.splice(this.enemies.indexOf(enemy), 1);
    if (enemy.def.splitsInto) {
      this.spawn(enemy.def.splitsInto, false).progress = Math.max(0, enemy.progress - 0.015);
      this.spawn(enemy.def.splitsInto, false).progress = Math.max(0, enemy.progress - 0.025);
    }
  }

  private leak(enemy: Enemy) {
    this.state.heartHp -= enemy.def.boss ? 7 : 1;
    this.state.enemiesRemaining = Math.max(0, this.state.enemiesRemaining - 1);
    enemy.destroy();
    this.enemies.splice(this.enemies.indexOf(enemy), 1);
  }
}
