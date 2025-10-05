import deviceJs from 'https://cdn.jsdelivr.net/npm/device.js@2.3/+esm'
const device = new deviceJs
export default class BlockBlast {
    constructor() {
        this.isMobileUser = device.tablet || device.mobile
        this.grid = Array(8).fill().map(() => Array(8).fill(0))
        this.score = 0
        this.currentBlocks = []
        this.blockShapes = [
            // [
            //     [1]
            // ],
            // [
            //     [1, 1]
            // ],
            // [
            //     [1, 0],
            //     [1, 1],
            // ],
            // [
            //     [1, 1],
            //     [0, 1]
            // ],
            // [
            //     [1, 1],
            //     [1, 1]
            // ],
            // [
            //     [1],
            //     [1],
            //     [1],
            // ]
            // [
            // [1, 1, 1, 1, 1, 1, 1, 1]
            // ]
            [
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
            ]
            // [
            //     [1],
            //     [1],
            //     [1],
            //     [1],
            //     [1],
            //     [1],
            //     [1],
            //     [1],

            // ]
        ]
        setTimeout(() => {
            this.init()
        }, 1000);

    }

    init() {
        this.createGrid();
        this.generateNewBlocks();
        this.updateScore();
        // document.getElementById('')
    }

    createGrid() {
        const gridElement = document.getElementById('game_container_arena');
        gridElement.innerHtml = '';

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'game_container_arena_item';
                cell.dataset.row = r;
                cell.dataset.col = c;
                gridElement.appendChild(cell)
            }
        }


        this.setupDropZone(gridElement)
    }

    setupDropZone(gridElement) {
        gridElement.addEventListener('dragovera', (e) => {
            e.preventDefault();
            const rect = gridElement.getBoundingClientRect();
            const cellSize = 47.85
            const col = Math.floor((e.detail.clientX - rect.left - 29) / cellSize)
            const row = Math.floor((e.detail.clientY - rect.top - 5) / cellSize)

            this.highlightPlacement(row, col, this.draggedBlock);
        });



        gridElement.addEventListener('dropa', (e) => {
            e.preventDefault();

            const rect = gridElement.getBoundingClientRect();
            const cellSize = 47.85
            const col = Math.floor((e.detail.clientX - rect.left - 29) / cellSize)
            const row = Math.floor((e.detail.clientY - rect.top - 5) / cellSize)

            this.clearHighlight();
            if (this.placeBlock(this.draggedBlock.shape, row, col)) {
                this.draggedBlock.element.remove();
                this.currentBlocks = this.currentBlocks.filter(b => b !== this.draggedBlock);
                if (this.currentBlocks.length === 0) this.generateNewBlocks();
            }
        })

        gridElement.addEventListener('dragleave', () => this.clearHighlight());
    }

    generateNewBlocks() {
        this.currentBlocks = [];
        const containers = document.querySelectorAll('.game_container_drops_port')
        containers.forEach((nodeEl) => {
            nodeEl.innerHTML = ''
        })

        for (let i = 0; i < 3; i++) {
            const shape = this.blockShapes[Math.floor(Math.random() * this.blockShapes.length)]
            console.log(shape)
            const blockElement = this.createBlockElement(shape);
            const blockData = { shape, element: blockElement };
            this.currentBlocks.push(blockData);
            containers[i].appendChild(blockElement)
            console.log(i)
        }
    }

    createBlockElement(shape) {
        const block = document.createElement('div');
        const colorShape = Math.floor(Math.random() * 8)
        const blockContainer = document.createElement('div')
        block.className = 'game_container_drops_item'
        block.draggable = true;
        blockContainer.className = 'game_container_drops_item_container'
        blockContainer.style.gridTemplateColumns = `repeat(${shape[0].length}, auto)`;
        blockContainer.style.gridTemplateRows = `repeat(${shape.length}, auto)`;

        shape.forEach(row => {
            row.forEach(cell => {
                const cellElement = document.createElement('div');
                cellElement.className = cell ? `block-cell color-${colorShape}` : 'block empty';
                blockContainer.appendChild(cellElement)
            })
        });
        block.appendChild(blockContainer);

        if (this.isMobileUser) {
            block.addEventListener('touchmove', (e) => {
                e.preventDefault()
                // e.preventDefault()
                let touch = e.targetTouches[0];
                // block.style.top = `${touch.clientY - (block.offsetHeight / 2) - 40}px`
                // block.style.left = `${touch.clientX - (block.offsetWidth / 2)}px`

                // let touch = e.targetTouches[0]; 
                block.style.top = `${touch.clientY - (block.offsetHeight / 2) - 100}px`
                block.style.left = `${touch.clientX - (block.offsetWidth / 2)}px`
                let a = new CustomEvent('dragovera', {
                    detail: {
                        clientX: touch.clientX,
                        clientY: touch.clientY - 110,
                    }
                })
                document.getElementById('game_container_arena').dispatchEvent(a)
            })


            block.addEventListener('touchstart', (e) => {
                e.preventDefault()
                this.draggedBlock = this.currentBlocks.find(b => b.element === block);

                block.classList.add('dragged')

            })

            block.addEventListener('touchend', (e) => {
                // block.classList.remove('dragged')
                e.preventDefault();

                let touch = e.changedTouches[0];
                let a = new CustomEvent('dropa', {
                    detail: {
                        clientX: touch.clientX,
                        clientY: touch.clientY - 110,
                    }
                })
                document.getElementById('game_container_arena').dispatchEvent(a)
                block.classList.remove('dragged')
            })
        } else {
            block.addEventListener('mousemove', (e) => {
                e.preventDefault()
                // let touch = e.targetTouches[0]; 
                if (e.which === 1) {
                    block.style.top = `${e.clientY - (block.offsetHeight / 2) - 100}px`
                    block.style.left = `${e.clientX - (block.offsetWidth / 2)}px`
                    let a = new CustomEvent('dragovera', {
                        detail: {
                            clientX: e.clientX - 4,
                            clientY: e.clientY - 115,
                        }
                    })
                    document.getElementById('game_container_arena').dispatchEvent(a)
                }
            })


            block.addEventListener('mousedown', (e) => {
                e.preventDefault()
                this.draggedBlock = this.currentBlocks.find(b => b.element === block);

                block.classList.add('dragged')

            })

            block.addEventListener('mouseup', (e) => {
                e.preventDefault();

                let a = new CustomEvent('dropa', {
                    detail: {
                        clientX: e.clientX - 4,
                        clientY: e.clientY - 115,
                    }
                })
                document.getElementById('game_container_arena').dispatchEvent(a)
                block.classList.remove('dragged')
            })
        }

        block.addEventListener('dragstart', (e) => {
            e.preventDefault();

            this.draggedBlock = this.currentBlocks.find(b => b.element === block);
        });




        block.addEventListener('dragend', () => {
            e.preventDefault();

            block.classList.remove('draggend');
            this.clearHighlight();
        })


        return block;
    }

    highlightPlacement(row, col, blockData) {
        this.clearHighlight();
        if (!blockData) return;


        const canPlace = this.canPlace(blockData.shape, row, col);
        const cells = document.querySelectorAll('.game_container_arena_item');

        blockData.shape.forEach((shapeRow, r) => {
            shapeRow.forEach((cell, c) => {
                if (cell) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {

                        const cellIndex = targetRow * 8 + targetCol;
                        cells[cellIndex].classList.add(canPlace ? 'highlight' : 'invalid');
                    };
                };
            });
        });
    }

    clearHighlight() {
        document.querySelectorAll('.game_container_arena_item').forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });
    };

    canPlace(shape, row, col) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newRow = row + r;
                    const newCol = col + c;
                    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8 || this.grid[newRow][newCol]) {
                        return false
                    }
                }
            }
        }

        return true
    }

    placeBlock(shape, row, col) {
        if (!this.canPlace(shape, row, col)) return false;

        shape.forEach((shapeRow, r) => {
            shapeRow.forEach((cell, c) => {
                if (cell) {
                    this.grid[row + r][col + c] = 1
                }
            })
        })

        this.updateGridDisplay();
        this.animationClearLines(shape, row, col, false)
        setTimeout(() => {
            console.log('a')
            this.animationClearLines(shape, row, col, true);
        }, 400)
        setTimeout(() => {
            this.clearLines();
        }, 400);
        return true;
    }


    updateGridDisplay() {
        const cells = document.querySelectorAll('.game_container_arena_item');
        this.grid.forEach((row, r) => {
            row.forEach((cell, c) => {
                const cellIndex = r * 8 + c;
                cells[cellIndex].classList.toggle('filled', cell === 1)
            })
        })
    }


    animationClearLines(shape, row, col, isCleared) {
        const cells = document.querySelectorAll('.game_container_arena_item');

        let result = 0
        for (let r = 0; r < 8; r++) {
            if (this.grid[r].every(cell => cell === 1)) {

                // this.grid[r].fill(0);
                // cleared++;
                cells.forEach((cell, _) => {
                    if (cell.dataset.row == r) {
                        // result += 1
                        if (isCleared) {
                            cell.classList.remove('cleared')
                            console.log('remove')
                        } else {
                            cell.classList.add('cleared')
                            console.log('add')
                        }

                    }
                })
            }
        }

        for (let c = 0; c < 10; c++) {
            if (this.grid.every(row => row[c] === 1)) {
                cells.forEach((cell, _) => {
                    if (cell.dataset.col == c) {
                        // result += 1
                        if (isCleared) {
                            cell.classList.remove('cleared')
                            console.log('remove')
                        } else {
                            cell.classList.add('cleared')
                            console.log('add')
                        }

                    }
                })
            }
        }

        // console.log(result)

        return true
    }

    clearLines() {
        let cleared = 0;

        // Убирает по ряду
        for (let r = 0; r < 8; r++) {
            if (this.grid[r].every(cell => cell === 1)) {
                this.grid[r].fill(0);
                cleared++;
            }
        }

        // Убирает по колонкам
        for (let c = 0; c < 10; c++) {
            if (this.grid.every(row => row[c] === 1)) {
                this.grid.forEach(row => row[c] = 0);
                cleared++;
            }
        }

        if (cleared != 0) {
            this.score += cleared * 100;
            this.updateScore();
            this.updateGridDisplay();
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new BlockBlast();
});
// let isClassStarted 
// let isIntervalOn = setInterval(() => {
//     // if(document.)
// }, 0);