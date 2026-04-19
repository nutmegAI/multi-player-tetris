// Game state and constants

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

// Creates an empty board filled with zeros
function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

// Placeholder: handle player keyboard input
// Maps to game actions: "left", "right", "rotate", "drop", "hard_drop"
function handleInput(action) {
  console.log(`Game action: ${action}`);
  // TODO: implement actual piece movement logic
}

// Placeholder: apply garbage lines from opponent
// Shifts board up and adds garbage rows at the bottom
function applyGarbage(lines) {
  console.log(`Garbage received: ${lines} lines`);
  // TODO: implement garbage row insertion
}

// Basic game loop stub
function startGameLoop() {
  console.log("Game loop started");
  // TODO: implement tick-based piece gravity
}

module.exports = {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  CELL_SIZE,
  createEmptyBoard,
  handleInput,
  applyGarbage,
  startGameLoop,
};