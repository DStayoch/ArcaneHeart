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
    const panicPressure = this.state.heartHp <= 5 ? 1.08 : 1;
    const scaledDelta = this.state.paused ? 0 : deltaMs * this.state.speed * panicPressure;
    for (const enemy of [...this.enemies]) {
      enemy.updateEnemy(scaledDelta, 1);
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
    this.state.enemiesDefeated += 1;
    if (enemy.def.boss) this.state.bossesDefeated += 1;
    this.state.enemiesRemaining = Math.max(0, this.state.enemiesRemaining - 1);
    this.scene.tweens.add({ targets: enemy, alpha: 0, scale: 1.6, duration: 200, onComplete: () => enemy.destroy() });
    this.enemies.splice(this.enemies.indexOf(enemy), 1);
    if (enemy.def.splitsInto) {
      const splitCount = enemy.def.splitCount ?? 2;
      for (let i = 0; i < splitCount; i += 1) {
        this.spawn(enemy.def.splitsInto, false).progress = Math.max(0, enemy.progress - 0.015 - i * 0.01);
      }
    }
  }

  private leak(enemy: Enemy) {
    this.state.heartHp -= enemy.def.damageToHeart ?? (enemy.def.boss ? 7 : 1);
    this.state.leaks += 1;
    this.state.enemiesRemaining = Math.max(0, this.state.enemiesRemaining - 1);
    enemy.destroy();
    this.enemies.splice(this.enemies.indexOf(enemy), 1);
  }
}
