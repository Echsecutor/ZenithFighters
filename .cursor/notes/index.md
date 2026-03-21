# Zenith Fighters - Notes Index

## Project Overview

- **Type**: Client-side 2D arcade fighting game (browser)
- **Framework**: Phaser 3, TypeScript, Vite

See [project-overview.md](project-overview.md) for tech stack, architecture, and key decisions. End-user install, controls, and credits: root [README.md](../../README.md).

## Notes by Topic

| Topic | File | Description |
|-------|------|-------------|
| Project structure, tech stack, architecture | [project-overview.md](project-overview.md) | High-level overview of the codebase |
| Terminal commands to avoid | [terminal-avoid.md](terminal-avoid.md) | PowerShell/System.Drawing crash; use hardcoded asset dims instead |
| Assets (Kenney, paths) | [assets.md](assets.md) | CC0 characters, individual PNGs, assetPaths.ts |

## Folder Structure

```
ZenithFighters/
  .cursor/notes/       - AI notes (this folder)
  public/              - Static assets
    assets/            - Characters, UI, audio, backgrounds
  src/
    main.ts            - Entry point
    game/
      config.ts       - Phaser config
      main.ts         - Game creation
      scenes/         - Boot, MainMenu, CharacterSelect, Fight, Victory
      entities/       - Fighter
      systems/        - InputManager, PhysicsManager
      data/           - Character definitions, assetPaths
```

## Conventions

- Changelog: `.cursor/rules/changelog-conventions.mdc` - Use `Changelog.md` in project root for WIP entries
- Notes: `.cursor/rules/notes.mdc` - Read notes before tasks, update after learning
