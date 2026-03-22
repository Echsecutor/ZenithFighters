import Phaser from 'phaser';
import { loadAdventureHighScores, saveAdventureHighScore } from '../data/adventureScores';

export interface AdventureGameOverSceneData {
  victories?: number;
}

/** Characters available when building a name with the gamepad (space at index 0). */
const NAME_CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export class AdventureGameOverScene extends Phaser.Scene {
  private overlayRoot: HTMLElement | null = null;
  private unsubSpace: (() => void) | null = null;
  private phase: 'name' | 'leaderboard' = 'name';
  private wheelIndex = 0;
  private nameInputEl: HTMLInputElement | null = null;
  /** Previous-frame gamepad snapshot (updated in POST_UPDATE) for edge detection. */
  private padPrev = { h: 0 as -1 | 0 | 1, a: false, b: false, x: false };

  private wheelText!: Phaser.GameObjects.Text;
  private padHelpText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'AdventureGameOver' });
  }

  create(data: AdventureGameOverSceneData): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const victories = data.victories ?? 0;

    this.phase = 'name';
    this.wheelIndex = 0;

    const kbPlugin = this.input.keyboard;
    if (kbPlugin) {
      kbPlugin.disableGlobalCapture();
      kbPlugin.enabled = false;
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a14, 0.92).setDepth(200);

    this.add
      .text(width / 2, height * 0.12, 'GAME OVER', {
        fontSize: '52px',
        color: '#e94560',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(width / 2, height * 0.24, `Victories this run: ${victories}`, {
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(width / 2, height * 0.34, 'Enter your name for the leaderboard', {
        fontSize: '18px',
        color: '#a0a0a0',
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.wheelText = this.add
      .text(width / 2, height * 0.72, '', {
        fontSize: '26px',
        color: '#4ecca3',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.padHelpText = this.add
      .text(
        width / 2,
        height * 0.8,
        'Gamepad: ← / → · A add · B delete · X save',
        { fontSize: '15px', color: '#888888', align: 'center' },
      )
      .setOrigin(0.5)
      .setDepth(201);

    this.refreshWheel();

    const doc = (globalThis as unknown as { document?: Document }).document;
    if (!doc) {
      this.restoreKeyboard();
      this.fallbackPhaserOnly(victories);
      return;
    }
    const container = doc.getElementById('game-container');
    if (!container) {
      this.restoreKeyboard();
      this.fallbackPhaserOnly(victories);
      return;
    }

    const root = doc.createElement('div');
    root.className = 'adventure-gameover-overlay';
    root.innerHTML = `
      <div class="adventure-gameover-panel">
        <input type="text" class="adventure-gameover-input" maxlength="24" placeholder="Your name" autocomplete="off" spellcheck="false" />
        <button type="button" class="adventure-gameover-submit">Save score</button>
        <div class="adventure-gameover-leaderboard" hidden></div>
        <p class="adventure-gameover-hint" hidden>Press SPACE or gamepad A to return to the main menu</p>
      </div>
    `;
    container.appendChild(root);
    this.overlayRoot = root;

    const input = root.querySelector<HTMLInputElement>('input.adventure-gameover-input');
    const submit = root.querySelector<HTMLButtonElement>('button.adventure-gameover-submit');
    const board = root.querySelector('.adventure-gameover-leaderboard');
    const hint = root.querySelector('.adventure-gameover-hint');

    this.nameInputEl = input;

    const syncFromDom = () => {
      if (!input) return;
      input.value = input.value.slice(0, 24);
    };

    input?.addEventListener('input', syncFromDom);

    const showBoard = (entries: ReturnType<typeof loadAdventureHighScores>) => {
      if (!board || !hint || !submit || !input) return;
      submit.toggleAttribute('hidden', true);
      input.toggleAttribute('hidden', true);
      board.toggleAttribute('hidden', false);
      hint.toggleAttribute('hidden', false);
      const rows = entries
        .map(
          (e, i) =>
            `<div class="adventure-gameover-row"><span class="adventure-gameover-rank">${i + 1}.</span><span class="adventure-gameover-name">${escapeHtml(e.name)}</span><span class="adventure-gameover-score">${e.victories} wins</span></div>`,
        )
        .join('');
      board.innerHTML = `<h3 class="adventure-gameover-board-title">Adventure high scores</h3>${rows || '<p class="adventure-gameover-empty">No scores yet.</p>'}`;
    };

    const onSubmit = () => {
      if (this.phase !== 'name') return;
      this.phase = 'leaderboard';
      this.restoreKeyboard();
      this.wheelText.setVisible(false);
      this.padHelpText.setVisible(false);
      const name = input?.value ?? '';
      const list = saveAdventureHighScore(name, victories);
      showBoard(list);
      this.bindSpaceOrPadToMenu();
    };

    const onInputKeydown = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        onSubmit();
      }
    };
    input?.addEventListener('keydown', onInputKeydown);

    submit?.addEventListener('click', onSubmit);

    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.recordPadPrev, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.restoreKeyboard();
      input?.removeEventListener('input', syncFromDom);
      input?.removeEventListener('keydown', onInputKeydown);
      submit?.removeEventListener('click', onSubmit);
      root.remove();
      this.overlayRoot = null;
      this.nameInputEl = null;
      this.unsubSpace?.();
      this.unsubSpace = null;
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.recordPadPrev, this);
    });

    this.time.delayedCall(100, () => input?.focus());
  }

  update(): void {
    if (this.phase === 'leaderboard') {
      const p0 = this.input.gamepad?.getPad(0);
      if (p0 && this.faceDown(p0, 'A') && !this.padPrev.a) {
        this.scene.start('MainMenu');
      }
      return;
    }

    const p0 = this.input.gamepad?.getPad(0);
    if (!p0) return;

    const h = this.menuHorizontal(p0);
    if (h !== 0 && h !== this.padPrev.h) {
      const n = NAME_CHARSET.length;
      this.wheelIndex = (this.wheelIndex + (h < 0 ? -1 : 1) + n) % n;
      this.refreshWheel();
    }

    if (this.faceDown(p0, 'A') && !this.padPrev.a) {
      this.appendWheelChar();
    }
    if (this.faceDown(p0, 'B') && !this.padPrev.b) {
      this.backspaceName();
    }
    if (this.faceDown(p0, 'X') && !this.padPrev.x) {
      const btn = this.overlayRoot?.querySelector<HTMLButtonElement>('button.adventure-gameover-submit');
      btn?.click();
    }
  }

  private recordPadPrev(): void {
    const p0 = this.input.gamepad?.getPad(0);
    if (!p0) {
      this.padPrev = { h: 0, a: false, b: false, x: false };
      return;
    }
    this.padPrev.h = this.menuHorizontal(p0);
    this.padPrev.a = this.faceDown(p0, 'A');
    this.padPrev.b = this.faceDown(p0, 'B');
    this.padPrev.x = this.faceDown(p0, 'X');
  }

  private menuHorizontal(pad: Phaser.Input.Gamepad.Gamepad): -1 | 0 | 1 {
    if (pad.left) return -1;
    if (pad.right) return 1;
    const ax = pad.axes[0]?.getValue() ?? 0;
    if (ax < -0.55) return -1;
    if (ax > 0.55) return 1;
    return 0;
  }

  private faceDown(pad: Phaser.Input.Gamepad.Gamepad, face: 'A' | 'B' | 'X'): boolean {
    const v = (pad as unknown as Record<string, unknown>)[face];
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object' && 'pressed' in v) return Boolean((v as { pressed: boolean }).pressed);
    return false;
  }

  private refreshWheel(): void {
    const ch = NAME_CHARSET[this.wheelIndex] ?? ' ';
    const label = ch === ' ' ? 'space' : ch;
    this.wheelText.setText(`〈 ${label} 〉`);
  }

  private appendWheelChar(): void {
    const input = this.nameInputEl;
    if (!input) return;
    const ch = NAME_CHARSET[this.wheelIndex] ?? ' ';
    if (input.value.length >= 24) return;
    input.value += ch;
    input.value = input.value.slice(0, 24);
  }

  private backspaceName(): void {
    const input = this.nameInputEl;
    if (!input || input.value.length === 0) return;
    input.value = input.value.slice(0, -1);
  }

  private restoreKeyboard(): void {
    const kbPlugin = this.input.keyboard;
    if (kbPlugin) {
      kbPlugin.enabled = true;
      kbPlugin.enableGlobalCapture();
    }
  }

  private bindSpaceOrPadToMenu(): void {
    this.unsubSpace?.();
    const kb = this.input.keyboard;
    if (!kb) return;
    const go = () => {
      this.scene.start('MainMenu');
    };
    kb.once('keydown-SPACE', go);
    this.unsubSpace = () => kb.off('keydown-SPACE', go);
  }

  /** If `#game-container` is missing, still allow continuing without DOM form. */
  private fallbackPhaserOnly(victories: number): void {
    this.wheelText.setVisible(false);
    this.padHelpText.setVisible(false);
    const list = saveAdventureHighScore('Player', victories);
    let y = 400;
    this.add
      .text(this.cameras.main.width / 2, y, 'High scores (saved locally)', {
        fontSize: '20px',
        color: '#e94560',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(201);
    y += 40;
    for (let i = 0; i < Math.min(10, list.length); i++) {
      const e = list[i]!;
      this.add
        .text(this.cameras.main.width / 2, y, `${i + 1}. ${e.name} — ${e.victories} wins`, {
          fontSize: '16px',
          color: '#d8d8d8',
        })
        .setOrigin(0.5)
        .setDepth(201);
      y += 26;
    }
    this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height - 60, 'Press SPACE for main menu', {
        fontSize: '18px',
        color: '#888888',
      })
      .setOrigin(0.5)
      .setDepth(201);
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('MainMenu');
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
