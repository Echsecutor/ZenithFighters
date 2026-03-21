import Phaser from 'phaser';
import type { CharacterDefinition } from '../data/characters';

export type FighterState = 'idle' | 'walk' | 'jump' | 'punch' | 'kick' | 'hurt' | 'ko';

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

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterDef: CharacterDefinition,
    playerIndex: 1 | 2,
  ) {
    const prefix = characterDef.spritePrefix;
    super(scene, x, y, `${prefix}_idle`);
    this.characterDef = characterDef;
    this.playerIndex = playerIndex;
    this.hp = characterDef.hp;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);

    // Kenney poses have transparent padding under the feet. Origin at texture
    // bottom makes the body sit on the floor while sprites look sunk into it.
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

  takeDamage(damage: number, knockbackX: number): void {
    if (this.state === 'ko') return;
    this.hp = Math.max(0, this.hp - damage);
    this.state = 'hurt';
    this.hurtUntil = this.scene.time.now + 400;
    this.playAnim('hurt');
    this.body.setVelocity(knockbackX, 0);
    if (this.hp <= 0) {
      this.state = 'ko';
      this.body.setVelocity(0, 0);
    }
  }

  getHitbox(): Phaser.Geom.Rectangle | null {
    if (!this.hitboxActive || this.state === 'ko') return null;
    const w = 30;
    const h = 25;
    const dir = this.facingRight ? 1 : -1;
    const x = this.x + this.hitboxOffsetX * dir;
    return new Phaser.Geom.Rectangle(x - w / 2, this.y - 50, w, h);
  }

  getHurtbox(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.x - 25,
      this.y - 60,
      50,
      60,
    );
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

    if (this.state === 'punch' || this.state === 'kick') {
      if (!this.anims.isPlaying) {
        this.state = 'idle';
        this.hitboxActive = false;
        this.playAnim('idle');
      } else {
        this.hitboxActive = true;
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
    this.state = 'punch';
    this.hitboxActive = true;
    this.hitboxDamage = this.characterDef.punchDamage;
    this.hitboxOffsetX = 25;
    this.playAnim('punch');
    return true;
  }

  tryKick(): boolean {
    if (this.state !== 'idle' && this.state !== 'walk') return false;
    this.state = 'kick';
    this.hitboxActive = true;
    this.hitboxDamage = this.characterDef.kickDamage;
    this.hitboxOffsetX = 30;
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
