import type { GameState } from '../core/GameState';
import type { Enemy } from '../entities/Enemy';
import type { Room } from '../entities/Room';
import type { ProjectileSystem } from './ProjectileSystem';
import type { StatusEffectSystem } from './StatusEffectSystem';
import type { TargetingSystem } from './TargetingSystem';
import type { EconomySystem } from './EconomySystem';
import type { AudioSystem } from './AudioSystem';
import type { VisualEffectsSystem } from './VisualEffectsSystem';
import { chance } from '../utils/math';

export class RoomSystem {
  constructor(
    private state: GameState,
    private targeting: TargetingSystem,
    private projectiles: ProjectileSystem,
    private statuses: StatusEffectSystem,
    private economy: EconomySystem,
    private audio?: AudioSystem,
    private fx?: VisualEffectsSystem,
  ) {}

  update(deltaMs: number, rooms: Room[], enemies: Enemy[]) {
    if (this.state.paused) return;
    const scaled = deltaMs * this.state.speed;
    rooms.forEach((room) => {
      if (room.mergedInto) return;
      room.cooldownRemaining -= scaled;
      if (room.cooldownRemaining > 0) return;
      this.act(room, enemies);
      room.cooldownRemaining = room.cooldown() * this.adjacentSpeedBoost(room, rooms);
    });
  }

  private act(room: Room, enemies: Enemy[]) {
    if (room.activeFusion) {
      this.actFusion(room, enemies);
      return;
    }
    if (room.def.id === 'cauldron_nursery') {
      if (!this.state.waveActive) return;
      this.economy.addMana(room.level >= 3 ? 8 : 4);
      this.audio?.playRoom(room.def.id);
      return;
    }
    const target = this.targeting.findTarget(room, enemies);
    if (!target) return;
    if (room.def.id === 'moon_bell') {
      this.targeting.nearbyEnemies(room, enemies, room.range()).forEach((enemy) => this.statuses.applyRoomEffects(room, enemy, this.state.activeCombos));
      this.audio?.playRoom(room.def.id);
      return;
    }
    if (room.def.id === 'clockwork_orrery') {
      target.rewind(room.level >= 3 ? 0.075 : 0.048);
      target.applyDamage(room.damage(), room.def.tags, room.id);
      if (this.state.activeCombos.some((combo) => combo.id === 'time_grown_thorns')) {
        target.applyStatus('snared', 1900, 0.38);
        target.applyDamage(11, ['Root', 'Time'], room.id);
      }
      this.audio?.playRoom(room.def.id);
      return;
    }
    this.projectiles.fire(room, target, room.damage(), this.state.activeCombos);
    this.statuses.applyRoomEffects(room, target, this.state.activeCombos);
    this.audio?.playRoom(room.def.id);
    if (this.state.activeCombos.some((combo) => combo.id === 'spicy_stew_economy') && room.def.id === 'fire_imp_kitchen' && chance(0.2)) this.economy.addMana(2);
  }

  private actFusion(room: Room, enemies: Enemy[]) {
    const fusion = room.activeFusion;
    if (!fusion) return;
    const target = this.targeting.findTarget(room, enemies);
    switch (fusion.id) {
      case 'lunar_brambles': {
        if (!target) return;
        target.applyDamage(room.damage() * 1.25, ['Root', 'Moon'], room.id);
        target.applyStatus('snared', 2400, 0.38);
        target.applyStatus('marked', 1600, 0.18);
        this.targeting.nearbyEnemies(target, enemies, 115).filter((enemy) => enemy !== target).slice(0, 2).forEach((enemy) => {
          enemy.applyDamage(room.damage() * 0.62, ['Root', 'Moon'], room.id);
          enemy.applyStatus('snared', 1200, 0.22);
        });
        this.fx?.fusionCast(fusion.id, room, [target, ...this.targeting.nearbyEnemies(target, enemies, 115).filter((enemy) => enemy !== target).slice(0, 2)]);
        this.audio?.play('damage');
        this.audio?.play('combo');
        return;
      }
      case 'prismatic_fireflies': {
        if (!target) return;
        this.projectiles.fire(room, target, room.damage() * 1.15, [fusion]);
        this.statuses.applyRoomEffects(room, target, [fusion]);
        const victims = this.targeting.nearbyEnemies(target, enemies, 130).slice(0, 3);
        victims.forEach((enemy) => enemy.applyStatus('burning', 2200, 5));
        this.fx?.fusionCast(fusion.id, room, [target, ...victims]);
        this.audio?.play('damage');
        this.audio?.playRoom('mirror_hatchery');
        return;
      }
      case 'funeral_chime': {
        const victims = this.targeting.nearbyEnemies(room, enemies, room.range() + 35);
        victims.forEach((enemy) => {
          enemy.applyDamage(room.damage() * 0.85 + 5, ['Shadow', 'Moon'], room.id);
          enemy.applyStatus('snared', 1700, 0.26);
          enemy.applyStatus('frail', 3100, 0.32);
        });
        this.fx?.fusionCast(fusion.id, room, victims);
        this.audio?.play('damage');
        this.audio?.playRoom('grave_moth_chapel');
        return;
      }
      case 'time_grown_thorns': {
        if (!target) return;
        target.rewind(0.095);
        target.applyDamage(room.damage() * 1.4 + 8, ['Root', 'Time'], room.id);
        target.applyStatus('snared', 2600, 0.42);
        const victims = this.targeting.nearbyEnemies(target, enemies, 80);
        victims.forEach((enemy) => enemy.applyDamage(7, ['Root', 'Time'], room.id));
        this.fx?.fusionCast(fusion.id, room, [target, ...victims]);
        this.audio?.play('damage');
        this.audio?.playRoom('clockwork_orrery');
        return;
      }
      case 'echo_lightning': {
        if (!target) return;
        this.projectiles.fire(room, target, room.damage() * 1.2, [fusion]);
        this.fx?.fusionCast(fusion.id, room, this.targeting.nearbyEnemies(target, enemies, 155).slice(0, 4));
        this.audio?.play('damage');
        this.audio?.playRoom('storm_harp');
        return;
      }
      case 'spicy_stew_economy': {
        if (this.state.waveActive) this.economy.addMana(room.level >= 3 ? 10 : 6);
        if (target) {
          target.applyDamage(room.damage() * 0.95 + 6, ['Fire', 'Alchemy'], room.id);
          const victims = this.targeting.nearbyEnemies(target, enemies, 85);
          victims.forEach((enemy) => enemy.applyStatus('burning', 2800, 6));
          this.fx?.fusionCast(fusion.id, room, [target, ...victims]);
          this.audio?.play('damage');
        }
        this.audio?.playRoom('cauldron_nursery');
        return;
      }
      case 'solar_orchard': {
        const victims = enemies.filter((enemy) => enemy.alive).sort((a, b) => b.progress - a.progress).slice(0, 7);
        victims.forEach((enemy) => {
          enemy.applyDamage(room.damage() * 1.25 + 14, ['Fire', 'Root', 'Moon'], room.id);
          enemy.applyStatus('burning', 2400, 5);
          enemy.applyStatus('marked', 1800, 0.2);
        });
        this.fx?.fusionCast(fusion.id, room, victims);
        this.audio?.play('damage');
        this.audio?.play('combo');
        return;
      }
      default:
        break;
    }
  }

  private adjacentSpeedBoost(room: Room, rooms: Room[]) {
    const boosted = rooms.some((other) => other !== room && other.def.id === 'moon_bell' && Math.abs(other.floor - room.floor) <= 1);
    return boosted ? 0.9 : 1;
  }

}
