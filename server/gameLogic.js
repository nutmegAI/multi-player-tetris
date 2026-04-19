// Basic Tetris game constants and placeholder logic

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Creates an empty board filled with zeros
function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

// Placeholder: validate that a player action is a known move
// Actions: "left", "right", "rotate", "drop", "hard_drop"
function isValidAction(action) {
  const validActions = ["left", "right", "rotate", "drop", "hard_drop"];
  return validActions.includes(action);
}

// Placeholder: calculate garbage lines to send based on cleared lines
// In a full implementation, this would use attack tables
function calculateGarbage(linesCleared) {
  if (linesCleared === 0) return 0;
  if (linesCleared === 1) return 0;
  if (linesCleared === 2) return 1;
  if (linesCleared === 3) return 2;
  if (linesCleared === 4) return 4;
  return linesCleared;
}

module.exports = {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  createEmptyBoard,
  isValidAction,
  calculateGarbage,
};