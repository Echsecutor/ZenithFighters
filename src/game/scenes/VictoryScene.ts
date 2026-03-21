import Phaser from 'phaser';

export interface VictorySceneData {
  winner?: number;
  winnerSpritePrefix?: string;
  winnerName?: string;
}

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Victory' });
  }

  create(data: VictorySceneData): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const winner = data.winner ?? 1;
    const prefix = data.winnerSpritePrefix ?? 'player';
    const charName = data.winnerName ?? `Player ${winner}`;
    const textureKey = `${prefix}_idle`;

    const title = this.add.text(width / 2, height * 0.14, 'VICTORY!', {
      fontSize: '48px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const maxPortraitW = width * 0.4;
    const maxPortraitH = height * 0.34;
    const portraitCenterY = height * 0.4;

    let winnerTextY = height * 0.58;
    if (this.textures.exists(textureKey)) {
      const portrait = this.add.image(width / 2, portraitCenterY, textureKey);
      this.fitPortraitInBox(portrait, maxPortraitW, maxPortraitH);
      winnerTextY = portrait.y + portrait.displayHeight / 2 + 36;
    }

    const winnerText = this.add.text(width / 2, winnerTextY, `Player ${winner} — ${charName}`, {
      fontSize: '26px',
      color: '#ffffff',
    });
    winnerText.setOrigin(0.5);

    const hint = this.add.text(width / 2, height - 80, 'Press SPACE to return to menu', {
      fontSize: '20px',
      color: '#a0a0a0',
    });
    hint.setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('MainMenu');
    });
  }

  private fitPortraitInBox(image: Phaser.GameObjects.Image, maxW: number, maxH: number): void {
    image.setScale(1);
    const w = image.width;
    const h = image.height;
    if (w <= 0 || h <= 0) return;
    const scale = Math.min(maxW / w, maxH / h) * 0.95;
    image.setScale(scale);
  }
}
