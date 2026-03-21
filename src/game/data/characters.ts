/**
 * Character definitions: stats, moves, sprite keys.
 * Placeholder - will contain full character roster data.
 */
export interface CharacterDefinition {
  id: string;
  name: string;
  spriteKey: string;
  hp: number;
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'default',
    name: 'Fighter',
    spriteKey: 'fighter_default',
    hp: 100,
  },
];
