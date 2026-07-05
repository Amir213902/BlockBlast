import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages-styles/Game.css";
import iconBack from "../images/Icon_Back.svg";
import iconSettings from "../images/Icon_Settings.svg";
import iconCross from "../images/Icon_Cross.svg";
import GameArena from "../components/GameArena";
import GameDropPanel from "../components/GameDropPanel";
import FloatingText from "../components/FloatingText";
import { createBlocks, createGrid, canPlace, placeShape, clearFullLines, canAnyBlockBePlaced } from "../utils/gameUtils";
import { DRAG_Z_INDEX, GRID_SIZE, SCORE_PER_LINE, MOBILE_SCALE_WIDTH, DRAG_VISUAL_SHIFT, MOBILE_DRAG_VISUAL_SHIFT } from "../utils/gameConfig";
import { playSoundClick, playSoundLineCleared, playSoundGameOver, playSoundBlockPlace } from "../utils/soundEffects";

const THEME_KEY = "block-blast-theme";
const CUSTOM_THEME_KEY = "block-blast-custom-theme";
const BEST_SCORE_KEY = "block-blast-best-score";

const DEFAULT_CUSTOM_THEME = {
  arena: "#000D4D",
  emptyCell: "#15118E",
  block: "#2196F3",
  blockBorder: "#1976D2",
  dropBg: "#2D1196",
  dropBorder: "#6B4AFF",
};

const CUSTOM_THEME_FIELDS = [
  { key: "arena", label: "Арена" },
  { key: "emptyCell", label: "Клетки" },
  { key: "block", label: "Блоки" },
  { key: "blockBorder", label: "Грани" },
  { key: "dropBg", label: "Слоты" },
  { key: "dropBorder", label: "Рамка" },
];

const THEMES = [
  {
    id: "classic",
    name: "Классика",
    price: "Бесплатно",
    colors: ["#000D4D", "#15118E", "#2196F3"],
  },
  {
    id: "neon",
    name: "Неон",
    price: "120",
    colors: ["#08111F", "#10324A", "#00E5FF"],
  },
  {
    id: "candy",
    name: "Карамель",
    price: "180",
    colors: ["#2B124C", "#5A189A", "#FF4DCE"],
  },
  {
    id: "forest",
    name: "Лес",
    price: "220",
    colors: ["#072D21", "#0B5D3B", "#55D86A"],
  },
];

const getSavedTheme = () => {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  return savedTheme === "custom" || THEMES.some((theme) => theme.id === savedTheme) ? savedTheme : THEMES[0].id;
};

const getSavedCustomTheme = () => {
  try {
    return { ...DEFAULT_CUSTOM_THEME, ...JSON.parse(window.localStorage.getItem(CUSTOM_THEME_KEY)) };
  } catch {
    return DEFAULT_CUSTOM_THEME;
  }
};

