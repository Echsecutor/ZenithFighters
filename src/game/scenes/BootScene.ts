import Phaser from 'phaser';
import { CHARACTERS } from '../data/characters';
import { KENNEY_CHARACTER_POSES } from '../data/assetPaths';

function preloadCharacterSprites(scene: Phaser.Scene, spritePrefix: string): void {
  const poses = KENNEY_CHARACTER_POSES[spritePrefix];
  if (!poses) return;
  for (const [key, path] of Object.entries(poses)) {
    scene.load.image(`${spritePrefix}_${key}`, path);
  }
}

function registerCharacterAnimations(scene: Phaser.Scene, spritePrefix: string): void {
  scene.anims.create({
    key: `${spritePrefix}_idle`,
    frames: [{ key: `${spritePrefix}_idle` }],
    frameRate: 1,
    repeat: -1,
  });
  scene.anims.create({
    key: `${spritePrefix}_walk`,
    frames: [{ key: `${spritePrefix}_walk1` }, { key: `${spritePrefix}_walk2` }],
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: `${spritePrefix}_punch`,
    frames: [{ key: `${spritePrefix}_action1` }, { key: `${spritePrefix}_action2` }],
    frameRate: 12,
    repeat: 0,
  });
  scene.anims.create({
    key: `${spritePrefix}_kick`,
    frames: [{ key: `${spritePrefix}_kick` }],
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: `${spritePrefix}_hurt`,
    frames: [{ key: `${spritePrefix}_hurt` }],
    frameRate: 1,
    repeat: 0,
  });
  scene.anims.create({
    key: `${spritePrefix}_jump`,
    frames: [{ key: `${spritePrefix}_jump` }],
    frameRate: 1,
    repeat: -1,
  });
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const text = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);

    const seen = new Set<string>();
    for (const c of CHARACTERS) {
      if (seen.has(c.spritePrefix)) continue;
      seen.add(c.spritePrefix);
      preloadCharacterSprites(this, c.spritePrefix);
    }
  }

  create(): void {
    const seen = new Set<string>();
    for (const c of CHARACTERS) {
      if (seen.has(c.spritePrefix)) continue;
      seen.add(c.spritePrefix);
      registerCharacterAnimations(this, c.spritePrefix);
    }

    this.scene.start('MainMenu');
  }
}
