import type { MutationDefinition } from '../core/types';

export const mutationDefinitions: MutationDefinition[] = [
  { id: 'dreams_of_rain', name: 'The Tower Dreams of Rain', description: 'All slows last 20% longer.' },
  { id: 'gets_hungry', name: 'The Tower Gets Hungry', description: 'Defeated enemies near lower floors grant +1 Mana.' },
  { id: 'stairs_rearrange', name: 'The Stairs Rearrange Themselves', description: 'Enemies take longer to climb between floors.' },
  { id: 'walls_learn_music', name: 'The Walls Learn Music', description: 'Bell and Storm rooms gain +10% range.' },
  { id: 'cellar_teeth', name: 'The Cellar Grows Teeth', description: 'First enemy in each wave starts Snared.' },
  { id: 'windows_eyes', name: 'The Windows Become Eyes', description: 'Rooms favor better target choices.' },
];
