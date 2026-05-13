const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "player_data.json");

const XP_PER_LINE = 25;

let data = { players: {} };

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      data = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load player data:", e.message);
    data = { players: {} };
  }
}

function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save player data:", e.message);
  }
}

function ensurePlayer(name) {
  if (!data.players[name]) {
    data.players[name] = { xp: 0, highScores: [] };
    save();
  }
}

function addXP(name, linesCleared) {
  ensurePlayer(name);
  const xpGained = linesCleared * XP_PER_LINE;
  data.players[name].xp += xpGained;
  save();
  return { totalXP: data.players[name].xp, xpGained };
}

function recordScore(name, score) {
  ensurePlayer(name);
  data.players[name].highScores.push(score);
  data.players[name].highScores.sort((a, b) => b - a);
  data.players[name].highScores = data.players[name].highScores.slice(0, 10);
  save();
}

function getPlayer(name) {
  ensurePlayer(name);
  return data.players[name];
}

function getLeaderboard() {
  const entries = Object.entries(data.players).map(([name, p]) => ({
    name,
    xp: p.xp,
    bestScore: p.highScores.length > 0 ? p.highScores[0] : 0,
  }));
  entries.sort((a, b) => b.xp - a.xp);
  return entries.slice(0, 20);
}

load();

module.exports = {
  XP_PER_LINE,
  addXP,
  recordScore,
  getPlayer,
  getLeaderboard,
};
