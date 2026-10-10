import { solve } from "./dictionary.js";

const SIZE = 5;

const DICE = [
  "AAAFRS", "AAEEEE", "AAFIRS", "ADENNN", "AEEEEM",
  "AEEGMU", "AEGMNN", "AFIRSY", "BJKQXZ", "CCENST",
  "CEIILT", "CEILPT", "CEIPST", "DDHNOT", "DHHLOR",
  "DHLNOR", "DHLNOR", "EIIITT", "EMOTTT", "ENSSSU",
  "FIPRSY", "GORRVW", "IPRRRY", "NOOTUW", "OOOTTU",
];

// Below these counts a board is too sparse to be useful practice
const MIN_WORDS = { 4: 80, 5: 40 };

export function scoreWord(word) {
  const n = word.length;
  if (n <= 4) return 1;
  if (n === 5) return 2;
  if (n === 6) return 3;
  if (n === 7) return 5;
  return 11;
}

export function scoreWords(words) {
  let total = 0;
  for (const w of words) total += scoreWord(w);
  return total;
}

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function rollTiles() {
  const dice = shuffle(DICE);
  return dice.map((die) => {
    const face = die[Math.floor(Math.random() * die.length)].toLowerCase();
    return face === "q" ? "qu" : face;
  });
}

export function generateRound(minLength, trie) {
  let best = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const tiles = rollTiles();
    const solutions = solve(tiles, SIZE, trie, minLength);
    if (!best || solutions.size > best.solutions.size) {
      best = { tiles, size: SIZE, minLength, solutions };
    }
    if (solutions.size >= MIN_WORDS[minLength]) break;
  }
  return best;
}

export function compareWords(a, b) {
  return b.length - a.length || a.localeCompare(b);
}
