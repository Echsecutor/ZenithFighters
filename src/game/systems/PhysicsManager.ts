import Phaser from 'phaser';
import type { BoomerangProjectile } from '../entities/BoomerangProjectile';
import type { Fighter } from '../entities/Fighter';
import type { SpecialProjectile } from '../entities/SpecialProjectile';

/**
 * Manages hit detection between fighters: hitbox vs hurtbox overlap.
 * Each attack hits a given defender only once until the attack ends.
 */
export class PhysicsManager {
  private hitByAttacker: Map<number, Set<number>> = new Map();

  constructor(private readonly scene: Phaser.Scene) {}

  private clearIfAttackEnded(attacker: Fighter): void {
    if (attacker.state !== 'punch' && attacker.state !== 'kick' && attacker.state !== 'special') {
      this.hitByAttacker.delete(attacker.playerIndex);
    }
  }

  checkHits(attacker: Fighter, defender: Fighter): void {
    this.clearIfAttackEnded(attacker);
    if (!defender.isVulnerable()) return;
    const hitbox = attacker.getHitbox();
    if (!hitbox) return;

    const hurtbox = defender.getHurtbox();
    if (!Phaser.Geom.Rectangle.Overlaps(hitbox, hurtbox)) return;

    let hit = this.hitByAttacker.get(attacker.playerIndex);
    if (!hit) {
      hit = new Set();
      this.hitByAttacker.set(attacker.playerIndex, hit);
    }
    if (hit.has(defender.playerIndex)) return;
    hit.add(defender.playerIndex);

    const knockback = attacker.facingRight ? 120 : -120;
    defender.takeDamage(attacker.hitboxDamage, knockback);
  }

  checkProjectileHit(projectile: SpecialProjectile, defender: Fighter): void {
    if (projectile.hitTarget || !defender.isVulnerable()) return;
    const hb = new Phaser.Geom.Rectangle(
      projectile.x - projectile.width / 2,
      projectile.y - projectile.height / 2,
      projectile.width,
      projectile.height,
    );
    const hurtbox = defender.getHurtbox();
    if (!Phaser.Geom.Rectangle.Overlaps(hb, hurtbox)) return;
    projectile.hitTarget = true;
    const kb = projectile.body.velocity.x > 0 ? 140 : -140;
    defender.takeDamage(projectile.damage, kb);
    projectile.destroy();
  }

  checkBoomerangHit(boomerang: BoomerangProjectile, defender: Fighter): void {
    if (defender.playerIndex === boomerang.ownerIndex) {
      if (
        boomerang.phase === 'return' &&
        Math.abs(boomerang.x - boomerang.ownerFighter.x) < 56
      ) {
        boomerang.destroy();
      }
      return;
    }
    if (!defender.isVulnerable()) return;
    const hb = new Phaser.Geom.Rectangle(
      boomerang.x - boomerang.width / 2,
      boomerang.y - boomerang.height / 2,
      boomerang.width,
      boomerang.height,
    );
    const hurtbox = defender.getHurtbox();
    if (!Phaser.Geom.Rectangle.Overlaps(hb, hurtbox)) return;

    const kb = boomerang.body.velocity.x > 0 ? 110 : -110;
    if (boomerang.phase === 'out' && !boomerang.outboundHit) {
      boomerang.outboundHit = true;
      defender.takeDamage(boomerang.outboundDamage, kb);
      return;
    }
    if (boomerang.phase === 'return' && !boomerang.returnHit) {
      boomerang.returnHit = true;
      defender.takeDamage(boomerang.returnDamage, kb);
      boomerang.destroy();
    }
  }
}
