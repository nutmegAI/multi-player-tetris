const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const roomManager = require("./roomManager");
const playerStore = require("./playerStore");
const {
  canPlacePiece,
  placePieceOnBoard,
  clearLines,
  canAnyPieceFit,
  findLinesToClear,
} = require("./gameLogic");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "..", "client")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

const autoPlaySockets = new Set();

function isAutoPlayRoom(room) {
  return room.players.some((id) => autoPlaySockets.has(id));
}

function sendGameState(roomId) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  io.to(roomId).emit("game_state", {
    board: room.board,
    pieces: room.currentPieces,
    currentTurn: room.currentTurn,
    score: room.score,
    playerNames: room.playerNames,
  });
}

function sendLeaderboard(socket) {
  socket.emit("leaderboard", playerStore.getLeaderboard());
}

function sendPlayerXP(socket, playerName) {
  const player = playerStore.getPlayer(playerName);
  socket.emit("xp_update", { xp: player.xp, highScores: player.highScores });
}

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  sendLeaderboard(socket);

  socket.on("join_room", (data) => {
    const roomId = typeof data === "string" ? data : data.roomId;
    const isSolo = typeof data === "object" ? !!data.isSolo : false;
    const playerName = (typeof data === "object" && data.playerName) || "Anonymous";

    if (!roomId || typeof roomId !== "string") {
      socket.emit("room_error", "Invalid room ID");
      return;
    }

    const result = roomManager.joinRoom(roomId, socket.id, isSolo, playerName);

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
      playerName,
    });

    sendPlayerXP(socket, playerName);

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
    const linesInfo = findLinesToClear(room.board);
    const linesCleared = linesInfo.rowsToClear.length + linesInfo.colsToClear.length;
    clearLines(room.board);
    room.score += linesCleared;
    room.consecutiveSkips = 0;

    roomManager.removePieceFromSet(roomId, pieceDefIdx);

    if (room.currentPieces.length === 0) {
      roomManager.generateNewPieces(roomId);
    }

    roomManager.advanceTurn(roomId);

    sendGameState(roomId);

    if (linesCleared > 0) {
      io.to(roomId).emit("lines_cleared", {
        count: linesCleared,
        rows: linesInfo.rowsToClear,
        cols: linesInfo.colsToClear,
      });
      if (!isAutoPlayRoom(room)) {
        const playerName = roomManager.getPlayerName(socket.id);
        const xpResult = playerStore.addXP(playerName, linesCleared);
        socket.emit("xp_update", { xp: xpResult.totalXP, xpGained: xpResult.xpGained });
        sendLeaderboard(socket);
      }
    }

    if (!canAnyPieceFit(room.board, room.currentPieces)) {
      room.state = "gameover";
      io.to(roomId).emit("game_over", { score: room.score, reason: "No valid moves remaining" });
      if (!isAutoPlayRoom(room)) {
        const playerName = roomManager.getPlayerName(socket.id);
        playerStore.recordScore(playerName, room.score);
        io.to(roomId).emit("leaderboard", playerStore.getLeaderboard());
      }
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
      if (!isAutoPlayRoom(room)) {
        const playerName = roomManager.getPlayerName(socket.id);
        playerStore.recordScore(playerName, room.score);
        io.to(roomId).emit("leaderboard", playerStore.getLeaderboard());
      }
      return;
    }

    room.consecutiveSkips++;

    if (room.consecutiveSkips >= 2) {
      room.state = "gameover";
      io.to(roomId).emit("game_over", { score: room.score, reason: "Both players skipped" });
      if (!isAutoPlayRoom(room)) {
        room.playerNames.forEach((name) => playerStore.recordScore(name, room.score));
        io.to(roomId).emit("leaderboard", playerStore.getLeaderboard());
      }
      return;
    }

    roomManager.advanceTurn(roomId);
    sendGameState(roomId);
    socket.to(roomId).emit("opponent_skipped");
  });

  socket.on("set_auto_play", (enabled) => {
    if (enabled) autoPlaySockets.add(socket.id);
    else autoPlaySockets.delete(socket.id);
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    autoPlaySockets.delete(socket.id);
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
