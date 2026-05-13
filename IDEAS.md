# Block Blast — Idea Brainstorm

## New Game Modes

- **Battle Mode** — Players each get their own board. Clearing lines sends "garbage rows" (partially filled rows pushed up from the bottom) to the opponent's board, like Tetris Attack. First to top out loses.
- **Co-op Endless** — Two players share one board with no turn restriction. Both can place simultaneously. Goal is to survive as long as possible with an ever-increasing piece spawn rate.
- **Time Attack** — Solo mode with a 60-second timer. Place as many pieces as possible. Bonus points for combos (clearing lines on consecutive placements).
- **Puzzle Mode** — Pre-set boards where you must clear all pieces using a specific set of pieces. Like a sokoban-style brain teaser.
- **King of the Hill** — 3+ players rotate turns on a shared board. The player who clears the most lines in a round earns a point. First to N points wins.
- **Daily Challenge** — Everyone gets the same board layout + same piece sequence. Compete for highest score on a shared leaderboard.

## New Mechanics

- **Combo System** — Clearing lines on back-to-back turns multiplies score (x2, x3, etc.). Visual + audio feedback escalates with combo level.
- **Special Pieces** — Rare pieces that trigger effects when placed:
  - 💣 Bomb — Clears a 3x3 area around placement
  - 🌊 Wave — Clears the entire row and column of the placed cell
  - ⚡ Lightning — Removes all cells of one color from the board
  - 🔄 Rotate — Lets you rotate any piece before placing (normally pieces are fixed-orientation)
- **Piece Rotation** — Right-click or press R to rotate the selected piece 90°. Adds strategic depth without changing the core loop.
- **Power-ups (Earned)** — Clearing multiple lines at once charges a power-up meter. Options:
  - Undo last opponent move
  - Peek at upcoming piece set
  - Force opponent to play with a harder piece set next round
  - Swap one of your current pieces for a random new one
- **Board Obstacles** — Pre-placed "stone" cells that can't be overwritten. They break when an adjacent line clears. Adds terrain strategy.
- **Growing Board** — Board starts at 6x6 and grows by 1 row/column every N turns, opening new space but also making line clears harder.
- **Gravity Mode** — After each placement, floating pieces fall downward. Creates cascade clears and chaotic chain reactions.
- **Mirror Mode** — Whatever player 1 places gets mirrored horizontally for player 2's next placement. Forces symmetric thinking.

## Scoring & Progression

- **Scoring Overhaul** — Instead of flat +1 per line:
  - Single line = 10 pts
  - Double line clear = 30 pts
  - Triple+ = 60 pts + combo bonus
  - Clearing a row AND a column simultaneously = 100 pts ("Cross Clear")
- **Player Levels / XP** — Earn XP per game. Level up unlocks new piece skins, board themes, color palettes.
- **Stats Tracking** — Track per-player: games played, lines cleared, highest combo, win rate, average score. Show after each game and on a profile page.
- **Achievements** — "Clear 5 lines in one move", "Win without skipping", "Fill the entire board and survive", "Play 100 games", etc.

## Board & Piece Variations

- **Board Shapes** — Not just 10x10. Try 8x8 (faster), 12x12 (marathon), hex grid, diamond-shaped board with dead corners.
- **Dynamic Weather** — Every 10 turns, a random event alters the board: "Frost" freezes 3 random cells (can't place there for 3 turns), "Rain" clears a random row, "Wind" shifts all pieces one column to the right.
- **Larger Piece Pool** — Add 4- and 5-cell L-shapes, T-shapes, zigzags, and the classic Tetris pentominos (29 total). Makes piece selection more strategic.
- **Piece Rarity** — Pieces weighted by complexity. 1-2 cell pieces are common, 5-cell shapes are rare and worth more points.
- **Draft Mode** — Instead of random 3 pieces, offer 5 and each player picks 2 (one they want, one to deny the opponent).

## Turn & Pacing Tweaks

- **Turn Timer** — 15-second clock per turn. Running out auto-skips. Keeps games snappy.
- **Speed Mode** — No turns. Both players place simultaneously on the same board. First to claim a cell gets it. Chaos.
- **Blind Turn** — On your turn, the opponent's last placement is hidden until you've placed yours. Adds surprise.
- **Simultaneous Turns** — Both players pick a piece + placement at the same time. Both resolve simultaneously. Collision = both pieces bounce back.

## Social & Spectating

- **In-Game Chat** — Simple text chat or emoji reactions during play.
- **Spectator Mode** — Watch live games by room code. Good for tournaments.
- **Rematch Button** — After game over, either player can hit "Rematch" to instantly start a new game in the same room.
- **Replay** — Record the sequence of moves. After the game, watch a replay or share it as a link.

## Quick Wins (Easy to Implement)

- **Piece Preview** — Show the next set of 3 pieces faintly below the current ones, so players can plan ahead.
- **Undo Own Move** — Brief 2-second window after placing to take it back (before the turn advances).
- **Board Hover Highlight** — Already partially done, but add a "ghost" outline showing exactly which cells will be cleared if the piece is placed there.
- **Sound Effects** — Place sound, error buzz, combo chime, game-over jingle. (Already has clear.wav)
- **Mobile Layout** — Stack piece selector below the board, make touch targets bigger, add haptic feedback.
