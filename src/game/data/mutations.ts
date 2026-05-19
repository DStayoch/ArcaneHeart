import type { MutationDefinition } from '../core/types';

export const mutationDefinitions: MutationDefinition[] = [
  { id: 'dreams_of_rain', name: 'The Tower Dreams of Rain', description: 'All slows last 20% longer.' },
  { id: 'gets_hungry', name: 'The Tower Gets Hungry', description: 'Defeated enemies near lower floors grant +1 Mana.' },
  { id: 'stairs_rearrange', name: 'The Stairs Rearrange Themselves', description: 'Enemies take longer to climb between floors.' },
  { id: 'walls_learn_music', name: 'The Walls Learn Music', description: 'Bell and Storm rooms gain +10% range.' },
  { id: 'cellar_teeth', name: 'The Cellar Grows Teeth', description: 'First enemy in each wave starts Snared.' },
  { id: 'windows_eyes', name: 'The Windows Become Eyes', description: 'Rooms favor better target choices.' },
  { id: 'mirror_moonlight', name: 'The Mirrors Drink Moonlight', description: 'Fused rooms gain +10% range.' },
  { id: 'crystal_veins', name: 'Crystal Veins Under the Floor', description: 'Fused rooms deal +12% damage.' },
  { id: 'library_rewrites_margins', name: 'The Library Rewrites the Margins', description: 'Room upgrades cost 15% less.' },
  { id: 'heart_hums_back', name: 'The Heart Hums Back', description: 'At 10 Heart HP or lower, rooms recharge 15% faster.' },
  { id: 'rafters_leak_starlight', name: 'The Rafters Leak Starlight', description: 'Every fifth spawned enemy starts Marked.' },
  { id: 'doors_bite_bosses', name: 'The Doors Bite Bosses', description: 'Bosses and elites spawn Frail.' },
  { id: 'storms_watch_cellar', name: 'Storms Watch the Cellar', description: 'Every seventh spawned enemy starts Dazed and Chilled.' },
  { id: 'cauldrons_sing', name: 'The Cauldrons Learn to Sing', description: 'Cauldron rooms and Clockwork Brew generate +1 Mana.' },
];
