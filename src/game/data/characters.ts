/**
 * Character definitions: stats, moves, sprite keys, and per-fighter special attacks.
 */

/** Global special cooldown (ms); shown in UI next to health bars. */
export const SPECIAL_COOLDOWN_MS = 5000;

/** Spawn / hazard data produced when a fighter uses their special (handled in FightScene). */
export type SpecialSpawnRequest =
  | {
      type: 'straight';
      textureKey: string;
      x: number;
      y: number;
      vx: number;
      damage: number;
      owner: 1 | 2;
    }
  | {
      type: 'boomerang';
      textureKey: string;
      x: number;
      y: number;
      vx: number;
      maxDistance: number;
      outboundDamage: number;
      returnDamage: number;
      owner: 1 | 2;
    }
  | {
      type: 'groundHazard';
      x: number;
      y: number;
      owner: 1 | 2;
      damagePerTick: number;
      tickMs: number;
      durationMs: number;
      halfWidth: number;
      visual: 'fire' | 'toxic';
    }
  | {
      type: 'teleport';
      owner: 1 | 2;
      deltaX: number;
    };

export type SpecialAttackConfig =
  | { kind: 'iceBall'; damage: number; speed: number }
  | {
      kind: 'boomerang';
      outboundDamage: number;
      returnDamage: number;
      speed: number;
      maxDistance: number;
    }
  | {
      kind: 'firePatch';
      damagePerTick: number;
      tickMs: number;
      durationMs: number;
      halfWidth: number;
      placeOffsetX: number;
    }
  | { kind: 'burstRound'; damage: number; speed: number }
  | {
      kind: 'toxicPatch';
      damagePerTick: number;
      tickMs: number;
      durationMs: number;
      halfWidth: number;
      placeOffsetX: number;
    }
  | { kind: 'teleport'; forwardDistance: number };

export interface CharacterDefinition {
  id: string;
  name: string;
  spritePrefix: string;
  hp: number;
  walkSpeed: number;
  jumpForce: number;
  punchDamage: number;
  kickDamage: number;
  special: SpecialAttackConfig;
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
    special: {
      kind: 'firePatch',
      damagePerTick: 6,
      tickMs: 300,
      durationMs: 2800,
      halfWidth: 58,
      placeOffsetX: 72,
    },
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
    special: {
      kind: 'boomerang',
      outboundDamage: 11,
      returnDamage: 6,
      speed: 340,
      maxDistance: 220,
    },
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
    special: { kind: 'iceBall', damage: 20, speed: 300 },
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
    special: { kind: 'burstRound', damage: 16, speed: 620 },
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
    special: {
      kind: 'toxicPatch',
      damagePerTick: 5,
      tickMs: 320,
      durationMs: 3200,
      halfWidth: 52,
      placeOffsetX: 64,
    },
  },
  {
    id: 'robot',
    name: 'Blink',
    spritePrefix: 'robot',
    hp: 88,
    walkSpeed: 188,
    jumpForce: -430,
    punchDamage: 7,
    kickDamage: 14,
    special: { kind: 'teleport', forwardDistance: 210 },
  },
];
