import Phaser from 'phaser';

/**
 * Abstracts keyboard and gamepad input for fighting game controls.
 * Placeholder - will map to directional inputs and attack buttons.
 */
export class InputManager {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly playerIndex: 1 | 2,
  ) {}

  getDirection(): { x: number; y: number } {
    return { x: 0, y: 0 };
  }

  isAttackPressed(): boolean {
    return false;
  }
}
