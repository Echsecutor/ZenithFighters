import Phaser from 'phaser';

/**
 * Maps keyboard and gamepad input to fighting game controls.
 * P1: WASD + U (punch), I (kick) | Gamepad 0: left stick, A/B
 * P2: Arrows + J (punch), K (kick) | Gamepad 1: left stick, A/B
 */
export class InputManager {
  private readonly keys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    punch: Phaser.Input.Keyboard.Key;
    kick: Phaser.Input.Keyboard.Key;
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly playerIndex: 1 | 2,
  ) {
    const kb = scene.input.keyboard!;
    if (playerIndex === 1) {
      this.keys = {
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        punch: kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),
        kick: kb.addKey(Phaser.Input.Keyboard.KeyCodes.I),
      };
    } else {
      this.keys = {
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        punch: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        kick: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      };
    }
  }

  private getPad(): Phaser.Input.Gamepad.Gamepad | undefined {
    const idx = this.playerIndex - 1;
    return this.scene.input.gamepad?.getPad(idx);
  }

  getDirection(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    const pad = this.getPad();
    if (pad?.axes?.length >= 2) {
      const ax = pad.axes[0].getValue();
      const ay = pad.axes[1].getValue();
      if (Math.abs(ax) > 0.3) x = ax;
      if (Math.abs(ay) > 0.3) y = ay;
    }
    if (x === 0 && this.keys.left.isDown) x = -1;
    if (x === 0 && this.keys.right.isDown) x = 1;
    if (y === 0 && this.keys.up.isDown) y = -1;
    if (y === 0 && this.keys.down.isDown) y = 1;
    return { x, y };
  }

  isPunchJustDown(): boolean {
    const pad = this.getPad();
    if (pad?.A) return Phaser.Input.Gamepad.Button.JustDown(pad.A);
    return Phaser.Input.Keyboard.JustDown(this.keys.punch);
  }

  isKickJustDown(): boolean {
    const pad = this.getPad();
    if (pad?.B) return Phaser.Input.Gamepad.Button.JustDown(pad.B);
    return Phaser.Input.Keyboard.JustDown(this.keys.kick);
  }

  isJumpJustDown(): boolean {
    const pad = this.getPad();
    if (pad?.X) return Phaser.Input.Gamepad.Button.JustDown(pad.X);
    return Phaser.Input.Keyboard.JustDown(this.keys.up);
  }
}