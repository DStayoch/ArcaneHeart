import type { GameState } from '../core/GameState';
import type { Enemy } from '../entities/Enemy';
import type { Room } from '../entities/Room';
import type { ProjectileSystem } from './ProjectileSystem';
import type { StatusEffectSystem } from './StatusEffectSystem';
import type { TargetingSystem } from './TargetingSystem';
import type { EconomySystem } from './EconomySystem';
import { chance } from '../utils/math';

export class RoomSystem {
  private solarTimer = 0;

  constructor(
    private state: GameState,
    private targeting: TargetingSystem,
    private projectiles: ProjectileSystem,
    private statuses: StatusEffectSystem,
    private economy: EconomySystem,
  ) {}

  update(deltaMs: number, rooms: Room[], enemies: Enemy[]) {
    if (this.state.paused) return;
    const scaled = deltaMs * this.state.speed;
    rooms.forEach((room) => {
      room.cooldownRemaining -= scaled;
      if (room.cooldownRemaining > 0) return;
      this.act(room, enemies);
      room.cooldownRemaining = room.cooldown() * this.adjacentSpeedBoost(room, rooms);
    });
    this.updateSolarOrchard(scaled, enemies);
  }

  private act(room: Room, enemies: Enemy[]) {
    if (room.def.id === 'cauldron_nursery') {
      this.economy.addMana(room.level >= 3 ? 8 : 4);
      return;
    }
    const target = this.targeting.findTarget(room, enemies);
    if (!target) return;
    if (room.def.id === 'moon_bell') {
      this.targeting.nearbyEnemies(room, enemies, room.range()).forEach((enemy) => this.statuses.applyRoomEffects(room, enemy, this.state.activeCombos));
      return;
    }
    if (room.def.id === 'clockwork_orrery') {
      target.rewind(room.level >= 3 ? 0.075 : 0.048);
      target.applyDamage(room.damage(), room.def.tags, room.id);
      if (this.state.activeCombos.some((combo) => combo.id === 'time_grown_thorns')) {
        target.applyStatus('snared', 1900, 0.38);
        target.applyDamage(11, ['Root', 'Time'], room.id);
      }
      return;
    }
    this.projectiles.fire(room, target, room.damage(), this.state.activeCombos);
    this.statuses.applyRoomEffects(room, target, this.state.activeCombos);
    if (this.state.activeCombos.some((combo) => combo.id === 'spicy_stew_economy') && room.def.id === 'fire_imp_kitchen' && chance(0.2)) this.economy.addMana(2);
  }

  private adjacentSpeedBoost(room: Room, rooms: Room[]) {
    const boosted = rooms.some((other) => other !== room && other.def.id === 'moon_bell' && Math.abs(other.floor - room.floor) <= 1);
    return boosted ? 0.9 : 1;
  }

  private updateSolarOrchard(deltaMs: number, enemies: Enemy[]) {
    if (!this.state.activeCombos.some((combo) => combo.id === 'solar_orchard')) return;
    this.solarTimer -= deltaMs;
    if (this.solarTimer > 0) return;
    this.solarTimer = 3600;
    enemies.filter((enemy) => enemy.alive).slice(0, 5).forEach((enemy) => {
      enemy.applyDamage(18, ['Fire', 'Root', 'Moon'], 'solar-orchard');
      enemy.applyStatus('burning', 1800, 4);
    });
  }
}
