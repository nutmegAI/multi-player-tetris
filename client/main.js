// Main client entry point: connects to server, handles UI and networking

const SERVER_URL = window.location.origin;

let socket = null;
let currentRoomId = null;

// DOM elements
const roomIdInput = document.getElementById("room-id-input");
const joinBtn = document.getElementById("join-btn");
const statusDisplay = document.getElementById("status");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Initialize connection and event listeners
function init() {
  socket = io(SERVER_URL);

  // --- Socket event handlers ---

  socket.on("connect", () => {
    console.log("Connected to server");
    setStatus("Connected. Enter a room ID to play.");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
    setStatus("Disconnected from server.");
  });

  socket.on("room_joined", (data) => {
    console.log(`Joined room: ${data.roomId} (${data.playerCount}/2)`);
    currentRoomId = data.roomId;
    setStatus(`In room ${data.roomId}. Waiting for opponent...`);
  });

  socket.on("room_error", (reason) => {
    console.log(`Room error: ${reason}`);
    setStatus(`Error: ${reason}`);
  });

  socket.on("opponent_joined", () => {
    console.log("Opponent joined the room");
  });

  socket.on("start_game", (data) => {
    console.log(`Game started in room ${data.roomId}`);
    setStatus("Game started!");
    startGame();
  });

  socket.on("opponent_action", (data) => {
    console.log(`Opponent action: ${data.action}`);
  });

  socket.on("garbage_received", (data) => {
    console.log(`Garbage received: ${data.lines} lines`);
  });

  socket.on("opponent_left", () => {
    console.log("Opponent left the room");
    setStatus("Opponent left. Waiting for new opponent...");
  });

  // --- UI event handlers ---

  joinBtn.addEventListener("click", joinRoom);
  roomIdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") joinRoom();
  });

  // Keyboard controls for game actions
  document.addEventListener("keydown", (e) => {
    if (!currentRoomId) return;

    const actionMap = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "rotate",
      ArrowDown: "drop",
      Space: "hard_drop",
    };

    const action = actionMap[e.code];
    if (action) {
      e.preventDefault();
      handleInput(action);
      socket.emit("player_action", { roomId: currentRoomId, action });
    }
  });

  drawEmptyBoard();
}

function joinRoom() {
  const roomId = roomIdInput.value.trim();
  if (!roomId) {
    setStatus("Please enter a room ID");
    return;
  }
  console.log(`Joining room: ${roomId}`);
  socket.emit("join_room", roomId);
}

function startGame() {
  const board = createEmptyBoard();
  drawBoard(board);
  startGameLoop();
}

function setStatus(text) {
  statusDisplay.textContent = text;
}

// --- Rendering ---

function drawEmptyBoard() {
  const board = createEmptyBoard();
  drawBoard(board);
}

function drawBoard(board) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const x = col * CELL_SIZE;
      const y = row * CELL_SIZE;

      if (board[row][col] === 0) {
        ctx.strokeStyle = "#333";
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = board[row][col];
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = "#222";
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

// Start the app
init();