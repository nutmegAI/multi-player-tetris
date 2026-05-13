const { generatePieceSet, createEmptyBoard } = require("./gameLogic");

const MAX_PLAYERS_PER_ROOM = 2;

const rooms = {};
const playerRoomMap = {};
const playerNames = {};

function joinRoom(roomId, socketId, isSolo = false, playerName = "Anonymous") {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      players: [],
      playerNames: [],
      state: "waiting",
      currentTurn: 0,
      currentPieces: [],
      board: createEmptyBoard(),
      score: 0,
      consecutiveSkips: 0,
      isSolo: false,
    };
  }

  const room = rooms[roomId];

  if (room.isSolo && room.players.length >= 1) {
    return { success: false, reason: "Room is full" };
  }

  if (!room.isSolo && room.players.length >= MAX_PLAYERS_PER_ROOM) {
    return { success: false, reason: "Room is full" };
  }

  if (room.players.includes(socketId)) {
    return { success: false, reason: "Already in room" };
  }

  leaveRoom(socketId);

  room.isSolo = isSolo;
  room.players.push(socketId);
  room.playerNames.push(playerName);
  playerNames[socketId] = playerName;
  playerRoomMap[socketId] = roomId;

  const ready = isSolo || room.players.length === MAX_PLAYERS_PER_ROOM;
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
    isSolo,
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

  const playerIdx = room.players.indexOf(socketId);
  room.players = room.players.filter((id) => id !== socketId);
  if (playerIdx !== -1) room.playerNames.splice(playerIdx, 1);
  delete playerNames[socketId];
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

function getPlayerName(socketId) {
  return playerNames[socketId] || "Anonymous";
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
  if (room.isSolo) return;
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
  getPlayerName,
  getPlayerNumber,
  advanceTurn,
  removePieceFromSet,
  generateNewPieces,
};
