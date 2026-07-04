import { GRID_SIZE, BLOCK_COUNT, DRAG_VISUAL_SHIFT, BLOCK_SHAPES } from "./gameConfig";

export const createGrid = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
export const randomShape = () => BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
export const createBlocks = () =>
  Array.from({ length: BLOCK_COUNT }, (_, index) => ({ id: `block-${Date.now()}-${index}`, shape: randomShape() }));

// Check if any valid block placement exists on the grid
export const canAnyBlockBePlaced = (grid, blocks) => {
  const validBlocks = blocks.filter((block) => block !== null);
  if (validBlocks.length === 0) {
    return false;
  }

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      for (const block of validBlocks) {
        if (canPlace(grid, block.shape, row, col)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const canPlace = (grid, shape, row, col) => {
  for (let r = 0; r < shape.length; r += 1) {
    for (let c = 0; c < shape[r].length; c += 1) {
      if (shape[r][c]) {
        const newRow = row + r;
        const newCol = col + c;
        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE || grid[newRow][newCol]) {
          return false;
        }
      }
    }
  }
  return true;
};

export const placeShape = (grid, shape, row, col) => {
  const nextGrid = grid.map((gridRow) => gridRow.slice());
  shape.forEach((shapeRow, r) => {
    shapeRow.forEach((cell, c) => {
      if (cell) {
        nextGrid[row + r][col + c] = 1;
      }
    });
  });
  return nextGrid;
};

export const clearFullLines = (grid) => {
  const nextGrid = grid.map((row) => row.slice());
  const rowsToClear = nextGrid.map((row) => row.every((cell) => cell === 1));
  const colsToClear = Array.from({ length: GRID_SIZE }, (_, col) => nextGrid.every((row) => row[col] === 1));
  let clearedCount = 0;

  nextGrid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if ((rowsToClear[rowIndex] || colsToClear[colIndex]) && nextGrid[rowIndex][colIndex] === 1) {
        nextGrid[rowIndex][colIndex] = 0;
        clearedCount += 1;
      }
    });
  });

  return { nextGrid, clearedCount };
};
