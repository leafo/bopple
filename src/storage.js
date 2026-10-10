const SETTINGS_KEY = "boggle:settings";
const HISTORY_KEY = "boggle:history";
const HISTORY_LIMIT = 200;

export const DEFAULT_SETTINGS = { minLength: 4, duration: 120 };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) };
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings);
}

export function loadHistory() {
  const history = read(HISTORY_KEY, []);
  return Array.isArray(history) ? history : [];
}

export function addHistory(entry) {
  const history = [entry, ...loadHistory()].slice(0, HISTORY_LIMIT);
  write(HISTORY_KEY, history);
  return history;
}
