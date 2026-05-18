import Phaser from 'phaser';
import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';
import type { Room } from '../entities/Room';
import type { ComboDefinition } from '../core/types';
import { distance, chance } from '../utils/math';

export class ProjectileSystem {
  readonly projectiles: Projectile[] = [];

  constructor(private scene: Phaser.Scene) {}

  fire(room: Room, target: Enemy, damage: number, activeCombos: ComboDefinition[]) {
    if (room.def.id === 'storm_harp') return this.chainLightning(room, target, damage, activeCombos);
    if (room.def.id === 'moon_bell' || room.def.id === 'clockwork_orrery' || room.def.id === 'cauldron_nursery') return;
    const projectile = new Projectile(this.scene, room, target, damage, room.def.color, room.def.splashRadius ?? 0, room.def.projectileSpeed ?? 420);
    this.projectiles.push(projectile);
    if (activeCombos.some((combo) => combo.id === 'prismatic_fireflies') && room.def.id === 'fire_imp_kitchen') {
      this.scene.time.delayedCall(130, () => {
        if (target.alive) this.projectiles.push(new Projectile(this.scene, room, target, damage * 0.38, 0xffe86b, 0, 520));
      });
    }
  }

  update(deltaMs: number, enemies: Enemy[], activeCombos: ComboDefinition[]) {
    for (const projectile of [...this.projectiles]) {
      const hit = projectile.updateProjectile(deltaMs);
      if (hit) {
        const splash = projectile.splashRadius;
        const victims = splash > 0 ? enemies.filter((enemy) => enemy.alive && distance(projectile.target, enemy) <= splash) : [projectile.target];
        victims.forEach((enemy) => enemy.applyDamage(projectile.damage, projectile.source.def.tags, projectile.source.id));
        if (activeCombos.some((combo) => combo.id === 'lunar_brambles') && projectile.source.def.id === 'root_library' && chance(0.28)) {
          const extra = enemies.find((enemy) => enemy.alive && enemy !== projectile.target && distance(projectile.target, enemy) < 100);
          if (extra) extra.applyDamage(projectile.damage * 0.55, projectile.source.def.tags, projectile.source.id);
        }
        projectile.destroy();
      }
    }
    this.projectiles.splice(0, this.projectiles.length, ...this.projectiles.filter((projectile) => projectile.active));
  }

  private chainLightning(room: Room, target: Enemy, damage: number, activeCombos: ComboDefinition[]) {
    const g = this.scene.add.graphics().setDepth(80);
    const extra = activeCombos.some((combo) => combo.id === 'echo_lightning') ? 1 : 0;
    g.lineStyle(3, 0xaed7ff, 0.95).lineBetween(room.x, room.y, target.x, target.y);
    target.applyDamage(damage, room.def.tags, room.id);
    let last = target;
    const hit = new Set<Enemy>([target]);
    const enemies = this.scene.registry.get('enemies') as Enemy[] | undefined;
    const evolved = room.evolvedFusion;
    const chainCount = (room.def.chainTargets ?? 2) + extra + (room.level >= 3 ? 1 : 0) + (evolved ? 2 : 0);
    for (let i = 0; i < chainCount; i += 1) {
      const next = enemies?.find((enemy) => enemy.alive && !hit.has(enemy) && distance(last, enemy) < (evolved ? 165 : 120));
      if (!next) break;
      g.lineBetween(last.x, last.y, next.x, next.y);
      next.applyDamage(damage * (evolved ? 0.88 : 0.72), room.def.tags, room.id);
      if (evolved) next.applyStatus('marked', 1500, 0.14);
      hit.add(next);
      last = next;
    }
    this.scene.time.delayedCall(130, () => g.destroy());
  }
}
