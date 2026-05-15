import type { WaveDefinition } from '../core/types';

export const waves: WaveDefinition[] = [
  { wave: 1, title: 'Notebook Scamps', entries: [{ enemyId: 'scribble_goblin', count: 9, intervalMs: 760 }] },
  { wave: 2, title: 'Wax and Doodles', entries: [{ enemyId: 'scribble_goblin', count: 8, intervalMs: 620 }, { enemyId: 'candle_knight', count: 3, intervalMs: 980 }] },
  { wave: 3, title: 'Bad Weather Puddles', entries: [{ enemyId: 'gloom_slime', count: 7, intervalMs: 880 }] },
  { wave: 4, title: 'Ink on the Wing', entries: [{ enemyId: 'winged_inkling', count: 16, intervalMs: 360 }] },
  { wave: 5, title: 'First Broken Chapter', entries: [{ enemyId: 'scribble_goblin', count: 10, intervalMs: 430 }, { enemyId: 'candle_knight', count: 5, intervalMs: 780, elite: true }] },
  { wave: 6, title: 'Wound Clock Dragons', entries: [{ enemyId: 'clockwork_wyvern', count: 5, intervalMs: 980 }, { enemyId: 'winged_inkling', count: 8, intervalMs: 420 }] },
  { wave: 7, title: 'Auditors of Doom', entries: [{ enemyId: 'curse_collector', count: 8, intervalMs: 780 }, { enemyId: 'gloom_slime', count: 4, intervalMs: 900 }] },
  { wave: 8, title: 'Library Riot', entries: [{ enemyId: 'scribble_goblin', count: 16, intervalMs: 280 }, { enemyId: 'clockwork_wyvern', count: 4, intervalMs: 1000 }, { enemyId: 'candle_knight', count: 6, intervalMs: 680 }] },
  { wave: 9, title: 'Fast Ink, Hard Wax', entries: [{ enemyId: 'winged_inkling', count: 22, intervalMs: 230 }, { enemyId: 'curse_collector', count: 6, intervalMs: 730 }, { enemyId: 'candle_knight', count: 7, intervalMs: 650 }] },
  { wave: 10, title: 'The Page Eater', entries: [{ enemyId: 'page_eater', count: 1, intervalMs: 1000 }, { enemyId: 'scribble_goblin', count: 12, intervalMs: 380 }, { enemyId: 'winged_inkling', count: 10, intervalMs: 420 }] },
];
