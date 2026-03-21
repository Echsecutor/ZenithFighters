/**
 * Asset paths for Kenney platformer characters (CC0, OpenGameArt).
 * Uses individual pose PNGs - no tilesheet parsing.
 */
const KENNEY_BASE = '/assets/kenney_extracted/PNG';

/** Fight scene: floor texture (run `scripts/download-assets.ps1` if missing). */
export const SCENE_ASSETS = {
  arcadeFloor: '/assets/backgrounds/arcade_floor.png',
} as const;

export const PLAYER_POSES = {
  idle: `${KENNEY_BASE}/Player/Poses/player_idle.png`,
  walk1: `${KENNEY_BASE}/Player/Poses/player_walk1.png`,
  walk2: `${KENNEY_BASE}/Player/Poses/player_walk2.png`,
  jump: `${KENNEY_BASE}/Player/Poses/player_jump.png`,
  kick: `${KENNEY_BASE}/Player/Poses/player_kick.png`,
  hurt: `${KENNEY_BASE}/Player/Poses/player_hurt.png`,
  action1: `${KENNEY_BASE}/Player/Poses/player_action1.png`,
  action2: `${KENNEY_BASE}/Player/Poses/player_action2.png`,
};

export const FEMALE_POSES = {
  idle: `${KENNEY_BASE}/Female/Poses/female_idle.png`,
  walk1: `${KENNEY_BASE}/Female/Poses/female_walk1.png`,
  walk2: `${KENNEY_BASE}/Female/Poses/female_walk2.png`,
  jump: `${KENNEY_BASE}/Female/Poses/female_jump.png`,
  kick: `${KENNEY_BASE}/Female/Poses/female_kick.png`,
  hurt: `${KENNEY_BASE}/Female/Poses/female_hurt.png`,
  action1: `${KENNEY_BASE}/Female/Poses/female_action1.png`,
  action2: `${KENNEY_BASE}/Female/Poses/female_action2.png`,
};
