import Phaser from 'phaser';
import { CHARACTERS } from '../data/characters';

/** Inset inside the stroke rect so sprites never touch the border. */
const PORTRAIT_INSET = 10;

export class CharacterSelectScene extends Phaser.Scene {
  private p1Index = 0;
  private p2Index = 1;
  private portrait1!: Phaser.GameObjects.Image;
  private portrait2!: Phaser.GameObjects.Image;
  private name1!: Phaser.GameObjects.Text;
  private name2!: Phaser.GameObjects.Text;
  private frame1!: Phaser.GameObjects.Rectangle;
  private frame2!: Phaser.GameObjects.Rectangle;
  private matchup!: Phaser.GameObjects.Text;

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

    this.matchup = this.add.text(width / 2, 100, '', {
      fontSize: '22px',
      color: '#ffffff',
    });
    this.matchup.setOrigin(0.5);

    const frameW = 156;
    const frameH = 196;
    const innerW = frameW - PORTRAIT_INSET * 2;
    const innerH = frameH - PORTRAIT_INSET * 2;
    const yPort = height * 0.36;

    this.frame1 = this.add.rectangle(width * 0.32, yPort, frameW, frameH, 0x000000, 0);
    this.frame1.setStrokeStyle(4, 0x4ecca3);
    this.portrait1 = this.add.image(width * 0.32, yPort, `${CHARACTERS[this.p1Index].spritePrefix}_idle`);
    this.fitPortraitInBox(this.portrait1, innerW, innerH);
    this.name1 = this.add.text(width * 0.32, yPort + frameH / 2 + 22, '', {
      fontSize: '20px',
      color: '#4ecca3',
      fontStyle: 'bold',
    });
    this.name1.setOrigin(0.5);

    this.frame2 = this.add.rectangle(width * 0.68, yPort, frameW, frameH, 0x000000, 0);
    this.frame2.setStrokeStyle(4, 0xe94560);
    this.portrait2 = this.add.image(width * 0.68, yPort, `${CHARACTERS[this.p2Index].spritePrefix}_idle`);
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
    this.add
      .text(width * 0.68, yPort - frameH / 2 - 22, 'Player 2', {
        fontSize: '16px',
        color: '#a0a0a0',
      })
      .setOrigin(0.5);

    const selectHint = this.add.text(width / 2, yPort + frameH / 2 + 56, 'P1: A / D   —   P2: ← / →', {
      fontSize: '16px',
      color: '#888888',
    });
    selectHint.setOrigin(0.5);

    const layoutTitle = this.add.text(width / 2, height * 0.72, 'Fight controls', {
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
      'W         jump',
    ].join('\n');
    const p2Keys = [
      'Player 2',
      '─────────',
      '↑ ← ↓ →   move',
      'O         punch',
      'L         kick',
      '↑         jump',
    ].join('\n');

    this.add.text(width * 0.28, height * 0.76, p1Keys, colStyle).setOrigin(0, 0);
    this.add.text(width * 0.72, height * 0.76, p2Keys, colStyle).setOrigin(1, 0);

    const hint = this.add.text(width / 2, height - 48, 'SPACE — start fight', {
      fontSize: '18px',
      color: '#a0a0a0',
    });
    hint.setOrigin(0.5);

    this.refreshPortraits();

    const kb = this.input.keyboard;
    if (!kb) return;

    const p1Prev = () => this.cycleP1(-1);
    const p1Next = () => this.cycleP1(1);
    const p2Prev = () => this.cycleP2(-1);
    const p2Next = () => this.cycleP2(1);
    const startFight = () => {
      const c1 = CHARACTERS[this.p1Index];
      const c2 = CHARACTERS[this.p2Index];
      this.scene.start('Fight', { player1Char: c1.id, player2Char: c2.id });
    };

    kb.on('keydown-A', p1Prev);
    kb.on('keydown-D', p1Next);
    kb.on('keydown-LEFT', p2Prev);
    kb.on('keydown-RIGHT', p2Next);
    kb.once('keydown-SPACE', startFight);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      kb.off('keydown-A', p1Prev);
      kb.off('keydown-D', p1Next);
      kb.off('keydown-LEFT', p2Prev);
      kb.off('keydown-RIGHT', p2Next);
      kb.off('keydown-SPACE', startFight);
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
