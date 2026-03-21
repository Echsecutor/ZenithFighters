# Changelog

## WIP

- Resolved `.gitignore` merge conflict: kept full Node/Vite-oriented ignore list (covers `node_modules/`, `dist`, logs, `.env.*`); removed conflict markers and duplicate tail entries
- Fight scene visuals: procedural arena gradient + grid; tiled `arcade_floor` texture (CC0); `scripts/download-assets.ps1` + `npm run download-assets`
- Visible platform, jump support
  - FightScene: platform rectangle with physics, colliders so fighters land on it
  - Fighter: `tryJump()`, jump state, airborne movement
  - InputManager: `isJumpJustDown()` – W/Up (keyboard), X (gamepad)
- Fighting game mechanics and Kenney assets
  - Downloaded Kenney platformer characters (CC0, OpenGameArt), extracted to `public/assets/kenney_extracted/`
  - BootScene: load Player + Female pose PNGs, create idle/walk/punch/kick/hurt animations
  - InputManager: P1 WASD+U/I, P2 Arrows+J/K
  - Fighter: state machine (idle, walk, punch, kick, hurt, ko), hitbox/hurtbox, damage, knockback
  - PhysicsManager: hitbox-vs-hurtbox overlap, one hit per attack
  - FightScene: arena, spawn fighters, health bars, round end → Victory
  - Characters: Brawler (player), Striker (female) with distinct stats
- Note: `terminal-avoid.md` – avoid PowerShell System.Drawing (crashes Cursor)

- Upgraded to latest package versions (Node 18+ LTS)
    - Phaser ^3.90.0, TypeScript ~5.7, Vite ^6.0, ESLint ^9.0, typescript-eslint ^8.0
    - Restored ESLint 9 flat config (`eslint.config.js`)

- Pinned dependencies to Node 12-compatible versions (ESLint 8, typescript-eslint 5, Vite 2, TypeScript 4.9)
- Added `.npmrc` with `engine-strict=false`, `engines` in package.json, `.nvmrc`

- Initial project setup
    - Phaser 3, TypeScript, Vite, ESLint
    - Boot, MainMenu, CharacterSelect, Fight, Victory scenes (placeholders)
    - Folder structure: entities, systems, data, public/assets
    - `.cursor/notes` initialized with index and project-overview
