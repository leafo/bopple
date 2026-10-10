import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadDictionary } from "./dictionary.js";
import { generateRound, scoreWords } from "./game.js";
import { addHistory, loadHistory, loadSettings, saveSettings } from "./storage.js";
import Home from "./Home.jsx";
import Game from "./Game.jsx";
import Results from "./Results.jsx";
import styles from "./index.module.css";

function App() {
  const [trie, setTrie] = useState(null);
  const [status, setStatus] = useState("loading");
  const [settings, setSettings] = useState(loadSettings);
  const [history, setHistory] = useState(loadHistory);
  const [screen, setScreen] = useState("home");
  const [round, setRound] = useState(null);
  const [found, setFound] = useState([]);

  useEffect(() => {
    loadDictionary().then(
      (t) => {
        setTrie(t);
        setStatus("ready");
      },
      () => setStatus("error")
    );
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, round]);

  function updateSettings(next) {
    setSettings(next);
    saveSettings(next);
  }

  function start() {
    setRound(generateRound(settings.minLength, trie));
    setFound([]);
    setScreen("playing");
  }

  function finish(words) {
    setFound(words);
    setScreen("results");
    setHistory(addHistory({
      at: Date.now(),
      minLength: round.minLength,
      duration: settings.duration,
      score: scoreWords(words),
      maxScore: scoreWords(round.solutions.keys()),
      found: words.length,
      total: round.solutions.size,
    }));
  }

  let content;
  if (screen === "playing") {
    content = <Game key={round.tiles.join()} round={round} duration={settings.duration} onFinish={finish} />;
  } else if (screen === "results") {
    content = <Results round={round} found={found} onPlayAgain={start} onHome={() => setScreen("home")} />;
  } else {
    content = (
      <Home
        settings={settings}
        onSettings={updateSettings}
        history={history}
        status={status}
        onStart={start}
      />
    );
  }

  return <div className={styles.app}>{content}</div>;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
