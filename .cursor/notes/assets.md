# Assets

## Kenney Platformer Characters (CC0)

- **Source**: OpenGameArt `kenney_platformerCharacters.zip`
- **Location**: `public/assets/kenney_extracted/PNG/`
- **Characters**: Player, Female, Soldier, Adventurer, Zombie
- **Format**: Individual pose PNGs (no tilesheet parsing; see [terminal-avoid.md](terminal-avoid.md))
- **Paths**: `assetPaths.ts` – used by BootScene

## Fight scene

- **Arcade Floor Neon** (Fupi, CC0): `public/assets/backgrounds/arcade_floor.png` — `npm run download-assets` or OpenGameArt
- **Backdrop**: code-drawn gradient (`FightScene.drawFightBackground`)
- Keys: `SCENE_ASSETS` in `assetPaths.ts`; floor loaded in `FightScene.preload`

## Pose Mapping

- idle, walk1, walk2 → idle, walk
- action1, action2 → punch
- kick, hurt → kick, hurt
