import Phaser from 'phaser';
import type { Types } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { FightScene } from './scenes/FightScene';
import { VictoryScene } from './scenes/VictoryScene';

export const gameConfig: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 650 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MainMenuScene,
    CharacterSelectScene,
    FightScene,
    VictoryScene,
  ],
};
