import { useEffect, useRef, useState } from "react";
import Board from "./Board.jsx";
import { scoreWord, scoreWords } from "./game.js";
import styles from "./Game.module.css";

const FLASH_MS = 650;

export default function Game({ round, duration, onFinish }) {
  const { tiles, size, minLength, solutions } = round;
  const [found, setFound] = useState([]);
  const [path, setPath] = useState([]);
  const [typed, setTypedState] = useState("");
  const [flash, setFlash] = useState(null);
  const [remaining, setRemaining] = useState(duration);

  const foundRef = useRef(found);
  foundRef.current = found;
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const flashTimer = useRef(null);
  const typedRef = useRef("");

  function setTyped(value) {
    typedRef.current = value;
    setTypedState(value);
  }

  useEffect(() => {
    const endAt = Date.now() + duration * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, (endAt - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        finishRef.current(foundRef.current);
      }
    }, 100);
    return () => clearInterval(id);
  }, [duration]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  function showFlash(word, cells, kind, message) {
    clearTimeout(flashTimer.current);
    setFlash({ word, path: cells, kind, message });
    flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS);
  }

  function submit(word, cells) {
    if (word.length < minLength) {
      if (cells.length > 1 || word.length > 1) showFlash(word, cells, "bad", "Too short");
      return;
    }
    if (foundRef.current.includes(word)) {
      showFlash(word, solutions.get(word) || cells, "dup", "Already found");
    } else if (solutions.has(word)) {
      setFound([word, ...foundRef.current]);
      showFlash(word, solutions.get(word), "good", `+${scoreWord(word)}`);
      navigator.vibrate?.(12);
    } else {
      showFlash(word, cells, "bad", cells.length ? "Not a word" : "Not found");
    }
  }

  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = typedRef.current;
      if (/^[a-z]$/i.test(e.key)) {
        setTyped(t + e.key.toLowerCase());
      } else if (e.key === "Backspace") {
        setTyped(t.slice(0, -1));
      } else if (e.key === "Escape") {
        setTyped("");
      } else if (e.key === "Enter") {
        setTyped("");
        if (t) submitRef.current(t, []);
      } else {
        return;
      }
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handlePath(next) {
    setTyped("");
    if (flash) setFlash(null);
    setPath(next);
  }

  function handleSubmit(cells) {
    setPath([]);
    submit(cells.map((i) => tiles[i]).join(""), cells);
  }

  const currentWord = path.length
    ? path.map((i) => tiles[i]).join("")
    : typed;

  const secs = Math.ceil(remaining);
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const low = remaining <= 10;

  let display;
  if (currentWord) {
    display = <span className={styles.current}>{currentWord.toUpperCase()}</span>;
  } else if (flash) {
    display = (
      <span className={`${styles.result} ${styles[flash.kind]}`}>
        {flash.word.toUpperCase()} <small>{flash.message}</small>
      </span>
    );
  } else {
    display = <span className={styles.hint}>Swipe across letters</span>;
  }

  return (
    <div className={styles.game}>
      <header className={styles.top}>
        <div className={`${styles.clock} ${low ? styles.low : ""}`}>{clock}</div>
        <div className={styles.stats}>
          <div><b>{found.length}</b> words</div>
          <div><b>{scoreWords(found)}</b> pts</div>
        </div>
        <button className={styles.end} onClick={() => onFinish(found)}>End</button>
      </header>

      <div className={styles.timebar}>
        <div style={{ width: `${(remaining / duration) * 100}%` }} className={low ? styles.low : ""} />
      </div>

      <div className={styles.display}>{display}</div>

      <Board
        tiles={tiles}
        size={size}
        path={path.length ? path : flash ? flash.path : []}
        tone={path.length ? null : flash?.kind}
        onPathChange={handlePath}
        onSubmit={handleSubmit}
      />

      <ul className={styles.found}>
        {found.map((w) => (
          <li key={w} className={w === flash?.word ? styles.fresh : undefined}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
