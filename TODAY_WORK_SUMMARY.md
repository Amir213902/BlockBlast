# Today's Work Summary

## Date
2026-07-04

## What was changed

- Вынес глобальные игровые константы в новый конфиг `frontend/src/utils/gameConfig.js`.
  - `GRID_SIZE`
  - `BLOCK_COUNT`
  - `DRAG_VISUAL_SHIFT`
  - `SCORE_PER_LINE`
  - `MOBILE_SCALE_WIDTH`
  - `DRAG_Z_INDEX`
  - `BLOCK_SHAPES`

- Перенёс игровую логику в `frontend/src/utils/gameUtils.js`.
  - `createGrid`
  - `randomShape`
  - `createBlocks`
  - `canPlace`
  - `placeShape`
  - `clearFullLines`

- Разделил компонент `Game` на отдельные UI-модули:
  - `frontend/src/components/GameArena.jsx`
  - `frontend/src/components/GameDropPanel.jsx`
  - `frontend/src/components/DraggableBlock.jsx`

- Обновил `frontend/src/pages/Game.jsx`:
  - стал тонкой страницей, управляющей состоянием и событиями
  - использует компоненты `GameArena` и `GameDropPanel`
  - импортирует глобальные константы из `gameConfig`

- Исправил рассчёт позиции превью арены при перетаскивании блока с учётом смещения на 40px вверх.

- Исправил потенциальное падение при работе с пустыми слотами в массиве блоков: `activeBlock` ищется только по валидным блокам.

## Результат

- Игровой движок теперь разложен на конфиги, утилиты и UI-компоненты.
- Все глобальные значения вынесены в единый конфиг, вместо жестких чисел в коде.
- `Game.jsx` стал проще и легче поддерживается.
- Нет ошибок в проверке файлов, связанные с этой реорганизацией.
