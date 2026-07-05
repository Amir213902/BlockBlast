import { GRID_SIZE, BLOCK_COUNT, BLOCK_SHAPES } from "./gameConfig";

export const createGrid = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
export const randomShape = () => BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
const shapeKey = (shape) => shape.map((row) => row.join("")).join("|");
const shapeCellCount = (shape) => shape.flat().filter(Boolean).length;
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const getGridFillRatio = (grid) => {
  const filledCells = grid.flat().filter(Boolean).length;
  return filledCells / (GRID_SIZE * GRID_SIZE);
};

const SHAPE_GROUPS = {
  small: BLOCK_SHAPES.filter((shape) => shapeCellCount(shape) <= 3),
  medium: BLOCK_SHAPES.filter((shape) => shapeCellCount(shape) >= 4 && shapeCellCount(shape) <= 5),
  large: BLOCK_SHAPES.filter((shape) => shapeCellCount(shape) >= 6),
};

const shuffle = (items) => {
  const nextItems = items.slice();
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [nextItems[randomIndex], nextItems[index]];
  }
  return nextItems;
};

const getShapePlan = (grid) => {
  const fillRatio = getGridFillRatio(grid);

  if (fillRatio > 0.7) {
    return ["small", "small", "medium"];
  }

  if (fillRatio > 0.45) {
    return ["small", "medium", "medium"];
  }

  return ["small", "medium", "large"];
};

const pickShapeFromGroup = (groupName, usedKeys) => {
  const group = SHAPE_GROUPS[groupName]?.length ? SHAPE_GROUPS[groupName] : BLOCK_SHAPES;
  const availableShapes = group.filter((shape) => !usedKeys.has(shapeKey(shape)));
  const shape = randomItem(availableShapes.length ? availableShapes : group);
  usedKeys.add(shapeKey(shape));
  return shape;
};

export const createBlock = (index, shape = randomShape()) => ({
  id: `block-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
  shape,
});

const createBalancedBlocks = (grid) => {
  const usedKeys = new Set();
  const shapes = getShapePlan(grid).map((groupName) => pickShapeFromGroup(groupName, usedKeys));
  return shuffle(shapes).map((shape, index) => createBlock(index, shape));
};

export const createBlocks = (grid = createGrid()) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const blocks = createBalancedBlocks(grid);
    if (canAnyBlockBePlaced(grid, blocks)) {
      return blocks;
    }
  }

  const playableShape = BLOCK_SHAPES.find((shape) => canBlockBePlaced(grid, shape)) || randomShape();
  const fallbackBlocks = createBalancedBlocks(grid);
  return fallbackBlocks.map((block, index) => (index === 0 ? createBlock(index, playableShape) : block));
};

export const canBlockBePlaced = (grid, shape) => {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (canPlace(grid, shape, row, col)) {
        return true;
      }
    }
  }
  return false;
};

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
