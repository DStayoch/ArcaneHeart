import { STARTING_ESSENCE, STARTING_HEART_HP, STARTING_MANA } from './constants';
import type { ComboDefinition, MutationDefinition } from './types';

export interface GameState {
  mana: number;
  essence: number;
  heartHp: number;
  wave: number;
  enemiesRemaining: number;
  waveActive: boolean;
  speed: 1 | 2;
  paused: boolean;
  won: boolean;
  lost: boolean;
  activeCombos: ComboDefinition[];
  unlockedComboIds: string[];
  activeMutations: MutationDefinition[];
  roomsBuilt: number;
  bossesDefeated: number;
  evolvedFusions: number;
  enemiesDefeated: number;
  leaks: number;
  heartPanicTriggered: boolean;
}

export const createGameState = (): GameState => ({
  mana: STARTING_MANA,
  essence: STARTING_ESSENCE,
  heartHp: STARTING_HEART_HP,
  wave: 1,
  enemiesRemaining: 0,
  waveActive: false,
  speed: 1,
  paused: false,
  won: false,
  lost: false,
  activeCombos: [],
  unlockedComboIds: [],
  activeMutations: [],
  roomsBuilt: 0,
  bossesDefeated: 0,
  evolvedFusions: 0,
  enemiesDefeated: 0,
  leaks: 0,
  heartPanicTriggered: false,
});
