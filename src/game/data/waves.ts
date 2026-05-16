import type { WaveDefinition } from '../core/types';

export const waves: WaveDefinition[] = [
  { wave: 1, title: 'Notebook Scamps', entries: [{ enemyId: 'scribble_goblin', count: 12, intervalMs: 620 }] },
  { wave: 2, title: 'Wax and Doodles', entries: [{ enemyId: 'scribble_goblin', count: 16, intervalMs: 430 }, { enemyId: 'candle_knight', count: 6, intervalMs: 650 }] },
  { wave: 3, title: 'Bad Weather Puddles', entries: [{ enemyId: 'gloom_slime', count: 12, intervalMs: 580 }, { enemyId: 'scribble_goblin', count: 10, intervalMs: 320 }] },
  { wave: 4, title: 'Ink on the Wing', entries: [{ enemyId: 'winged_inkling', count: 28, intervalMs: 230 }, { enemyId: 'candle_knight', count: 5, intervalMs: 620 }] },
  { wave: 5, title: 'First Broken Chapter', entries: [{ enemyId: 'scribble_goblin', count: 20, intervalMs: 260 }, { enemyId: 'candle_knight', count: 9, intervalMs: 520, elite: true }, { enemyId: 'gloom_slime', count: 7, intervalMs: 620 }] },
  { wave: 6, title: 'Wound Clock Dragons', entries: [{ enemyId: 'clockwork_wyvern', count: 10, intervalMs: 620 }, { enemyId: 'winged_inkling', count: 18, intervalMs: 250 }] },
  { wave: 7, title: 'Auditors of Doom', entries: [{ enemyId: 'curse_collector', count: 14, intervalMs: 470 }, { enemyId: 'gloom_slime', count: 10, intervalMs: 560 }] },
  { wave: 8, title: 'Library Riot', entries: [{ enemyId: 'scribble_goblin', count: 30, intervalMs: 170 }, { enemyId: 'clockwork_wyvern', count: 9, intervalMs: 620 }, { enemyId: 'candle_knight', count: 13, intervalMs: 390 }] },
  { wave: 9, title: 'Fast Ink, Hard Wax', entries: [{ enemyId: 'winged_inkling', count: 38, intervalMs: 145 }, { enemyId: 'curse_collector', count: 13, intervalMs: 430 }, { enemyId: 'candle_knight', count: 14, intervalMs: 380 }] },
  { wave: 10, title: 'The Page Eater', entries: [{ enemyId: 'page_eater', count: 1, intervalMs: 850 }, { enemyId: 'curse_collector', count: 8, intervalMs: 450 }, { enemyId: 'scribble_goblin', count: 24, intervalMs: 210 }, { enemyId: 'winged_inkling', count: 20, intervalMs: 240 }] },
];
