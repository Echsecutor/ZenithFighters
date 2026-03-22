import Phaser from 'phaser';

export type MainMenuGameMode = 'versus' | 'adventure';

const MODES: { id: MainMenuGameMode; label: string; blurb: string }[] = [
  { id: 'versus', label: 'Versus', blurb: 'One match · local or vs CPU' },
  { id: 'adventure', label: 'Adventure', blurb: 'Endless CPU gauntlet · lives · high scores' },
];

export class MainMenuScene extends Phaser.Scene {
  private selected = 0;
  private modeTexts: Phaser.GameObjects.Text[] = [];
  private prevMenu = { up: false, down: false, w: false, s: false, p0u: false, p0d: false, p0a: false };

  constructor() {
    super({ key: 'MainMenu' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const title = this.add.text(width / 2, height * 0.2, 'ZENITH FIGHTERS', {
      fontSize: '48px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.3, 'Select mode', {
        fontSize: '22px',
        color: '#a0a0a0',
      })
      .setOrigin(0.5);

    const startY = height * 0.42;
    const step = 72;
    this.modeTexts = MODES.map((m, i) => {
      const t = this.add.text(width / 2, startY + i * step, `${m.label}\n${m.blurb}`, {
        fontSize: '20px',
        color: '#666666',
        align: 'center',
        lineSpacing: 8,
      });
      t.setOrigin(0.5);
      return t;
    });

    this.add
      .text(width / 2, height - 48, '↑ ↓ or W S · gamepad up/down · SPACE / A to start', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.refreshSelection();

    const kb = this.input.keyboard;
    const onUp = () => this.moveSelection(-1);
    const onDown = () => this.moveSelection(1);
    const start = () => this.confirmSelection();

    kb?.on('keydown-UP', onUp);
    kb?.on('keydown-DOWN', onDown);
    kb?.on('keydown-W', onUp);
    kb?.on('keydown-S', onDown);
    kb?.once('keydown-SPACE', start);

    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncMenuKeyPrev, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      kb?.off('keydown-UP', onUp);
      kb?.off('keydown-DOWN', onDown);
      kb?.off('keydown-W', onUp);
      kb?.off('keydown-S', onDown);
      kb?.off('keydown-SPACE', start);
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncMenuKeyPrev, this);
    });
  }

  update(): void {
    this.pollGamepadMenu();
  }

  private confirmSelection(): void {
    const mode = MODES[this.selected]?.id ?? 'versus';
    this.scene.start('CharacterSelect', { gameMode: mode });
  }

  private moveSelection(delta: number): void {
    this.selected = (this.selected + delta + MODES.length) % MODES.length;
    this.refreshSelection();
  }

  private refreshSelection(): void {
    this.modeTexts.forEach((t, i) => {
      const active = i === this.selected;
      t.setColor(active ? '#ffffff' : '#555555');
      t.setStyle({ fontStyle: active ? 'bold' : 'normal' });
    });
  }

  private syncMenuKeyPrev(): void {
    const kb = this.input.keyboard;
    this.prevMenu.up = kb?.checkDown('UP') ?? false;
    this.prevMenu.down = kb?.checkDown('DOWN') ?? false;
    this.prevMenu.w = kb?.checkDown('W') ?? false;
    this.prevMenu.s = kb?.checkDown('S') ?? false;

    const gp = this.input.gamepad?.getPad(0);
    if (gp) {
      const v = this.menuVertical(gp);
      this.prevMenu.p0u = v < 0;
      this.prevMenu.p0d = v > 0;
      this.prevMenu.p0a = this.faceDown(gp, 'A');
    } else {
      this.prevMenu.p0u = false;
      this.prevMenu.p0d = false;
      this.prevMenu.p0a = false;
    }
  }

  private menuVertical(pad: Phaser.Input.Gamepad.Gamepad): -1 | 0 | 1 {
    if (pad.up) return -1;
    if (pad.down) return 1;
    const ay = pad.axes[1]?.getValue() ?? 0;
    if (ay < -0.55) return -1;
    if (ay > 0.55) return 1;
    return 0;
  }

  private faceDown(pad: Phaser.Input.Gamepad.Gamepad, face: 'A'): boolean {
    const v = (pad as unknown as Record<string, unknown>)[face];
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object' && 'pressed' in v) return Boolean((v as { pressed: boolean }).pressed);
    return false;
  }

  private pollGamepadMenu(): void {
    const kb = this.input.keyboard;
    const upNow = kb?.checkDown('UP') ?? false;
    const downNow = kb?.checkDown('DOWN') ?? false;
    const wNow = kb?.checkDown('W') ?? false;
    const sNow = kb?.checkDown('S') ?? false;

    if ((upNow && !this.prevMenu.up) || (wNow && !this.prevMenu.w)) this.moveSelection(-1);
    if ((downNow && !this.prevMenu.down) || (sNow && !this.prevMenu.s)) this.moveSelection(1);

    const gp = this.input.gamepad?.getPad(0);
    if (gp) {
      const v = this.menuVertical(gp);
      if (v < 0 && !this.prevMenu.p0u) this.moveSelection(-1);
      if (v > 0 && !this.prevMenu.p0d) this.moveSelection(1);
      if (this.faceDown(gp, 'A') && !this.prevMenu.p0a) this.confirmSelection();
    }
  }
}
