import Phaser from 'phaser';
import { gameConfig } from './config';

export function createGame(): Phaser.Game {
  return new Phaser.Game(gameConfig);
}
