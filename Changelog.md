# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Fight scene: looping background music (`crimsonVoltageRising` as MP3 + Ogg Opus under `public/assets/audio/`); stops when the fight scene shuts down (e.g. victory)
- Victory screen: winning fighter’s idle portrait (`winnerSpritePrefix`, `winnerName` from `FightScene`)
- Character roster: Kenney PNG pack under `public/assets/kenney_extracted/PNG/` (Player, Female, Adventurer, Soldier, Zombie)
- Character select: P1 cycles with `A`/`D`, P2 with `←`/`→`, portraits and matchup text; `SPACE` starts `Fight` with chosen ids
- BootScene: loads poses and registers animations for every `CHARACTERS` entry via `KENNEY_CHARACTER_POSES`
- Fight scene visuals: procedural arena gradient + grid; tiled `arcade_floor` texture (CC0)
- Visible platform, jump support
  - FightScene: platform rectangle with physics, colliders so fighters land on it
  - Fighter: `tryJump()`, jump state, airborne movement
  - InputManager: `isJumpJustDown()` – W/Up (keyboard), X (gamepad)
- Fighting game mechanics and Kenney assets
  - Downloaded Kenney platformer characters (CC0, OpenGameArt), extracted to `public/assets/kenney_extracted/`
  - BootScene: load Player + Female pose PNGs, create idle/walk/punch/kick/hurt animations
  - InputManager: P1 WASD+R/F, P2 Arrows+O/L
  - Fighter: state machine (idle, walk, punch, kick, hurt, ko), hitbox/hurtbox, damage, knockback
  - PhysicsManager: hitbox-vs-hurtbox overlap, one hit per attack
  - FightScene: arena, spawn fighters, health bars, round end → Victory
  - Characters: Brawler (player), Striker (female) with distinct stats
- Initial project setup
  - Phaser 3, TypeScript, Vite, ESLint
  - Boot, MainMenu, CharacterSelect, Fight, Victory scenes (placeholders)
  - Folder structure: entities, systems, data, `public/assets`
  - `.cursor/notes` initialized with index and project-overview

### Changed

- Version control: `public/assets/audio/crimsonVoltageRising.mp3` and `.ogg` are tracked (were untracked); all files under `public/assets/` now match the index
- README: matches current implementation (local two-player flow, menus and fight controls, vendored assets, project layout; no AI or in-repo deployment URL)
- Controls: P1 punch/kick `R`/`F` (was U/I); P2 punch/kick `O`/`L` (was J/K). Character select shows a two-column keyboard layout
- ESLint ignores `dist/` and `node_modules/`; `game/config.ts` imports Phaser for runtime config values
- Note: `terminal-avoid.md` – avoid PowerShell System.Drawing (crashes Cursor)
- Upgraded to latest package versions (Node 18+ LTS)
  - Phaser ^3.90.0, TypeScript ~5.7, Vite ^6.0, ESLint ^9.0, typescript-eslint ^8.0
  - Restored ESLint 9 flat config (`eslint.config.js`)
- Pinned dependencies to Node 12-compatible versions (ESLint 8, typescript-eslint 5, Vite 2, TypeScript 4.9)
- Added `.npmrc` with `engine-strict=false`, `engines` in `package.json`, `.nvmrc`

### Fixed

- Fight BGM: music stops when the fight scene ends (Phaser emits `SHUTDOWN` on `scene.sys.events`, it does not call `Scene.shutdown()`); `stopByKey('fight_bgm')` before each play prevents overlapping loops on rematch
- Victory screen: winner portrait scales to a max width/height (`fitPortraitInBox`); winner line is placed below the sprite using `displayHeight` (no overlap)
- Character select: idle portraits scale to fit inside the stroke box (per-texture `fitPortraitInBox`); name/hint positions follow frame height
- Resolved `.gitignore` merge conflict: kept full Node/Vite-oriented ignore list (covers `node_modules/`, `dist`, logs, `.env.*`); removed conflict markers and duplicate tail entries

### Removed

- `scripts/download-assets.ps1`, `scripts/download-kenney-characters.sh`, and `npm run download-assets` / `download-characters`; third-party assets are expected in `public/assets/` with credits in `README.md`
- Removed unused `AIController` stub; dropped unused `vsAI` / `Fight` scene data until AI exists; removed unused `PhysicsManager.reset()`
