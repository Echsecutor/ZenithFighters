import Phaser from 'phaser';
import type { Fighter } from './Fighter';

/** Boomerang: flies out to maxDistance, reverses; two separate hit windows (weaker on return). */
export class BoomerangProjectile extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  readonly ownerIndex: 1 | 2;
  readonly ownerFighter: Fighter;
  readonly maxDistance: number;
  readonly outboundDamage: number;
  readonly returnDamage: number;
  phase: 'out' | 'return' = 'out';
  distanceTraveled = 0;
  private prevX: number;
  outboundHit = false;
  returnHit = false;
  readonly spawnedAt: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocityX: number,
    ownerFighter: Fighter,
    maxDistance: number,
    outboundDamage: number,
    returnDamage: number,
    textureKey: string,
  ) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.ownerIndex = ownerFighter.playerIndex;
    this.ownerFighter = ownerFighter;
    this.maxDistance = maxDistance;
    this.outboundDamage = outboundDamage;
    this.returnDamage = returnDamage;
    this.prevX = x;
    this.spawnedAt = scene.time.now;
    this.body.setVelocityX(velocityX);
    this.body.setAllowGravity(false);
    this.body.setCircle(8, 4, 4);
    this.setDepth(11);
  }

  stepTravel(): void {
    this.distanceTraveled += Math.abs(this.x - this.prevX);
    this.prevX = this.x;
  }

  flipToReturn(): void {
    this.body.setVelocityX(-this.body.velocity.x);
    this.phase = 'return';
  }
}
