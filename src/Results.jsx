import { useMemo, useState } from "react";
import Board from "./Board.jsx";
import { compareWords, scoreWord, scoreWords } from "./game.js";
import styles from "./Results.module.css";

const FILTERS = ["missed", "found", "all"];

export default function Results({ round, found, onPlayAgain, onHome }) {
  const { tiles, size, solutions } = round;
  const [filter, setFilter] = useState("missed");
  const [selected, setSelected] = useState(null);

  const foundSet = useMemo(() => new Set(found), [found]);
  const all = useMemo(() => [...solutions.keys()].sort(compareWords), [solutions]);
  const missed = all.filter((w) => !foundSet.has(w));

  const score = scoreWords(found);
  const maxScore = scoreWords(all);
  const longestMissed = missed[0];

  const lists = { missed, found: [...found].sort(compareWords), all };
  const words = lists[filter];

  const groups = [];
  for (const w of words) {
    const len = Math.min(w.length, 8);
    if (!groups.length || groups[groups.length - 1].len !== len) groups.push({ len, words: [] });
    groups[groups.length - 1].words.push(w);
  }

  return (
    <div className={styles.results}>
      <div className={styles.summary}>
        <div className={styles.big}>
          <b>{score}</b>
          <span>of {maxScore} pts</span>
        </div>
        <div className={styles.big}>
          <b>{found.length}</b>
          <span>of {all.length} words</span>
        </div>
        <div className={styles.big}>
          <b>{maxScore ? Math.round((score / maxScore) * 100) : 0}%</b>
          <span>of points</span>
        </div>
      </div>

      {longestMissed && (
        <p className={styles.callout}>
          Longest missed: <button onClick={() => setSelected(longestMissed)}>{longestMissed.toUpperCase()}</button>
        </p>
      )}

      <div className={styles.boardWrap}>
        <Board tiles={tiles} size={size} path={selected ? solutions.get(selected) : []} />
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={onPlayAgain}>Next round</button>
        <button className={styles.ghost} onClick={onHome}>Home</button>
      </div>

      <div className={styles.tabs} role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? styles.activeTab : undefined}
            onClick={() => setFilter(f)}
          >
            {f} <span>{lists[f].length}</span>
          </button>
        ))}
      </div>

      {groups.length === 0 && <p className={styles.empty}>Nothing here.</p>}

      {groups.map((g) => (
        <section key={g.len} className={styles.group}>
          <h3>
            {g.len >= 8 ? "8+" : g.len} letters
            <span>{scoreWord("x".repeat(g.len))} pt each</span>
          </h3>
          <ul>
            {g.words.map((w) => (
              <li key={w}>
                <button
                  className={[
                    foundSet.has(w) ? styles.wasFound : styles.wasMissed,
                    selected === w && styles.selectedWord,
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSelected(selected === w ? null : w)}
                >
                  {w}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