const Game = () => {
  const navigate = useNavigate();
  const arenaRef = useRef(null);
  const [grid, setGrid] = useState(createGrid);
  const [blocks, setBlocks] = useState(createBlocks);
  const [draggingBlockId, setDraggingBlockId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ row: -1, col: -1 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [vibrating, setVibrating] = useState(false);
  const [isThemeShopOpen, setIsThemeShopOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("themes");
  const [selectedTheme, setSelectedTheme] = useState(getSavedTheme);
  const [customTheme, setCustomTheme] = useState(getSavedCustomTheme);
  const dragElementRef = useRef(null);
  const dragMetricsRef = useRef({
    offset: { x: 0, y: 0 },
    shapeOffset: { x: 0, y: 0 },
  });
  const hoverPositionRef = useRef({ row: -1, col: -1 });
  const pendingDragPointRef = useRef(null);
  const dragAnimationRef = useRef(null);
  const dragShapeRef = useRef(null);
  const arenaMetricsRef = useRef(null);

  // Use mobile drag shift on small screens
  const dragShift = window.innerWidth < MOBILE_SCALE_WIDTH ? MOBILE_DRAG_VISUAL_SHIFT : DRAG_VISUAL_SHIFT;

  const activeBlock = blocks.find((block) => block && block.id === draggingBlockId) || null;
  const customThemeVariables = useMemo(() => ({
    "--theme-arena": customTheme.arena,
    "--theme-empty-cell": customTheme.emptyCell,
    "--theme-block": customTheme.block,
    "--theme-block-border": customTheme.blockBorder,
    "--theme-drop-bg": `${customTheme.dropBg}CC`,
    "--theme-drop-border": customTheme.dropBorder,
  }), [customTheme]);
  const customThemeStyle = selectedTheme === "custom" ? customThemeVariables : undefined;

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
    const nextGrid = createGrid();
    setGrid(nextGrid);
    setBlocks(createBlocks(nextGrid));
    setScore(0);
    setFloatingTexts([]);
  };

  const selectTheme = (themeId) => {
    playSoundClick();
    setSelectedTheme(themeId);
    window.localStorage.setItem(THEME_KEY, themeId);
  };

  const updateCustomTheme = (key, value) => {
    const nextTheme = { ...customTheme, [key]: value };
    setCustomTheme(nextTheme);
    setSelectedTheme("custom");
    window.localStorage.setItem(THEME_KEY, "custom");
    window.localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(nextTheme));
  };

  const resetCustomTheme = () => {
    setCustomTheme(DEFAULT_CUSTOM_THEME);
    setSelectedTheme("custom");
    window.localStorage.setItem(THEME_KEY, "custom");
    window.localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(DEFAULT_CUSTOM_THEME));
  };

  useEffect(() => {
    const savedBestScore = Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
    if (score > savedBestScore) {
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
    }
  }, [score]);

  useEffect(() => {
    const settings = new URLSearchParams(window.location.search).get("settings");
    if (settings === "themes" || settings === "custom") {
      setIsThemeShopOpen(true);
      setSettingsTab(settings);
      if (settings === "custom") {
        setSelectedTheme("custom");
        window.localStorage.setItem(THEME_KEY, "custom");
      }
    }
  }, []);

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

  const getHoverPosition = useCallback((clientX, clientY, shape) => {
    const arena = arenaRef.current;
    const arenaMetrics = arenaMetricsRef.current;
    if ((!arena && !arenaMetrics) || !shape) {
      return { row: -1, col: -1 };
    }

    const metrics = arenaMetrics || (() => {
      const rect = arena.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        cellWidth: rect.width / GRID_SIZE,
        cellHeight: rect.height / GRID_SIZE,
      };
    })();
    const { offset, shapeOffset } = dragMetricsRef.current;
    const shapeCenterX = clientX - offset.x + shapeOffset.x;
    const shapeCenterY = clientY - offset.y - dragShift + shapeOffset.y;
    const x = shapeCenterX - metrics.left;
    const y = shapeCenterY - metrics.top;
    if (x < 0 || y < 0 || x > metrics.width || y > metrics.height) {
      return { row: -1, col: -1 };
    }

    const shapeWidth = Math.max(...shape.map((shapeRow) => shapeRow.length));
    const shapeHeight = shape.length;
    const col = Math.round(x / metrics.cellWidth - shapeWidth / 2);
    const row = Math.round(y / metrics.cellHeight - shapeHeight / 2);
    return { row, col };
  }, [dragShift]);

  const updateHoverPosition = useCallback((clientX, clientY, shape) => {
    const nextPosition = getHoverPosition(clientX, clientY, shape);
    const currentPosition = hoverPositionRef.current;
    if (nextPosition.row !== currentPosition.row || nextPosition.col !== currentPosition.col) {
      hoverPositionRef.current = nextPosition;
      setHoverPosition(nextPosition);
    }
  }, [getHoverPosition]);

  const moveDraggedElement = useCallback((clientX, clientY) => {
    const element = dragElementRef.current;
    if (!element) {
      return;
    }

    const { offset } = dragMetricsRef.current;
    const x = clientX - offset.x;
    const y = clientY - offset.y - dragShift;
    element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.4)`;
  }, [dragShift]);

  const scheduleDragUpdate = useCallback((clientX, clientY, shape) => {
    pendingDragPointRef.current = { x: clientX, y: clientY, shape };
    if (dragAnimationRef.current) {
      return;
    }

    dragAnimationRef.current = window.requestAnimationFrame(() => {
      dragAnimationRef.current = null;
      const point = pendingDragPointRef.current;
      if (point) {
        moveDraggedElement(point.x, point.y);
        updateHoverPosition(point.x, point.y, point.shape);
      }
    });
  }, [moveDraggedElement, updateHoverPosition]);

  const resetDraggedElement = useCallback(() => {
    if (dragAnimationRef.current) {
      window.cancelAnimationFrame(dragAnimationRef.current);
      dragAnimationRef.current = null;
    }
    pendingDragPointRef.current = null;
    dragShapeRef.current = null;
    arenaMetricsRef.current = null;

    const element = dragElementRef.current;
    if (element) {
      element.classList.remove("dragging");
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      element.style.width = "";
      element.style.height = "";
      element.style.zIndex = "";
      element.style.cursor = "";
      element.style.transform = "";
      element.style.contain = "";
    }
    dragElementRef.current = null;
  }, []);

  const handlePointerDown = (event, blockId) => {
    event.preventDefault();
    const target = event.currentTarget;
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
    const rect = target.getBoundingClientRect();
    const block = blocks.find((item) => item && item.id === blockId);
    if (!block) {
      return;
    }

    const pointerOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const shapeElement = target.querySelector(".game_container_drops_item_container");
    const shapeRect = shapeElement.getBoundingClientRect();
    const shapeOffset = {
      x: shapeRect.left + shapeRect.width / 2 - rect.left,
      y: shapeRect.top + shapeRect.height / 2 - rect.top,
    };
    dragElementRef.current = target;
    dragShapeRef.current = block.shape;
    dragMetricsRef.current = { offset: pointerOffset, shapeOffset };
    if (arenaRef.current) {
      const arenaRect = arenaRef.current.getBoundingClientRect();
      arenaMetricsRef.current = {
        left: arenaRect.left,
        top: arenaRect.top,
        width: arenaRect.width,
        height: arenaRect.height,
        cellWidth: arenaRect.width / GRID_SIZE,
        cellHeight: arenaRect.height / GRID_SIZE,
      };
    }
    target.style.position = "fixed";
    target.style.left = "0";
    target.style.top = "0";
    target.style.width = `${rect.width}px`;
    target.style.height = `${rect.height}px`;
    target.style.zIndex = DRAG_Z_INDEX;
    target.style.cursor = "grabbing";
    target.style.contain = "layout paint style";
    moveDraggedElement(event.clientX, event.clientY);

    playSoundClick();
    setDraggingBlockId(blockId);
    hoverPositionRef.current = { row: -1, col: -1 };
    setHoverPosition({ row: -1, col: -1 });
  };

  useEffect(() => {
    if (!draggingBlockId) {
      return undefined;
    }

    const handleMove = (event) => {
      event.preventDefault();
      scheduleDragUpdate(event.clientX, event.clientY, dragShapeRef.current);
    };

    const handleUp = (event) => {
      const block = blocks.find((item) => item && item.id === draggingBlockId);
      const dropPosition = block ? getHoverPosition(event.clientX, event.clientY, block.shape) : hoverPositionRef.current;
      if (block && dropPosition.row >= 0 && dropPosition.col >= 0 && canPlace(grid, block.shape, dropPosition.row, dropPosition.col)) {
          playSoundBlockPlace();
          const nextGrid = placeShape(grid, block.shape, dropPosition.row, dropPosition.col);
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
        setBlocks(nextBlocks.every((item) => item === null) ? createBlocks(clearedGrid) : nextBlocks);
      }
      resetDraggedElement();
      setDraggingBlockId(null);
      hoverPositionRef.current = { row: -1, col: -1 };
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
  }, [draggingBlockId, blocks, grid, getHoverPosition, scheduleDragUpdate, resetDraggedElement]);

  return (
    <>
      <section
        className={`game${window.innerWidth < MOBILE_SCALE_WIDTH ? " scaled" : ""}`}
        data-theme={selectedTheme}
        style={customThemeStyle}
      >
        <div className="game_gradient" aria-hidden="true" />
        <div className="game_blocks" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="game_navigations">
          <button className="game_navigations_go home" onClick={() => navigate("/")}>
            <img src={iconBack} alt="" />
          </button>

          <div className="game_navigations_indicator record">
            <span>{score}</span>
          </div>

          <button className="game_navigations_go settings" id="settings" onClick={() => setIsThemeShopOpen(true)}>
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
      {isThemeShopOpen && (
        <section className="theme-shop open" aria-label="Theme shop">
          <div className="theme-shop_modal">
            <div className="theme-shop_header">
              <h2 className="theme-shop_title">Настройки</h2>
              <button className="theme-shop_close" onClick={() => setIsThemeShopOpen(false)} aria-label="Close theme shop">
                <img src={iconCross} alt="" />
              </button>
            </div>
            <div className="settings-tabs" role="tablist" aria-label="Settings tabs">
              <button className={settingsTab === "themes" ? "active" : ""} onClick={() => setSettingsTab("themes")}>
                Темы
              </button>
              <button
                className={settingsTab === "custom" ? "active" : ""}
                onClick={() => {
                  setSettingsTab("custom");
                  selectTheme("custom");
                }}
              >
                Своя арена
              </button>
            </div>
            {settingsTab === "themes" ? (
              <div className="theme-shop_grid">
                {THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      className={`theme-card ${isSelected ? "selected" : ""}`}
                      onClick={() => selectTheme(theme.id)}
                    >
                      <span className="theme-card_preview" aria-hidden="true">
                        {theme.colors.map((color) => (
                          <span key={color} className="theme-card_swatch" style={{ backgroundColor: color }} />
                        ))}
                      </span>
                      <span className="theme-card_info">
                        <strong>{theme.name}</strong>
                        <small>{isSelected ? "Выбрано" : theme.price}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="customizer_panel" style={customThemeVariables}>
                <div className="customizer_preview" aria-hidden="true">
                  <span className="customizer_preview_arena">
                    <span />
                    <span />
                    <span />
                    <span className="filled" />
                  </span>
                  <span className="customizer_preview_block">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
                <div className="customizer_controls">
                  {CUSTOM_THEME_FIELDS.map((field) => (
                    <label key={field.key} className="customizer_control">
                      <span>{field.label}</span>
                      <input
                        type="color"
                        value={customTheme[field.key]}
                        onChange={(event) => updateCustomTheme(field.key, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <button className="customizer_reset" onClick={resetCustomTheme}>
                  Сбросить
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default Game;
