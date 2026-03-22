const STORAGE_KEY = 'zenithfighters_adventure_highscores';
const MAX_ENTRIES = 15;

export interface AdventureHighScoreEntry {
  name: string;
  victories: number;
  at: number;
}

function browserLocalStorage(): Storage | null {
  try {
    const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
    return ls ?? null;
  } catch {
    return null;
  }
}

function parseStored(raw: string | null): AdventureHighScoreEntry[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter(
        (e): e is AdventureHighScoreEntry =>
          e !== null &&
          typeof e === 'object' &&
          typeof (e as AdventureHighScoreEntry).name === 'string' &&
          typeof (e as AdventureHighScoreEntry).victories === 'number' &&
          typeof (e as AdventureHighScoreEntry).at === 'number',
      )
      .map((e) => ({
        name: e.name.slice(0, 32),
        victories: Math.max(0, Math.floor(e.victories)),
        at: e.at,
      }));
  } catch {
    return [];
  }
}

export function loadAdventureHighScores(): AdventureHighScoreEntry[] {
  const ls = browserLocalStorage();
  if (!ls) return [];
  return parseStored(ls.getItem(STORAGE_KEY)).sort((a, b) => {
    if (b.victories !== a.victories) return b.victories - a.victories;
    return b.at - a.at;
  });
}

/** Inserts a run, trims to top `MAX_ENTRIES`, persists, returns sorted list. */
export function saveAdventureHighScore(name: string, victories: number): AdventureHighScoreEntry[] {
  const trimmed = name.trim().slice(0, 24) || 'Fighter';
  const entry: AdventureHighScoreEntry = {
    name: trimmed,
    victories: Math.max(0, Math.floor(victories)),
    at: Date.now(),
  };
  const next = [...loadAdventureHighScores(), entry].sort((a, b) => {
    if (b.victories !== a.victories) return b.victories - a.victories;
    return b.at - a.at;
  });
  const top = next.slice(0, MAX_ENTRIES);
  const ls = browserLocalStorage();
  if (ls) {
    try {
      ls.setItem(STORAGE_KEY, JSON.stringify(top));
    } catch {
      /* ignore quota / private mode */
    }
  }
  return top;
}
