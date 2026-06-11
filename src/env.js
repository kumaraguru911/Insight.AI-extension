const ENV_FILE = ".env";
const ENV = { __loaded: false };

function parseEnv(text) {
  const config = {};
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) return;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) config[key] = value;
  });
  return config;
}

async function loadEnv() {
  if (ENV.__loaded) return ENV;

  try {
    const response = await fetch(chrome.runtime.getURL(ENV_FILE));
    if (!response.ok) {
      console.warn(`Unable to load ${ENV_FILE}: ${response.status}`);
      ENV.__loaded = true;
      return ENV;
    }

    const text = await response.text();
    const parsed = parseEnv(text);
    Object.assign(ENV, parsed, { __loaded: true });
  } catch (error) {
    console.warn(`Failed to load ${ENV_FILE}:`, error);
    ENV.__loaded = true;
  }

  return ENV;
}

async function getEnv(key, fallback = undefined) {
  await loadEnv();
  if (Object.prototype.hasOwnProperty.call(ENV, key)) {
    return ENV[key];
  }
  return fallback;
}
