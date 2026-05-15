export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const chance = (probability: number) => Math.random() < probability;
