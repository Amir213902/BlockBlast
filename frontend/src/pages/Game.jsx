import React, { useEffect, useMemo, useRef, useState } from "react";
import "./pages-styles/Game.css";
import iconBack from "../images/Icon_Back.svg";
import iconBest from "../images/Icon_Best Score.svg";
import iconSettings from "../images/Icon_Settings.svg";
import GameArena from "../components/GameArena";
import GameDropPanel from "../components/GameDropPanel";
import FloatingText from "../components/FloatingText";
import { createBlocks, createGrid, canPlace, placeShape, clearFullLines, canAnyBlockBePlaced } from "../utils/gameUtils";
import { SCORE_PER_LINE, MOBILE_SCALE_WIDTH, DRAG_VISUAL_SHIFT, MOBILE_DRAG_VISUAL_SHIFT } from "../utils/gameConfig";
import { playSoundClick, playSoundLineCleared, playSoundGameOver, playSoundBlockPlace } from "../utils/soundEffects";

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
  const [isGameOver, setIsGameOver] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [vibrating, setVibrating] = useState(false);
  const [clearedCells, setClearedCells] = useState(new Set());

  // Use mobile drag shift on small screens
  const dragShift = window.innerWidth < MOBILE_SCALE_WIDTH ? MOBILE_DRAG_VISUAL_SHIFT : DRAG_VISUAL_SHIFT;

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

  useEffect(() => {
    // Check for game over after grid or blocks change
    if (!canAnyBlockBePlaced(grid, blocks)) {
      setTimeout(() => setIsGameOver(true), 500);
    }
  }, [grid, blocks]);

  const handleGameOver = () => {
    playSoundGameOver();
    setIsGameOver(false);
    setGrid(createGrid());
    setBlocks(createBlocks());
    setScore(0);
    setFloatingTexts([]);
    setClearedCells(new Set());
  };

  const triggerVibration = () => {
    setVibrating(true);
    setTimeout(() => setVibrating(false), 400);
  };

  const addFloatingText = (x, y, text) => {
    const id = Date.now();
    setFloatingTexts((prev) => [...prev, { id, x, y, text }]);
  };

  const removeFloatingText = (id) => {
    setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
  };

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
    playSoundClick();
    setDraggingBlockId(blockId);
    setDragOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setDragSize({ width: rect.width, height: rect.height });
    setDragPosition({ x: event.clientX, y: event.clientY });
    updateHoverPosition(event.clientX, event.clientY - dragShift);
  };

  useEffect(() => {
    if (!draggingBlockId) {
      return undefined;
    }

    const handleMove = (event) => {
      event.preventDefault();
      setDragPosition({ x: event.clientX, y: event.clientY });
      updateHoverPosition(event.clientX, event.clientY - dragShift);
    };

    const handleUp = () => {
      const block = blocks.find((item) => item && item.id === draggingBlockId);
      if (block && hoverPosition.row >= 0 && hoverPosition.col >= 0 && canPlace(grid, block.shape, hoverPosition.row, hoverPosition.col)) {
          playSoundBlockPlace();
          const nextGrid = placeShape(grid, block.shape, hoverPosition.row, hoverPosition.col);
          const { nextGrid: clearedGrid, clearedCount } = clearFullLines(nextGrid);
          const nextBlocks = blocks.map((item) => (item && item.id === block.id ? null : item));

          setGrid(clearedGrid);
          
          if (clearedCount > 0) {
            playSoundLineCleared();
            triggerVibration();
            const points = clearedCount * SCORE_PER_LINE;
            addFloatingText(window.innerWidth / 2, window.innerHeight / 2, `+${points}`);
          } else {
            playSoundClick();
          }
          
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
          <div className={vibrating ? "vibrating" : ""} style={{ display: "inline-block" }}>
            <GameArena grid={grid} preview={preview} arenaRef={arenaRef} />
          </div>
          <GameDropPanel
            blocks={blocks}
            draggingBlockId={draggingBlockId}
            dragPosition={dragPosition}
            dragSize={dragSize}
            dragShift={dragShift}
            onPointerDown={handlePointerDown}
          />
        </div>
      </section>
      {floatingTexts.map((item) => (
        <FloatingText
          key={item.id}
          x={item.x}
          y={item.y}
          text={item.text}
          onAnimationEnd={() => removeFloatingText(item.id)}
        />
      ))}
      {isGameOver && (
        <div className="game-over-modal">
          <div className="game-over-content">
            <h2>Game Over</h2>
            <p>Ваш счёт: <span className="final-score">{score}</span></p>
            <button className="game-over-restart-btn" onClick={handleGameOver}>
              Начать заново
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Game;
