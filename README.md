# Block Blast (Multiplayer)

A real-time collaborative Block Blast game built with Express and Socket.IO. Two players take turns placing pieces on a shared 10x10 board, clearing full rows and columns to score points together.

## How to play

1. Open the site and click **New Room** (or enter a room ID and click **Join Room**).
2. Share the generated link with a friend so they can join the same room.
3. Once both players join, the game begins.
4. On your turn, click one of the three available pieces to select it, then click a cell on the board to place it.
5. Fill any full row or column to clear it and score a point.
6. The game ends when no available piece fits anywhere on the board.

## Local development

```sh
npm install
npm start
```

The server listens on port `3000` by default. Open http://localhost:3000 in two browser tabs to test.

## Deployment

This project is deployed to Render:

- **Dashboard:** https://dashboard.render.com/web/srv-d7iiipfaqgkc739v2cf0
- **Live site:** https://multi-player-tetris.onrender.com

Render watches the `main` branch on GitHub and redeploys automatically when new commits are pushed.
