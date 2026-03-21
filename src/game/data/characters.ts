/**
 * Character definitions: stats, moves, sprite keys.
 */
export interface CharacterDefinition {
  id: string;
  name: string;
  spritePrefix: string;
  hp: number;
  walkSpeed: number;
  jumpForce: number;
  punchDamage: number;
  kickDamage: number;
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'player',
    name: 'Brawler',
    spritePrefix: 'player',
    hp: 100,
    walkSpeed: 180,
    jumpForce: -420,
    punchDamage: 8,
    kickDamage: 14,
  },
  {
    id: 'female',
    name: 'Striker',
    spritePrefix: 'female',
    hp: 90,
    walkSpeed: 200,
    jumpForce: -450,
    punchDamage: 6,
    kickDamage: 18,
  },
];
