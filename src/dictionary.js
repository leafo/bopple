const END = "$";

let dictionaryPromise = null;

export function loadDictionary() {
  if (!dictionaryPromise) {
    dictionaryPromise = fetch("words.txt")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load word list (${res.status})`);
        return res.text();
      })
      .then(buildTrie)
      .catch((err) => {
        dictionaryPromise = null;
        throw err;
      });
  }
  return dictionaryPromise;
}

function buildTrie(text) {
  const root = {};
  for (const word of text.split("\n")) {
    if (!word) continue;
    let node = root;
    for (const ch of word) {
      node = node[ch] || (node[ch] = {});
    }
    node[END] = true;
  }
  return root;
}

export function neighborsFor(size) {
  const neighbors = [];
  for (let i = 0; i < size * size; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const list = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < size && c >= 0 && c < size) list.push(r * size + c);
      }
    }
    neighbors.push(list);
  }
  return neighbors;
}

export function isAdjacent(size, a, b) {
  const dr = Math.abs(Math.floor(a / size) - Math.floor(b / size));
  const dc = Math.abs((a % size) - (b % size));
  return a !== b && dr <= 1 && dc <= 1;
}

// Returns Map of word -> tile index path for every dictionary word on the board
export function solve(tiles, size, trie, minLength) {
  const found = new Map();
  const neighbors = neighborsFor(size);
  const used = new Array(tiles.length).fill(false);
  const path = [];

  function visit(i, node, word) {
    for (const ch of tiles[i]) {
      node = node[ch];
      if (!node) return;
    }
    word += tiles[i];
    used[i] = true;
    path.push(i);

    if (node[END] && word.length >= minLength && !found.has(word)) {
      found.set(word, path.slice());
    }

    for (const n of neighbors[i]) {
      if (!used[n]) visit(n, node, word);
    }

    used[i] = false;
    path.pop();
  }

  for (let i = 0; i < tiles.length; i++) visit(i, trie, "");
  return found;
}
