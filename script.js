const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-btn');

let gameActive = true;
let currentPlayer = "X"; // Human starts
let gameState = ["", "", "", "", "", "", "", "", ""];

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Messages
const winningMessage = (winner) => winner === 'X' ? "You Win!" : "AI Wins!";
const drawMessage = () => `It's a Draw!`;
const currentPlayerTurn = () => `Your Turn (${currentPlayer})`;
const aiTurnMessage = () => `AI Thinking...`;

/*
 * Main game loop handlers
 */
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive || currentPlayer !== "X") {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('taken');
    clickedCell.classList.add(currentPlayer.toLowerCase());
}

function handleResultValidation() {
    const result = checkWinner(gameState);

    if (result) {
        if (result === 'Draw') {
            statusDisplay.textContent = drawMessage();
        } else {
            statusDisplay.textContent = winningMessage(result);
        }
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    if (currentPlayer === "O") {
        statusDisplay.textContent = aiTurnMessage();
        // Bonus: 500ms delay for AI move
        setTimeout(makeAiMove, 500);
    } else {
        statusDisplay.textContent = currentPlayerTurn();
    }
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.textContent = currentPlayerTurn();
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell"; // Reset classes (remove x, o, taken)
    });
}

/**
 * Checks for a winner or draw on the provided board state.
 * @param {Array} board - The board state to check.
 * @returns {String|null} - "X", "O", "Draw", or null if game continues.
 */
function checkWinner(board) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (!board.includes("")) {
        return "Draw";
    }

    return null;
}

/*
 * AI Logic (Minimax Algorithm)
 */
function makeAiMove() {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let move;

    // Iterate over all empty cells to find the best move
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === "") {
            gameState[i] = "O"; // Try the move
            let score = minimax(gameState, 0, false);
            gameState[i] = ""; // Undo the move

            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    // Apply the best move found
    const aiCell = document.querySelector(`.cell[data-index='${move}']`);
    handleCellPlayed(aiCell, move);
    handleResultValidation();
}

/**
 * Minimax Algorithm
 * Recursively checks all possible future moves to determine the score of a board state.
 * 
 * @param {Array} boardState - Current state of the game board
 * @param {Number} depth - Depth of the current node (for prioritizing faster wins)
 * @param {Boolean} isMaximizing - True if it's AI's turn (O), False if human's (X)
 * @returns {Number} - Score of the board state
 */
function minimax(boardState, depth, isMaximizing) {
    const winner = checkWinner(boardState);
    if (winner !== null) {
        if (winner === 'O') return 10 - depth; // AI wins (prefer faster wins)
        if (winner === 'X') return depth - 10; // Human wins (prefer slower losses)
        return 0; // Draw
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === "") {
                boardState[i] = "O";
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === "") {
                boardState[i] = "X";
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Add event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleRestartGame);
