import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // Placeholder: assets will be loaded here
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const text = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);
  }

  create(): void {
    this.scene.start('MainMenu');
  }
}
