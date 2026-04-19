// Manages game rooms: creation, joining, cleanup

const MAX_PLAYERS_PER_ROOM = 2;

// In-memory store of rooms
// roomId -> { players: [socketId, socketId], state: "waiting" | "playing" }
const rooms = {};

// Maps socket ID to the room they are in
const playerRoomMap = {};

function createRoom(roomId) {
  if (rooms[roomId]) {
    return false;
  }
  rooms[roomId] = {
    players: [],
    state: "waiting",
  };
  return true;
}

function joinRoom(roomId, socketId) {
  // Create room if it doesn't exist
  if (!rooms[roomId]) {
    createRoom(roomId);
  }

  const room = rooms[roomId];

  // Reject if room is full
  if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
    return { success: false, reason: "Room is full" };
  }

  // Reject if player is already in this room
  if (room.players.includes(socketId)) {
    return { success: false, reason: "Already in room" };
  }

  // Remove player from any existing room first
  leaveRoom(socketId);

  room.players.push(socketId);
  playerRoomMap[socketId] = roomId;

  // Check if room is now full and ready to start
  const ready = room.players.length === MAX_PLAYERS_PER_ROOM;
  if (ready) {
    room.state = "playing";
  }

  return {
    success: true,
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

  // Remove player from room
  room.players = room.players.filter((id) => id !== socketId);
  delete playerRoomMap[socketId];

  // Clean up empty rooms
  if (room.players.length === 0) {
    delete rooms[roomId];
    return { roomId, empty: true };
  }

  // Reset room state if a player left during a game
  room.state = "waiting";

  return { roomId, empty: false };
}

function getRoom(roomId) {
  return rooms[roomId] || null;
}

function getRoomForPlayer(socketId) {
  const roomId = playerRoomMap[socketId];
  if (!roomId) return null;
  return roomId;
}

function getOpponent(socketId) {
  const roomId = playerRoomMap[socketId];
  if (!roomId) return null;

  const room = rooms[roomId];
  if (!room) return null;

  return room.players.find((id) => id !== socketId) || null;
}

module.exports = {
  joinRoom,
  leaveRoom,
  getRoom,
  getRoomForPlayer,
  getOpponent,
  MAX_PLAYERS_PER_ROOM,
};