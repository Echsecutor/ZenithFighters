import Phaser from 'phaser';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelect' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const title = this.add.text(width / 2, 80, 'SELECT CHARACTER', {
      fontSize: '32px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const hint = this.add.text(width / 2, height - 80, 'Press SPACE to fight', {
      fontSize: '20px',
      color: '#a0a0a0',
    });
    hint.setOrigin(0.5);

    // Placeholder: character selection UI will be implemented here
    const placeholder = this.add.text(width / 2, height / 2, 'Character select (placeholder)', {
      fontSize: '24px',
      color: '#ffffff',
    });
    placeholder.setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('Fight', { player1Char: 'player', player2Char: 'female', vsAI: false });
    });
  }
}
