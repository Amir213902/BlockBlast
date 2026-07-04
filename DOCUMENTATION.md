# BlockBlast Project Documentation

## Overview
BlockBlast is a React-based browser game inspired by Block Blast mechanics. The current repository contains:

- `frontend/` - React + Vite frontend application with the playable game UI.
- `backend/` - Minimal Express backend scaffold.
- `designimplementation/` - Design mockups and implementation reference files.
- `index.html` - Top-level HTML in the repository root.

The game is designed to be a school project with the goal of creating a competitive multiplayer-like block placement game.

## Current Project Structure

### Root
- `README.md` - project description and high-level goals.
- `BlockBlast/` - main working repository with frontend, backend, and design files.
- `mvpFrontend/` - an earlier or alternate frontend prototype using Vite.

### `BlockBlast/BlockBlast`
- `frontend/` - main playable application.
- `backend/` - Express server skeleton.
- `designimplementation/` - additional implementation assets.

### `frontend/`
- `src/` - application source code.
  - `pages/Game.jsx` - main game screen and drag/drop logic.
  - `pages/pages-styles/Game.css` - core game styling.
  - `components/` - reusable UI components and router setup.
  - `routes.jsx` - application routes configuration.
- `package.json` - frontend dependencies and scripts.
- `vite.config.js` - Vite configuration.

## Technology Stack

### Frontend
- React 19
- Vite
- React Router DOM
- MobX + mobx-react-lite
- `@dnd-kit/core` is present as a dependency, but manual pointer drag logic is used in `Game.jsx`.
- ESLint for linting

### Backend
- Node.js
- Express
- CORS support (via `cors` dependency)

## How to Run

### Frontend
1. Open terminal in `BlockBlast/BlockBlast/frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open the served URL in the browser (usually `http://127.0.0.1:5173`).

### Backend
1. Open terminal in `BlockBlast/BlockBlast/backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend manually with node:
   ```bash
   node index.js
   ```

> Note: the backend is currently a minimal Express skeleton and may not be connected to the frontend.

## Key Features and Behavior

### Drag and Drop Behavior
- Blocks appear in a drop area below the arena.
- The original draggable block is moved while dragging.
- The block is visually elevated above the cursor by a fixed offset during drag.
- The source slot remains in place and can be rendered as an empty slot while the block is being dragged.
- Arena cell preview highlights valid or invalid placement positions.

### Gameplay Logic
- The arena is an 8x8 grid.
- Blocks are defined by simple shape arrays stored in `Game.jsx`.
- Placement validation is handled by `canPlace`.
- The block is added to the arena when released on a valid location.
- Full rows and columns are cleared by `clearFullLines`.
- Score increases based on cleared blocks.

## Important Files

- `frontend/src/pages/Game.jsx` - the main game implementation, including drag/drop logic and arena placement.
- `frontend/src/pages/pages-styles/Game.css` - game styling.
- `frontend/src/components/AppRouter.jsx` - routing container.
- `frontend/src/routes.jsx` - route definitions.
- `backend/package.json` - backend dependencies.

## Development Notes

- The current game UI is built with vanilla React components and simple CSS rather than a full drag-and-drop library.
- There is a manual drag implementation in `Game.jsx` using pointer events and fixed positioning.
- The block placement preview logic has been updated to account for visual drag offset.

## Future Improvements

Suggested next steps and enhancements:

- Add multiplayer or room-based matching.
- Implement full backend API and WebSocket support.
- Convert the frontend to TypeScript for stronger type safety.
- Add sound and visual effects for placement and line clear events.
- Improve mobile touch support for drag interactions.
- Add user authentication and private rooms.
- Add tests for game logic and drag/drop behavior.

## Notes

This documentation is intended to support current development and provide a reference for key game mechanics and repository structure.
