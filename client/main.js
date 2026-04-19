const SERVER_URL = window.location.origin;

let socket = null;
let currentRoomId = null;
let myNumber = -1;
let board = createEmptyBoard();
let currentPieces = [];
let selectedPieceIdx = -1;
let currentTurn = -1;
let score = 0;
let gameStarted = false;
let gameOver = false;
let hoverCell = null;
let lastTapTime = 0;
let lastTapCell = null;
let isTouchDevice = false;
const DOUBLE_TAP_DELAY = 300;

const newRoomBtn = document.getElementById("new-room-btn");
const roomIdInput = document.getElementById("room-id-input");
const joinBtn = document.getElementById("join-btn");
const statusDisplay = document.getElementById("status");
const scoreDisplay = document.getElementById("score");
const shareLink = document.getElementById("share-link");
const shareUrl = document.getElementById("share-url");
const boardCanvas = document.getElementById("board-canvas");
const boardCtx = boardCanvas.getContext("2d");
const pieceCanvas = document.getElementById("piece-canvas");
const pieceCtx = pieceCanvas.getContext("2d");
const skipBtn = document.getElementById("skip-btn");

const CANVAS_SIZE = BOARD_SIZE * CELL_SIZE;

function init() {
  socket = io(SERVER_URL);

  socket.on("connect", () => {
    setStatus("Connected. Create or join a room to play.");
  });

  socket.on("disconnect", () => {
    setStatus("Disconnected from server.");
  });

  socket.on("room_joined", (data) => {
    currentRoomId = data.roomId;
    myNumber = data.playerNumber;
    setStatus(`In room ${data.roomId}. Waiting for opponent...`);
  });

  socket.on("room_error", (reason) => {
    setStatus(`Error: ${reason}`);
  });

  socket.on("opponent_joined", () => {
    setStatus("Opponent joined! Starting game...");
  });

  socket.on("game_start", (data) => {
    myNumber = data.yourNumber;
    gameStarted = true;
    gameOver = false;
  });

  socket.on("game_state", (data) => {
    board = data.board;
    currentPieces = [...data.pieces];
    currentTurn = data.currentTurn;
    score = data.score;
    if (selectedPieceIdx >= currentPieces.length) selectedPieceIdx = -1;
    updateTurnStatus();
    updateScore();
    render();
  });

  socket.on("lines_cleared", (data) => {
    // Could add animation later; for now just flash status briefly
    const msg = `${data.count} line${data.count > 1 ? "s" : ""} cleared!`;
    flashStatus(msg);
  });

  socket.on("opponent_skipped", () => {
    flashStatus("Opponent skipped their turn.");
  });

  socket.on("game_over", (data) => {
    gameOver = true;
    setStatus(`Game Over! ${data.reason}. Final score: ${data.score}`);
  });

  socket.on("opponent_left", () => {
    gameStarted = false;
    setStatus("Opponent left. Waiting for new opponent...");
  });

  newRoomBtn.addEventListener("click", createNewRoom);
  joinBtn.addEventListener("click", joinRoom);
  roomIdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") joinRoom();
  });

  boardCanvas.addEventListener("mousemove", handleMouseMove);
  boardCanvas.addEventListener("mouseleave", handleMouseLeave);
  boardCanvas.addEventListener("click", handleBoardClick);
  boardCanvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  boardCanvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  boardCanvas.addEventListener("touchend", handleTouchEnd, { passive: false });
  pieceCanvas.addEventListener("click", handlePieceClick);
  skipBtn.addEventListener("click", handleSkip);

  const hashRoom = window.location.hash.slice(1);
  if (hashRoom) {
    roomIdInput.value = hashRoom;
    socket.on("connect", () => joinRoom());
  }

  render();
}

function createNewRoom() {
  const roomId = generateRoomId();
  roomIdInput.value = roomId;
  window.location.hash = roomId;
  shareUrl.textContent = window.location.href;
  shareUrl.href = window.location.href;
  shareLink.style.display = "block";
  socket.emit("join_room", roomId);
}

