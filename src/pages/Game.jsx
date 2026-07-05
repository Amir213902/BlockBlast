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
import { GRID_SIZE, SCORE_PER_LINE, MOBILE_SCALE_WIDTH, DRAG_VISUAL_SHIFT, MOBILE_DRAG_VISUAL_SHIFT } from "../utils/gameConfig";
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
  const [dragPosition, setDragPosition] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragShapeOffset, setDragShapeOffset] = useState({ x: 0, y: 0 });
  const [dragSize, setDragSize] = useState({ width: 0, height: 0 });
  const [hoverPosition, setHoverPosition] = useState({ row: -1, col: -1 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [vibrating, setVibrating] = useState(false);
  const [isThemeShopOpen, setIsThemeShopOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("themes");
  const [selectedTheme, setSelectedTheme] = useState(getSavedTheme);
  const [customTheme, setCustomTheme] = useState(getSavedCustomTheme);

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
    if (!arena || !shape) {
      return { row: -1, col: -1 };
    }

    const rect = arena.getBoundingClientRect();
    const shapeCenterX = clientX - dragOffset.x + dragShapeOffset.x;
    const shapeCenterY = clientY - dragOffset.y - dragShift + dragShapeOffset.y;
    const x = shapeCenterX - rect.left;
    const y = shapeCenterY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return { row: -1, col: -1 };
    }

    const shapeWidth = Math.max(...shape.map((shapeRow) => shapeRow.length));
    const shapeHeight = shape.length;
    const cellWidth = rect.width / GRID_SIZE;
    const cellHeight = rect.height / GRID_SIZE;
    const col = Math.round(x / cellWidth - shapeWidth / 2);
    const row = Math.round(y / cellHeight - shapeHeight / 2);
    return { row, col };
  }, [dragOffset, dragShapeOffset, dragShift]);

  const updateHoverPosition = useCallback((clientX, clientY, shape) => {
    setHoverPosition(getHoverPosition(clientX, clientY, shape));
  }, [getHoverPosition]);

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

    playSoundClick();
    setDraggingBlockId(blockId);
    setDragOffset(pointerOffset);
    setDragShapeOffset(shapeOffset);
    setDragSize({ width: rect.width, height: rect.height });
    setDragPosition({ x: event.clientX, y: event.clientY });
    setHoverPosition({ row: -1, col: -1 });
  };

  useEffect(() => {
    if (!draggingBlockId) {
      return undefined;
    }

    const handleMove = (event) => {
      event.preventDefault();
      const block = blocks.find((item) => item && item.id === draggingBlockId);
      setDragPosition({ x: event.clientX, y: event.clientY });
      updateHoverPosition(event.clientX, event.clientY, block?.shape);
    };

    const handleUp = (event) => {
      const block = blocks.find((item) => item && item.id === draggingBlockId);
      const dropPosition = block ? getHoverPosition(event.clientX, event.clientY, block.shape) : hoverPosition;
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
      setDraggingBlockId(null);
      setDragPosition(null);
      setDragOffset({ x: 0, y: 0 });
      setDragShapeOffset({ x: 0, y: 0 });
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
  }, [draggingBlockId, hoverPosition, blocks, grid, getHoverPosition, updateHoverPosition]);

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
            dragPosition={dragPosition}
            dragOffset={dragOffset}
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
