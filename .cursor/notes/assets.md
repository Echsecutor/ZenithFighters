# Assets

## Favicon

- `public/favicon.ico` — multi-size ICO (16×16 and 32×32); head region cropped from the first cell of `public/assets/characters/player.png` (sheet is 9×3, cell size 80×110). Linked in root `index.html`.

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

## Optional third-party attack / VFX sprites (research)

Not bundled; useful if replacing procedural specials or adding dedicated pose sheets. **Confirm license on each page before use.**

- [Fireball projectile (CC0)](https://opengameart.org/content/fireball-projectile) — fire / zone VFX reference
- [Icicle spell](https://opengameart.org/content/icicle-spell) — ice-style projectiles (CC-BY 3.0; attribution required)
- [16×16 weapon sprites (CC0)](https://opengameart.org/content/16x16-weapon-sprites-free) — includes boomerang variants (Bennyboi_hack)
- [CC0 ranged icons](https://opengameart.org/content/cc0-ranged-icons) — includes a boomerang icon (AntumDeluge / Fleurman)
- [Set of pixel art projectiles (CC0)](https://opengameart.org/content/set-of-pixel-art-projectiles) — mixed small projectiles
- [NYKNCK fireball / pixel effect packs (itch.io)](https://nyknck.itch.io/fireball-animation) — check per-page license

In-repo: Kenney punch pose for all specials; `FightScene.ensureSpecialTextures` generates `special_ice`, `special_boomerang`, `special_slug`. **Ground hazards** (`GroundHazard`): 8-frame procedural loops + Phaser anims from `FightScene.ensureHazardTextures` (`hazard_fire_f*`, `hazard_toxic_f*`); fire uses **additive** blend. Optional higher-quality **PNG / sheet** replacements (confirm license before bundling):

- [Kenney — Particle Pack](https://kenney.nl/assets/particle-pack) (CC0) — fire, smoke, sparks, magic; PNG + vectors
- [Kenney — Smoke Particles](https://kenney.nl/assets/smoke-particles) (CC0) — stacks with fire for ground patches
- [OpenGameArt — Particle Pack mirror](https://opengameart.org/content/particle-pack-80-sprites) (CC0)
- [OpenGameArt — N64 Fire](https://opengameart.org/content/n64-fire) (CC0) — small looping fire tiles, multiple palettes
- [OpenGameArt — Fire Loop](https://opengameart.org/content/fire-loop) — check page license (not always CC0)
- [OpenGameArt — 2D Pixel Fire Sprite Strip](https://opengameart.org/content/2d-pixel-fire-sprite-strip) — spell-style flames; verify license
- Toxic / acid pools are rarer as dedicated loops; search OGA for “acid”, “poison pool”, “slime”; or tint Kenney smoke + magic particles green

## Pose Mapping

- idle, walk1, walk2 → idle, walk
- action1, action2 → punch
- kick, hurt → kick, hurt
