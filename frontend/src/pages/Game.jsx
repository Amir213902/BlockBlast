import React, { useEffect, useMemo, useRef, useState } from "react";
import "./pages-styles/Game.css";
import iconBack from "../images/Icon_Back.svg";
import iconBest from "../images/Icon_Best Score.svg";
import iconSettings from "../images/Icon_Settings.svg";

const BLOCK_SHAPES = [
  [[1]],
  [[1, 1]],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [[1], [1], [1]],
];

const createGrid = () => Array.from({ length: 8 }, () => Array(8).fill(0));
const randomShape = () => BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
const createBlocks = () =>
  Array.from({ length: 3 }, (_, index) => ({ id: `block-${Date.now()}-${index}`, shape: randomShape() }));

const DRAG_VISUAL_SHIFT = 40;

const canPlace = (grid, shape, row, col) => {
  for (let r = 0; r < shape.length; r += 1) {
    for (let c = 0; c < shape[r].length; c += 1) {
      if (shape[r][c]) {
        const newRow = row + r;
        const newCol = col + c;
        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8 || grid[newRow][newCol]) {
          return false;
        }
      }
    }
  }
  return true;
};

const placeShape = (grid, shape, row, col) => {
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

const clearFullLines = (grid) => {
  const nextGrid = grid.map((row) => row.slice());
  const rowsToClear = nextGrid.map((row) => row.every((cell) => cell === 1));
  const colsToClear = Array.from({ length: 8 }, (_, col) => nextGrid.every((row) => row[col] === 1));
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

const DraggableBlock = ({ block, onPointerDown, isDragging, dragStyle }) => (
  <div className="game_container_drops_port">
    <div
      className={`game_container_drops_item ${isDragging ? "dragging" : ""}`}
      style={{ opacity: isDragging ? 0.95 : 1, touchAction: "none", ...dragStyle }}
      onPointerDown={(event) => onPointerDown(event, block.id)}
    >
      <div
        className="game_container_drops_item_container"
        style={{
          gridTemplateColumns: `repeat(${block.shape[0].length}, auto)`,
          gridTemplateRows: `repeat(${block.shape.length}, auto)`,
        }}
      >
        {block.shape.flat().map((cell, cellIndex) => (
          <div key={cellIndex} className={cell ? "block-cell" : "block-cell empty"} />
        ))}
      </div>
    </div>
  </div>
);


const ArenaCell = ({ previewClass }) => (
  <div className={`game_container_arena_item ${previewClass}`}>
    <div className="arena-cell-inner" />
  </div>
);

const Game = () => {
  const arenaRef = useRef(null);
  const [grid, setGrid] = useState(createGrid);
  const [blocks, setBlocks] = useState(createBlocks);
  const [draggingBlockId, setDraggingBlockId] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragSize, setDragSize] = useState({ width: 0, height: 0 });
  const [hoverPosition, setHoverPosition] = useState({ row: -1, col: -1 });
  const [score, setScore] = useState(0);

  const activeBlock = blocks.find((block) => block.id === draggingBlockId) || null;

  const preview = useMemo(() => {
    if (!activeBlock || hoverPosition.row < 0) {
      return null;
    }

    const valid = canPlace(grid, activeBlock.shape, hoverPosition.row, hoverPosition.col);
    const cells = new Set();

    activeBlock.shape.forEach((shapeRow, r) => {
      shapeRow.forEach((cell, c) => {
        if (cell) {
          cells.add(`${hoverPosition.row + r}:${hoverPosition.col + c}`);
        }
      });
    });

    return { valid, cells };
  }, [activeBlock, grid, hoverPosition]);

  const updateHoverPosition = (clientX, clientY) => {
    const arena = arenaRef.current;
    if (!arena) {
      setHoverPosition({ row: -1, col: -1 });
      return;
    }

    const rect = arena.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top - DRAG_VISUAL_SHIFT;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setHoverPosition({ row: -1, col: -1 });
      return;
    }

    const col = Math.floor((x / rect.width) * 8);
    const row = Math.floor((y / rect.height) * 8);
    setHoverPosition({ row, col });
  };

  const handlePointerDown = (event, blockId) => {
    event.preventDefault();
    const target = event.currentTarget;
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
    const rect = target.getBoundingClientRect();
    setDraggingBlockId(blockId);
    setDragOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setDragSize({ width: rect.width, height: rect.height });
    setDragPosition({ x: event.clientX, y: event.clientY });
    updateHoverPosition(event.clientX, event.clientY);
  };

  useEffect(() => {
    if (!draggingBlockId) {
      return undefined;
    }

    const handleMove = (event) => {
      event.preventDefault();
      setDragPosition({ x: event.clientX, y: event.clientY });
      updateHoverPosition(event.clientX, event.clientY);
    };

    const handleUp = () => {
      const block = blocks.find((item) => item.id === draggingBlockId);
      if (block && hoverPosition.row >= 0 && hoverPosition.col >= 0 && canPlace(grid, block.shape, hoverPosition.row, hoverPosition.col)) {
        const nextGrid = placeShape(grid, block.shape, hoverPosition.row, hoverPosition.col);
        const { nextGrid: clearedGrid, clearedCount } = clearFullLines(nextGrid);
        const remainingBlocks = blocks.filter((item) => item.id !== block.id);

        setGrid(clearedGrid);
        setScore((currentScore) => currentScore + clearedCount * 100);
        setBlocks(remainingBlocks.length ? remainingBlocks : createBlocks());
      }
      setDraggingBlockId(null);
      setDragPosition(null);
      setDragOffset({ x: 0, y: 0 });
      setHoverPosition({ row: -1, col: -1 });
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [draggingBlockId, hoverPosition, blocks, grid]);

  return (
    <>
      <section className={`game${window.innerWidth < 500 ? " scaled" : ""}`}>
        <div className="game_navigations">
          <button className="game_navigations_go home">
            <img src={iconBack} alt="" />
          </button>

          <div className="game_navigations_indicator record">
            <img src={iconBest} alt="" className="game_navigations_indicator_img record" />
            <span>{score}</span>
          </div>

          <button className="game_navigations_go settings" id="settings">
            <img src={iconSettings} alt="" />
          </button>
        </div>

        <div className="game_container">
          <div className="game_container_arena" id="game_container_arena" ref={arenaRef}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const previewKey = `${rowIndex}:${colIndex}`;
                const isPreview = preview?.cells.has(previewKey);
                const previewClass = `${cell ? "filled" : ""} ${isPreview ? (preview.valid ? "highlight" : "invalid") : ""}`.trim();

                return <ArenaCell key={previewKey} row={rowIndex} col={colIndex} previewClass={previewClass} />;
              }),
            )}
          </div>

          <div className="game_container_drops" id="game_container_drops">
            {blocks.map((block) => {
              const isDragging = draggingBlockId === block.id;
              const dragStyle = isDragging && dragPosition ? {
                position: "fixed",
                left: `${dragPosition.x - dragOffset.x}px`,
                top: `${dragPosition.y - dragOffset.y - DRAG_VISUAL_SHIFT}px`,
                width: `${dragSize.width}px`,
                height: `${dragSize.height}px`,
                zIndex: 10001,
                cursor: "grabbing",
              } : undefined;

              return (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  isDragging={isDragging}
                  dragStyle={dragStyle}
                  onPointerDown={handlePointerDown}
                />
              );
            })}
          </div>

          <div className="game_instructions">
            {activeBlock ? "Перетащите блок на свободное место арены" : "Потяните блок ниже на поле"}
          </div>
        </div>
      </section>
    </>
  );
};

export default Game;
