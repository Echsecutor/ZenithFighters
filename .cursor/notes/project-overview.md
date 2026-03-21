# Zenith Fighters - Project Overview

## Tech Stack

- **Game Engine**: Phaser 3.90+
- **Language**: TypeScript 5.x
- **Bundler**: Vite 6.x
- **Linting**: ESLint 9 with TypeScript

## Game Concept

Street Fighter-style 2D fighting game:
- Two-player local (keyboard / gamepad); AI not implemented yet
- Character select: P1 `A`/`D`, P2 `←`/`→`, `SPACE` to fight; roster from `CHARACTERS` (Kenney PNG poses)
- Arcade-style combat

## Architecture

Scene flow: Boot → MainMenu → CharacterSelect → Fight → Victory → MainMenu (`VictoryScene` shows winner portrait + name)

Key modules:
- `src/game/scenes/` - Phaser scenes (`CharacterSelectScene`: portraits + control hints)
- `src/game/entities/` - `Fighter`
- `src/game/systems/` - `InputManager` (P1: WASD, R punch, F kick, W jump; P2: arrows, O punch, L kick, Up jump; gamepads A/B punch/kick, X jump)
- `src/game/data/` - Character definitions

## Key Decisions

- **Phaser** chosen over Kaplay (performance) and PixiJS (completeness)
- **Vite** for fast HMR and modern ES build
- **Arcade Physics** for gravity, knockback, collision
