# The Living Spire

A playable TypeScript + Phaser + Vite prototype for a vertical fantasy tower-defense roguelite.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Prototype Features

- Menu, game, and win/loss scenes.
- Ten-floor vertical spire battlefield with zigzag climbing path.
- Build slots on both sides of every floor.
- Eight magical room types with costs, tags, targeting, upgrades, and selling.
- Seven enemy definitions and ten waves, including The Page Eater boss.
- Mana, Essence, and Arcane Heart HP economy.
- Status effects: Burning, Snared, Frail, Dazed, Chilled, and Marked support.
- Spell combo detection with visible leyline links and active combo UI.
- Mutation choices after every second completed wave.
- HUD, wave preview, build tooltips, room panel, pause, restart, and speed toggle.

## Content Data

Balance and content live under `src/game/data`:

- `rooms.ts`
- `enemies.ts`
- `waves.ts`
- `combos.ts`
- `mutations.ts`

The systems under `src/game/systems` consume those definitions so new rooms, waves, enemies, and combos can be added without rewriting the main scene.
