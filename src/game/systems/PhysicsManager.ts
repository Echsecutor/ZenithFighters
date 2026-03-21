import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

/**
 * Manages hit detection between fighters: hitbox vs hurtbox overlap.
 * Each attack hits a given defender only once until the attack ends.
 */
export class PhysicsManager {
  private hitByAttacker: Map<number, Set<number>> = new Map();

  constructor(private readonly scene: Phaser.Scene) {}

  private clearIfAttackEnded(attacker: Fighter): void {
    if (attacker.state !== 'punch' && attacker.state !== 'kick') {
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

  reset(): void {
    this.hitByAttacker.clear();
  }
}
