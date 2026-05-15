import type { GameState } from '../core/GameState';
import type { Enemy } from '../entities/Enemy';
import type { Room } from '../entities/Room';
import type { ComboDefinition } from '../core/types';

export class StatusEffectSystem {
  constructor(private state: GameState) {}

  applyRoomEffects(room: Room, enemy: Enemy, activeCombos: ComboDefinition[]) {
    const rain = this.state.activeMutations.some((mutation) => mutation.id === 'dreams_of_rain');
    const slowDuration = rain ? 2160 : 1800;
    if (room.def.id === 'root_library') enemy.applyStatus('snared', slowDuration, room.level >= 3 ? 0.36 : 0.28);
    if (room.def.id === 'fire_imp_kitchen') enemy.applyStatus('burning', 2600, room.level >= 3 ? 7 : 5);
    if (room.def.id === 'grave_moth_chapel') enemy.applyStatus('frail', room.level >= 3 ? 3900 : 2800, 0.25);
    if (room.def.id === 'moon_bell') {
      enemy.applyStatus('snared', slowDuration, 0.24);
      if (room.level >= 3) enemy.applyStatus('marked', 1800, 0.2);
    }
    if (activeCombos.some((combo) => combo.id === 'funeral_chime') && room.def.id === 'moon_bell' && enemy.hasStatus('snared')) {
      enemy.applyStatus('frail', 2200, 0.25);
    }
  }
}
