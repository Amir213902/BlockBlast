import DraggableBlock from "./DraggableBlock";

const GameDropPanel = ({ blocks, draggingBlockId, onPointerDown }) => (
  <div className="game_container_drops" id="game_container_drops">
    {blocks.map((block, index) => {
      if (!block) {
        return <div key={index} className="game_container_drops_port empty-slot" />;
      }

      const isDragging = draggingBlockId === block.id;

      return (
        <div key={block.id} className={`game_container_drops_port ${isDragging ? "dragging-container" : ""}`}>
          <DraggableBlock
            block={block}
            isDragging={isDragging}
            onPointerDown={onPointerDown}
          />
        </div>
      );
    })}
  </div>
);

export default GameDropPanel;
