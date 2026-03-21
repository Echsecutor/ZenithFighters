import Phaser from 'phaser';
import { CHARACTERS } from '../data/characters';
import type { CpuDifficulty } from '../systems/CpuController';

/** Inset inside the stroke rect so sprites never touch the border. */
const PORTRAIT_INSET = 10;

export class CharacterSelectScene extends Phaser.Scene {
  private p1Index = 0;
  private p2Index = 1;
  private vsCpu = false;
  private cpuDifficulty: CpuDifficulty = 'easy';
  private modeLine!: Phaser.GameObjects.Text;
  private portrait1!: Phaser.GameObjects.Image;
  private portrait2!: Phaser.GameObjects.Image;
  private name1!: Phaser.GameObjects.Text;
  private name2!: Phaser.GameObjects.Text;
  private frame1!: Phaser.GameObjects.Rectangle;
  private frame2!: Phaser.GameObjects.Rectangle;
  private matchup!: Phaser.GameObjects.Text;
  private p2SlotLabel!: Phaser.GameObjects.Text;
  private selectHint!: Phaser.GameObjects.Text;
  private p2ControlsColumn!: Phaser.GameObjects.Text;
  private bottomHint!: Phaser.GameObjects.Text;

  /** Prior-frame gamepad state for menu edges (Phaser face buttons are booleans). */
  private prevSelectPad = {
    p0: { h: 0 as -1 | 0 | 1, A: false, Y: false, X: false },
    p1: { h: 0 as -1 | 0 | 1, A: false },
  };

