import Phaser from 'phaser';
import { BoomerangProjectile } from '../entities/BoomerangProjectile';
import { Fighter } from '../entities/Fighter';
import { GroundHazard } from '../entities/GroundHazard';
import { SpecialProjectile } from '../entities/SpecialProjectile';
import { InputManager } from '../systems/InputManager';
import { CpuController, type CpuDifficulty } from '../systems/CpuController';
import { PhysicsManager } from '../systems/PhysicsManager';
import { CHARACTERS, type CharacterDefinition, type SpecialSpawnRequest } from '../data/characters';
import { SCENE_ASSETS } from '../data/assetPaths';

export class FightScene extends Phaser.Scene {
  private fighter1!: Fighter;
  private fighter2!: Fighter;
  private input1!: InputManager;
  private input2?: InputManager;
  private cpu?: CpuController;
  private vsCpu = false;
  private cpuDifficulty: CpuDifficulty = 'easy';
  private physicsMgr!: PhysicsManager;
  private healthBar1!: Phaser.GameObjects.Graphics;
  private healthBar2!: Phaser.GameObjects.Graphics;
  private specialHud1!: Phaser.GameObjects.Text;
  private specialHud2!: Phaser.GameObjects.Text;
  private fightBgm?: Phaser.Sound.BaseSound;
  private projectiles: SpecialProjectile[] = [];
  private boomerangs: BoomerangProjectile[] = [];
  private groundHazards: GroundHazard[] = [];
  private collidePlatform!: Phaser.Types.Physics.Arcade.GameObjectWithBody;
  private playerArrow1!: Phaser.GameObjects.Image;
  private playerArrow2!: Phaser.GameObjects.Image;

  /** Outgoing damage multiplier for P2 when VS CPU hard mode. */
  private static readonly HARD_CPU_DAMAGE_MULT = 1.35;

  constructor() {
    super({ key: 'Fight' });
  }

  preload(): void {
    this.load.image('arcade_floor', SCENE_ASSETS.arcadeFloor);
    this.load.audio('fight_bgm', [...SCENE_ASSETS.fightBgm]);
  }

