import Phaser from 'phaser';

/**
 * Base fighter class. Will manage fighter state, animations, hitboxes, and combat logic.
 * Placeholder - to be implemented with full fighting game mechanics.
 */
export class Fighter extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, characterId: string) {
    super(scene, x, y);
    this.setDataEnabled();
    this.setData('characterId', characterId);
  }
}
