import Phaser from 'phaser';
import { PLAYER_POSES, FEMALE_POSES } from '../data/assetPaths';

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

    // Kenney platformer characters (Player, Female) - individual pose PNGs
    Object.entries(PLAYER_POSES).forEach(([key, path]) => {
      this.load.image(`player_${key}`, path);
    });
    Object.entries(FEMALE_POSES).forEach(([key, path]) => {
      this.load.image(`female_${key}`, path);
    });

  }

  create(): void {
    // Player animations
    this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'player_idle' }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: 'player_walk',
      frames: [
        { key: 'player_walk1' },
        { key: 'player_walk2' },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player_punch',
      frames: [
        { key: 'player_action1' },
        { key: 'player_action2' },
      ],
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: 'player_kick',
      frames: [{ key: 'player_kick' }],
      frameRate: 1,
      repeat: 0,
    });
    this.anims.create({
      key: 'player_hurt',
      frames: [{ key: 'player_hurt' }],
      frameRate: 1,
      repeat: 0,
    });
    this.anims.create({
      key: 'player_jump',
      frames: [{ key: 'player_jump' }],
      frameRate: 1,
      repeat: -1,
    });

    // Female animations
    this.anims.create({
      key: 'female_idle',
      frames: [{ key: 'female_idle' }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: 'female_walk',
      frames: [
        { key: 'female_walk1' },
        { key: 'female_walk2' },
      ],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'female_punch',
      frames: [
        { key: 'female_action1' },
        { key: 'female_action2' },
      ],
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: 'female_kick',
      frames: [{ key: 'female_kick' }],
      frameRate: 1,
      repeat: 0,
    });
    this.anims.create({
      key: 'female_hurt',
      frames: [{ key: 'female_hurt' }],
      frameRate: 1,
      repeat: 0,
    });
    this.anims.create({
      key: 'female_jump',
      frames: [{ key: 'female_jump' }],
      frameRate: 1,
      repeat: -1,
    });

    this.scene.start('MainMenu');
  }
}
