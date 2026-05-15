import type { SLOT_SIDES } from './constants';

export type RoomId =
  | 'root_library'
  | 'fire_imp_kitchen'
  | 'moon_bell'
  | 'mirror_hatchery'
  | 'grave_moth_chapel'
  | 'clockwork_orrery'
  | 'storm_harp'
  | 'cauldron_nursery';

export type EnemyId =
  | 'scribble_goblin'
  | 'candle_knight'
  | 'gloom_slime'
  | 'winged_inkling'
  | 'clockwork_wyvern'
  | 'curse_collector'
  | 'page_eater';

export type StatusId = 'burning' | 'snared' | 'frail' | 'dazed' | 'chilled' | 'marked';
export type TargetPriority = 'first' | 'last' | 'strongest' | 'weakest' | 'fastest';
export type SlotSide = (typeof SLOT_SIDES)[number];

export interface RoomDefinition {
  id: RoomId;
  name: string;
  icon: string;
  tags: string[];
  cost: number;
  baseDamage: number;
  range: number;
  cooldownMs: number;
  splashRadius?: number;
  chainTargets?: number;
  projectileSpeed?: number;
  effect: string;
  personality: string;
  color: number;
}

export interface EnemyDefinition {
  id: EnemyId;
  name: string;
  icon: string;
  hp: number;
  speed: number;
  rewardMana: number;
  rewardEssence?: number;
  armor?: number;
  trait: string;
  flavor: string;
  color: number;
  fireResist?: number;
  shadowWeak?: number;
  flying?: boolean;
  splitsInto?: EnemyId;
  boss?: boolean;
}

export interface WaveEntry {
  enemyId: EnemyId;
  count: number;
  intervalMs: number;
  elite?: boolean;
}

export interface WaveDefinition {
  wave: number;
  title: string;
  entries: WaveEntry[];
}

export interface ComboDefinition {
  id: string;
  name: string;
  roomIds: RoomId[];
  description: string;
  visual: string;
}

export interface MutationDefinition {
  id: string;
  name: string;
  description: string;
}

export interface BuildSlotModel {
  id: string;
  floor: number;
  side: SlotSide;
  x: number;
  y: number;
  roomId?: RoomId;
}
