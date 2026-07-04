import React from "react";
import DraggableBlock from "./DraggableBlock";
import { DRAG_Z_INDEX } from "../utils/gameConfig";

const GameDropPanel = ({ blocks, draggingBlockId, dragPosition, dragSize, dragShift, onPointerDown }) => (
  <div className="game_container_drops" id="game_container_drops">
    {blocks.map((block, index) => {
      if (!block) {
        return <div key={index} className="game_container_drops_port empty-slot" />;
      }

      const isDragging = draggingBlockId === block.id;
      const dragStyle =
        isDragging && dragPosition
          ? {
              position: "fixed",
              left: `${dragPosition.x - dragSize.width / 2}px`,
              top: `${dragPosition.y - dragSize.height / 2 - dragShift}px`,
              width: `${dragSize.width}px`,
              height: `${dragSize.height}px`,
              zIndex: DRAG_Z_INDEX,
              cursor: "grabbing",
            }
          : undefined;

      return (
        <div key={block.id} className={`game_container_drops_port ${isDragging ? "dragging-container" : ""}`}>
          <DraggableBlock
            block={block}
            isDragging={isDragging}
            dragStyle={dragStyle}
            onPointerDown={onPointerDown}
          />
        </div>
      );
    })}
  </div>
);

export default GameDropPanel;
