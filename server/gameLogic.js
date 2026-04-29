const PIECE_DEFS = [
  { cells: [[0, 0]] },
  { cells: [[0, 0], [0, 1]] },
  { cells: [[0, 0], [1, 0]] },
  { cells: [[0, 0], [0, 1], [0, 2]] },
  { cells: [[0, 0], [1, 0], [2, 0]] },
  { cells: [[0, 0], [1, 0], [1, 1]] },
  { cells: [[0, 0], [0, 1], [1, 0]] },
  { cells: [[0, 0], [0, 1], [1, 1]] },
  { cells: [[0, 1], [1, 0], [1, 1]] },
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  { cells: [[0, 1], [1, 0], [1, 1], [1, 2]] },
  { cells: [[0, 1], [0, 2], [1, 0], [1, 1]] },
  { cells: [[0, 0], [0, 1], [1, 1], [1, 2]] },
  { cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  { cells: [[0, 0], [0, 1], [1, 0], [2, 0]] },
  { cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]] },
];

const PLAYER_PALETTES = [
  [
    "#ffcad4",
    "#bae1ff",
    "#c7ceea",
    "#caffbf",
    "#b5ead7",
    "#fff1b6",
    "#ffd6a5",
    "#fdffb6",
    "#ffc6ff",
    "#a0e7e5",
    "#bdb2ff",
    "#ffdac1",
    "#f1c0e8",
    "#b8f2e6",
    "#e4c1f9",
    "#f9dcc4",
    "#faedcb",
    "#dde7c7",
  ],
  [
    "#d7263d",
    "#1b998b",
    "#2d6a8d",
    "#386641",
    "#2a9d8f",
    "#bc6c25",
    "#b56576",
    "#6d597a",
    "#9c6644",
    "#264653",
    "#3d348b",
    "#7f5539",
    "#8f2d56",
    "#0f766e",
    "#4a5759",
    "#7c6a0a",
    "#5f0f40",
    "#334e68",
  ],
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

function getPieceColor(pieceDefIdx, playerNumber) {
  const palette = PLAYER_PALETTES[playerNumber] || PLAYER_PALETTES[0];
  return palette[pieceDefIdx % palette.length];
}

function placePieceOnBoard(board, pieceDefIdx, row, col, playerNumber) {
  const piece = PIECE_DEFS[pieceDefIdx];
  const color = getPieceColor(pieceDefIdx, playerNumber);
  for (const [dr, dc] of piece.cells) {
    board[row + dr][col + dc] = color;
  }
}

function findLinesToClear(board) {
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

  return { rowsToClear, colsToClear };
}

function clearLines(board) {
  const { rowsToClear, colsToClear } = findLinesToClear(board);

  for (const r of rowsToClear) {
    for (let c = 0; c < BOARD_SIZE; c++) board[r][c] = null;
  }

  for (const c of colsToClear) {
    for (let r = 0; r < BOARD_SIZE; r++) board[r][c] = null;
  }

  return { count: rowsToClear.length + colsToClear.length, rows: rowsToClear, cols: colsToClear };
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
  getPieceColor,
  placePieceOnBoard,
  findLinesToClear,
  clearLines,
  canAnyPieceFit,
};
