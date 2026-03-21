# Changelog

## WIP

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
