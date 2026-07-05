# BlockBlast

BlockBlast is a browser puzzle game inspired by block-placement games. The player places generated shapes on an 8x8 arena, clears full rows and columns, earns points, and tries to beat the best score.

The project is built as a React + Vite app and is prepared as a PWA, so it can work offline after installation.

## Features

- 8x8 block arena with drag-and-drop placement.
- Row and column clearing with score rewards.
- Best score saved locally in the browser.
- Game-over detection when no available block can be placed.
- Animated home and game backgrounds.
- Theme shop and custom arena styling in settings.
- Offline indicator and service worker caching.
- PWA manifest with application icon.

## Tech Stack

- React
- Vite
- React Router
- dnd-kit
- ESLint
- Web Audio API for generated sound effects

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Project Structure

```text
src/
  components/       Reusable game and UI components
  images/           SVG logos, icons, and decoration assets
  pages/            Home, game, and fallback pages
  utils/            Game rules, constants, block generation, and sounds
public/
  manifest.json     PWA metadata
  sw.js             Service worker
  app-logo.svg      PWA and favicon logo
```

## PWA Notes

The app includes a manifest and service worker. After the production build is served, the browser can cache the app shell and static assets, allowing the game to reopen without a network connection.

If the app was already installed before icon or cache changes, reinstalling it may be needed for the operating system to refresh the icon.
