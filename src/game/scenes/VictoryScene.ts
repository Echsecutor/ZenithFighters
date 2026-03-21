import Phaser from 'phaser';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Victory' });
  }

  create(data: { winner?: number }): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const winner = data.winner ?? 1;

    const title = this.add.text(width / 2, height / 3, 'VICTORY!', {
      fontSize: '48px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const winnerText = this.add.text(width / 2, height / 2, `Player ${winner} wins!`, {
      fontSize: '28px',
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
}
