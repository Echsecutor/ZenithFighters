import Phaser from 'phaser';
import type { Fighter } from '../entities/Fighter';

export type CpuDifficulty = 'easy' | 'hard';

/** Arcade-style AI. `easy`: no specials (melee/jump only). `hard`: uses specials whenever off cooldown and in range; scene applies damage scale; pressures hurt-state for chains. */
export class CpuController {
  private nextActionTime = 0;
  private retreatUntil = 0;
  private wasOpponentHurt = false;

  constructor(private readonly difficulty: CpuDifficulty = 'easy') {}

  /**
   * Returns movement and one-shot actions for this frame (call from FightScene.update).
   */
  tick(self: Fighter, opponent: Fighter, now: number): {
    dir: { x: number; y: number };
    jump: boolean;
    punch: boolean;
    kick: boolean;
    special: boolean;
  } {
    const idle = { dir: { x: 0, y: 0 }, jump: false, punch: false, kick: false, special: false };
    if (self.state === 'ko' || opponent.state === 'ko') return idle;

    const hard = this.difficulty === 'hard';
    const dx = opponent.x - self.x;
    const absDx = Math.abs(dx);
    const onGround = self.body.blocked.down || self.body.touching.down;
    const oppHurt = opponent.state === 'hurt';

    if (hard && this.wasOpponentHurt && !oppHurt) {
      this.nextActionTime = Math.min(this.nextActionTime, now);
    }
    this.wasOpponentHurt = oppHurt;

    let x = 0;
    if (hard && oppHurt) {
      this.retreatUntil = 0;
    }

    if (now < this.retreatUntil) {
      x = dx > 0 ? -1 : 1;
    } else if (hard && oppHurt && onGround) {
      if (absDx > 100) x = dx > 0 ? 1 : -1;
      else if (absDx < 38) x = dx > 0 ? -1 : 1;
    } else if (absDx > 95) {
      x = dx > 0 ? 1 : -1;
    } else if (!hard && absDx < 55 && onGround && Phaser.Math.Between(0, 180) === 0) {
      this.retreatUntil = now + Phaser.Math.Between(200, 450);
    } else if (hard && absDx < 50 && onGround && !oppHurt && Phaser.Math.Between(0, 320) === 0) {
      this.retreatUntil = now + Phaser.Math.Between(160, 320);
    }

    let jump = false;
    let punch = false;
    let kick = false;
    let special = false;

    if (
      hard &&
      self.isSpecialReady(now) &&
      onGround &&
      (self.state === 'idle' || self.state === 'walk') &&
      absDx > 55 &&
      absDx < 460
    ) {
      special = true;
      this.nextActionTime = now + Phaser.Math.Between(320, 560);
    }

    const canAct =
      now >= this.nextActionTime && onGround && (self.state === 'idle' || self.state === 'walk');
    const inPunchRange = absDx < 105;

    if (hard && oppHurt && canAct && inPunchRange) {
      const timeLeft = opponent.hurtUntil - now;
      if (timeLeft > 0 && timeLeft < 130) {
        punch = true;
        this.nextActionTime = now + Phaser.Math.Between(220, 380);
      }
    }

    if (canAct && !punch && !special) {
      if (inPunchRange) {
        const roll = Phaser.Math.Between(0, 100);
        if (hard) {
          if (roll < 5) {
            jump = true;
            this.nextActionTime = now + Phaser.Math.Between(280, 520);
          } else if (roll < 55) {
            punch = true;
            this.nextActionTime = now + Phaser.Math.Between(220, 420);
          } else if (roll < 78) {
            kick = true;
            this.nextActionTime = now + Phaser.Math.Between(280, 480);
          }
        } else {
          if (roll < 8) {
            jump = true;
            this.nextActionTime = now + Phaser.Math.Between(400, 700);
          } else if (roll < 38) {
            punch = true;
            this.nextActionTime = now + Phaser.Math.Between(350, 600);
          } else if (roll < 58) {
            kick = true;
            this.nextActionTime = now + Phaser.Math.Between(400, 700);
          }
        }
      } else {
        const jumpChance = hard ? 120 : 200;
        if (absDx < 160 && Phaser.Math.Between(0, jumpChance) === 0) {
          jump = true;
          this.nextActionTime = now + (hard ? Phaser.Math.Between(380, 720) : Phaser.Math.Between(500, 900));
        }
      }
    }

    return { dir: { x, y: 0 }, jump, punch, kick, special };
  }
}
