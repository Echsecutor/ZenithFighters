# Zenith Fighters - Project Overview

## Tech Stack

- **Game Engine**: Phaser 3.90+
- **Language**: TypeScript 5.x
- **Bundler**: Vite 6.x
- **Linting**: ESLint 9 with TypeScript

## Game Concept

Street Fighter-style 2D fighting game:
- 2 players local (keyboard/controller) or 1 vs AI
- Character selection
- Arcade-style combat

## Architecture

Scene flow: Boot → MainMenu → CharacterSelect → Fight → Victory → MainMenu

Key modules:
- `src/game/scenes/` - Phaser scenes
- `src/game/entities/` - Fighter, AIController
- `src/game/systems/` - InputManager, PhysicsManager
- `src/game/data/` - Character definitions

## Key Decisions

- **Phaser** chosen over Kaplay (performance) and PixiJS (completeness)
- **Vite** for fast HMR and modern ES build
- **Arcade Physics** for gravity, knockback, collision
