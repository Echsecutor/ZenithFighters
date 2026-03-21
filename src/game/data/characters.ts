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
  {
    id: 'adventurer',
    name: 'Scout',
    spritePrefix: 'adventurer',
    hp: 95,
    walkSpeed: 195,
    jumpForce: -440,
    punchDamage: 7,
    kickDamage: 15,
  },
  {
    id: 'soldier',
    name: 'Vanguard',
    spritePrefix: 'soldier',
    hp: 110,
    walkSpeed: 165,
    jumpForce: -400,
    punchDamage: 9,
    kickDamage: 13,
  },
  {
    id: 'zombie',
    name: 'Shambler',
    spritePrefix: 'zombie',
    hp: 120,
    walkSpeed: 150,
    jumpForce: -380,
    punchDamage: 10,
    kickDamage: 12,
  },
];
