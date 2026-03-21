# Assets

## Kenney Platformer Characters (CC0)

- **Source**: [OpenGameArt — Platformer Characters 1](https://opengameart.org/content/platformer-characters-1-5-characters) (`kenney_platformerCharacters.zip`)
- **Location**: `public/assets/kenney_extracted/PNG/`
- **Characters**: Player, Female, Adventurer, Soldier, Zombie (all in `CHARACTERS` / `KENNEY_CHARACTER_POSES`)
- **Format**: Individual pose PNGs (no tilesheet parsing; see [terminal-avoid.md](terminal-avoid.md))
- **Paths**: `assetPaths.ts` — BootScene loads per `spritePrefix` (PNGs committed under `public/assets/`)

## Fight scene

- **Arcade Floor Neon** (Fupi, CC0): `public/assets/backgrounds/arcade_floor.png` (vendored)
- **Backdrop**: code-drawn gradient (`FightScene.drawFightBackground`)
- **BGM**: `crimsonVoltageRising.mp3` + `.ogg` in `public/assets/audio/` — loaded in `FightScene.preload`, looped in `create`, stopped on `scene.sys.events` `Phaser.Scenes.Events.SHUTDOWN` (not `Scene.shutdown()`, which Phaser does not call)
- Keys: `SCENE_ASSETS` in `assetPaths.ts`; floor + fight BGM loaded in `FightScene.preload`

## Pose Mapping

- idle, walk1, walk2 → idle, walk
- action1, action2 → punch
- kick, hurt → kick, hurt
