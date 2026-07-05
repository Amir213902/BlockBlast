const ArenaCell = ({ previewClass }) => (
  <div className={`game_container_arena_item ${previewClass}`}>
    <div className="arena-cell-inner" />
  </div>
);

const GameArena = ({ grid, preview, arenaRef }) => (
  <div className="game_container_arena" id="game_container_arena" ref={arenaRef}>
    {grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const previewKey = `${rowIndex}:${colIndex}`;
        const isPreview = preview?.cells.has(previewKey);
        const previewClass = `${cell ? "filled" : ""} ${
          isPreview ? (preview.valid ? "highlight" : "invalid") : ""
        }`.trim();

        return <ArenaCell key={previewKey} previewClass={previewClass} />;
      }),
    )}
  </div>
);

export default GameArena;