  private ensureSpecialTextures(): void {
    if (!this.textures.exists('special_ice')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x66ddff, 1);
      g.fillCircle(12, 12, 10);
      g.lineStyle(2, 0xffffff, 0.95);
      g.strokeCircle(12, 12, 10);
      g.generateTexture('special_ice', 24, 24);
      g.destroy();
    }
    if (!this.textures.exists('special_slug')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffee44, 1);
      g.fillEllipse(12, 12, 20, 10);
      g.lineStyle(2, 0xffaa22, 1);
      g.strokeEllipse(12, 12, 20, 10);
      g.generateTexture('special_slug', 24, 24);
      g.destroy();
    }
    if (!this.textures.exists('special_boomerang')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.lineStyle(4, 0x6b4a1e, 1);
      g.beginPath();
      g.arc(16, 16, 12, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(-30), false);
      g.strokePath();
      g.lineStyle(3, 0xc9a227, 1);
      g.beginPath();
      g.arc(16, 16, 8, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(-20), false);
      g.strokePath();
      g.generateTexture('special_boomerang', 32, 32);
      g.destroy();
    }
  }

  /** Down-pointing chevrons above fighters (P1 blue, P2 red). */
  private ensurePlayerArrowTextures(): void {
    const w = 22;
    const h = 18;
    const draw = (key: string, fill: number, stroke: number) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(fill, 1);
      g.lineStyle(2, stroke, 0.9);
      g.beginPath();
      g.moveTo(w / 2, h - 1);
      g.lineTo(2, 3);
      g.lineTo(w - 2, 3);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.generateTexture(key, w, h);
      g.destroy();
    };
    draw('player_arrow_p1', 0x3b82f6, 0xffffff);
    draw('player_arrow_p2', 0xe94560, 0xffffff);
  }

  /** Multi-frame procedural textures for ground fire / toxic hazards (`GroundHazard`). */
  private ensureHazardTextures(): void {
    const fw = 64;
    const fh = 40;
    const n = 8;
    const firePrefix = 'hazard_fire_f';
    if (!this.textures.exists(`${firePrefix}0`)) {
      for (let i = 0; i < n; i++) {
        const g = this.make.graphics({ x: 0, y: 0 });
        FightScene.drawHazardFireFrame(g, i, n, fw, fh);
        g.generateTexture(`${firePrefix}${i}`, fw, fh);
        g.destroy();
      }
      if (!this.anims.exists('hazard_fire_anim')) {
        this.anims.create({
          key: 'hazard_fire_anim',
          frames: Array.from({ length: n }, (_, i) => ({ key: `${firePrefix}${i}` })),
          frameRate: 14,
          repeat: -1,
        });
      }
    }
    const toxPrefix = 'hazard_toxic_f';
    if (!this.textures.exists(`${toxPrefix}0`)) {
      for (let i = 0; i < n; i++) {
        const g = this.make.graphics({ x: 0, y: 0 });
        FightScene.drawHazardToxicFrame(g, i, n, fw, fh);
        g.generateTexture(`${toxPrefix}${i}`, fw, fh);
        g.destroy();
      }
      if (!this.anims.exists('hazard_toxic_anim')) {
        this.anims.create({
          key: 'hazard_toxic_anim',
          frames: Array.from({ length: n }, (_, i) => ({ key: `${toxPrefix}${i}` })),
          frameRate: 11,
          repeat: -1,
        });
      }
    }
  }

  private static drawHazardFireFrame(
    g: Phaser.GameObjects.Graphics,
    frame: number,
    frameCount: number,
    w: number,
    h: number,
  ): void {
    const phase = (frame / frameCount) * Math.PI * 2;
    const flicker = 0.72 + 0.28 * Math.sin(phase * 2.5);
    g.fillStyle(0x661100, 0.45 * flicker);
    g.fillEllipse(w / 2, h - 5, w * 0.95, 16);
    g.fillStyle(0xcc2200, 0.75 * flicker);
    g.fillEllipse(w / 2, h - 9, w * 0.9, h * 0.48);
    const ox = Math.sin(phase) * 5;
    const oy = Math.cos(phase * 1.4) * 3;
    g.fillStyle(0xff6600, 0.88 * flicker);
    g.fillEllipse(w / 2 + ox * 0.6, h - 12 + oy, w * 0.55, h * 0.42);
    g.fillStyle(0xffee88, 0.62 * flicker);
    g.fillEllipse(w / 2 - ox * 0.4, h - 16 + oy * 0.5, w * 0.32, h * 0.32);
    g.fillStyle(0xffffcc, 0.35 * flicker);
    g.fillEllipse(w / 2 + ox * 0.3, h - 20, w * 0.14, h * 0.18);
  }

  private static drawHazardToxicFrame(
    g: Phaser.GameObjects.Graphics,
    frame: number,
    frameCount: number,
    w: number,
    h: number,
  ): void {
    const phase = (frame / frameCount) * Math.PI * 2;
    const pulse = 0.8 + 0.2 * Math.sin(phase * 2);
    g.fillStyle(0x1a3300, 0.55 * pulse);
    g.fillEllipse(w / 2, h - 6, w * 0.94, 18);
    g.fillStyle(0x226611, 0.82 * pulse);
    g.fillEllipse(w / 2, h - 9, w * 0.88, h * 0.46);
    const wx = Math.sin(phase * 1.2) * 8;
    g.fillStyle(0x44aa33, 0.65 * pulse);
    g.fillEllipse(w / 2 + wx, h - 11, w * 0.5, h * 0.38);
    g.fillStyle(0x88ff66, 0.45 * pulse);
    g.fillEllipse(w / 2 - wx * 0.5, h - 14, w * 0.28, h * 0.28);
    for (let b = 0; b < 3; b++) {
      const bp = phase + b * 1.7;
      const bx = w / 2 + Math.sin(bp) * (w * 0.28);
      const by = h - 14 + Math.cos(bp * 1.1) * 6;
      const br = 3 + (b % 2) * 2 + Math.sin(bp * 3) * 0.8;
      g.fillStyle(0xaaff88, 0.35 + 0.2 * pulse);
      g.fillCircle(bx, by, br);
    }
    g.fillStyle(0xccff99, 0.22 * pulse);
    g.fillEllipse(w / 2, h - 17, w * 0.12, 5);
  }

  create(data: {
    player1Char?: string;
    player2Char?: string;
    vsCpu?: boolean;
    cpuDifficulty?: CpuDifficulty;
  }): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.vsCpu = data.vsCpu === true;
    this.cpuDifficulty = data.cpuDifficulty === 'hard' ? 'hard' : 'easy';

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
    this.collidePlatform = platform as Phaser.Types.Physics.Arcade.GameObjectWithBody;

    this.ensureSpecialTextures();
    this.ensureHazardTextures();
    this.ensurePlayerArrowTextures();

    this.fighter1 = new Fighter(this, p1X, floorY, def1, 1);
    const cpuDmg =
      this.vsCpu && this.cpuDifficulty === 'hard' ? FightScene.HARD_CPU_DAMAGE_MULT : 1;
    this.fighter2 = new Fighter(this, p2X, floorY, def2, 2, cpuDmg);
    this.fighter1.setDepth(10);
    this.fighter2.setDepth(10);

    this.playerArrow1 = this.add.image(0, 0, 'player_arrow_p1');
    this.playerArrow2 = this.add.image(0, 0, 'player_arrow_p2');
    this.playerArrow1.setOrigin(0.5, 1);
    this.playerArrow2.setOrigin(0.5, 1);
    this.playerArrow1.setDepth(15);
    this.playerArrow2.setDepth(15);

    this.input1 = new InputManager(this, 1);
    if (this.vsCpu) {
      this.cpu = new CpuController(this.cpuDifficulty);
    } else {
      this.input2 = new InputManager(this, 2);
    }

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

    const hudStyle = { fontSize: '13px', fontStyle: 'bold' as const };
    this.specialHud1 = this.add.text(248, 52, '', hudStyle);
    this.specialHud1.setDepth(100);
    this.specialHud2 = this.add.text(width - 248, 52, '', hudStyle);
    this.specialHud2.setOrigin(1, 0);
    this.specialHud2.setDepth(100);
    this.refreshSpecialHud(this.time.now);

    const title = this.add.text(width / 2, 28, 'VS', {
      fontSize: '24px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setDepth(100);

    const p1Label = this.add.text(120, 55, def1.name, { fontSize: '16px', color: '#fff' });
    p1Label.setOrigin(0.5, 0.5);
    const p2Label = this.add.text(
      width - 120,
      55,
      this.vsCpu
        ? `${def2.name} (CPU${this.cpuDifficulty === 'hard' ? ' · hard' : ' · easy'})`
        : def2.name,
      { fontSize: '16px', color: '#fff' },
    );
    p2Label.setOrigin(0.5, 0.5);
    p1Label.setDepth(100);
    p2Label.setDepth(100);

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

  private syncPlayerArrow(fighter: Fighter, arrow: Phaser.GameObjects.Image): void {
    if (fighter.state === 'ko') {
      arrow.setVisible(false);
      return;
    }
    arrow.setVisible(true);
    const b = fighter.getBounds();
    const bob = Math.sin(this.time.now / 260) * 2.5;
    arrow.setPosition(b.centerX, b.top - 6 + bob);
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

  private refreshSpecialHud(now: number): void {
    const fmt = (f: Fighter) => {
      if (f.isSpecialReady(now)) return { text: 'SPECIAL READY', color: '#4ecca3' };
      const s = Math.ceil((f.specialCooldownUntil - now) / 1000);
      return { text: `S: ${s}s`, color: '#888888' };
    };
    const a = fmt(this.fighter1);
    const b = fmt(this.fighter2);
    this.specialHud1.setText(a.text);
    this.specialHud1.setColor(a.color);
    this.specialHud2.setText(b.text);
    this.specialHud2.setColor(b.color);
  }

  private applySpecialSpawn(req: SpecialSpawnRequest): void {
    if (req.type === 'straight') {
      const p = new SpecialProjectile(
        this,
        req.x,
        req.y,
        req.vx,
        req.damage,
        req.owner,
        req.textureKey,
      );
      this.projectiles.push(p);
      this.physics.add.collider(p, this.collidePlatform, () => {
        p.destroy();
      });
      return;
    }
    if (req.type === 'boomerang') {
      const owner = req.owner === 1 ? this.fighter1 : this.fighter2;
      const b = new BoomerangProjectile(
        this,
        req.x,
        req.y,
        req.vx,
        owner,
        req.maxDistance,
        req.outboundDamage,
        req.returnDamage,
        req.textureKey,
      );
      this.boomerangs.push(b);
      return;
    }
    this.groundHazards.push(
      new GroundHazard(
        this,
        req.x,
        req.y,
        req.halfWidth,
        req.owner,
        req.damagePerTick,
        req.tickMs,
        req.durationMs,
        this.time.now,
        req.visual,
      ),
    );
  }

  private pruneProjectiles(): void {
    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  private pruneBoomerangs(): void {
    this.boomerangs = this.boomerangs.filter((b) => b.active);
  }

  private pruneHazards(): void {
    this.groundHazards = this.groundHazards.filter((h) => h.active);
  }

  update(): void {
    const dir1 = this.input1.getDirection();
    let dir2 = { x: 0, y: 0 };

    const w = this.cameras.main.width;
    const now = this.time.now;

    if (this.vsCpu && this.cpu) {
      const ai = this.cpu.tick(this.fighter2, this.fighter1, now);
      dir2 = ai.dir;
      if (this.fighter2.state !== 'hurt' && this.fighter2.state !== 'ko') {
        if (ai.jump) this.fighter2.tryJump();
        else if (ai.special) {
          const spawn = this.fighter2.trySpecial(now, this.fighter1, w);
          if (spawn) this.applySpecialSpawn(spawn);
        } else if (ai.punch) this.fighter2.tryPunch();
        else if (ai.kick) this.fighter2.tryKick();
      }
    } else if (this.input2) {
      dir2 = this.input2.getDirection();
      if (this.fighter2.state !== 'hurt' && this.fighter2.state !== 'ko') {
        if (this.input2.isJumpJustDown()) this.fighter2.tryJump();
        else if (this.input2.isSpecialJustDown()) {
          const spawn = this.fighter2.trySpecial(now, this.fighter1, w);
          if (spawn) this.applySpecialSpawn(spawn);
        } else if (this.input2.isPunchJustDown()) this.fighter2.tryPunch();
        else if (this.input2.isKickJustDown()) this.fighter2.tryKick();
      }
    }

    if (this.fighter1.state !== 'hurt' && this.fighter1.state !== 'ko') {
      if (this.input1.isJumpJustDown()) this.fighter1.tryJump();
      else if (this.input1.isSpecialJustDown()) {
        const spawn = this.fighter1.trySpecial(now, this.fighter2, w);
        if (spawn) this.applySpecialSpawn(spawn);
      } else if (this.input1.isPunchJustDown()) this.fighter1.tryPunch();
      else if (this.input1.isKickJustDown()) this.fighter1.tryKick();
    }

    this.fighter1.update(this.time.now, dir1);
    this.fighter2.update(this.time.now, dir2);

    this.syncPlayerArrow(this.fighter1, this.playerArrow1);
    this.syncPlayerArrow(this.fighter2, this.playerArrow2);

    this.physicsMgr.checkHits(this.fighter1, this.fighter2);
    this.physicsMgr.checkHits(this.fighter2, this.fighter1);

    const def1 = this.fighter1.characterDef;
    const def2 = this.fighter2.characterDef;

    for (const h of this.groundHazards) {
      h.tick(now, this.fighter1, this.fighter2);
    }
    this.pruneHazards();

    for (const b of this.boomerangs) {
      if (!b.active) continue;
      b.stepTravel();
      if (b.phase === 'out' && b.distanceTraveled >= b.maxDistance) {
        b.flipToReturn();
      }
      const spin = 0.14 * Math.sign(b.body.velocity.x || 1);
      b.rotation += spin;
      if (b.x < -100 || b.x > w + 100 || now - b.spawnedAt > 5200) {
        b.destroy();
        continue;
      }
      this.physicsMgr.checkBoomerangHit(b, this.fighter1);
      if (!b.active) continue;
      this.physicsMgr.checkBoomerangHit(b, this.fighter2);
    }
    this.pruneBoomerangs();

    for (const p of this.projectiles) {
      if (!p.active) continue;
      if (p.x < -80 || p.x > w + 80) {
        p.destroy();
        continue;
      }
      const defender = p.ownerIndex === 1 ? this.fighter2 : this.fighter1;
      this.physicsMgr.checkProjectileHit(p, defender);
    }
    this.pruneProjectiles();

    this.drawHealthBars(def1, def2);
    this.refreshSpecialHud(now);

    if (this.fighter1.state === 'ko') {
      const win = this.fighter2.characterDef;
      this.scene.start('Victory', {
        winner: 2,
        winnerSpritePrefix: win.spritePrefix,
        winnerName: win.name,
      });
    } else if (this.fighter2.state === 'ko') {
      const win = this.fighter1.characterDef;
      this.scene.start('Victory', {
        winner: 1,
        winnerSpritePrefix: win.spritePrefix,
        winnerName: win.name,
      });
    }
  }
}
