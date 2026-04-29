const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const roomManager = require("./roomManager");
const {
  canPlacePiece,
  placePieceOnBoard,
  clearLines,
  canAnyPieceFit,
} = require("./gameLogic");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "..", "client")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

function sendGameState(roomId) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  io.to(roomId).emit("game_state", {
    board: room.board,
    pieces: room.currentPieces,
    currentTurn: room.currentTurn,
    score: room.score,
  });
}

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const roomId = typeof data === "string" ? data : data.roomId;
    const isSolo = typeof data === "object" ? !!data.isSolo : false;

    if (!roomId || typeof roomId !== "string") {
      socket.emit("room_error", "Invalid room ID");
      return;
    }

    const result = roomManager.joinRoom(roomId, socket.id, isSolo);

    if (!result.success) {
      socket.emit("room_error", result.reason);
      return;
    }

    socket.join(roomId);

    socket.emit("room_joined", {
      roomId,
      playerNumber: result.playerNumber,
      playerCount: result.playerCount,
      isSolo: result.isSolo,
    });

    if (!isSolo) {
      socket.to(roomId).emit("opponent_joined", {
        playerCount: result.playerCount,
      });
    }

    if (result.ready) {
      const room = roomManager.getRoom(roomId);
      io.to(room.players[0]).emit("game_start", { yourNumber: 0, isSolo });
      if (!isSolo) {
        io.to(room.players[1]).emit("game_start", { yourNumber: 1, isSolo: false });
      }
      sendGameState(roomId);
      console.log(`Game started in room ${roomId}${isSolo ? " (solo)" : ""}`);
    }
  });

  socket.on("place_piece", (data) => {
    const { roomId, pieceDefIdx, row, col } = data;
    const playerNumber = roomManager.getPlayerNumber(socket.id);
    const room = roomManager.getRoom(roomId);

    if (playerNumber === -1 || !room) return;
    if (room.state !== "playing") return;
    if (room.currentTurn !== playerNumber) return;

    if (!room.currentPieces.includes(pieceDefIdx)) return;
    if (!canPlacePiece(room.board, pieceDefIdx, row, col)) return;

    placePieceOnBoard(room.board, pieceDefIdx, row, col, playerNumber);
    const linesCleared = clearLines(room.board);
    room.score += linesCleared;
    room.consecutiveSkips = 0;

    roomManager.removePieceFromSet(roomId, pieceDefIdx);

    if (room.currentPieces.length === 0) {
      roomManager.generateNewPieces(roomId);
    }

    roomManager.advanceTurn(roomId);

    if (linesCleared > 0) {
      io.to(roomId).emit("lines_cleared", { count: linesCleared });
    }

    sendGameState(roomId);

    if (!canAnyPieceFit(room.board, room.currentPieces)) {
      room.state = "gameover";
      io.to(roomId).emit("game_over", { score: room.score, reason: "No valid moves remaining" });
    }
  });

  socket.on("skip_turn", (roomId) => {
    const playerNumber = roomManager.getPlayerNumber(socket.id);
    const room = roomManager.getRoom(roomId);

    if (playerNumber === -1 || !room) return;
    if (room.state !== "playing") return;
    if (room.currentTurn !== playerNumber) return;

    if (room.isSolo) {
      room.state = "gameover";
      io.to(roomId).emit("game_over", { score: room.score, reason: "No valid moves remaining" });
      return;
    }

    room.consecutiveSkips++;

    if (room.consecutiveSkips >= 2) {
      room.state = "gameover";
      io.to(roomId).emit("game_over", { score: room.score, reason: "Both players skipped" });
      return;
    }

    roomManager.advanceTurn(roomId);
    sendGameState(roomId);
    socket.to(roomId).emit("opponent_skipped");
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    const result = roomManager.leaveRoom(socket.id);
    if (!result) return;
    if (!result.empty) {
      io.to(result.roomId).emit("opponent_left");
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
