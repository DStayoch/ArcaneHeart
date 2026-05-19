import type { ComboDefinition } from '../core/types';

export const comboDefinitions: ComboDefinition[] = [
  { id: 'lunar_brambles', name: 'Lunar Brambles', roomIds: ['root_library', 'moon_bell'], description: 'Thorns may arc into a second silver-vined strike.', visual: 'Silver vines curl across the floor.', color: 0x9bd8ff },
  { id: 'prismatic_fireflies', name: 'Prismatic Fireflies', roomIds: ['fire_imp_kitchen', 'mirror_hatchery'], description: 'Fire splashes create seeking sparks.', visual: 'Colorful sparks bounce around.', color: 0xffc75f },
  { id: 'funeral_chime', name: 'Funeral Chime', roomIds: ['grave_moth_chapel', 'moon_bell'], description: 'Bell pulses apply Frail to slowed enemies.', visual: 'Pale moths spiral around bell waves.', color: 0xc9a6ff },
  { id: 'time_grown_thorns', name: 'Time-Grown Thorns', roomIds: ['clockwork_orrery', 'root_library'], description: 'Rewound enemies are snared and damaged.', visual: 'Green clock hands wrap around enemies.', color: 0x7ee07f },
  { id: 'echo_lightning', name: 'Echo Lightning', roomIds: ['storm_harp', 'mirror_hatchery'], description: 'Chain lightning bounces one extra time.', visual: 'Lightning reflects through mirror shards.', color: 0x65d9ff },
  { id: 'spicy_stew_economy', name: 'Spicy Stew Economy', roomIds: ['cauldron_nursery', 'fire_imp_kitchen'], description: 'Burning enemies can drop bonus Mana.', visual: 'Mana wisps pop out with steam.', color: 0xff8f45 },
  { id: 'glass_mourning', name: 'Glass Mourning', roomIds: ['mirror_hatchery', 'grave_moth_chapel'], description: 'Mirror ghosts mark and frail nearby enemies after a shadow beam.', visual: 'Dark mirror shards bloom into moth wings.', color: 0xe8b7ff },
  { id: 'thunder_vespers', name: 'Thunder Vespers', roomIds: ['storm_harp', 'moon_bell'], description: 'A bell-charged shockwave dazes enemies and chains through the front line.', visual: 'Blue-white bell rings crackle with thunder.', color: 0xaedfff },
  { id: 'bramble_conductor', name: 'Bramble Conductor', roomIds: ['root_library', 'storm_harp'], description: 'Lightning runs through roots, snaring and striking clustered enemies.', visual: 'Vines become glowing storm cables.', color: 0x86f5a8 },
  { id: 'clockwork_brew', name: 'Clockwork Brew', roomIds: ['clockwork_orrery', 'cauldron_nursery'], description: 'Time bubbles rewind a small cluster and drip a little Mana during waves.', visual: 'Golden bubbles tick backward before popping.', color: 0xd8d16a },
  { id: 'solar_orchard', name: 'Solar Orchard', roomIds: ['root_library', 'fire_imp_kitchen', 'moon_bell'], description: 'Burning fruit falls over the tower path.', visual: 'Glowing fruit meteors drop from a magical tree.', color: 0xffb347 },
];
