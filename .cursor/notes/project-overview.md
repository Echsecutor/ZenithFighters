# Zenith Fighters - Project Overview

## Tech Stack

- **Game Engine**: Phaser 3.90+
- **Language**: TypeScript 5.x
- **Bundler**: Vite 6.x
- **Linting**: ESLint 9 with TypeScript

## Game Concept

Street Fighter-style 2D fighting game:
- Local play: two human players (keyboard / gamepad) or **VS CPU** (toggle **C** on character select; P2 driven by `CpuController` in `FightScene`; **H** / **P1 X** cycles **easy** vs **hard** — easy never uses specials; hard uses specials whenever off cooldown in range + `Fighter` damage multiplier + hurt pressure)
- Character select: P1 `A`/`D`, `←`/`→` for right slot, **C** CPU toggle, `SPACE` to fight; roster from `CHARACTERS` (Kenney PNG poses)
- Arcade-style combat

## Architecture

Scene flow: Boot → MainMenu → CharacterSelect → Fight → Victory → MainMenu (`VictoryScene` shows winner portrait + name); **CharacterSelect** polls gamepads in `update` (horizontal menu + **Y** CPU / **X** easy-hard / **A** start) with prev-state sync on `POST_UPDATE`

Key modules:
- `src/game/scenes/` - Phaser scenes (`CharacterSelectScene`: portraits; matchup/mode/player-label Y derived from portrait row so yellow mode line clears P1/P2 labels; fight-controls vs footer use separate bands + `bottomHint` line spacing)
- `src/game/entities/` - `Fighter`
- `src/game/systems/` - `InputManager` (P1: WASD, R/F, E special, W jump; P2: arrows, O/L, U special, Up jump; gamepads: Phaser `Gamepad` **A/B/X/Y are booleans** (not `.pressed`); **just-pressed** = current `faceDown` && !previous, previous synced on `POST_UPDATE`), `PhysicsManager` (melee + straight shots + boomerang), `CpuController` (VS CPU)
- `src/game/data/` - Character definitions (`special` + `SpecialSpawnRequest`); `entities/`: `Fighter` (`applyDotDamage`), `SpecialProjectile`, `BoomerangProjectile`, `GroundHazard` (sprite animation from `FightScene.ensureHazardTextures`)

## Key Decisions

- **Phaser** chosen over Kaplay (performance) and PixiJS (completeness)
- **Vite** for fast HMR and modern ES build
- **Arcade Physics** for gravity, knockback, collision
