import type { WaveDefinition } from '../core/types';

export const waves: WaveDefinition[] = [
  { wave: 1, title: 'Notebook Scamps', entries: [{ enemyId: 'scribble_goblin', count: 12, intervalMs: 620 }] },
  { wave: 2, title: 'Wax and Doodles', entries: [{ enemyId: 'scribble_goblin', count: 16, intervalMs: 430 }, { enemyId: 'candle_knight', count: 6, intervalMs: 650 }] },
  { wave: 3, title: 'Bad Weather Puddles', entries: [{ enemyId: 'gloom_slime', count: 12, intervalMs: 580 }, { enemyId: 'scribble_goblin', count: 10, intervalMs: 320 }] },
  { wave: 4, title: 'Ink on the Wing', entries: [{ enemyId: 'winged_inkling', count: 28, intervalMs: 230 }, { enemyId: 'candle_knight', count: 5, intervalMs: 620 }] },
  { wave: 5, title: 'First Broken Chapter', entries: [{ enemyId: 'scribble_goblin', count: 20, intervalMs: 260 }, { enemyId: 'candle_knight', count: 9, intervalMs: 520, elite: true }, { enemyId: 'gloom_slime', count: 7, intervalMs: 620 }] },
  { wave: 6, title: 'The Wax Baron', entries: [{ enemyId: 'wax_baron', count: 1, intervalMs: 900 }, { enemyId: 'candle_knight', count: 12, intervalMs: 440 }, { enemyId: 'scribble_goblin', count: 18, intervalMs: 210 }] },
  { wave: 7, title: 'Wound Clock Dragons', entries: [{ enemyId: 'clockwork_wyvern', count: 10, intervalMs: 620 }, { enemyId: 'winged_inkling', count: 18, intervalMs: 250 }] },
  { wave: 8, title: 'Auditors of Doom', entries: [{ enemyId: 'curse_collector', count: 14, intervalMs: 470 }, { enemyId: 'gloom_slime', count: 10, intervalMs: 560 }] },
  { wave: 9, title: 'Library Riot', entries: [{ enemyId: 'scribble_goblin', count: 30, intervalMs: 170 }, { enemyId: 'clockwork_wyvern', count: 9, intervalMs: 620 }, { enemyId: 'candle_knight', count: 13, intervalMs: 390 }] },
  { wave: 10, title: 'The Ink Duchess', entries: [{ enemyId: 'ink_duchess', count: 1, intervalMs: 900 }, { enemyId: 'winged_inkling', count: 36, intervalMs: 145 }, { enemyId: 'gloom_slime', count: 9, intervalMs: 520 }] },
  { wave: 11, title: 'Fast Ink, Hard Wax', entries: [{ enemyId: 'winged_inkling', count: 40, intervalMs: 135 }, { enemyId: 'curse_collector', count: 13, intervalMs: 430 }, { enemyId: 'candle_knight', count: 14, intervalMs: 380 }] },
  { wave: 12, title: 'The Page Eater', entries: [{ enemyId: 'page_eater', count: 1, intervalMs: 850 }, { enemyId: 'curse_collector', count: 8, intervalMs: 450 }, { enemyId: 'scribble_goblin', count: 24, intervalMs: 210 }, { enemyId: 'winged_inkling', count: 20, intervalMs: 240 }] },
  { wave: 13, title: 'Receipts from Below', entries: [{ enemyId: 'ledger_lich', count: 1, intervalMs: 900 }, { enemyId: 'curse_collector', count: 18, intervalMs: 360 }, { enemyId: 'clockwork_wyvern', count: 10, intervalMs: 560 }] },
  { wave: 14, title: 'Split Rain', entries: [{ enemyId: 'gloom_slime', count: 24, intervalMs: 330 }, { enemyId: 'winged_inkling', count: 28, intervalMs: 150 }, { enemyId: 'wax_baron', count: 1, intervalMs: 1050 }] },
  { wave: 15, title: 'The Starved Atlas', entries: [{ enemyId: 'starved_atlas', count: 1, intervalMs: 1000 }, { enemyId: 'gloom_slime', count: 18, intervalMs: 380 }, { enemyId: 'candle_knight', count: 16, intervalMs: 340 }] },
  { wave: 16, title: 'Clockbreak Swarm', entries: [{ enemyId: 'clockwork_wyvern', count: 18, intervalMs: 440 }, { enemyId: 'winged_inkling', count: 45, intervalMs: 120 }, { enemyId: 'ink_duchess', count: 1, intervalMs: 1200 }] },
  { wave: 17, title: 'The Null Clock', entries: [{ enemyId: 'null_clock', count: 1, intervalMs: 1000 }, { enemyId: 'clockwork_wyvern', count: 14, intervalMs: 480 }, { enemyId: 'curse_collector', count: 12, intervalMs: 420 }] },
  { wave: 18, title: 'All Chapters Bite Back', entries: [{ enemyId: 'starved_atlas', count: 1, intervalMs: 900 }, { enemyId: 'null_clock', count: 1, intervalMs: 1300 }, { enemyId: 'page_eater', count: 1, intervalMs: 1600 }, { enemyId: 'winged_inkling', count: 36, intervalMs: 120 }, { enemyId: 'curse_collector', count: 18, intervalMs: 300 }] },
];
