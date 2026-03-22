# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] 2016-03-22

### Added

- Playable fighter **Blink** (`robot`): sprites from Kenney **Toon Characters 1**; special ability **teleport** — dashes forward in facing direction (clamped to arena), same global special cooldown as other fighters
- **Main menu** mode selection: **Versus** (single match, same as before) vs **Adventure** (endless VS CPU gauntlet)
- **Adventure mode**: same fight scene; beating the CPU spawns a **new random** opponent; **lives** (`ADVENTURE_START_LIVES` in `src/game/data/adventureConfig.ts`) drain on player loss; HUD shows wins and lives; **game over** scene with name entry and **local high scores** sorted by victory count (`localStorage` key `zenithfighters_adventure_highscores`, helpers in `src/game/data/adventureScores.ts`)
- **`AdventureGameOverScene`**: DOM name field + leaderboard overlay (`public/style.css`); registered in `src/game/config.ts`

### Changed

- **Adventure**: after beating the CPU, the next round keeps **player 1’s current HP** (no full heal between wins); losing a life and retrying the same opponent still **refills player 1** but keeps the **CPU’s current HP** via `adventureCpuHp`
- **Adventure game over**: Phaser **keyboard plugin disabled** plus **`disableGlobalCapture()`** during name entry so fight keys registered via `addKey` (default capture) no longer get `preventDefault` and **WASD / arrows / fight keys type normally** in the DOM field; **gamepad** hint text shortened (**←/→ · A add · B delete · X save**); **`enableGlobalCapture()`** when leaving the screen
- `README.md`: **Deployed stages** links to the live GitHub Pages build at [echsecutor.github.io/ZenithFighters](https://echsecutor.github.io/ZenithFighters/)
- **VS CPU** (`CpuController`): walks in closer before stopping (`engageDx` ~68px), slightly wider perceived punch range for choosing melee, hard-mode chase/special distance tuned so the CPU commits from nearer

### Fixed

- **Adventure leaderboard name field**: fight hotkeys failed in the HTML input because Phaser **key capture** blocked the browser; fixed by toggling global capture (see **Changed** above)

- **Blink** hurt pose: replaced Kenney `character_robot_hurt.png` (face has no eye) with `character_robot_hit.png` as `robot_hurt.png` so the cyclops eye stays visible when damaged

- **GitHub Pages**: Kenney portraits, fight floor, and BGM failed to load because URLs were root-absolute (`/assets/...`); `assetPaths.ts` now prefixes `import.meta.env.BASE_URL` so `public/` files resolve under project Pages paths (`src/vite-env.d.ts` for Vite client types)
- **Melee hits (incl. VS CPU)**: `Fighter` punch/kick no longer reset to idle on the same frame as `playAnim` when Phaser has not yet marked the animation playing, so hitboxes stay active long enough for `PhysicsManager.checkHits` to register damage

## [1.1.0] 2026-03-21

### Added

- Fight scene: **blue** / **red** down-pointing markers above player 1 / player 2 (procedural textures, gentle bob), hidden on KO — easier to tell fighters apart with the same character (`FightScene.ensurePlayerArrowTextures`, `syncPlayerArrow`)
- GitHub Actions workflow **Deploy to GitHub Pages** (`.github/workflows/deploy-pages.yml`): `npm ci`, `npm run build`, deploy `dist/` on push to `main` and on `workflow_dispatch` (requires Pages source **GitHub Actions** in repository settings)



### Changed

- VS CPU **easy** never fires **specials**; **hard** fires a special on the first eligible tick whenever it is off cooldown and roughly in mid range (no random gate), on top of existing hard pressure / damage scaling (`CpuController`)
- Ground **fire** and **toxic** specials: **higher damage over time** (`damagePerTick` / `tickMs` in `src/game/data/characters.ts` for Brawler fire patch and Shambler toxic patch)
- Ground hazards: **8-frame animated** procedural sprites and Phaser anims from `FightScene.ensureHazardTextures` (additive blend on fire); `GroundHazard` uses a scaled sprite instead of flat `Graphics` ellipses

### Added

- VS CPU **difficulty**: **easy** (melee/jump only, no specials) vs **hard** (higher outgoing damage, aggressive specials when ready, pressure during player **hurt** to chain hits). Character select: **H** or **P1 X** toggles easy/hard while VS CPU is on; `Fight` receives `cpuDifficulty`, `CpuController` takes `CpuDifficulty`, `Fighter` optional `damageMultiplier` for scaled melee/special damage
- Site favicon (`public/favicon.ico`): head crop from the first frame of the player sprite sheet (`public/assets/characters/player.png`, 9×3 grid, 80×110px cells); linked from root `index.html`

- Character select: gamepad support (pad 0 = P1 roster / **Y** = CPU toggle / **A** = start; pad 1 = P2 roster when two players; horizontal D-pad or left stick with edge detection + `POST_UPDATE` prev state, same pattern as `InputManager`)

### Fixed

- Character select: yellow **mode** line shared the same vertical band as **Player 1 / Player 2** labels (looked doubled / overlapping); header Y positions are now derived from the portrait row with extra gap, **mode** text uses word wrap + line spacing, and the bottom hint has clearer line spacing and inset from the screen edge (`CharacterSelectScene`)

- Character select: fight-controls columns and the bottom CPU / difficulty / start hint sat in the same vertical band, so the last control rows (e.g. jump) drew on top of the footer; relayout with a higher controls block, bottom-aligned wrapped footer, and a two-line footer string (`CharacterSelectScene`)

- Gamepad face buttons: `Phaser.Input.Gamepad.Button` has no `JustDown` (it is button index constants); `InputManager` now treats “just pressed” as `pressed && !previous`, with previous state updated each frame in `POST_UPDATE`
- Gamepad A/B/X/Y: Phaser exposes them as **booleans** on `Gamepad`, not `{ pressed }` objects; reading `.pressed` always failed, and `if (pad?.A)` skipped the gamepad path whenever A was released — fixed via `faceDown()` and `if (pad)` for actions

- Per-character **special attacks** (see `special` + `SpecialSpawnRequest` in `src/game/data/characters.ts`): Brawler **ground fire** patch (tick damage), Striker **boomerang** (outbound + weaker return hit), Scout **ice ball** projectile, Vanguard fast **burst round**, Shambler **toxic ground** patch; procedural textures `special_ice`, `special_boomerang`, `special_slug` in `FightScene.ensureSpecialTextures`; `GroundHazard`, `BoomerangProjectile`, `Fighter.applyDotDamage` for hazards; **5s** cooldown; HUD + **E** / **U** / gamepad **Y**; **hard** VS CPU uses specials whenever ready (easy CPU does not)
- Character select: **C** toggles **VS CPU**; CPU opponent uses the right-slot fighter; `Fight` receives `vsCpu` and drives P2 with `CpuController` (approach, retreat, punch/kick/jump with cooldowns)
- `CpuController` in `src/game/systems/CpuController.ts` for arcade-style CPU opponent

## [1.0.0] 2026-03-21


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
