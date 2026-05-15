import { FLOOR_COUNT, FLOOR_HEIGHT, TOWER_TOP, TOWER_X } from '../core/constants';

export interface PathPoint {
  x: number;
  y: number;
  floor: number;
}

export const createSpirePath = (): PathPoint[] => {
  const points: PathPoint[] = [];
  for (let floor = FLOOR_COUNT - 1; floor >= 0; floor -= 1) {
    const y = TOWER_TOP + floor * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.55;
    const x = TOWER_X + (floor % 2 === 0 ? -34 : 34);
    points.push({ x, y, floor });
  }
  return points;
};

export const getPointAtProgress = (path: PathPoint[], progress: number) => {
  if (progress <= 0) return path[0];
  if (progress >= 1) return path[path.length - 1];
  const scaled = progress * (path.length - 1);
  const index = Math.floor(scaled);
  const local = scaled - index;
  const a = path[index];
  const b = path[Math.min(index + 1, path.length - 1)];
  return {
    x: a.x + (b.x - a.x) * local,
    y: a.y + (b.y - a.y) * local,
    floor: Math.round(a.floor + (b.floor - a.floor) * local),
  };
};