  constructor() {
    super({ key: 'CharacterSelect' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const n = CHARACTERS.length;

    if (this.p1Index >= n) this.p1Index = 0;
    if (this.p2Index >= n) this.p2Index = Math.min(1, n - 1);

    const title = this.add.text(width / 2, 56, 'SELECT CHARACTER', {
      fontSize: '32px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const frameW = 156;
    const frameH = 196;
    const innerW = frameW - PORTRAIT_INSET * 2;
    const innerH = frameH - PORTRAIT_INSET * 2;
    const yPort = height * 0.36;
    /** Keep yellow mode line above P1/P2 labels (fixed Ys used to sit in the same band as the labels). */
    const playerLabelY = yPort - frameH / 2 - 6;
    const modeLineY = playerLabelY - 40;
    const matchupY = modeLineY - 28;

    this.matchup = this.add.text(width / 2, matchupY, '', {
      fontSize: '22px',
      color: '#ffffff',
    });
    this.matchup.setOrigin(0.5);

    this.modeLine = this.add.text(width / 2, modeLineY, '', {
      fontSize: '18px',
      color: '#c9b458',
      align: 'center',
      wordWrap: { width: Math.max(280, width - 64) },
      lineSpacing: 6,
    });
    this.modeLine.setOrigin(0.5);

    this.frame1 = this.add.rectangle(width * 0.32, yPort, frameW, frameH, 0x000000, 0);
    this.frame1.setStrokeStyle(4, 0x4ecca3);
    this.portrait1 = this.add.image(width * 0.32, yPort, `${CHARACTERS[this.p1Index]!.spritePrefix}_idle`);
    this.fitPortraitInBox(this.portrait1, innerW, innerH);
    this.name1 = this.add.text(width * 0.32, yPort + frameH / 2 + 22, '', {
      fontSize: '20px',
      color: '#4ecca3',
      fontStyle: 'bold',
    });
    this.name1.setOrigin(0.5);

    this.frame2 = this.add.rectangle(width * 0.68, yPort, frameW, frameH, 0x000000, 0);
    this.frame2.setStrokeStyle(4, 0xe94560);
    this.portrait2 = this.add.image(width * 0.68, yPort, `${CHARACTERS[this.p2Index]!.spritePrefix}_idle`);
    this.fitPortraitInBox(this.portrait2, innerW, innerH);
    this.name2 = this.add.text(width * 0.68, yPort + frameH / 2 + 22, '', {
      fontSize: '20px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    this.name2.setOrigin(0.5);

    this.add
      .text(width * 0.32, yPort - frameH / 2 - 22, 'Player 1', {
        fontSize: '16px',
        color: '#a0a0a0',
      })
      .setOrigin(0.5);
    this.p2SlotLabel = this.add
      .text(width * 0.68, yPort - frameH / 2 - 22, 'Player 2', {
        fontSize: '16px',
        color: '#a0a0a0',
      })
      .setOrigin(0.5);

    this.selectHint = this.add.text(width / 2, yPort + frameH / 2 + 56, '', {
      fontSize: '16px',
      color: '#888888',
    });
    this.selectHint.setOrigin(0.5);

    /** Bottom-aligned footer + higher column Y so CPU/start line does not overlap "jump" rows. */
    const controlsTitleY = height * 0.6;
    const controlsColsY = height * 0.632;
    const footerY = height - 22;

    const layoutTitle = this.add.text(width / 2, controlsTitleY, 'Fight controls', {
      fontSize: '20px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    layoutTitle.setOrigin(0.5);

    const colStyle = {
      fontSize: '16px',
      color: '#d8d8d8',
      lineSpacing: 6,
      align: 'left' as const,
    };
    const p1Keys = [
      'Player 1',
      '─────────',
      'W A S D   move',
      'R         punch',
      'F         kick',
      'E         special',
      'W         jump',
    ].join('\n');
    this.add.text(width * 0.26, controlsColsY, p1Keys, colStyle).setOrigin(0, 0);
    this.p2ControlsColumn = this.add.text(width * 0.74, controlsColsY, '', colStyle).setOrigin(1, 0);

    const hint = this.add.text(width / 2, footerY, '', {
      fontSize: '16px',
      color: '#a0a0a0',
      align: 'center',
      lineSpacing: 10,
      wordWrap: { width: Math.max(280, width - 56) },
    });
    hint.setOrigin(0.5, 1);
    this.bottomHint = hint;

    this.refreshPortraits();

    const p1Prev = () => this.cycleP1(-1);
    const p1Next = () => this.cycleP1(1);
    const p2Prev = () => this.cycleP2(-1);
    const p2Next = () => this.cycleP2(1);
    const toggleCpu = () => {
      this.vsCpu = !this.vsCpu;
      this.refreshModeUi();
    };
    const cycleCpuDifficulty = () => {
      if (!this.vsCpu) return;
      this.cpuDifficulty = this.cpuDifficulty === 'easy' ? 'hard' : 'easy';
      this.refreshModeUi();
    };

    this.bindCharacterSelectKeyboard(
      p1Prev,
      p1Next,
      p2Prev,
      p2Next,
      toggleCpu,
      cycleCpuDifficulty,
      () => this.startFightFromSelect(),
    );

    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncSelectPadPrev, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncSelectPadPrev, this);
    });
  }

  update(): void {
    this.pollGamepadCharacterSelect();
  }

  private bindCharacterSelectKeyboard(
    p1Prev: () => void,
    p1Next: () => void,
    p2Prev: () => void,
    p2Next: () => void,
    toggleCpu: () => void,
    cycleCpuDifficulty: () => void,
    startFight: () => void,
  ): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.on('keydown-A', p1Prev);
    kb.on('keydown-D', p1Next);
    kb.on('keydown-LEFT', p2Prev);
    kb.on('keydown-RIGHT', p2Next);
    kb.on('keydown-C', toggleCpu);
    kb.on('keydown-H', cycleCpuDifficulty);
    kb.once('keydown-SPACE', startFight);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      kb.off('keydown-A', p1Prev);
      kb.off('keydown-D', p1Next);
      kb.off('keydown-LEFT', p2Prev);
      kb.off('keydown-RIGHT', p2Next);
      kb.off('keydown-C', toggleCpu);
      kb.off('keydown-H', cycleCpuDifficulty);
      kb.off('keydown-SPACE', startFight);
    });
  }

  private faceDown(pad: Phaser.Input.Gamepad.Gamepad, face: 'A' | 'Y' | 'X'): boolean {
    const v = (pad as unknown as Record<string, unknown>)[face];
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object' && 'pressed' in v) return Boolean((v as { pressed: boolean }).pressed);
    return false;
  }

  private menuHorizontal(pad: Phaser.Input.Gamepad.Gamepad | undefined): -1 | 0 | 1 {
    if (!pad) return 0;
    if (pad.left) return -1;
    if (pad.right) return 1;
    const ax = pad.axes[0]?.getValue() ?? 0;
    if (ax < -0.5) return -1;
    if (ax > 0.5) return 1;
    return 0;
  }

  private syncSelectPadPrev(): void {
    const gp = this.input.gamepad;
    const p0 = gp?.getPad(0);
    const p1 = gp?.getPad(1);
    if (!p0) {
      this.prevSelectPad.p0 = { h: 0, A: false, Y: false, X: false };
    } else {
      this.prevSelectPad.p0.h = this.menuHorizontal(p0);
      this.prevSelectPad.p0.A = this.faceDown(p0, 'A');
      this.prevSelectPad.p0.Y = this.faceDown(p0, 'Y');
      this.prevSelectPad.p0.X = this.faceDown(p0, 'X');
    }
    if (!p1) {
      this.prevSelectPad.p1 = { h: 0, A: false };
    } else {
      this.prevSelectPad.p1.h = this.menuHorizontal(p1);
      this.prevSelectPad.p1.A = this.faceDown(p1, 'A');
    }
  }

  private pollGamepadCharacterSelect(): void {
    const gp = this.input.gamepad;
    const p0 = gp?.getPad(0);
    const p1 = gp?.getPad(1);

    const h0 = this.menuHorizontal(p0);
    if (h0 !== 0 && h0 !== this.prevSelectPad.p0.h) {
      if (h0 < 0) this.cycleP1(-1);
      else this.cycleP1(1);
    }

    if (p0) {
      if (this.faceDown(p0, 'Y') && !this.prevSelectPad.p0.Y) {
        this.vsCpu = !this.vsCpu;
        this.refreshModeUi();
      }
      if (this.vsCpu && this.faceDown(p0, 'X') && !this.prevSelectPad.p0.X) {
        this.cpuDifficulty = this.cpuDifficulty === 'easy' ? 'hard' : 'easy';
        this.refreshModeUi();
      }
    }

    if (!this.vsCpu && p1) {
      const h1 = this.menuHorizontal(p1);
      if (h1 !== 0 && h1 !== this.prevSelectPad.p1.h) {
        if (h1 < 0) this.cycleP2(-1);
        else this.cycleP2(1);
      }
    }

    if (p0 && this.faceDown(p0, 'A') && !this.prevSelectPad.p0.A) this.startFightFromSelect();
    if (p1 && this.faceDown(p1, 'A') && !this.prevSelectPad.p1.A) this.startFightFromSelect();
  }

  private startFightFromSelect(): void {
    const c1 = CHARACTERS[this.p1Index];
    const c2 = CHARACTERS[this.p2Index];
    if (c1 === undefined || c2 === undefined) return;
    this.scene.start('Fight', {
      player1Char: c1.id,
      player2Char: c2.id,
      vsCpu: this.vsCpu,
      cpuDifficulty: this.vsCpu ? this.cpuDifficulty : undefined,
    });
  }

  private cycleP1(delta: number): void {
    this.p1Index = (this.p1Index + delta + CHARACTERS.length) % CHARACTERS.length;
    this.refreshPortraits();
  }

  private cycleP2(delta: number): void {
    this.p2Index = (this.p2Index + delta + CHARACTERS.length) % CHARACTERS.length;
    this.refreshPortraits();
  }

  private refreshPortraits(): void {
    const c1 = CHARACTERS[this.p1Index];
    const c2 = CHARACTERS[this.p2Index];
    if (c1 === undefined || c2 === undefined) return;
    this.portrait1.setTexture(`${c1.spritePrefix}_idle`);
    this.portrait2.setTexture(`${c2.spritePrefix}_idle`);
    const frame = this.frame1;
    const innerW = frame.width - PORTRAIT_INSET * 2;
    const innerH = frame.height - PORTRAIT_INSET * 2;
    this.fitPortraitInBox(this.portrait1, innerW, innerH);
    this.fitPortraitInBox(this.portrait2, innerW, innerH);
    this.name1.setText(c1.name);
    this.name2.setText(c2.name);
    this.matchup.setText(`${c1.name}  vs  ${c2.name}`);
    this.refreshModeUi();
  }

  private refreshModeUi(): void {
    const p2Keys = [
      'Player 2',
      '─────────',
      '↑ ← ↓ →   move',
      'O         punch',
      'L         kick',
      'U         special',
      '↑         jump',
    ].join('\n');
    const cpuKeys = [
      'CPU opponent',
      '─────────',
      'Computer controls',
      'this fighter in',
      'the next fight.',
    ].join('\n');

    if (this.vsCpu) {
      const tier = this.cpuDifficulty === 'hard' ? 'hard' : 'easy';
      this.modeLine.setText(
        `Mode: VS CPU (${tier})  —  C / P1 Y: two players    H / P1 X: easy ↔ hard`,
      );
      this.p2SlotLabel.setText('CPU opponent');
      this.selectHint.setText('P1: A/D or stick  —  arrows or P2 stick: pick CPU fighter');
      this.p2ControlsColumn.setText(cpuKeys);
    } else {
      this.modeLine.setText('Mode: two players  (C or P1 Y — fight vs CPU)');
      this.p2SlotLabel.setText('Player 2');
      this.selectHint.setText('P1: A/D or stick  —  P2: arrows or stick');
      this.p2ControlsColumn.setText(p2Keys);
    }
    this.bottomHint.setText(
      'C or P1 Y — CPU    ·    H or P1 X — easy/hard (VS CPU)\nSPACE or A (any pad) — start',
    );
  }

  /** Uniform scale so the full sprite fits inside the inner box (handles varying Kenney texture sizes). */
  private fitPortraitInBox(image: Phaser.GameObjects.Image, maxW: number, maxH: number): void {
    image.setScale(1);
    const w = image.width;
    const h = image.height;
    if (w <= 0 || h <= 0) return;
    const scale = Math.min(maxW / w, maxH / h);
    image.setScale(scale);
  }
}
