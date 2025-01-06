const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const BLOCK_SIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

const board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));

const SHAPES = [
    [[1, 1, 1, 1]],     // I
    [[1, 1], [1, 1]],   // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

let score = 0;
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;

function createPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    currentPiece = shape;
    currentPieceX = Math.floor(BOARD_WIDTH / 2 - shape[0].length / 2);
    currentPieceY = 0;
}

function draw() {
    context.fillStyle = '#111';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = '#fff';
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });
    
    if (currentPiece) {
        context.fillStyle = '#f00';
        currentPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    context.fillRect(
                        (currentPieceX + x) * BLOCK_SIZE,
                        (currentPieceY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }
}

function collision() {
    if (!currentPiece) return false;
    
    return currentPiece.some((row, y) => {
        return row.some((value, x) => {
            if (!value) return false;
            const boardX = currentPieceX + x;
            const boardY = currentPieceY + y;
            return boardX < 0 || 
                   boardX >= BOARD_WIDTH ||
                   boardY >= BOARD_HEIGHT ||
                   board[boardY]?.[boardX];
        });
    });
}

function merge() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPieceY + y][currentPieceX + x] = value;
            }
        });
    });
}

function clearLines() {
    for (let y = board.length - 1; y >= 0; y--) {
        if (board[y].every(value => value)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            score += 100;
            document.getElementById('score').textContent = score;
        }
    }
}

document.addEventListener('keydown', event => {
    switch (event.key) {
        case 'ArrowLeft':
            currentPieceX--;
            if (collision()) currentPieceX++;
            break;
        case 'ArrowRight':
            currentPieceX++;
            if (collision()) currentPieceX--;
            break;
        case 'ArrowDown':
            currentPieceY++;
            if (collision()) {
                currentPieceY--;
                merge();
                clearLines();
                createPiece();
            }
            break;
        case 'ArrowUp':
            const rotated = currentPiece[0].map((_, i) => 
                currentPiece.map(row => row[row.length - 1 - i]));
            const previousPiece = currentPiece;
            currentPiece = rotated;
            if (collision()) currentPiece = previousPiece;
            break;
    }
    draw();
});

// Add after keyboard controls:

// Touch controls
document.getElementById('left').addEventListener('touchstart', (e) => {
    e.preventDefault();
    currentPieceX--;
    if (collision()) currentPieceX++;
    draw();
});

document.getElementById('right').addEventListener('touchstart', (e) => {
    e.preventDefault();
    currentPieceX++;
    if (collision()) currentPieceX--;
    draw();
});

document.getElementById('down').addEventListener('touchstart', (e) => {
    e.preventDefault();
    currentPieceY++;
    if (collision()) {
        currentPieceY--;
        merge();
        clearLines();
        createPiece();
    }
    draw();
});

document.getElementById('rotate').addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rotated = currentPiece[0].map((_, i) => 
        currentPiece.map(row => row[row.length - 1 - i]));
    const previousPiece = currentPiece;
    currentPiece = rotated;
    if (collision()) currentPiece = previousPiece;
    draw();
});

function gameLoop() {
    currentPieceY++;
    if (collision()) {
        currentPieceY--;
        merge();
        clearLines();
        createPiece();
        if (collision()) {
            board.forEach(row => row.fill(0));
            score = 0;
            document.getElementById('score').textContent = score;
        }
    }
    draw();
}

createPiece();
draw();
setInterval(gameLoop, 1000);