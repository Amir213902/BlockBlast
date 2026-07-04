import React, { useEffect, useMemo, useRef, useState } from "react";
import "./pages-styles/Game.css";
import iconBack from "../images/Icon_Back.svg";
import iconBest from "../images/Icon_Best Score.svg";
import iconSettings from "../images/Icon_Settings.svg";
import GameArena from "../components/GameArena";
import GameDropPanel from "../components/GameDropPanel";
import { createBlocks, createGrid, canPlace, placeShape, clearFullLines } from "../utils/gameUtils";
import { SCORE_PER_LINE, MOBILE_SCALE_WIDTH, DRAG_VISUAL_SHIFT } from "../utils/gameConfig";

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

  const activeBlock = blocks.find((block) => block && block.id === draggingBlockId) || null;

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
    const y = clientY - rect.top;
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
    updateHoverPosition(event.clientX, event.clientY - DRAG_VISUAL_SHIFT);
  };

  useEffect(() => {
    if (!draggingBlockId) {
      return undefined;
    }

    const handleMove = (event) => {
      event.preventDefault();
      setDragPosition({ x: event.clientX, y: event.clientY });
      updateHoverPosition(event.clientX, event.clientY - DRAG_VISUAL_SHIFT);
    };

    const handleUp = () => {
      const block = blocks.find((item) => item && item.id === draggingBlockId);
      if (block && hoverPosition.row >= 0 && hoverPosition.col >= 0 && canPlace(grid, block.shape, hoverPosition.row, hoverPosition.col)) {
        const nextGrid = placeShape(grid, block.shape, hoverPosition.row, hoverPosition.col);
        const { nextGrid: clearedGrid, clearedCount } = clearFullLines(nextGrid);
        const nextBlocks = blocks.map((item) => (item && item.id === block.id ? null : item));

        setGrid(clearedGrid);
        setScore((currentScore) => currentScore + clearedCount * SCORE_PER_LINE);
        setBlocks(nextBlocks.every((item) => item === null) ? createBlocks() : nextBlocks);
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
      <section className={`game${window.innerWidth < MOBILE_SCALE_WIDTH ? " scaled" : ""}`}>
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
          <GameArena grid={grid} preview={preview} arenaRef={arenaRef} />
          <GameDropPanel
            blocks={blocks}
            draggingBlockId={draggingBlockId}
            dragPosition={dragPosition}
            dragSize={dragSize}
            onPointerDown={handlePointerDown}
          />
        </div>
      </section>
    </>
  );
};

export default Game;
