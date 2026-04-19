const PIECE_DEFS = [
  { cells: [[0, 0]], color: "#ff6b6b" },
  { cells: [[0, 0], [0, 1]], color: "#4ecdc4" },
  { cells: [[0, 0], [1, 0]], color: "#45b7d1" },
  { cells: [[0, 0], [0, 1], [0, 2]], color: "#96ceb4" },
  { cells: [[0, 0], [1, 0], [2, 0]], color: "#88d8b0" },
  { cells: [[0, 0], [1, 0], [1, 1]], color: "#ffe66d" },
  { cells: [[0, 0], [0, 1], [1, 0]], color: "#ffd93d" },
  { cells: [[0, 0], [0, 1], [1, 1]], color: "#f6e58d" },
  { cells: [[0, 1], [1, 0], [1, 1]], color: "#ffbe76" },
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: "#0984e3" },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "#6c5ce7" },
  { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], color: "#e17055" },
  { cells: [[0, 1], [1, 0], [1, 1], [1, 2]], color: "#fd79a8" },
  { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], color: "#00b894" },
  { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], color: "#55efc4" },
  { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], color: "#fdcb6e" },
  { cells: [[0, 0], [0, 1], [1, 0], [2, 0]], color: "#ffeaa7" },
  { cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], color: "#dfe6e9" },
];

const BOARD_SIZE = 10;

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function generatePieceSet() {
  const indices = [];
  for (let i = 0; i < 3; i++) {
    indices.push(Math.floor(Math.random() * PIECE_DEFS.length));
  }
  return indices;
}

function canPlacePiece(board, pieceDefIdx, row, col) {
  const piece = PIECE_DEFS[pieceDefIdx];
  for (const [dr, dc] of piece.cells) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r][c] !== null) return false;
  }
  return true;
}

function placePieceOnBoard(board, pieceDefIdx, row, col) {
  const piece = PIECE_DEFS[pieceDefIdx];
  for (const [dr, dc] of piece.cells) {
    board[row + dr][col + dc] = piece.color;
  }
}

function clearLines(board) {
  const rowsToClear = [];
  const colsToClear = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((c) => c !== null)) rowsToClear.push(r);
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === null) { full = false; break; }
    }
    if (full) colsToClear.push(c);
  }

  for (const r of rowsToClear) {
    for (let c = 0; c < BOARD_SIZE; c++) board[r][c] = null;
  }

  for (const c of colsToClear) {
    for (let r = 0; r < BOARD_SIZE; r++) board[r][c] = null;
  }

  return rowsToClear.length + colsToClear.length;
}

function canAnyPieceFit(board, pieces) {
  for (const pieceDefIdx of pieces) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlacePiece(board, pieceDefIdx, r, c)) return true;
      }
    }
  }
  return false;
}

module.exports = {
  PIECE_DEFS,
  BOARD_SIZE,
  createEmptyBoard,
  generatePieceSet,
  canPlacePiece,
  placePieceOnBoard,
  clearLines,
  canAnyPieceFit,
};
