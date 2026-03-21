import Phaser from 'phaser';

export class FightScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Fight' });
  }

  create(data: { player1Char?: string; player2Char?: string; vsAI?: boolean }): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const title = this.add.text(width / 2, 40, 'FIGHT!', {
      fontSize: '36px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const mode = data.vsAI === true ? 'vs AI' : 'Player 1 vs Player 2';
    const subtitle = this.add.text(width / 2, height / 2, mode, {
      fontSize: '24px',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);

    const hint = this.add.text(width / 2, height - 60, 'Press SPACE for victory (placeholder)', {
      fontSize: '18px',
      color: '#a0a0a0',
    });
    hint.setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('Victory', { winner: 1 });
    });
  }
}
