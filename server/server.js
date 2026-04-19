const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const roomManager = require("./roomManager");
const { isValidAction } = require("./gameLogic");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from /client
app.use(express.static(path.join(__dirname, "..", "client")));

// Fallback: serve index.html for any non-file routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player requests to join a room
  socket.on("join_room", (roomId) => {
    if (!roomId || typeof roomId !== "string") {
      socket.emit("error", "Invalid room ID");
      return;
    }

    const result = roomManager.joinRoom(roomId, socket.id);

    if (!result.success) {
      socket.emit("room_error", result.reason);
      return;
    }

    // Join the Socket.IO room for targeted broadcasting
    socket.join(roomId);
    console.log(`Player ${socket.id} joined room ${roomId} (${result.playerCount}/2)`);

    // Notify the player they joined
    socket.emit("room_joined", {
      roomId,
      playerCount: result.playerCount,
    });

    // Notify others in the room about the new player
    socket.to(roomId).emit("opponent_joined", {
      playerCount: result.playerCount,
    });

    // If room is full, start the game
    if (result.ready) {
      io.to(roomId).emit("start_game", { roomId });
      console.log(`Game started in room ${roomId}`);
    }
  });

  // Player sends a game action (e.g. move, rotate, drop)
  socket.on("player_action", (data) => {
    const { action } = data;
    if (!isValidAction(action)) return;

    const roomId = roomManager.getRoomForPlayer(socket.id);
    if (!roomId) return;

    // Relay the action to the opponent
    socket.to(roomId).emit("opponent_action", { action });
  });

  // Player sends garbage lines to opponent
  socket.on("send_garbage", (data) => {
    const { lines } = data;
    if (typeof lines !== "number" || lines <= 0) return;

    const roomId = roomManager.getRoomForPlayer(socket.id);
    if (!roomId) return;

    // Relay garbage to the opponent
    socket.to(roomId).emit("garbage_received", { lines });
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);

    const result = roomManager.leaveRoom(socket.id);
    if (!result) return;

    // Notify remaining player that opponent left
    if (!result.empty) {
      io.to(result.roomId).emit("opponent_left");
    }

    console.log(`Cleaned up room ${result.roomId} after disconnect`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});