function joinRoom() {
  const roomId = roomIdInput.value.trim();
  if (!roomId) {
    setStatus("Please enter a room ID");
    return;
  }
  window.location.hash = roomId;
  shareUrl.textContent = window.location.href;
  shareUrl.href = window.location.href;
  shareLink.style.display = "block";
  socket.emit("join_room", roomId);
}

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function updateTurnStatus() {
  if (gameOver) return;
  if (!gameStarted) return;
  if (currentTurn === myNumber) {
    setStatus("Your turn! Select a piece, then click the board to place it.");
    boardCanvas.classList.remove("disabled");
  } else {
    setStatus("Opponent's turn...");
    boardCanvas.classList.add("disabled");
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
}

function setStatus(text) {
  statusDisplay.textContent = text;
}

let statusFlashTimer = null;
function flashStatus(text) {
  setStatus(text);
  if (statusFlashTimer) clearTimeout(statusFlashTimer);
  statusFlashTimer = setTimeout(() => {
    updateTurnStatus();
  }, 1500);
}

function render() {
  let highlight = null;
  if (
    hoverCell &&
    gameStarted &&
    !gameOver &&
    currentTurn === myNumber &&
    selectedPieceIdx >= 0 &&
    selectedPieceIdx < currentPieces.length
  ) {
    highlight = {
      pieceDefIdx: currentPieces[selectedPieceIdx],
      playerNumber: currentTurn,
      row: hoverCell.row,
      col: hoverCell.col,
    };
  }

  drawBoard(boardCtx, board, highlight, CELL_SIZE, CANVAS_SIZE);
  drawPieceSelector(
    pieceCtx,
    currentPieces,
    selectedPieceIdx,
    currentTurn,
    CELL_SIZE,
    pieceCanvas.width,
    pieceCanvas.height
  );
}

function getCellFromMouse(e) {
  const rect = boardCanvas.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width;
  const scaleY = CANVAS_SIZE / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  return { row, col };
}

function handleMouseMove(e) {
  hoverCell = getCellFromMouse(e);
  render();
}

function handleMouseLeave() {
  hoverCell = null;
  render();
}

function getCellFromTouch(touch) {
  const rect = boardCanvas.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width;
  const scaleY = CANVAS_SIZE / rect.height;
  const x = (touch.clientX - rect.left) * scaleX;
  const y = (touch.clientY - rect.top) * scaleY;
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  return { row, col };
}

function handleTouchStart(e) {
  e.preventDefault();
  isTouchDevice = true;
}

function handleTouchMove(e) {
  e.preventDefault();
}

function handleTouchEnd(e) {
  e.preventDefault();
  if (!gameStarted || gameOver) return;
  if (currentTurn !== myNumber) return;

  const touch = e.changedTouches[0];
  const cell = getCellFromTouch(touch);
  if (!cell) return;

  const now = Date.now();
  const timeSinceLastTap = now - lastTapTime;

  if (
    timeSinceLastTap < DOUBLE_TAP_DELAY &&
    lastTapCell &&
    lastTapCell.row === cell.row &&
    lastTapCell.col === cell.col
  ) {
    lastTapTime = 0;
    lastTapCell = null;

    if (selectedPieceIdx < 0 || selectedPieceIdx >= currentPieces.length) {
      flashStatus("Select a piece first!");
      return;
    }

    const pieceDefIdx = currentPieces[selectedPieceIdx];
    if (!canPlacePiece(board, pieceDefIdx, cell.row, cell.col)) {
      flashStatus("Can't place piece there.");
      return;
    }

    hoverCell = null;
    render();
    socket.emit("place_piece", {
      roomId: currentRoomId,
      pieceDefIdx,
      row: cell.row,
      col: cell.col,
    });
  } else {
    lastTapTime = now;
    lastTapCell = cell;
    hoverCell = cell;
    render();
  }
}

function handleBoardClick(e) {
  if (isTouchDevice) return;
  if (!gameStarted || gameOver) return;
  if (currentTurn !== myNumber) return;
  if (selectedPieceIdx < 0 || selectedPieceIdx >= currentPieces.length) {
    flashStatus("Select a piece first!");
    return;
  }

  const cell = getCellFromMouse(e);
  if (!cell) return;

  const pieceDefIdx = currentPieces[selectedPieceIdx];
  if (!canPlacePiece(board, pieceDefIdx, cell.row, cell.col)) {
    flashStatus("Can't place piece there.");
    return;
  }

  socket.emit("place_piece", {
    roomId: currentRoomId,
    pieceDefIdx,
    row: cell.row,
    col: cell.col,
  });
}

function handlePieceClick(e) {
  if (!gameStarted || gameOver) return;
  if (currentTurn !== myNumber) {
    flashStatus("Wait for your turn.");
    return;
  }

  const rect = pieceCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const scaleX = pieceCanvas.width / rect.width;
  const realX = x * scaleX;
  const spacing = pieceCanvas.width / 3;

  const idx = Math.floor(realX / spacing);
  if (idx < 0 || idx >= currentPieces.length) return;

  selectedPieceIdx = selectedPieceIdx === idx ? -1 : idx;
  render();
}

function handleSkip() {
  if (!gameStarted || gameOver) return;
  if (currentTurn !== myNumber) {
    flashStatus("Wait for your turn.");
    return;
  }
  if (canAnyPieceFit(board, currentPieces)) {
    flashStatus("You still have valid moves!");
    return;
  }
  socket.emit("skip_turn", currentRoomId);
}

init();
