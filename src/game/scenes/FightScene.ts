import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { InputManager } from '../systems/InputManager';
import { PhysicsManager } from '../systems/PhysicsManager';
import { CHARACTERS, type CharacterDefinition } from '../data/characters';
import { SCENE_ASSETS } from '../data/assetPaths';

export class FightScene extends Phaser.Scene {
  private fighter1!: Fighter;
  private fighter2!: Fighter;
  private input1!: InputManager;
  private input2!: InputManager;
  private physicsMgr!: PhysicsManager;
  private healthBar1!: Phaser.GameObjects.Graphics;
  private healthBar2!: Phaser.GameObjects.Graphics;
  private fightBgm?: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'Fight' });
  }

  preload(): void {
    this.load.image('arcade_floor', SCENE_ASSETS.arcadeFloor);
    this.load.audio('fight_bgm', [...SCENE_ASSETS.fightBgm]);
  }

  create(data: { player1Char?: string; player2Char?: string }): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const p1Id = data.player1Char ?? 'player';
    const p2Id = data.player2Char ?? 'female';
    const def1 = CHARACTERS.find((c) => c.id === p1Id) ?? CHARACTERS[0];
    const def2 = CHARACTERS.find((c) => c.id === p2Id) ?? CHARACTERS[1];

    this.physicsMgr = new PhysicsManager(this);

    const floorY = height - 140;
    const p1X = width * 0.3;
    const p2X = width * 0.7;
    const platformH = 140;
    const platformCy = height - 70;

    const platformTopY = platformCy - platformH / 2;
    this.drawFightBackground(width, height, platformTopY);

    if (!this.textures.exists('arcade_floor')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x3d4451);
      g.fillRect(0, 0, 128, 128);
      g.fillStyle(0x2d3436);
      g.fillRect(0, 0, 64, 64);
      g.fillRect(64, 64, 64, 64);
      g.generateTexture('arcade_floor', 128, 128);
      g.destroy();
    }

    const floorTile = this.add.tileSprite(width / 2, platformCy, width, platformH, 'arcade_floor');
    floorTile.setDepth(1);

    const platform = this.add.rectangle(width / 2, platformCy, width, platformH, 0x2d3436);
    platform.setVisible(false);
    this.physics.add.existing(platform, true);

    this.fighter1 = new Fighter(this, p1X, floorY, def1, 1);
    this.fighter2 = new Fighter(this, p2X, floorY, def2, 2);
    this.fighter1.setDepth(10);
    this.fighter2.setDepth(10);

    this.input1 = new InputManager(this, 1);
    this.input2 = new InputManager(this, 2);

    this.physics.add.collider(
      this.fighter1 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      this.fighter2 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
    );
    this.physics.add.collider(
      this.fighter1 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      platform as Phaser.Types.Physics.Arcade.GameObjectWithBody,
    );
    this.physics.add.collider(
      this.fighter2 as Phaser.Types.Physics.Arcade.GameObjectWithBody,
      platform as Phaser.Types.Physics.Arcade.GameObjectWithBody,
    );

    this.healthBar1 = this.add.graphics();
    this.healthBar2 = this.add.graphics();
    this.healthBar1.setDepth(100);
    this.healthBar2.setDepth(100);
    this.drawHealthBars(def1, def2);

    const title = this.add.text(width / 2, 28, 'VS', {
      fontSize: '24px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setDepth(100);

    const p1Label = this.add.text(120, 55, def1.name, { fontSize: '16px', color: '#fff' });
    p1Label.setOrigin(0.5, 0.5);
    const p2Label = this.add.text(width - 120, 55, def2.name, { fontSize: '16px', color: '#fff' });
    p2Label.setOrigin(0.5, 0.5);
    p1Label.setDepth(100);
    p2Label.setDepth(100);

    // Phaser does not call Scene.shutdown(); cleanup must listen on sys.events.
    this.sys.events.once(Phaser.Scenes.Events.SHUTDOWN, this.stopFightBgm, this);

    if (this.cache.audio.exists('fight_bgm')) {
      this.sound.stopByKey('fight_bgm');
      this.fightBgm = this.sound.add('fight_bgm', { loop: true, volume: 0.35 });
      this.fightBgm.play();
    }
  }

  private stopFightBgm(): void {
    if (this.fightBgm) {
      this.fightBgm.stop();
      this.fightBgm.destroy();
      this.fightBgm = undefined;
    } else {
      this.sound.stopByKey('fight_bgm');
    }
  }

  /** Arena-style backdrop (procedural gradient + subtle grid). */
  private drawFightBackground(width: number, height: number, platformTopY: number): void {
    const g = this.add.graphics();
    g.setDepth(0);
    const top = 0x0f3460;
    const mid = 0x1a1a2e;
    const steps = 24;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Phaser.Math.Linear((top >> 16) & 0xff, (mid >> 16) & 0xff, t);
      const gr = Phaser.Math.Linear((top >> 8) & 0xff, (mid >> 8) & 0xff, t);
      const b = Phaser.Math.Linear(top & 0xff, mid & 0xff, t);
      const color = (r << 16) | (gr << 8) | b;
      g.fillStyle(color, 1);
      g.fillRect(0, (height * t) / steps, width, height / steps + 1);
    }
    g.lineStyle(1, 0x533483, 0.15);
    for (let x = 0; x < width; x += 80) {
      g.lineBetween(x, 0, x, platformTopY);
    }
    g.lineStyle(2, 0xe94560, 0.2);
    g.lineBetween(0, platformTopY, width, platformTopY);
  }

  private drawHealthBars(def1: CharacterDefinition, def2: CharacterDefinition): void {
    const barW = 200;
    const barH = 16;
    const x1 = 40;
    const x2 = this.cameras.main.width - 40 - barW;
    const y = 40;

    this.healthBar1.clear();
    this.healthBar1.fillStyle(0x333333, 1);
    this.healthBar1.fillRect(x1, y, barW, barH);
    this.healthBar1.fillStyle(0x4ecca3, 1);
    this.healthBar1.fillRect(x1, y, barW * (this.fighter1.hp / def1.hp), barH);

    this.healthBar2.clear();
    this.healthBar2.fillStyle(0x333333, 1);
    this.healthBar2.fillRect(x2, y, barW, barH);
    this.healthBar2.fillStyle(0xe94560, 1);
    this.healthBar2.fillRect(x2 + barW * (1 - this.fighter2.hp / def2.hp), y, barW * (this.fighter2.hp / def2.hp), barH);
  }

  update(): void {
    const dir1 = this.input1.getDirection();
    const dir2 = this.input2.getDirection();

    if (this.fighter1.state !== 'hurt' && this.fighter1.state !== 'ko') {
      if (this.input1.isJumpJustDown()) this.fighter1.tryJump();
      else if (this.input1.isPunchJustDown()) this.fighter1.tryPunch();
      else if (this.input1.isKickJustDown()) this.fighter1.tryKick();
    }
    if (this.fighter2.state !== 'hurt' && this.fighter2.state !== 'ko') {
      if (this.input2.isJumpJustDown()) this.fighter2.tryJump();
      else if (this.input2.isPunchJustDown()) this.fighter2.tryPunch();
      else if (this.input2.isKickJustDown()) this.fighter2.tryKick();
    }

    this.fighter1.update(this.time.now, dir1);
    this.fighter2.update(this.time.now, dir2);

    this.physicsMgr.checkHits(this.fighter1, this.fighter2);
    this.physicsMgr.checkHits(this.fighter2, this.fighter1);

    this.drawHealthBars(this.fighter1.characterDef, this.fighter2.characterDef);

    if (this.fighter1.state === 'ko') {
      const w = this.fighter2.characterDef;
      this.scene.start('Victory', {
        winner: 2,
        winnerSpritePrefix: w.spritePrefix,
        winnerName: w.name,
      });
    } else if (this.fighter2.state === 'ko') {
      const w = this.fighter1.characterDef;
      this.scene.start('Victory', {
        winner: 1,
        winnerSpritePrefix: w.spritePrefix,
        winnerName: w.name,
      });
    }
  }
}
