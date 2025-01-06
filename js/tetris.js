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

const COLORS = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#fff'];

let score = 0;
let nextPiece = null;
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;

const previewCanvas = document.getElementById('preview');
const previewContext = previewCanvas.getContext('2d');

function createPiece() {
    if (nextPiece === null) {
        nextPiece = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    }
    
    currentPiece = nextPiece;
    currentPieceX = Math.floor(BOARD_WIDTH / 2 - currentPiece[0].length / 2);
    currentPieceY = 0;
    
    nextPiece = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    drawPreview(nextPiece);
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
['left', 'right', 'down', 'rotate'].forEach(id => {
    const button = document.getElementById(id);
    
    // Handle both touch and click events
    ['touchstart', 'mousedown'].forEach(eventType => {
        button.addEventListener(eventType, (e) => {
            e.preventDefault();
            switch(id) {
                case 'left':
                    currentPieceX--;
                    if (collision()) currentPieceX++;
                    break;
                case 'right':
                    currentPieceX++;
                    if (collision()) currentPieceX--;
                    break;
                case 'down':
                    currentPieceY++;
                    if (collision()) {
                        currentPieceY--;
                        merge();
                        clearLines();
                        createPiece();
                    }
                    break;
                case 'rotate':
                    const rotated = currentPiece[0].map((_, i) => 
                        currentPiece.map(row => row[row.length - 1 - i]));
                    const previousPiece = currentPiece;
                    currentPiece = rotated;
                    if (collision()) currentPiece = previousPiece;
                    break;
            }
            draw();
        });
    });
});

function drawPreview(piece) {
    // Clear preview canvas
    previewContext.fillStyle = '#000';
    previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // Center the piece in preview
    const xOffset = (previewCanvas.width - piece[0].length * 20) / 2;
    const yOffset = (previewCanvas.height - piece.length * 20) / 2;
    
    // Draw the piece
    previewContext.fillStyle = '#f00';  // Using single color for preview
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                previewContext.fillRect(xOffset + x * 20, yOffset + y * 20, 19, 19);
                previewContext.strokeStyle = 'white';
                previewContext.strokeRect(xOffset + x * 20, yOffset + y * 20, 19, 19);
            }
        }
    }
}

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