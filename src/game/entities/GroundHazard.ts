import Phaser from 'phaser';
import type { Fighter } from './Fighter';

const HAZARD_DISPLAY_H = 40;

/** Stationary floor hazard (fire / toxic); ticks damage while opponent’s hurtbox overlaps. */
export class GroundHazard {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly endAt: number;
  private readonly durationMs: number;
  private readonly lastDamage = new Map<1 | 2, number>();

  constructor(
    scene: Phaser.Scene,
    readonly centerX: number,
    readonly floorY: number,
    readonly halfWidth: number,
    readonly ownerIndex: 1 | 2,
    private readonly damagePerTick: number,
    private readonly tickMs: number,
    durationMs: number,
    now: number,
    visual: 'fire' | 'toxic',
  ) {
    this.endAt = now + durationMs;
    this.durationMs = durationMs;
    const frame0 = visual === 'fire' ? 'hazard_fire_f0' : 'hazard_toxic_f0';
    const animKey = visual === 'fire' ? 'hazard_fire_anim' : 'hazard_toxic_anim';
    this.sprite = scene.add.sprite(centerX, floorY, frame0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(9);
    this.sprite.setDisplaySize(this.halfWidth * 2, HAZARD_DISPLAY_H);
    if (visual === 'fire') {
      this.sprite.setBlendMode(Phaser.BlendModes.ADD);
    }
    this.sprite.play(animKey);
  }

  get active(): boolean {
    return this.sprite.active;
  }

  destroy(): void {
    this.sprite.destroy();
  }

  private hazardRect(): Phaser.Geom.Rectangle {
    const h = 36;
    return new Phaser.Geom.Rectangle(
      this.centerX - this.halfWidth,
      this.floorY - h,
      this.halfWidth * 2,
      h,
    );
  }

  tick(now: number, f1: Fighter, f2: Fighter): void {
    if (!this.sprite.active) return;
    if (now >= this.endAt) {
      this.destroy();
      return;
    }

    const life = Phaser.Math.Clamp((this.endAt - now) / this.durationMs, 0, 1);
    this.sprite.setAlpha(0.4 + life * 0.55);

    const zone = this.hazardRect();
    for (const f of [f1, f2]) {
      if (f.playerIndex === this.ownerIndex || f.state === 'ko') continue;
      const hurt = f.getHurtbox();
      if (!Phaser.Geom.Rectangle.Overlaps(zone, hurt)) continue;
      const last = this.lastDamage.get(f.playerIndex) ?? 0;
      if (now - last < this.tickMs) continue;
      this.lastDamage.set(f.playerIndex, now);
      f.applyDotDamage(this.damagePerTick);
    }
  }
}
