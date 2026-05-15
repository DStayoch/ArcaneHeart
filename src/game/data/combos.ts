import type { ComboDefinition } from '../core/types';

export const comboDefinitions: ComboDefinition[] = [
  { id: 'lunar_brambles', name: 'Lunar Brambles', roomIds: ['root_library', 'moon_bell'], description: 'Thorns may arc into a second silver-vined strike.', visual: 'Silver vines curl across the floor.' },
  { id: 'prismatic_fireflies', name: 'Prismatic Fireflies', roomIds: ['fire_imp_kitchen', 'mirror_hatchery'], description: 'Fire splashes create seeking sparks.', visual: 'Colorful sparks bounce around.' },
  { id: 'funeral_chime', name: 'Funeral Chime', roomIds: ['grave_moth_chapel', 'moon_bell'], description: 'Bell pulses apply Frail to slowed enemies.', visual: 'Pale moths spiral around bell waves.' },
  { id: 'time_grown_thorns', name: 'Time-Grown Thorns', roomIds: ['clockwork_orrery', 'root_library'], description: 'Rewound enemies are snared and damaged.', visual: 'Green clock hands wrap around enemies.' },
  { id: 'echo_lightning', name: 'Echo Lightning', roomIds: ['storm_harp', 'mirror_hatchery'], description: 'Chain lightning bounces one extra time.', visual: 'Lightning reflects through mirror shards.' },
  { id: 'spicy_stew_economy', name: 'Spicy Stew Economy', roomIds: ['cauldron_nursery', 'fire_imp_kitchen'], description: 'Burning enemies can drop bonus Mana.', visual: 'Mana wisps pop out with steam.' },
  { id: 'solar_orchard', name: 'Solar Orchard', roomIds: ['root_library', 'fire_imp_kitchen', 'moon_bell'], description: 'Burning fruit falls over the tower path.', visual: 'Glowing fruit meteors drop from a magical tree.' },
];
