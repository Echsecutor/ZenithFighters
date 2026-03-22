import { CHARACTERS } from './characters';

/** Starting stock for Adventure mode (each loss consumes one). */
export const ADVENTURE_START_LIVES = 3;

/** Pick a random roster id for the CPU; prefers a different id than the player when possible. */
export function pickRandomCpuOpponent(excludeCharacterId?: string): string {
  const pool =
    excludeCharacterId !== undefined
      ? CHARACTERS.filter((c) => c.id !== excludeCharacterId)
      : [...CHARACTERS];
  const list = pool.length > 0 ? pool : [...CHARACTERS];
  const c = list[Math.floor(Math.random() * list.length)];
  return c?.id ?? CHARACTERS[0]!.id;
}
