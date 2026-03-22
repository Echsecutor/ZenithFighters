import Phaser from 'phaser';
import {
  SPECIAL_COOLDOWN_MS,
  type CharacterDefinition,
  type SpecialSpawnRequest,
} from '../data/characters';

export type FighterState = 'idle' | 'walk' | 'jump' | 'punch' | 'kick' | 'hurt' | 'ko' | 'special';

export class Fighter extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  readonly characterDef: CharacterDefinition;
  readonly playerIndex: 1 | 2;
  hp: number;
  state: FighterState = 'idle';
  facingRight: boolean = true;
  hurtUntil: number = 0;
  hitboxActive: boolean = false;
  hitboxDamage: number = 0;
  hitboxOffsetX: number = 0;
  specialCooldownUntil: number = 0;
  private specialTag: 'pose' | null = null;
  private hbW = 30;
  private hbH = 25;
  private hbTopOffset = 50;
  /** Wall-clock start of current punch/kick; avoids cancelling same-frame before Phaser marks the anim playing. */
  private meleeStartedAt = 0;
  private static readonly MELEE_MIN_MS = 48;
  /** Multiplier for all outgoing melee / special damage (e.g. hard CPU). */
  private readonly damageMultiplier: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterDef: CharacterDefinition,
    playerIndex: 1 | 2,
    damageMultiplier: number = 1,
  ) {
    const prefix = characterDef.spritePrefix;
    super(scene, x, y, `${prefix}_idle`);
    this.characterDef = characterDef;
    this.playerIndex = playerIndex;
    this.damageMultiplier = damageMultiplier;
    this.hp = characterDef.hp;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);

    const fw = this.frame.width;
    const fh = this.frame.height;
    const footInset = Math.round(fh * 0.08);
    this.setOrigin(0.5, (fh - footInset) / fh);

    const bodyW = Math.min(44, Math.floor(fw * 0.55));
    const bodyH = Math.min(56, fh - footInset - 4);
    this.body.setSize(bodyW, bodyH);
    this.body.setOffset((fw - bodyW) / 2, fh - footInset - bodyH);
    this.body.updateFromGameObject();
    if (playerIndex === 2) {
      this.facingRight = false;
      this.setFlipX(true);
    }
  }

  playAnim(key: string): void {
    const prefix = this.characterDef.spritePrefix;
    this.play(`${prefix}_${key}`);
  }

  private setDefaultHitboxDims(): void {
    this.hbW = 30;
    this.hbH = 25;
    this.hbTopOffset = 50;
  }

  /** Damage from hazards / DOT without entering hurt stun. */
  applyDotDamage(damage: number): void {
    if (this.state === 'ko') return;
    this.hp = Math.max(0, this.hp - damage);
    if (this.hp <= 0) {
      this.state = 'ko';
      this.body.setVelocity(0, 0);
    }
  }

  takeDamage(damage: number, knockbackX: number): void {
    if (this.state === 'ko') return;
    this.hp = Math.max(0, this.hp - damage);
    this.state = 'hurt';
    this.hurtUntil = this.scene.time.now + 400;
    this.specialTag = null;
    this.hitboxActive = false;
    this.playAnim('hurt');
    this.body.setVelocity(knockbackX, 0);
    if (this.hp <= 0) {
      this.state = 'ko';
      this.body.setVelocity(0, 0);
    }
  }

  getHitbox(): Phaser.Geom.Rectangle | null {
    if (!this.hitboxActive || this.state === 'ko') return null;
    const dir = this.facingRight ? 1 : -1;
    const cx = this.x + this.hitboxOffsetX * dir;
    const top = this.y - this.hbTopOffset;
    return new Phaser.Geom.Rectangle(cx - this.hbW / 2, top, this.hbW, this.hbH);
  }

  getHurtbox(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 25, this.y - 60, 50, 60);
  }

  isSpecialReady(time: number): boolean {
    return time >= this.specialCooldownUntil;
  }

  /**
   * Starts special: short punch pose; scene consumes returned payload to spawn projectiles / hazards.
   */
  trySpecial(now: number, _opponent: Fighter, _worldWidth: number): SpecialSpawnRequest | null {
    if (now < this.specialCooldownUntil) return null;
    if (this.state !== 'idle' && this.state !== 'walk') return null;

    const sp = this.characterDef.special;
    this.specialCooldownUntil = now + SPECIAL_COOLDOWN_MS;
    this.state = 'special';
    this.specialTag = 'pose';
    this.hitboxActive = false;
    this.playAnim('punch');

    const dir = this.facingRight ? 1 : -1;

    const dm = this.damageMultiplier;

    if (sp.kind === 'iceBall') {
      return {
        type: 'straight',
        textureKey: 'special_ice',
        x: this.x + dir * 38,
        y: this.y - 38,
        vx: dir * sp.speed,
        damage: Math.max(1, Math.round(sp.damage * dm)),
        owner: this.playerIndex,
      };
    }

    if (sp.kind === 'burstRound') {
      return {
        type: 'straight',
        textureKey: 'special_slug',
        x: this.x + dir * 36,
        y: this.y - 36,
        vx: dir * sp.speed,
        damage: Math.max(1, Math.round(sp.damage * dm)),
        owner: this.playerIndex,
      };
    }

    if (sp.kind === 'boomerang') {
      return {
        type: 'boomerang',
        textureKey: 'special_boomerang',
        x: this.x + dir * 34,
        y: this.y - 40,
        vx: dir * sp.speed,
        maxDistance: sp.maxDistance,
        outboundDamage: Math.max(1, Math.round(sp.outboundDamage * dm)),
        returnDamage: Math.max(1, Math.round(sp.returnDamage * dm)),
        owner: this.playerIndex,
      };
    }

    if (sp.kind === 'firePatch') {
      return {
        type: 'groundHazard',
        x: this.x + dir * sp.placeOffsetX,
        y: this.y,
        owner: this.playerIndex,
        damagePerTick: Math.max(1, Math.round(sp.damagePerTick * dm)),
        tickMs: sp.tickMs,
        durationMs: sp.durationMs,
        halfWidth: sp.halfWidth,
        visual: 'fire',
      };
    }

    if (sp.kind === 'toxicPatch') {
      return {
        type: 'groundHazard',
        x: this.x + dir * sp.placeOffsetX,
        y: this.y,
        owner: this.playerIndex,
        damagePerTick: Math.max(1, Math.round(sp.damagePerTick * dm)),
        tickMs: sp.tickMs,
        durationMs: sp.durationMs,
        halfWidth: sp.halfWidth,
        visual: 'toxic',
      };
    }

    if (sp.kind === 'teleport') {
      return {
        type: 'teleport',
        owner: this.playerIndex,
        deltaX: dir * sp.forwardDistance,
      };
    }

    return null;
  }

  update(time: number, input: { x: number; y: number }): void {
    if (this.state === 'ko') return;

    if (this.state === 'hurt') {
      if (time >= this.hurtUntil) {
        this.state = this.hp > 0 ? 'idle' : 'ko';
        this.body.setVelocity(0, 0);
        this.playAnim('idle');
      }
      return;
    }

    if (this.state === 'special' && this.specialTag === 'pose') {
      if (!this.anims.isPlaying) {
        this.state = 'idle';
        this.specialTag = null;
        this.playAnim('idle');
      }
      return;
    }

    if (this.state === 'punch' || this.state === 'kick') {
      const prefix = this.characterDef.spritePrefix;
      const expectedKey = `${prefix}_${this.state}`;
      const cur = this.anims.currentAnim;
      const matches = cur?.key === expectedKey;
      const playingExpected = this.anims.isPlaying && matches;
      const pastMin = time >= this.meleeStartedAt + Fighter.MELEE_MIN_MS;

      if (playingExpected || !pastMin) {
        this.hitboxActive = true;
      } else if (matches && !this.anims.isPlaying) {
        this.state = 'idle';
        this.hitboxActive = false;
        this.playAnim('idle');
      } else if (!matches) {
        this.state = 'idle';
        this.hitboxActive = false;
        this.playAnim('idle');
      }
      return;
    }

    const onGround = this.body.blocked.down || this.body.touching.down;
    if (this.state === 'jump' && onGround) {
      this.state = 'idle';
      this.playAnim('idle');
    } else if (this.state === 'jump') {
      this.playAnim('jump');
      if (input.x !== 0) {
        this.facingRight = input.x > 0;
        this.setFlipX(!this.facingRight);
        this.body.setVelocityX(input.x * this.characterDef.walkSpeed * 0.7);
      }
      return;
    }

    if (input.x !== 0) {
      this.facingRight = input.x > 0;
      this.setFlipX(!this.facingRight);
      this.body.setVelocityX(input.x * this.characterDef.walkSpeed);
      this.state = 'walk';
      this.playAnim('walk');
    } else {
      this.body.setVelocityX(0);
      this.state = 'idle';
      this.playAnim('idle');
    }
  }

  tryPunch(): boolean {
    if (this.state !== 'idle' && this.state !== 'walk') return false;
    this.meleeStartedAt = this.scene.time.now;
    this.state = 'punch';
    this.hitboxActive = true;
    this.hitboxDamage = Math.max(1, Math.round(this.characterDef.punchDamage * this.damageMultiplier));
    this.hitboxOffsetX = 25;
    this.setDefaultHitboxDims();
    this.playAnim('punch');
    return true;
  }

  tryKick(): boolean {
    if (this.state !== 'idle' && this.state !== 'walk') return false;
    this.meleeStartedAt = this.scene.time.now;
    this.state = 'kick';
    this.hitboxActive = true;
    this.hitboxDamage = Math.max(1, Math.round(this.characterDef.kickDamage * this.damageMultiplier));
    this.hitboxOffsetX = 30;
    this.setDefaultHitboxDims();
    this.playAnim('kick');
    return true;
  }

  tryJump(): boolean {
    const onGround = this.body.blocked.down || this.body.touching.down;
    if (!onGround || (this.state !== 'idle' && this.state !== 'walk')) return false;
    this.state = 'jump';
    this.body.setVelocityY(this.characterDef.jumpForce);
    this.playAnim('jump');
    return true;
  }

  isVulnerable(): boolean {
    return this.state !== 'hurt' && this.state !== 'ko';
  }
}
