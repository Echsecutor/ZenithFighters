/**
 * Asset paths for Kenney characters (CC0).
 * Platformer Characters 1 + Toon Characters 1 (robot); individual pose PNGs — no tilesheet parsing.
 */

/** Resolves a path under `public/` for Phaser `load.image` / `load.audio` (GitHub Pages subpath + `base: './'`). */
function publicUrl(pathFromPublic: string): string {
  const rel = pathFromPublic.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? `${base}${rel}` : `${base}/${rel}`;
}

const KENNEY_BASE = publicUrl('assets/kenney_extracted/PNG');
/** Robot from Kenney Toon Characters 1 (CC0); individual poses aligned with `KenneyPoseKey`. */
const KENNEY_TOON_BASE = publicUrl('assets/kenney_toon_extracted/PNG');

/** Fight scene: floor texture (`public/assets/backgrounds/`, vendored in repo). */
export const SCENE_ASSETS = {
  arcadeFloor: publicUrl('assets/backgrounds/arcade_floor.png'),
  /** MP3 first (Safari/iOS), Ogg Opus fallback. */
  fightBgm: [
    publicUrl('assets/audio/crimsonVoltageRising.mp3'),
    publicUrl('assets/audio/crimsonVoltageRising.ogg'),
  ],
} as const;

/** Pose file keys → used as texture suffix `${prefix}_${key}` in BootScene. */
export type KenneyPoseKey =
  | 'idle'
  | 'walk1'
  | 'walk2'
  | 'jump'
  | 'kick'
  | 'hurt'
  | 'action1'
  | 'action2';

export type KenneyPoseMap = Record<KenneyPoseKey, string>;

export const PLAYER_POSES: KenneyPoseMap = {
  idle: `${KENNEY_BASE}/Player/Poses/player_idle.png`,
  walk1: `${KENNEY_BASE}/Player/Poses/player_walk1.png`,
  walk2: `${KENNEY_BASE}/Player/Poses/player_walk2.png`,
  jump: `${KENNEY_BASE}/Player/Poses/player_jump.png`,
  kick: `${KENNEY_BASE}/Player/Poses/player_kick.png`,
  hurt: `${KENNEY_BASE}/Player/Poses/player_hurt.png`,
  action1: `${KENNEY_BASE}/Player/Poses/player_action1.png`,
  action2: `${KENNEY_BASE}/Player/Poses/player_action2.png`,
};

export const FEMALE_POSES: KenneyPoseMap = {
  idle: `${KENNEY_BASE}/Female/Poses/female_idle.png`,
  walk1: `${KENNEY_BASE}/Female/Poses/female_walk1.png`,
  walk2: `${KENNEY_BASE}/Female/Poses/female_walk2.png`,
  jump: `${KENNEY_BASE}/Female/Poses/female_jump.png`,
  kick: `${KENNEY_BASE}/Female/Poses/female_kick.png`,
  hurt: `${KENNEY_BASE}/Female/Poses/female_hurt.png`,
  action1: `${KENNEY_BASE}/Female/Poses/female_action1.png`,
  action2: `${KENNEY_BASE}/Female/Poses/female_action2.png`,
};

export const ADVENTURER_POSES: KenneyPoseMap = {
  idle: `${KENNEY_BASE}/Adventurer/Poses/adventurer_idle.png`,
  walk1: `${KENNEY_BASE}/Adventurer/Poses/adventurer_walk1.png`,
  walk2: `${KENNEY_BASE}/Adventurer/Poses/adventurer_walk2.png`,
  jump: `${KENNEY_BASE}/Adventurer/Poses/adventurer_jump.png`,
  kick: `${KENNEY_BASE}/Adventurer/Poses/adventurer_kick.png`,
  hurt: `${KENNEY_BASE}/Adventurer/Poses/adventurer_hurt.png`,
  action1: `${KENNEY_BASE}/Adventurer/Poses/adventurer_action1.png`,
  action2: `${KENNEY_BASE}/Adventurer/Poses/adventurer_action2.png`,
};

export const SOLDIER_POSES: KenneyPoseMap = {
  idle: `${KENNEY_BASE}/Soldier/Poses/soldier_idle.png`,
  walk1: `${KENNEY_BASE}/Soldier/Poses/soldier_walk1.png`,
  walk2: `${KENNEY_BASE}/Soldier/Poses/soldier_walk2.png`,
  jump: `${KENNEY_BASE}/Soldier/Poses/soldier_jump.png`,
  kick: `${KENNEY_BASE}/Soldier/Poses/soldier_kick.png`,
  hurt: `${KENNEY_BASE}/Soldier/Poses/soldier_hurt.png`,
  action1: `${KENNEY_BASE}/Soldier/Poses/soldier_action1.png`,
  action2: `${KENNEY_BASE}/Soldier/Poses/soldier_action2.png`,
};

export const ZOMBIE_POSES: KenneyPoseMap = {
  idle: `${KENNEY_BASE}/Zombie/Poses/zombie_idle.png`,
  walk1: `${KENNEY_BASE}/Zombie/Poses/zombie_walk1.png`,
  walk2: `${KENNEY_BASE}/Zombie/Poses/zombie_walk2.png`,
  jump: `${KENNEY_BASE}/Zombie/Poses/zombie_jump.png`,
  kick: `${KENNEY_BASE}/Zombie/Poses/zombie_kick.png`,
  hurt: `${KENNEY_BASE}/Zombie/Poses/zombie_hurt.png`,
  action1: `${KENNEY_BASE}/Zombie/Poses/zombie_action1.png`,
  action2: `${KENNEY_BASE}/Zombie/Poses/zombie_action2.png`,
};

export const ROBOT_POSES: KenneyPoseMap = {
  idle: `${KENNEY_TOON_BASE}/Robot/Poses/robot_idle.png`,
  walk1: `${KENNEY_TOON_BASE}/Robot/Poses/robot_walk1.png`,
  walk2: `${KENNEY_TOON_BASE}/Robot/Poses/robot_walk2.png`,
  jump: `${KENNEY_TOON_BASE}/Robot/Poses/robot_jump.png`,
  kick: `${KENNEY_TOON_BASE}/Robot/Poses/robot_kick.png`,
  hurt: `${KENNEY_TOON_BASE}/Robot/Poses/robot_hurt.png`,
  action1: `${KENNEY_TOON_BASE}/Robot/Poses/robot_action1.png`,
  action2: `${KENNEY_TOON_BASE}/Robot/Poses/robot_action2.png`,
};

/** Maps `CharacterDefinition.spritePrefix` → pose paths for BootScene. */
export const KENNEY_CHARACTER_POSES: Record<string, KenneyPoseMap> = {
  player: PLAYER_POSES,
  female: FEMALE_POSES,
  adventurer: ADVENTURER_POSES,
  soldier: SOLDIER_POSES,
  zombie: ZOMBIE_POSES,
  robot: ROBOT_POSES,
};
