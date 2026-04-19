const { generatePieceSet, createEmptyBoard } = require("./gameLogic");

const MAX_PLAYERS_PER_ROOM = 2;

const rooms = {};
const playerRoomMap = {};

function joinRoom(roomId, socketId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      players: [],
      state: "waiting",
      currentTurn: 0,
      currentPieces: [],
      board: createEmptyBoard(),
      score: 0,
      consecutiveSkips: 0,
    };
  }

  const room = rooms[roomId];

  if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
    return { success: false, reason: "Room is full" };
  }

  if (room.players.includes(socketId)) {
    return { success: false, reason: "Already in room" };
  }

  leaveRoom(socketId);

  room.players.push(socketId);
  playerRoomMap[socketId] = roomId;

  const ready = room.players.length === MAX_PLAYERS_PER_ROOM;
  if (ready) {
    room.state = "playing";
    room.currentTurn = 0;
    room.currentPieces = generatePieceSet();
    room.board = createEmptyBoard();
    room.score = 0;
    room.consecutiveSkips = 0;
  }

  return {
    success: true,
    playerNumber: room.players.length - 1,
    playerCount: room.players.length,
    ready,
  };
}

function leaveRoom(socketId) {
  const roomId = playerRoomMap[socketId];
  if (!roomId) return null;

  const room = rooms[roomId];
  if (!room) {
    delete playerRoomMap[socketId];
    return null;
  }

  room.players = room.players.filter((id) => id !== socketId);
  delete playerRoomMap[socketId];

  if (room.players.length === 0) {
    delete rooms[roomId];
    return { roomId, empty: true };
  }

  room.state = "waiting";
  return { roomId, empty: false };
}

function getRoom(roomId) {
  return rooms[roomId] || null;
}

function getPlayerNumber(socketId) {
  const roomId = playerRoomMap[socketId];
  if (!roomId) return -1;
  const room = rooms[roomId];
  if (!room) return -1;
  return room.players.indexOf(socketId);
}

function advanceTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  room.currentTurn = (room.currentTurn + 1) % 2;
}

function removePieceFromSet(roomId, pieceDefIdx) {
  const room = rooms[roomId];
  if (!room) return null;
  const idx = room.currentPieces.indexOf(pieceDefIdx);
  if (idx === -1) return null;
  room.currentPieces.splice(idx, 1);
  return room.currentPieces;
}

function generateNewPieces(roomId) {
  const room = rooms[roomId];
  if (!room) return null;
  room.currentPieces = generatePieceSet();
  room.consecutiveSkips = 0;
  return room.currentPieces;
}

module.exports = {
  joinRoom,
  leaveRoom,
  getRoom,
  getPlayerNumber,
  advanceTurn,
  removePieceFromSet,
  generateNewPieces,
};
