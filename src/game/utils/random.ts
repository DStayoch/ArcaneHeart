export const sample = <T>(items: T[], count: number): T[] => {
  const pool = [...items];
  const out: T[] = [];
  while (pool.length && out.length < count) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
};
