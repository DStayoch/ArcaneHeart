import type { WaveDefinition } from '../core/types';

export const waves: WaveDefinition[] = [
  { wave: 1, title: 'Notebook Scamps', entries: [{ enemyId: 'scribble_goblin', count: 10, intervalMs: 720 }] },
  { wave: 2, title: 'Wax and Doodles', entries: [{ enemyId: 'scribble_goblin', count: 12, intervalMs: 520 }, { enemyId: 'candle_knight', count: 4, intervalMs: 820 }] },
  { wave: 3, title: 'Bad Weather Puddles', entries: [{ enemyId: 'gloom_slime', count: 9, intervalMs: 720 }, { enemyId: 'scribble_goblin', count: 6, intervalMs: 420 }] },
  { wave: 4, title: 'Ink on the Wing', entries: [{ enemyId: 'winged_inkling', count: 20, intervalMs: 300 }, { enemyId: 'candle_knight', count: 3, intervalMs: 780 }] },
  { wave: 5, title: 'First Broken Chapter', entries: [{ enemyId: 'scribble_goblin', count: 14, intervalMs: 350 }, { enemyId: 'candle_knight', count: 7, intervalMs: 650, elite: true }, { enemyId: 'gloom_slime', count: 4, intervalMs: 780 }] },
  { wave: 6, title: 'Wound Clock Dragons', entries: [{ enemyId: 'clockwork_wyvern', count: 7, intervalMs: 780 }, { enemyId: 'winged_inkling', count: 12, intervalMs: 330 }] },
  { wave: 7, title: 'Auditors of Doom', entries: [{ enemyId: 'curse_collector', count: 10, intervalMs: 610 }, { enemyId: 'gloom_slime', count: 7, intervalMs: 720 }] },
  { wave: 8, title: 'Library Riot', entries: [{ enemyId: 'scribble_goblin', count: 22, intervalMs: 220 }, { enemyId: 'clockwork_wyvern', count: 6, intervalMs: 790 }, { enemyId: 'candle_knight', count: 9, intervalMs: 520 }] },
  { wave: 9, title: 'Fast Ink, Hard Wax', entries: [{ enemyId: 'winged_inkling', count: 28, intervalMs: 190 }, { enemyId: 'curse_collector', count: 9, intervalMs: 560 }, { enemyId: 'candle_knight', count: 10, intervalMs: 490 }] },
  { wave: 10, title: 'The Page Eater', entries: [{ enemyId: 'page_eater', count: 1, intervalMs: 1000 }, { enemyId: 'curse_collector', count: 5, intervalMs: 620 }, { enemyId: 'scribble_goblin', count: 18, intervalMs: 290 }, { enemyId: 'winged_inkling', count: 14, intervalMs: 320 }] },
];
