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
      room.cooldownRemaining = room.cooldown() * this.adjacentSpeedBoost(room, rooms) * this.heartPanicBoost();
    });
  }

  private act(room: Room, enemies: Enemy[]) {
    if (room.activeFusion) {
      this.actFusion(room, enemies);
      return;
    }
    if (room.def.id === 'cauldron_nursery') {
      if (!this.state.waveActive) return;
      this.economy.addMana(room.level >= 3 ? 6 : 3);
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
    if (this.state.activeCombos.some((combo) => combo.id === 'spicy_stew_economy') && room.def.id === 'fire_imp_kitchen' && chance(0.16)) this.economy.addMana(1);
  }

  private actFusion(room: Room, enemies: Enemy[]) {
    const fusion = room.activeFusion;
    if (!fusion) return;
    if (!this.state.waveActive) return;
    const evolved = room.evolvedFusion;
    const target = this.targeting.findTarget(room, enemies);
    switch (fusion.id) {
      case 'lunar_brambles': {
        if (!target) return;
        target.applyDamage(room.damage() * (evolved ? 1.55 : 1.25), ['Root', 'Moon'], room.id);
        target.applyStatus('snared', evolved ? 3400 : 2400, evolved ? 0.52 : 0.38);
        target.applyStatus('marked', evolved ? 2600 : 1600, evolved ? 0.3 : 0.18);
        const brambleVictims = this.targeting.nearbyEnemies(target, enemies, evolved ? 155 : 115).filter((enemy) => enemy !== target).slice(0, evolved ? 5 : 2);
        brambleVictims.forEach((enemy) => {
          enemy.applyDamage(room.damage() * (evolved ? 0.82 : 0.62), ['Root', 'Moon'], room.id);
          enemy.applyStatus('snared', evolved ? 2100 : 1200, evolved ? 0.34 : 0.22);
          if (evolved) enemy.applyStatus('marked', 1800, 0.18);
        });
        this.fx?.fusionCast(fusion.id, room, [target, ...brambleVictims]);
        this.audio?.play('damage');
        this.audio?.play('combo');
        return;
      }
      case 'prismatic_fireflies': {
        if (!target) return;
        this.projectiles.fire(room, target, room.damage() * (evolved ? 1.45 : 1.15), [fusion]);
        this.statuses.applyRoomEffects(room, target, [fusion]);
        const victims = this.targeting.nearbyEnemies(target, enemies, evolved ? 170 : 130).slice(0, evolved ? 6 : 3);
        victims.forEach((enemy) => {
          enemy.applyStatus('burning', evolved ? 3400 : 2200, evolved ? 8 : 5);
          if (evolved) enemy.applyDamage(room.damage() * 0.28, ['Fire', 'Mirror'], room.id);
        });
        this.fx?.fusionCast(fusion.id, room, [target, ...victims]);
        this.audio?.play('damage');
        this.audio?.playRoom('mirror_hatchery');
        return;
      }
      case 'funeral_chime': {
        const victims = this.targeting.nearbyEnemies(room, enemies, room.range() + (evolved ? 85 : 35));
        victims.forEach((enemy) => {
          enemy.applyDamage(room.damage() * (evolved ? 1.08 : 0.85) + (evolved ? 14 : 5), ['Shadow', 'Moon'], room.id);
          enemy.applyStatus('snared', evolved ? 2500 : 1700, evolved ? 0.34 : 0.26);
          enemy.applyStatus('frail', evolved ? 4600 : 3100, evolved ? 0.44 : 0.32);
          if (evolved) enemy.applyStatus('marked', 2600, 0.16);
        });
        this.fx?.fusionCast(fusion.id, room, victims);
        this.audio?.play('damage');
        this.audio?.playRoom('grave_moth_chapel');
        return;
      }
      case 'time_grown_thorns': {
        if (!target) return;
        target.rewind(evolved ? 0.16 : 0.095);
        target.applyDamage(room.damage() * (evolved ? 1.75 : 1.4) + (evolved ? 18 : 8), ['Root', 'Time'], room.id);
        target.applyStatus('snared', evolved ? 3600 : 2600, evolved ? 0.54 : 0.42);
        const victims = this.targeting.nearbyEnemies(target, enemies, evolved ? 120 : 80);
        victims.forEach((enemy) => {
          enemy.applyDamage(evolved ? 15 : 7, ['Root', 'Time'], room.id);
          if (evolved && enemy !== target) enemy.rewind(0.045);
        });
        this.fx?.fusionCast(fusion.id, room, [target, ...victims]);
        this.audio?.play('damage');
        this.audio?.playRoom('clockwork_orrery');
        return;
      }
      case 'echo_lightning': {
        if (!target) return;
        this.projectiles.fire(room, target, room.damage() * (evolved ? 1.55 : 1.2), [fusion]);
        this.fx?.fusionCast(fusion.id, room, this.targeting.nearbyEnemies(target, enemies, evolved ? 210 : 155).slice(0, evolved ? 7 : 4));
        this.audio?.play('damage');
        this.audio?.playRoom('storm_harp');
        return;
      }
      case 'spicy_stew_economy': {
        if (this.state.waveActive) this.economy.addMana(evolved ? room.level >= 3 ? 11 : 8 : room.level >= 3 ? 7 : 4);
        if (target) {
          target.applyDamage(room.damage() * (evolved ? 1.22 : 0.95) + (evolved ? 16 : 6), ['Fire', 'Alchemy'], room.id);
          const victims = this.targeting.nearbyEnemies(target, enemies, evolved ? 130 : 85);
          victims.forEach((enemy) => {
            enemy.applyStatus('burning', evolved ? 4200 : 2800, evolved ? 9 : 6);
            if (evolved && chance(0.18)) this.economy.addMana(1);
          });
          this.fx?.fusionCast(fusion.id, room, [target, ...victims]);
          this.audio?.play('damage');
        }
        this.audio?.playRoom('cauldron_nursery');
        return;
      }
      case 'solar_orchard': {
        const victims = this.targeting.nearbyEnemies(room, enemies, room.range() + (evolved ? 130 : 70)).sort((a, b) => b.progress - a.progress).slice(0, evolved ? 11 : 7);
        if (!victims.length) return;
        victims.forEach((enemy) => {
          enemy.applyDamage(room.damage() * (evolved ? 1.62 : 1.25) + (evolved ? 28 : 14), ['Fire', 'Root', 'Moon'], room.id);
          enemy.applyStatus('burning', evolved ? 3800 : 2400, evolved ? 8 : 5);
          enemy.applyStatus('marked', evolved ? 3000 : 1800, evolved ? 0.3 : 0.2);
          if (evolved) enemy.applyStatus('snared', 1500, 0.22);
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

  private heartPanicBoost() {
    return this.state.heartHp <= 5 ? 0.72 : 1;
  }
}
