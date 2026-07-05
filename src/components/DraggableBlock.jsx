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

export default DraggableBlock;
