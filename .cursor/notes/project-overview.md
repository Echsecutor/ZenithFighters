# Zenith Fighters - Project Overview

## Tech Stack

- **Game Engine**: Phaser 3.90+
- **Language**: TypeScript 5.x
- **Bundler**: Vite 6.x
- **Linting**: ESLint 9 with TypeScript

## Game Concept

Street Fighter-style 2D fighting game:
- Local play: two human players (keyboard / gamepad) or **VS CPU** (toggle **C** on character select; P2 driven by `CpuController` in `FightScene`; **H** / **P1 X** cycles **easy** vs **hard** — easy never uses specials; hard uses specials whenever off cooldown in range + `Fighter` damage multiplier + hurt pressure). **Adventure** from main menu: forced VS CPU, random CPU each win, P1 **HP carries over** after wins (`adventurePlayerHp`), **CPU HP carries over** when P1 loses a life vs same foe (`adventureCpuHp`), lives from `ADVENTURE_START_LIVES` (`adventureConfig.ts`), continues via `scene.start('Fight', …)`; game over → `AdventureGameOverScene` (Phaser `keyboard.enabled = false` during DOM name entry; pad ←/→ + A/B/X for name) + `adventureScores.ts` (`localStorage`)
- Character select: P1 `A`/`D`, `←`/`→` for right slot, **C** CPU toggle, `SPACE` to fight; roster from `CHARACTERS` (Kenney PNG poses)
- Arcade-style combat

## Architecture

Scene flow: Boot → MainMenu (Versus / Adventure) → CharacterSelect → Fight → Victory **or** `AdventureGameOver` → MainMenu; **CharacterSelect** polls gamepads in `update` (horizontal menu + **Y** CPU / **X** easy-hard / **A** start) with prev-state sync on `POST_UPDATE`

Key modules:
- `src/game/scenes/` - Phaser scenes (`MainMenuScene`: mode select; `CharacterSelectScene`: portraits; `AdventureGameOverScene`: DOM overlay + `adventureScores`; matchup/mode/player-label Y derived from portrait row so yellow mode line clears P1/P2 labels; fight-controls vs footer use separate bands + `bottomHint` line spacing)
- `src/game/entities/` - `Fighter` (punch/kick use a short minimum wall-clock window + expected anim key so melee is not cleared before `anims.isPlaying` flips true; `meleeStartedAt` / `MELEE_MIN_MS`)
- `src/game/systems/` - `InputManager` (P1: WASD, R/F, E special, W jump; P2: arrows, O/L, U special, Up jump; gamepads: Phaser `Gamepad` **A/B/X/Y are booleans** (not `.pressed`); **just-pressed** = current `faceDown` && !previous, previous synced on `POST_UPDATE`), `PhysicsManager` (melee + straight shots + boomerang), `CpuController` (VS CPU)
- `src/game/data/` - Character definitions (`special` + `SpecialSpawnRequest`); `entities/`: `Fighter` (`applyDotDamage`), `SpecialProjectile`, `BoomerangProjectile`, `GroundHazard` (sprite animation from `FightScene.ensureHazardTextures`); **Fight** shows blue/red down-chevron markers above P1/P2 (`FightScene.ensurePlayerArrowTextures`, `syncPlayerArrow`, depth above fighters)

## CI / GitHub Pages

- Live build: `https://echsecutor.github.io/ZenithFighters/` (see root `README.md` **Deployed stages**)
- Workflow: `.github/workflows/deploy-pages.yml` — Ubuntu, Node 20, `npm ci` + `npm run build`, `actions/upload-pages-artifact` + `actions/deploy-pages` on `push` to `main` and `workflow_dispatch`
- **Settings → Pages**: source must be **GitHub Actions** (not “Deploy from a branch”)
- Production `base` is `./` in `vite.config.ts`; Phaser loads in `assetPaths.ts` use `import.meta.env.BASE_URL` via `publicUrl()` so `public/` files are not requested as domain-root `/assets/...` (which breaks on `github.io/RepoName/`)

## Key Decisions

- **Phaser** chosen over Kaplay (performance) and PixiJS (completeness)
- **Vite** for fast HMR and modern ES build
- **Arcade Physics** for gravity, knockback, collision
