import { useRef } from "react";
import { isAdjacent } from "./dictionary.js";
import styles from "./Board.module.css";

// Fraction of a cell (from its center) that registers while dragging. Smaller
// than the full cell so diagonal swipes don't clip the corner neighbors.
const HIT_RADIUS = 0.42;

export default function Board({ tiles, size, path = [], tone, onPathChange, onSubmit }) {
  const boardRef = useRef(null);
  const pathRef = useRef([]);
  const interactive = !!onPathChange;

  function cellAt(e, strict) {
    const rect = boardRef.current.getBoundingClientRect();
    const fx = ((e.clientX - rect.left) / rect.width) * size;
    const fy = ((e.clientY - rect.top) / rect.height) * size;
    const col = Math.floor(fx);
    const row = Math.floor(fy);
    if (col < 0 || row < 0 || col >= size || row >= size) return null;
    if (strict) {
      const dx = fx - col - 0.5;
      const dy = fy - row - 0.5;
      if (dx * dx + dy * dy > HIT_RADIUS * HIT_RADIUS) return null;
    }
    return row * size + col;
  }

  function setPath(next) {
    pathRef.current = next;
    onPathChange(next);
  }

  function handleDown(e) {
    if (!interactive) return;
    e.preventDefault();
    const cell = cellAt(e, false);
    if (cell == null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPath([cell]);
  }

  function handleMove(e) {
    const current = pathRef.current;
    if (!interactive || !current.length) return;
    const cell = cellAt(e, true);
    if (cell == null) return;
    const last = current[current.length - 1];
    if (cell === last) return;
    if (cell === current[current.length - 2]) {
      setPath(current.slice(0, -1));
    } else if (!current.includes(cell) && isAdjacent(size, last, cell)) {
      setPath([...current, cell]);
    }
  }

  function handleUp() {
    const current = pathRef.current;
    if (!interactive || !current.length) return;
    pathRef.current = [];
    onSubmit(current);
  }

  const order = new Map(path.map((cell, i) => [cell, i]));

  return (
    <div
      ref={boardRef}
      className={`${styles.board} ${interactive ? styles.interactive : ""}`}
      style={{ "--size": size }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      {tiles.map((tile, i) => {
        const selected = order.has(i);
        const first = order.get(i) === 0;
        return (
          <div
            key={i}
            className={[
              styles.tile,
              selected && styles.selected,
              selected && tone && styles[tone],
              first && styles.first,
            ].filter(Boolean).join(" ")}
          >
            <span className={tile.length > 1 ? styles.wide : undefined}>
              {tile === "qu" ? "Qu" : tile.toUpperCase()}
            </span>
          </div>
        );
      })}
      {path.length > 1 && <PathLine path={path} size={size} />}
    </div>
  );
}

function PathLine({ path, size }) {
  const points = path
    .map((cell) => `${(cell % size) + 0.5},${Math.floor(cell / size) + 0.5}`)
    .join(" ");
  return (
    <svg className={styles.line} viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="none">
      <polyline points={points} />
    </svg>
  );
}
