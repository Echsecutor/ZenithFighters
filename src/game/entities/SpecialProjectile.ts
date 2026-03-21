import Phaser from 'phaser';

/** Moving hitbox for projectile-type specials (no new art; texture key created in FightScene). */
export class SpecialProjectile extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  readonly damage: number;
  readonly ownerIndex: 1 | 2;
  hitTarget = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocityX: number,
    damage: number,
    ownerIndex: 1 | 2,
    textureKey: string,
  ) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.damage = damage;
    this.ownerIndex = ownerIndex;
    this.body.setVelocityX(velocityX);
    this.body.setAllowGravity(false);
    this.body.setCircle(9, 3, 3);
    this.setDepth(11);
  }
}
