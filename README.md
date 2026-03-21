# Zenith Fighters

A 2D arcade fighting game for the browser, inspired by Street Fighter. Play against a friend on one computer or fight against an AI opponent.

## Tech Stack

- **Phaser 3** - 2D game engine (physics, sprites, input, audio)
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended). Use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage versions. The project includes an `.nvmrc` file.

### Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Build for Production

```bash
npm run build
```

Output is written to the `dist/` folder.

## Controls (Placeholder)

- **SPACE** - Progress through menus and placeholder actions

Controller and keyboard controls will be implemented in future updates.

## Project Structure

- `src/main.ts` - Entry point
- `src/game/` - Game logic, scenes, entities, systems
- `public/assets/` - Sprites, UI, audio, backgrounds
