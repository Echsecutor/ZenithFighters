import Phaser from 'phaser';

/**
 * Maps keyboard and gamepad input to fighting game controls.
 * P1: WASD + R (punch), F (kick), E (special) | Gamepad 0: left stick, A/B, Y
 * P2: Arrows + O (punch), L (kick), U (special) | Gamepad 1: left stick, A/B, Y
 */
export class InputManager {
  /** Previous-frame face button state; synced in postupdate (no Gamepad.Button.JustDown in Phaser 3). */
  private prevPadFace = { A: false, B: false, X: false, Y: false };

  private readonly keys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    punch: Phaser.Input.Keyboard.Key;
    kick: Phaser.Input.Keyboard.Key;
    special: Phaser.Input.Keyboard.Key;
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
        punch: kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
        kick: kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        special: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
    } else {
      this.keys = {
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        punch: kb.addKey(Phaser.Input.Keyboard.KeyCodes.O),
        kick: kb.addKey(Phaser.Input.Keyboard.KeyCodes.L),
        special: kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      };
    }

    this.scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncPrevPadFaceButtons, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncPrevPadFaceButtons, this);
    });
  }

  /**
   * Phaser maps A/B/X/Y to pressed state as booleans on the Gamepad (not `.pressed` on Button objects).
   */
  private faceDown(pad: Phaser.Input.Gamepad.Gamepad, face: 'A' | 'B' | 'X' | 'Y'): boolean {
    const v = (pad as unknown as Record<string, unknown>)[face];
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object' && 'pressed' in v) return Boolean((v as { pressed: boolean }).pressed);
    return false;
  }

  private syncPrevPadFaceButtons(): void {
    const pad = this.getPad();
    if (!pad) {
      this.prevPadFace = { A: false, B: false, X: false, Y: false };
      return;
    }
    this.prevPadFace.A = this.faceDown(pad, 'A');
    this.prevPadFace.B = this.faceDown(pad, 'B');
    this.prevPadFace.X = this.faceDown(pad, 'X');
    this.prevPadFace.Y = this.faceDown(pad, 'Y');
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
    if (pad) return this.faceDown(pad, 'A') && !this.prevPadFace.A;
    return Phaser.Input.Keyboard.JustDown(this.keys.punch);
  }

  isKickJustDown(): boolean {
    const pad = this.getPad();
    if (pad) return this.faceDown(pad, 'B') && !this.prevPadFace.B;
    return Phaser.Input.Keyboard.JustDown(this.keys.kick);
  }

  isJumpJustDown(): boolean {
    const pad = this.getPad();
    if (pad) return this.faceDown(pad, 'X') && !this.prevPadFace.X;
    return Phaser.Input.Keyboard.JustDown(this.keys.up);
  }

  isSpecialJustDown(): boolean {
    const pad = this.getPad();
    if (pad) return this.faceDown(pad, 'Y') && !this.prevPadFace.Y;
    return Phaser.Input.Keyboard.JustDown(this.keys.special);
  }
}