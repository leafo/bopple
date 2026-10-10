import styles from "./Home.module.css";

const MIN_LENGTHS = [
  { value: 4, label: "4 letters" },
  { value: 5, label: "5 letters" },
];

const DURATIONS = [
  { value: 60, label: "1 min" },
  { value: 90, label: "1:30" },
  { value: 120, label: "2 min" },
  { value: 180, label: "3 min" },
];

const RECENT_COUNT = 10;

function Segmented({ options, value, onChange }) {
  return (
    <div className={styles.segmented}>
      {options.map((o) => (
        <button
          key={o.value}
          className={o.value === value ? styles.active : undefined}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function percent(entry) {
  return entry.maxScore ? (entry.score / entry.maxScore) * 100 : 0;
}

export default function Home({ settings, onSettings, history, status, onStart }) {
  const matching = history.filter(
    (h) => h.minLength === settings.minLength && h.duration === settings.duration
  );
  const recent = matching.slice(0, RECENT_COUNT);
  const best = matching.reduce((m, h) => Math.max(m, h.score), 0);
  const avg = recent.length
    ? Math.round(recent.reduce((sum, h) => sum + percent(h), 0) / recent.length)
    : null;

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>
        {"BOGGLE".split("").map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </h1>

      <div className={styles.field}>
        <label>Minimum word</label>
        <Segmented options={MIN_LENGTHS} value={settings.minLength} onChange={(minLength) => onSettings({ ...settings, minLength })} />
      </div>

      <div className={styles.field}>
        <label>Timer</label>
        <Segmented options={DURATIONS} value={settings.duration} onChange={(duration) => onSettings({ ...settings, duration })} />
      </div>

      <button className={styles.start} onClick={onStart} disabled={status !== "ready"}>
        {status === "loading" ? "Loading dictionary…" : "Start round"}
      </button>
      {status === "error" && <p className={styles.error}>Couldn't load the word list. Reload to try again.</p>}

      <p className={styles.tip}>
        Swipe across adjacent letters, including diagonals. Minimum{" "}
        {settings.minLength} letters. On a keyboard, type and press Enter.
      </p>

      {matching.length > 0 && (
        <section className={styles.history}>
          <h2>Your {settings.minLength}+ letter, {DURATIONS.find((d) => d.value === settings.duration).label} rounds</h2>
          <div className={styles.statRow}>
            <div><b>{matching.length}</b><span>played</span></div>
            <div><b>{best}</b><span>best score</span></div>
            <div><b>{avg}%</b><span>avg, last {recent.length}</span></div>
          </div>
          <div className={styles.bars} aria-label="Recent rounds, percent of available points">
            {[...recent].reverse().map((h, i) => (
              <div key={i} title={`${h.score} / ${h.maxScore} pts`}>
                <div style={{ height: `${Math.max(4, percent(h))}%` }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
