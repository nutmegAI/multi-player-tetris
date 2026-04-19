const BOARD_SIZE = 10;
const CELL_SIZE = 48;

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

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
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
  const newBoard = board.map(r => [...r]);
  for (const [dr, dc] of piece.cells) {
    newBoard[row + dr][col + dc] = piece.color;
  }
  return newBoard;
}

function clearLines(board) {
  const newBoard = board.map(r => [...r]);
  let rowsToClear = [];
  let colsToClear = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (newBoard[r].every(c => c !== null)) {
      rowsToClear.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (newBoard[r][c] === null) { full = false; break; }
    }
    if (full) colsToClear.push(c);
  }

  for (const r of rowsToClear) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[r][c] = null;
    }
  }

  for (const c of colsToClear) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][c] = null;
    }
  }

  const linesCleared = rowsToClear.length + colsToClear.length;
  return { board: newBoard, linesCleared };
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

function drawBoard(ctx, board, highlightCells, cellSize, canvasSize) {
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const x = col * cellSize;
      const y = row * cellSize;

      if (board[row][col]) {
        ctx.fillStyle = board[row][col];
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      } else {
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }

  if (highlightCells) {
    const piece = PIECE_DEFS[highlightCells.pieceDefIdx];
    const valid = canPlacePiece(board, highlightCells.pieceDefIdx, highlightCells.row, highlightCells.col);
    for (const [dr, dc] of piece.cells) {
      const r = highlightCells.row + dr;
      const c = highlightCells.col + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        const x = c * cellSize;
        const y = r * cellSize;
        ctx.fillStyle = valid ? "rgba(255,255,255,0.4)" : "rgba(255,0,0,0.3)";
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }
}

function drawPieceSelector(ctx, pieces, selectedIdx, cellSize, canvasWidth, canvasHeight) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!pieces || pieces.length === 0) return;

  const pieceCellSize = cellSize * 0.75;
  const spacing = canvasWidth / 3;

  for (let i = 0; i < pieces.length; i++) {
    const piece = PIECE_DEFS[pieces[i]];
    let maxR = 0, maxC = 0;
    for (const [dr, dc] of piece.cells) {
      if (dr > maxR) maxR = dr;
      if (dc > maxC) maxC = dc;
    }

    const pieceWidth = (maxC + 1) * pieceCellSize;
    const pieceHeight = (maxR + 1) * pieceCellSize;
    const centerX = spacing * i + spacing / 2;
    const centerY = canvasHeight / 2;
    const offsetX = centerX - pieceWidth / 2;
    const offsetY = centerY - pieceHeight / 2;

    if (selectedIdx === i) {
      const padding = 8;
      ctx.strokeStyle = "#0ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        offsetX - padding,
        offsetY - padding,
        pieceWidth + padding * 2,
        pieceHeight + padding * 2
      );
    }

    for (const [dr, dc] of piece.cells) {
      const x = offsetX + dc * pieceCellSize;
      const y = offsetY + dr * pieceCellSize;
      ctx.fillStyle = piece.color;
      ctx.fillRect(x, y, pieceCellSize, pieceCellSize);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, pieceCellSize, pieceCellSize);
    }
  }
}