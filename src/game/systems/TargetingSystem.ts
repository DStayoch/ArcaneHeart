import type { Enemy } from '../entities/Enemy';
import type { Room } from '../entities/Room';
import { distance } from '../utils/math';

export class TargetingSystem {
  findTarget(room: Room, enemies: Enemy[]) {
    const candidates = enemies.filter((enemy) => enemy.alive && distance(room, enemy) <= room.range());
    if (!candidates.length) return undefined;
    switch (room.priority) {
      case 'last':
        return candidates.sort((a, b) => a.progress - b.progress)[0];
      case 'strongest':
        return candidates.sort((a, b) => b.hp - a.hp)[0];
      case 'weakest':
        return candidates.sort((a, b) => a.hp - b.hp)[0];
      case 'fastest':
        return candidates.sort((a, b) => b.def.speed - a.def.speed)[0];
      case 'first':
      default:
        return candidates.sort((a, b) => b.progress - a.progress)[0];
    }
  }

  nearbyEnemies(origin: { x: number; y: number }, enemies: Enemy[], range: number) {
    return enemies.filter((enemy) => enemy.alive && distance(origin, enemy) <= range);
  }
}
