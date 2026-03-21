# Zenith Fighters

Zenith Fighters is a browser-based 2D arcade fighting game: two players on one machine use keyboards and/or gamepads, choose fighters from a Kenney-derived roster, then battle on a neon-style arena with health bars, hit reactions, and a victory screen. AI and online multiplayer are not implemented.

## Repository overview

- **Stack**: Phaser 3, TypeScript, Vite, ESLint. The app is a single client bundle: game code under `src/game/`, static assets under `public/`.
- **Flow**: Boot (asset preload) → main menu → character select → fight → victory → main menu.
- **More detail**: `Changelog.md` for release history. `.cursor/notes/` holds short internal notes for contributors.
- **CI / deployment**: No pipeline configs or hosted demo URL in this repo; run locally or serve the `dist/` output from `npm run build`.

## Usage

### Deployed stages

None are defined here. Use local development below or host `dist/` yourself.

### Local development

**Prerequisites**

- Node.js 18 or newer (`package.json` `engines`). Use `.nvmrc` with nvm if you like.

**Install and run**

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

Sprites, audio, and textures ship under `public/assets/` in this repository; third-party sources are listed in **Acknowledgements** below.

**Other commands**

```bash
npm run build    # output to dist/
npm run preview  # preview production build
npm run lint
```

## Controls

**Menus**

- **SPACE** — main menu; start fight from character select; leave victory screen

**Character select**

- **Player 1** — `A` / `D` cycle the roster
- **Player 2** — `←` / `→` cycle the roster

**Fight (keyboard)**

- **Player 1** — `W` `A` `S` `D` move; `R` punch; `F` kick; `W` jump
- **Player 2** — arrows move; `O` punch; `L` kick; `↑` jump

**Fight (gamepad)** — Player 1 uses pad 0, player 2 pad 1: left stick to move, **A** punch, **B** kick, **X** jump (see `src/game/systems/InputManager.ts`).

## Project layout

- `src/main.ts` — Vite entry
- `src/game/main.ts`, `src/game/config.ts` — Phaser bootstrap and config
- `src/game/scenes/` — Boot, MainMenu, CharacterSelect, Fight, Victory
- `src/game/entities/` — `Fighter`
- `src/game/systems/` — `InputManager`, `PhysicsManager`
- `src/game/data/` — character definitions, asset paths
- `public/assets/` — sprites, audio, backgrounds (vendored; see Acknowledgements)

## Acknowledgements

- **Platformer Characters 1** by [Kenney](https://kenney.nl) (Kenney.nl)  
  CC0 (Public Domain). Character sprites.  
  [OpenGameArt](https://opengameart.org/content/platformer-characters-1-5-characters) · [Kenney.nl](https://kenney.nl/assets/platformer-characters)

- **Arcade Floor Neon** by Fupi  
  CC0 (Public Domain). Tiled neon carpet texture for the fight floor.  
  [OpenGameArt](https://opengameart.org/content/arcade-floor-neon)

- Fight **sky/backdrop** is drawn in code (gradient + grid); no image asset.

- **Crimson Voltage Rising** (fight background music) - AI generated with Suno V5



## License

Copyright 2026 Jonathan, und Sebastian Schmittner <sebastian@schmittner.pw>

<a href="https://www.gnu.org/licenses/agpl-3.0.html">
<img alt="AGPLV3" style="border-width:0" src="https://www.gnu.org/graphics/agplv3-with-text-162x68.png" /><br />

All code published in this repository is free software: you can redistribute it and/or modify it under the terms of the Afero
GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

See https://www.gnu.org/licenses/agpl-3.0.html
</a>